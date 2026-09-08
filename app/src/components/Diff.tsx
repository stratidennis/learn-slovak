import type { Grade } from '../lib/grade'
export function Diff({ grade }: { grade: Grade }) {
  return (
    <div className="diff">
      {grade.tokens.map((t, i) => {
        if (t.tier === 'missing') return <span key={i} className="missing">＿ {t.ref}</span>
        if (t.tier === 'extra') return <span key={i} className="extra">{t.typed}</span>
        return <span key={i} className={t.tier} title={t.tier === 'ok' ? '' : `→ ${t.ref}`}>{t.typed}</span>
      })}
    </div>
  )
}
