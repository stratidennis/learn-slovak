import { loadAlphabet, loadChunks, loadDialogues, loadMinimalPairs, loadSentences, loadUnits } from '../data/loader'
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
    for (const l of a.letters) {
      const base = { audio: `/${l.audio_name}`, audioSlow: null, ipa: `[${l.ipa}]`, emoji: null, letter: l }
      if (kinds.has('letter')) out.push({ ref: { kind: 'letter', id: `letter:${l.letter}` }, sk: l.letter, meaning: { ro: l.anchor.ro ?? '', en: l.anchor.en ?? '' },
        spell: l.name, note: { ro: l.note.ro, en: l.note.en }, ...base })
      if (kinds.has('word') && l.audio_example && l.example !== '—') out.push({ ref: { kind: 'word', id: `word:${l.example}` }, sk: l.example,
        meaning: { ro: `${l.anchor.ro ?? ''}`, en: `${l.anchor.en ?? ''}` }, spell: l.example_spell, note: { ro: null, en: null }, ...base, audio: `/${l.audio_example}` })
    }
  }
  if (kinds.has('pair')) {
    for (const p of await loadMinimalPairs()) if (p.kind === 'pair' && p.b && p.audio?.a && p.audio.b)
      out.push({ ref: { kind: 'pair', id: p.id }, sk: `${p.a} / ${p.b}`, meaning: { ro: (p as typeof p & { gloss_ro?: string }).gloss_ro ?? p.gloss, en: p.gloss },
        audio: `/${p.audio.a.file}`, audioSlow: `/${p.audio.b.file}`, spell: `${(p as typeof p & { guide?: { a: string; b: string | null } }).guide?.a ?? ''} / ${(p as typeof p & { guide?: { a: string; b: string | null } }).guide?.b ?? ''}`,
        ipa: `${p.ipa_a} / ${p.ipa_b}`, emoji: null, note: { ro: null, en: null }, pair: p })
  }
  if (kinds.has('cognate')) {
    for (const c of await loadCognates()) out.push({ ref: { kind: 'cognate', id: c.id }, sk: c.sk, meaning: { ro: c.ro, en: c.en }, audio: `/${c.audio}`, audioSlow: null,
      spell: c.spell, ipa: null, emoji: c.emoji, note: { ro: c.shift ? 'sensul s-a schimbat față de română — folosește-l doar ca ancoră' : c.note || null, en: c.shift ? 'meaning shifted from Romanian — memory hook only' : c.note || null }, cognate: c })
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
  // keep the unit's declared order
  const order = new Map(refs.map((r, i) => [r.id, i]))
  return out.sort((a, b) => (order.get(a.ref.id) ?? 0) - (order.get(b.ref.id) ?? 0))
}

export async function loadUnitById(id: string): Promise<Unit | undefined> {
  return (await loadUnits()).find(u => u.id === id)
}
