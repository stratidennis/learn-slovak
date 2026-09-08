import { describe, expect, it } from 'vitest'
import { STRINGS } from './strings'
describe('i18n', () => {
  it('ro and en have the same keys, and no empty strings', () => {
    const k = (o: object) => Object.keys(o).sort()
    expect(k(STRINGS.ro)).toEqual(k(STRINGS.en))
    for (const lang of ['ro', 'en'] as const) for (const [key, v] of Object.entries(STRINGS[lang]))
      if (typeof v === 'string') expect(v.length, `${lang}.${key}`).toBeGreaterThan(0)
    expect(Object.keys(STRINGS.ro.reg).sort()).toEqual(Object.keys(STRINGS.en.reg).sort())
  })
})
