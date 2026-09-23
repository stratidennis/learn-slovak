import type { Step, StepResult } from '../../engine/types'
import { letterSeq } from '../../engine/items'
import { AudioButton } from '../../components/AudioButton'
import { useLang, useT } from '../../i18n'
import { ChoiceStep, ClozeStep, DialogueIntroStep, DlgClozeStep, IntroStep, ListenTypeStep, MatchStep, PairABStep, ReplyStep, TilesStep, TypeWordStep } from './Steps'

/** One exercise and, once answered, its verdict bar. Shared by lessons and Recap (D138), so every step type
 *  a lesson can show, Recap can show too. */
export function StepView({ step, result, onAnswer, onNext }: { step: Step; result: StepResult | null; onAnswer: (r: StepResult) => void; onNext: () => void }) {
  const t = useT(); const lang = useLang()
  const it = 'item' in step ? step.item : null
  const locked = !!result
  const showFeedback = result && step.type !== 'intro'
  const tone = !result ? '' : result.correct ? (result.tier === 'diacritics' ? 'warn' : 'ok') : 'bad'
  const heading = !result ? '' : result.correct ? (result.tier === 'diacritics' ? t.fb_diacritics : t.fb_correct) : t.fb_wrong
  return (
    <>
      {step.type === 'intro' && (step.item.ref.kind === 'dialogue' ? <DialogueIntroStep step={step} onAnswer={onAnswer} locked={locked} /> : <IntroStep step={step} onAnswer={onAnswer} locked={locked} />)}
      {(step.type === 'meaning' || step.type === 'form' || step.type === 'letterpick' || step.type === 'anchor') && <ChoiceStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'reply' && <ReplyStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'match' && <MatchStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'tiles' && <TilesStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'cloze' && <ClozeStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'dlgcloze' && <DlgClozeStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'typeword' && <TypeWordStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'listentype' && <ListenTypeStep step={step} onAnswer={onAnswer} locked={locked} />}
      {step.type === 'pairab' && <PairABStep step={step} onAnswer={onAnswer} locked={locked} />}
      {showFeedback && (
        <div className={`feedback ${tone}`}>
          <h3>{heading}</h3>
          {it && step.type !== 'match' && <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div><div className="ans">{it.sk}</div>{it.spell && it.ref.kind !== 'letter' && <div className="guide-ro small">{it.spell}</div>}<div className="small muted">{lang === 'ro' ? it.meaning.ro : it.meaning.en}</div></div>
            {it.audio && <AudioButton src={it.audio} seq={letterSeq(it)} slowSrc={it.audioSlow} compact />}
          </div>}
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={onNext} autoFocus>{t.continue}</button>
        </div>
      )}
    </>
  )
}
