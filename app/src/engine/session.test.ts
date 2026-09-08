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

describe('buildSession with dialogues and speaking', () => {
  it('introduces the new dialogues and queues a reply step right after each intro', () => {
    const plan = buildSession(all, states, '0.5', 'ro', { speaking: true })
    expect(plan.newItems.map(i => i.ref.kind)).toEqual(['dialogue', 'dialogue', 'dialogue', 'dialogue'])
    plan.steps.forEach((s, i) => {
      if (s.type === 'intro' && s.item.ref.kind === 'dialogue') expect(plan.steps[i + 1]).toMatchObject({ type: 'reply', audioOnly: false, item: { ref: { id: s.item.ref.id } } })
    })
    expect(plan.steps.filter(s => s.type === 'reply' && s.audioOnly).length).toBe(4)   // the second appearance, by ear
  })
  it('adds up to two say-it steps on recognised items only, never on new ones or pairs', () => {
    const plan = buildSession(all, states, '0.5', 'ro', { speaking: true })
    const speak = plan.steps.filter(s => s.type === 'speak')
    expect(speak.length).toBeGreaterThanOrEqual(1); expect(speak.length).toBeLessThanOrEqual(2)
    for (const s of speak) {
      if (s.type !== 'speak') continue
      expect(plan.newItems).not.toContain(s.item)
      expect(states.get(s.item.ref.id)!.stage).toBeGreaterThanOrEqual(2)
      expect(['chunk', 'sentence', 'dialogue', 'cognate']).toContain(s.item.ref.kind)
    }
    const idx = plan.steps.findIndex(s => s.type === 'speak')
    expect(idx).toBeGreaterThanOrEqual(2)   // never the opening step
  })
  it('has no say-it steps when speaking is off', () => {
    const plan = buildSession(all, states, '0.5', 'ro', { speaking: false })
    expect(plan.steps.some(s => s.type === 'speak')).toBe(false)
  })
})
