import { SLOVAK_KEYS } from '../lib/normalize'

/** A row of the letters phone keyboards hide. Inserts at the caret of the given input. */
export function SlovakKeyboard({ inputRef, onChange }: { inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>; onChange: (v: string) => void }) {
  const insert = (ch: string) => {
    const el = inputRef.current; if (!el) return
    const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? s
    const v = el.value.slice(0, s) + ch + el.value.slice(e)
    onChange(v)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 1, s + 1) })
  }
  return (
    <div className="keys" role="toolbar" aria-label="Slovenské písmená">
      {SLOVAK_KEYS.map(k => <button key={k} className="key" onPointerDown={e => { e.preventDefault(); insert(k) }}>{k}</button>)}
    </div>
  )
}
