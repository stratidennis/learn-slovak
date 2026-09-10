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
| Dual coding: a picture with a word aids recall | Paivio; Duolingo's picture cards | Concrete nouns carry an emoji cue on the **intro card only** — beside a multiple-choice option it hands over the answer (D134) |
| Short sessions, visible progress, no punishment | Duolingo's design; motivation research | 10–15 minute sessions, progress bar, summary; wrong answers cost nothing but a repeat |
| Grammar learned weakly from pattern-only apps | 2023 Duolingo study (Wikipedia, *Duolingo*) | Just-in-time notes remain; the "fix the ending" and case-sorter exercises come in Phase 2 |

## 2. The mastery ladder (per item)

An *item* is a chunk, a lesson sentence, a two-line dialogue, a letter, a minimal pair or a cognate. Each
has a stage stored on the device.

| Stage | Step type | Learner sees | Learner does | Kind |
|---|---|---|---|---|
| 0 | **Intro** | Slovak big + audio auto-plays + meaning + respelling (+ picture); for a dialogue, two chat bubbles A → B in two voices | listens, taps *Got it* | all |
| 1 | **Meaning choice** / **Pick the reply** | Slovak text + audio; for a dialogue, line A (text + audio) and an empty B bubble | picks the meaning from 4 / picks the reply from 4 | chunk, sentence, cognate / dialogue |
| 2 | **Form choice** / **Pick the reply by ear** | audio only (or the meaning); for a dialogue, line A by ear only | picks the Slovak from 4 / picks the reply from 4 | chunk, sentence, letter (hear the name → pick the letter), dialogue |
| 3 | **Match / Tiles** | 4–5 pairs to match, or the meaning + shuffled word tiles (+1–2 distractors); for a dialogue, build the reply from tiles | matches / arranges | chunk, sentence, dialogue |
| 4 | **Cloze / Type a word** | sentence with one blank (3 choices), or one missing word to type | picks / types (diacritics lenient) | chunk, sentence |
| 5 | **Listen & type** | audio | types the whole thing (lenient → strict as it matures) | chunk, sentence |
| 6 | **Mastered** | — | hands over to the FSRS sentence card for long-term review | all |
| — | **Word in a phrase** *or* **gapped conversation** | the word's phrase with the word gapped (3 options), or a two-line exchange with 2–3 words missing and one shared word bank — the engine mixes the two (D135) | picks / fills every gap | word (stage 4), cognate (stage 3) |
| — | **Word in a conversation** | line A, then word tiles for the reply that contains the word | assembles in order | word (stage 5) |

Rules: correct → +1 stage; wrong → −1 (never below 1) and the item returns at the end of the
session; an item advances at most 2 stages per day; stages ≥ 4 require a previous day's success.
Minimal pairs use a single step type (A/B listening) and "mastered" = 3 correct in a row per pair.
Letters: hear the name → pick the letter; see the letter → pick its sound anchor; then mastered.
Dialogues master at stage 3 in Phase 0 and 4 elsewhere (no dictation of a reply).

**Nothing is asked before it has been taught (D133).** Every item's first appearance is its *intro* card.
Each kind carries an intro *version*; when the card changes materially (D132 gave every word its own
gloss and a phrase, replacing a card that showed the letter's sound anchor as the meaning) the version is
bumped and items introduced under the old card are presented again before they are asked anything.

**No speaking step (D133).** The app cannot judge Slovak pronunciation — browser speech recognition for
Slovak is far too unreliable — and a self-graded "did that sound right?" is something the learner can do
better with the model clip alone, away from the app. So the output strand lives outside the app
(the model clip, the roleplay prompts, a real conversation), not as a graded card inside it.

## 3. A session

`buildSession(unit)` → 12–18 steps, ~10 minutes:

1. **Warm-up** (fluency strand): 2–3 mastered items, fast, recognition only.
2. **New items** (default 5; 4 in Phase 0): each gets an Intro immediately followed by its stage-1
   step, then reappears 3–6 steps later at stage 2.
3. **Due items** from earlier sessions at their current stage (up to 8).
4. One **Match** step grouping 4–5 items that are at stage ≥ 2.
6. **Misses** return at the end, one stage down.
7. **Summary**: items advanced, accuracy, what comes back tomorrow; the unit's grammar note is
   offered (not forced) if a step touched its pattern.

Interleaving: never the same item twice in a row; never more than two steps of the same type in
a row. New items are dealt into balanced clusters of at most three — the cluster is *presented*
(intros together), then its practice steps are round-robined, so a word is never given two or three
cards back to back (D132). Every step has a feedback banner: correct/incorrect, the right answer, ▶ replay, and the
respelling.

### Lessons and redoing them (D129)

A unit's items are dealt into fixed, numbered **lessons** of 8 (10 for letters, sound pairs and
cognates), each mixing the unit's kinds. A lesson session introduces every new item in it (intro +
stage-1 step, stage-2 step later), drills the ones already started at their stage, and adds the match
and say-it blocks; distractors come from the whole unit. A lesson is *done* when each of its items has
been introduced and answered once, *mastered* when all sit at their top stage. The unit page is the
road map — any lesson can be opened, marked done / mastered by hand (a second device, D130), or reset, and a finished lesson reruns in **practice mode**: every item once,
mastered items asked one or two rungs below their top, scored exactly like a normal session (so a
forgotten item drops a stage and returns). Home shows "Up next" and one dot per lesson.

**Practice hub** (`/practice`): flashcards (self-graded, no ladder effect) and speed match (60 s,
boards of five) over everything from *done* lessons, filtered by type and unit — the fluency strand
(Nation) outside the ladder, plus the FSRS dictation review.

## 4. Phase 0, redone

| Unit | Items | Steps |
|---|---|---|
| 0.1 Alphabet | 46 letters, 5 lessons | Intro (letter, *its sound then the example word*, anchor, spelling name) → hear the letter → pick it → see the letter → pick the anchor |
| 0.2 Sounds | 64 minimal pairs | A/B listening only; contrast accuracy tracked; weakest contrast first |
| 0.3 Words you already own | 84 cognates, 6 per lesson | Intro (the cognate, its meaning and **the phrase it lives in**) → which Romanian word is it related to? → hear it → pick the Slovak → **the cognate gapped inside its phrase** → **that phrase assembled word by word** (D134) |
| 0.4 Words | the letters' example words, 5 per lesson | a word alone (intro with its phrase → pick the meaning → hear it and pick it → type it), then **the word gapped inside a phrase**, then **assembling the reply of a two-line conversation** from word tiles (D132) |
| 0.5 First twenty chunks | 20 chunks from 1.1–1.2 + 6 two-line dialogues | full ladder to stage 3 only (no typing yet); dialogues: hear A → pick the reply, by ear, then tiles |

Nothing in Phase 0 asks the learner to produce a sentence. Typing appears in 0.4 on *single*
words that are on screen.

From Phase 1 on, every unit also carries 5–7 hand-authored two-line dialogues built from its own
chunks (`pipeline/author_dialogues.py` → `content/dialogues.jsonl`, 151 exchanges over 26 units).
Line A is spoken by the unit's *other* voice and line B by the unit's own, so the two speakers are
audibly different. The learner always learns the reply (B); A is context.

## 5. What is kept from the earlier build

The FSRS sentence card (listen & type) is now the *last* rung, reached only by mastered items;
the chunk browser and the Alphabet reference stay as reference screens; grammar notes stay
just-in-time; the pronunciation guide is shown on every step's feedback.
