import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

// One shared element: iOS unlocks audio per element on the first user gesture, and a single
// element means every later programmatic play() inherits that permission.
const player = typeof Audio !== 'undefined' ? new Audio() : null

let gen = 0   // bumps on every play, so a sequence knows when something else took the player
/** Silence the player and cancel any running sequence — called whenever the screen moves to a new step,
 *  so a clip never carries over into the next question (D131). */
export function stopAudio() {
  gen++
  if (player && !player.paused) { player.pause(); try { player.currentTime = 0 } catch { /* no source yet */ } }
}
export function playAudio(src: string, rate = 1): Promise<boolean> {
  if (!player) return Promise.resolve(false)
  gen++
  player.pause(); player.src = src; player.playbackRate = rate; player.currentTime = 0
  ;(player as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
  return player.play().then(() => true).catch(() => false)
}

/** For tests and debugging: is anything playing? */
export const audioState = () => ({ paused: player?.paused ?? true, src: player?.currentSrc || player?.getAttribute('src') || '', gen })

/** Play clips one after another (letter then word, dialogue A then B). Stops if another play() or
 *  stopAudio() takes over. The clips are trimmed at export (≈0.2 s of tail), so the gap stays short. */
export async function playSequence(srcs: string[], gapMs = 120, rate = 1): Promise<boolean> {
  for (let i = 0; i < srcs.length; i++) {
    const ok = await playAudio(srcs[i], rate); if (!ok || !player) return false
    const my = gen
    await new Promise<void>(res => {
      const evs = ['ended', 'pause', 'emptied', 'abort', 'error'] as const
      const done = () => { evs.forEach(e => player.removeEventListener(e, done)); res() }
      evs.forEach(e => player.addEventListener(e, done)); setTimeout(done, 15000)
    })
    if (gen !== my) return false
    if (i < srcs.length - 1) await new Promise(r => setTimeout(r, gapMs))
    if (gen !== my) return false
  }
  return true
}

type Props = {
  src: string
  /** play these clips one after another instead of src (a letter, then a word that contains it) */
  seq?: string[]
  /** a clip rendered slowly by the TTS itself (length_scale 1.4) — sounds far better than playbackRate */
  slowSrc?: string | null
  autoPlay?: boolean
  onPlayed?: (count: number) => void
  compact?: boolean
}
/** Replay as often as you like; "Slow" uses the natural slow render when there is one, else 0.7×; "Slower" is 0.5×. */
export function AudioButton({ src, seq, slowSrc, autoPlay, onPlayed, compact }: Props) {
  const t = useT()
  const [blocked, setBlocked] = useState(false)
  const [last, setLast] = useState<'normal' | 'slow' | 'slower'>('normal')
  const count = useRef(0)
  const play = async (mode: 'normal' | 'slow' | 'slower' = 'normal') => {
    setLast(mode)
    const ok = seq && seq.length > 1 ? await playSequence(seq, 120, mode === 'normal' ? 1 : mode === 'slow' ? 0.75 : 0.55)
      : mode === 'normal' ? await playAudio(src, 1)
      : mode === 'slow' ? (slowSrc ? await playAudio(slowSrc, 1) : await playAudio(src, 0.7))
      : (slowSrc ? await playAudio(slowSrc, 0.75) : await playAudio(src, 0.5))
    setBlocked(!ok)
    if (ok) { count.current++; onPlayed?.(count.current) }
  }
  useEffect(() => { count.current = 0; if (autoPlay) void play('normal') }, [src, seq?.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
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
