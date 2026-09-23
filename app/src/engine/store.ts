import { db } from '../db/db'
import type { ItemRef, ItemState } from './types'
import { markStates, type LessonDef } from './lessons'

export const edb = db
export const dayKey = (t = Date.now()) => new Date(t).toISOString().slice(0, 10)

export async function getStates(unitId: string): Promise<Map<string, ItemState>> {
  return new Map((await db.items.where('unitId').equals(unitId).toArray()).map(s => [s.id, s as ItemState]))
}
export function newState(ref: ItemRef, unitId: string): ItemState {
  return { id: ref.id, unitId, kind: ref.kind, stage: 0, streak: 0, seen: 0, lastAt: 0, stageAtDayStart: 0, dayKey: '' }
}
/** Apply a step result: +1 on success, −1 (min 1) on failure.
 *
 *  D127 also capped an item at 2 stages per calendar day, for spacing. That cap was written when the
 *  ladder was 3 rungs; it is now 5 for a cognate and 6 for a word, so the cap made a lesson impossible
 *  to finish — and a redo on the same day advanced *nothing*, silently (D136). Pacing now comes from the
 *  session structure (an item gets one or two steps per session, interleaved) and from the review layer,
 *  not from a hard daily ceiling: if the learner deliberately redoes a lesson until every rung is right,
 *  the lesson finishes. `dayKey`/`stageAtDayStart` are still tracked for the session builder's stats. */
export function advance(s: ItemState, correct: boolean, maxStage = 6): ItemState {
  const today = dayKey()
  if (s.dayKey !== today) { s.dayKey = today; s.stageAtDayStart = s.stage }
  s.seen++; s.lastAt = Date.now()
  if (correct) {
    s.streak++
    if (s.stage < maxStage) s.stage = Math.min(maxStage, s.stage + 1)
  } else {
    s.streak = 0
    s.stage = Math.max(1, s.stage - 1)
  }
  return s
}
export const saveState = (s: ItemState) => db.items.put(s)

/** Mark one or more lessons as done / mastered by hand (D130) — e.g. finished on another device.
 *  Never lowers anything. The caller runs `syncRecap()` afterwards, which enrols what became done (D138). */
export async function markLessons(lessons: LessonDef[], level: 'done' | 'mastered'): Promise<number> {
  if (!lessons.length) return 0
  const unitId = lessons[0].unitId
  const states = await getStates(unitId)
  const changed = lessons.flatMap(l => markStates(l, states, level))
  await db.items.bulkPut(changed)
  return changed.length
}
/** Forget the progress of one or more lessons: item states and the Recap cards they produced. Review history stays. */
export async function resetLessons(lessons: LessonDef[]): Promise<void> {
  const ids = lessons.flatMap(l => l.refs.map(r => r.id))
  await db.transaction('rw', [db.items, db.cards], async () => { await db.items.bulkDelete(ids); await db.cards.bulkDelete(ids) })
}
