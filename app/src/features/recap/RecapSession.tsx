import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Item, ItemState, StepResult } from '../../engine/types'
import { loadUnitById, loadUnitItems } from '../../engine/items'
import { introVersion, maxStageFor, roundRobin } from '../../engine/session'
import { advance, getStates, newState, saveState } from '../../engine/store'
import { shuffle } from '../../engine/distractors'
import { db, type CardRow } from '../../db/db'
import { dueCards, review, updateLemmas } from '../../srs/scheduler'
import { pickBatch, questionAt, ratingForResult, recapEntries, syncRecap, type RecapEntry } from '../../srs/recap'
import { stopAudio } from '../../components/AudioButton'
import { fmt, useLang, useT } from '../../i18n'
import { DONE_COVER, WINNER_COVER } from '../../lib/covers'
import { sfx } from '../../lib/sfx'
import { StepView } from '../lesson/StepView'

type Loaded = { entries: RecapEntry[]; cards: Map<string, CardRow>; items: Map<string, Item>; pools: Map<string, Item[]>; states: Map<string, ItemState>; left: number; next: CardRow | null }

/** Recap (D138): whatever is due, from every section, each asked with the same exercises the lessons use.
 *  One FSRS review per card per sitting; a miss comes back once at the end as practice, one rung lower. */
export function RecapSession() {
  const t = useT(); const lang = useLang()
  const [data, setData] = useState<Loaded | null>(null)
  const [entries, setEntries] = useState<RecapEntry[]>([])
  const [i, setI] = useState(0)
  const [result, setResult] = useState<StepResult | null>(null)
  const [stats, setStats] = useState({ ok: 0, bad: 0 })
  const [round, setRound] = useState(0)
  const requeued = useRef(new Set<string>())
  useEffect(() => () => stopAudio(), [])

  useEffect(() => {
    (async () => {
      await syncRecap()
      const due = await dueCards()
      const unitIds = [...new Set(due.map(c => c.unitId))]
      const items = new Map<string, Item>(), pools = new Map<string, Item[]>(), states = new Map<string, ItemState>()
      await Promise.all(unitIds.map(async u => {
        const unit = await loadUnitById(u); if (!unit) return
        const its = await loadUnitItems(unit)
        pools.set(u, its); for (const it of its) items.set(it.ref.id, it)
        for (const [id, st] of await getStates(u)) states.set(id, st)
      }))
      // cards whose item no longer exists in the content are skipped, not shown broken
      const usable = due.filter(c => items.has(c.id))
      const batch = pickBatch(usable)
      const queues = shuffle(batch).map(c => recapEntries(items.get(c.id)!, states.get(c.id), c, pools.get(c.unitId) ?? [], lang))
      const list = roundRobin(queues)     // intros (if any) first, then the questions
      const upcoming = usable.length ? null : (await db.cards.orderBy('due').first()) ?? null
      setData({ entries: list, cards: new Map(batch.map(c => [c.id, c])), items, pools, states, left: usable.length - batch.length, next: upcoming })
      setEntries(list); setI(0); setResult(null); setStats({ ok: 0, bad: 0 }); requeued.current.clear()
    })()
  }, [round, lang])

  const entry = entries[i]
  useEffect(() => { if (data && entries.length && !entries[i]) sfx.complete() }, [data, entries, i])

  const onAnswer = async (r: StepResult) => {
    if (!entry || !data || result) return
    const { step } = entry
    const it = 'item' in step ? step.item : null
    if (!it) return
    const st = data.states.get(it.ref.id) ?? newState(it.ref, entry.unitId)
    if (step.type === 'intro') {
      st.stage = Math.max(st.stage, 1); st.seen++; st.lastAt = Date.now(); st.intro = introVersion(it.ref.kind)
      data.states.set(it.ref.id, st); await saveState(st)
      next(); return
    }
    sfx.result(r.correct, r.tier)
    setResult(r)
    setStats(s => r.correct ? { ...s, ok: s.ok + 1 } : { ...s, bad: s.bad + 1 })
    if (entry.practiceOnly) return
    const card = data.cards.get(entry.cardId)
    if (!card) return
    const rating = ratingForResult(r)
    const updated = await review(card, rating)
    data.cards.set(card.id, updated)
    const tier = r.tier ?? (r.correct ? 'exact' : 'wrong')
    await db.reviews.add({ cardId: card.id, at: Date.now(), rating, tier, typed: r.typed ?? '', ms: 0 })
    const full = data.items.get(it.ref.id)
    if (full?.sentence) await updateLemmas(updated, r.correct, full.sentence.lemmas)
    // Recap never lowers the ladder, but a right answer on the item's next rung climbs it
    const top = maxStageFor(it.ref.kind, entry.unitId)
    if (r.correct && st.stage < top && entry.rung >= st.stage) { advance(st, true, top); data.states.set(it.ref.id, st); await saveState(st) }
    if (!r.correct && !requeued.current.has(entry.cardId) && full) {
      requeued.current.add(entry.cardId)
      const again = questionAt(full, Math.max(1, entry.rung - 1), data.pools.get(entry.unitId) ?? [], lang)
      if (again) setEntries(e => [...e, { ...entry, step: again, rung: Math.max(1, entry.rung - 1), practiceOnly: true }])
    }
  }
  function next() { stopAudio(); setResult(null); setI(n => n + 1) }

  if (!data) return <div className="page">{t.loading}</div>
  if (!entry) {
    const when = data.next ? new Date(data.next.due).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
    return (
      <div className="page fade"><div className="card center">
        <img className="hero" src={entries.length ? WINNER_COVER : DONE_COVER} alt="" style={{ maxHeight: 130 }} />
        <h2>{entries.length ? t.session_done : t.recap_title}</h2>
        {entries.length > 0 && <p className="muted">{fmt(t.recap_summary, stats)}</p>}
        {!entries.length && <p className="muted">{t.recap_empty}</p>}
        {!entries.length && data.next && <p className="small muted">{fmt(t.recap_next, { when })}</p>}
        <div className="row" style={{ justifyContent: 'center' }}>
          {data.left > 0 && <button className="btn primary" onClick={() => { setData(null); setRound(r => r + 1) }}>{fmt(t.recap_more, { n: data.left })}</button>}
          <Link to="/" className={`btn ${data.left > 0 ? 'ghost' : 'primary'}`}>{t.back}</Link>
        </div>
      </div></div>
    )
  }
  return (
    <div className="page lesson-page fade" key={`${round}-${i}`}>
      <div className="topbar"><Link to="/" className="back" aria-label={t.back}>✕</Link>
        <div style={{ flex: 1 }}>
          <div className="progress"><i style={{ width: `${(i / Math.max(1, entries.length)) * 100}%` }} /></div>
          <div className="small muted" style={{ marginTop: 4 }}>{t.recap_title} · {entry.unitId}</div>
        </div>
        <span className="muted small">{i + 1}/{entries.length}</span></div>
      <StepView step={entry.step} result={result} onAnswer={onAnswer} onNext={next} />
    </div>
  )
}
