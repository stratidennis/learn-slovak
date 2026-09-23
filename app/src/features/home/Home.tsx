import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCoverage, loadUnits } from '../../data/loader'
import type { Unit } from '../../data/types'
import { db } from '../../db/db'
import { CoverageMeter } from '../../components/CoverageMeter'
import { ThemeToggle } from '../../components/ThemeToggle'
import { LanguageToggle } from '../../components/LanguageToggle'
import { fmt, useLang, useT } from '../../i18n'
import { lessonProgress, lessonsFor, nextLesson, statesByUnit, type LessonDef, type LessonProgress } from '../../engine/lessons'
import type { ItemState } from '../../engine/types'
import { syncRecap } from '../../srs/recap'

type UnitMap = { defs: LessonDef[]; progress: LessonProgress[]; next: LessonDef | null; done: number }
type Stats = { due: Record<string, number>; dueAll: number; known: number; learning: number; coverage: number; maps: Record<string, UnitMap> }

/** Home: coverage, "up next", and every unit as a small road map of lessons (D129). */
export function Home() {
  const t = useT()
  const [units, setUnits] = useState<Unit[]>([])
  const [st, setSt] = useState<Stats | null>(null)
  useEffect(() => {
    (async () => {
      await syncRecap()        // finished lessons hand their items to Recap before anything is counted (D138)
      const [cards, lemmas, cov, itemRows, unitList] = await Promise.all([db.cards.toArray(), db.lemmas.toArray(), loadCoverage(), db.items.toArray(), loadUnits()])
      setUnits(unitList)
      const now = Date.now(), due: Record<string, number> = {}
      for (const c of cards) if (c.due <= now) due[c.unitId] = (due[c.unitId] ?? 0) + 1
      const byUnit = statesByUnit(itemRows as ItemState[])
      const maps: Record<string, UnitMap> = {}
      for (const u of unitList) {
        const defs = lessonsFor(u), states = byUnit.get(u.id) ?? new Map()
        const progress = defs.map(d => lessonProgress(d, states))
        maps[u.id] = { defs, progress, next: nextLesson(defs, states), done: progress.filter(p => p.status === 'done' || p.status === 'mastered').length }
      }
      // coverage: known lemmas count fully, learning ones half (research §10.1 Progress)
      let w = 0
      for (const l of lemmas) w += (cov[l.lemma] ?? 0) * (l.status === 'known' ? 1 : 0.5)
      setSt({ due, dueAll: Object.values(due).reduce((a, b) => a + b, 0), known: lemmas.filter(l => l.status === 'known').length,
              learning: lemmas.filter(l => l.status === 'learning').length, coverage: w * 100, maps })
    })()
  }, [])
  const phases = [...new Set(units.map(u => u.phase))]
  const lang = useLang()
  // the first unit with an unfinished lesson is "up next"
  const nextUnit = units.find(u => st?.maps[u.id]?.next)
  const nextDef = nextUnit ? st?.maps[nextUnit.id].next ?? null : null
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
      {nextUnit && nextDef && (
        <Link to={`/unit/${nextUnit.id}/lesson/${nextDef.n}`} className="card upnext" style={{ marginTop: 12 }}>
          <div className="t"><small className="muted">{t.up_next}</small><b>{nextUnit.id} {lang === 'ro' ? nextUnit.title_ro : nextUnit.title}</b><small>{t.lesson_word} {nextDef.n} · {fmt(t.lesson_progress, { done: st!.maps[nextUnit.id].done, total: st!.maps[nextUnit.id].defs.length })}</small></div>
          <span className="btn primary" style={{ minHeight: 40, padding: '8px 16px' }}>▶ {st!.maps[nextUnit.id].progress[nextDef.n - 1]?.status === 'started' ? t.continue_lesson : t.start_lesson}</span>
        </Link>
      )}
      {phases.map(p => (
        <section key={p} style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>{t.phase} {p} <span className="muted" style={{ fontWeight: 400, fontSize: '1rem' }}>— {t.phase_names[p]}</span></h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {units.filter(u => u.phase === p).map(u => {
              const m = st?.maps[u.id]
              const total = m?.defs.length ?? 0, done = m?.done ?? 0
              const allMastered = total > 0 && m!.progress.every(x => x.status === 'mastered')
              return (
                <Link key={u.id} to={`/unit/${u.id}`} className={`unit ${total && done >= total ? 'done' : ''} ${allMastered ? 'gold' : ''}`} style={{ color: 'inherit' }}>
                  <div className="num">{allMastered ? '★' : u.id}</div>
                  <div className="t"><b>{lang === 'ro' ? u.title_ro : u.title}</b>
                    {total > 0 && <span className="row" style={{ gap: 8 }}><span className="dots">{m!.progress.map((x, k) => <i key={k} className={x.status} />)}</span><small>{fmt(t.lesson_progress, { done, total })}</small></span>}
                  </div>
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
