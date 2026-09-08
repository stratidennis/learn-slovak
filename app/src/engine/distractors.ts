import type { Item } from './types'
import { tokenize } from '../lib/normalize'

const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
export { shuffle }

/** n other items, preferring the same kind and a different meaning; falls back to the whole pool. */
export function pickDistractors(target: Item, pool: Item[], n: number, lang: 'ro' | 'en'): Item[] {
  const key = (it: Item) => (lang === 'ro' ? it.meaning.ro : it.meaning.en).toLowerCase()
  const seen = new Set([key(target), target.sk.toLowerCase()])
  const out: Item[] = []
  for (const it of shuffle(pool.filter(p => p.ref.kind === target.ref.kind))) {
    if (out.length >= n) break
    if (it.ref.id === target.ref.id || seen.has(key(it)) || it.sk.toLowerCase() === target.sk.toLowerCase()) continue
    seen.add(key(it)); out.push(it)
  }
  for (const it of shuffle(pool)) {
    if (out.length >= n) break
    if (it.ref.id === target.ref.id || seen.has(key(it))) continue
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
