import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Item, ItemState, Step, StepResult } from '../../engine/types'
import { letterSeq, loadUnitById, loadUnitItems } from '../../engine/items'
import { buildPractice, buildSession, introVersion, maxStageFor, stepFor } from '../../engine/session'
import { lessonItems, lessonProgress, lessonsFor, nextLesson, type LessonDef, type LessonStatus } from '../../engine/lessons'
import { advance, edb, getStates, newState, saveState } from '../../engine/store'
import { db } from '../../db/db'
import { newCard } from '../../srs/scheduler'
import { AudioButton, stopAudio } from '../../components/AudioButton'
import { fmt, useLang, useT } from '../../i18n'
import { DONE_COVER, WINNER_COVER } from '../../lib/covers'
import { sfx } from '../../lib/sfx'
import { ChoiceStep, ClozeStep, DialogueIntroStep, DlgClozeStep, IntroStep, ListenTypeStep, MatchStep, PairABStep, ReplyStep, TilesStep, TypeWordStep } from './Steps'

type Phase = 'loading' | 'running' | 'done'
type Mode = 'lesson' | 'practice'
type DoneKind = 'session' | 'lesson' | 'mastered' | 'unit'

/** The session runner: one lesson of a unit (D129), one step at a time; records results, re-queues misses,
 *  updates mastery, and plays a sound with every verdict. A finished lesson runs again in practice mode. */
