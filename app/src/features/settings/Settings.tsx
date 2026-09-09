import { useEffect, useState } from 'react'
import { db, exportAll, getSetting, importAll, setSetting } from '../../db/db'
import { fmt, useT } from '../../i18n'
import { LanguageToggle } from '../../components/LanguageToggle'
import { setSfxEnabled, sfx } from '../../lib/sfx'

export function Settings() {
  const t = useT()
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto')
  const [perSession, setPerSession] = useState(8)
  const [guide, setGuide] = useState<'off' | 'ro' | 'ipa' | 'both'>('ro')
  const [speaking, setSpeaking] = useState(true)
  const [speechCheck, setSpeechCheck] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [counts, setCounts] = useState({ cards: 0, reviews: 0, lemmas: 0 })
  const [msg, setMsg] = useState('')
  useEffect(() => {
    getSetting<'auto' | 'light' | 'dark'>('theme', 'auto').then(setTheme)
    getSetting('newPerSession', 8).then(setPerSession)
    getSetting<'off' | 'ro' | 'ipa' | 'both'>('pronunciation', 'ro').then(setGuide)
    getSetting('speaking', true).then(setSpeaking); getSetting('speechCheck', true).then(setSpeechCheck); getSetting('sounds', true).then(setSounds)
    ;(async () => setCounts({ cards: await db.cards.count(), reviews: await db.reviews.count(), lemmas: await db.lemmas.count() }))()
  }, [])
  const applyTheme = (th: typeof theme) => { setTheme(th); void setSetting('theme', th); document.documentElement.dataset.theme = th === 'auto' ? '' : th }
  const doExport = async () => {
    const blob = new Blob([JSON.stringify(await exportAll())], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `learn-slovak-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    setMsg(t.exported)
  }
  const doImport = async (f: File | undefined) => {
    if (!f) return
    try { await importAll(JSON.parse(await f.text())); setMsg(t.imported); setTimeout(() => location.reload(), 600) }
    catch (e) { setMsg(t.import_failed + (e as Error).message) }
  }
  const themeLabel = { auto: t.theme_auto, light: t.theme_light, dark: t.theme_dark }
  const guideLabel = { ro: t.pron_ro, ipa: t.pron_ipa, both: t.pron_both, off: t.pron_off }
  return (
    <div className="page fade">
      <div className="topbar"><h1>{t.settings}</h1></div>
      <div className="stack">
        <div className="card"><div className="row between"><h3>{t.language}</h3><LanguageToggle /></div><p className="small muted" style={{ margin: '8px 0 0' }}>{t.language_hint}</p></div>
        <div className="card"><h3>{t.theme}</h3><p className="small muted" style={{ margin: '4px 0 0' }}>{t.theme_hint}</p><div className="row" style={{ marginTop: 10 }}>
          {(['auto', 'light', 'dark'] as const).map(th => <button key={th} className={`btn ${theme === th ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => applyTheme(th)}>{themeLabel[th]}</button>)}</div></div>
        <div className="card"><h3>{t.pron_title}</h3>
          <div className="row" style={{ marginTop: 10 }}>{(['ro', 'ipa', 'both', 'off'] as const).map(k =>
            <button key={k} className={`btn ${guide === k ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setGuide(k); void setSetting('pronunciation', k) }}>{guideLabel[k]}</button>)}</div>
          <p className="small muted" style={{ marginBottom: 0 }}>{fmt(t.pron_hint, { ex: 'PROsiim si CAAvu' })}</p></div>
        <div className="card"><h3>{t.sounds_title}</h3>
          <div className="row" style={{ marginTop: 10 }}>{([true, false] as const).map(v => <button key={String(v)} className={`btn ${sounds === v ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setSounds(v); setSfxEnabled(v); void setSetting('sounds', v); if (v) sfx.correct() }}>{v ? t.on : t.off}</button>)}</div>
          <p className="small muted" style={{ marginBottom: 0 }}>{t.sounds_hint}</p></div>
        <div className="card"><h3>{t.speaking_title}</h3>
          <div className="row" style={{ marginTop: 10 }}>{([true, false] as const).map(v => <button key={String(v)} className={`btn ${speaking === v ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setSpeaking(v); void setSetting('speaking', v) }}>{v ? t.on : t.off}</button>)}</div>
          <p className="small muted">{t.speaking_hint}</p>
          <div className="row between" style={{ alignItems: 'center' }}><span style={{ flex: 1 }}>{t.speech_check}</span>
            <div className="row">{([true, false] as const).map(v => <button key={String(v)} className={`btn ${speechCheck === v ? 'primary' : 'ghost'}`} style={{ minHeight: 36, padding: '6px 12px' }} disabled={!speaking} onClick={() => { setSpeechCheck(v); void setSetting('speechCheck', v) }}>{v ? t.on : t.off}</button>)}</div></div>
          <p className="small muted" style={{ marginBottom: 0 }}>{t.speech_check_hint}</p></div>
        <div className="card"><h3>{t.new_per_lesson}</h3>
          <div className="row" style={{ marginTop: 10 }}>{[4, 8, 12, 16].map(n => <button key={n} className={`btn ${perSession === n ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setPerSession(n); void setSetting('newPerSession', n) }}>{n}</button>)}</div>
          <p className="small muted" style={{ marginBottom: 0 }}>{t.new_per_hint}</p></div>
        <div className="card"><h3>{t.your_data}</h3>
          <p className="small muted">{fmt(t.data_hint, counts)}</p>
          <div className="row"><button className="btn primary" onClick={doExport}>{t.export}</button>
            <label className="btn ghost">{t.import}<input type="file" accept="application/json" hidden onChange={e => doImport(e.target.files?.[0])} /></label></div>
          {msg && <p className="small" style={{ marginBottom: 0 }}>{msg}</p>}</div>
        <div className="card small muted"><h3 style={{ color: 'var(--ink)' }}>{t.sources}</h3>
          <p>{t.sources_text}</p>
          <p style={{ marginBottom: 0 }}>{t.personal_use}</p></div>
      </div>
    </div>
  )
}
