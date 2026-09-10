// Feedback sounds (D129, rebuilt in D132 for latency). Every visual verdict has one: a step answered,
// a pair matched, a tile tapped, a session or deck finished. Off switch in Settings ("sounds").
//
// Why two playback paths. The sounds are defined once as note lists. When the AudioContext is
// *running* they are played with oscillators — a few milliseconds of latency. But Safari puts the
// context into 'suspended' or the non-standard 'interrupted' state whenever an <audio> element takes
// the audio session, which in this app happens on every single word clip; a context in that state has
// a frozen clock, so scheduling on it queued the sound until an async resume() finished — the delay he
// reported. So each sound is also pre-rendered to a small WAV blob and played through a pool of plain
// <audio> elements (the path the word clips already prove to be timely on his phone). At call time:
// running context → oscillators, anything else → the element pool, and a resume is kicked off for next
// time. Both paths come from the same note spec, so they sound identical.
import { getSetting } from '../db/db'

let ctx: AudioContext | null = null
let enabled = true

export function setSfxEnabled(v: boolean) { enabled = v }
export const sfxEnabled = () => enabled
/** Read the saved preference once at startup. */
export async function initSfx() { enabled = await getSetting('sounds', true) }

export type Note = { f: number; at: number; dur: number; type?: OscillatorType; gain?: number; to?: number }
const RATE = 24000            // the clips are 24 kHz too; plenty for a 500 ms blip

/* ------------------------------------------------------------------ the sounds */
const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, A4 = 440
export const SOUNDS: Record<string, Note[]> = {
  /** right answer: a bright two-note lift */
  correct: [{ f: C5, at: 0, dur: 0.12, type: 'triangle' }, { f: E5, at: 0.09, dur: 0.22, type: 'triangle' }],
  /** right but with a slip (diacritics): one mellow note */
  warn: [{ f: A4, at: 0, dur: 0.16, type: 'triangle' }, { f: C5, at: 0.1, dur: 0.18, type: 'triangle', gain: 0.12 }],
  /** wrong: a soft low buzz, never harsh */
  wrong: [{ f: 196, at: 0, dur: 0.18, type: 'square', gain: 0.07, to: 150 }, { f: 150, at: 0.14, dur: 0.22, type: 'square', gain: 0.06, to: 120 }],
  /** tapping a tile, choosing a card, a neutral acknowledgement */
  tap: [{ f: 880, at: 0, dur: 0.045, type: 'sine', gain: 0.08 }],
  /** a pair matched, a card flipped: quick upward blip */
  pop: [{ f: 660, at: 0, dur: 0.09, type: 'sine', gain: 0.14, to: 1320 }],
  /** speaking step: encouraging, no verdict */
  soft: [{ f: E5, at: 0, dur: 0.2, type: 'sine', gain: 0.1 }],
  /** a session or deck finished */
  complete: [{ f: C5, at: 0, dur: 0.16, type: 'triangle' }, { f: E5, at: 0.12, dur: 0.16, type: 'triangle' }, { f: G5, at: 0.24, dur: 0.34, type: 'triangle' }],
  /** a lesson or unit fully done: a small fanfare */
  fanfare: [
    { f: C5, at: 0, dur: 0.14, type: 'triangle' }, { f: E5, at: 0.11, dur: 0.14, type: 'triangle' }, { f: G5, at: 0.22, dur: 0.14, type: 'triangle' },
    { f: C6, at: 0.33, dur: 0.5, type: 'triangle', gain: 0.2 }, { f: E5, at: 0.36, dur: 0.46, type: 'sine', gain: 0.08 }, { f: G5, at: 0.36, dur: 0.46, type: 'sine', gain: 0.08 }],
  /** the last seconds of a timed round */
  tick: [{ f: 1200, at: 0, dur: 0.04, type: 'square', gain: 0.05 }],
  /** time's up */
  timeup: [{ f: G5, at: 0, dur: 0.16, type: 'triangle' }, { f: E5, at: 0.14, dur: 0.16, type: 'triangle' }, { f: C5, at: 0.28, dur: 0.4, type: 'triangle' }],
}

/* ------------------------------------------------------- shared shape of a note */
const TAU = Math.PI * 2
/** One period of the wave at phase p (0…1). */
function wave(type: OscillatorType, p: number): number {
  switch (type) {
    case 'square': return p < 0.5 ? 1 : -1
    case 'triangle': return 4 * Math.abs(p - 0.5) - 1
    case 'sawtooth': return 2 * p - 1
    default: return Math.sin(TAU * p)
  }
}
/** The envelope both paths use: 12 ms exponential attack, exponential decay to silence. */
function envelope(t: number, dur: number, peak: number): number {
  const a = 0.012
  if (t < a) return peak * Math.pow(t / a, 2)
  const x = (t - a) / Math.max(0.001, dur - a)
  return peak * Math.pow(0.0005 / peak, Math.min(1, x))
}

