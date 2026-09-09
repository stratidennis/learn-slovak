import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadGrammar, loadUnits } from '../../data/loader'
import type { GrammarNote, Unit } from '../../data/types'
import type { ItemState } from '../../engine/types'
import { getStates } from '../../engine/store'
import { kindCounts, lessonProgress, lessonsFor, nextLesson, type LessonProgress } from '../../engine/lessons'
import { fmt, useLang, useT } from '../../i18n'
import { coverFor } from '../../lib/covers'

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

const STATUS_ICON: Record<LessonProgress['status'], string | null> = { new: null, started: null, done: '✓', mastered: '★' }

/** A unit: its lesson road map (every lesson selectable, finished ones redoable — D129), chunks, grammar. */
export function UnitPage() {
  const { id = '' } = useParams()
  const t = useT(); const lang = useLang()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [notes, setNotes] = useState<GrammarNote[]>([])
  const [open, setOpen] = useState<GrammarNote | null>(null)
  const [states, setStates] = useState<Map<string, ItemState>>(new Map())
  useEffect(() => {
    loadUnits().then(us => setUnit(us.find(u => u.id === id) ?? null))
    loadGrammar().then(setNotes)
    getStates(id).then(setStates)
  }, [id])
  if (!unit) return <div className="page">{t.loading}</div>
  const unitNotes = unit.grammar_notes.map(n => notes.find(x => x.id === n)).filter(Boolean) as GrammarNote[]
  const canDo = lang === 'ro' && unit.can_do_ro?.length ? unit.can_do_ro : unit.can_do
  const title = lang === 'ro' ? unit.title_ro : unit.title
  const defs = lessonsFor(unit)
  const progress = defs.map(d => lessonProgress(d, states))
  const next = nextLesson(defs, states)
  const doneCount = progress.filter(p => p.status === 'done' || p.status === 'mastered').length
  const statusLabel = { new: t.lesson_status_new, started: t.lesson_status_started, done: t.lesson_status_done, mastered: t.lesson_status_mastered }
  const primaryTo = next ? `/unit/${unit.id}/lesson/${next.n}` : defs.length ? `/unit/${unit.id}/lesson/1` : `/unit/${unit.id}/lesson`
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/" className="back" aria-label={t.back}>←</Link><div><h1>{unit.id} {title}</h1>{defs.length > 0 && <div className="small muted">{fmt(t.lesson_progress, { done: doneCount, total: defs.length })}</div>}</div></div>
      {coverFor(unit.id) && <img className="hero" src={coverFor(unit.id)!} alt="" />}
      <div className="stack">
        <div className="row">
          {unit.chunks.length > 0 && <Link to={`/unit/${unit.id}/chunks`} className="btn ghost">🗣 {t.chunks_btn} · {unit.chunks.length}</Link>}
          <Link to={primaryTo} className="btn primary">{next ? `▶ ${next.n > 1 || progress[next.n - 1]?.status === 'started' ? t.continue_lesson : t.start_lesson}` : `↻ ${t.redo_lesson}`}</Link>
        </div>
        {defs.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 6px' }}><h3>{t.roadmap_title}</h3><p className="small muted" style={{ margin: '4px 0 0' }}>{t.roadmap_hint}</p></div>
            <ol className="road">
              {defs.map((l, k) => {
                const p = progress[k], isNext = next?.id === l.id
                return (
                  <li key={l.id}>
                    <Link to={`/unit/${unit.id}/lesson/${l.n}`} className={`road-item ${p.status} ${isNext ? 'next' : ''}`}>
                      <span className="node">{STATUS_ICON[p.status] ?? l.n}</span>
                      <span className="t">
                        <b>{t.lesson_word} {l.n}</b>
                        <small>{kindCounts(l).map(([kind, c]) => `${c} ${t.kinds[kind] ?? kind}`).join(' · ')}</small>
                        <span className="meter thin"><i style={{ width: `${Math.round(p.pct * 100)}%` }} /></span>
                        <small className={p.status === 'mastered' ? 'gold' : ''}>{statusLabel[p.status]}</small>
                      </span>
                      <span className="act">
                        {isNext ? <span className="btn primary sm">▶ {p.status === 'started' ? t.continue_lesson : t.start_lesson}</span>
                          : p.status === 'new' ? <span className="muted">›</span> : <span className="btn ghost sm">↻ {t.redo_lesson}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
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
