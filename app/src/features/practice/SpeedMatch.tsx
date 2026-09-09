import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSetting, setSetting } from '../../db/db'
import { applyFilter, loadLearnedPool, MATCH_KINDS, nextBoard, type Pool, type PoolFilter, type PoolItem } from '../../engine/pool'
import { playAudio, stopAudio } from '../../components/AudioButton'
import { fmt, useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'
import { PoolPicker } from './PoolPicker'

const ROUND_S = 60
const EMPTY: PoolFilter = { kinds: [], units: [] }
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** Speed match (D129): sixty seconds of pairing Slovak with its meaning. Boards of five refill as
 *  they are cleared; the score is the number of pairs; the best score is kept. */
export function SpeedMatch() {
  const t = useT(); const lang = useLang()
  const [pool, setPool] = useState<Pool | null>(null)
  const [filter, setFilter] = useState<PoolFilter>(EMPTY)
  const [stage, setStage] = useState<'setup' | 'run' | 'done'>('setup')
  const [best, setBest] = useState(0)
  const [board, setBoard] = useState<PoolItem[]>([])
  const [left, setLeft] = useState<PoolItem[]>([]); const [right, setRight] = useState<PoolItem[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [gone, setGone] = useState<Set<string>>(new Set())
  const [shake, setShake] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [left_s, setLeftS] = useState(ROUND_S)
  const used = useRef<Set<string>>(new Set())
  const endAt = useRef(0); const lastTick = useRef(-1)
  useEffect(() => () => stopAudio(), [])
  useEffect(() => {
    loadLearnedPool(MATCH_KINDS).then(setPool)
    getSetting<PoolFilter>('practiceFilter', EMPTY).then(setFilter)
    getSetting('matchBest', 0).then(setBest)
  }, [])
  const selected = useMemo(() => pool ? applyFilter(pool.items, filter) : [], [pool, filter])
  const changeFilter = (f: PoolFilter) => { setFilter(f); void setSetting('practiceFilter', f) }

  const deal = (items: PoolItem[]) => {
    stopAudio()
    const b = nextBoard(items, used.current, lang)
    for (const it of b) used.current.add(it.ref.id)
    if (used.current.size >= items.length) used.current.clear()
    setBoard(b); setLeft(shuffle(b)); setRight(shuffle(b)); setGone(new Set()); setSel(null)
  }
  const start = () => {
    used.current.clear(); setScore(0); setLeftS(ROUND_S); lastTick.current = -1
    endAt.current = Date.now() + ROUND_S * 1000
    deal(selected); setStage('run'); sfx.tap()
  }
  // the clock
  useEffect(() => {
    if (stage !== 'run') return
    const id = window.setInterval(() => {
      const ms = endAt.current - Date.now(), s = Math.max(0, Math.ceil(ms / 1000))
      setLeftS(s)
      if (s <= 5 && s > 0 && s !== lastTick.current) { lastTick.current = s; sfx.tick() }
      if (ms <= 0) { window.clearInterval(id); sfx.timeup(); setStage('done') }
    }, 100)
    return () => window.clearInterval(id)
  }, [stage])
  useEffect(() => { if (stage === 'done' && score > best) { setBest(score); void setSetting('matchBest', score) } }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  const pickLeft = (it: PoolItem) => { if (gone.has(it.ref.id)) return; sfx.tap(); setSel(it.ref.id); if (it.audio) void playAudio(it.audio) }
  const pickRight = (it: PoolItem) => {
    if (!sel || gone.has(it.ref.id)) return
    if (it.ref.id === sel) {
      sfx.pop(); const g = new Set(gone); g.add(it.ref.id); setGone(g); setSel(null); setScore(s => s + 1)
      if (g.size >= board.length) window.setTimeout(() => deal(selected), 250)
    } else { sfx.wrong(); setShake(it.ref.id); window.setTimeout(() => setShake(null), 400); setSel(null) }
  }
  const meaning = (it: PoolItem) => lang === 'ro' ? it.meaning.ro : it.meaning.en

  if (!pool) return <div className="page">{t.loading}</div>
  if (stage === 'setup') return (
    <div className="page fade">
      <div className="topbar"><Link to="/practice" className="back" aria-label={t.back}>←</Link><div><h1>{t.match_title}</h1><div className="small muted">{t.match_hint}</div></div></div>
      {pool.items.length === 0 ? <div className="card small">{t.practice_empty}</div> : (
        <div className="stack">
          <div className="card"><PoolPicker pool={pool} filter={filter} onChange={changeFilter} kinds={MATCH_KINDS} selectedCount={selected.length} /></div>
          {selected.length < 5 && <div className="card small tint">{t.match_need}</div>}
          {best > 0 && <p className="small muted center" style={{ margin: 0 }}>{t.match_best}: {fmt(t.match_pairs, { n: best })}</p>}
          <button className="btn primary block" onClick={start} disabled={selected.length < 5}>⚡ {t.match_go}</button>
        </div>
      )}
    </div>
  )
  if (stage === 'done') return (
    <div className="page fade"><div className="card center">
      <h2>{t.match_timeup}</h2>
      <p style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: '6px 0' }}>{score}</p>
      <p className="muted">{fmt(t.match_result, { n: score, s: ROUND_S })}</p>
      <p className="small muted">{t.match_best}: {fmt(t.match_pairs, { n: Math.max(best, score) })}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn primary" onClick={start}>↻ {t.play_again}</button>
        <button className="btn ghost" onClick={() => setStage('setup')}>{t.back}</button>
      </div>
    </div></div>
  )
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/practice" className="back" aria-label={t.back}>✕</Link>
        <div style={{ flex: 1 }}><div className={`timerbar ${left_s <= 5 ? 'hot' : ''}`}><i style={{ width: `${(left_s / ROUND_S) * 100}%` }} /></div></div>
        <span className="mono" style={{ minWidth: 36, textAlign: 'right' }}>{left_s}s</span>
        <span className="badge" style={{ fontSize: '.95rem', padding: '4px 12px' }}>{score}</span></div>
      <div className="board">
        <div className="stack" style={{ gap: 8 }}>{left.map(it => <button key={it.ref.id} className={`choice ${gone.has(it.ref.id) ? 'gone' : sel === it.ref.id ? 'sel' : ''}`} onClick={() => pickLeft(it)} disabled={gone.has(it.ref.id)}><span className="sk">{it.sk}</span></button>)}</div>
        <div className="stack" style={{ gap: 8 }}>{right.map(it => <button key={it.ref.id} className={`choice ${gone.has(it.ref.id) ? 'gone' : shake === it.ref.id ? 'bad' : ''}`} onClick={() => pickRight(it)} disabled={gone.has(it.ref.id)}>{meaning(it)}</button>)}</div>
      </div>
    </div>
  )
}
