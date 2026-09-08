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
