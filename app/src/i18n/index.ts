import { useLang } from './lang'
import { STRINGS, type Strings } from './strings'
export { fmt } from './strings'
export { useLang, setLang, getLang, initLang, type Lang } from './lang'
export function useT(): Strings { return STRINGS[useLang()] }
/** Content helpers: ONE language at a time. */
export function pick<T>(lang: 'ro' | 'en', ro: T | null | undefined, en: T | null | undefined): T | null | undefined {
  return lang === 'ro' ? (ro ?? en) : (en ?? ro)
}
