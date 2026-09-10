import { useEffect, useRef, useState } from 'react'
import type { Item, Step, StepResult } from '../../engine/types'
import type { DialogueLine } from '../../data/types'
import { AudioButton, playAudio, playSequence } from '../../components/AudioButton'
import { SlovakKeyboard } from '../../components/SlovakKeyboard'
import { Pronunciation } from '../../components/Pronunciation'
import { RegisterChip } from '../../components/RegisterChip'
import { Pic } from '../../components/Pic'
import { grade } from '../../lib/grade'
import { stripDiacritics } from '../../lib/normalize'
import { useLang, useT } from '../../i18n'
import { sfx } from '../../lib/sfx'
import { letterSeq } from '../../engine/items'

type Props<S extends Step> = { step: S; onAnswer: (r: StepResult) => void; locked: boolean }
const meaningOf = (it: Item, lang: 'ro' | 'en') => lang === 'ro' ? it.meaning.ro : it.meaning.en
const lineMeaning = (l: DialogueLine, lang: 'ro' | 'en') => lang === 'ro' ? l.ro : l.en

/* ---------------------------------------------------------------- intro */
export function IntroStep({ step, onAnswer }: Props<Extract<Step, { type: 'intro' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item
  const note = lang === 'ro' ? it.note.ro : it.note.en
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{t.step_intro}</p>
      <div className="card center" style={{ padding: 28 }}>
        {it.emoji && <Pic emoji={it.emoji} size={72} />}
        <div className="sk big" style={{ fontSize: it.ref.kind === 'letter' ? '4rem' : '2.25rem', marginTop: 8 }}>{it.sk}</div>
        {it.ref.kind === 'letter' ? <div className="muted"><span className="mono">{it.ipa}</span></div> : <Pronunciation ro={it.spell} ipa={it.ipa} />}
        <div style={{ fontSize: '1.25rem', marginTop: 10 }}>{meaningOf(it, lang)}</div>
        {it.ref.kind === 'letter' && it.letter?.audio_example && it.letter.example !== '—' && (
          <button className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 8, width: '100%' }} onClick={() => void playAudio(`/${it.letter!.audio_example}`)}>
            <span className="small muted">{t.letter_in_word}:</span><span className="sk" style={{ fontSize: '1.3rem' }}>{it.letter.example}</span><span className="guide-ro small">{it.letter.example_spell}</span><span className="muted">▶</span>
          </button>)}
        {it.ref.kind === 'letter' && <div className="small muted" style={{ marginTop: 4 }}>{t.letter_spell_name}: <b>{it.spell}</b></div>}
        {it.ref.kind === 'word' && it.phrase && (
          <button className="stack" style={{ gap: 2, marginTop: 10, width: '100%', justifyItems: 'center' }} onClick={() => it.phrase!.audio && void playAudio(`/${it.phrase!.audio}`)}>
            <span className="small muted">{t.word_in_phrase}</span>
            <span className="row" style={{ gap: 8, justifyContent: 'center' }}><span className="sk" style={{ fontSize: '1.2rem' }}>{it.phrase.sk}</span><span className="muted">▶</span></span>
            <span className="small muted">{lang === 'ro' ? it.phrase.ro : it.phrase.en}</span>
          </button>)}
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>{it.audio && <AudioButton src={it.audio} seq={letterSeq(it)} slowSrc={it.audioSlow} autoPlay />}</div>
        {it.register && <div style={{ marginTop: 8 }}><RegisterChip register={it.register} /></div>}
        {note && <p className="small" style={{ background: 'var(--primary-soft)', padding: '10px 12px', borderRadius: 12, marginTop: 14, textAlign: 'left' }}>{note}</p>}
      </div>
      <button className="btn primary block" onClick={() => { sfx.tap(); onAnswer({ correct: true }) }}>{t.got_it}</button>
    </div>
  )
}

