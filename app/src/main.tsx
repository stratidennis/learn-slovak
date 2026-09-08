import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'
import { getSetting } from './db/db'
import { initLang } from './i18n'

getSetting<'auto' | 'light' | 'dark'>('theme', 'auto').then(t => { document.documentElement.dataset.theme = t === 'auto' ? '' : t })
registerSW({ immediate: true })
void initLang()
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
