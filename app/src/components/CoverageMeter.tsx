export function CoverageMeter({ pct, label = 'of casual Slovak speech' }: { pct: number; label?: string }) {
  const p = Math.max(0, Math.min(100, pct))
  return (
    <div>
      <div className="row between" style={{ alignItems: 'baseline' }}>
        <span className="display" style={{ fontSize: '2.25rem', fontWeight: 700 }}>{p.toFixed(p < 10 ? 1 : 0)}%</span>
        <span className="muted small">{label}</span>
      </div>
      <div className="meter" aria-label={`coverage ${p.toFixed(0)}%`}><i style={{ width: `${p}%` }} /></div>
    </div>
  )
}
