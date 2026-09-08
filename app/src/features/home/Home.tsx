import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCoverage, loadUnits } from '../../data/loader'
import type { Unit } from '../../data/types'
import { db } from '../../db/db'
import { CoverageMeter } from '../../components/CoverageMeter'
import { ThemeToggle } from '../../components/ThemeToggle'
import { LanguageToggle } from '../../components/LanguageToggle'
import { fmt, useLang, useT } from '../../i18n'
import { maxStageFor } from '../../engine/session'

type Stats = { due: Record<string, number>; dueAll: number; known: number; learning: number; coverage: number; chunksSeen: Record<string, number>; mastered: Record<string, number> }

export function Home() {
  const t = useT()
  const [units, setUnits] = useState<Unit[]>([])
  const [st, setSt] = useState<Stats | null>(null)
  useEffect(() => {
    loadUnits().then(setUnits)
    ;(async () => {
      const [cards, lemmas, chunks, cov, itemRows, unitList] = await Promise.all([db.cards.toArray(), db.lemmas.toArray(), db.chunks.toArray(), loadCoverage(), db.items.toArray(), loadUnits()])
      const now = Date.now(), due: Record<string, number> = {}, chunksSeen: Record<string, number> = {}, mastered: Record<string, number> = {}
      for (const r of itemRows) if (r.stage >= maxStageFor(r.kind, r.unitId)) mastered[r.unitId] = (mastered[r.unitId] ?? 0) + 1
      void unitList
      for (const c of cards) if (c.due <= now) due[c.unitId] = (due[c.unitId] ?? 0) + 1
      for (const c of chunks) chunksSeen[c.unitId] = (chunksSeen[c.unitId] ?? 0) + 1
      // coverage: known lemmas count fully, learning ones half (research §10.1 Progress)
      let w = 0
      for (const l of lemmas) w += (cov[l.lemma] ?? 0) * (l.status === 'known' ? 1 : 0.5)
      setSt({ due, dueAll: Object.values(due).reduce((a, b) => a + b, 0), known: lemmas.filter(l => l.status === 'known').length,
              learning: lemmas.filter(l => l.status === 'learning').length, coverage: w * 100, chunksSeen, mastered })
    })()
  }, [])
  const phases = [...new Set(units.map(u => u.phase))]
  const lang = useLang()
  // the first unit that is not fully mastered gets the "Start / Continue" button
  const nextUnit = units.find(u => (u.items?.length ?? 0) > 0 && (st?.mastered[u.id] ?? 0) < (u.items?.length ?? 0))?.id
  return (
    <div className="page fade">
      <div className="topbar between" style={{ justifyContent: 'space-between' }}><h1>{t.app}</h1><div className="row"><LanguageToggle /><ThemeToggle /></div></div>
      <div className="row" style={{ marginBottom: 12 }}><Link to="/alphabet" className="btn ghost" style={{ minHeight: 40, padding: '6px 14px' }}>Aa 🔊 {t.alphabet_btn}</Link></div>
      <div className="card">
        <CoverageMeter pct={st?.coverage ?? 0} label={t.coverage_label} />
        <div className="row between small muted" style={{ marginTop: 10 }}>
          <span>{st?.known ?? 0} {t.known} · {st?.learning ?? 0} {t.learning}</span>
          {st && st.dueAll > 0 ? <Link to="/review" className="btn primary" style={{ minHeight: 40, padding: '8px 16px' }}>{fmt(t.review_due, { n: st.dueAll })}</Link> : <span>{t.nothing_due}</span>}
        </div>
      </div>
      {phases.map(p => (
        <section key={p} style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>{t.phase} {p} <span className="muted" style={{ fontWeight: 400, fontSize: '1rem' }}>— {t.phase_names[p]}</span></h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {units.filter(u => u.phase === p).map(u => {
              const total = u.items?.length ?? 0, done = st?.mastered[u.id] ?? 0
              const isNext = u.id === nextUnit
              return (
                <Link key={u.id} to={isNext ? `/unit/${u.id}/lesson` : `/unit/${u.id}`} className={`unit ${total && done >= total ? 'done' : ''}`} style={{ color: 'inherit', borderTop: '1px solid var(--line)' }}>
                  <div className="num">{u.id}</div>
                  <div className="t"><b>{lang === 'ro' ? u.title_ro : u.title}</b>{total > 0 && <small>{done}/{total} {t.items_word}</small>}</div>
                  {isNext ? <span className="btn primary" style={{ minHeight: 36, padding: '6px 14px', fontSize: '.9rem' }}>▶ {done ? t.continue_lesson : t.start_lesson}</span>
                    : st?.due[u.id] ? <span className="badge">{st.due[u.id]}</span> : <span className="muted">›</span>}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
