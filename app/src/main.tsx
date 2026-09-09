import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'
import { getSetting } from './db/db'
import { initLang } from './i18n'
import { initSfx } from './lib/sfx'

getSetting<'auto' | 'light' | 'dark'>('theme', 'auto').then(t => { document.documentElement.dataset.theme = t === 'auto' ? '' : t })
registerSW({ immediate: true })
if ('caches' in window) void caches.delete('audio')   // pre-D131 clips carried ~1 s of silence; the cache was renamed audio-v2
void initLang()
void initSfx()
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
