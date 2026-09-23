// Recap (D138): everything a finished lesson taught comes back on an FSRS schedule — every kind, every
// section. Before this, the review layer held only *sentence* cards, created when a sentence was mastered,
// so the whole of Phase 0 (letters, sound pairs, cognates, words, chunks, dialogues) could never appear in
// it and Recap stayed empty for weeks.
//
// Three rules keep it from breaking the same way again:
//  1. Enrolment is derived, not event-driven: `syncRecap` compares "what finished lessons taught" (the same
//     `learnedIds` the practice pool uses) against the cards that exist and adds what is missing. It is
//     idempotent and runs on Home, Practice, Recap, after a lesson and after manual marking, so a new kind,
//     a new section, a backfill after an update, or a lesson marked done on another device all heal alike.
//  2. No kind filter anywhere: the exercise is chosen by `stepFor`, the same ladder the lessons use, so any
//     kind a lesson can teach, Recap can ask. engine/coverage.test.ts checks this against the real content.
//  3. Backfill is paced: at most DAILY_NEW first reviews land on any one day, so enrolling a few hundred
//     items at once becomes a few days of recaps, not one wall.
import { loadUnits } from '../data/loader'
import { db, type CardRow } from '../db/db'
import { learnedIds, statesByUnit } from '../engine/lessons'
import { maxStageFor, needsIntro, roundRobin, stepFor } from '../engine/session'
import type { Item, ItemState, Step, StepResult } from '../engine/types'
import { Rating, type Grade as FsrsGrade } from 'ts-fsrs'
import { newItemCard } from './scheduler'

const DAY = 24 * 60 * 60 * 1000
/** First reviews per day, at most. A recap of ~20 steps is a few minutes; 30 new plus the returning ones
 *  stays under a quarter of an hour. */
export const DAILY_NEW = 30
/** Steps in one recap sitting (the rest waits for "continue"). */
export const RECAP_SIZE = 20

export type Candidate = { id: string; kind: string; unitId: string; lastAt: number }

const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }

/** New cards for the candidates that have none. A card is first due a day after the item was last worked
 *  on (you just drilled it — seeing it again tonight teaches nothing), and never more than `cap` first
 *  reviews share a day: the overflow moves to the next day with room. Units are interleaved so one day's
 *  recap is not forty letters in a row. */
export function enrol(cands: Candidate[], have: Set<string>, pendingNewDue: number[], now = Date.now(), cap = DAILY_NEW): CardRow[] {
  const today = startOfDay(now)
  const dayOf = (t: number) => Math.max(0, Math.floor((startOfDay(t) - today) / DAY))
  const load = new Map<number, number>()
  for (const due of pendingNewDue) { const d = dayOf(due); load.set(d, (load.get(d) ?? 0) + 1) }
  const seen = new Set(have)
  const byUnit = new Map<string, Candidate[]>()
  for (const c of cands) {
    if (seen.has(c.id)) continue
    seen.add(c.id)
    if (!byUnit.has(c.unitId)) byUnit.set(c.unitId, [])
    byUnit.get(c.unitId)!.push(c)
  }
  const ordered = roundRobin([...byUnit.values()].map(list => [...list].sort((a, b) => a.lastAt - b.lastAt)))
  const out: CardRow[] = []
  for (const c of ordered) {
    const earliest = Math.max(now, c.lastAt + DAY)
    let d = dayOf(earliest)
    while ((load.get(d) ?? 0) >= cap) d++
    load.set(d, (load.get(d) ?? 0) + 1)
    out.push(newItemCard(c, c.unitId, d === dayOf(earliest) ? earliest : today + d * DAY, now))
  }
  return out
}

/** One sitting's cards: the most overdue of each unit first, taken round-robin across units, so a sitting
 *  mixes sections even when a backfill gave hundreds of cards the same due time (the store returns ties in
 *  id order — cognate…, letter…, pair…, word… — which starved the words of 0.4 in the first build). */
export function pickBatch(due: CardRow[], size = RECAP_SIZE): CardRow[] {
  const byUnit = new Map<string, CardRow[]>()
  for (const c of due) { if (!byUnit.has(c.unitId)) byUnit.set(c.unitId, []); byUnit.get(c.unitId)!.push(c) }
  return roundRobin([...byUnit.values()].map(list => [...list].sort((a, b) => a.due - b.due))).slice(0, size)
}

/** Make sure every taught item has a Recap card. Returns how many were added. */
export async function syncRecap(now = Date.now()): Promise<number> {
  const [units, rows, cards] = await Promise.all([loadUnits(), db.items.toArray(), db.cards.toArray()])
  const states = statesByUnit(rows as ItemState[])
  const cands: Candidate[] = []
  for (const u of units) {
    const st = states.get(u.id)
    if (!st) continue
    for (const id of learnedIds(u, st)) { const s = st.get(id); if (s) cands.push({ id, kind: s.kind, unitId: u.id, lastAt: s.lastAt }) }
  }
  const fresh = enrol(cands, new Set(cards.map(c => c.id)), cards.filter(c => c.reps === 0).map(c => c.due), now)
  if (fresh.length) await db.cards.bulkPut(fresh)
  return fresh.length
}

/** Which rung of the item's ladder Recap asks. An item still climbing is asked its next rung — a right
 *  answer climbs it, so Recap also finishes lessons. A mastered item gets its hardest real rung when the
 *  memory is strong (stability ≥ 7 days), and any rung when it is young or has lapsed. */
export function recapRung(stage: number, top: number, stability: number, rand = Math.random): number {
  const hardest = Math.max(1, top - 1)                // stepFor(top) is "nothing left to ask"
  if (stage < top) return Math.max(1, Math.min(stage, hardest))
  if (hardest <= 1) return 1
  if (stability >= 7) return rand() < 0.7 ? hardest : hardest - 1
  return 1 + Math.floor(rand() * hardest)
}

/** A question for `item` at rung `rung` or the nearest rung below it that has one. Never an intro. */
export function questionAt(item: Item, rung: number, pool: Item[], lang: 'ro' | 'en'): Step | null {
  for (let r = rung; r >= 1; r--) { const s = stepFor(item, r, pool, lang); if (s && s.type !== 'intro') return s }
  return null
}

export type RecapEntry = { step: Step; cardId: string; unitId: string; rung: number; practiceOnly?: boolean }

/** The steps one card contributes: its question, preceded by the intro card when the item was taught under
 *  an older version of that card (D133 — nothing is asked before it is taught). */
export function recapEntries(item: Item, st: ItemState | undefined, card: CardRow, pool: Item[], lang: 'ro' | 'en', rand = Math.random): RecapEntry[] {
  const top = maxStageFor(item.ref.kind, card.unitId)
  const rung = recapRung(st?.stage ?? 1, top, card.fsrs.stability, rand)
  const q = questionAt(item, rung, pool, lang)
  if (!q) return []
  const base = { cardId: card.id, unitId: card.unitId }
  const ask: RecapEntry = { ...base, step: q, rung }
  return needsIntro(st, item.ref.kind) ? [{ ...base, step: { type: 'intro', item }, rung: 0, practiceOnly: true }, ask] : [ask]
}

/** FSRS grade for a step verdict: wrong → Again, diacritics only → Hard, right → Good. */
export function ratingForResult(r: StepResult): FsrsGrade {
  if (!r.correct) return Rating.Again
  return r.tier === 'diacritics' ? Rating.Hard : Rating.Good
}
