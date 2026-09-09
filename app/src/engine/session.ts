import type { Item, ItemState, Step } from './types'
import { blankIndexFor, clozeOptions, pickDistractors, shuffle, tilesFor } from './distractors'
import { dayKey } from './store'

export type Plan = { steps: Step[]; newItems: Item[]; dueItems: Item[] }
type Lang = 'ro' | 'en'
const words = (it: Item) => it.sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean).length

/** The step an item gets at its current stage (curriculum/LEARNING-ENGINE.md §2). */
export function stepFor(item: Item, stage: number, pool: Item[], lang: Lang): Step | null {
  const k = item.ref.kind
  if (k === 'pair') return { type: 'pairab', item, playB: Math.random() < 0.5 }
  if (k === 'letter') {
    if (stage <= 0) return { type: 'intro', item }
    if (stage === 1) return { type: 'letterpick', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]) }
    if (stage === 2) return { type: 'anchor', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]) }
    return null
  }
  if (k === 'word') {
    if (stage <= 0) return { type: 'intro', item }
    return { type: 'typeword', item, blankIndex: 0 }
  }
  if (k === 'cognate') {
    if (stage <= 0) return { type: 'intro', item }
    if (stage === 1) return { type: 'meaning', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]) }
    if (stage === 2) return { type: 'form', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]), audioOnly: true }
    return null
  }
  if (k === 'dialogue') {
    // hear/see A → pick the reply; then A by ear only; then build the reply from tiles (Ling's best exercise, then output)
    const opts = () => shuffle([item, ...pickDistractors(item, pool, 3, lang)])
    if (stage <= 0) return { type: 'intro', item }
    if (stage === 1) return { type: 'reply', item, options: opts(), audioOnly: false }
    if (stage === 2) return { type: 'reply', item, options: opts(), audioOnly: true }
    if (stage === 3) return words(item) >= 2 ? { type: 'tiles', item, tiles: tilesFor(item, pool) } : { type: 'reply', item, options: opts(), audioOnly: true }
    return null
  }
  // chunk / sentence: the full ladder
  const n = words(item)
  switch (stage) {
    case 0: return { type: 'intro', item }
    case 1: return { type: 'meaning', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]) }
    case 2: return { type: 'form', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]), audioOnly: true }
    case 3: return n >= 2 ? { type: 'tiles', item, tiles: tilesFor(item, pool) } : { type: 'form', item, options: shuffle([item, ...pickDistractors(item, pool, 3, lang)]), audioOnly: false }
    case 4: { const b = blankIndexFor(item); return n >= 2 ? { type: 'cloze', item, blankIndex: b, options: clozeOptions(item, b, pool) } : { type: 'typeword', item, blankIndex: 0 } }
    case 5: return n >= 2 ? { type: 'typeword', item, blankIndex: blankIndexFor(item) } : { type: 'listentype', item }
    default: return null
  }
}
export const maxStageFor = (kind: Item['ref']['kind'] | string, unitId: string) =>
  kind === 'pair' ? 1 : kind === 'letter' ? 3 : kind === 'cognate' ? 3 : kind === 'word' ? 2 : kind === 'dialogue' ? (unitId.startsWith('0.') ? 3 : 4) : unitId.startsWith('0.') ? 4 : 6
const SPEAKABLE = new Set(['chunk', 'sentence', 'dialogue', 'cognate'])

