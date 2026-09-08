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
