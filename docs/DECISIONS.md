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
