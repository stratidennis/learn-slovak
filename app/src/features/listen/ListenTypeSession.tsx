import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadSentences, loadUnits } from '../../data/loader'
import type { Sentence } from '../../data/types'
import { db, getSetting, type CardRow } from '../../db/db'
import { dueCards, newCard, ratingFor, review, updateLemmas } from '../../srs/scheduler'
import { grade, type Grade } from '../../lib/grade'
import { AudioButton } from '../../components/AudioButton'
import { SlovakKeyboard } from '../../components/SlovakKeyboard'
import { Diff } from '../../components/Diff'
import { TappableSentence } from '../gloss/TappableSentence'
import { Pronunciation } from '../../components/Pronunciation'
import { fmt, useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'

type Item = { card: CardRow; sentence: Sentence; isNew: boolean }

/** A1 listen → type. The core loop (research §10.1, EXERCISE-TYPES A1/E1). */
export function ListenTypeSession() {
  const { id } = useParams()                       // undefined => review everything due
  const t = useT(); const lang = useLang()
  const [queue, setQueue] = useState<Item[] | null>(null)
  const [i, setI] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<Grade | null>(null)
  const [gaveUp, setGaveUp] = useState(false)
  const [replays, setReplays] = useState(0)
  const [done, setDone] = useState({ ok: 0, warn: 0, bad: 0 })
  const startedAt = useRef(Date.now())
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    (async () => {
      const newPerSession = await getSetting('newPerSession', 8)
      const units = id ? [id] : (await loadUnits()).map(u => u.id)
      const sentenceSets = await Promise.all(units.map(u => loadSentences(u).then(s => [u, s] as const)))
      const byId = new Map<string, [string, Sentence]>()
      for (const [u, ss] of sentenceSets) for (const s of ss) byId.set(s.id, [u, s])
      const items: Item[] = []
      for (const c of await dueCards(id)) { const hit = byId.get(c.id); if (hit) items.push({ card: c, sentence: hit[1], isNew: false }) }
      if (id) {
        const have = new Set((await db.cards.where('unitId').equals(id).toArray()).map(c => c.id))
        const fresh = [...byId.values()].filter(([u, s]) => u === id && !have.has(s.id)).slice(0, newPerSession)
        for (const [u, s] of fresh) items.push({ card: newCard(s, u), sentence: s, isNew: true })
      }
      setQueue(items)
    })()
  }, [id])

  const item = queue?.[i]
  useEffect(() => { if (queue && queue.length && !queue[i]) sfx.complete() }, [queue, i])
  const strict = useMemo(() => !!item && item.card.fsrs.stability > 14, [item])
  useEffect(() => { setTyped(''); setResult(null); setGaveUp(false); setReplays(0); startedAt.current = Date.now(); setTimeout(() => inputRef.current?.focus(), 50) }, [i])

  const submit = async (text = typed, reveal = false) => {
    if (!item || result) return
    const g = grade(item.sentence.sk, reveal ? '' : text, strict)
    setGaveUp(reveal); setResult(g)
    const tier = reveal || g.nBad > 0 ? 'wrong' : g.nWarn > 0 ? 'diacritics' : 'exact'
    sfx.result(tier !== 'wrong', tier)
    const rating = ratingFor(tier, replays)
    if (item.isNew) await db.cards.put(item.card)
    const updated = await review(item.card, rating)
    await db.reviews.add({ cardId: item.card.id, at: Date.now(), rating, tier, typed, ms: Date.now() - startedAt.current })
    await updateLemmas(updated, tier !== 'wrong')
    const k = tier === 'exact' ? 'ok' : tier === 'diacritics' ? 'warn' : 'bad'
    setDone(d => ({ ...d, [k]: d[k] + 1 }))
    if (tier === 'wrong') setQueue(q => q ? [...q, { ...item, card: updated, isNew: false }] : q)
  }

  if (!queue) return <div className="page">{t.loading}</div>
  if (!item) return (
    <div className="page fade"><div className="card center">
      <h2>{queue.length ? t.session_done : t.nothing_here}</h2>
      {queue.length > 0 && <p className="muted">{fmt(t.session_stats, done)}</p>}
      <Link to={id ? `/unit/${id}` : '/'} className="btn primary">{t.back}</Link>
    </div></div>
  )
  const back = id ? `/unit/${id}` : '/'
  // ONE language: Romanian when we have it; otherwise the English translation, explicitly marked
  const ro = item.sentence.ro[0], en = item.sentence.en[0]
  const translation = lang === 'ro' ? (ro ?? en) : (en ?? ro)
  const fallback = lang === 'ro' && !ro && !!en
  const message = gaveUp ? t.msg_gave_up : result?.nBad ? t.msg_wrong : result?.nWarn ? t.msg_diacritics + (strict ? t.msg_diacritics_strict : '.') : replays <= 1 ? t.msg_first_time : t.msg_good
  return (
    <div className="page fade" key={item.card.id + i}>
      <div className="topbar"><Link to={back} className="back" aria-label={t.back}>←</Link>
        <div className="muted small">{i + 1} / {queue.length}{item.isNew && <span className="chip" style={{ marginLeft: 8, ['--c' as string]: 'var(--accent)' }}>{t.new_badge}</span>}{strict && <span className="chip" style={{ marginLeft: 8 }}>{t.strict_badge}</span>}</div>
      </div>
      <div className="card">
        <div className="row between">
          <AudioButton src={`/${item.sentence.audio}`} slowSrc={item.sentence.audio_slow ? `/${item.sentence.audio_slow}` : null} autoPlay onPlayed={setReplays} />
          <span className="muted small">{replays > 1 ? `${replays}×` : ''}</span>
        </div>
        {!result ? (
          <>
            <p className="muted small" style={{ marginTop: 16 }}>{t.type_heard}</p>
            <textarea ref={inputRef} className="input" rows={2} value={typed} onChange={e => setTyped(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void submit() } }} placeholder="…" />
            <SlovakKeyboard inputRef={inputRef} onChange={setTyped} />
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn primary" onClick={() => submit()} disabled={!typed.trim()}>{t.check}</button>
              <button className="btn ghost" onClick={() => submit('', true)}>{t.dont_know}</button>
            </div>
          </>
        ) : (
          <div className="stack fade" style={{ marginTop: 16 }}>
            {gaveUp ? <p className="muted" style={{ margin: 0 }}>{t.revealed}</p> : <Diff grade={result} />}
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--line)' }}>
              <TappableSentence text={item.sentence.sk} />
              <Pronunciation ro={item.sentence.guide?.ro} ipa={item.sentence.guide?.ipa} />
              <p className="small muted" style={{ margin: '6px 0 0' }}>{t.tap_word}</p>
            </div>
            {translation ? <p style={{ margin: 0 }}>{translation}{fallback && <span className="small muted"> {t.translation_fallback}</span>}</p>
              : <p className="small muted" style={{ margin: 0 }}>{t.no_translation}</p>}
            <p className="small" style={{ margin: 0, color: result.nBad || gaveUp ? 'var(--error)' : result.nWarn ? 'var(--warning-deep)' : 'var(--success-deep)' }}>{message}</p>
            <p className="small muted" style={{ margin: 0 }}>{item.sentence.attr} · {item.sentence.lic}</p>
            <button className="btn primary block" onClick={() => setI(i + 1)} autoFocus>{t.next}</button>
          </div>
        )}
      </div>
    </div>
  )
}
