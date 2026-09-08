import { useEffect, useState } from 'react'
import { getSetting, setSetting } from '../db/db'
import { fmt, useT } from '../i18n'
type T = 'auto' | 'light' | 'dark'
const NEXT: Record<T, T> = { auto: 'light', light: 'dark', dark: 'auto' }
const ICON: Record<T, string> = { auto: '🌓', light: '☀️', dark: '🌙' }
export function applyTheme(t: T) { document.documentElement.dataset.theme = t === 'auto' ? '' : t }
/** auto follows the phone (light by day, dark at night if the OS is scheduled); tap to force one. */
export function ThemeToggle() {
  const s = useT()
  const [t, setT] = useState<T>('auto')
  useEffect(() => { getSetting<T>('theme', 'auto').then(setT) }, [])
  const cycle = () => { const n = NEXT[t]; setT(n); applyTheme(n); void setSetting('theme', n) }
  return <button className="theme-toggle" onClick={cycle} title={fmt(s.theme_title, { t })} aria-label={fmt(s.theme_title, { t })}>{ICON[t]}</button>
}
