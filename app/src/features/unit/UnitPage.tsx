import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadGrammar, loadUnits } from '../../data/loader'
import type { GrammarNote, Unit } from '../../data/types'

function Md({ text }: { text: string }) {
  // enough markdown for the notes: paragraphs, **bold**, *italic*
  const html = text.split(/\n\s*\n/).map(p => '<p>' + p.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, ' ') + '</p>').join('')
  return <div className="note-body" dangerouslySetInnerHTML={{ __html: html }} />
}

export function GrammarNoteView({ note, onClose }: { note: GrammarNote; onClose: () => void }) {
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="popover fade" role="dialog" style={{ maxHeight: '85dvh' }}>
        <div className="row between"><h3>{note.title}</h3><button className="btn ghost" onClick={onClose}>✕</button></div>
        <div style={{ marginTop: 12 }}><Md text={note.body} /></div>
        {note.ro_analogy && <p style={{ background: 'var(--secondary-soft)', padding: '10px 14px', borderRadius: 12 }}>🇷🇴 <b>Romanian:</b> {note.ro_analogy}</p>}
        {note.table && (
          <table className="table"><tbody>
            {note.table.map((row, i) => <tr key={i}>{row.map((c, j) => i === 0 ? <th key={j}>{c}</th> : <td key={j} className={j === 0 ? 'muted' : 'sk'} style={{ fontSize: '1rem' }}>{c}</td>)}</tr>)}
          </tbody></table>
        )}
        {note.examples.length > 0 && <ul style={{ paddingLeft: 18 }}>{note.examples.map((e, i) => <li key={i} className="sk">{e}</li>)}</ul>}
      </div>
    </>
  )
}

export function UnitPage() {
  const { id = '' } = useParams()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [notes, setNotes] = useState<GrammarNote[]>([])
  const [open, setOpen] = useState<GrammarNote | null>(null)
  useEffect(() => {
    loadUnits().then(us => setUnit(us.find(u => u.id === id) ?? null))
    loadGrammar().then(setNotes)
  }, [id])
  if (!unit) return <div className="page">…</div>
  const unitNotes = unit.grammar_notes.map(n => notes.find(x => x.id === n)).filter(Boolean) as GrammarNote[]
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/" className="back" aria-label="Back">←</Link><div><h1>{unit.id} {unit.title}</h1><div className="muted">{unit.title_ro}</div></div></div>
      <div className="stack">
        <div className="row">
          {unit.chunks.length > 0 && <Link to={`/unit/${unit.id}/chunks`} className="btn secondary">🗣 Chunks · {unit.chunks.length}</Link>}
          <Link to={`/unit/${unit.id}/lesson`} className="btn primary">🎧 Listen & type</Link>
        </div>
        <div className="card">
          <h3>You will be able to…</h3>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>{unit.can_do.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {unit.sas_area && <p className="small muted" style={{ marginBottom: 0 }}>SAS: {unit.sas_area}</p>}
        </div>
        {unitNotes.length > 0 && (
          <div className="card"><h3>Grammar, when you need it</h3>
            <div className="row" style={{ marginTop: 10 }}>{unitNotes.map(n => <button key={n.id} className="btn ghost" style={{ minHeight: 40 }} onClick={() => setOpen(n)}>{n.title}</button>)}</div>
          </div>
        )}
        {(unit.roleplay || unit.creative || unit.milestone) && (
          <div className="card small">
            {unit.roleplay && <p>🎭 Roleplay: <b>{unit.roleplay}</b> — render with <span className="mono">pipeline.render_prompt</span> and paste into ChatGPT.</p>}
            {unit.creative && <p>✨ Creative: {unit.creative}</p>}
            {unit.milestone && <p style={{ marginBottom: 0 }}>🏁 Gate: {unit.milestone}</p>}
          </div>
        )}
      </div>
      {open && <GrammarNoteView note={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
