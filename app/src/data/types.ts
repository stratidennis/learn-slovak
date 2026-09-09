// Shapes produced by pipeline/export_app_content.py
export type Guide = { ro: string | null; ipa: string | null }
export type Lexeme = {
  l: string; pos: string | null; ro: string[]; en: string[]; ipa: string | null; ipa_src?: 'kaikki' | 'generated' | null; spell?: string
  b: number; rk: number; g: string | null; asp: string | null; flag: string | null
  cog: { ro: string; note: string; semantic_shift: boolean }[] | null
  ff: { ro: string; ro_means: string; sk_means: string }[] | null
  forms: [string, string[]][]; rs: string
}
export type Unit = {
  id: string; title: string; title_ro: string; sas_area: string | null; can_do: string[]
  can_do_ro?: string[]; items?: { kind: string; id: string }[]; grammar_notes: string[]; exercise_sequence: string[]; roleplay: string | null; creative: string | null
  domain_pack: string | null; milestone: string | null; phase: number; chunks: string[]
}
export type ChunkVariant = { sk: string; note: string; note_ro?: string; register: string; audio?: AudioRef | null; audio_slow?: string; guide?: Guide }
export type AudioRef = { file: string; spoken_text?: string | null; tts_voice?: string }
export type Chunk = {
  id: string; unit: string; sk: string; ro: string; en: string; register: string
  variants: ChunkVariant[]; notes: string | null; notes_ro?: string | null; examples: string[]; function: string | null
  audio: AudioRef | null; audio_slow?: string; guide?: Guide; review_status: string
}
export type Sentence = {
  id: string; sk: string; en: string[]; ro: string[]; ro_src?: 'tatoeba' | 'draft' | null; lemmas: string[]
  audio: string; audio_slow?: string; guide?: Guide; native: boolean; band: number; attr: string; lic: string
}
export type L2 = { en: string | null; ro: string | null }
/** audio_sound = the letter read on its own (a vowel says itself, a consonant its letter name); audio_name = the spelling name. */
export type AlphabetLetter = { letter: string; name: string; ipa: string; anchor: L2; example: string; example_spell: string | null; note: L2; audio_sound?: string; audio_name: string; audio_example: string | null }
export type Alphabet = { letters: AlphabetLetter[]; diphthongs: { d: string; ipa: string; anchor: L2; example: string }[] }
export type GrammarNote = {
  id: string; title: string; title_ro?: string | null; unit: string; tags: string[]; body: string; body_ro?: string | null; ro_analogy: string | null
  table: string[][] | null; table_ro?: string[][] | null; examples: string[]; related: string[]; level: string
}
export type MinimalPair = {
  id: string; contrast: string; a: string; b: string | null; ipa_a: string; ipa_b: string | null
  gloss: string; kind: 'pair' | 'prosody'; both_real?: boolean
  audio: { a: AudioRef; b?: AudioRef } | null
}
export type DialogueLine = { sk: string; ro: string; en: string; audio: string; audio_slow?: string; guide?: Guide }
/** A two-line exchange: A is the other person (other voice), B the coherent reply (unit voice). */
export type Dialogue = { id: string; unit: string; a: DialogueLine; b: DialogueLine; note: string | null; note_ro: string | null }
