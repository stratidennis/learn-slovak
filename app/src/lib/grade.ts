import { stripDiacritics, tokenize } from './normalize'

export type Tier = 'ok' | 'warn' | 'bad' | 'missing' | 'extra'
export type GradedToken = { ref: string | null; typed: string | null; tier: Tier }
export type Grade = { tokens: GradedToken[]; pass: boolean; nBad: number; nWarn: number; exact: boolean }

/**
 * Token-level alignment with three costs: exact 0, diacritics-only 0.4, different 1.
 * `pass` = every reference word is present, allowing diacritic slips (the lenient tier).
 * Strictness is decided by the caller from the card's maturity.
 */
export function grade(reference: string, typed: string, strict = false): Grade {
  const R = tokenize(reference), T = tokenize(typed)
  const cost = (a: string, b: string) => a === b ? 0 : stripDiacritics(a) === stripDiacritics(b) ? 0.4 : 1
  const n = R.length, m = T.length
  const D: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) D[i][0] = i
  for (let j = 1; j <= m; j++) D[0][j] = j
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    D[i][j] = Math.min(D[i - 1][j - 1] + cost(R[i - 1], T[j - 1]), D[i - 1][j] + 1, D[i][j - 1] + 1)
  const out: GradedToken[] = []
  let i = n, j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + cost(R[i - 1], T[j - 1])) {
      const c = cost(R[i - 1], T[j - 1])
      out.push({ ref: R[i - 1], typed: T[j - 1], tier: c === 0 ? 'ok' : c < 1 ? 'warn' : 'bad' }); i--; j--
    } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { out.push({ ref: R[i - 1], typed: null, tier: 'missing' }); i-- }
    else { out.push({ ref: null, typed: T[j - 1], tier: 'extra' }); j-- }
  }
  out.reverse()
  const nBad = out.filter(t => t.tier === 'bad' || t.tier === 'missing' || t.tier === 'extra').length
  const nWarn = out.filter(t => t.tier === 'warn').length
  return { tokens: out, nBad, nWarn, exact: nBad === 0 && nWarn === 0, pass: nBad === 0 && (!strict || nWarn === 0) }
}
