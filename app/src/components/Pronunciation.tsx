import { useEffect, useState } from 'react'
import { getSetting } from '../db/db'

export type GuideMode = 'off' | 'ro' | 'ipa' | 'both'
export function usePronunciationMode(): GuideMode {
  const [m, setM] = useState<GuideMode>('ro')
  useEffect(() => { getSetting<GuideMode>('pronunciation', 'ro').then(setM) }, [])
  return m
}
/** The line under Slovak text: CAPS = stressed first syllable; ɦ = voiced h; doubled vowel = long. */
export function Pronunciation({ ro, ipa }: { ro?: string | null; ipa?: string | null }) {
  const mode = usePronunciationMode()
  if (mode === 'off' || (!ro && !ipa)) return null
  return (
    <div className="guide">
      {(mode === 'ro' || mode === 'both') && ro && <div className="guide-ro" title="Romanian-style respelling. CAPS = stressed syllable, doubled vowel = long, ɦ = voiced h">{ro}</div>}
      {(mode === 'ipa' || mode === 'both') && ipa && <div className="guide-ipa mono">{ipa}</div>}
    </div>
  )
}
