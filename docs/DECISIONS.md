# Decision log

Append-only. Every choice that shapes the build, with the reason. Newest at the bottom.
Format: `## D<n> — <title>` / **Date** / **Decision** / **Why** / **Consequence**.

Decisions carried in from the research doc §14 are recorded as D001–D008 so the log is
self-contained; anything decided during the build starts at D100.

---

## D001 — Support language: Romanian glosses first, English on tap
**Date** 2026-09-07 · pre-answered (§14.1)
**Decision** RO gloss is primary in the UI, EN gloss revealed on tap. Grammar notes are written in **English only**.
**Why** Learner is native Romanian, fluent English. RO is more natural for meaning; EN grammar notes are far easier to source and avoid double authoring.
**Consequence** `lexeme.gloss_ro` is a required field; `grammar_note` bodies are English. RO glosses beyond the §4.3 cognate seed are drafted and must carry `needs_review`.

## D002 — Audio: pre-render everything with Piper at build time
**Date** 2026-09-07 · pre-answered (§14.2)
**Decision** Piper `sk_SK-lili-medium`, rendered to OGG during the content build. No live TTS at runtime.
**Why** Offline-first, zero runtime dependencies, deterministic. Numbers must be spelled out as words before synthesis.
**Consequence** Revisit if Q3 shows palatal/length/number defects — fallback is Edge neural voices for the ~500 core chunks, Piper for bulk.

## D003 — ASR: Web Speech API first
**Date** 2026-09-07 · pre-answered (§14.3)
**Decision** `lang="sk-SK"` via Web Speech API in v1. Local faster-whisper behind a settings flag later.
**Why** Zero setup. Speaking practice is not on the v1 critical path.
**Consequence** Grade by similarity, never exact match. Speaking features degrade gracefully when the API is absent.

## D004 — No LLM roleplay in v1
**Date** 2026-09-07 · pre-answered (§14.4)
**Decision** Ship v1 without the bounded-LLM roleplay.
**Why** Content pipeline correctness matters more; roleplay depends on a solid known-lexicon model that does not exist yet.
**Consequence** §9.2 session step 5 (output) is served by RO→SK production prompts and writing tasks only.

## D005 — v1 content scope
**Date** 2026-09-07 · pre-answered (§14.5)
**Decision** Bands 1–2 (1,000 lemmas), ~200 chunks, 60 grammar notes, 3 domain packs: food/market, work/tech, church.
**Why** Matches Phase 0–2 of §9. Bands 3–4 arrive later via the i+1 reader.
**Consequence** Anything outside this scope is deferred, not built "just in case".

## D006 — Native review is a CSV export/import loop
**Date** 2026-09-07 · pre-answered (§14.6)
**Decision** Reviewer to be arranged by the learner. Build the export/import loop now so it is ready when they are.
**Why** Review capacity is the scarce resource; the tooling must not be the blocker.
**Consequence** Every content record carries `review_status`. Export produces a reviewer-friendly CSV; import writes verdicts back without losing provenance.

## D007 — Bible: Roháček bundled, SEB linked
**Date** 2026-09-07 · pre-answered (§14.7)
**Decision** Roháček (public domain) is bundled as text. SEB is link-out only, for its free audio.
**Why** Licence discipline (§12). Roháček is archaic but redistributable; SEB is copyrighted.
**Consequence** Church-track parallel reader ships Roháček text and deep-links SEB audio. Tag Roháček `archaic`.

## D008 — Czech: ignored in v1
**Date** 2026-09-07 · pre-answered (§14.8)
**Decision** No Czech radar in v1. Czech contamination is still filtered out of source data.
**Why** Scope. The filter is a data-quality need; the learner-facing feature is not.
**Consequence** Pipeline keeps the Czech grapheme/stopword check; no UI surface for it.

---

## D100 — Python 3.11 for the pipeline venv
**Date** 2026-09-07
**Decision** `.venv` built from Python 3.11.1 (`/Library/Frameworks/Python.framework/Versions/3.11`), not the default `python3` (3.9.9) or 3.14.6.
**Why** 3.9 is near end-of-life and several pipeline deps are dropping it. 3.14 is too new for reliable `onnxruntime` wheels, which `piper-tts` needs for M2 audio. 3.11 has mature wheels for everything in the plan.
**Consequence** All pipeline commands run through `.venv/bin/python`. Recorded so a future rebuild does not silently land on 3.9.

