import { db } from '../db/db'
import type { ItemRef, ItemState } from './types'
import { markStates, type LessonDef } from './lessons'
import { loadUnitById, loadUnitItems } from './items'
import { newCard } from '../srs/scheduler'

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

/** Mark one or more lessons as done / mastered by hand (D130) — e.g. finished on another device.
 *  Never lowers anything. Mastered sentences also get their long-term FSRS card, as a real session would. */
export async function markLessons(lessons: LessonDef[], level: 'done' | 'mastered'): Promise<number> {
  if (!lessons.length) return 0
  const unitId = lessons[0].unitId
  const states = await getStates(unitId)
  const changed = lessons.flatMap(l => markStates(l, states, level))
  await db.items.bulkPut(changed)
  if (level === 'mastered') {
    const unit = await loadUnitById(unitId)
    if (unit) {
      const items = await loadUnitItems(unit)
      const want = new Set(lessons.flatMap(l => l.refs.filter(r => r.kind === 'sentence').map(r => r.id)))
      for (const it of items) if (want.has(it.ref.id) && it.sentence && !(await db.cards.get(it.ref.id))) await db.cards.put(newCard(it.sentence, unitId))
    }
  }
  return changed.length
}
/** Forget the progress of one or more lessons: item states and the sentence cards they produced. Review history stays. */
export async function resetLessons(lessons: LessonDef[]): Promise<void> {
  const ids = lessons.flatMap(l => l.refs.map(r => r.id))
  await db.transaction('rw', [db.items, db.cards], async () => { await db.items.bulkDelete(ids); await db.cards.bulkDelete(ids) })
}
