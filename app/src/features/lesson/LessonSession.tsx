import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Item, ItemState, Step, StepResult } from '../../engine/types'
import { loadUnitById, loadUnitItems } from '../../engine/items'
import { buildSession, maxStageFor, stepFor } from '../../engine/session'
import { advance, edb, getStates, newState, saveState } from '../../engine/store'
import { db } from '../../db/db'
import { newCard } from '../../srs/scheduler'
import { AudioButton } from '../../components/AudioButton'
import { fmt, useLang, useT } from '../../i18n'
import { ChoiceStep, ClozeStep, IntroStep, ListenTypeStep, MatchStep, PairABStep, TilesStep, TypeWordStep } from './Steps'

type Phase = 'loading' | 'running' | 'done'

/** The session runner: shows one step at a time, records the result, re-queues misses, updates mastery. */
export function LessonSession() {
  const { id = '' } = useParams()
  const t = useT(); const lang = useLang(); const nav = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [steps, setSteps] = useState<Step[]>([])
  const [i, setI] = useState(0)
  const [result, setResult] = useState<StepResult | null>(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, advanced: 0 })
  const states = useRef<Map<string, ItemState>>(new Map())
  const items = useRef<Item[]>([])
  const requeued = useRef<Set<string>>(new Set())
  const unitIdRef = useRef(id)

  useEffect(() => {
    (async () => {
      const unit = await loadUnitById(id); if (!unit) return
      const its = await loadUnitItems(unit); items.current = its
      states.current = await getStates(id)
      const plan = buildSession(its, states.current, id, lang)
      setSteps(plan.steps); setI(0); setPhase(plan.steps.length ? 'running' : 'done')
    })()
  }, [id, lang])

  const step = steps[i]
  const stepItem = (s: Step | undefined): Item | null => s && 'item' in s ? s.item : null
  const total = useMemo(() => steps.length, [steps])

  const onAnswer = async (r: StepResult) => {
    if (!step || result) return
    const isIntro = step.type === 'intro'
    // intro cards have no feedback bar: record and move straight on
    if (!isIntro) setResult(r)
    const affected: Item[] = step.type === 'match' ? step.items : [step.item]
    let advanced = 0
    for (const it of affected) {
      const st = states.current.get(it.ref.id) ?? newState(it.ref, unitIdRef.current)
      const before = st.stage
      if (step.type === 'intro') { st.stage = Math.max(st.stage, 1); st.seen++; st.lastAt = Date.now() }
      else advance(st, r.correct, maxStageFor(it.ref.kind, unitIdRef.current))
      if (st.stage > before) advanced++
      states.current.set(it.ref.id, st); await saveState(st)
      // mastered chunks/sentences hand over to the long-term FSRS card
      if (st.stage >= maxStageFor(it.ref.kind, unitIdRef.current) && (it.ref.kind === 'sentence') && it.sentence && !(await db.cards.get(it.ref.id)))
        await db.cards.put(newCard(it.sentence, unitIdRef.current))
    }
    setStats(s => ({ correct: s.correct + (r.correct ? 1 : 0), wrong: s.wrong + (r.correct ? 0 : 1), advanced: s.advanced + advanced }))
    if (isIntro) { await next(); return }
    // a miss comes back at the end, one stage down (once per item per session)
    if (!r.correct && step.type !== 'match') {
      const it = step.item
      if (!requeued.current.has(it.ref.id)) {
        requeued.current.add(it.ref.id)
        const again = stepFor(it, Math.max(1, (states.current.get(it.ref.id)?.stage ?? 1)), items.current, lang)
        if (again) setSteps(s => [...s, again])
      }
    }
  }
  async function next() {
    setResult(null)
    if (i + 1 >= steps.length) {
      await edb.sessions.add({ unitId: id, at: Date.now(), steps: steps.length, correct: stats.correct, advanced: stats.advanced })
      setPhase('done')
    } else setI(i + 1)
  }

  if (phase === 'loading') return <div className="page">{t.loading}</div>
  if (phase === 'done' || !step) {
    const mastered = items.current.filter(it => (states.current.get(it.ref.id)?.stage ?? 0) >= maxStageFor(it.ref.kind, id)).length
    return (
      <div className="page fade"><div className="card center">
        <h2>{steps.length ? t.session_done : t.nothing_here}</h2>
        {steps.length > 0 && <p className="muted">{fmt(t.session_summary, { ok: stats.correct, bad: stats.wrong, adv: stats.advanced })}</p>}
        <p className="small muted">{fmt(t.unit_progress, { done: mastered, total: items.current.length })}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={() => { setPhase('loading'); setSteps([]); setStats({ correct: 0, wrong: 0, advanced: 0 }); requeued.current.clear(); nav(0) }}>{t.another_session}</button>
          <Link to={`/unit/${id}`} className="btn ghost">{t.back}</Link>
        </div>
      </div></div>
    )
  }
  const it = stepItem(step)
  const showFeedback = result && step.type !== 'intro'
  const tone = !result ? '' : result.correct ? (result.tier === 'diacritics' ? 'warn' : 'ok') : 'bad'
  return (
    <div className="page lesson-page fade" key={i}>
      <div className="topbar"><Link to={`/unit/${id}`} className="back" aria-label={t.back}>✕</Link><div className="progress"><i style={{ width: `${(i / Math.max(1, total)) * 100}%` }} /></div><span className="muted small">{i + 1}/{total}</span></div>
      {step.type === 'intro' && <IntroStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {(step.type === 'meaning' || step.type === 'form' || step.type === 'letterpick' || step.type === 'anchor') && <ChoiceStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'match' && <MatchStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'tiles' && <TilesStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'cloze' && <ClozeStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'typeword' && <TypeWordStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'listentype' && <ListenTypeStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'pairab' && <PairABStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {showFeedback && (
        <div className={`feedback ${tone}`}>
          <h3>{result!.correct ? (result!.tier === 'diacritics' ? t.fb_diacritics : t.fb_correct) : t.fb_wrong}</h3>
          {it && step.type !== 'match' && <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div><div className="ans">{it.sk}</div>{it.spell && it.ref.kind !== 'letter' && <div className="guide-ro small">{it.spell}</div>}<div className="small muted">{lang === 'ro' ? it.meaning.ro : it.meaning.en}</div></div>
            {it.audio && <AudioButton src={it.audio} slowSrc={it.audioSlow} compact />}
          </div>}
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={next} autoFocus>{t.continue}</button>
        </div>
      )}
    </div>
  )
}
