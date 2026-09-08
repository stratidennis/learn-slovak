# Exercise catalogue

Every exercise here is specified tightly enough to build from. Each has: what the learner sees,
what they do, how it is graded, what data it needs, and which skill/principle it serves
(research §2 P1–P12). Types marked **★** are the v1 core; the rest are v1.x.

Design rules that apply to all of them:

- **Slovak is always audible.** Every Slovak string has a play button; the target sentence
  auto-plays once. Listening-first is the point (§10.1).
- **Sentences, not words.** Even a "vocabulary" exercise shows the word inside a sentence
  (P3). The word is highlighted; the sentence is the card.
- **Retrieval beats recognition** (P5). The default answer mode is *type* or *say*; multiple
  choice is the fallback for a first exposure or after two failures.
- **Lenient → strict diacritics.** Grading has three tiers: `exact`, `diacritics-off` (accepted
  with a warning chip: "právne, ale: *kávu* — with the dĺžeň"), `wrong`. Strictness ramps with
  the card's FSRS stability: a word you have known for weeks is graded strictly.
- **Every wrong answer shows the natives-say layer.** If the standard form was expected and you
  typed the colloquial one (or vice versa), that is *not wrong* — it is "also correct, different
  register", with the chip.
- **Interleave** (P9). A session never runs the same type more than 3 times in a row.
- **No streak punishment.** Missing a day resets nothing; the scheduler simply has more due cards.

---

## A. Listening

### A1 ★ Listen → type what you heard *(dictation)*
- **See:** play button, 0.7×/1× speed toggle, empty text field with the Slovak keyboard helper.
- **Do:** type the sentence. Up to 3 replays free; each extra replay is logged.
- **Grade:** token-level Levenshtein on normalised text; per-word colouring (green/amber/red); the
  amber tier is diacritics-only errors. Pass = every word green or amber.
- **Needs:** `sentence.sk`, `sentence.audio`.
- **Why:** the single highest-yield exercise for a listening-first goal; trains the ear on
  length and palatals in context, and forces the case endings to be *heard*.

### A2 ★ Listen → choose the meaning
- **See:** audio; 4 Romanian (tap for English) options.
- **Do:** pick. Distractors are drawn from sentences sharing ≥2 lemmas so they are not trivially
  wrong.
- **Grade:** exact. Used for *first exposure* of a sentence, before A1 is unlocked for it.
- **Needs:** `sentence.ro|en`, distractor pool.

### A3 ★ Minimal pair — which did you hear?
- **See:** two written words (*pas / pás*), one audio clip.
- **Do:** tap the one you heard. 8 in a row, contrast rotates (length → ť/t → ľ/l → ň/n → h/ch →
  stress).
- **Grade:** exact; per-contrast accuracy tracked; the 3-minute pronunciation micro-drill (§9.2
  step 1) picks the weakest contrast.
- **Needs:** `minimal_pairs.jsonl` (Appendix B + hunspell-verified pairs), Piper audio for both
  members, and — where kaikki has them — the Wikimedia Commons *human* recordings as a second
  voice, so the ear does not lock onto one synthetic speaker.

### A4 Number sprint
- **See:** a price / time / quantity spoken (*dve eurá päťdesiat*, *o pol štvrtej*, *dvadsať
  deka šunky*); a numeric keypad.
- **Do:** type the digits. 60-second rounds, gets faster.
- **Grade:** exact. Numbers are the most common comprehension failure for beginners (§11.12).
- **Needs:** `num2words_sk` in reverse (we generate the spoken form from a random number, so
  the pool is infinite and never repeats).

### A5 Gist listening
- **See:** a 20–40 s clip (podcast excerpt link or a 3-sentence mini-dialogue rendered with two
  Piper voices) — no transcript at first.
- **Do:** answer 2 questions in Romanian ("Where are they?", "What does she order?"). Then the
  transcript appears with tap-to-gloss.
