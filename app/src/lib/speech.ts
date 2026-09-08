// Speaking step support: a MediaRecorder for "you vs. the model" playback, and — where the browser has
// it — the platform speech recogniser (Web Speech API, sk-SK) to check the words. Recognition is a
// hint, never a verdict: the score is lenient and never demotes an item (EXERCISE-TYPES.md A6).
import { stripDiacritics } from './normalize'

type SR = { lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start(): void; stop(): void; abort(): void }
type SRCtor = new () => SR
const srCtor = (): SRCtor | null => {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
export const hasSpeechCheck = () => typeof window !== 'undefined' && !!srCtor()
export const hasRecorder = () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'

const norm = (s: string) => stripDiacritics(s.toLowerCase()).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
function lev(a: string, b: string): number {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur }
  return prev[n]
}
/** Fraction of target words found in the transcript (diacritics ignored, one typo allowed on words of 4+ letters). */
export function matchScore(target: string, heard: string): { score: number; hits: boolean[] } {
  const t = norm(target), h = norm(heard)
  if (!t.length) return { score: 0, hits: [] }
  const used = new Set<number>()
  const hits = t.map(w => {
    const i = h.findIndex((x, k) => !used.has(k) && (x === w || (w.length >= 4 && lev(x, w) <= 1)))
    if (i >= 0) { used.add(i); return true }
    return false
  })
  // single short words: also accept a transcript that merely contains the word (ASR loves to add "a", "to")
  const score = hits.filter(Boolean).length / t.length
  return { score, hits }
}
/** Best score over the recogniser's alternatives. */
export function bestMatch(target: string, alternatives: string[]): { score: number; heard: string; hits: boolean[] } {
  let best = { score: -1, heard: '', hits: [] as boolean[] }
  for (const a of alternatives) { const m = matchScore(target, a); if (m.score > best.score) best = { ...m, heard: a } }
  return best.score < 0 ? { score: 0, heard: alternatives[0] ?? '', hits: [] } : best
}

export type Take = { url: string | null; heard: string | null; score: number | null; hits: boolean[] }

/** One recording session: mic → MediaRecorder (+ recogniser when available). Resolve with the take on stop(). */
export function startTake(target: string, useCheck: boolean, onState?: (s: 'rec' | 'processing') => void): Promise<{ stop: () => Promise<Take> }> {
  return new Promise(async (resolve, reject) => {
    let stream: MediaStream | null = null
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) } catch (e) { reject(e); return }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', ''].find(m => !m || MediaRecorder.isTypeSupported(m)) ?? ''
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    const parts: Blob[] = []
    rec.ondataavailable = e => { if (e.data.size) parts.push(e.data) }
    // recogniser, best-effort: any error (no network, iOS quirks, denied) just means "no words"
    let alts: string[] = []; let srDone: Promise<void> = Promise.resolve(); let sr: SR | null = null
    if (useCheck) {
      const C = srCtor()
      if (C) {
        try {
          sr = new C(); sr.lang = 'sk-SK'; sr.interimResults = false; sr.maxAlternatives = 5; sr.continuous = false
          srDone = new Promise<void>(res => {
            const done = () => res()
            sr!.onresult = e => { const r = e.results[0]; alts = Array.from({ length: r.length }, (_, i) => r[i].transcript) }
            sr!.onerror = done; sr!.onend = done
            setTimeout(done, 4000)                       // never hang on a recogniser that forgot to end
          })
          sr.start()
        } catch { sr = null }
      }
    }
    rec.start()
    onState?.('rec')
    const stop = () => new Promise<Take>(res => {
      onState?.('processing')
      rec.onstop = async () => {
        stream?.getTracks().forEach(t => t.stop())
        try { sr?.stop() } catch { /* already ended */ }
        await srDone
        const url = parts.length ? URL.createObjectURL(new Blob(parts, { type: rec.mimeType || 'audio/webm' })) : null
        if (alts.length) { const m = bestMatch(target, alts); res({ url, heard: m.heard, score: m.score, hits: m.hits }) }
        else res({ url, heard: null, score: null, hits: [] })
      }
      try { rec.stop() } catch { rec.onstop?.(new Event('stop')) }
    })
    resolve({ stop })
  })
}
