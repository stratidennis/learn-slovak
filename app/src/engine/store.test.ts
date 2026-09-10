import { describe, expect, it, vi } from 'vitest'
import type { ItemState } from './types'

vi.mock('../db/db', () => ({ db: {} }))
vi.mock('./items', () => ({ loadUnitById: async () => undefined, loadUnitItems: async () => [] }))
vi.mock('../srs/scheduler', () => ({ newCard: () => ({}) }))
const { advance, dayKey } = await import('./store')

const st = (stage: number, over?: Partial<ItemState>): ItemState => ({
  id: 'x', unitId: '0.3', kind: 'cognate', stage, streak: 0, seen: 0, lastAt: 0,
  stageAtDayStart: stage, dayKey: dayKey(), ...over,
})

describe('advance', () => {
  it('climbs one rung per correct answer, with no daily ceiling (D136)', () => {
    // the ladders are 5 and 6 rungs deep now; a 2-per-day cap made a lesson unfinishable and made a
    // same-day redo advance nothing at all
    const s = st(0)
    for (const expected of [1, 2, 3, 4, 5]) { advance(s, true, 5); expect(s.stage).toBe(expected) }
  })
  it('stops at the top of the ladder', () => {
    const s = st(5)
    advance(s, true, 5); advance(s, true, 5)
    expect(s.stage).toBe(5)
  })
  it('drops one rung on a miss but never below 1, and resets the streak', () => {
    const s = st(4, { streak: 3 })
    advance(s, false, 5); expect(s.stage).toBe(3); expect(s.streak).toBe(0)
    advance(s, false, 5); advance(s, false, 5); advance(s, false, 5)
    expect(s.stage).toBe(1)
  })
  it('a whole lesson can be finished in one day', () => {
    const s = st(0)
    let steps = 0
    while (s.stage < 5 && steps < 20) { advance(s, true, 5); steps++ }
    expect(s.stage).toBe(5); expect(steps).toBe(5)
    expect(s.dayKey).toBe(dayKey())
  })
  it('records the day and the stage it started that day on', () => {
    const s = st(2, { dayKey: '2000-01-01', stageAtDayStart: 0 })
    advance(s, true, 5)
    expect(s.dayKey).toBe(dayKey()); expect(s.stageAtDayStart).toBe(2); expect(s.seen).toBe(1)
  })
})
