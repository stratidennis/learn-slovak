import type { Alphabet, Chunk, GrammarNote, Lexeme, MinimalPair, Sentence, Unit } from './types'

const cache = new Map<string, Promise<unknown>>()
function load<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    cache.set(path, fetch(`/content/${path}`).then(r => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`)
      return r.json()
    }))
  }
  return cache.get(path) as Promise<T>
}

export const loadUnits = () => load<Unit[]>('units.json')
export const loadChunks = (unit: string) => load<Chunk[]>(`chunks/${unit}.json`).catch(() => [] as Chunk[])
export const loadSentences = (unit: string) => load<Sentence[]>(`sentences/${unit}.json`).catch(() => [] as Sentence[])
export const loadGrammar = () => load<GrammarNote[]>('grammar_notes.json')
export const loadMinimalPairs = () => load<MinimalPair[]>('minimal_pairs.json')
export const loadCoverage = () => load<Record<string, number>>('coverage.json')

let lexemeIndex: Promise<Map<string, Lexeme>> | null = null
export function loadLexemes(): Promise<Map<string, Lexeme>> {
  if (!lexemeIndex) lexemeIndex = load<Lexeme[]>('lexemes.json').then(rows => new Map(rows.map(r => [r.l, r])))
  return lexemeIndex
}
export const loadFormsIndex = () => load<Record<string, string>>('forms_index.json')
export const loadAlphabet = () => load<Alphabet[]>('alphabet.json').then(a => a[0])
