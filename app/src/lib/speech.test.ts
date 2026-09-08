import { describe, expect, it } from 'vitest'
import { bestMatch, matchScore } from './speech'
describe('speech match', () => {
  it('ignores diacritics and punctuation', () => { expect(matchScore('Prosím si kávu.', 'prosim si kavu').score).toBe(1) })
  it('allows one typo on longer words', () => { expect(matchScore('Ďakujem pekne.', 'dakujem pekna').score).toBe(1) })
  it('counts missing words', () => { const m = matchScore('Bolí ma hlava.', 'boli hlava'); expect(m.score).toBeCloseTo(2 / 3); expect(m.hits).toEqual([true, false, true]) })
  it('does not match short words loosely', () => { expect(matchScore('Áno.', 'ale').score).toBe(0) })
  it('picks the best alternative', () => { expect(bestMatch('Nerozumiem.', ['ne rozumiem', 'nerozumiem', 'nero']).heard).toBe('nerozumiem') })
})
