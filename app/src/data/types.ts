// Shapes produced by pipeline/export_app_content.py
export type Lexeme = {
  l: string; pos: string | null; ro: string[]; en: string[]; ipa: string | null
  b: number; rk: number; g: string | null; asp: string | null; flag: string | null
  cog: { ro: string; note: string; semantic_shift: boolean }[] | null
  ff: { ro: string; ro_means: string; sk_means: string }[] | null
  forms: [string, string[]][]; rs: string
}
export type Unit = {
  id: string; title: string; title_ro: string; sas_area: string | null; can_do: string[]
  grammar_notes: string[]; exercise_sequence: string[]; roleplay: string | null; creative: string | null
  domain_pack: string | null; milestone: string | null; phase: number; chunks: string[]
}
export type ChunkVariant = { sk: string; note: string; register: string; audio?: AudioRef | null }
export type AudioRef = { file: string; spoken_text?: string | null; tts_voice?: string }
export type Chunk = {
  id: string; unit: string; sk: string; ro: string; en: string; register: string
  variants: ChunkVariant[]; notes: string | null; examples: string[]; function: string | null
  audio: AudioRef | null; review_status: string
}
export type Sentence = {
  id: string; sk: string; en: string[]; ro: string[]; lemmas: string[]
  audio: string; native: boolean; band: number; attr: string; lic: string
}
export type GrammarNote = {
  id: string; title: string; unit: string; tags: string[]; body: string; ro_analogy: string | null
  table: string[][] | null; examples: string[]; related: string[]; level: string
}
export type MinimalPair = {
  id: string; contrast: string; a: string; b: string | null; ipa_a: string; ipa_b: string | null
  gloss: string; kind: 'pair' | 'prosody'; both_real?: boolean
  audio: { a: AudioRef; b?: AudioRef } | null
}
