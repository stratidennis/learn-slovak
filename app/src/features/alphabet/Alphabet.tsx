import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAlphabet } from '../../data/loader'
import type { Alphabet as A } from '../../data/types'
import { playAudio } from '../../components/AudioButton'

/** Phase 0.1: every letter with its Slovak name (for spelling your name), sound, Romanian anchor, example. */
export function Alphabet() {
  const [a, setA] = useState<A | null>(null)
  useEffect(() => { loadAlphabet().then(setA) }, [])
  if (!a) return <div className="page">…</div>
  return (
    <div className="page fade">
      <div className="topbar"><Link to="/" className="back">←</Link><div><h1>Abeceda</h1><div className="muted small">46 letters · 🔊 = the letter's name (for spelling your name) · tap a word to hear it</div></div></div>
      <div className="card small" style={{ marginBottom: 12 }}>
        <b>How to read the guide under every word:</b> Romanian spelling, using only sounds you already have. <span className="guide-ro">CAPS</span> = stressed syllable (always the first), doubled vowel = long, <span className="guide-ro">ɦ</span> = the voiced h (Romanian has none), <span className="guide-ro">y</span> = the i-glide of <i>iar</i>. The four things Romanian ears miss: length, ť/ď/ň/ľ, h vs ch, first-syllable stress.
      </div>
      <div className="alpha">
        {a.letters.map(l => (
          <div key={l.letter} className="card">
            <div className="row between">
              <span className="L">{l.letter}</span>
              <button className="audiobtn small" onClick={() => playAudio(`/${l.audio_name}`)} aria-label={`letter name ${l.name}`}>🔊</button>
            </div>
            <div className="small muted">name: <b>{l.name}</b> · <span className="mono">[{l.ipa}]</span></div>
            <div className="small" style={{ marginTop: 4 }}>🇷🇴 {l.ro}</div>
            {l.audio_example && (
              <button className="row" style={{ marginTop: 6, gap: 8 }} onClick={() => playAudio(`/${l.audio_example}`)}>
                <span className="sk" style={{ fontSize: '1.1rem' }}>{l.example}</span><span className="guide-ro small">{l.example_spell}</span><span className="muted">▶</span>
              </button>
            )}
            {l.note && <div className="small muted" style={{ marginTop: 4 }}>{l.note}</div>}
          </div>
        ))}
      </div>
      <h2 style={{ margin: '24px 0 8px' }}>Diphthongs — one syllable</h2>
      <div className="card"><table className="table"><tbody>
        {a.diphthongs.map(d => <tr key={d.d}><td className="sk">{d.d}</td><td className="mono muted">[{d.ipa}]</td><td>🇷🇴 {d.ro}</td><td className="sk">{d.example}</td></tr>)}
      </tbody></table></div>
    </div>
  )
}
