// The practice pool (D129): everything the learner has finished in lessons, across units, filtered by
// type and unit. Flashcards and Speed match draw from it. Only items that belong to a *done* lesson
// count — practising things you have not been taught yet is guessing, not review.
import { loadUnits } from '../data/loader'
import type { Unit } from '../data/types'
import { db } from '../db/db'
import { loadUnitItems } from './items'
import { ALL_KINDS, KIND_PRACTICE } from './kinds'
import { learnedIds, statesByUnit } from './lessons'
import type { Item, ItemKind, ItemState } from './types'

export type PoolItem = Item & { unitId: string }
export type PoolFilter = { kinds: ItemKind[]; units: string[] }     // empty list = everything
export type Pool = { items: PoolItem[]; units: Unit[]; byUnit: Map<string, number>; byKind: Map<ItemKind, number> }

/** Which kinds each mode takes comes from the one table in engine/kinds.ts (D138) — never a list here. */
export const CARD_KINDS: ItemKind[] = ALL_KINDS.filter(k => KIND_PRACTICE[k].card)
export const MATCH_KINDS: ItemKind[] = ALL_KINDS.filter(k => KIND_PRACTICE[k].match)

export async function loadLearnedPool(allowed: ItemKind[] = CARD_KINDS): Promise<Pool> {
  const [units, rows] = await Promise.all([loadUnits(), db.items.toArray()])
  const states = statesByUnit(rows as ItemState[])
  const items: PoolItem[] = []
  const byUnit = new Map<string, number>(), byKind = new Map<ItemKind, number>()
  const withProgress = units.filter(u => states.has(u.id))
  const loaded = await Promise.all(withProgress.map(async u => {
    const doneIds = learnedIds(u, states.get(u.id)!)
    if (!doneIds.size) return [] as PoolItem[]
    return (await loadUnitItems(u)).filter(it => doneIds.has(it.ref.id) && allowed.includes(it.ref.kind)).map(it => ({ ...it, unitId: u.id }))
  }))
  for (const list of loaded) for (const it of list) {
    items.push(it); byUnit.set(it.unitId, (byUnit.get(it.unitId) ?? 0) + 1); byKind.set(it.ref.kind, (byKind.get(it.ref.kind) ?? 0) + 1)
  }
  return { items, units: units.filter(u => byUnit.has(u.id)), byUnit, byKind }
}

export function applyFilter(items: PoolItem[], f: PoolFilter): PoolItem[] {
  return items.filter(it => (!f.kinds.length || f.kinds.includes(it.ref.kind)) && (!f.units.length || f.units.includes(it.unitId)))
}

const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** A deck: shuffled, capped. */
export function buildDeck(items: PoolItem[], size: number | 'all'): PoolItem[] {
  const s = shuffle(items)
  return size === 'all' ? s : s.slice(0, size)
}

/** One Speed-match board: up to `n` items with distinct Slovak and distinct meanings, preferring items
 *  not used yet in this round. */
export function nextBoard(items: PoolItem[], used: Set<string>, lang: 'ro' | 'en', n = 5): PoolItem[] {
  const meaning = (it: PoolItem) => (lang === 'ro' ? it.meaning.ro : it.meaning.en).trim().toLowerCase()
  const pick = (from: PoolItem[], out: PoolItem[], seenM: Set<string>, seenS: Set<string>) => {
    for (const it of from) {
      if (out.length >= n) break
      const m = meaning(it), s = it.sk.trim().toLowerCase()
      if (!m || seenM.has(m) || seenS.has(s) || out.some(o => o.ref.id === it.ref.id)) continue
      seenM.add(m); seenS.add(s); out.push(it)
    }
  }
  const out: PoolItem[] = [], seenM = new Set<string>(), seenS = new Set<string>()
  pick(shuffle(items.filter(it => !used.has(it.ref.id))), out, seenM, seenS)
  if (out.length < n) pick(shuffle(items), out, seenM, seenS)
  return out
}
