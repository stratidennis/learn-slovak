import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSetting, setSetting } from '../../db/db'
import { letterSeq } from '../../engine/items'
import { applyFilter, buildDeck, CARD_KINDS, loadLearnedPool, type Pool, type PoolFilter, type PoolItem } from '../../engine/pool'
import { AudioButton, playAudio, playSequence, stopAudio } from '../../components/AudioButton'
import { Pic } from '../../components/Pic'
import { Pronunciation } from '../../components/Pronunciation'
import { fmt, useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'
import { PoolPicker } from './PoolPicker'

type Dir = 'sk' | 'meaning' | 'mixed'
type Size = 10 | 20 | 40 | 'all'
type Card = { item: PoolItem; front: 'sk' | 'meaning' }
const EMPTY: PoolFilter = { kinds: [], units: [] }

/** Flashcards (D129): a shuffled deck from completed lessons; see one side, flip, judge yourself.
 *  "Didn't know" brings the card back once at the end. Never touches the mastery ladder. */
export function Flashcards() {
  const t = useT(); const lang = useLang()
  const [pool, setPool] = useState<Pool | null>(null)
  const [filter, setFilter] = useState<PoolFilter>(EMPTY)
  const [dir, setDir] = useState<Dir>('sk')
  const [size, setSize] = useState<Size>(20)
  const [stage, setStage] = useState<'setup' | 'run' | 'done'>('setup')
  const [deck, setDeck] = useState<Card[]>([])
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ ok: 0, bad: 0 })
  const again = useRef<Set<string>>(new Set())
  useEffect(() => () => stopAudio(), [])
  useEffect(() => {
    loadLearnedPool(CARD_KINDS).then(setPool)
    getSetting<PoolFilter>('practiceFilter', EMPTY).then(setFilter)
    getSetting<Dir>('flashDir', 'sk').then(setDir); getSetting<Size>('flashSize', 20).then(setSize)
  }, [])
  const selected = useMemo(() => pool ? applyFilter(pool.items, filter) : [], [pool, filter])
  const changeFilter = (f: PoolFilter) => { setFilter(f); void setSetting('practiceFilter', f) }

  const start = () => {
    const items = buildDeck(selected, size)
    setDeck(items.map(it => ({ item: it, front: dir === 'mixed' ? (Math.random() < 0.5 ? 'sk' : 'meaning') : dir })))
    again.current.clear(); setStats({ ok: 0, bad: 0 }); setI(0); setFlipped(false); setStage('run'); sfx.tap()
  }
  const card = deck[i]
  const showingSk = card ? (card.front === 'sk') !== flipped : false
  // the Slovak side speaks when it comes into view
  useEffect(() => {
    if (stage !== 'run' || !card || !showingSk) return
    const seq = letterSeq(card.item)
    if (seq && seq.length > 1) void playSequence(seq, 350); else if (card.item.audio) void playAudio(card.item.audio)
  }, [i, flipped, stage]) // eslint-disable-line react-hooks/exhaustive-deps
  const flip = () => { if (!card) return; sfx.pop(); setFlipped(f => !f) }
  const judge = (ok: boolean) => {
    if (!card) return
    stopAudio()
    if (ok) sfx.correct(); else sfx.wrong()
    setStats(s => ({ ok: s.ok + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) }))
    let d = deck
    if (!ok && !again.current.has(card.item.ref.id)) { again.current.add(card.item.ref.id); d = [...deck, card]; setDeck(d) }
    setFlipped(false)                       // a new card always starts on its front
    if (i + 1 >= d.length) { sfx.complete(); setStage('done') } else setI(i + 1)
  }

  if (!pool) return <div className="page">{t.loading}</div>
  if (stage === 'setup') return (
    <div className="page fade">
      <div className="topbar"><Link to="/practice" className="back" aria-label={t.back}>←</Link><div><h1>{t.flashcards_title}</h1><div className="small muted">{t.flashcards_hint}</div></div></div>
      {pool.items.length === 0 ? <div className="card small">{t.practice_empty}</div> : (
        <div className="stack">
          <div className="card"><PoolPicker pool={pool} filter={filter} onChange={changeFilter} kinds={CARD_KINDS} selectedCount={selected.length} /></div>
          <div className="card">
            <b className="small">{t.direction}</b>
            <div className="row" style={{ marginTop: 6 }}>{(['sk', 'meaning', 'mixed'] as Dir[]).map(d => <button key={d} className={`btn ${dir === d ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setDir(d); void setSetting('flashDir', d) }}>{d === 'sk' ? t.dir_sk_first : d === 'meaning' ? t.dir_meaning_first : t.dir_mixed}</button>)}</div>
            <b className="small" style={{ display: 'block', marginTop: 12 }}>{t.deck_size}</b>
            <div className="row" style={{ marginTop: 6 }}>{([10, 20, 40, 'all'] as Size[]).map(s => <button key={String(s)} className={`btn ${size === s ? 'primary' : 'ghost'}`} style={{ minHeight: 40 }} onClick={() => { setSize(s); void setSetting('flashSize', s) }}>{s === 'all' ? t.deck_all : s}</button>)}</div>
          </div>
          <button className="btn primary block" onClick={start} disabled={selected.length === 0}>▶ {t.start}</button>
        </div>
      )}
    </div>
  )
  if (stage === 'done' || !card) return (
    <div className="page fade"><div className="card center">
      <h2>{t.deck_done}</h2>
      <p className="muted">{fmt(t.deck_summary, { ok: stats.ok, bad: stats.bad })}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn primary" onClick={start}>↻ {t.play_again}</button>
        <button className="btn ghost" onClick={() => setStage('setup')}>{t.back}</button>
      </div>
    </div></div>
  )
  const it = card.item, x = it.dialogue
  const meaning = lang === 'ro' ? it.meaning.ro : it.meaning.en
  const face = (side: 'sk' | 'meaning') => side === 'sk' ? (
    <div className="fc-body">
      {x && <div className="small muted" style={{ marginBottom: 8 }}>🗣️ {x.a.sk}</div>}
      {it.emoji && !x && <Pic emoji={it.emoji} size={56} />}
      <div className="sk big" style={{ fontSize: it.ref.kind === 'letter' ? '4rem' : it.sk.length > 40 ? '1.4rem' : '1.9rem' }}>{it.sk}</div>
      {it.ref.kind === 'letter' ? <div className="small muted">{t.letter_spell_name}: <b>{it.spell}</b>{it.letter?.example && it.letter.example !== '—' && <> · <span className="sk">{it.letter.example}</span></>}</div> : <Pronunciation ro={it.spell} ipa={it.ipa} />}
    </div>
  ) : (
    <div className="fc-body">
      {x && <div className="small muted" style={{ marginBottom: 8 }}>🗣️ {lang === 'ro' ? x.a.ro : x.a.en} — <i>{t.what_answer}</i></div>}
      {it.emoji && !x && <Pic emoji={it.emoji} size={56} />}
      <div style={{ fontSize: meaning.length > 40 ? '1.2rem' : '1.5rem' }}>{meaning}</div>
    </div>
  )
  return (
    <div className="page fade" key={`${i}-${card.item.ref.id}`}>
      <div className="topbar"><Link to="/practice" className="back" aria-label={t.back}>✕</Link><div className="progress"><i style={{ width: `${(i / Math.max(1, deck.length)) * 100}%` }} /></div><span className="muted small">{i + 1}/{deck.length}</span></div>
      {/* exactly one face is in the DOM: the shown side follows `flipped` and nothing else; keyed so the turn animation replays */}
      <button className={`fc ${flipped ? 'back' : ''}`} onClick={flip} aria-label={t.flip_hint} key={`${i}-${flipped ? 'b' : 'f'}`}>
        <div className="fc-face">{face(flipped ? (card.front === 'sk' ? 'meaning' : 'sk') : card.front)}</div>
      </button>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
        {showingSk && it.audio ? <AudioButton src={it.audio} seq={letterSeq(it)} slowSrc={it.audioSlow} /> : <span className="small muted">{t.flip_hint}</span>}
      </div>
      {flipped ? (
        <div className="row" style={{ gap: 10, marginTop: 16 }}>
          <button className="btn no" style={{ flex: 1 }} onClick={() => judge(false)}>✗ {t.didnt_know}</button>
          <button className="btn yes" style={{ flex: 1 }} onClick={() => judge(true)}>✓ {t.knew_it}</button>
        </div>
      ) : <button className="btn ghost block" style={{ marginTop: 16 }} onClick={flip}>↩ {t.flip_hint}</button>}
    </div>
  )
}
