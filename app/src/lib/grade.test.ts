import { describe, expect, it } from 'vitest'
import { grade } from './grade'

describe('grade (listen → type)', () => {
  it('exact match passes with no warnings', () => {
    const g = grade('Prosím si kávu.', 'prosím si kávu')
    expect(g.exact).toBe(true); expect(g.pass).toBe(true); expect(g.tokens.map(t => t.tier)).toEqual(['ok', 'ok', 'ok'])
  })
  it('diacritics slip is a warning, passes when lenient, fails when strict', () => {
    const lenient = grade('Prosím si kávu.', 'prosim si kavu')
    expect(lenient.nWarn).toBe(2); expect(lenient.nBad).toBe(0); expect(lenient.pass).toBe(true); expect(lenient.exact).toBe(false)
    expect(grade('Prosím si kávu.', 'prosim si kavu', true).pass).toBe(false)
  })
  it('a wrong case ending is bad, not a diacritics slip', () => {
    const g = grade('Prosím si kávu.', 'prosím si káva')
    expect(g.tokens[2].tier).toBe('bad'); expect(g.pass).toBe(false)
  })
  it('missing and extra words are reported in place', () => {
    const g = grade('Dáte si ešte niečo?', 'dáte si niečo')
    expect(g.tokens.find(t => t.tier === 'missing')?.ref).toBe('ešte'); expect(g.pass).toBe(false)
    const g2 = grade('Dáte si niečo?', 'dáte si ešte niečo')
    expect(g2.tokens.find(t => t.tier === 'extra')?.typed).toBe('ešte')
  })
  it('ignores punctuation and case', () => {
    expect(grade('„Chcem ísť domov.“ „Ja tiež.“', 'chcem ísť domov ja tiež').exact).toBe(true)
  })
  it('empty answer marks every word missing', () => {
    const g = grade('Ako sa máš?', '')
    expect(g.tokens.every(t => t.tier === 'missing')).toBe(true); expect(g.nBad).toBe(3)
  })
})
