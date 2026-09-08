# Prompt test log

Every prompt is tested on a *smaller* model than the one the learner will probably use, so that
a weaker model still obeys the constraints. Test harness: `pipeline/render_prompt.py` fills the
slots (band-1 lemmas as `KNOWN_WORDS`), then the rendered prompt is given to the model together
with a fixed script of learner turns containing typical mistakes. We grade the transcript, not
the model's opinion of itself.

## 2026-09-08 — Claude Sonnet, R1 market + R5 stand-up (v1 prompts)

| Check | R1 market | R5 stand-up |
|---|---|---|
| Slovak only, until `?` | ✔ | ✔ |
| `?` → Romanian, then back to Slovak | ✔ | ✔ |
| `!` → simpler restatement | ✔ | ✔ |
| 1–2 sentences per turn | ✔ | ✘ first turn had 4 |
| Outside-list word with Romanian in brackets | ✔ `domáci (de casă)` | ✔ `update [actualizare]` |
| No corrections mid-conversation | ✔ | ✔ |
| Colloquial register as instructed | ✔ *Čo to bude? · hej · Fajn, vďaka* | ✔ *pushnuté · call · Fajn* |
| Debrief: table / 3 flashcards / 1 sentence | ✔ | ✔ |
| Debrief accuracy | ✔ all four corrections right (*jedno kilo jabĺk, kartu, aj, register*) | ✔ excellent — caught *budem urobím* and *budem písať → napíšem* with correct aspect reasoning |
| "why" is one line | ✘ | ✘ 2–3 lines |
| **Model's own Slovak natural?** | **✘** *"Dobrý deň, pán!"*, *"priateľu"*, *"Tu iba peniaze"*, *"Syr domáci máme"*; said *vy* then *ahoj* | ✔ |
| **Unnatural phrase leaked into flashcards** | **✘** *Tu iba peniaze* offered as flashcard #3 | — |

### What this means

The *scaffolding* works on a smaller model: commands, turn length (mostly), register, debrief
shape, and — importantly — the corrections of the *learner's* mistakes were accurate in both runs.

The risk is the **model's own Slovak**. A smaller model invents address forms (*pán!*,
*priateľu*) and non-idiomatic phrasing, and then teaches them back. Three mitigations, all
applied:

1. **Prompts (v1.1)** now say: no address word unless before a name; never *priateľu*; keep one
   register to the end; *if unsure, use the simplest standard sentence you are certain of — never
   invent a phrase*; flashcards must be standard natural Slovak, tagged [standard]/[colloquial];
   "why" ≤ 15 words; first turn = one sentence. Scenario-specific canonical lines added (*Len v
   hotovosti, prosím.*).
2. **App rule:** phrases coming back from a roleplay debrief enter the SRS as `needs_review`,
   shown with a "from an AI conversation — unverified" chip until your reviewer confirms them.
   They are never silently promoted.
3. **Recommendation to the learner:** use the strongest model available for the *roleplay*
   (GPT-4-class / Claude Opus-class). The constraint-following part is fine on a small model;
   the naturalness is not.

### Still to test

- R2, R4, R6, R7, R8 on Sonnet with the v1.1 wording (same harness).
- All eight on an actual ChatGPT session (you — paste and play; send me the transcript).
- Whether the `KNOWN_WORDS` list (300–1,000 lemmas, ~2–9 KB) is respected or ignored by a
  smaller model — in both runs the model stayed close to the list, but the scripts were short.

## 2026-09-08 — Claude Sonnet, R1 market, v1.1 prompt (same learner script)

| Check | v1 | v1.1 |
|---|---|---|
| Invented address forms (*pán!*, *priateľu*) | ✘ | ✔ none |
| Register consistent to the goodbye | ✘ *vy* → *ahoj* | ✔ *Dovidenia … Pekný deň* |
| Model's own Slovak natural | ✘ *Tu iba peniaze*, *Syr domáci máme* | ✔ *Len v hotovosti, prosím.* · *Domáci syr, dobre.* |
| Unnatural phrase leaked into flashcards | ✘ | ✔ all three natural, tagged [standard]/[colloquial] |
| "why" ≤ one line | ✘ | ✔ |
| Learner corrections accurate | ✔ | ✔ (*jedno kilo jabĺk · kartu · aj · register*) |
| Commands `?` `!` `koniec` | ✔ | ✔ |

Residual: *"pán Dennis"* — Slovak uses *pán* + surname. Rule changed to "no address word at all"
(v1.2). Otherwise v1.1 fixed every flagged failure on the weaker model. Conclusion stands: use
the strongest model available for roleplay; treat debrief flashcards as `needs_review`.
