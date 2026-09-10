import { loadAlphabet, loadChunks, loadDialogues, loadMinimalPairs, loadSentences, loadUnits, loadWords } from '../data/loader'
import type { Chunk, Dialogue, Sentence, Unit } from '../data/types'
import type { Cognate, Item, ItemRef } from './types'

let cognates: Promise<Cognate[]> | null = null
const loadCognates = () => (cognates ??= fetch('/content/cognates.json').then(r => r.json()))

const chunkItem = (c: Chunk): Item => ({
  ref: { kind: 'chunk', id: c.id }, sk: c.sk, meaning: { ro: c.ro, en: c.en },
  audio: c.audio ? `/${c.audio.file}` : null, audioSlow: c.audio_slow ? `/${c.audio_slow}` : null,
  spell: c.guide?.ro ?? null, ipa: c.guide?.ipa ?? null, emoji: (c as Chunk & { emoji?: string | null }).emoji ?? null,
  note: { ro: c.notes_ro ?? c.notes ?? null, en: c.notes ?? null }, register: c.register, chunk: c,
})
const sentenceItem = (s: Sentence): Item => ({
  ref: { kind: 'sentence', id: s.id }, sk: s.sk, meaning: { ro: s.ro[0] ?? s.en[0] ?? '', en: s.en[0] ?? s.ro[0] ?? '' },
  audio: `/${s.audio}`, audioSlow: s.audio_slow ? `/${s.audio_slow}` : null, spell: s.guide?.ro ?? null, ipa: s.guide?.ipa ?? null,
  emoji: (s as Sentence & { emoji?: string | null }).emoji ?? null, note: { ro: null, en: null }, sentence: s,
})

const dialogueItem = (x: Dialogue): Item => ({
  ref: { kind: 'dialogue', id: x.id }, sk: x.b.sk, meaning: { ro: x.b.ro, en: x.b.en },
  audio: `/${x.b.audio}`, audioSlow: x.b.audio_slow ? `/${x.b.audio_slow}` : null, spell: x.b.guide?.ro ?? null, ipa: x.b.guide?.ipa ?? null,
  emoji: null, note: { ro: x.note_ro, en: x.note }, dialogue: x,
})

