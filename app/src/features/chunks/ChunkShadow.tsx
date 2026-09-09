import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadChunks } from '../../data/loader'
import type { Chunk } from '../../data/types'
import { AudioButton, playAudio, stopAudio } from '../../components/AudioButton'
import { RegisterChip, ReviewChip } from '../../components/RegisterChip'
import { Pronunciation } from '../../components/Pronunciation'
import { db } from '../../db/db'
import { useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'

/** D1 chunk shadow: listen, repeat aloud, next. Variants show what natives say. One UI language. */
export function ChunkShadow() {
  const { id = '' } = useParams()
  const t = useT(); const lang = useLang()
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [i, setI] = useState(0)
  const [showVar, setShowVar] = useState(false)
  useEffect(() => { loadChunks(id).then(setChunks) }, [id])
  const c = chunks[i]
  useEffect(() => { setShowVar(false) }, [i])
  useEffect(() => () => stopAudio(), [])
  if (!c) return <div className="page">{chunks.length ? <Done unit={id} /> : t.loading}</div>
  const next = async () => {
    stopAudio(); sfx.tap()
    const row = await db.chunks.get(c.id)
    await db.chunks.put({ id: c.id, unitId: id, seen: (row?.seen ?? 0) + 1, lastAt: Date.now() })
    setI(i + 1)
  }
  const meaning = lang === 'ro' ? c.ro : c.en
  const note = lang === 'ro' ? (c.notes_ro ?? c.notes) : c.notes
  return (
    <div className="page fade" key={c.id}>
      <div className="topbar"><Link to={`/unit/${id}`} className="back" aria-label={t.back}>←</Link><div className="muted">{i + 1} / {chunks.length}</div></div>
      <div className="card" style={{ minHeight: 320 }}>
        <div className="row between"><RegisterChip register={c.register} /><ReviewChip status={c.review_status} /></div>
        <p className="sk big" style={{ marginTop: 16, fontSize: '2.5rem' }}>{c.sk}</p>
        <Pronunciation ro={c.guide?.ro} ipa={c.guide?.ipa} />
        <p style={{ fontSize: '1.25rem', margin: '8px 0' }}>{meaning}</p>
        <div style={{ marginTop: 16 }}>{c.audio && <AudioButton src={`/${c.audio.file}`} slowSrc={c.audio_slow ? `/${c.audio_slow}` : null} autoPlay />}</div>
        {note && <p className="small" style={{ background: 'var(--primary-soft)', padding: '10px 12px', borderRadius: 12, marginTop: 16 }}>{note}</p>}
        {c.variants.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button className="btn ghost" style={{ minHeight: 40 }} onClick={() => setShowVar(!showVar)}>{t.natives_also} ({c.variants.length})</button>
            {showVar && <div className="stack" style={{ marginTop: 10 }}>
              {c.variants.map((v, k) => (
                <div key={k} className="row between" style={{ background: 'var(--surface-sunk)', borderRadius: 12, padding: '10px 12px' }}>
                  <div><div className="sk">{v.sk}</div><Pronunciation ro={v.guide?.ro} ipa={v.guide?.ipa} /><div className="small muted">{lang === 'ro' ? (v.note_ro ?? v.note) : v.note}</div></div>
                  <div className="row" style={{ flexWrap: 'nowrap' }}><RegisterChip register={v.register} />
                    {v.audio && <button className="audiobtn small" onClick={() => playAudio(`/${v.audio!.file}`)} aria-label={t.replay}>▶</button>}
                    {v.audio_slow && <button className="audiobtn small" style={{ background: 'var(--secondary)', color: '#1B2430' }} onClick={() => playAudio(`/${v.audio_slow}`)} aria-label={t.slow}>🐢</button>}</div>
                </div>
              ))}
            </div>}
          </div>
        )}
      </div>
      <p className="center muted small" style={{ marginTop: 16 }}>{t.listen_say}</p>
      <button className="btn primary block" onClick={next}>{t.next}</button>
    </div>
  )
}
function Done({ unit }: { unit: string }) {
  const t = useT()
  useEffect(() => { sfx.complete() }, [])
  return <div className="card center fade"><h2>{t.chunks_done}</h2><p className="muted">{t.chunks_done_sub}</p>
    <Link to={`/unit/${unit}/lesson`} className="btn primary">{t.listen_type_btn} →</Link></div>
}
