import { useEffect, useRef, useState } from 'react'

// One shared element: iOS unlocks audio per element on the first user gesture, and a single
// element means every later programmatic play() inherits that permission.
const player = typeof Audio !== 'undefined' ? new Audio() : null

export function playAudio(src: string, rate = 1): Promise<boolean> {
  if (!player) return Promise.resolve(false)
  player.pause(); player.src = src; player.playbackRate = rate; player.currentTime = 0
  ;(player as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
  return player.play().then(() => true).catch(() => false)
}

type Props = {
  src: string
  /** a clip rendered slowly by the TTS itself (length_scale 1.4) — sounds far better than playbackRate */
  slowSrc?: string | null
  autoPlay?: boolean
  onPlayed?: (count: number) => void
  compact?: boolean
}
/** Replay as often as you like; "Slow" uses the natural slow render when there is one, else 0.7×; "Slower" is 0.5×. */
export function AudioButton({ src, slowSrc, autoPlay, onPlayed, compact }: Props) {
  const [blocked, setBlocked] = useState(false)
  const [last, setLast] = useState<'normal' | 'slow' | 'slower'>('normal')
  const count = useRef(0)
  const play = async (mode: 'normal' | 'slow' | 'slower' = 'normal') => {
    setLast(mode)
    const ok = mode === 'normal' ? await playAudio(src, 1)
      : mode === 'slow' ? (slowSrc ? await playAudio(slowSrc, 1) : await playAudio(src, 0.7))
      : (slowSrc ? await playAudio(slowSrc, 0.75) : await playAudio(src, 0.5))
    setBlocked(!ok)
    if (ok) { count.current++; onPlayed?.(count.current) }
  }
  useEffect(() => { count.current = 0; if (autoPlay) void play('normal') }, [src]) // eslint-disable-line react-hooks/exhaustive-deps
  if (compact) return <button className="audiobtn small" onClick={() => play('normal')} aria-label="Prehrať">▶</button>
  return (
    <div className="row" style={{ gap: 8 }}>
      <button className="btn primary" style={{ minHeight: 44 }} onClick={() => play('normal')} aria-label="Replay">▶ Replay</button>
      <button className={`btn ghost ${last === 'slow' ? 'on' : ''}`} style={{ minHeight: 44 }} onClick={() => play('slow')}>🐢 Slow</button>
      <button className={`btn ghost ${last === 'slower' ? 'on' : ''}`} style={{ minHeight: 44 }} onClick={() => play('slower')}>🐌 Slower</button>
      {blocked && <span className="small muted">tap to play</span>}
    </div>
  )
}
