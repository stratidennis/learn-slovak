import { useEffect, useRef, useState } from 'react'

// One shared element: iOS unlocks audio per element on the first user gesture, and a single
// element means every later programmatic play() inherits that permission.
const player = typeof Audio !== 'undefined' ? new Audio() : null

export function playAudio(src: string, rate = 1): Promise<boolean> {
  if (!player) return Promise.resolve(false)
  player.pause(); player.src = src; player.playbackRate = rate; player.currentTime = 0
  return player.play().then(() => true).catch(() => false)
}

type Props = { src: string; autoPlay?: boolean; onPlayed?: (count: number) => void; size?: 'big' | 'small'; withSpeed?: boolean }
export function AudioButton({ src, autoPlay, onPlayed, size = 'big', withSpeed = true }: Props) {
  const [rate, setRate] = useState(1)
  const [blocked, setBlocked] = useState(false)
  const count = useRef(0)
  const play = async (r = rate) => {
    const ok = await playAudio(src, r)
    setBlocked(!ok)
    if (ok) { count.current++; onPlayed?.(count.current) }
  }
  useEffect(() => { count.current = 0; if (autoPlay) void play() }, [src]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="row">
      <button className={`audiobtn ${size === 'small' ? 'small' : ''}`} onClick={() => play()} aria-label="Prehrať">▶</button>
      {withSpeed && (
        <div className="row" style={{ gap: 6 }}>
          {[1, 0.7].map(r => (
            <button key={r} className={`speed ${rate === r ? 'on' : ''}`} onClick={() => { setRate(r); void play(r) }}>{r}×</button>
          ))}
        </div>
      )}
      {blocked && <span className="small muted">tap ▶ to play</span>}
    </div>
  )
}