/* ------------------------------------------------------------ dialogue intro */
/** Both lines as chat bubbles; A then B auto-play in their two voices. */
export function DialogueIntroStep({ step, onAnswer }: Props<Extract<Step, { type: 'intro' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item; const x = it.dialogue!
  const note = lang === 'ro' ? it.note.ro : it.note.en
  const both = () => void playSequence([`/${x.a.audio}`, `/${x.b.audio}`], 250)   // a breath between the two speakers
  useEffect(() => { both() }, [x.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const Line = ({ l, side }: { l: DialogueLine; side: 'a' | 'b' }) => (
    <div className={`bubble ${side}`}>
      {side === 'a' && <div className="who">🗣️</div>}
      <div><div className="sk">{l.sk}</div><Pronunciation ro={l.guide?.ro} ipa={l.guide?.ipa} /><div className="small muted">{lineMeaning(l, lang)}</div></div>
      <button className="audiobtn small" onClick={() => void playAudio(`/${l.audio}`)} aria-label={t.replay}>▶</button>
    </div>
  )
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{t.step_dialogue_intro}</p>
      <div className="dlg"><Line l={x.a} side="a" /><Line l={x.b} side="b" /></div>
      <div className="row" style={{ justifyContent: 'center' }}><button className="btn ghost" onClick={both}>▶ {t.replay_both}</button></div>
      {note && <p className="small" style={{ background: 'var(--primary-soft)', padding: '10px 12px', borderRadius: 12, margin: 0 }}>{note}</p>}
      <button className="btn primary block" onClick={() => { sfx.tap(); onAnswer({ correct: true }) }}>{t.got_it}</button>
    </div>
  )
}

/* ------------------------------------------------------------ pick the reply */
export function ReplyStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'reply' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item; const x = it.dialogue!
  const [picked, setPicked] = useState<string | null>(null)
  const choose = (o: Item) => {
    if (locked || picked) return
    setPicked(o.ref.id); const ok = o.ref.id === it.ref.id
    if (ok && it.audio) void playAudio(it.audio)             // hear the exchange complete itself
    onAnswer({ correct: ok })
  }
  const pickedItem = picked ? step.options.find(o => o.ref.id === picked) : null
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{step.audioOnly ? t.step_reply_audio : t.step_reply}</p>
      <div className="dlg">
        <div className="bubble a"><div className="who">🗣️</div>
          {step.audioOnly ? <AudioButton src={`/${x.a.audio}`} slowSrc={x.a.audio_slow ? `/${x.a.audio_slow}` : null} autoPlay />
            : <><div><div className="sk">{x.a.sk}</div><div className="small muted">{lineMeaning(x.a, lang)}</div></div><AudioButton src={`/${x.a.audio}`} compact autoPlay /></>}
        </div>
        <div className="bubble b">{pickedItem ? <span className="sk">{pickedItem.sk}</span> : <span className="muted" style={{ letterSpacing: 2 }}>…</span>}</div>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {step.options.map(o => {
          const isAns = o.ref.id === it.ref.id, isPick = picked === o.ref.id
          const cls = picked ? (isAns ? 'choice ok' : isPick ? 'choice bad' : 'choice') : 'choice'
          return <button key={o.ref.id} className={cls} onClick={() => choose(o)} disabled={!!picked}><span className="sk">{o.sk}</span></button>
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------ choice (meaning / form / letter / anchor) */
export function ChoiceStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'meaning' | 'form' | 'letterpick' | 'anchor' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item
  const [picked, setPicked] = useState<string | null>(null)
  const prompt = step.type === 'meaning' ? t.step_meaning : step.type === 'form' ? (step.audioOnly ? t.step_form_audio : t.step_form_text) : step.type === 'letterpick' ? t.step_letterpick : t.step_anchor
  const showSk = step.type === 'meaning' || (step.type === 'form' && !step.audioOnly)
  const label = (o: Item) => step.type === 'meaning' || step.type === 'anchor' ? meaningOf(o, lang) : o.sk
  const choose = (o: Item) => { if (locked || picked) return; setPicked(o.ref.id); onAnswer({ correct: o.ref.id === it.ref.id }) }
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{prompt}</p>
      <div className="card center">
        {(step.type === 'form' && step.audioOnly) || step.type === 'letterpick' ? <div className="row" style={{ justifyContent: 'center' }}><AudioButton src={it.audio!} seq={letterSeq(it)} slowSrc={it.audioSlow} autoPlay /></div>
          : <>
            {it.emoji && step.type === 'meaning' && <Pic emoji={it.emoji} size={64} />}
            <div className="sk big" style={{ fontSize: step.type === 'anchor' ? '4rem' : '2rem' }}>{showSk || step.type === 'anchor' ? it.sk : meaningOf(it, lang)}</div>
            {showSk && it.audio && <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}><AudioButton src={it.audio} slowSrc={it.audioSlow} autoPlay compact /></div>}
          </>}
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {step.options.map(o => {
          const isAns = o.ref.id === it.ref.id, isPick = picked === o.ref.id
          const cls = picked ? (isAns ? 'choice ok' : isPick ? 'choice bad' : 'choice') : 'choice'
          return <button key={o.ref.id} className={cls} onClick={() => choose(o)} disabled={!!picked}>
            {step.type === 'form' && o.emoji ? <Pic emoji={o.emoji} size={26} /> : null}
            <span className={step.type === 'meaning' || step.type === 'anchor' ? '' : 'sk'} style={step.type === 'letterpick' ? { fontSize: '2rem' } : {}}>{label(o)}</span>
          </button>
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- match */
export function MatchStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'match' }>>) {
  const t = useT(); const lang = useLang()
  const [left] = useState(() => [...step.items].sort(() => Math.random() - 0.5))
  const [right] = useState(() => [...step.items].sort(() => Math.random() - 0.5))
  const [sel, setSel] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState(0)
  const [shake, setShake] = useState<string | null>(null)
  const pickLeft = (id: string) => { if (locked || done.has(id)) return; sfx.tap(); setSel(id); const it = step.items.find(i => i.ref.id === id); if (it?.audio) void playAudio(it.audio) }
  const pickRight = (id: string) => {
    if (locked || !sel || done.has(id)) return
    if (id === sel) { const d = new Set(done); d.add(id); setDone(d); setSel(null); if (d.size === step.items.length) onAnswer({ correct: wrong === 0 }); else sfx.pop() }
    else { sfx.wrong(); setWrong(w => w + 1); setShake(id); setTimeout(() => setShake(null), 400); setSel(null) }
  }
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{t.step_match}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="stack" style={{ gap: 8 }}>{left.map(i => <button key={i.ref.id} className={`choice ${done.has(i.ref.id) ? 'ok' : sel === i.ref.id ? 'sel' : ''}`} onClick={() => pickLeft(i.ref.id)} disabled={done.has(i.ref.id)}><span className="sk">{i.sk}</span></button>)}</div>
        <div className="stack" style={{ gap: 8 }}>{right.map(i => <button key={i.ref.id} className={`choice ${done.has(i.ref.id) ? 'ok' : shake === i.ref.id ? 'bad' : ''}`} onClick={() => pickRight(i.ref.id)} disabled={done.has(i.ref.id)}>{meaningOf(i, lang)}</button>)}</div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- tiles */
export function TilesStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'tiles' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item; const x = it.dialogue
  const [bank, setBank] = useState(step.tiles.map((w, i) => ({ w, i })))
  const [chosen, setChosen] = useState<{ w: string; i: number }[]>([])
  const norm = (s: string) => stripDiacritics(s.toLowerCase().replace(/[.,!?„“"…]/g, '')).trim()
  const target = it.sk.replace(/[„“"…]/g, '').split(/\s+/).map(norm).filter(Boolean)
  const check = () => onAnswer({ correct: chosen.map(c => norm(c.w)).join(' ') === target.join(' ') })
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{x ? t.step_tiles_reply : it.ref.kind === 'word' ? t.step_word_tiles : t.step_tiles}</p>
      {x ? <div className="dlg"><div className="bubble a"><div className="who">🗣️</div><div><div className="sk">{x.a.sk}</div><div className="small muted">{lineMeaning(x.a, lang)}</div></div><AudioButton src={`/${x.a.audio}`} compact autoPlay /></div>
        <div className="bubble b"><span className="small muted">{meaningOf(it, lang)}</span></div></div>
        : <div className="card"><div style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>{it.emoji && <Pic emoji={it.emoji} size={36} />}<span>{meaningOf(it, lang)}</span></div>
          {it.audio && <div style={{ marginTop: 8 }}><AudioButton src={it.audio} slowSrc={it.audioSlow} compact /></div>}</div>}
      <div className="tilebox">{chosen.length === 0 ? <span className="muted small">{t.tiles_hint}</span> : chosen.map((c, k) => <button key={c.i} className="tile on" onClick={() => { if (locked) return; sfx.tap(); setChosen(chosen.filter((_, j) => j !== k)); setBank([...bank, c].sort((a, b) => a.i - b.i)) }}>{c.w}</button>)}</div>
      <div className="row" style={{ gap: 8 }}>{bank.map(b => <button key={b.i} className="tile" onClick={() => { if (locked) return; sfx.tap(); setBank(bank.filter(x => x.i !== b.i)); setChosen([...chosen, b]) }}>{b.w}</button>)}</div>
      <button className="btn primary block" onClick={check} disabled={locked || chosen.length === 0}>{t.check}</button>
    </div>
  )
}

/* ---------------------------------------------------------------- cloze */
export function ClozeStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'cloze' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item
  const words = it.sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean)
  const answer = words[step.blankIndex].replace(/[.,!?]$/, '')
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{it.ref.kind === 'word' ? t.step_word_cloze : t.step_cloze}</p>
      <div className="card"><div className="sk big" style={{ fontSize: '1.75rem' }}>{words.map((w, i) => i === step.blankIndex ? <span key={i} className="blank">{picked ?? '____'}</span> : <span key={i}>{w} </span>)}</div>
        <div className="muted" style={{ marginTop: 8 }}>{meaningOf(it, lang)}</div>
        {it.audio && <div style={{ marginTop: 8 }}><AudioButton src={it.audio} slowSrc={it.audioSlow} compact /></div>}</div>
      <div className="row" style={{ gap: 8 }}>{step.options.map(o => <button key={o} className={`tile ${picked === o ? (o === answer ? 'okk' : 'badd') : ''}`} disabled={!!picked || locked} onClick={() => { setPicked(o); onAnswer({ correct: o === answer }) }}>{o}</button>)}</div>
    </div>
  )
}

/* ------------------------------------------------------------ type a word */
export function TypeWordStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'typeword' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item
  const words = it.sk.replace(/[„“"…]/g, '').split(/\s+/).filter(Boolean)
  const answer = words[step.blankIndex].replace(/[.,!?]$/, '')
  const [typed, setTyped] = useState(''); const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setTimeout(() => ref.current?.focus(), 60) }, [])
  const submit = () => { if (locked || !typed.trim()) return; const g = grade(answer, typed); onAnswer({ correct: g.nBad === 0, tier: g.nBad ? 'wrong' : g.nWarn ? 'diacritics' : 'exact', typed }) }
  const single = words.length === 1
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{single ? t.step_typeword_single : t.step_typeword}</p>
      <div className="card">
        {single ? <>{it.emoji && <Pic emoji={it.emoji} size={56} />}<div style={{ fontSize: '1.25rem' }}>{meaningOf(it, lang)}</div>{it.spell && <div className="guide-ro">{it.spell}</div>}</>
          : <><div className="sk big" style={{ fontSize: '1.6rem' }}>{words.map((w, i) => i === step.blankIndex ? <span key={i} className="blank">____</span> : <span key={i}>{w} </span>)}</div><div className="muted" style={{ marginTop: 6 }}>{meaningOf(it, lang)}</div></>}
        {it.audio && <div style={{ marginTop: 8 }}><AudioButton src={it.audio} slowSrc={it.audioSlow} autoPlay compact /></div>}
      </div>
      <input ref={ref} className="input" value={typed} onChange={e => setTyped(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} onKeyDown={e => { if (e.key === 'Enter') submit() }} placeholder="…" disabled={locked} />
      <SlovakKeyboard inputRef={ref} onChange={setTyped} />
      <button className="btn primary block" onClick={submit} disabled={locked || !typed.trim()}>{t.check}</button>
    </div>
  )
}

/* ------------------------------------------------------------ listen & type */
export function ListenTypeStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'listentype' }>>) {
  const t = useT(); const it = step.item
  const [typed, setTyped] = useState(''); const ref = useRef<HTMLTextAreaElement>(null)
  const submit = () => { if (locked || !typed.trim()) return; const g = grade(it.sk, typed); onAnswer({ correct: g.nBad === 0, tier: g.nBad ? 'wrong' : g.nWarn ? 'diacritics' : 'exact', typed }) }
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{t.type_heard}</p>
      <div className="card"><AudioButton src={it.audio!} slowSrc={it.audioSlow} autoPlay /></div>
      <textarea ref={ref} className="input" rows={2} value={typed} onChange={e => setTyped(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} placeholder="…" disabled={locked} />
      <SlovakKeyboard inputRef={ref} onChange={setTyped} />
      <button className="btn primary block" onClick={submit} disabled={locked || !typed.trim()}>{t.check}</button>
    </div>
  )
}

/* ------------------------------------------------------------ minimal pair A/B */
export function PairABStep({ step, onAnswer, locked }: Props<Extract<Step, { type: 'pairab' }>>) {
  const t = useT(); const lang = useLang(); const it = step.item; const p = it.pair!
  const src = step.playB ? `/${p.audio!.b!.file}` : `/${p.audio!.a.file}`
  const [picked, setPicked] = useState<'a' | 'b' | null>(null)
  const choose = (side: 'a' | 'b') => { if (locked || picked) return; setPicked(side); onAnswer({ correct: (side === 'b') === step.playB }) }
  const guide = it.spell?.split(' / ') ?? ['', '']
  return (
    <div className="stack fade">
      <p className="muted small" style={{ margin: 0 }}>{t.step_pairab} <span className="chip">{p.contrast}</span></p>
      <div className="card center"><AudioButton src={src} slowSrc={null} autoPlay /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {(['a', 'b'] as const).map((side, k) => {
          const word = side === 'a' ? p.a : p.b!, right = (side === 'b') === step.playB
          const cls = picked ? (right ? 'choice ok' : picked === side ? 'choice bad' : 'choice') : 'choice'
          return <button key={side} className={cls} style={{ minHeight: 88, flexDirection: 'column' }} onClick={() => choose(side)} disabled={!!picked}>
            <span className="sk" style={{ fontSize: '1.75rem' }}>{word}</span><span className="guide-ro small">{guide[k]}</span></button>
        })}
      </div>
      {picked && <p className="small muted center" style={{ margin: 0 }}>{lang === 'ro' ? it.meaning.ro : it.meaning.en}</p>}
    </div>
  )
}