/** Build a ~12–18 step session: warm-up, new items (intro + first step, later a second step), due items, one match block, misses re-queued by the runner. */
export function buildSession(items: Item[], states: Map<string, ItemState>, unitId: string, lang: Lang, opts: { newPerSession?: number; maxDue?: number; speaking?: boolean; pool?: Item[] } = {}): Plan {
  const newPerSession = opts.newPerSession ?? (unitId.startsWith('0.') ? 4 : 5)
  const maxDue = opts.maxDue ?? 8
  const today = dayKey()
  const stage = (it: Item) => states.get(it.ref.id)?.stage ?? 0
  const maxOf = (it: Item) => maxStageFor(it.ref.kind, unitId)
  const isMastered = (it: Item) => stage(it) >= maxOf(it)
  const isNew = (it: Item) => !states.has(it.ref.id) || stage(it) === 0
  const seenToday = (it: Item) => states.get(it.ref.id)?.dayKey === today

  const mastered = items.filter(isMastered)
  const due = shuffle(items.filter(it => !isNew(it) && !isMastered(it))).sort((a, b) => (states.get(a.ref.id)!.lastAt) - (states.get(b.ref.id)!.lastAt)).slice(0, maxDue)
  const fresh = items.filter(isNew).slice(0, Math.max(0, newPerSession - Math.floor(due.filter(seenToday).length / 3)))
  const pool = opts.pool && opts.pool.length > items.length ? opts.pool : items   // distractors from the whole unit when the session is one lesson

  const steps: Step[] = []
  // 1. warm-up: 2–3 mastered items, recognition (fluency strand). Pairs are their own drill.
  for (const it of shuffle(mastered).slice(0, mastered.length ? 2 : 0)) {
    const s = it.ref.kind === 'pair' ? stepFor(it, 0, pool, lang) : it.ref.kind === 'letter' ? stepFor(it, 1, pool, lang) : stepFor(it, 1, pool, lang)
    if (s) steps.push(s)
  }
  // 2. new items: intro then its first step; a second appearance is queued later
  const later: Step[] = []
  for (const it of fresh) {
    const intro = stepFor(it, 0, pool, lang); if (intro) steps.push(intro)
    const first = stepFor(it, 1, pool, lang); if (first) steps.push(first)
    const second = stepFor(it, 2, pool, lang); if (second && it.ref.kind !== 'pair') later.push(second)
  }
  // 3. due items at their stage
  const dueSteps: Step[] = []
  for (const it of due) { const s = stepFor(it, stage(it), pool, lang); if (s) dueSteps.push(s) }
  // 4. a match block from items at stage >= 2 (chunks/sentences/cognates only)
  const matchable = items.filter(it => ['chunk', 'sentence', 'cognate'].includes(it.ref.kind) && (stage(it) >= 2 || fresh.includes(it)))
  const matchStep: Step | null = matchable.length >= 4 ? { type: 'match', items: shuffle(matchable).slice(0, Math.min(5, matchable.length)) } : null
  // interleave: due steps and second appearances spread out, match near the end
  const rest = interleave(shuffle([...dueSteps, ...later]))
  const all = [...steps, ...rest]
  if (matchStep) all.splice(Math.max(2, all.length - 2), 0, matchStep)
  // 5. output strand: up to two "say it" steps on items already recognised (stage >= 2), never on new ones.
  //    They never move the stage — recognition is unreliable and speaking is practice, not a test.
  if (opts.speaking !== false) {
    const speakable = shuffle(items.filter(it => SPEAKABLE.has(it.ref.kind) && stage(it) >= 2 && !fresh.includes(it))).slice(0, all.length >= 8 ? 2 : 1)
    speakable.forEach((it, k) => all.splice(Math.min(all.length, Math.max(2, Math.round(all.length * (k === 0 ? 0.4 : 0.8)))), 0, { type: 'speak', item: it }))
  }
  return { steps: all, newItems: fresh, dueItems: due }
}

/** Redo a finished lesson (D129): every item gets one step. Items at their top stage are asked one rung
 *  below it (or a random recognition/production rung), so a redo is a real check rather than a replay of
 *  intros; unfinished items are asked at their current stage. Same scoring as a normal session. */
export function buildPractice(items: Item[], states: Map<string, ItemState>, unitId: string, lang: Lang, opts: { speaking?: boolean; pool?: Item[] } = {}): Plan {
  const pool = opts.pool && opts.pool.length > items.length ? opts.pool : items
  const stage = (it: Item) => states.get(it.ref.id)?.stage ?? 0
  const maxOf = (it: Item) => maxStageFor(it.ref.kind, unitId)
  const askAt = (it: Item) => {
    const s = stage(it), top = maxOf(it)
    if (it.ref.kind === 'pair') return 0
    if (s <= 0) return 0
    if (s >= top) return Math.max(1, top - 1 - Math.floor(Math.random() * Math.min(2, top - 1)))
    return s
  }
  const steps: Step[] = []
  for (const it of shuffle(items)) { const s = stepFor(it, askAt(it), pool, lang); if (s) steps.push(s) }
  const all = interleave(steps)
  const matchable = items.filter(it => ['chunk', 'sentence', 'cognate'].includes(it.ref.kind) && stage(it) >= 1)
  if (matchable.length >= 4) all.splice(Math.max(1, Math.floor(all.length / 2)), 0, { type: 'match', items: shuffle(matchable).slice(0, Math.min(5, matchable.length)) })
  if (opts.speaking !== false) {
    const sp = shuffle(items.filter(it => SPEAKABLE.has(it.ref.kind) && stage(it) >= 2)).slice(0, 1)
    for (const it of sp) all.splice(Math.min(all.length, Math.max(2, Math.round(all.length * 0.7))), 0, { type: 'speak', item: it })
  }
  return { steps: all, newItems: [], dueItems: items }
}

/** No same item twice in a row, no more than two identical step types in a row. */
function interleave(steps: Step[]): Step[] {
  const out: Step[] = []
  const pending = [...steps]
  const idOf = (s: Step) => 'item' in s ? s.item.ref.id : 'match'
  while (pending.length) {
    let idx = pending.findIndex(s => (out.length === 0 || idOf(out[out.length - 1]) !== idOf(s)) &&
      !(out.length >= 2 && out[out.length - 1].type === s.type && out[out.length - 2].type === s.type))
    if (idx < 0) idx = 0
    out.push(pending.splice(idx, 1)[0])
  }
  return out
}