- **Grade:** multiple choice.
- **Needs:** `dialogues.jsonl` with speaker turns; two Piper voices (lili + a second Slovak
  voice if one is published; otherwise pitch-shift lili −8% for speaker B).

### A6 Shadowing loop
- **See:** waveform of the native/TTS clip; big record button.
- **Do:** listen, then repeat *over* it; the app records you and plays both back overlaid; loop
  a phrase with A/B markers.
- **Grade:** none. Self-assessed with a "sounded close / not yet" toggle that feeds the
  pronunciation micro-drill. (Optional Web Speech API transcription shown as a hint, never as a
  score — it is too unreliable for Slovak to grade with.)
- **Needs:** audio, MediaRecorder.

---

## B. Reading

### B1 ★ Tap-to-gloss sentence
- **See:** the Slovak sentence in the display face; tap any word → popover with lemma, RO/EN
  gloss, IPA, form tags (*ženou — instrumental sg.*), and the grammar note if one is attached.
- **Do:** read; mark "got it" or "add word to SRS".
- **Grade:** none; this is the reading surface every other exercise falls back to.
- **Needs:** `sentence.lemmas` aligned to tokens (we have lemmas per sentence; token↔lemma
  alignment is a build step to add), `lexemes.forms` for the form tag.

### B2 Cloze — pick the form
- **See:** sentence with one word blanked, the *lemma* shown below it (*stôl*); 4 forms.
- **Do:** pick the correctly inflected form. Distractors are the *real* other forms of the same
  lemma (*stola / stole / stolom / stoly*), so the exercise is about case, not vocabulary.
- **Grade:** exact. Wrong → the grammar note for that case opens inline (P10).
- **Needs:** `lexemes.forms` with tags (kaikki for verbs/adjectives, hunspell for nouns).

### B3 Cloze — type the form
- Same as B2 but typed. Unlocked for a lemma after B2 has been passed twice.

### B4 Micro-text with unknown-word meter
- **See:** 3–6 sentences assembled from the bank so that ≤1 lemma is new (i+1, P6); meter shows
  "you know 96% of this".
- **Do:** read with tap-to-gloss; one comprehension question.
- **Needs:** sentence bank + the learner's known-lemma set. Texts are generated at runtime by a
  greedy picker (same topic tag, overlapping lemmas), not authored.

### B5 The i+1 reader (import anything)
- **See:** paste a text (podcast transcript, Wikipedia paragraph, a sermon, a README) → per-word
  status colouring (unknown / learning / known) + coverage %.
- **Do:** read; tap unknown words to gloss and optionally add to SRS.
- **Needs:** hunspell lemmatisation at runtime (the affix expander ships to the client as a
  compact form→lemma map for the top ~5k lemmas), lexeme glosses.

### B6 Sign & menu reading
- **See:** a photo-style card of a real-world text type from the SAS "druhy textov" list: a
  menu (*obedové menu*), a tram ticket, a pharmacy sign, a shop's opening hours, an SMS.
- **Do:** answer one practical question ("How much is the soup?", "Is it open on Sunday?").
- **Needs:** ~40 authored mini-texts per phase, styled as the object they imitate.

---

## C. Writing / production

### C1 ★ RO → SK: say it in Slovak
- **See:** a Romanian sentence; text field.
- **Do:** type the Slovak.
- **Grade:** fuzzy match against the reference *and* a list of accepted variants (standard +
  colloquial + word-order variants); word-level diff shown. Near-miss on a case ending opens
  that grammar note.
- **Needs:** `sentence.ro` (authored — see D110), `accepted_variants[]`.

### C2 Word tiles
- **See:** the Romanian meaning; the Slovak words as shuffled tiles (+1–2 distractor tiles: a
  wrong case form of a word in the sentence).
- **Do:** arrange. Because Slovak word order is flexible, *any* order that a native would accept
  passes — the distractor tiles are what make it non-trivial.
