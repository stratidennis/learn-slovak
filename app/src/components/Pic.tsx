import { useState } from 'react'

/** The Noto Color Emoji file for one emoji cluster (same rule as pipeline noto_name: drop FE0F). */
export const notoName = (cluster: string) => 'emoji_u' + [...cluster].map(c => c.codePointAt(0)!).filter(cp => cp !== 0xfe0f).map(cp => cp.toString(16)).join('_')
const clusters = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter
  if (Seg) return Array.from(new Seg('sk', { granularity: 'grapheme' }).segment(s), x => x.segment).filter(x => x.trim())
  return [...s].filter(x => x.trim())
}

/** A picture cue: the bundled Noto SVG (same on every phone), falling back to the platform emoji. */
export function Pic({ emoji, size = 64, className }: { emoji: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const parts = clusters(emoji)
  return (
    <span className={`pic ${className ?? ''}`} style={{ display: 'inline-flex', gap: Math.round(size / 8), alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} aria-hidden>
      {parts.map((c, i) => broken.has(c)
        ? <span key={i} style={{ fontSize: size * 0.85 }}>{c}</span>
        : <img key={i} src={`/img/emoji/${notoName(c)}.svg`} width={size} height={size} alt="" draggable={false}
            onError={() => setBroken(b => new Set(b).add(c))} style={{ width: size, height: size }} />)}
    </span>
  )
}
