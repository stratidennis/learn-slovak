// What each kind of item takes part in, outside its own lessons (D138). ONE table, typed as a Record over
// every ItemKind: adding a kind to the union without deciding here is a compile error, so a new section can
// never silently fall out of practice again — which is what happened to the 0.4 words (D137). Recap takes
// every kind, always: anything a finished lesson taught comes back on a schedule; there is no switch for it.
import type { ItemKind } from './types'

type Participation = {
  card: boolean        // Flashcards: needs a Slovak side and a meaning worth recalling
  match: boolean       // Speed match: needs a short meaning that is unique among its neighbours
  why?: string         // required whenever a kind is left out of something, so the choice is visible
}

export const KIND_PRACTICE: Record<ItemKind, Participation> = {
  letter:   { card: true,  match: false, why: 'a letter\'s "meaning" is its sound hint — fine to flip, useless to race' },
  pair:     { card: false, match: false, why: 'a sound pair has nothing to recall: it is a which-did-you-hear drill (Recap runs it)' },
  cognate:  { card: true,  match: true },
  word:     { card: true,  match: true },
  chunk:    { card: true,  match: true },
  dialogue: { card: true,  match: true },
  sentence: { card: true,  match: true },
}

export const ALL_KINDS = Object.keys(KIND_PRACTICE) as ItemKind[]
