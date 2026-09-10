import { describe, expect, it, vi } from 'vitest'
import type { Item, ItemState } from './types'

vi.mock('./store', () => ({ dayKey: (t = Date.now()) => new Date(t).toISOString().slice(0, 10) }))
const { buildSession, buildPractice, maxStageFor, stepFor, roundRobin } = await import('./session')
const { phraseItem, convoItem } = await import('./items')

const word = (w: string, ro: string, phrase?: [string, number], convo?: [string, string, number]): Item => ({
  ref: { kind: 'word', id: `word:${w}` }, sk: w, meaning: { ro, en: ro }, audio: `/audio/${w}.mp3`, audioSlow: null,
  spell: w, ipa: null, emoji: null, note: { ro: null, en: null },
  phrase: phrase ? { sk: phrase[0], ro: `RO ${phrase[0]}`, en: `EN ${phrase[0]}`, audio: `audio/${w}-p.mp3`, audio_slow: null, blank: phrase[1], src: 'authored' } : undefined,
  convo: convo ? { a: { sk: convo[0], ro: 'ro a', en: 'en a', audio: `audio/${w}-a.mp3` },
                   b: { sk: convo[1], ro: 'ro b', en: 'en b', audio: `audio/${w}-b.mp3` }, blank: convo[2], src: 'authored' } : undefined,
})
const voda = word('voda', 'apă', ['Vodu, prosím.', 0], ['Čo si dáte na pitie?', 'Vodu, prosím.', 0])
const stlp = word('stĺp', 'stâlp', ['Auto stojí pri stĺpe.', 3])          // phrase but no conversation
const bare = word('xyz', 'nimic')                                          // neither
const pool = [voda, stlp, bare, word('mäso', 'carne', ['Nejem mäso.', 1]), word('čaj', 'ceai', ['Dáš si čaj?', 2]), word('okno', 'fereastră', ['Otvor okno, prosím.', 1])]

describe('the word ladder: alone → in a phrase → in a conversation', () => {
  it('runs six rungs and only then counts as mastered', () => {
    expect(maxStageFor('word', '0.4')).toBe(6)
    const kinds = [0, 1, 2, 3, 4, 5].map(st => stepFor(voda, st, pool, 'ro')?.type)
    expect(kinds).toEqual(['intro', 'meaning', 'form', 'typeword', 'cloze', 'tiles'])
    expect(stepFor(voda, 6, pool, 'ro')).toBeNull()
  })
  it('gaps the word itself inside its phrase, and offers other words as the wrong answers', () => {
    const s = stepFor(word('mäso', 'carne', ['Nejem mäso.', 1]), 4, pool, 'ro')
    if (s?.type !== 'cloze') throw new Error('expected a cloze')
    expect(s.item.ref.id).toBe('word:mäso')          // mastery lands on the word, not the phrase
    expect(s.item.sk).toBe('Nejem mäso.')
    expect(s.blankIndex).toBe(1)
    expect(s.options).toContain('mäso')
    expect(s.options.length).toBeGreaterThanOrEqual(2)
  })
  it('assembles the conversation reply when there is one, else the phrase', () => {
    const c = stepFor(voda, 5, pool, 'ro')
    if (c?.type !== 'tiles') throw new Error('expected tiles')
    expect(c.item.dialogue?.a.sk).toBe('Čo si dáte na pitie?')
    expect(c.item.sk).toBe('Vodu, prosím.')
    expect(c.tiles).toContain('Vodu,')   // tiles keep their punctuation; the grader ignores it
    const p = stepFor(stlp, 5, pool, 'ro')
    if (p?.type !== 'tiles') throw new Error('expected tiles')
    expect(p.item.dialogue).toBeUndefined()
    expect(p.item.sk).toBe('Auto stojí pri stĺpe.')
  })
  it('falls back to typing the word when it has no context at all', () => {
    expect(stepFor(bare, 4, pool, 'ro')).toMatchObject({ type: 'typeword' })
    expect(stepFor(bare, 5, pool, 'ro')).toBeNull()
    expect(phraseItem(bare)).toBeNull(); expect(convoItem(bare)).toBeNull()
  })
  it('keeps the word ref on every derived item so progress is not split', () => {
    for (const d of [phraseItem(voda), convoItem(voda)]) {
      expect(d?.ref.id).toBe('word:voda'); expect(d?.ref.kind).toBe('word')
    }
  })
})