## D101 — simplemma 2.0.0 verified against the §15.1 spot-checks
**Date** 2026-09-07
**Decision** Use simplemma 2.0.0 as installed; the `simplemma.lemmatize(word, lang="sk")` API is unchanged from the version used for the original spike.
**Why** §15.1's results are only reusable if the lemmatizer behaves identically. Verified: `som→byť, chcem→chcieť, deti→dieťa, peknú→pekný` all reproduce.
**Consequence** `lexicon_bands.csv` can be trusted without regeneration. Also re-confirmed `nechcem→nechcieť`, i.e. §15.2 bug #2 is still live and must be handled by our own code, not by the library.

## D102 — Patch `spike_remaining.py` `fetch()` rather than exporting SSL_CERT_FILE
**Date** 2026-09-07
**Decision** `fetch()` builds its SSL context from `certifi` and streams downloads to a `.part` file.
**Why** python.org framework Python on macOS ships no CA bundle; every download failed with `CERTIFICATE_VERIFY_FAILED`. An env var fixes it for one shell and silently breaks for the next person. `certifi` is already present as a `requests` dependency.
**Consequence** M2's pipeline downloader should reuse this pattern.

## D103 — Q1 is evaluated on the negation-merged number (4,366), not the as-shipped one (3,845)
**Date** 2026-09-07
**Decision** `spike_q1_negation_check.py` re-measures Q1 with the §15.2 bug-#2 merge applied. Both numbers are recorded; the decision gate uses the corrected one.
**Why** `spike_remaining.py` lemmatizes `nechcem → nechcieť`, which is absent from band 1 *because* band 1 was built after the merge. Negated sentences therefore looked like they contained unknown words. 521 sentences were wrongly excluded — disproportionately the conversational core (*Nerozumiem, Nechcem, Nemusíte*).
**Consequence** Either number clears the >400 gate, so the strategy is unchanged. But the merge must be in the M2 sentence annotator, not just in this check. Merge rule: strip `ne-` only when the remainder is a known lemma ending in `ť`; asserted safe against `nejaký, nechať, nech, než, nemocnica, nenávidieť, nebo, nedeľa`.

## D104 — Q3 judged by front-end contrast tests, not by symbol matching
**Date** 2026-09-07
**Decision** `spike_q3_piper.py` tests whether minimal pairs *phonemize differently*, rather than whether a specific IPA symbol appears.
**Why** A first pass asserting `ť → c` and `ď → ɟ` reported 9 failures that were all notation: espeak-ng writes Slovak palatals as `tʲ dʲ` and marks stress after an initial consonant cluster (`brˈatislava` *is* first-syllable stress). Symbol matching measured the transcription convention, not the pronunciation. Contrast preservation is also the property the app's minimal-pair drills actually depend on.
**Consequence** All 26 checks pass. Corollary: **espeak phoneme strings must not be shown to the learner as IPA** — source learner-facing IPA from kaikki or hand-write it.

## D105 — Numbers are spelled out at build time (confirmed, not assumed)
**Date** 2026-09-07
**Decision** Keep D002's spell-out rule; it is load-bearing, not a precaution.
**Why** Measured: `2,50 €` renders as *"dva čiarka päťdesiat euro"* — the comma is read aloud and the numeral takes the wrong gender. `15:30` renders as *"pätnásť tridsať"*. Bare cardinals (`25` → *dvadsaťpäť*) are fine; currency, decimals and times are not.
**Consequence** The M2 audio stage needs a Slovak number-to-words expander covering currency, decimals and times before synthesis — not just integers.

## D106 — Commit a kaikki subset, keep the raw dump as a local cache
**Date** 2026-09-07
**Decision** `pipeline/extract_kaikki.py` writes `data/kaikki_subset.jsonl` (1,323 lemmas, 3.3 MB) into git. The 53 MB raw dump stays in `pipeline/work/` (gitignored).
**Why** kaikki marks its per-language dictionary files DEPRECATED and its replacement per-Wiktionary-edition extracts do not include Slovak, so the file we depend on will disappear. Committing the subset makes the data we actually consume version-controlled and diffable at 6% of the size. Re-deriving from the raw dump stays possible while it exists.
**Consequence** If the upstream file vanishes, the subset still builds the app. Widening the extracted field set later requires the raw dump — keep a copy off-repo.

