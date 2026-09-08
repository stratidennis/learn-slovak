import { useT } from '../i18n'
export function RegisterChip({ register }: { register: string | null | undefined }) {
  const t = useT()
  if (!register || register === 'neutral' || !t.reg[register]) return null
  const key = register === 'mild_expletive' || register === 'insult' ? 'colloquial' : register
  return <span className="chip" style={{ ['--c' as string]: `var(--reg-${key}, var(--ink-muted))` }}>{t.reg[register]}</span>
}
export function ReviewChip({ status }: { status: string }) {
  const t = useT()
  if (status === 'reviewed_ok') return null
  return <span className="chip" style={{ ['--c' as string]: 'var(--warning-deep)' }} title={t.draft_title}>{t.draft}</span>
}
