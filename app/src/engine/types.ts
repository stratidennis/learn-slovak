import type { Chunk, Dialogue, Sentence, AlphabetLetter, MinimalPair, WordConvo, WordPhrase } from '../data/types'

export type ItemKind = 'chunk' | 'sentence' | 'letter' | 'pair' | 'cognate' | 'word' | 'dialogue'
export type ItemRef = { kind: ItemKind; id: string }

export type Cognate = { id: string; sk: string; sk_all: string; ro: string; en: string; note: string; shift: boolean; spell: string; emoji: string | null; audio: string }

/** Everything an exercise needs about an item, normalised across kinds. */
export type Item = {
  ref: ItemRef
  sk: string                 // the Slovak to learn (letter, word, chunk or sentence)
  meaning: { ro: string; en: string }
  audio: string | null       // normal clip
  audioSlow: string | null
  spell: string | null       // Romanian respelling
  ipa: string | null
  emoji: string | null
  note: { ro: string | null; en: string | null }
  register?: string
  // kind-specific
  letter?: AlphabetLetter
  pair?: MinimalPair
  chunk?: Chunk
  sentence?: Sentence
  cognate?: Cognate
  dialogue?: Dialogue      // for kind 'dialogue': sk/meaning/audio describe line B (the reply); A is in here
  // for kind 'word' (D132): the same word inside a phrase, and inside a conversation
  phrase?: WordPhrase
  convo?: WordConvo
}

export type StepType = 'intro' | 'meaning' | 'form' | 'match' | 'tiles' | 'cloze' | 'typeword' | 'listentype' | 'pairab' | 'letterpick' | 'anchor' | 'reply'

export type Step =
  | { type: 'intro'; item: Item }
  | { type: 'meaning'; item: Item; options: Item[] }              // pick the meaning of item.sk
  | { type: 'form'; item: Item; options: Item[]; audioOnly: boolean } // pick the Slovak
  | { type: 'match'; items: Item[] }                              // 4–5 pairs
  | { type: 'tiles'; item: Item; tiles: string[] }                // assemble item.sk
  | { type: 'cloze'; item: Item; blankIndex: number; options: string[] }
  | { type: 'typeword'; item: Item; blankIndex: number }          // type the missing word (or the whole word for single-word items)
  | { type: 'listentype'; item: Item }
  | { type: 'pairab'; item: Item; playB: boolean }                // which of the two did you hear?
  | { type: 'letterpick'; item: Item; options: Item[] }           // hear the letter name → pick the letter
  | { type: 'anchor'; item: Item; options: Item[] }               // see the letter → pick its sound anchor
  | { type: 'reply'; item: Item; options: Item[]; audioOnly: boolean } // hear/see line A → pick the reply (B) from 4

export type StepResult = { correct: boolean; tier?: 'exact' | 'diacritics' | 'wrong'; typed?: string }

/** Mastery state per item, persisted. Stages: see curriculum/LEARNING-ENGINE.md §2. */
export type ItemState = {
  id: string; unitId: string; kind: ItemKind
  stage: number          // 0 new … 6 mastered
  intro?: number         // which version of the item's intro card was actually presented (D133)
  streak: number
  seen: number
  lastAt: number         // ms
  stageAtDayStart: number
  dayKey: string         // YYYY-MM-DD of last session, for the "≤2 stages per day" rule
}
