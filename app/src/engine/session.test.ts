import { describe, expect, it, vi } from 'vitest'
import type { Item, ItemState } from './types'

// store.ts pulls in Dexie; only dayKey is needed here
vi.mock('./store', () => ({ dayKey: (t = Date.now()) => new Date(t).toISOString().slice(0, 10) }))
const { buildSession, maxStageFor, stepFor } = await import('./session')

const item = (kind: Item['ref']['kind'], id: string, sk: string, ro: string): Item => ({
  ref: { kind, id }, sk, meaning: { ro, en: ro }, audio: `/audio/${id}.mp3`, audioSlow: null, spell: null, ipa: null, emoji: null, note: { ro: null, en: null },
})
const chunks = Array.from({ length: 20 }, (_, i) => item('chunk', `chk:1.1:${i}`, `Chunk číslo ${i}.`, `Bucata ${i}.`))
const dialogues = [
  item('dialogue', 'dlg:0.5:1-dobry-den', 'Dobrý deň.', 'Bună ziua.'),
  item('dialogue', 'dlg:0.5:2-dakujem', 'Ďakujem, dobre.', 'Mulțumesc, bine.'),
  item('dialogue', 'dlg:0.5:3-prosim', 'Prosím si kávu.', 'Aș dori o cafea.'),
  item('dialogue', 'dlg:0.5:4-nie', 'Nie.', 'Nu.'),
  item('dialogue', 'dlg:0.5:5-ano', 'Áno, prosím.', 'Da, te rog.'),
  item('dialogue', 'dlg:0.5:6-dovi', 'Dovidenia.', 'La revedere.'),
]
const all = [...chunks, ...dialogues]
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
const state = (it: Item, stage: number): ItemState => ({ id: it.ref.id, unitId: '0.5', kind: it.ref.kind, stage, streak: stage, seen: stage, lastAt: Date.now() - 86400000, stageAtDayStart: stage, dayKey: yesterday })
const states = new Map(chunks.map(c => [c.ref.id, state(c, 4)]))   // 20 mastered chunks, 6 new dialogues

describe('dialogue ladder', () => {
  it('masters at 3 in Phase 0 and 4 elsewhere', () => {
    expect(maxStageFor('dialogue', '0.5')).toBe(3)
    expect(maxStageFor('dialogue', '1.4')).toBe(4)
  })
  it('goes intro → reply (seen) → reply (heard) → tiles, with a one-word reply staying on reply', () => {
    const d = dialogues[2], one = dialogues[3]
    expect(stepFor(d, 0, all, 'ro')).toMatchObject({ type: 'intro' })
    const s1 = stepFor(d, 1, all, 'ro'); const s2 = stepFor(d, 2, all, 'ro'); const s3 = stepFor(d, 3, all, 'ro')
    expect(s1).toMatchObject({ type: 'reply', audioOnly: false }); expect(s2).toMatchObject({ type: 'reply', audioOnly: true })
    expect(s3).toMatchObject({ type: 'tiles' })
    expect(stepFor(one, 3, all, 'ro')).toMatchObject({ type: 'reply', audioOnly: true })
    expect(stepFor(d, 4, all, 'ro')).toBeNull()
  })
  it('offers four distinct replies including the right one, all dialogues', () => {
    const s = stepFor(dialogues[0], 1, all, 'ro')
    if (s?.type !== 'reply') throw new Error('expected a reply step')
    expect(s.options).toHaveLength(4)
    expect(s.options.map(o => o.ref.id)).toContain(dialogues[0].ref.id)
    expect(new Set(s.options.map(o => o.meaning.ro)).size).toBe(4)
    expect(s.options.every(o => o.ref.kind === 'dialogue')).toBe(true)
  })
})

describe('buildSession with dialogues', () => {
  it('presents the new dialogues, then drills them — never the same item twice in a row (D132)', () => {
    const plan = buildSession(all, states, '0.5', 'ro')
    expect(plan.newItems.map(i => i.ref.kind)).toEqual(['dialogue', 'dialogue', 'dialogue', 'dialogue'])
    // every new item still gets its intro, its seen-reply and its by-ear reply
    for (const it of plan.newItems) {
      const mine = plan.steps.filter(s => 'item' in s && s.item.ref.id === it.ref.id)
      expect(mine.some(s => s.type === 'intro')).toBe(true)
      expect(mine.some(s => s.type === 'reply' && !s.audioOnly)).toBe(true)
      expect(mine.some(s => s.type === 'reply' && s.audioOnly)).toBe(true)
      // the intro comes before any practice on that item
      const first = plan.steps.findIndex(s => 'item' in s && s.item.ref.id === it.ref.id)
      expect(plan.steps[first].type).toBe('intro')
    }
    expect(plan.steps.filter(s => s.type === 'reply' && s.audioOnly).length).toBe(4)
    const ids = plan.steps.map(s => ('item' in s ? s.item.ref.id : 'match'))
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1])
  })
})
