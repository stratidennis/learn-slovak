// Feedback sounds (D129). Synthesised with the Web Audio API — no files, works offline, a few
// hundred bytes. Every visual verdict in the app has one of these next to it: a step answered,
// a pair matched, a tile tapped, a session or deck finished. Off switch in Settings ("sounds").
// The context is created lazily inside the first user gesture (iOS unlocks it there) and reused.
import { getSetting } from '../db/db'

let ctx: AudioContext | null = null
let enabled = true

export function setSfxEnabled(v: boolean) { enabled = v }
export const sfxEnabled = () => enabled
/** Read the saved preference once at startup. */
export async function initSfx() { enabled = await getSetting('sounds', true) }

function ac(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null
  const Ctor = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

type Note = { f: number; at: number; dur: number; type?: OscillatorType; gain?: number; to?: number }
/** Schedule a few short enveloped notes relative to now. */
function play(notes: Note[]) {
  const c = ac(); if (!c) return
  const t0 = c.currentTime + 0.005
  for (const n of notes) {
    const osc = c.createOscillator(), g = c.createGain()
    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.f, t0 + n.at)
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur)
    const peak = n.gain ?? 0.18
    g.gain.setValueAtTime(0.0001, t0 + n.at)
    g.gain.exponentialRampToValueAtTime(peak, t0 + n.at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur)
    osc.connect(g).connect(c.destination)
    osc.start(t0 + n.at); osc.stop(t0 + n.at + n.dur + 0.02)
  }
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, A4 = 440, F4 = 349.23

export const sfx = {
  /** right answer: a bright two-note lift */
  correct: () => play([{ f: C5, at: 0, dur: 0.12, type: 'triangle' }, { f: E5, at: 0.09, dur: 0.22, type: 'triangle' }]),
  /** right but with a slip (diacritics): one mellow note */
  warn: () => play([{ f: A4, at: 0, dur: 0.16, type: 'triangle' }, { f: C5, at: 0.1, dur: 0.18, type: 'triangle', gain: 0.12 }]),
  /** wrong: a soft low buzz, never harsh */
  wrong: () => play([{ f: 196, at: 0, dur: 0.18, type: 'square', gain: 0.07, to: 150 }, { f: 150, at: 0.14, dur: 0.22, type: 'square', gain: 0.06, to: 120 }]),
  /** tapping a tile, choosing a card, a neutral acknowledgement */
  tap: () => play([{ f: 880, at: 0, dur: 0.045, type: 'sine', gain: 0.08 }]),
  /** a pair matched, a card flipped: quick upward blip */
  pop: () => play([{ f: 660, at: 0, dur: 0.09, type: 'sine', gain: 0.14, to: 1320 }]),
  /** speaking step: encouraging, no verdict */
  soft: () => play([{ f: E5, at: 0, dur: 0.2, type: 'sine', gain: 0.1 }]),
  /** a session or deck finished */
  complete: () => play([{ f: C5, at: 0, dur: 0.16, type: 'triangle' }, { f: E5, at: 0.12, dur: 0.16, type: 'triangle' }, { f: G5, at: 0.24, dur: 0.34, type: 'triangle' }]),
  /** a lesson or unit fully done: a small fanfare */
  fanfare: () => play([
    { f: C5, at: 0, dur: 0.14, type: 'triangle' }, { f: E5, at: 0.11, dur: 0.14, type: 'triangle' }, { f: G5, at: 0.22, dur: 0.14, type: 'triangle' },
    { f: C6, at: 0.33, dur: 0.5, type: 'triangle', gain: 0.2 }, { f: E5, at: 0.36, dur: 0.46, type: 'sine', gain: 0.08 }, { f: G5, at: 0.36, dur: 0.46, type: 'sine', gain: 0.08 }]),
  /** the last seconds of a timed round */
  tick: () => play([{ f: 1200, at: 0, dur: 0.04, type: 'square', gain: 0.05 }]),
  /** time's up */
  timeup: () => play([{ f: G5, at: 0, dur: 0.16, type: 'triangle' }, { f: E5, at: 0.14, dur: 0.16, type: 'triangle' }, { f: C5, at: 0.28, dur: 0.4, type: 'triangle' }]),
  /** the verdict sound for a graded answer */
  result: (correct: boolean, tier?: 'exact' | 'diacritics' | 'wrong') => (correct ? (tier === 'diacritics' ? sfx.warn() : sfx.correct()) : sfx.wrong()),
  // F4 kept for a future "streak lost" cue
  _unused: F4,
}
