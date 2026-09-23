// Lessons (D129): a unit's items are cut into fixed, numbered lessons of ~8–10 items so the learner
// sees a road map, can pick any lesson, and can come back to redo one. Membership is derived from the
// unit's declared item order alone (no content needs loading), so Home can draw every road map from
// units.json + the item states. Mastery stays per item (curriculum/LEARNING-ENGINE.md §2); a lesson is
// "done" when every item in it has been introduced and answered at least once, "mastered" when every
// item sits at its top stage.
import type { Unit } from '../data/types'
import type { Item, ItemRef, ItemState } from './types'
import { introVersion, maxStageFor } from './session'

export type LessonDef = { id: string; unitId: string; n: number; refs: ItemRef[] }
export type LessonStatus = 'new' | 'started' | 'done' | 'mastered'
export type LessonProgress = { total: number; seen: number; mastered: number; pct: number; status: LessonStatus }

// Items per lesson by kind: letters and sound pairs go fast; a word runs a six-rung ladder (alone → in a
// phrase → in a conversation) and a cognate a five-rung one (D134), so five or six per lesson is already
// a full sitting — fewer words, more lessons, every exercise type in each. A mixed unit takes the
// smallest of its kinds.
const PER_LESSON: Record<string, number> = { letter: 10, pair: 10, cognate: 6, word: 5 }
const DEFAULT_PER_LESSON = 8
export function lessonSize(kinds: Iterable<string>): number {
  const sizes = [...kinds].map(k => PER_LESSON[k] ?? DEFAULT_PER_LESSON)
  return sizes.length ? Math.min(...sizes) : DEFAULT_PER_LESSON
}

/** Cut the unit's refs into N lessons; each kind is spread evenly so every lesson mixes chunks,
 *  dialogues and sentences instead of front-loading one kind. Declared order is kept within a kind. */
export function lessonsFor(unit: Pick<Unit, 'id' | 'items'>): LessonDef[] {
  const refs = (unit.items ?? []) as ItemRef[]
  if (!refs.length) return []
  const kinds = [...new Set(refs.map(r => r.kind))]
  const n = Math.max(1, Math.ceil(refs.length / lessonSize(kinds)))
  const out: LessonDef[] = Array.from({ length: n }, (_, i) => ({ id: `${unit.id}/${i + 1}`, unitId: unit.id, n: i + 1, refs: [] }))
  // each kind is dealt base + (0|1) per lesson; the "+1"s rotate across lessons from kind to kind,
  // so remainders never pile up on the same lesson (15 chunks + 7 dialogues + 24 sentences → 8,8,8,8,7,7)
  let rot = 0
  for (const k of kinds) {
    const of = refs.filter(r => r.kind === k)
    const base = Math.floor(of.length / n), extra = of.length % n
    const gets = Array.from({ length: n }, (_, j) => base + ((j - rot + n) % n < extra ? 1 : 0))
    let at = 0
    for (let j = 0; j < n; j++) { out[j].refs.push(...of.slice(at, at + gets[j])); at += gets[j] }
    rot = (rot + extra) % n
  }
  return out.filter(l => l.refs.length > 0).map((l, i) => ({ ...l, n: i + 1, id: `${unit.id}/${i + 1}` }))
}

export function lessonProgress(l: LessonDef, states: Map<string, ItemState>): LessonProgress {
  let seen = 0, mastered = 0, sum = 0, max = 0
  for (const r of l.refs) {
    const st = states.get(r.id)?.stage ?? 0, top = maxStageFor(r.kind, l.unitId)
    if (st >= 1) seen++
    if (st >= top) mastered++
    sum += Math.min(st, top); max += top
  }
  const total = l.refs.length
  const status: LessonStatus = total > 0 && mastered >= total ? 'mastered' : seen >= total ? 'done' : seen > 0 ? 'started' : 'new'
  return { total, seen, mastered, pct: max ? sum / max : 0, status }
}

/** The lesson to continue with: the first one not yet done. Null when the unit is complete. */
export function nextLesson(defs: LessonDef[], states: Map<string, ItemState>): LessonDef | null {
  return defs.find(l => { const s = lessonProgress(l, states).status; return s === 'new' || s === 'started' }) ?? null
}

/** Manual marking (for a second device): the item states a "mark as done / mastered" writes. `done` lifts
 *  every item to at least stage 1 (introduced and answered once); `mastered` sets each to its top stage.
 *  Nothing is ever lowered. Returns only the states that change. */
export function markStates(l: LessonDef, states: Map<string, ItemState>, level: 'done' | 'mastered', now = Date.now()): ItemState[] {
  const today = new Date(now).toISOString().slice(0, 10)
  const out: ItemState[] = []
  for (const r of l.refs) {
    const top = maxStageFor(r.kind, l.unitId)
    const target = level === 'done' ? Math.min(1, top) : top
    const cur = states.get(r.id)
    if (cur && cur.stage >= target) continue
    const st: ItemState = cur ? { ...cur } : { id: r.id, unitId: l.unitId, kind: r.kind, stage: 0, streak: 0, seen: 0, lastAt: 0, stageAtDayStart: 0, dayKey: '' }
    st.stage = target; st.seen = Math.max(st.seen, 1); st.lastAt = now; st.dayKey = today; st.stageAtDayStart = target
    st.intro = introVersion(r.kind)     // marked done elsewhere = taught elsewhere: no intro card again (D138)
    if (level === 'mastered') st.streak = Math.max(st.streak, 3)
    out.push(st)
  }
  return out
}

/** Resolve a lesson's refs against loaded items, in lesson order. */
export function lessonItems(l: LessonDef, items: Item[]): Item[] {
  const by = new Map(items.map(it => [it.ref.id, it]))
  return l.refs.map(r => by.get(r.id)).filter((x): x is Item => !!x)
}

/** Count of items per kind, for the "3 chunks · 1 dialogue · 4 sentences" line. */
export function kindCounts(l: LessonDef): [string, number][] {
  const c = new Map<string, number>()
  for (const r of l.refs) c.set(r.kind, (c.get(r.kind) ?? 0) + 1)
  return [...c.entries()]
}

/** The ids a unit has *taught*: every item of every done or mastered lesson. The one definition of "learned"
 *  shared by the practice pool and Recap enrolment (D138), so the two can never disagree about a section. */
export function learnedIds(unit: Pick<Unit, 'id' | 'items'>, states: Map<string, ItemState>): Set<string> {
  return new Set(lessonsFor(unit).filter(l => { const s = lessonProgress(l, states).status; return s === 'done' || s === 'mastered' }).flatMap(l => l.refs.map(r => r.id)))
}

/** Group every stored item state by unit, for Home. */
export function statesByUnit(rows: ItemState[]): Map<string, Map<string, ItemState>> {
  const m = new Map<string, Map<string, ItemState>>()
  for (const r of rows) { if (!m.has(r.unitId)) m.set(r.unitId, new Map()); m.get(r.unitId)!.set(r.id, r) }
  return m
}
