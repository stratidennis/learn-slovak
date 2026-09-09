import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAlphabet } from '../../data/loader'
import type { Alphabet as A } from '../../data/types'
import { playAudio, playSequence, stopAudio } from '../../components/AudioButton'
import { useLang, useT } from '../../i18n'

/** Phase 0.1: every letter with its Slovak name (for spelling your name), sound, anchor, example. */
export function Alphabet() {
  const t = useT(); const lang = useLang()
  const [a, setA] = useState<A | null>(null)
  useEffect(() => { loadAlphabet().then(setA) }, [])
  useEffect(() => () => stopAudio(), [])
  if (!a) return <div className="page">{t.loading}</div>
  const flag = lang === 'ro' ? '🇷🇴' : '🇬🇧'
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/" className="back" aria-label={t.back}>←</Link><div><h1>Abeceda</h1><div className="muted small">{t.abeceda_sub}</div></div></div>
      <div className="card small" style={{ marginBottom: 12 }}><b>{t.guide_how}</b> {t.guide_text}</div>
      <div className="alpha">
        {a.letters.map(l => (
          <div key={l.letter} className="card">
            <div className="row between">
              <span className="L">{l.letter}</span>
              <button className="audiobtn small" onClick={() => void playSequence([`/${l.audio_sound ?? l.audio_name}`, ...(l.audio_example ? [`/${l.audio_example}`] : [])])} aria-label={l.letter}>🔊</button>
            </div>
            <div className="small muted"><span className="mono">[{l.ipa}]</span> · {t.letter_spell_name}: <b>{l.name}</b></div>
            <div className="small" style={{ marginTop: 4 }}>{flag} {l.anchor[lang] ?? l.anchor.en}</div>
            {l.audio_example && (
              <button className="row" style={{ marginTop: 6, gap: 8 }} onClick={() => playAudio(`/${l.audio_example}`)}>
                <span className="sk" style={{ fontSize: '1.1rem' }}>{l.example}</span><span className="guide-ro small">{l.example_spell}</span><span className="muted">▶</span>
              </button>
            )}
            {(l.note[lang] ?? l.note.en) && <div className="small muted" style={{ marginTop: 4 }}>{l.note[lang] ?? l.note.en}</div>}
          </div>
        ))}
      </div>
      <h2 style={{ margin: '24px 0 8px' }}>{t.diphthongs_title}</h2>
      <div className="card"><table className="table"><tbody>
        {a.diphthongs.map(d => <tr key={d.d}><td className="sk">{d.d}</td><td className="mono muted">[{d.ipa}]</td><td>{flag} {d.anchor[lang] ?? d.anchor.en}</td><td className="sk">{d.example}</td></tr>)}
      </tbody></table></div>
    </div>
  )
}
