import { useEffect, useState } from 'react'
import { loadFormsIndex, loadLexemes } from '../../data/loader'
import type { Lexeme } from '../../data/types'
import { RegisterChip, ReviewChip } from '../../components/RegisterChip'

type Hit = { surface: string; lexeme: Lexeme | null; tags: string[] }

/** Every word is tappable → gloss popover (research §10.1 Reading: tap-to-gloss). */
export function TappableSentence({ text, className = 'sk big' }: { text: string; className?: string }) {
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
                <div className="sk big">{hit.lexeme?.l ?? hit.surface}</div>
                {hit.lexeme?.spell && <div className="guide-ro">{hit.lexeme.spell}</div>}
                {hit.lexeme?.ipa && <div className="mono muted">{hit.lexeme.ipa}{hit.lexeme.ipa_src === 'generated' && <span className="small"> · generated</span>}</div>}
              </div>
              <button className="btn ghost" onClick={() => setHit(null)}>✕</button>
            </div>
            {hit.lexeme ? (
              <div className="stack" style={{ marginTop: 12 }}>
                <div style={{ fontSize: '1.25rem' }}>{hit.lexeme.ro.join('; ') || <span className="muted">—</span>}</div>
                <div className="muted">{hit.lexeme.en.join('; ')}</div>
                <div className="row">
                  {hit.lexeme.pos && <span className="chip">{hit.lexeme.pos}</span>}
                  {hit.lexeme.g && <span className="chip">{hit.lexeme.g}</span>}
                  {hit.lexeme.asp && <span className="chip">{hit.lexeme.asp}</span>}
                  {hit.tags.length > 0 && <span className="chip" style={{ ['--c' as string]: 'var(--primary)' }}>{hit.surface.toLowerCase()} · {hit.tags.join(' ')}</span>}
                  <span className="chip">band {hit.lexeme.b} · #{hit.lexeme.rk}</span>
                  <RegisterChip register={hit.lexeme.flag} />
                  <ReviewChip status={hit.lexeme.rs} />
                </div>
                {hit.lexeme.cog && <div className="small" style={{ background: 'var(--secondary-soft)', padding: '8px 12px', borderRadius: 10 }}>
                  ★ Cognate: <b>{hit.lexeme.cog.map(c => c.ro).join(', ')}</b>{hit.lexeme.cog[0].semantic_shift && ' (meaning shifted)'}</div>}
                {hit.lexeme.ff && <div className="small" style={{ background: 'var(--error-soft)', padding: '8px 12px', borderRadius: 10 }}>
                  ⚠ False friend: RO <b>{hit.lexeme.ff[0].ro}</b> = {hit.lexeme.ff[0].ro_means}; SK means {hit.lexeme.ff[0].sk_means}</div>}
                <a className="small" href={`https://slovnik.juls.savba.sk/?w=${encodeURIComponent(hit.lexeme.l)}`} target="_blank" rel="noreferrer">JÚĽŠ dictionary ↗</a>
              </div>
            ) : <p className="muted" style={{ marginTop: 12 }}>Not in the band 1–2 lexicon yet (a name, or a band-3+ word).</p>}
          </div>
        </>
      )}
    </>
  )
}
