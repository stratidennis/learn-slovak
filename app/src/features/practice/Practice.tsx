import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, getSetting } from '../../db/db'
import { loadLearnedPool } from '../../engine/pool'
import { fmt, useT } from '../../i18n'

/** The practice hub (D129): reusable, generative exercises over everything already learned. */
export function Practice() {
  const t = useT()
  const [due, setDue] = useState(0)
  const [available, setAvailable] = useState<number | null>(null)
  const [best, setBest] = useState(0)
  useEffect(() => {
    db.cards.where('due').below(Date.now()).count().then(setDue)
    loadLearnedPool().then(p => setAvailable(p.items.length))
    getSetting('matchBest', 0).then(setBest)
  }, [])
  const empty = available === 0
  return (
    <div className="page fade">
      <div className="topbar"><div><h1>{t.practice_title}</h1><div className="small muted">{t.practice_hint}</div></div></div>
      <div className="stack">
        {empty && <div className="card small tint">{t.practice_empty}</div>}
        <Link to="/review" className="card hub" style={{ color: 'inherit' }}>
          <span className="ico">🔁</span>
          <span className="t"><b>{t.review_card_title}{due > 0 && <span className="badge" style={{ marginLeft: 8 }}>{due}</span>}</b><small>{t.review_card_hint}</small></span>
          <span className="muted">›</span>
        </Link>
        <Link to="/practice/flashcards" className={`card hub ${empty ? 'off' : ''}`} style={{ color: 'inherit' }}>
          <span className="ico">🃏</span>
          <span className="t"><b>{t.flashcards_title}</b><small>{t.flashcards_hint}</small>{available != null && <small className="muted">{fmt(t.pool_available, { n: available })}</small>}</span>
          <span className="muted">›</span>
        </Link>
        <Link to="/practice/match" className={`card hub ${empty ? 'off' : ''}`} style={{ color: 'inherit' }}>
          <span className="ico">⚡</span>
          <span className="t"><b>{t.match_title}</b><small>{t.match_hint}</small>{best > 0 && <small className="muted">{t.match_best}: {fmt(t.match_pairs, { n: best })}</small>}</span>
          <span className="muted">›</span>
        </Link>
      </div>
    </div>
  )
}