/** Resolve a unit's item refs into full Items (all pools loaded once per call). */
export async function loadUnitItems(unit: Unit): Promise<Item[]> {
  const refs = (unit as Unit & { items?: ItemRef[] }).items ?? []
  const kinds = new Set(refs.map(r => r.kind))
  const out: Item[] = []
  if (kinds.has('letter') || kinds.has('word')) {
    const a = await loadAlphabet()
    const wordCtx = kinds.has('word') ? await loadWords() : new Map()
    for (const l of a.letters) {
      const base = { audio: `/${l.audio_sound ?? l.audio_name}`, audioSlow: null, ipa: `[${l.ipa}]`, emoji: null, letter: l }
      if (kinds.has('letter')) out.push({ ref: { kind: 'letter', id: `letter:${l.letter}` }, sk: l.letter, meaning: { ro: l.anchor.ro ?? '', en: l.anchor.en ?? '' },
        spell: l.name, note: { ro: l.note.ro, en: l.note.en }, ...base })
      if (kinds.has('word') && l.audio_example && l.example !== '—') {
        // the word means what the word means — not the letter's sound anchor and not the phrase's
        // translation ("auto" is "car", not "Where's your car?"; D132)
        const wc = wordCtx.get(l.example)
        const ro = wc?.gloss?.ro ?? l.anchor.ro ?? '', en = wc?.gloss?.en ?? l.anchor.en ?? ''
        out.push({ ref: { kind: 'word', id: `word:${l.example}` }, sk: l.example, meaning: { ro, en },
          spell: l.example_spell, note: { ro: null, en: null }, ...base, audio: `/${l.audio_example}`,
          phrase: wc?.phrase, convo: wc?.convo })
      }
    }
  }
  if (kinds.has('pair')) {
    for (const p of await loadMinimalPairs()) if (p.kind === 'pair' && p.b && p.audio?.a && p.audio.b)
      out.push({ ref: { kind: 'pair', id: p.id }, sk: `${p.a} / ${p.b}`, meaning: { ro: (p as typeof p & { gloss_ro?: string }).gloss_ro ?? p.gloss, en: p.gloss },
        audio: `/${p.audio.a.file}`, audioSlow: `/${p.audio.b.file}`, spell: `${(p as typeof p & { guide?: { a: string; b: string | null } }).guide?.a ?? ''} / ${(p as typeof p & { guide?: { a: string; b: string | null } }).guide?.b ?? ''}`,
        ipa: `${p.ipa_a} / ${p.ipa_b}`, emoji: null, note: { ro: null, en: null }, pair: p })
  }
  if (kinds.has('cognate')) {
    const wordCtx = await loadWords()          // a cognate is learned inside a phrase too (D134)
    for (const c of await loadCognates()) out.push({ ref: { kind: 'cognate', id: c.id }, sk: c.sk, meaning: { ro: c.ro, en: c.en }, audio: `/${c.audio}`, audioSlow: null,
      spell: c.spell, ipa: null, emoji: c.emoji, note: { ro: c.shift ? 'sensul s-a schimbat față de română — folosește-l doar ca ancoră' : c.note || null, en: c.shift ? 'meaning shifted from Romanian — memory hook only' : c.note || null },
      cognate: c, phrase: wordCtx.get(c.sk)?.phrase })
  }
  if (kinds.has('chunk')) {
    const unitsNeeded = new Set(refs.filter(r => r.kind === 'chunk').map(r => r.id.split(':')[1]))
    const chunks = (await Promise.all([...unitsNeeded].map(u => loadChunks(u)))).flat()
    const want = new Set(refs.filter(r => r.kind === 'chunk').map(r => r.id))
    for (const c of chunks) if (want.has(c.id)) out.push(chunkItem(c))
  }
  if (kinds.has('dialogue')) {
    const want = new Set(refs.filter(r => r.kind === 'dialogue').map(r => r.id))
    for (const x of await loadDialogues(unit.id)) if (want.has(x.id)) out.push(dialogueItem(x))
  }
  if (kinds.has('sentence')) {
    const want = new Set(refs.filter(r => r.kind === 'sentence').map(r => r.id))
    for (const s of await loadSentences(unit.id)) if (want.has(s.id)) out.push(sentenceItem(s))
  }
  // keep the unit's declared order; two letters can share an example word (k and á → káva), so one item per id
  const order = new Map(refs.map((r, i) => [r.id, i]))
  const seen = new Set<string>()
  return out.filter(it => !seen.has(it.ref.id) && seen.add(it.ref.id))
    .sort((a, b) => (order.get(a.ref.id) ?? 0) - (order.get(b.ref.id) ?? 0))
}

/** What a letter plays: the letter on its own, then the example word that contains it ("bé — brat", "á — káva"). */
export function letterSeq(it: Item): string[] | undefined {
  if (it.ref.kind !== 'letter' || !it.letter) return undefined
  return [it.audio, it.letter.audio_example ? `/${it.letter.audio_example}` : null].filter((x): x is string => !!x)
}

/** The same word item, but the exercise now targets its phrase (stage 4) — mastery still lands on the word. */
export function phraseItem(it: Item): Item | null {
  const p = it.phrase
  if (!p) return null
  return { ...it, sk: p.sk, meaning: { ro: p.ro ?? p.en ?? '', en: p.en ?? p.ro ?? '' },
    audio: p.audio ? `/${p.audio}` : it.audio, audioSlow: p.audio_slow ? `/${p.audio_slow}` : null,
    spell: p.guide?.ro ?? null, ipa: p.guide?.ipa ?? null, dialogue: undefined }
}
/** The word inside a two-line exchange (stage 5): assemble the reply. Shows as a dialogue. */
export function convoItem(it: Item): Item | null {
  const c = it.convo
  if (!c) return null
  return { ...it, sk: c.b.sk, meaning: { ro: c.b.ro, en: c.b.en },
    audio: `/${c.b.audio}`, audioSlow: c.b.audio_slow ? `/${c.b.audio_slow}` : null,
    spell: c.b.guide?.ro ?? null, ipa: c.b.guide?.ipa ?? null,
    dialogue: { id: `wordconvo:${it.ref.id}`, unit: '0.4', a: c.a, b: c.b, note: null, note_ro: null } }
}

export async function loadUnitById(id: string): Promise<Unit | undefined> {
  return (await loadUnits()).find(u => u.id === id)
}