- **Grade:** set equality on tiles, plus order check only for clitic placement (*som/si/sa* must
  be second position) — that is the one word-order rule a beginner must get right.

### C3 Fix the ending
- **See:** a sentence with one deliberately wrong case/gender/number ending, highlighted.
- **Do:** type the correction.
- **Needs:** generated from hunspell paradigms: swap a form for a sibling form of the same
  lemma. Infinite pool.

### C4 Aspect pair
- **See:** two sentences, one blank each: *Včera som ___ list. (písať/napísať)* / *Každý deň ___
  listy.*
- **Do:** pick which member of the pair fits each. Explanation card: process vs. result, with a
  Romanian paraphrase (*scriam / am scris*).
- **Needs:** `aspect_pairs.jsonl` (60 pairs, Phase 2).

### C5 60-word message
- **See:** a prompt from the SAS *písomný prejav* list ("Write to a colleague: you can't come
  tomorrow, propose Friday") + a word bank of 8 relevant chunks.
- **Do:** write. hunspell underlines misspellings live.
- **Grade:** not auto-graded. Saved to the *review outbox* for your native reviewer, or pasted
  into the AI-tutor prompt R3 (below) for feedback. Word count and chunk usage are shown.

### C6 Diminutive trainer *(v1.x)*
- **See:** *káva → ___*; *pivo → ___*; *chvíľa → ___*.
- **Do:** type the diminutive (*kávička, pivko, chvíľka*). Small module, huge naturalness payoff
  (§11.11).

---

## D. Speaking

### D1 ★ Chunk shadow
- **See:** a chunk card (SK big, RO under it, register chip, colloquial variant on tap); audio.
- **Do:** listen, repeat aloud, tap "next". Optionally record and compare (A6). This is the
  Phase 0/1 workhorse — 20 chunks a day, out loud.

### D2 Answer the question
- **See:** a spoken question (*Odkiaľ si?*, *Čo si dáš?*, *Koľko je hodín?*); 8 seconds.
- **Do:** answer aloud. Web Speech API transcript appears; you self-grade "that's what I said /
  no". Suggested answers appear after, standard + natives-say.
- **Grade:** self + optional ASR similarity hint.

### D3 Roleplay with an AI tutor *(prompt-driven, outside the app)*
- **See:** a scenario card with a copy button. The app builds a prompt from the scenario + your
  current known-lemma list + your weak points, you paste it into ChatGPT (or any model) and talk.
- **Do:** hold the conversation; paste the transcript back into the app's *mistake diary*.
- **Needs:** `curriculum/ai-roleplay/` prompts — tested to work on a smaller model, see that
  folder's README. Scenarios: market, café, after church, stand-up meeting, pharmacy, meeting a
  neighbour, phone call to book something.

---

## E. Vocabulary / SRS

### E1 ★ Sentence card (the SRS unit)
- One target lemma per card, delivered as a sentence. Review mode rotates through A1 → C1 → B2
  depending on the lemma's state:
  - new (0–2 reviews): A2 (choose meaning), then A1 (dictation)
  - learning: A1 or C1
  - mature: C1 or B3 (type the form)
- `ts-fsrs`, desired retention 0.88; daily new-card cap default 12 (adjustable 6–20); leech
  after 6 lapses → moved to the pronunciation/grammar micro-drill that matches its error tag.

### E2 Cognate day-1 deck
- The 84 §4.3 cognates as *recognition-only* cards: Slovak word + audio → "which Romanian word
  is this related to?" (multiple choice). Marked `semantic_shift` where the meaning moved. Runs
  once in Phase 0; the words then enter normal SRS as they appear in sentences.

### E3 False-friend flashcards
- The 16 §4.4 false friends, shown in a sentence, with the trap named explicitly:
  *Obraz je na stene.* — "not 'cheek' (RO *obraz*) — *picture*".

### E4 Internationalisms on sight
- ~200 words readable on sight (*hotel, banka, telefón, program, aplikácia*) shown at speed with
  audio, to train the *Slovak pronunciation* of words you already know: first-syllable stress,
  long vowels (*telefón*, *aplikácia*). Phase 0 only.

---

## F. Grammar

### F1 ★ Grammar note (just-in-time)
- Opens from any word tap or any wrong ending. One screen: the rule in English, a Romanian
  analogy where one exists (*páči sa mi* ≈ *îmi place*: dative experiencer in both), a 6-row
  table, 5 corpus sentences from the bank with the relevant form highlighted. Never mandatory.
- 60 notes for v1 (`content/grammar_notes.jsonl`), unlocked when a sentence first needs one.

### F2 Case sorter
- **See:** 8 sentences with a highlighted noun phrase; 6 case buckets.
- **Do:** drag each phrase to its case. Explanation on drop.
- **Grade:** exact. This is the one "grammar drill" that earns its place, because case
  *recognition* is what unlocks listening comprehension.

### F3 Two-way prepositions
- **See:** *Idem ___ školy / Som ___ škole* with *do / v* and *na* + case toggles.
- **Do:** pick preposition + case. Motion vs. location, the pattern that also decides *na trh /
  na trhu*, *do kostola / v kostole*.

---

## G. Progress & meta

### G1 ★ Coverage meter
- "You understand **N%** of casual Slovak speech" = Σ(subtitle_count of known lemmas) /
  Σ(subtitle_count of all lemmas in the 50k list). Shown on the home screen, updated after every
  session. Honest, motivating, computable from data we already have.
- Also per-domain coverage once domain packs exist ("market: 61%").

### G2 Can-do checklist
- The SAS A1/A2 *komunikačné ciele* as a self-ticked list ("I can order a coffee and pay",
  "I can say what I did yesterday"). Ticking one unlocks the next unit's roleplay scenario.

### G3 Mistake diary → drills
- Every wrong answer is tagged (`case:loc`, `aspect`, `diacritic:length`, `palatal:ť`,
  `register`). The diary shows the top 3 tags this week and offers a 2-minute drill for each.

### G4 Weekly review export
- One-click CSV of everything you got wrong + everything you wrote (C5) → send to your
  reviewer or paste into R3. Closes the loop with `pipeline/review_import.py`.

---

## Creative / occasional (one or two per week, not daily)

| | Exercise | What it trains |
|---|---|---|
| X1 | **Verse of the day** (Roháček RO↔SK parallel, SEB audio link) | Reading a known text; church-track vocabulary; beautiful sentences you already understand |
| X2 | **Menu decoder** — a real Slovak restaurant's *denné menu* (photo or paste) | Food vocab in the wild; *polievka, hlavné jedlo, príloha* |
| X3 | **Subtitle sprint** — watch 2 min of a Slovak YouTube clip with SK subtitles; app shows the transcript after, tap-to-gloss | Gist listening at native speed |
| X4 | **Overheard** — 10 very short colloquial exchanges (*— Ako? — Ide to.*) as audio only; pick what happened | The naturalness layer, spoken |
| X5 | **Describe the picture** — an unDraw illustration; write/say 3 sentences | Free production with visual scaffolding; no translation step |
| X6 | **Sermon / talk snippet** — paste a transcript of something you actually listened to on Sunday | Domain listening with the i+1 reader |
| X7 | **Diminutive day** | Naturalness |
| X8 | **Czech radar** *(v2)* — spot the Czech word in a mixed sentence | Interference awareness |
| X9 | **Teach it back** — record a 30-second explanation *in Slovak* of a grammar point you just learned, using only known words | Output + noticing (Swain) |
| X10 | **Voice note to a friend** — 20-second WhatsApp-style message on a prompt (*"tell me what you did this weekend"*) | Real-genre speaking; paste to R3 for feedback |