## D107 — kaikki's Slovak noun tables are unusable; hunspell-sk supplies noun paradigms
**Date** 2026-09-07
**Decision** Take verb, adjective and pronoun paradigms from kaikki (properly tagged), and noun paradigms from hunspell-sk affix expansion (`pipeline/hunspell_sk.py`).
**Why** Measured across bands 1–2: verbs 138/141 and adjectives 54/59 come back fully tagged, but nouns are 228/248 `no-table-tags` — cells carry `source: declension` with no morphological tags, in a flat sequence, *and* wiktextract dedupes repeated values, so `žena` loses genitive singular (identical to nominative plural `ženy`) and `stôl` loses its entire accusative row. Those tables cannot be reconstructed positionally at all.
Then hunspell-sk turned out to be better than the §7.4 fallback assumed: its affix rules carry `is:genitive`, `is:plural`, `is:feminine` annotations, so expanding `stôl/B` yields the full declension *with cases attached* — and it covers band-2 nouns kaikki has no entry for. MPL-2.0, verified in the repo LICENSE, safe to bundle.
**Consequence** Untagged kaikki cells are still preserved as `paradigm_cells_untagged` rather than dropped. Two bugs found while building the expander, both worth remembering: the `.dic` separates morph fields with **spaces, not tabs** (splitting on `\t` left `"B po:noun is:masculine"` as the flag string, so iterating it picked up the `n` in "noun" and invented `stôlnásobny`), and every flag is cross-product enabled — `rozumieť/XN` needs PFX `ne-` combined with SFX conjugation, so expanding them independently misses every negated finite verb, i.e. most of what a beginner says.

## D108 — Register flags are graded and hand-authored, not a blocklist
**Date** 2026-09-07
**Decision** `data/register_flags.json` grades words `vulgar` / `insult` / `mild_expletive`, and records what was deliberately *not* flagged and why.
**Why** §15.2 bug #3 asks for a profanity flag, but a naive list repeats bug #1 in a new place: `teplý` means **warm** (the slang sense is secondary), and `peklo`, `čert`, `diabol` are ordinary nouns that the church track (§9.1) needs. Flagging them would silently delete real vocabulary. hunspell-sk ships `_tematicke/vulgarizmy.dic`, which can cross-check the list later.
**Consequence** `vulgar` is excluded from lessons and generated sentences; `insult` is recognition-only. The `deliberately_not_flagged` block exists so nobody "fixes" this by adding them back.

