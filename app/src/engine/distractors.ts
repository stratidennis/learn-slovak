import type { DlgClozeLine, Item } from './types'
import { stripDiacritics, tokenize } from '../lib/normalize'

const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
export { shuffle }

/** n other items, preferring the same kind and a different meaning; falls back to the whole pool. */
export function pickDistractors(target: Item, pool: Item[], n: number, lang: 'ro' | 'en'): Item[] {
  const key = (it: Item) => (lang === 'ro' ? it.meaning.ro : it.meaning.en).toLowerCase()
  const seen = new Set([key(target), target.sk.toLowerCase()])
  const out: Item[] = []
  const homophone = (it: Item) => target.ref.kind === 'letter' && it.ref.kind === 'letter' && !!target.ipa && it.ipa === target.ipa
  for (const it of shuffle(pool.filter(p => p.ref.kind === target.ref.kind))) {
    if (out.length >= n) break
    if (it.ref.id === target.ref.id || seen.has(key(it)) || it.sk.toLowerCase() === target.sk.toLowerCase() || homophone(it)) continue
    seen.add(key(it)); out.push(it)
  }
  for (const it of shuffle(pool)) {
    if (out.length >= n) break
    if (it.ref.id === target.ref.id || seen.has(key(it)) || homophone(it)) continue
    seen.add(key(it)); out.push(it)
  }
  return out
}

/** Word tiles for item.sk plus 1–2 distractor words from other items (never a word already in the target). */
export function tilesFor(item: Item, pool: Item[]): string[] {
  const words = item.sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean)
  const have = new Set(words.map(w => w.toLowerCase().replace(/[.,!?]/g, '')))
  const extra: string[] = []
  for (const it of shuffle(pool)) {
    for (const w of it.sk.split(/\s+/)) {
      const k = w.toLowerCase().replace(/[.,!?]/g, '')
      if (k.length > 1 && !have.has(k) && extra.length < Math.min(2, Math.max(1, Math.floor(words.length / 2)))) { have.add(k); extra.push(w.replace(/[.,!?]$/, '')) }
    }
    if (extra.length >= 2) break
  }
  return shuffle([...words, ...extra])
}

/** Which word to blank in a cloze: the longest content-ish word (not a 1–2 letter particle). */
export function blankIndexFor(item: Item): number {
  const words = tokenize(item.sk)
  let best = 0
  words.forEach((w, i) => { if (w.length > words[best].length && w.length > 2) best = i })
  return best
}
export function clozeOptions(item: Item, blankIndex: number, pool: Item[]): string[] {
  const words = item.sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean)
  const answer = words[blankIndex].replace(/[.,!?]$/, '')
  const opts = new Set<string>()
  for (const it of shuffle(pool)) {
    for (const w of it.sk.split(/\s+/)) {
      const c = w.replace(/[.,!?„“"…]/g, '')
      if (c && c.toLowerCase() !== answer.toLowerCase() && Math.abs(c.length - answer.length) <= 3 && opts.size < 2) opts.add(c)
    }
    if (opts.size >= 2) break
  }
  return shuffle([answer, ...opts])
}

/** A gapped conversation (D135): 2–3 words taken out across the two lines, one shared word bank.
 *  More interesting than a single gap because the learner has to hold the whole exchange in mind.
 *  The item's own word is always one of the gaps when it appears; the first word of a line never is,
 *  so the opening stays readable. Distractors come from other items in the pool. */
export function dlgClozeFor(item: Item, pool: Item[], target?: string): { lines: DlgClozeLine[]; bank: string[]; answers: string[] } | null {
  const x = item.dialogue
  if (!x) return null
  const clean = (w: string) => w.replace(/[.,!?„“"…]/g, '')
  const norm = (w: string) => stripDiacritics(clean(w).toLowerCase())
  const wordsOf = (sk: string) => sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean)
  const tgt = target ? norm(target) : null

  const lines: DlgClozeLine[] = (['a', 'b'] as const).map(who => {
    const line = who === 'a' ? x.a : x.b
    return { who, sk: line.sk, words: wordsOf(line.sk), blanks: [], audio: line.audio ? `/${line.audio}` : null, meaning: line.ro || line.en || '' }
  })
  // how many gaps a line may carry: short lines one, longer lines two
  const room = (n: number) => (n <= 2 ? 1 : n <= 4 ? 1 : 2)
  let total = 0
  for (const line of lines) {
    const cand = line.words.map((_w, i) => i).filter(i => i > 0 && clean(line.words[i]).length >= 3)
    if (!cand.length) continue
    // the item's own word first, then the longest remaining words
    const own = tgt ? cand.filter(i => norm(line.words[i]).startsWith(tgt.slice(0, Math.max(3, tgt.length - 2)))) : []
    const rest = shuffle(cand.filter(i => !own.includes(i))).sort((a, b) => clean(line.words[b]).length - clean(line.words[a]).length)
    for (const i of [...own, ...rest].slice(0, room(line.words.length))) {
      if (total >= 3) break
      line.blanks.push(i); total++
    }
    line.blanks.sort((a, b) => a - b)
  }
  if (total < 2) {
    // one gap only: take a second from the longest line so it is always a multi-gap exercise
    const best = [...lines].sort((a, b) => b.words.length - a.words.length)[0]
    const more = best.words.map((_w, i) => i).filter(i => i > 0 && !best.blanks.includes(i) && clean(best.words[i]).length >= 2)
    if (more.length) { best.blanks.push(more[0]); best.blanks.sort((a, b) => a - b); total++ }
  }
  if (total < 2) return null
  const answers = lines.flatMap(l => l.blanks.map(i => l.words[i]))
  const have = new Set(answers.map(norm))
  const extra: string[] = []
  for (const it of shuffle(pool)) {
    if (extra.length >= 2) break
    for (const w of wordsOf(it.sk)) {
      const c = clean(w)
      if (c.length >= 3 && !have.has(norm(w)) && extra.length < 2) { have.add(norm(w)); extra.push(c) }
    }
  }
  return { lines, bank: shuffle([...answers, ...extra]), answers }
}
