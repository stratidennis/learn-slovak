import { describe, expect, it, vi } from 'vitest'
import { Rating } from 'ts-fsrs'

vi.mock('../db/db', () => ({ db: {} }))
const { enrol, pickBatch, recapRung, ratingForResult, DAILY_NEW } = await import('./recap')

const DAY = 24 * 60 * 60 * 1000
const noon = new Date(2026, 8, 23, 12, 0, 0).getTime()
const cand = (id: string, unitId: string, lastAt: number, kind = 'word') => ({ id, kind, unitId, lastAt })

describe('enrol', () => {
  it('adds a card for every taught item that has none, and only once', () => {
    const out = enrol([cand('a', '0.4', noon - 5 * DAY), cand('a', '0.4', noon - 5 * DAY), cand('b', '0.4', noon - 5 * DAY), cand('c', '0.4', 0)], new Set(['c']), [], noon)
    expect(out.map(c => c.id).sort()).toEqual(['a', 'b'])
    expect(out.every(c => c.mode === 'item' && c.reps === 0 && c.kind === 'word' && c.unitId === '0.4')).toBe(true)
  })
  it('first shows an item a day after it was last worked on, never earlier', () => {
    const [old] = enrol([cand('a', '0.1', noon - 30 * DAY)], new Set(), [], noon)
    expect(old.due).toBe(noon)                                   // long ago → due now
    const [fresh] = enrol([cand('b', '0.4', noon - 60_000)], new Set(), [], noon)
    expect(fresh.due).toBe(noon - 60_000 + DAY)                  // just drilled → tomorrow
    expect(fresh.fsrs.due.getTime()).toBe(fresh.due)
  })
  it('paces a backfill: at most DAILY_NEW first reviews on any day, counting cards already waiting', () => {
    const many = Array.from({ length: 100 }, (_, k) => cand(`x${k}`, k % 2 ? '0.1' : '0.3', noon - 10 * DAY))
    const waiting = Array.from({ length: 10 }, () => noon - DAY)  // ten new cards already due today
    const out = enrol(many, new Set(), waiting, noon)
    const perDay = new Map<number, number>()
    const today = new Date(noon); today.setHours(0, 0, 0, 0)
    for (const c of out) { const d = Math.floor((c.due - today.getTime()) / DAY); perDay.set(d, (perDay.get(d) ?? 0) + 1) }
    expect(perDay.get(0)).toBe(DAILY_NEW - 10)
    expect([...perDay.values()].every(n => n <= DAILY_NEW)).toBe(true)
    expect(out).toHaveLength(100)
  })
  it('interleaves units, so a day of recap is not one section in a row', () => {
    const out = enrol([...Array.from({ length: 5 }, (_, k) => cand(`l${k}`, '0.1', k)), ...Array.from({ length: 5 }, (_, k) => cand(`w${k}`, '0.4', k))], new Set(), [], noon)
    expect(out.slice(0, 4).map(c => c.unitId)).toEqual(['0.1', '0.4', '0.1', '0.4'])
  })
})

describe('pickBatch', () => {
  it('mixes every unit into a sitting even when all cards share one due time', () => {
    const cards = enrol(['0.1', '0.2', '0.3', '0.4'].flatMap(u => Array.from({ length: 30 }, (_, k) => cand(`${u}-${k}`, u, 0))), new Set(), [], noon, 1000)
    const sortedLikeTheStore = [...cards].sort((a, b) => a.id.localeCompare(b.id))   // ties come back in id order
    const batch = pickBatch(sortedLikeTheStore, 20)
    expect(batch).toHaveLength(20)
    for (const u of ['0.1', '0.2', '0.3', '0.4']) expect(batch.filter(c => c.unitId === u)).toHaveLength(5)
  })
  it('takes the most overdue card of a unit first', () => {
    const [a, b] = enrol([cand('late', '0.4', 0), cand('later', '0.4', 0)], new Set(), [], noon)
    expect(pickBatch([{ ...a, due: noon }, { ...b, due: noon - DAY }], 1)[0].id).toBe('later')
  })
})

describe('recapRung', () => {
  it('asks a climbing item its next rung', () => {
    expect(recapRung(2, 6, 0)).toBe(2)
    expect(recapRung(0, 6, 0)).toBe(1)
  })
  it('asks a strong mastered item its hardest real rung (or the one below)', () => {
    expect(recapRung(6, 6, 30, () => 0)).toBe(5)
    expect(recapRung(6, 6, 30, () => 0.9)).toBe(4)
  })
  it('asks a young or lapsed mastered item any real rung', () => {
    const seen = new Set(Array.from({ length: 50 }, (_, k) => recapRung(5, 5, 1, () => k / 50)))
    expect([...seen].sort()).toEqual([1, 2, 3, 4])
  })
  it('keeps one-rung ladders (sound pairs) on their only rung', () => {
    expect(recapRung(1, 1, 30)).toBe(1)
    expect(recapRung(1, 1, 0)).toBe(1)
  })
})

describe('ratingForResult', () => {
  it('maps verdicts to FSRS grades', () => {
    expect(ratingForResult({ correct: false })).toBe(Rating.Again)
    expect(ratingForResult({ correct: true, tier: 'diacritics' })).toBe(Rating.Hard)
    expect(ratingForResult({ correct: true })).toBe(Rating.Good)
  })
})
