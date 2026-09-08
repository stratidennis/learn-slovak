import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCoverage, loadUnits } from '../../data/loader'
import type { Unit } from '../../data/types'
import { db } from '../../db/db'
import { CoverageMeter } from '../../components/CoverageMeter'
import { ThemeToggle } from '../../components/ThemeToggle'

type Stats = { due: Record<string, number>; dueAll: number; known: number; learning: number; coverage: number; chunksSeen: Record<string, number> }
const PHASE = ['Sounds & script', 'Survival', 'The sentence engine', 'Domain tracks', 'Native input']

export function Home() {
  const [units, setUnits] = useState<Unit[]>([])
  const [st, setSt] = useState<Stats | null>(null)
  useEffect(() => {
    loadUnits().then(setUnits)
    ;(async () => {
      const [cards, lemmas, chunks, cov] = await Promise.all([db.cards.toArray(), db.lemmas.toArray(), db.chunks.toArray(), loadCoverage()])
      const now = Date.now(), due: Record<string, number> = {}, chunksSeen: Record<string, number> = {}
      for (const c of cards) if (c.due <= now) due[c.unitId] = (due[c.unitId] ?? 0) + 1
      for (const c of chunks) chunksSeen[c.unitId] = (chunksSeen[c.unitId] ?? 0) + 1
      // coverage: known lemmas count fully, learning ones half (research §10.1 Progress)
      let w = 0
      for (const l of lemmas) w += (cov[l.lemma] ?? 0) * (l.status === 'known' ? 1 : 0.5)
      setSt({ due, dueAll: Object.values(due).reduce((a, b) => a + b, 0), known: lemmas.filter(l => l.status === 'known').length,
              learning: lemmas.filter(l => l.status === 'learning').length, coverage: w * 100, chunksSeen })
    })()
  }, [])
  const phases = [...new Set(units.map(u => u.phase))]
  return (
    <div className="page fade">
      <div className="topbar between" style={{ justifyContent: 'space-between' }}><h1>Slovenčina</h1><div className="row"><Link to="/alphabet" className="btn ghost" style={{ minHeight: 40, padding: '6px 14px' }}>Aa 🔊 Alphabet</Link><ThemeToggle /></div></div>
      <div className="card">
        <CoverageMeter pct={st?.coverage ?? 0} />
        <div className="row between small muted" style={{ marginTop: 10 }}>
          <span>{st?.known ?? 0} known · {st?.learning ?? 0} learning</span>
          {st && st.dueAll > 0 ? <Link to="/review" className="btn primary" style={{ minHeight: 40, padding: '8px 16px' }}>Review {st.dueAll} due</Link> : <span>nothing due 🎉</span>}
        </div>
      </div>
      {phases.map(p => (
        <section key={p} style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Phase {p} <span className="muted" style={{ fontWeight: 400, fontSize: '1rem' }}>— {PHASE[p]}</span></h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {units.filter(u => u.phase === p).map(u => {
              const seen = st?.chunksSeen[u.id] ?? 0, total = u.chunks.length
              return (
                <Link key={u.id} to={`/unit/${u.id}`} className={`unit ${total && seen >= total ? 'done' : ''}`} style={{ color: 'inherit', borderTop: '1px solid var(--line)' }}>
                  <div className="num">{u.id}</div>
                  <div className="t"><b>{u.title}</b><small>{u.title_ro}{total ? ` · ${seen}/${total} chunks` : ''}</small></div>
                  {st?.due[u.id] ? <span className="badge">{st.due[u.id]}</span> : <span className="muted">›</span>}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
