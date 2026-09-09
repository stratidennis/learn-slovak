import { describe, expect, it, vi } from 'vitest'
import type { ItemState } from './types'

vi.mock('./store', () => ({ dayKey: (t = Date.now()) => new Date(t).toISOString().slice(0, 10) }))
const { lessonsFor, lessonProgress, nextLesson, lessonSize, kindCounts, markStates } = await import('./lessons')

const refs = (kind: string, n: number) => Array.from({ length: n }, (_, i) => ({ kind, id: `${kind}:${i}` }))
const unit = { id: '1.1', items: [...refs('chunk', 15), ...refs('dialogue', 7), ...refs('sentence', 24)] }   // the real 1.1 shape
const st = (id: string, kind: string, stage: number): [string, ItemState] => [id, { id, unitId: '1.1', kind: kind as ItemState['kind'], stage, streak: 0, seen: 1, lastAt: 1, stageAtDayStart: 0, dayKey: '' }]

describe('lessonsFor', () => {
  it('cuts a 46-item unit into six lessons of 7–8 that each mix the kinds', () => {
    const ls = lessonsFor(unit)
    expect(ls.length).toBe(6)
    expect(ls.map(l => l.refs.length).reduce((a, b) => a + b, 0)).toBe(46)
    for (const l of ls) {
      expect(l.refs.length).toBeGreaterThanOrEqual(7); expect(l.refs.length).toBeLessThanOrEqual(8)
      const kinds = new Set(l.refs.map(r => r.kind))
      expect(kinds.has('chunk')).toBe(true); expect(kinds.has('sentence')).toBe(true); expect(kinds.has('dialogue')).toBe(true)
    }
    expect(ls.map(l => l.id)).toEqual(['1.1/1', '1.1/2', '1.1/3', '1.1/4', '1.1/5', '1.1/6'])
  })
  it('is deterministic and keeps the declared order within a kind', () => {
    const a = lessonsFor(unit), b = lessonsFor(unit)
    expect(a).toEqual(b)
    const chunkOrder = a.flatMap(l => l.refs.filter(r => r.kind === 'chunk').map(r => r.id))
    expect(chunkOrder).toEqual(refs('chunk', 15).map(r => r.id))
  })
  it('gives recognition-only units ten per lesson: 46 letters → 5 lessons', () => {
    expect(lessonSize(['letter'])).toBe(10); expect(lessonSize(['chunk', 'dialogue'])).toBe(8)
    expect(lessonsFor({ id: '0.1', items: refs('letter', 46) }).length).toBe(5)
    expect(lessonsFor({ id: '0.3', items: refs('cognate', 84) }).length).toBe(9)
  })
  it('handles a unit with no items', () => { expect(lessonsFor({ id: 'x', items: [] })).toEqual([]) })
  it('counts kinds for the subtitle', () => { expect(kindCounts(lessonsFor(unit)[0])).toEqual([['chunk', 3], ['dialogue', 1], ['sentence', 4]]) })
})

describe('lessonProgress / nextLesson', () => {
  const ls = lessonsFor(unit)
  it('is new with no states, started after one intro, done when every item was seen, mastered at the top', () => {
    const l = ls[0]
    expect(lessonProgress(l, new Map()).status).toBe('new')
    expect(lessonProgress(l, new Map([st(l.refs[0].id, l.refs[0].kind, 1)])).status).toBe('started')
    const seen = new Map(l.refs.map(r => st(r.id, r.kind, 1)))
    expect(lessonProgress(l, seen)).toMatchObject({ status: 'done', seen: l.refs.length, mastered: 0 })
    const top = new Map(l.refs.map(r => st(r.id, r.kind, 9)))
    expect(lessonProgress(l, top)).toMatchObject({ status: 'mastered', pct: 1 })
  })
  it('points at the first unfinished lesson and at nothing once the unit is done', () => {
    const done1 = new Map(ls[0].refs.map(r => st(r.id, r.kind, 1)))
    expect(nextLesson(ls, done1)?.n).toBe(2)
    expect(nextLesson(ls, new Map())?.n).toBe(1)
    const all = new Map(ls.flatMap(l => l.refs.map(r => st(r.id, r.kind, 1))))
    expect(nextLesson(ls, all)).toBeNull()
  })
})

describe('markStates (manual marking, D130)', () => {
  const ls = lessonsFor(unit); const l = ls[0]
  it('done lifts every item to stage 1 and touches nothing already there', () => {
    const states = new Map([st(l.refs[0].id, l.refs[0].kind, 3)])
    const out = markStates(l, states, 'done', Date.UTC(2026, 8, 9))
    expect(out.length).toBe(l.refs.length - 1)
    expect(out.every(s => s.stage === 1 && s.seen === 1 && s.dayKey === '2026-09-09')).toBe(true)
    const after = new Map([...states, ...out.map(s => [s.id, s] as const)])
    expect(lessonProgress(l, after).status).toBe('done')
  })
  it('mastered sets each item to its own top stage (chunks 6, dialogues 4 outside phase 0)', () => {
    const out = markStates(l, new Map(), 'mastered')
    expect(out.find(s => s.kind === 'chunk')?.stage).toBe(6)
    expect(out.find(s => s.kind === 'dialogue')?.stage).toBe(4)
    expect(lessonProgress(l, new Map(out.map(s => [s.id, s]))).status).toBe('mastered')
  })
  it('never lowers: marking done on a mastered lesson changes nothing', () => {
    const top = new Map(l.refs.map(r => st(r.id, r.kind, 9)))
    expect(markStates(l, top, 'done')).toEqual([])
  })
})
