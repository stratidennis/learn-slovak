import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'
import { getSetting } from './db/db'
import { initLang } from './i18n'
import { initSfx, warmSfx } from './lib/sfx'

getSetting<'auto' | 'light' | 'dark'>('theme', 'auto').then(t => { document.documentElement.dataset.theme = t === 'auto' ? '' : t })
// An installed PWA can keep serving the cached shell for days: he saw a fix that had already shipped.
// autoUpdate installs the new worker and claims the page; reload once when that happens so the running
// tab is never older than the worker (D136).
const hadWorker = typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller
let reloading = false
navigator.serviceWorker?.addEventListener?.('controllerchange', () => {
  if (!hadWorker || reloading) return          // first install claims the page too; that one is not stale
  reloading = true
  location.reload()
})
registerSW({ immediate: true })
if ('caches' in window) void caches.delete('audio')   // pre-D131 clips carried ~1 s of silence; the cache was renamed audio-v2
void initLang()
void initSfx()
warmSfx()
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
