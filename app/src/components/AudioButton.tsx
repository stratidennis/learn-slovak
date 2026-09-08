import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

// One shared element: iOS unlocks audio per element on the first user gesture, and a single
// element means every later programmatic play() inherits that permission.
const player = typeof Audio !== 'undefined' ? new Audio() : null

let gen = 0   // bumps on every play, so a sequence knows when something else took the player
export function playAudio(src: string, rate = 1): Promise<boolean> {
  if (!player) return Promise.resolve(false)
  gen++
  player.pause(); player.src = src; player.playbackRate = rate; player.currentTime = 0
  ;(player as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
  return player.play().then(() => true).catch(() => false)
}

/** Play clips one after another (dialogue A then B). Stops if another play() takes over. */
export async function playSequence(srcs: string[], gapMs = 400): Promise<boolean> {
  for (let i = 0; i < srcs.length; i++) {
    const ok = await playAudio(srcs[i]); if (!ok || !player) return false
    const my = gen
    await new Promise<void>(res => { const done = () => { player.removeEventListener('ended', done); player.removeEventListener('pause', done); res() }
      player.addEventListener('ended', done); player.addEventListener('pause', done); setTimeout(done, 15000) })
    if (gen !== my) return false
    if (i < srcs.length - 1) await new Promise(r => setTimeout(r, gapMs))
    if (gen !== my) return false
  }
  return true
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
  const t = useT()
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
      <button className="btn primary" style={{ minHeight: 44 }} onClick={() => play('normal')} aria-label={t.replay}>▶ {t.replay}</button>
      <button className={`btn ghost ${last === 'slow' ? 'on' : ''}`} style={{ minHeight: 44 }} onClick={() => play('slow')}>🐢 {t.slow}</button>
      <button className={`btn ghost ${last === 'slower' ? 'on' : ''}`} style={{ minHeight: 44 }} onClick={() => play('slower')}>🐌 {t.slower}</button>
      {blocked && <span className="small muted">{t.tap_to_play}</span>}
    </div>
  )
}
