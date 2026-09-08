import { useEffect, useState } from 'react'
import { loadFormsIndex, loadLexemes } from '../../data/loader'
import type { Lexeme } from '../../data/types'
import { RegisterChip, ReviewChip } from '../../components/RegisterChip'
import { useLang, useT } from '../../i18n'

type Hit = { surface: string; lexeme: Lexeme | null; tags: string[] }

/** Every word is tappable → gloss popover in the UI language (research §10.1 Reading: tap-to-gloss). */
export function TappableSentence({ text, className = 'sk big' }: { text: string; className?: string }) {
  const t = useT(); const lang = useLang()
  const [hit, setHit] = useState<Hit | null>(null)
  const [forms, setForms] = useState<Record<string, string> | null>(null)
  const [lex, setLex] = useState<Map<string, Lexeme> | null>(null)
  useEffect(() => { loadFormsIndex().then(setForms); loadLexemes().then(setLex) }, [])

  const tap = (raw: string) => {
    const surface = raw.toLowerCase().replace(/[^\p{L}]/gu, '')
    const lemma = forms?.[surface]
    const lexeme = lemma ? lex?.get(lemma) ?? null : null
    const tags = lexeme?.forms.find(([f]) => f.toLowerCase() === surface)?.[1] ?? []
    setHit({ surface: raw, lexeme, tags })
  }
  const parts = text.split(/(\s+)/)
  const L = hit?.lexeme
  const gloss = L ? (lang === 'ro' ? (L.ro.length ? L.ro : L.en) : (L.en.length ? L.en : L.ro)) : []
  return (
    <>
      <p className={className} style={{ margin: 0 }}>
        {parts.map((p, i) => /\s+/.test(p) ? p : <span key={i} className="word" onClick={() => tap(p)}>{p}</span>)}
      </p>
      {hit && (
        <>
          <div className="scrim" onClick={() => setHit(null)} />
          <div className="popover fade" role="dialog">
            <div className="row between">
              <div>
                <div className="sk big">{L?.l ?? hit.surface}</div>
                {L?.spell && <div className="guide-ro">{L.spell}</div>}
                {L?.ipa && <div className="mono muted">{L.ipa}{L.ipa_src === 'generated' && <span className="small"> · {t.generated}</span>}</div>}
              </div>
              <button className="btn ghost" onClick={() => setHit(null)} aria-label={t.close}>✕</button>
            </div>
            {L ? (
              <div className="stack" style={{ marginTop: 12 }}>
                <div style={{ fontSize: '1.25rem' }}>{gloss.join('; ') || <span className="muted">—</span>}</div>
                <div className="row">
                  {L.pos && <span className="chip">{L.pos}</span>}
                  {L.g && <span className="chip">{L.g}</span>}
                  {L.asp && <span className="chip">{L.asp}</span>}
                  {hit.tags.length > 0 && <span className="chip" style={{ ['--c' as string]: 'var(--primary)' }}>{hit.surface.toLowerCase()} · {hit.tags.join(' ')}</span>}
                  <span className="chip">{t.band} {L.b} · #{L.rk}</span>
                  <RegisterChip register={L.flag} />
                  <ReviewChip status={L.rs} />
                </div>
                {L.cog && <div className="small" style={{ background: 'var(--secondary-soft)', padding: '8px 12px', borderRadius: 10 }}>
                  ★ {t.cognate}: <b>{L.cog.map(c => c.ro).join(', ')}</b>{L.cog[0].semantic_shift && ' ' + t.meaning_shifted}</div>}
                {L.ff && <div className="small" style={{ background: 'var(--error-soft)', padding: '8px 12px', borderRadius: 10 }}>
                  ⚠ {t.false_friend}: RO <b>{L.ff[0].ro}</b> {t.ff_ro_means} {L.ff[0].ro_means}; {t.ff_sk_means} {L.ff[0].sk_means}</div>}
                <a className="small" href={`https://slovnik.juls.savba.sk/?w=${encodeURIComponent(L.l)}`} target="_blank" rel="noreferrer">{t.dictionary}</a>
              </div>
            ) : <p className="muted" style={{ marginTop: 12 }}>{t.not_in_lexicon}</p>}
          </div>
        </>
      )}
    </>
  )
}
