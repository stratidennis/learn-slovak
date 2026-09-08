import { useEffect, useState } from 'react'
import { db, exportAll, getSetting, importAll, setSetting } from '../../db/db'

export function Settings() {
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto')
  const [perSession, setPerSession] = useState(8)
  const [counts, setCounts] = useState({ cards: 0, reviews: 0, lemmas: 0 })
  const [msg, setMsg] = useState('')
  useEffect(() => {
    getSetting<'auto' | 'light' | 'dark'>('theme', 'auto').then(setTheme)
    getSetting('newPerSession', 8).then(setPerSession)
    ;(async () => setCounts({ cards: await db.cards.count(), reviews: await db.reviews.count(), lemmas: await db.lemmas.count() }))()
  }, [])
  const applyTheme = (t: typeof theme) => { setTheme(t); void setSetting('theme', t); document.documentElement.dataset.theme = t === 'auto' ? '' : t }
  const doExport = async () => {
    const blob = new Blob([JSON.stringify(await exportAll())], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `learn-slovak-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    setMsg('Exported. Keep the file somewhere safe — it is the only copy of your progress.')
  }
  const doImport = async (f: File | undefined) => {
    if (!f) return
    try { await importAll(JSON.parse(await f.text())); setMsg('Imported. Reloading…'); setTimeout(() => location.reload(), 600) }
    catch (e) { setMsg('Import failed: ' + (e as Error).message) }
  }
  return (
    <div className="page fade">
      <div className="topbar"><h1>Settings</h1></div>
      <div className="stack">
        <div className="card"><h3>Theme</h3><div className="row" style={{ marginTop: 10 }}>
          {(['auto', 'light', 'dark'] as const).map(t => <button key={t} className={`btn ${theme === t ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => applyTheme(t)}>{t}</button>)}</div></div>
        <div className="card"><h3>New sentences per lesson</h3>
          <div className="row" style={{ marginTop: 10 }}>{[4, 8, 12, 16].map(n => <button key={n} className={`btn ${perSession === n ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setPerSession(n); void setSetting('newPerSession', n) }}>{n}</button>)}</div>
          <p className="small muted" style={{ marginBottom: 0 }}>Reviews always come first. Lower this if reviews take more than 15 minutes.</p></div>
        <div className="card"><h3>Your data</h3>
          <p className="small muted">{counts.cards} cards · {counts.reviews} reviews · {counts.lemmas} lemmas. Everything lives in this browser — no account, no cloud. Export regularly.</p>
          <div className="row"><button className="btn primary" onClick={doExport}>Export JSON</button>
            <label className="btn ghost">Import JSON<input type="file" accept="application/json" hidden onChange={e => doImport(e.target.files?.[0])} /></label></div>
          {msg && <p className="small" style={{ marginBottom: 0 }}>{msg}</p>}</div>
        <div className="card small muted"><h3 style={{ color: 'var(--ink)' }}>Sources & licences</h3>
          <p>Sentences: <b>Tatoeba</b> contributors, CC BY 2.0 FR · Dictionary: English Wiktionary via <b>kaikki.org</b>, CC BY-SA 3.0 · Paradigms & spell-check: <b>hunspell-sk</b> (sk-spell), MPL-2.0 · Audio: <b>Piper</b> voice sk_SK-lili-medium · Syllabus: <b>Studia Academica Slovaca</b>, Univerzita Komenského, <i>Témy a ciele A1/A2</i>, CC BY-NC-SA 4.0 · Illustrations: <b>unDraw</b> · Chunks, glosses and notes are drafts by this project and are marked <span className="chip" style={{ ['--c' as string]: 'var(--warning-deep)' }}>draft</span> until a native speaker reviews them.</p>
          <p style={{ marginBottom: 0 }}>Personal, non-commercial use.</p></div>
      </div>
    </div>
  )
}
