# START HERE — brief for the Claude Code instance

## Repo setup (do this before starting Claude Code)

```
slovak-app/
├── SLOVAK-LEARNING-APP-RESEARCH.md   # the research; §15 has measured spike results
├── lexicon_bands.csv                 # 3,000 ranked Slovak lemmas, bands assigned
├── spike_remaining.py                # the three unanswered feasibility questions
└── START-HERE.md                     # this file
```

```bash
cd slovak-app && git init && git add -A && git commit -m "research + lexicon"
python3 -m venv .venv && source .venv/bin/activate
```

Then start Claude Code in that folder.

---

## First message to paste into Claude Code

> Read `START-HERE.md`, then `SLOVAK-LEARNING-APP-RESEARCH.md` — start with §15 (measured spike results), then §9 (curriculum) and §10 (blueprint). §15.2 lists three pipeline bugs that were already found and must not be reintroduced; §15.3 changes how domain vocabulary is ordered.
>
> I'm a software developer. Native Romanian, fluent English, learning Slovak from zero. Target is conversational A2/B1, not academic. Local-first web app, no accounts, no cloud, free sources only.
>
> Work through the milestones in `START-HERE.md` in order. Stop at each decision gate and ask me before continuing. Start with M0 and M1.

---

## Milestones

### M0 — Repo hygiene (30 min)
- `.venv`, `.gitignore` (ignore `spike_data/`, `content/audio/`, `node_modules/`, `.venv/`)
- `pip install simplemma requests`
- Verify `lexicon_bands.csv` loads: 3,000 rows, 300 in band 1
- Create `docs/DECISIONS.md` — an append-only log of every choice made and why

### M1 — Finish the spike ← **start here, this gates everything**
Run `python3 spike_remaining.py`. Write results into `docs/SPIKE-RESULTS.md`.

**Decision gate on Q1** (how many Tatoeba sentences use only band-1 lemmas):

| Q1 result | Phase-1 content strategy |
|---|---|
| >400 | Build from Tatoeba as designed |
| 100–400 | Tatoeba for drills; generate + native-review additional lesson sentences |
| <100 | Generate all band-1 sentences from the lemma list, native-review them; Tatoeba from band 2 up |

**Stop and report Q1, Q2, Q3 before starting M2.** The answer changes the shape of the next milestone.

### M2 — Content pipeline
Build `pipeline/` producing `content/*.jsonl`. Data model is in §10.2. Every record keeps `source`, `licence`, `attribution`, `review_status`.

1. **Lexicon** — join `lexicon_bands.csv` to kaikki (gloss, IPA, POS, gender, aspect, inflection forms). Add Romanian glosses: seed from §4.3 cognate table, draft the rest, mark every drafted one `needs_review`. Flag profanity (`kurva` is rank 244). Flag cognates and false friends from §4.3–4.4.
2. **Sentences** — per the M1 decision. Filters: 3–12 words, Slovak language ID, Czech grapheme/stopword check, hunspell OOV ≤1, dedupe. Annotate lemmas, `spoken_rank_max`, band, register.
3. **Audio** — Piper `sk_SK-lili-medium`, numbers spelled out as words. Pre-render to OGG at build time.

Do **not** frequency-rank domain vocabulary — see §15.3. Hand-curate against the SAS A1/A2 topic standards.

### M3 — Chunks (~150, hand-authored)
From §9 Phase 1 and Appendix C, plus *Prvá pomoc po slovensky*. Each: SK, RO gloss, EN gloss, register, colloquial variant, audio, 2–3 example sentences. This is authoring work, not scripting — expect to sit with it.

### M4 — App scaffold
React + TypeScript PWA, IndexedDB (Dexie), `ts-fsrs` scheduler. One card type working end to end first: **listen → type what you heard**. Then add tap-to-gloss and the coverage meter.

Ship Phase 0 (sounds, §9) + Phase 1 (survival chunks) as the first usable build. Resist adding features before you've used it for a week.

### M5 — Daily use, then iterate
The session template is §9.2. Log what annoys you; that list drives v2.

---

## Guardrails

- **Licence discipline.** Every content record carries its licence and attribution from day one. Tatoeba is CC BY, kaikki is CC BY-SA, hunspell-sk is MPL-2.0, Piper is MIT/CC0. Copyrighted material (SEB Bible text, podcast transcripts, Lingea, Krížom-krážom) is **link-out or build-time reference only** — never bundled.
- **No scraping.** Use published bulk downloads. Don't scrape Lingea or the JÚĽŠ portal; deep-link instead.
- **Don't reintroduce the §15.2 bugs**: never blocklist an English word without checking it isn't Slovak (`to`, `no`); merge negated verbs into positives; flag profanity.
- **Machine translation is a draft, never a shipped answer.** Anything MT-generated stays `needs_review`.
- **No cloud services, no accounts, no telemetry.** Progress lives in the browser with JSON export/import.

## Pre-answered decisions (§14)

1. **Support language:** Romanian glosses first, English on tap. Grammar notes in **English**.
2. **Audio:** pre-render everything with Piper at build time. Revisit if Q3 shows quality problems.
3. **ASR:** Web Speech API first (`lang="sk-SK"`), local Whisper behind a settings flag later.
4. **LLM roleplay:** not in v1.
5. **v1 scope:** bands 1–2 (1,000 lemmas), 200 chunks, 60 grammar notes, 3 domain packs (food/market, work/tech, church).
6. **Native review:** reviewer to be arranged; build the CSV export/import loop so it's ready.
7. **Bible translation:** Roháček (public domain) bundled; SEB linked for audio.
8. **Czech:** ignore in v1.

## Ask me when

- Q1 comes back and the strategy branches
- A source turns out to be unusable or differently licensed than §6 says
- The RO gloss drafting needs judgement calls on register
- Anything in the research contradicts what you find in the data — the data wins, and update the doc
