import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadChunks } from '../../data/loader'
import type { Chunk } from '../../data/types'
import { AudioButton, playAudio } from '../../components/AudioButton'
import { RegisterChip, ReviewChip } from '../../components/RegisterChip'
import { db } from '../../db/db'

/** D1 chunk shadow: listen, repeat aloud, next. Variants show what natives say. */
export function ChunkShadow() {
  const { id = '' } = useParams()
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [i, setI] = useState(0)
  const [showEn, setShowEn] = useState(false)
  const [showVar, setShowVar] = useState(false)
  useEffect(() => { loadChunks(id).then(setChunks) }, [id])
  const c = chunks[i]
  useEffect(() => { setShowEn(false); setShowVar(false) }, [i])
  if (!c) return <div className="page">{chunks.length ? <Done unit={id} /> : '…'}</div>
  const next = async () => {
    const row = await db.chunks.get(c.id)
    await db.chunks.put({ id: c.id, unitId: id, seen: (row?.seen ?? 0) + 1, lastAt: Date.now() })
    setI(i + 1)
  }
  return (
    <div className="page fade" key={c.id}>
      <div className="topbar"><Link to={`/unit/${id}`} className="back">←</Link><div className="muted">{i + 1} / {chunks.length}</div></div>
      <div className="card" style={{ minHeight: 320 }}>
        <div className="row between"><RegisterChip register={c.register} /><ReviewChip status={c.review_status} /></div>
        <p className="sk big" style={{ marginTop: 16, fontSize: '2.5rem' }}>{c.sk}</p>
        <p style={{ fontSize: '1.25rem', margin: '8px 0' }}>{c.ro}</p>
        <button className="muted small" onClick={() => setShowEn(!showEn)}>{showEn ? c.en : 'English ▾'}</button>
        <div style={{ marginTop: 16 }}>{c.audio && <AudioButton src={`/${c.audio.file}`} autoPlay />}</div>
        {c.notes && <p className="small" style={{ background: 'var(--primary-soft)', padding: '10px 12px', borderRadius: 12, marginTop: 16 }}>{c.notes}</p>}
        {c.variants.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button className="btn ghost" style={{ minHeight: 40 }} onClick={() => setShowVar(!showVar)}>Natives also say… ({c.variants.length})</button>
            {showVar && <div className="stack" style={{ marginTop: 10 }}>
              {c.variants.map((v, k) => (
                <div key={k} className="row between" style={{ background: 'var(--surface-sunk)', borderRadius: 12, padding: '10px 12px' }}>
                  <div><div className="sk">{v.sk}</div><div className="small muted">{v.note}</div></div>
                  <div className="row"><RegisterChip register={v.register} />{v.audio && <button className="audiobtn small" onClick={() => playAudio(`/${v.audio!.file}`)}>▶</button>}</div>
                </div>
              ))}
            </div>}
          </div>
        )}
      </div>
      <p className="center muted small" style={{ marginTop: 16 }}>Listen. Say it out loud. Twice.</p>
      <button className="btn primary block" onClick={next}>Next →</button>
    </div>
  )
}
function Done({ unit }: { unit: string }) {
  return <div className="card center fade"><h2>Chunks done 🎉</h2><p className="muted">Now hear them inside sentences.</p>
    <Link to={`/unit/${unit}/lesson`} className="btn primary">Listen & type →</Link></div>
}