export function LessonSession() {
  const { id = '', n } = useParams()
  const t = useT(); const lang = useLang(); const nav = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [steps, setSteps] = useState<Step[]>([])
  const [i, setI] = useState(0)
  const [result, setResult] = useState<StepResult | null>(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, advanced: 0 })
  const [lesson, setLesson] = useState<LessonDef | null>(null)
  const [defs, setDefs] = useState<LessonDef[]>([])
  const [mode, setMode] = useState<Mode>('lesson')
  const [doneKind, setDoneKind] = useState<DoneKind>('session')
  const states = useRef<Map<string, ItemState>>(new Map())
  const items = useRef<Item[]>([])          // the items of this lesson
  const unitItems = useRef<Item[]>([])      // the whole unit, for distractors
  const requeued = useRef<Set<string>>(new Set())
  const carried = useRef<Map<string, number>>(new Map())   // extra rungs granted in this session, per item
  const startStatus = useRef<LessonStatus>('new')
  const unitIdRef = useRef(id)
  useEffect(() => () => stopAudio(), [])   // leaving the screen silences it

  useEffect(() => {
    (async () => {
      const unit = await loadUnitById(id); if (!unit) return
      const all = lessonsFor(unit)
      states.current = await getStates(id)
      let def: LessonDef | null = null
      if (n) def = all.find(d => d.n === Number(n)) ?? null
      else if (all.length) {
        // no lesson number: continue with the first unfinished lesson, or redo the last one
        const nx = nextLesson(all, states.current) ?? all[all.length - 1]
        nav(`/unit/${id}/lesson/${nx.n}`, { replace: true }); return
      }
      const its = await loadUnitItems(unit); unitItems.current = its
      items.current = def ? lessonItems(def, its) : its
      setDefs(all); setLesson(def)
      const prog = def ? lessonProgress(def, states.current) : null
      startStatus.current = prog?.status ?? 'new'
      const practice = !!prog && (prog.status === 'done' || prog.status === 'mastered')
      setMode(practice ? 'practice' : 'lesson')
      const plan = practice
        ? buildPractice(items.current, states.current, id, lang, { pool: its })
        : buildSession(items.current, states.current, id, lang, { pool: its, newPerSession: def ? items.current.length : undefined, maxDue: def ? items.current.length : undefined })
      setSteps(plan.steps); setI(0); setStats({ correct: 0, wrong: 0, advanced: 0 }); requeued.current.clear(); carried.current.clear()
      setPhase(plan.steps.length ? 'running' : 'done')
    })()
  }, [id, n, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const step = steps[i]
  const stepItem = (s: Step | undefined): Item | null => s && 'item' in s ? s.item : null
  const total = useMemo(() => steps.length, [steps])

  const onAnswer = async (r: StepResult) => {
    if (!step || result) return
    const isIntro = step.type === 'intro'
    // every verdict has a sound next to its colour
    if (!isIntro) sfx.result(r.correct, r.tier)
    // intro cards have no feedback bar: record and move straight on
    if (!isIntro) setResult(r)
    const affected: Item[] = step.type === 'match' ? step.items : [step.item]
    let advanced = 0
    for (const it of affected) {
      const st = states.current.get(it.ref.id) ?? newState(it.ref, unitIdRef.current)
      const before = st.stage
      // an intro is the item being taught: record which card version was shown, never a verdict (D133)
      if (isIntro) { st.stage = Math.max(st.stage, 1); st.seen++; st.lastAt = Date.now(); st.intro = introVersion(it.ref.kind) }
      else advance(st, r.correct, maxStageFor(it.ref.kind, unitIdRef.current))
      if (st.stage > before) advanced++
      states.current.set(it.ref.id, st); await saveState(st)
      // mastered sentences hand over to the long-term FSRS card
      if (st.stage >= maxStageFor(it.ref.kind, unitIdRef.current) && (it.ref.kind === 'sentence') && it.sentence && !(await db.cards.get(it.ref.id)))
        await db.cards.put(newCard(it.sentence, unitIdRef.current))
    }
    setStats(s => ({ correct: s.correct + (r.correct ? 1 : 0), wrong: s.wrong + (r.correct ? 0 : 1), advanced: s.advanced + advanced }))
    if (isIntro) { await next(); return }
    // a redo carries an item onwards: answer its rung correctly and the next rung joins this session,
    // so redoing a lesson until everything is right actually finishes it (D136). Two extra rungs at most.
    if (r.correct && mode === 'practice' && step.type !== 'match') {
      const it = step.item
      const st = states.current.get(it.ref.id)
      const extra = carried.current.get(it.ref.id) ?? 0
      if (st && st.stage < maxStageFor(it.ref.kind, unitIdRef.current) && extra < 2) {
        const nextRung = stepFor(it, st.stage, unitItems.current, lang)
        if (nextRung) { carried.current.set(it.ref.id, extra + 1); setSteps(s => [...s, nextRung]) }
      }
    }
    // a miss comes back at the end, one stage down (once per item per session)
    if (!r.correct && step.type !== 'match') {
      const it = step.item
      if (!requeued.current.has(it.ref.id)) {
        requeued.current.add(it.ref.id)
        const again = stepFor(it, Math.max(1, (states.current.get(it.ref.id)?.stage ?? 1)), unitItems.current, lang)
        if (again) setSteps(s => [...s, again])
      }
    }
  }
  async function next() {
    stopAudio()          // whatever the last step was still saying stops here
    setResult(null)
    if (i + 1 >= steps.length) {
      // what did this session finish? a lesson for the first time, a lesson mastered, the whole unit — or just a session
      let kind: DoneKind = 'session'
      if (lesson) {
        const now = lessonProgress(lesson, states.current).status
        const unitDone = defs.every(d => lessonProgress(d, states.current).status === 'mastered')
        if (unitDone && mode === 'practice') kind = 'unit'
        else if (now === 'mastered' && startStatus.current !== 'mastered') kind = 'mastered'
        else if ((now === 'done' || now === 'mastered') && (startStatus.current === 'new' || startStatus.current === 'started')) kind = 'lesson'
      }
      if (kind === 'session') sfx.complete(); else sfx.fanfare()
      setDoneKind(kind)
      await edb.sessions.add({ unitId: id, lessonId: lesson?.id, mode, at: Date.now(), steps: steps.length, correct: stats.correct, advanced: stats.advanced })
      setPhase('done')
    } else setI(i + 1)
  }

  if (phase === 'loading') return <div className="page">{t.loading}</div>
  if (phase === 'done' || !step) {
    const mastered = items.current.filter(it => (states.current.get(it.ref.id)?.stage ?? 0) >= maxStageFor(it.ref.kind, id)).length
    const allDone = items.current.length > 0 && mastered >= items.current.length
    const following = lesson ? nextLesson(defs, states.current) : null
    const heading = doneKind === 'unit' ? t.unit_mastered : doneKind === 'mastered' && lesson ? fmt(t.lesson_mastered, { n: lesson.n })
      : doneKind === 'lesson' && lesson ? fmt(t.lesson_done, { n: lesson.n }) : steps.length ? t.session_done : t.nothing_here
    return (
      <div className="page fade"><div className="card center">
        <img className="hero" src={allDone || doneKind !== 'session' ? WINNER_COVER : DONE_COVER} alt="" style={{ maxHeight: 130 }} />
        <h2>{heading}</h2>
        {steps.length > 0 && <p className="muted">{fmt(t.session_summary, { ok: stats.correct, bad: stats.wrong, adv: stats.advanced })}</p>}
        <p className="small muted">{fmt(t.unit_progress, { done: mastered, total: items.current.length })}</p>
        {allDone && !lesson && <p className="small">{t.lessons_done}</p>}
        <div className="row" style={{ justifyContent: 'center' }}>
          {following && <Link to={`/unit/${id}/lesson/${following.n}`} className="btn primary">{t.next_lesson} →</Link>}
          <button className={`btn ${following ? 'ghost' : 'primary'}`} onClick={() => { setPhase('loading'); setSteps([]); nav(0) }}>↻ {lesson ? t.redo_lesson : t.another_session}</button>
          <Link to={`/unit/${id}`} className="btn ghost">{t.back_to_unit}</Link>
        </div>
      </div></div>
    )
  }
  const it = stepItem(step)
  const showFeedback = result && step.type !== 'intro'
  const tone = !result ? '' : result.correct ? (result.tier === 'diacritics' ? 'warn' : 'ok') : 'bad'
  const heading = !result ? '' : result.correct ? (result.tier === 'diacritics' ? t.fb_diacritics : t.fb_correct) : t.fb_wrong
  return (
    <div className="page lesson-page fade" key={i}>
      <div className="topbar"><Link to={`/unit/${id}`} className="back" aria-label={t.back}>✕</Link>
        <div style={{ flex: 1 }}>
          <div className="progress"><i style={{ width: `${(i / Math.max(1, total)) * 100}%` }} /></div>
          {lesson && <div className="small muted" style={{ marginTop: 4 }}>{id} · {t.lesson_word} {lesson.n}{mode === 'practice' ? ` · ↻ ${t.redo_lesson}` : ''}</div>}
        </div>
        <span className="muted small">{i + 1}/{total}</span></div>
      {step.type === 'intro' && (step.item.ref.kind === 'dialogue' ? <DialogueIntroStep step={step} onAnswer={onAnswer} locked={!!result} /> : <IntroStep step={step} onAnswer={onAnswer} locked={!!result} />)}
      {(step.type === 'meaning' || step.type === 'form' || step.type === 'letterpick' || step.type === 'anchor') && <ChoiceStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'reply' && <ReplyStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'match' && <MatchStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'tiles' && <TilesStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'cloze' && <ClozeStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'dlgcloze' && <DlgClozeStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'typeword' && <TypeWordStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'listentype' && <ListenTypeStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {step.type === 'pairab' && <PairABStep step={step} onAnswer={onAnswer} locked={!!result} />}
      {showFeedback && (
        <div className={`feedback ${tone}`}>
          <h3>{heading}</h3>
          {it && step.type !== 'match' && <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div><div className="ans">{it.sk}</div>{it.spell && it.ref.kind !== 'letter' && <div className="guide-ro small">{it.spell}</div>}<div className="small muted">{lang === 'ro' ? it.meaning.ro : it.meaning.en}</div></div>
            {it.audio && <AudioButton src={it.audio} seq={letterSeq(it)} slowSrc={it.audioSlow} compact />}
          </div>}
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={next} autoFocus>{t.continue}</button>
        </div>
      )}
    </div>
  )
}
