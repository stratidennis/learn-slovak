const LABEL: Record<string, string> = { standard: 'štandard', neutral: '', colloquial: 'hovorovo', formal: 'formálne', regional: 'regionálne', archaic: 'archaické', vulgar: 'vulgárne', insult: 'urážka', mild_expletive: 'hovorovo' }
export function RegisterChip({ register }: { register: string | null | undefined }) {
  if (!register || !LABEL[register]) return null
  const c = `var(--reg-${register === 'mild_expletive' || register === 'insult' ? 'colloquial' : register}, var(--ink-muted))`
  return <span className="chip" style={{ ['--c' as string]: c }}>{LABEL[register]}</span>
}
export function ReviewChip({ status }: { status: string }) {
  if (status === 'reviewed_ok') return null
  return <span className="chip" style={{ ['--c' as string]: 'var(--warning-deep)' }} title="Not yet checked by a native speaker">draft</span>
}
