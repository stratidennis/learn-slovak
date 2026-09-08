import { setLang, useLang } from '../i18n'
/** RO / EN — the whole UI, glosses and notes follow. */
export function LanguageToggle() {
  const lang = useLang()
  return (
    <div className="row" style={{ gap: 4, background: 'var(--surface-sunk)', borderRadius: 999, padding: 3 }} role="group" aria-label="Language">
      {(['ro', 'en'] as const).map(l => (
        <button key={l} onClick={() => setLang(l)} className="pill-soft" style={{ background: lang === l ? 'var(--primary)' : 'transparent', color: lang === l ? '#fff' : 'var(--ink-muted)', minWidth: 40 }}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}
