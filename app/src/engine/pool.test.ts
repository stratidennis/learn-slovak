import { describe, expect, it, vi } from 'vitest'
import type { Item } from './types'

vi.mock('../db/db', () => ({ db: {} }))
vi.mock('./store', () => ({ dayKey: () => '2026-09-09' }))
const { applyFilter, buildDeck, nextBoard } = await import('./pool')

const item = (kind: Item['ref']['kind'], id: string, sk: string, ro: string, unitId: string) => ({
  ref: { kind, id }, sk, meaning: { ro, en: ro }, audio: null, audioSlow: null, spell: null, ipa: null, emoji: null, note: { ro: null, en: null }, unitId,
})
const pool = [
  item('chunk', 'c1', 'Dobrý deň.', 'Bună ziua.', '1.1'), item('chunk', 'c2', 'Ďakujem.', 'Mulțumesc.', '1.1'), item('chunk', 'c3', 'Prosím.', 'Te rog.', '1.1'),
  item('sentence', 's1', 'Mám hlad.', 'Mi-e foame.', '1.4'), item('sentence', 's2', 'Kde je káva?', 'Unde e cafeaua?', '1.4'),
  item('sentence', 's3', 'Ďakujem pekne.', 'Mulțumesc.', '1.4'),   // same meaning as c2 → never on one board with it
  item('cognate', 'k1', 'stôl', 'masă', '0.3'),
]

describe('applyFilter', () => {
  it('empty filter = everything; kinds and units narrow it', () => {
    expect(applyFilter(pool, { kinds: [], units: [] })).toHaveLength(7)
    expect(applyFilter(pool, { kinds: ['chunk'], units: [] }).map(i => i.ref.id)).toEqual(['c1', 'c2', 'c3'])
    expect(applyFilter(pool, { kinds: [], units: ['1.4'] })).toHaveLength(3)
    expect(applyFilter(pool, { kinds: ['sentence'], units: ['1.1'] })).toHaveLength(0)
  })
})
describe('buildDeck', () => {
  it('caps and keeps every item once', () => {
    expect(buildDeck(pool, 3)).toHaveLength(3)
    const all = buildDeck(pool, 'all'); expect(all).toHaveLength(7); expect(new Set(all.map(i => i.ref.id)).size).toBe(7)
  })
})
describe('nextBoard', () => {
  it('never puts two items with the same meaning or Slovak on one board', () => {
    for (let k = 0; k < 20; k++) {
      const b = nextBoard(pool, new Set(), 'ro', 5)
      expect(b.length).toBeLessThanOrEqual(5)
      expect(new Set(b.map(i => i.meaning.ro.toLowerCase())).size).toBe(b.length)
      expect(new Set(b.map(i => i.sk.toLowerCase())).size).toBe(b.length)
    }
  })
  it('prefers unused items and falls back to used ones to fill the board', () => {
    const used = new Set(['c1', 'c2', 'c3', 's1'])
    const b = nextBoard(pool, used, 'ro', 5)
    expect(b.length).toBe(5)
    expect(b.filter(i => !used.has(i.ref.id)).length).toBeGreaterThanOrEqual(2)
  })
})
