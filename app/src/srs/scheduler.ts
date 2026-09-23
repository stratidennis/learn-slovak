import { createEmptyCard, fsrs, generatorParameters, Rating, type Grade as FsrsGrade } from 'ts-fsrs'
import { db, type CardRow } from '../db/db'
import type { Sentence } from '../data/types'

// FSRS-6 via ts-fsrs. 0.88 desired retention (research §2 P4: 85–90%).
const f = fsrs(generatorParameters({ request_retention: 0.88, enable_fuzz: true }))

export function newCard(s: Sentence, unitId: string): CardRow {
  const c = createEmptyCard(new Date())
  return { id: s.id, unitId, mode: 'listen_type', kind: 'sentence', lemmas: s.lemmas, fsrs: c, due: c.due.getTime(), reps: 0, lapses: 0, createdAt: Date.now() }
}

/** A Recap card for any taught item (D138), first due at `due`. */
export function newItemCard(ref: { id: string; kind: string }, unitId: string, due: number, now = Date.now()): CardRow {
  const c = createEmptyCard(new Date(due))
  return { id: ref.id, unitId, mode: 'item', kind: ref.kind, lemmas: [], fsrs: c, due, reps: 0, lapses: 0, createdAt: now }
}

/** Map a graded answer to an FSRS rating: wrong → Again, diacritics-only → Hard, right → Good/Easy. */
export function ratingFor(tier: 'exact' | 'diacritics' | 'wrong', replays: number): FsrsGrade {
  if (tier === 'wrong') return Rating.Again
  if (tier === 'diacritics') return Rating.Hard
  return replays <= 1 ? Rating.Easy : Rating.Good
}

export async function review(card: CardRow, rating: FsrsGrade, now = new Date()): Promise<CardRow> {
  const { card: next } = f.next(card.fsrs, now, rating)
  const updated: CardRow = { ...card, fsrs: next, due: next.due.getTime(), reps: next.reps, lapses: next.lapses }
  await db.cards.put(updated)
  return updated
}

export async function dueCards(unitId?: string, now = Date.now()): Promise<CardRow[]> {
  const q = unitId ? db.cards.where('unitId').equals(unitId) : db.cards.toCollection()
  const all = await q.toArray()
  return all.filter(c => c.due <= now).sort((a, b) => a.due - b.due)
}

/** A lemma counts as "learning" after its first correct answer and "known" once a card carrying
 *  it has ≥ 3 reps with stability > 7 days (≈ you would still recall it next week). */
export async function updateLemmas(card: CardRow, correct: boolean, lemmas = card.lemmas) {
  const now = Date.now()
  for (const lemma of lemmas) {
    const row = (await db.lemmas.get(lemma)) ?? { lemma, status: 'learning' as const, firstSeen: now, good: 0, bad: 0 }
    if (correct) row.good++; else row.bad++
    if (card.fsrs.stability > 7 && card.reps >= 3 && correct) row.status = 'known'
    else if (!correct && row.status === 'known') row.status = 'learning'
    await db.lemmas.put(row)
  }
}
