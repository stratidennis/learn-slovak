import { useSyncExternalStore } from 'react'
import { getSetting, setSetting } from '../db/db'

export type Lang = 'ro' | 'en'
let current: Lang = 'ro'
const subs = new Set<() => void>()
export function getLang(): Lang { return current }
export function setLang(l: Lang) { current = l; document.documentElement.lang = l; void setSetting('uiLang', l); subs.forEach(f => f()) }
export function useLang(): Lang {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb) }, () => current, () => current)
}
/** call once at startup */
export async function initLang() {
  const saved = await getSetting<Lang | null>('uiLang', null)
  current = saved ?? (navigator.language.toLowerCase().startsWith('ro') ? 'ro' : 'en')
  document.documentElement.lang = current
  subs.forEach(f => f())
}
