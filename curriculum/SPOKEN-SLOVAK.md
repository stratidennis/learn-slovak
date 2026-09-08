# The naturalness layer — what Slovaks actually say

The app's promise is *the Slovak people speak*, not the Slovak in textbooks. This document is
the working reference for that promise: the specific forms to teach as primary, the textbook
forms to mark as "correct but nobody says it", and how the data model carries the distinction.
Sources: research §5, the subtitle frequency data (`lexicon_bands.csv`), the Tatoeba
native-authored pool, SAS *Jazykové funkcie A1–A2*, SlovakforU episode topics. **Every claim
here is `needs_review` until a native confirms it** — that is what the review CSV is for.

## 1. Register tags (on every phrase, sentence and chunk)

| tag | meaning | shown as | teach for |
|---|---|---|---|
| `standard` | codified, written and spoken | blue chip *štandard* | production, always safe |
| `neutral` | standard *and* what people say | no chip | production — the default |
| `colloquial` | *hovorové*: everyday spoken, fine among equals, odd in writing | gold chip *hovorovo* | recognition first, production once comfortable |
| `formal` | offices, elders, church, letters | grey chip *formálne* | production in the right setting |
| `regional` | western / eastern | purple chip | recognition only |
| `archaic` | Roháček Bible, folk tales | grey chip | recognition only |
| `vulgar` / `insult` | — | red chip | recognition only, hidden by default |

Rule: a sentence tagged `textbook` in `natives_say` notes is *never* the primary form of a
chunk. It appears as the variant, with the note "this is what the book says".

## 2. The swaps — primary form first

| Situation | Teach first (what you hear) | Also correct (textbook / formal) | Note |
|---|---|---|---|
| yes | **hej** (informal), **áno** (neutral) | áno | Measured: *áno* rank 32, *hej* rank 58 — both top-60. Teach as equals, tag *hej* colloquial. |
| well / yeah / so | **no** | — | discourse particle; *not* "no". Rank 53. |
| greeting in a shop | **Dobrý.** | Dobrý deň. | second word dropped in passing |
| goodbye | **Dovi.** / **Majte sa.** | Dovidenia. | *Dovi* is universal, not slangy |
| how are you | **Ako?** / **Ako sa máš?** / **Čo nové?** / **Ako ide?** | Ako sa máte? | |
| fine | **Dobre.** / **Ide to.** / **Fajn.** / **V pohode.** / **Nič moc.** | Mám sa dobre, ďakujem. A vy? | the textbook answer is the single most "foreign" thing a learner can say |
| ordering | **Prosím si …** / **Dám si …** | Chcel by som … | *chcel by som* is fine but marks you as a learner |
| the bill | **Platím.** / **Zaplatíme.** | Účet, prosím. | raise a hand + *Platím* |
| really? | **Fakt?** / **Vážne?** | Naozaj? | *fakt* rank 339 |
| sure | **Jasné.** / **Jasnačka.** | Samozrejme. | |
| great | **Super.** / **Paráda.** / **Skvelé.** | Výborne. | |
| very | **strašne** / **hrozne** (positive too!) / **fakt** | veľmi | *strašne dobré* = really good |
| always | **furt** | vždy / stále | *furt* is everywhere in speech, absent from books |
| a lot | **kopec** / **fúra** / **veľa** | veľa / mnoho | |
| to work | **robiť** (*Kde robíš?*) | pracovať | *robiť* rank 46 |
| take | **zobrať** | vziať | both in band 1 (*zobrať* 230) |
| money words | **stovka, päťdesiatka, dvadsať deka** | sto eur, päťdesiat eur, dvesto gramov | |
| friend | **kamoš / kamarát** | priateľ | *priateľ* also = boyfriend |
| guy / girl / kid | **chalan / baba / decko** | mladý muž / dievča / dieťa | *baba* can be rude about older women — context |
| phone | **mobil** | telefón | |
| TV / camera / computer | **telka / foťák / kompl** | televízia / fotoaparát / počítač | recognition |
| OK | **okej / ok / v poho** | dobre | |
| simply / actually / like | **proste / vlastne / akože** | — | fillers — recognise, then use sparingly |
| right? | **hej?** / **však?** / **nie?** | — | tag questions |
| you're welcome | **Nemáš zač.** / **Nie je za čo.** | Prosím. / Rado sa stalo. | |
| sorry (bumping) | **Pardon.** / **Sorry.** | Prepáčte. | |
| thanks (informal) | **Vďaka.** / **Díky.** (Czech-ish) | Ďakujem. | |

## 3. Diminutives are a register, not a size

*kávička, pivko, chvíľka, minútka, Peťo, Zuzka, stovka, chlebík* — neutral, warm, adult. Order
*jednu kávičku* and you sound local. The app's diminutive trainer (C6/X7) exists for this.

## 4. Grammar people actually bend

- **Accusative after negation**: standard prefers genitive (*Nemám času*), speech uses
  accusative (*Nemám čas*). Teach the accusative as primary; mark the genitive standard.
- **Clipped auxiliaries**: *som* → barely audible; *Bol som doma* ≈ [bolsom doma]. Ear training.
- **`je` for `sú`** in casual counting: *Je tam päť ľudí* is standard anyway (genitive plural);
  learners over-produce *sú*.
- **Anglicisms in IT**: *deploynuť, pushnúť, mergnuť, commitnuť, callnuť, míting, task*. Real,
  daily, tagged colloquial. A Slovak dev team will say them; the standards never will.

## 5. Czechisms you will hear (recognise, do not copy)

*hodně* (veľa), *jo* (hej), *fakt jo*, *děkuji*, *nevím*, *protože*, *takže* (this one is fine
in Slovak), *kluk/holka* (chalan/baba). Letters **ř ě ů** are the tell. Czech radar is a v2
feature; v1 only filters Czech out of the source data.

## 6. Regional

The standard is understood everywhere. **West** (Bratislava): *ľ* softness weakens, *Servus*.
**East** (*východniari*): penultimate stress, *co* for *čo*, *ta* for *tá*, *šak* for *však* —
sounds like a different language at first. The app tags eastern forms *regional* and only shows
them in recognition exercises. Since the learner's Slovak-speaking contacts in Romania (Nădlac,
Bihor) speak an archaic, Romanian-influenced dialect, treat them as practice partners, not as
the norm (§5.3).

## 7. How the data carries this

```json
"register": "colloquial",
"natives_say": [{"sk": "Ide to.", "note": "the honest everyday answer", "register": "colloquial"}],
"textbook_note": "Books teach 'Mám sa dobre, ďakujem. A vy?' — grammatical, rarely said."
```

`build_sentences` sets `register` from the sentence's lemmas: any lemma with a `colloquial`
marker in `data/register_flags.json` → sentence is `colloquial`. Chunks carry it by hand.

## 8. What still needs a native

- Confirm every row of §2 (a Bratislava thirty-something and a village sixty-something will
  disagree on some).
- Rank the fillers by how annoying they are when over-used by a foreigner.
- Tell us which diminutives a man can say without sounding twee (*pivko* yes; *kávička*? *vodička*?).
