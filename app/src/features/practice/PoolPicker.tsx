import type { Pool, PoolFilter } from '../../engine/pool'
import type { ItemKind } from '../../engine/types'
import { fmt, useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'

/** Which types and which units go into a practice round. Only completed lessons feed the pool, so the
 *  chips show exactly what has been learned. An empty selection means "everything". */
export function PoolPicker({ pool, filter, onChange, kinds, selectedCount }: { pool: Pool; filter: PoolFilter; onChange: (f: PoolFilter) => void; kinds: ItemKind[]; selectedCount: number }) {
  const t = useT(); const lang = useLang()
  const kindsHere = kinds.filter(k => pool.byKind.has(k))
  const toggle = <T,>(list: T[], v: T) => list.includes(v) ? list.filter(x => x !== v) : [...list, v]
  const phases = [...new Set(pool.units.map(u => u.phase))]
  const chip = (on: boolean) => `chip pick ${on ? 'on' : ''}`
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div>
        <div className="row between"><b className="small">{t.pool_kinds}</b>
          <button className={chip(filter.kinds.length === 0)} onClick={() => { sfx.tap(); onChange({ ...filter, kinds: [] }) }}>{t.pool_all}</button></div>
        <div className="row" style={{ gap: 6, marginTop: 6 }}>
          {kindsHere.map(k => <button key={k} className={chip(filter.kinds.includes(k))} onClick={() => { sfx.tap(); onChange({ ...filter, kinds: toggle(filter.kinds, k) }) }}>{t.kinds[k] ?? k} <span className="muted">{pool.byKind.get(k)}</span></button>)}
        </div>
      </div>
      <div>
        <div className="row between"><b className="small">{t.pool_units}</b>
          <button className={chip(filter.units.length === 0)} onClick={() => { sfx.tap(); onChange({ ...filter, units: [] }) }}>{t.pool_all}</button></div>
        {phases.map(p => (
          <div key={p} className="row" style={{ gap: 6, marginTop: 6 }}>
            <span className="small muted" style={{ width: '100%' }}>{t.phase} {p}</span>
            {pool.units.filter(u => u.phase === p).map(u => <button key={u.id} className={chip(filter.units.includes(u.id))} title={lang === 'ro' ? u.title_ro : u.title} onClick={() => { sfx.tap(); onChange({ ...filter, units: toggle(filter.units, u.id) }) }}>{u.id} <span className="muted">{pool.byUnit.get(u.id)}</span></button>)}
          </div>
        ))}
      </div>
      <p className="small muted" style={{ margin: 0 }}>{fmt(t.pool_count, { n: selectedCount })}</p>
    </div>
  )
}