## D109 — Sentence bank: proper nouns are transparent, but only when they really are names
**Date** 2026-09-07
**Decision** A capitalised token counts as a proper noun (and so does not count against a sentence's band) when it is **not** sentence-initial, or when it is sentence-initial and hunspell does not recognise its lowercase form.
**Why** Tatoeba's Tom-and-Mary convention makes names the most common "unknown lemma" in the i+1 pool (`Mária` 88, `tomovi`+`toma` 119), so counting them as vocabulary wastes teaching slots. But the naive rule — "capitalised means name" — also swallows the first word of every sentence: `Mám ísť s tebou?` lost its main verb, which inflated `band1_clean` from 5,166 to 6,638. Sentence-initial ambiguity is genuinely undecidable (`Tom` vs `tom`, the locative of `ten`), so the tie-breaker errs toward *treating it as a word*, which under-counts rather than over-counts.
**Consequence** 5,166 band-1-clean sentences, 2,999 of them native-authored.

## D110 — Romanian sentence translations must be authored; Tatoeba has almost none
**Date** 2026-09-07
**Decision** Do not plan on sourced Romanian sentence translations. Build the review CSV loop as the way to produce them.
**Why** Measured: of 27,608 filtered Slovak sentences, **19,440 have an English translation and 29 have a Romanian one.** §6.1 warned direct SK↔RO links were "few"; the real number is 0.1%. For a Romanian-first app (D001) this is the largest content gap found so far.
**Consequence** English is the pivot for sentence meaning in v1. Romanian sentence glosses are authored per-sentence for the lesson set, not for all 27k. Worth re-checking whether OPUS `ro-sk` (OpenSubtitles/Europarl) can supply build-time drafts.

## D111 — Numbers: expand what we can prove correct, refuse the rest
**Date** 2026-09-07
**Decision** `pipeline/num2words_sk.py` expands cardinals, currency, decimals, times, units and `20-krát`. It deliberately does **not** expand ordinals, and `unexpandable()` reports them so the sentence is skipped or hand-written.
**Why** Slovak ordinals inflect for case — `na 5. poschodí` needs `piatom`, not `päť`. Emitting the cardinal would teach wrong Slovak, which is worse than having no audio. Of 148 sentences containing digits, 131 expand safely and 17 are refused (dates, centuries, `47. prezident`, `km2`).
**Consequence** Four bugs found by testing rather than by listening, all now covered by `pipeline/test_num2words.py` (57 checks): gender only attaches to a *bare* 1/2 (`dvetisíc` but `dvadsaťdvatisíc`); `eur[a-z]*` never matched `eurá` because `á` is not ASCII; a sentence-final period is punctuation, not an ordinal marker (`v roku 1650.`); and space-grouped thousands (`10 000`) were read as two numbers.

## D112 — Review sign-off is per language, not per record
**Date** 2026-09-07
**Decision** `data/glosses_manual.json` carries `reviewed_en` and `reviewed_ro` separately; a record's `overall` status is the weakest of its parts.
**Why** Caught while round-tripping the review loop: a reviewer correcting an *English* gloss was silently marking the *Romanian draft* in the next column as native-reviewed. That quietly launders a draft into an approved translation, which is exactly what the "MT is a draft, never a shipped answer" guardrail exists to prevent.
**Consequence** All 300 band-1 records read `needs_review` overall — honest, since every Romanian gloss is currently a model-authored draft.

## D113 — Band-1 Romanian glosses drafted; 12 flagged for a register call
**Date** 2026-09-07
**Decision** All 300 band-1 Romanian glosses drafted into `data/glosses_manual.json` with `reviewed_ro: false`.
**Why** Per the agreed split (hand-write band 1 English, draft the rest). Romanian had zero coverage from any source.
**Consequence** Twelve carry a `notes` field flagging a judgement call rather than burying it: `no`/`nuž` (discourse particles, not "no"), `hej` (informal yes — §11.2 measured `áno` 32 / `hej` 58, so they are equals), `fajn`, `chlap` (`tip` colloquial vs `bărbat` neutral), `ok`, `kurva` (vulgar, recognition only), `rád` (`rád + verb` = "îmi place să"), `páčiť` (`páči sa mi` ≈ `îmi place` — dative experiencer in both, per §11.9), `stať` (almost always reflexive), `však` (two distinct uses), and `ký`, which looks like a lemmatiser artefact that may not belong in band 1 at all.

## D114 — The SAS A1/A2 standards are the unit skeleton (they are CC BY-NC-SA)
**Date** 2026-09-08
**Decision** `curriculum/LEARNING-MAP.md` and `content/lessons.jsonl` follow the eight thematic areas of *Témy a ciele jazykového kurzu A1* and *A2* (Comenius University / SAS, 2025), re-ordered by communicative need. Their can-do statements, lexical minimum and grammatical minimum are used directly.
**Why** The research assumed these were link-only references. Fetching them showed both are published under **CC BY-NC-SA 4.0**, which permits this personal, non-commercial use with attribution. They are the official syllabus Slovak textbooks are written to, so aligning to them means the course can be checked against a real exam standard.
**Consequence** Every unit carries `sas_area`. Attribution: "Studia Academica Slovaca, Univerzita Komenského v Bratislave, CC BY-NC-SA 4.0". The PDFs live in `pipeline/work/reference/` (gitignored — they are reference, not content).

## D115 — Band-1 and band-2 glosses drafted in full by the build assistant; nothing native-reviewed
**Date** 2026-09-08
**Decision** All 300 band-1 EN+RO and all 700 band-2 RO glosses, plus 310 band-2 EN glosses, are drafted (`data/glosses_manual.json`, every one `reviewed_*: false`). 40 band-2 "lemmas" are excluded as subtitle junk (`data/lexicon_overrides.json`).
**Why** The learner asked to defer all review and keep building. Drafting everything unblocks the app; the review CSVs still exist for when a native is available.
**Consequence** `content/lexemes.jsonl` reports 100% gloss coverage for bands 1–2, but every record is `needs_review`. The app must show the review state honestly (a small chip), not hide it.

## D116 — Roleplay prompts are tested on a weaker model, and roleplay output never auto-enters the SRS
**Date** 2026-09-08
**Decision** Prompts live in `curriculum/ai-roleplay/`, are rendered by `pipeline/render_prompt.py`, and are tested with a scripted learner on Claude Sonnet before use (`TEST-LOG.md`). Phrases the model proposes as flashcards enter the app as `needs_review`.
**Why** The first test showed the scaffolding (commands, register, debrief) survives a smaller model, but the model's own Slovak does not: it invented *"Dobrý deň, pán!"* and *"Tu iba peniaze"* and then offered the latter as a flashcard. Correcting the *learner* was accurate in both runs; the model's *own* production is the weak point.
**Consequence** v1.1 prompts add "never invent a phrase", canonical lines per scenario, and a flashcard standard/colloquial tag. Recommend the strongest available model for roleplay.

## D117 — Domain packs are hand-ordered and carry the rank only as metadata
**Date** 2026-09-08
**Decision** `content/domain_packs.jsonl` (food/market 109, work/tech 73, church 65) is ordered by real-life need within sections; `spoken_rank` is stored per entry but never used for ordering.
**Why** §15.3. Only 6/109 food-market entries are inside bands 1–2 — the frequency list would have taught none of *deko, bryndza, akcia, zľava, pokladňa* in the first year.
**Consequence** Pack entries outside the 3,000 need a kaikki/hunspell join for paradigms and IPA (pipeline task); RO glosses are drafted inline.

## D118 — Stack: Vite + React + TypeScript PWA; Dexie; ts-fsrs; deployed as a prebuilt folder to Vercel
**Date** 2026-09-08
**Decision** `app/` is a Vite React-TS PWA (vite-plugin-pwa/Workbox), IndexedDB via Dexie, scheduling via ts-fsrs (FSRS-6, retention 0.88), react-router. Deployed with `vercel deploy dist --prod` from the laptop; no CI build.
**Why** The learner chose React+TS, phone-first, and asked for free hosting that does not depend on the laptop, preferring Vercel. Vercel Hobby fits: private, free, 100 GB/month, 15k files / 100 MB per upload. The build needs Python + Piper, so it runs locally and only the static output is uploaded — the site then lives on Vercel's CDN. GitHub Pages was rejected because it needs a public repo and parts of the data are research/non-commercial licensed.
**Consequence** `pipeline/export_app_content.py` ships only referenced audio (1,254 clips, 14.7 MB) instead of all 5,572, and per-unit JSON, so first load is small and each unit becomes offline-capable after one visit. Progress export/import is the backup story (no accounts). Fonts still load from Google Fonts; self-host them before relying on full offline.

## D119 — The first card type is listen → type, graded on token alignment with a diacritics tier
**Date** 2026-09-08
**Decision** `app/src/lib/grade.ts` aligns typed vs reference tokens (DP, costs 0 / 0.4 / 1) and yields ok / warn (diacritics only) / bad / missing / extra. Pass = no bad; strict mode (card stability > 14 days) also requires no warn. Ratings: wrong → Again, diacritics → Hard, right → Good, right on first listen → Easy. Wrong cards are re-queued to the end of the same session.
**Why** Research §2 P5 (retrieval) and §10.1 (lenient → strict diacritics). A word-level diff is far more informative than a whole-sentence boolean, and the diacritics tier is what makes early sessions survivable for a Romanian speaker.
**Consequence** Lemma status: `learning` after the first correct answer, `known` when a card carrying it reaches ≥ 3 reps with stability > 7 days; the coverage meter weights known 1.0 / learning 0.5.

## D120 — Lesson sentences are selected first and their audio synthesized on demand; rarity weights the pick
**Date** 2026-09-08
**Decision** `export_app_content.py` picks each unit's sentences from the whole bank (a sentence qualifies if every lemma is inside the pool band *or* is one of the unit's own targets), scores target hits by √rank, and only then renders missing clips with Piper, persisting them to `content/sentences.jsonl`.
**Why** Three compounding faults made unit 1.6 *Market* teach *"Toto je dom môjho otca"*: audio had been pre-rendered for band 1 only and the exporter required audio, so every sentence with *chlieb* (#2142) or *mlieko* was ineligible; a plain "band ≤ 2" filter excluded them again; and hits were counted, not weighted, so glue verbs (*chcieť* #25) out-scored *káva* (#615). This is research §15.3 reappearing at sentence level — frequency-first logic quietly deletes the everyday transactional words.
**Consequence** Units now read like their titles (*Potrebujem chlieb a mlieko* · *Kľúče sú na stole* · *Kde je najbližšie WC?*). Export renders ~100 extra clips the first time (~2 min) and is idempotent after. Shipped audio: 1,377 clips / 15.9 MB.

## D121 — Pronunciation: a rule-generated Romanian respelling for everything, IPA as the second layer
**Date** 2026-09-08
**Decision** `pipeline/pronounce.py` produces two guides for every Slovak string. (1) `respell_ro`: a deterministic respelling in Romanian orthography (c→ț, č→ce/ci, š→ș, ž→j, j→y, ch→h, k→c/ch, ď/ť/ň/ľ→di/ti/ni/li glides, ä→e, ô→uo, long vowels doubled, v→u glide, final devoicing and voicing assimilation applied, **first syllable in CAPS**, one special symbol **ɦ** for voiced h). (2) IPA: kaikki's where it exists; otherwise Piper's espeak phonemes normalised to Wiktionary conventions (tʲ→c, dʲ→ɟ, ts→t͡s, ie→ɪ̯e, uo→u̯ɔ, h→ɦ), stress marks dropped. Shown under Slovak text as a setting: respelling (default) / IPA / both / off.
**Why** The learner asked how letters and words will be pronounced. Slovak orthography is nearly phonemic (§3), so a respelling can be *generated* for 100% of content — no dictionary gap, no IPA to learn first — and the §4.1 sound map makes Romanian the natural anchor alphabet. IPA alone was rejected as the primary layer: kaikki covers 58% of bands 1–2 and IPA is one more system to learn before the first word. Measured: normalised espeak IPA agrees with kaikki on 79% of band-1–2 lemmas; the remainder is mostly kaikki's own e/ɛ inconsistency. Raw espeak strings are still never shown (D104).
**Consequence** `content/alphabet.json` (46 letters: Slovak letter *name* for spelling your own name, IPA, Romanian anchor, example word, audio for both) backs a new Alphabet screen. 17 respelling checks + 6 IPA checks in `pipeline/test_pronounce.py`. Known limits: syllabic r/l stay bare (*prst*); ť/ď are glide approximations because Romanian has no palatal stops; the softening exceptions in foreign words (*teraz*, *jeden*) are not modelled.

## D122 — Replay and slow replay are first-class; slow clips are rendered by the TTS, not by playbackRate
**Date** 2026-09-08
**Decision** Every clip has ▶ Replay, 🐢 Slow and 🐌 Slower. Slow uses a second clip rendered by Piper at `length_scale 1.4` (`<stem>-slow.ogg`); Slower plays that at 0.75×. Variants and alphabet examples have their own clips.
**Why** `playbackRate 0.7` on a 22 kHz TTS clip smears the palatals and the very length contrasts the learner needs to hear; letting the synthesizer speak slowly keeps them intact. Doubles shipped audio (~2,900 clips, ~32 MB) — still far inside Vercel Hobby limits.

## D123 — Deploys use a personal Vercel token from `app/.env.deploy`; the machine's global Vercel login is never used
**Date** 2026-09-08
**Decision** `app/scripts/deploy.mjs` refuses to run unless `VERCEL_TOKEN` and `VERCEL_SCOPE` are present in `app/.env.deploy` (gitignored) and passes them explicitly; it never falls back to the CLI's stored login.
**Why** The laptop's Vercel CLI is signed in to a work account (synaicore). The learner requires this project to be fully personal. Vercel's CLI holds one global login per machine, so switching it would disturb work projects; a per-command token avoids both problems. The token is created and pasted by the learner — the build assistant does not handle credentials.
**Consequence** Setup checklist in `docs/DEPLOY.md` (personal Vercel account + token + optional personal GitHub private repo). The earlier `vercel whoami` check was read-only; nothing was deployed anywhere.
