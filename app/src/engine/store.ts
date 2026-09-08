import { db } from '../db/db'
import type { ItemRef, ItemState } from './types'

export const edb = db
export const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10)

export async function getStates(unitId: string): Promise<Map<string, ItemState>> {
  return new Map((await db.items.where('unitId').equals(unitId).toArray()).map(s => [s.id, s as ItemState]))
}
export function newState(ref: ItemRef, unitId: string): ItemState {
  return { id: ref.id, unitId, kind: ref.kind, stage: 0, streak: 0, seen: 0, lastAt: 0, stageAtDayStart: 0, dayKey: '' }
}
/** Apply a step result: +1 on success, −1 (min 1) on failure, at most 2 stages up per calendar day. */
export function advance(s: ItemState, correct: boolean, maxStage = 6): ItemState {
  const today = dayKey()
  if (s.dayKey !== today) { s.dayKey = today; s.stageAtDayStart = s.stage }
  s.seen++; s.lastAt = Date.now()
  if (correct) {
    s.streak++
    if (s.stage - s.stageAtDayStart < 2 && s.stage < maxStage) s.stage = Math.min(maxStage, s.stage + 1)
    else if (s.stage === 0) s.stage = 1
  } else {
    s.streak = 0
    s.stage = Math.max(1, s.stage - 1)
  }
  return s
}
export const saveState = (s: ItemState) => db.items.put(s)
