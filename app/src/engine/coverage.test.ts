// Every section, checked against the REAL content (D138). The 0.4 words fell out of practice (D137) and the
// whole of Phase 0 never reached Recap because each feature kept its own idea of which kinds count. These
// tests walk every unit in public/content/units.json, pretend every lesson is finished, and require that
// every item can be practised and recapped. A new section or a new kind that breaks this fails here.
import { describe, expect, it, vi } from 'vitest'
import type { Unit } from '../data/types'
import type { Item, ItemState } from './types'

vi.mock('../db/db', () => ({ db: {} }))
// the shipped content, bundled by Vite at test time; fetch('/content/x.json') is served from it
const CONTENT = import.meta.glob('../../public/content/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
vi.stubGlobal('fetch', async (url: string) => {
  const body = CONTENT[`../../public${url}`]
  return body === undefined ? { ok: false, status: 404, json: async () => { throw new Error('404') } } : { ok: true, status: 200, json: async () => body }
})
const { loadUnitItems } = await import('./items')
const { lessonsFor, learnedIds, markStates } = await import('./lessons')
const { maxStageFor } = await import('./session')
const { KIND_PRACTICE, ALL_KINDS } = await import('./kinds')
const { CARD_KINDS, MATCH_KINDS } = await import('./pool')
const { enrol, recapEntries } = await import('../srs/recap')
const { newItemCard } = await import('../srs/scheduler')

const units = CONTENT['../../public/content/units.json'] as Unit[]
const loaded = await Promise.all(units.map(async u => ({ unit: u, items: await loadUnitItems(u) })))
/** Every lesson of the unit marked done (stage 1, taught under the current intro card). */
const allDone = (u: Unit): Map<string, ItemState> => {
  const states = new Map<string, ItemState>()
  for (const l of lessonsFor(u)) for (const s of markStates(l, states, 'done')) states.set(s.id, s)
  return states
}
const refIds = (u: Unit) => [...new Set(((u as Unit & { items?: { id: string }[] }).items ?? []).map(r => r.id))]

describe('the kind table', () => {
  it('names every kind the content uses, and says why whenever it leaves one out', () => {
    for (const { items } of loaded) for (const it of items) expect(ALL_KINDS).toContain(it.ref.kind)
    for (const k of ALL_KINDS) {
      const p = KIND_PRACTICE[k]
      if (!p.card || !p.match) expect(p.why, `${k} is left out of practice without a reason`).toBeTruthy()
    }
    expect(CARD_KINDS).toContain('word')         // the D137 regression, pinned
    expect(MATCH_KINDS).toContain('word')
  })
})

describe.each(loaded.map(x => [x.unit.id, x] as const))('unit %s', (_id, { unit, items }) => {
  it('resolves every item it lists', () => {
    const got = new Set(items.map(it => it.ref.id))
    expect(refIds(unit).filter(id => !got.has(id))).toEqual([])
  })
  it('once its lessons are done, every item is learned — so it reaches Practice and Recap', () => {
    const learned = learnedIds(unit, allDone(unit))
    expect(items.filter(it => !learned.has(it.ref.id)).map(it => it.ref.id)).toEqual([])
  })
  it('every card-able item has both sides (Slovak + a meaning in RO and EN)', () => {
    const bad = items.filter(it => KIND_PRACTICE[it.ref.kind].card && !(it.sk.trim() && it.meaning.ro.trim() && it.meaning.en.trim()))
    expect(bad.map(it => it.ref.id)).toEqual([])
  })
  it('every item gets a Recap card and a real question at every stage of its ladder', () => {
    const states = allDone(unit)
    const cards = enrol(items.map(it => ({ id: it.ref.id, kind: it.ref.kind, unitId: unit.id, lastAt: 0 })), new Set(), [])
    expect(new Set(cards.map(c => c.id))).toEqual(new Set(items.map(it => it.ref.id)))
    const broken: string[] = []
    for (const it of items) {
      const top = maxStageFor(it.ref.kind, unit.id)
      for (let stage = 1; stage <= top; stage++) for (const stability of [0, 30]) for (const r of [0, 0.5, 0.99]) {
        const card = { ...newItemCard(it.ref, unit.id, 0), fsrs: { ...newItemCard(it.ref, unit.id, 0).fsrs, stability } }
        const st = { ...states.get(it.ref.id)!, stage }
        const entries = recapEntries(it, st, card, items as Item[], 'ro', () => r)
        const q = entries[entries.length - 1]?.step
        if (!q || q.type === 'intro' || !('item' in q) || q.item.ref.id !== it.ref.id) broken.push(`${it.ref.id}@${stage}`)
      }
    }
    expect([...new Set(broken)]).toEqual([])
  })
})