describe('mixing (D132)', () => {
  const state = (it: Item, stage: number): [string, ItemState] => [it.ref.id, { id: it.ref.id, unitId: '0.4', kind: 'word', stage, streak: 1, seen: 2, lastAt: Date.now() - 86400000, stageAtDayStart: stage, dayKey: '2000-01-01' }]
  it('round-robins queues so no queue repeats back to back', () => {
    expect(roundRobin([['a1', 'a2'], ['b1', 'b2'], ['c1']])).toEqual(['a1', 'b1', 'c1', 'a2', 'b2'])
    expect(roundRobin([])).toEqual([])
  })
  it('never shows the same word twice in a row, and introduces it before drilling it', () => {
    const plan = buildSession(pool, new Map([state(bare, 3)]), '0.4', 'ro', { newPerSession: 5 })
    const ids = plan.steps.map(s => ('item' in s ? s.item.ref.id : 'match'))
    expect(ids.length).toBeGreaterThan(6)
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1])
    for (const it of plan.newItems) {
      const first = plan.steps.findIndex(s => 'item' in s && s.item.ref.id === it.ref.id)
      expect(plan.steps[first].type).toBe('intro')
      expect(plan.steps.filter(s => 'item' in s && s.item.ref.id === it.ref.id).length).toBeGreaterThanOrEqual(2)
    }
  })
  it('gives each new word more than one kind of exercise in a session', () => {
    const plan = buildSession(pool, new Map(), '0.4', 'ro', { newPerSession: 5 })
    for (const it of plan.newItems) {
      const types = new Set(plan.steps.filter(s => 'item' in s && s.item.ref.id === it.ref.id).map(s => s.type))
      expect(types.size).toBeGreaterThanOrEqual(3)      // intro + two different drills
    }
  })
})

describe('nothing is quizzed before it is taught (D133)', () => {
  const legacy = (it: Item, stage: number, intro?: number): [string, ItemState] => [it.ref.id,
    { id: it.ref.id, unitId: '0.4', kind: 'word', stage, streak: 1, seen: 3, lastAt: Date.now() - 86400000, stageAtDayStart: stage, dayKey: '2000-01-01', ...(intro ? { intro } : {}) }]

  it('re-presents a word that was only ever introduced by the old card, then asks it at its stage', () => {
    // stage 2 from the old two-rung ladder, no `intro` field: the card he saw glossed the word with the
    // letter's sound anchor, so the word's meaning was never taught
    const states = new Map([legacy(voda, 2), legacy(stlp, 2)])
    const plan = buildSession(pool, states, '0.4', 'ro', { newPerSession: 0 })
    for (const id of ['word:voda', 'word:stĺp']) {
      const mine = plan.steps.filter(s => 'item' in s && s.item.ref.id === id)
      expect(mine.length, id).toBeGreaterThanOrEqual(2)
      expect(mine[0].type, id).toBe('intro')
    }
  })
  it('leaves a word alone once it has seen the current intro card', () => {
    const states = new Map([legacy(voda, 2, 2)])
    const plan = buildSession([voda], states, '0.4', 'ro', { newPerSession: 0 })
    expect(plan.steps.some(s => s.type === 'intro')).toBe(false)
    expect(plan.steps.length).toBeGreaterThan(0)
  })
  it('does not re-present other kinds: only the word card changed', () => {
    const chunk: Item = { ...voda, ref: { kind: 'chunk', id: 'chk:1.1:x' }, sk: 'Dobrý deň.', phrase: undefined, convo: undefined }
    const st = new Map([[chunk.ref.id, { ...legacy(chunk, 2)[1], kind: 'chunk' as const, unitId: '1.1' }]])
    const plan = buildSession([chunk], st, '1.1', 'ro', { newPerSession: 0 })
    expect(plan.steps.some(s => s.type === 'intro')).toBe(false)
  })
  it('teaches before testing in redo mode too', () => {
    const plan = buildPractice(pool, new Map([legacy(voda, 4)]), '0.4', 'ro')
    const mine = plan.steps.filter(s => 'item' in s && s.item.ref.id === 'word:voda')
    expect(mine[0]?.type).toBe('intro')
  })
  it('has no speaking step anywhere any more', () => {
    for (const plan of [buildSession(pool, new Map(), '0.4', 'ro', { newPerSession: 5 }), buildPractice(pool, new Map(), '0.4', 'ro')])
      expect(plan.steps.every(s => s.type !== ('speak' as string))).toBe(true)
  })
})

describe('redo mode teaches then asks (D133)', () => {
  const legacy2 = (it: Item): [string, ItemState] => [it.ref.id,
    { id: it.ref.id, unitId: '0.4', kind: 'word', stage: 2, streak: 1, seen: 3, lastAt: 1, stageAtDayStart: 2, dayKey: '2000-01-01' }]
  it('gives an untaught word its intro *and* a question, presentations first', () => {
    const states = new Map([legacy2(voda), legacy2(stlp)])
    const plan = buildPractice([voda, stlp], states, '0.4', 'ro')
    expect(plan.steps.slice(0, 2).every(s => s.type === 'intro')).toBe(true)
    for (const id of ['word:voda', 'word:stĺp']) {
      const mine = plan.steps.filter(s => 'item' in s && s.item.ref.id === id)
      expect(mine.length, id).toBe(2)
      expect(mine[0].type, id).toBe('intro')
      expect(mine[1].type, id).not.toBe('intro')
    }
    const ids = plan.steps.map(s => ('item' in s ? s.item.ref.id : 'match'))
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1])
  })
})
