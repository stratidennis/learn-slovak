# The learning engine — how a zero beginner actually gets from nothing to basic

Written after the first real test failed: Phase 0 offered a full-sentence dictation to someone who
had never heard Slovak. This document replaces the "one card type first" shortcut with an engine
grounded in what the acquisition and memory literature says works, and what Duolingo/Ling get
right in practice.

## 1. Evidence → design rule

| Finding | Source | What the engine does |
|---|---|---|
| Four strands in *roughly equal* time: meaning-focused input, meaning-focused output, language-focused learning, fluency development | Nation 2007, *The Four Strands* | Every session mixes: input steps (listen/read → choose meaning), output steps (build/type), deliberate items (grammar note, pronunciation drill), and a fluency block (known items, fast) |
| Meaning-focused input requires **95–98% known** running words; 1–2 unknown per hundred | Hu & Nation 2000, via Nation 2007 | New items are *introduced* (shown, heard, glossed) before any test; sentences only appear once their words are ≥ stage 2; the i+1 picker caps unknowns at one |
| Retrieval practice beats restudy, **with feedback**, at a **desirable** difficulty; very low success rates stop helping | Roediger & Karpicke 2006; Bjork | Every step is a retrieval attempt with immediate feedback + audio replay; difficulty is chosen per item from its mastery stage so success stays ~80% |
| Recognition is easier than recall; recall tests strengthen more once achievable | testing-effect literature | The ladder: recognition (choose) → cued recall (tiles, cloze) → free recall (type). Never a recall step before two recognition successes |
| Input processing precedes output; learners need to *do something with chunks* before rules | VanPatten, Input Processing / Processing Instruction | Steps are "do something with the chunk" (pick its meaning, pick what you heard, assemble it); grammar notes open on demand after use, not before |
| Prompt → pause → answer → confirmation; graduated intervals; small core vocabulary | Pimsleur | Every step confirms with the correct answer spoken; items return within the session (minutes) and via FSRS (days); 5 new items per session |
| Spacing and interleaving over massing | Cepeda et al.; Bjork | Items advance ≤ 2 stages per day; steps interleave items and types; wrong items return at the end of the session |
| Ear before eye for new phonemic contrasts | Wyner; minimal-pair literature | Phase 0 is letters + A/B listening; contrasts with < 85% accuracy come back daily |
| Dual coding: a picture with a word aids recall | Paivio; Duolingo's picture cards | Concrete nouns carry an emoji cue in intro and meaning-choice steps (`data/emoji.json`) |
| Short sessions, visible progress, no punishment | Duolingo's design; motivation research | 10–15 minute sessions, progress bar, summary; wrong answers cost nothing but a repeat |
| Grammar learned weakly from pattern-only apps | 2023 Duolingo study (Wikipedia, *Duolingo*) | Just-in-time notes remain; the "fix the ending" and case-sorter exercises come in Phase 2 |

## 2. The mastery ladder (per item)

An *item* is a chunk, a lesson sentence, a letter, a minimal pair or a cognate. Each has a stage
stored on the device.

| Stage | Step type | Learner sees | Learner does | Kind |
|---|---|---|---|---|
| 0 | **Intro** | Slovak big + audio auto-plays + meaning + respelling (+ emoji) | listens, taps *Got it* | all |
| 1 | **Meaning choice** | Slovak text + audio | picks the meaning from 4 | chunk, sentence, cognate |
| 2 | **Form choice** | audio only (or the meaning) | picks the Slovak from 4 | chunk, sentence, letter (hear the name → pick the letter) |
| 3 | **Match / Tiles** | 4–5 pairs to match, or the meaning + shuffled word tiles (+1–2 distractors) | matches / arranges | chunk, sentence |
| 4 | **Cloze / Type a word** | sentence with one blank (3 choices), or one missing word to type | picks / types (diacritics lenient) | chunk, sentence |
| 5 | **Listen & type** | audio | types the whole thing (lenient → strict as it matures) | chunk, sentence |
| 6 | **Mastered** | — | hands over to the FSRS sentence card for long-term review | all |

Rules: correct → +1 stage; wrong → −1 (never below 1) and the item returns at the end of the
session; an item advances at most 2 stages per day; stages ≥ 4 require a previous day's success.
Minimal pairs use a single step type (A/B listening) and "mastered" = 3 correct in a row per pair.
Letters: hear the name → pick the letter; see the letter → pick its sound anchor; then mastered.

## 3. A session

`buildSession(unit)` → 12–18 steps, ~10 minutes:

1. **Warm-up** (fluency strand): 2–3 mastered items, fast, recognition only.
2. **New items** (default 5; 4 in Phase 0): each gets an Intro immediately followed by its stage-1
   step, then reappears 3–6 steps later at stage 2.
3. **Due items** from earlier sessions at their current stage (up to 8).
4. One **Match** step grouping 4–5 items that are at stage ≥ 2.
5. **Misses** return at the end, one stage down.
6. **Summary**: items advanced, accuracy, what comes back tomorrow; the unit's grammar note is
   offered (not forced) if a step touched its pattern.

Interleaving: never the same item twice in a row; never more than two steps of the same type in
a row. Every step has a feedback banner: correct/incorrect, the right answer, ▶ replay, and the
respelling.

## 4. Phase 0, redone

| Unit | Items | Steps |
|---|---|---|
| 0.1 Alphabet | 46 letters | Intro (letter, name, sound, anchor, example word) → hear the name → pick the letter → see the letter → pick the anchor |
| 0.2 Sounds | 64 minimal pairs | A/B listening only; contrast accuracy tracked; weakest contrast first |
| 0.3 Words you already own | 84 cognates | Intro → which Romanian word is this related to? (4 choices) → hear it → pick the Slovak |
| 0.4 Type it | the letters' example words | see it + respelling + hear it → type it (diacritics required, hints on) |
| 0.5 First twenty chunks | 20 chunks from 1.1–1.2 | full ladder to stage 3 only (no typing yet) |

Nothing in Phase 0 asks the learner to produce a sentence. Typing appears in 0.4 on *single*
words that are on screen.

## 5. What is kept from the earlier build

The FSRS sentence card (listen & type) is now the *last* rung, reached only by mastered items;
the chunk browser and the Alphabet reference stay as reference screens; grammar notes stay
just-in-time; the pronunciation guide is shown on every step's feedback.
