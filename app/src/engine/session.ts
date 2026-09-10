import type { Item, ItemState, Step } from './types'
import { blankIndexFor, clozeOptions, pickDistractors, shuffle, tilesFor } from './distractors'
import { convoItem, phraseItem } from './items'
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
    // A word alone carries no case, no melody and no situation, so it is learned three times over:
    // by itself (recognise, hear, type), then inside a phrase, then inside a conversation whose reply
    // you assemble word by word. Mastery always lands on the word, whatever the exercise shows.
    const opts = () => shuffle([item, ...pickDistractors(item, pool, 3, lang)])
    if (stage <= 0) return { type: 'intro', item }
    if (stage === 1) return { type: 'meaning', item, options: opts() }
    if (stage === 2) return { type: 'form', item, options: opts(), audioOnly: true }
    if (stage === 3) return { type: 'typeword', item, blankIndex: 0 }
    if (stage === 4) {
      const ph = phraseItem(item)
      if (!ph) return { type: 'typeword', item, blankIndex: 0 }
      const b = item.phrase?.blank ?? blankIndexFor(ph)
      return { type: 'cloze', item: ph, blankIndex: b, options: clozeOptions(ph, b, pool) }
    }
    if (stage === 5) {
      const target = convoItem(item) ?? phraseItem(item)
      if (!target) return null
      return { type: 'tiles', item: target, tiles: tilesFor(target, pool) }
    }
    return null
  }
  if (k === 'cognate') {
    // recognise it, hear it, then use it: the same word gapped inside a phrase, then that phrase
    // assembled word by word. A cognate you can only pick out of four is not a word you can use (D134).
    const opts = () => shuffle([item, ...pickDistractors(item, pool, 3, lang)])
    if (stage <= 0) return { type: 'intro', item }
    if (stage === 1) return { type: 'meaning', item, options: opts() }
    if (stage === 2) return { type: 'form', item, options: opts(), audioOnly: true }
    if (stage === 3) {
      const ph = phraseItem(item)
      if (!ph) return { type: 'form', item, options: opts(), audioOnly: false }
      const b = item.phrase?.blank ?? blankIndexFor(ph)
      return { type: 'cloze', item: ph, blankIndex: b, options: clozeOptions(ph, b, pool) }
    }
    if (stage === 4) {
      const ph = phraseItem(item)
      return ph ? { type: 'tiles', item: ph, tiles: tilesFor(ph, pool) } : null
    }
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
  kind === 'pair' ? 1 : kind === 'letter' ? 3 : kind === 'cognate' ? 5 : kind === 'word' ? 6 : kind === 'dialogue' ? (unitId.startsWith('0.') ? 3 : 4) : unitId.startsWith('0.') ? 4 : 6

/** Which version of an item's intro card the learner must have seen. Bumped when the card itself changes
 *  materially: D132 gave every word its own gloss and a phrase, so a word introduced under the old card
 *  (which showed the *letter's* sound anchor as the meaning) has not really been taught (D133); D134 does
 *  the same for the cognates of 0.3. A state with no `intro` field predates the field and counts as 1. */
const INTRO_VERSION: Record<string, number> = { word: 2, cognate: 2 }
export const introVersion = (kind: string) => INTRO_VERSION[kind] ?? 1
export const needsIntro = (st: ItemState | undefined, kind: string) => (st?.intro ?? 1) < introVersion(kind)

/** Build a ~12–18 step session: warm-up, items to present (intro first, then two drills), due items,
 *  one match block, misses re-queued by the runner. */
export function buildSession(items: Item[], states: Map<string, ItemState>, unitId: string, lang: Lang, opts: { newPerSession?: number; maxDue?: number; pool?: Item[] } = {}): Plan {
  const newPerSession = opts.newPerSession ?? (unitId.startsWith('0.') ? 4 : 5)
  const maxDue = opts.maxDue ?? 8
  const today = dayKey()
  const stage = (it: Item) => states.get(it.ref.id)?.stage ?? 0
  const maxOf = (it: Item) => maxStageFor(it.ref.kind, unitId)
  const isMastered = (it: Item) => stage(it) >= maxOf(it)
  const isNew = (it: Item) => !states.has(it.ref.id) || stage(it) === 0
  const seenToday = (it: Item) => states.get(it.ref.id)?.dayKey === today

  const untaught = (it: Item) => needsIntro(states.get(it.ref.id), it.ref.kind)
  const mastered = items.filter(it => isMastered(it) && !untaught(it))
  const dueAll = shuffle(items.filter(it => !isNew(it) && !isMastered(it))).sort((a, b) => (states.get(a.ref.id)!.lastAt) - (states.get(b.ref.id)!.lastAt)).slice(0, maxDue)
  const fresh = items.filter(isNew).slice(0, Math.max(0, newPerSession - Math.floor(dueAll.filter(seenToday).length / 3)))
  // an item whose intro card the learner never actually saw is presented first, then asked at its stage —
  // no quiz on a word before it has been taught (D133)
  const reintro = dueAll.filter(untaught)
  const due = dueAll.filter(it => !untaught(it))
  const presented = [...fresh, ...reintro]
  const pool = opts.pool && opts.pool.length > items.length ? opts.pool : items   // distractors from the whole unit when the session is one lesson

  const steps: Step[] = []
  // 1. warm-up: 2–3 mastered items, recognition (fluency strand). Pairs are their own drill.
  for (const it of shuffle(mastered).slice(0, mastered.length ? 2 : 0)) {
    const s = it.ref.kind === 'pair' ? stepFor(it, 0, pool, lang) : it.ref.kind === 'letter' ? stepFor(it, 1, pool, lang) : stepFor(it, 1, pool, lang)
    if (s) steps.push(s)
  }
  // 2. items to present, in clusters of three: the cluster is presented, then drilled round-robin.
  //    Introducing one item and immediately drilling it twice put three cards for the same word back
  //    to back (D132). A fresh item is drilled at stages 1 and 2; a re-introduced one at its own stage.
  for (const group of clusters(presented, CLUSTER)) {
    for (const it of group) { const s = stepFor(it, 0, pool, lang); if (s) steps.push(s) }
    steps.push(...roundRobin(group.map(it => (fresh.includes(it)
      ? [stepFor(it, 1, pool, lang), it.ref.kind === 'pair' ? null : stepFor(it, 2, pool, lang)]
      : [stepFor(it, stage(it), pool, lang)]).filter((s): s is Step => !!s))))
  }
  // 3. due items at their stage
  const dueSteps: Step[] = []
  for (const it of due) { const s = stepFor(it, stage(it), pool, lang); if (s) dueSteps.push(s) }
  // 4. a match block from items at stage >= 2 (chunks/sentences/cognates only)
  const matchable = items.filter(it => ['chunk', 'sentence', 'cognate'].includes(it.ref.kind) && !untaught(it) && (stage(it) >= 2 || fresh.includes(it)))
  const matchStep: Step | null = matchable.length >= 4 ? { type: 'match', items: shuffle(matchable).slice(0, Math.min(5, matchable.length)) } : null
  // interleave: due steps spread out, match near the end
  const all = interleave([...steps, ...shuffle(dueSteps)])
  if (matchStep) all.splice(Math.max(2, all.length - 2), 0, matchStep)
  return { steps: all, newItems: presented, dueItems: due }
}

/** Redo a finished lesson (D129): every item gets one step. Items at their top stage are asked one rung
 *  below it (or a random recognition/production rung), so a redo is a real check rather than a replay of
 *  intros; unfinished items are asked at their current stage. Same scoring as a normal session. */
export function buildPractice(items: Item[], states: Map<string, ItemState>, unitId: string, lang: Lang, opts: { pool?: Item[] } = {}): Plan {
  const pool = opts.pool && opts.pool.length > items.length ? opts.pool : items
  const stage = (it: Item) => states.get(it.ref.id)?.stage ?? 0
  const maxOf = (it: Item) => maxStageFor(it.ref.kind, unitId)
  const askAt = (it: Item) => {
    const s = stage(it), top = maxOf(it)
    if (it.ref.kind === 'pair') return 0
    if (s <= 0 || needsIntro(states.get(it.ref.id), it.ref.kind)) return 0     // teach it before testing it (D133)
    if (s >= top) return Math.max(1, top - 1 - Math.floor(Math.random() * Math.min(2, top - 1)))
    return s
  }
  // an item that still needs teaching is presented first and asked afterwards, in the same session:
  // roundRobin emits every queue's first step before any second step, so the presentations come first
  const shaky = (it: Item) => { const st = states.get(it.ref.id); return !st || st.stage <= 1 || st.streak === 0 }
  const queues = shuffle(items).map(it => {
    if (!needsIntro(states.get(it.ref.id), it.ref.kind) && !shaky(it)) {
      const s = stepFor(it, askAt(it), pool, lang)
      return s ? [s] : []
    }
    return [stepFor(it, 0, pool, lang), stepFor(it, Math.max(1, askAt(it)), pool, lang)].filter((x): x is Step => !!x)
  })
  const all = interleave(roundRobin(queues))
  const matchable = items.filter(it => ['chunk', 'sentence', 'cognate'].includes(it.ref.kind) && stage(it) >= 1 && !needsIntro(states.get(it.ref.id), it.ref.kind))
  if (matchable.length >= 4) all.splice(Math.max(1, Math.floor(all.length / 2)), 0, { type: 'match', items: shuffle(matchable).slice(0, Math.min(5, matchable.length)) })
  return { steps: all, newItems: [], dueItems: items }
}

/** How many new items are presented together before their practice starts. */
const CLUSTER = 3

/** Split into near-equal groups of at most `max`. Four items become 2+2, not 3+1: a group of one has
 *  nothing to alternate with, so its three cards would have to run back to back (D132). */
export function clusters<T>(list: T[], max: number): T[][] {
  if (list.length <= max) return list.length ? [list] : []
  const k = Math.ceil(list.length / max), out: T[][] = []
  for (let i = 0, at = 0; i < k; i++) {
    const size = Math.ceil((list.length - at) / (k - i))
    out.push(list.slice(at, at + size)); at += size
  }
  return out
}

/** One step from each queue in turn: A1 B1 C1 A2 B2 C2 — the same item never lands twice in a row. */
export function roundRobin<T>(queues: T[][]): T[] {
  const out: T[] = []
  for (let i = 0; i < Math.max(0, ...queues.map(q => q.length)); i++) for (const q of queues) if (i < q.length) out.push(q[i])
  return out
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
