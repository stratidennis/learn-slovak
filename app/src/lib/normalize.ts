/** Diacritic-insensitive key: "Kávu, prosím!" -> "kavu prosim" */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}
export function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[.,!?;:„“"'()…\-–—]/g, ' ').split(/\s+/).filter(Boolean)
}
export const SLOVAK_KEYS = ['ľ', 'š', 'č', 'ť', 'ž', 'ý', 'á', 'í', 'é', 'ď', 'ň', 'ô', 'ä', 'ú', 'ó', 'ŕ', 'ĺ']
