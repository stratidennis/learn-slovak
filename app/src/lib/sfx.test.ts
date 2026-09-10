import { describe, expect, it, vi } from 'vitest'
vi.mock('../db/db', () => ({ getSetting: async (_k: string, d: unknown) => d }))
const { SOUNDS, wavBlob } = await import('./sfx')

/** The element fallback (the path that runs when Safari has interrupted the context) needs a valid WAV. */
describe('sfx pre-rendering', () => {
  it('defines every sound the app asks for', () => {
    for (const k of ['correct', 'warn', 'wrong', 'tap', 'pop', 'soft', 'complete', 'fanfare', 'tick', 'timeup']) {
      expect(SOUNDS[k]?.length, k).toBeGreaterThan(0)
      for (const n of SOUNDS[k]) { expect(n.f).toBeGreaterThan(20); expect(n.dur).toBeGreaterThan(0); expect(n.dur).toBeLessThan(1) }
    }
  })
  it('wraps PCM in a 16-bit mono WAV header of the right size', async () => {
    const pcm = new Float32Array(2400).map((_, i) => Math.sin(i / 5) * 0.5)
    const blob = wavBlob(pcm, 24000)
    expect(blob.type).toBe('audio/wav')
    expect(blob.size).toBe(44 + pcm.length * 2)
    const head = new DataView(await blob.arrayBuffer())
    const tag = (at: number) => String.fromCharCode(head.getUint8(at), head.getUint8(at + 1), head.getUint8(at + 2), head.getUint8(at + 3))
    expect(tag(0)).toBe('RIFF'); expect(tag(8)).toBe('WAVE'); expect(tag(12)).toBe('fmt '); expect(tag(36)).toBe('data')
    expect(head.getUint16(20, true)).toBe(1)          // PCM
    expect(head.getUint16(22, true)).toBe(1)          // mono
    expect(head.getUint32(24, true)).toBe(24000)      // sample rate
    expect(head.getUint16(34, true)).toBe(16)         // bits
    expect(head.getUint32(40, true)).toBe(pcm.length * 2)
    expect(Math.abs(head.getInt16(44 + 1000, true))).toBeGreaterThan(0)   // not silence
  })
})