/* ---------------------------------------------------------- path 1: oscillators */
function playLive(c: AudioContext, notes: Note[]) {
  const t0 = c.currentTime + 0.004
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

/* ------------------------------------------- path 2: pre-rendered WAV + elements */
/** Render the notes to mono PCM, matching the oscillator path's shape. */
function render(notes: Note[]): Float32Array {
  const end = Math.max(...notes.map(n => n.at + n.dur)) + 0.02
  const out = new Float32Array(Math.ceil(end * RATE))
  for (const n of notes) {
    const start = Math.floor(n.at * RATE), len = Math.ceil(n.dur * RATE)
    const peak = n.gain ?? 0.18
    let phase = 0
    for (let i = 0; i < len; i++) {
      const t = i / RATE
      // a `to` note glides exponentially, as exponentialRampToValueAtTime does
      const f = n.to ? n.f * Math.pow(n.to / n.f, Math.min(1, t / n.dur)) : n.f
      phase = (phase + f / RATE) % 1
      const k = start + i
      if (k < out.length) out[k] += wave(n.type ?? 'sine', phase) * envelope(t, n.dur, peak)
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.max(-1, Math.min(1, out[i]))
  return out
}
/** 16-bit mono WAV around the PCM. */
export function wavBlob(pcm: Float32Array, rate = RATE): Blob {
  const buf = new ArrayBuffer(44 + pcm.length * 2), view = new DataView(buf)
  const str = (at: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); view.setUint32(4, 36 + pcm.length * 2, true); str(8, 'WAVE')
  str(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  str(36, 'data'); view.setUint32(40, pcm.length * 2, true)
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, Math.round(pcm[i] * 32767), true)
  return new Blob([buf], { type: 'audio/wav' })
}

const urls = new Map<string, string>()
function urlFor(name: string): string | null {
  if (!SOUNDS[name] || typeof URL === 'undefined' || typeof Blob === 'undefined') return null
  let u = urls.get(name)
  if (!u) { u = URL.createObjectURL(wavBlob(render(SOUNDS[name]))); urls.set(name, u) }
  return u
}

// A small pool so two sounds can overlap; unlocked together on the first gesture.
const POOL = 3
let pool: HTMLAudioElement[] = []
let poolAt = 0
function elements(): HTMLAudioElement[] {
  if (!pool.length && typeof Audio !== 'undefined') {
    pool = Array.from({ length: POOL }, () => { const a = new Audio(); a.preload = 'auto'; a.volume = 0.9; return a })
  }
  return pool
}
function playElement(name: string) {
  const els = elements(); if (!els.length) return
  const url = urlFor(name); if (!url) return
  const el = els[poolAt = (poolAt + 1) % els.length]
  try {
    if (el.src !== url) el.src = url
    el.currentTime = 0
    void el.play().catch(() => { /* not unlocked yet: the next gesture fixes it */ })
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------- context lifecycle */
function ctor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}
/** Safari also has the non-standard 'interrupted'; anything but 'running' has a frozen clock. */
const running = () => ctx?.state === 'running'

/** Nudge the context back to running. Safe to call often; used after every word clip. */
export function resumeSfx() {
  if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => { /* needs a gesture */ })
}

/** A silent looping source keeps the audio session ours, so Safari stops interrupting the context. */
function keepAlive(c: AudioContext) {
  try {
    const buf = c.createBuffer(1, Math.max(1, Math.round(c.sampleRate * 0.5)), c.sampleRate)
    const src = c.createBufferSource(), g = c.createGain()
    src.buffer = buf; src.loop = true; g.gain.value = 0.0001
    src.connect(g).connect(c.destination); src.start()
  } catch { /* not fatal */ }
}

let unlockDone = false
/** Called on the first user gesture: create the context, resume it, prime the element pool. */
export function unlockSfx() {
  if (unlockDone) return
  unlockDone = true
  const C = ctor()
  if (C) {
    try {
      ctx ??= new C({ latencyHint: 'interactive' })
      void ctx.resume().catch(() => { /* ignore */ })
      keepAlive(ctx)
      ctx.addEventListener?.('statechange', () => { if (ctx && ctx.state !== 'running') resumeSfx() })
    } catch { ctx = null }
  }
  // prime every pooled element inside the gesture, or iOS refuses later programmatic play()
  const url = urlFor('tap')
  for (const el of elements()) {
    try { if (url) el.src = url; el.muted = true; void el.play().then(() => { el.pause(); el.currentTime = 0; el.muted = false }).catch(() => { el.muted = false }) }
    catch { el.muted = false }
  }
}
if (typeof document !== 'undefined') {
  const once = { once: true, capture: true } as const
  for (const ev of ['pointerdown', 'touchstart', 'mousedown', 'keydown'] as const) document.addEventListener(ev, unlockSfx, once)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resumeSfx() })
}

/* ---------------------------------------------------------------------- playing */
function emit(name: string) {
  if (!enabled) return
  if (running()) { playLive(ctx!, SOUNDS[name]); return }
  playElement(name)      // frozen clock: the element pool is immediate
  resumeSfx()            // and get the context back for next time
}

/** For verification: which path a sound would take right now. */
export const sfxDebug = () => ({ enabled, state: ctx?.state ?? 'none', path: running() ? 'webaudio' : 'element', unlocked: unlockDone, rendered: [...urls.keys()] })

export const sfx = {
  correct: () => emit('correct'),
  warn: () => emit('warn'),
  wrong: () => emit('wrong'),
  tap: () => emit('tap'),
  pop: () => emit('pop'),
  soft: () => emit('soft'),
  complete: () => emit('complete'),
  fanfare: () => emit('fanfare'),
  tick: () => emit('tick'),
  timeup: () => emit('timeup'),
  /** the verdict sound for a graded answer */
  result: (correct: boolean, tier?: 'exact' | 'diacritics' | 'wrong') => (correct ? (tier === 'diacritics' ? sfx.warn() : sfx.correct()) : sfx.wrong()),
}

/** Pre-render every sound at startup: the first tap then costs nothing. Idle-time, never blocking. */
export function warmSfx() {
  const go = () => { for (const name of Object.keys(SOUNDS)) urlFor(name) }
  if (typeof requestIdleCallback === 'function') requestIdleCallback(go, { timeout: 2000 })
  else if (typeof setTimeout === 'function') setTimeout(go, 300)
}
