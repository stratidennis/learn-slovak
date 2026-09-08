import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadGrammar, loadUnits } from '../../data/loader'
import type { GrammarNote, Unit } from '../../data/types'
import { useLang, useT } from '../../i18n'

function Md({ text }: { text: string }) {
  // enough markdown for the notes: paragraphs, **bold**, *italic*
  const html = text.split(/\n\s*\n/).map(p => '<p>' + p.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, ' ') + '</p>').join('')
  return <div className="note-body" dangerouslySetInnerHTML={{ __html: html }} />
}

export function GrammarNoteView({ note, onClose }: { note: GrammarNote; onClose: () => void }) {
  const t = useT(); const lang = useLang()
  const title = lang === 'ro' && note.title_ro ? note.title_ro : note.title
  const body = lang === 'ro' && note.body_ro ? note.body_ro : note.body
  // the Romanian version weaves the analogy into the text; the English one shows it as a callout
  const showAnalogy = lang === 'en' && note.ro_analogy
  const table = lang === 'ro' && note.table_ro ? note.table_ro : note.table
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="popover fade" role="dialog" style={{ maxHeight: '85dvh' }}>
        <div className="row between"><h3>{title}</h3><button className="btn ghost" onClick={onClose} aria-label={t.close}>✕</button></div>
        <div style={{ marginTop: 12 }}><Md text={body} /></div>
        {showAnalogy && <p style={{ background: 'var(--secondary-soft)', padding: '10px 14px', borderRadius: 12 }}>🇷🇴 <b>{t.romanian_analogy}:</b> {note.ro_analogy}</p>}
        {table && (
          <table className="table"><tbody>
            {table.map((row, i) => <tr key={i}>{row.map((c, j) => i === 0 ? <th key={j}>{c}</th> : <td key={j} className={j === 0 ? 'muted' : 'sk'} style={{ fontSize: '1rem' }}>{c}</td>)}</tr>)}
          </tbody></table>
        )}
        {note.examples.length > 0 && <ul style={{ paddingLeft: 18 }}>{note.examples.map((e, i) => <li key={i} className="sk">{e}</li>)}</ul>}
      </div>
    </>
  )
}

export function UnitPage() {
  const { id = '' } = useParams()
  const t = useT(); const lang = useLang()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [notes, setNotes] = useState<GrammarNote[]>([])
  const [open, setOpen] = useState<GrammarNote | null>(null)
  useEffect(() => {
    loadUnits().then(us => setUnit(us.find(u => u.id === id) ?? null))
    loadGrammar().then(setNotes)
  }, [id])
  if (!unit) return <div className="page">{t.loading}</div>
  const unitNotes = unit.grammar_notes.map(n => notes.find(x => x.id === n)).filter(Boolean) as GrammarNote[]
  const canDo = lang === 'ro' && unit.can_do_ro?.length ? unit.can_do_ro : unit.can_do
  const title = lang === 'ro' ? unit.title_ro : unit.title
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/" className="back" aria-label={t.back}>←</Link><div><h1>{unit.id} {title}</h1></div></div>
      <div className="stack">
        <div className="row">
          {unit.chunks.length > 0 && <Link to={`/unit/${unit.id}/chunks`} className="btn secondary">🗣 {t.chunks_btn} · {unit.chunks.length}</Link>}
          <Link to={`/unit/${unit.id}/lesson`} className="btn primary">🎧 {t.listen_type_btn}</Link>
        </div>
        <div className="card">
          <h3>{t.you_will}</h3>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>{canDo.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {unit.sas_area && <p className="small muted" style={{ marginBottom: 0 }}>{t.sas}: {unit.sas_area}</p>}
        </div>
        {unitNotes.length > 0 && (
          <div className="card"><h3>{t.grammar_when}</h3>
            <div className="row" style={{ marginTop: 10 }}>{unitNotes.map(n => <button key={n.id} className="btn ghost" style={{ minHeight: 40 }} onClick={() => setOpen(n)}>{lang === 'ro' && n.title_ro ? n.title_ro : n.title}</button>)}</div>
          </div>
        )}
        {(unit.roleplay || unit.creative || unit.milestone) && (
          <div className="card small">
            {unit.roleplay && <p>🎭 {t.roleplay}: <b>{unit.roleplay}</b> — {t.roleplay_hint}</p>}
            {unit.creative && <p>✨ {t.creative}: {unit.creative}</p>}
            {unit.milestone && <p style={{ marginBottom: 0 }}>🏁 {t.gate}: {unit.milestone}</p>}
          </div>
        )}
      </div>
      {open && <GrammarNoteView note={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
