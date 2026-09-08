# learn-slovak

A local-first, no-account web app for a Romanian speaker learning **spoken** Slovak to
conversational A2/B1. This repository currently holds the **content and design layer**; the
app itself is not built yet.

| Where | What |
|---|---|
| `SLOVAK-LEARNING-APP-RESEARCH.md` | the research this is built on (§15 = measured spike) |
| `START-HERE.md` | the milestone brief |
| `docs/DECISIONS.md` | every choice made and why (append-only, D001–D117) |
| `docs/SPIKE-RESULTS.md` | Q1/Q2/Q3 answers |
| `docs/PIPELINE.md` · `docs/RESOURCES.md` | how content is built; every source and its licence |
| `curriculum/LEARNING-MAP.md` | 4 phases, 30 units, gates |
| `curriculum/EXERCISE-TYPES.md` | 35 exercise types, specified to build from |
| `curriculum/SCHEDULE.md` | 16 weeks, day by day |
| `curriculum/SPOKEN-SLOVAK.md` | the naturalness layer: what natives say vs. textbook |
| `curriculum/ai-roleplay/` | 8 ChatGPT roleplay prompts, renderer, test log |
| `content/*.jsonl` | lexemes (3,000) · sentences (27,608) · chunks (144) · grammar_notes (61) · lessons (30) · minimal_pairs (64) · domain_packs (3) · texts/ |
| `content/audio/` | 5,572 OGG clips (gitignored, regenerable) |
| `data/` | committed derived data: kaikki subset, glosses, cognates, false friends, flags, overrides |
| `design/` | tokens.json, DESIGN-SYSTEM.md, illustrations/ |
| `pipeline/` | Python build scripts (`.venv`, Python 3.11) |
| `review/` | CSVs for a native reviewer |

## Build everything

```bash
source .venv/bin/activate
python -m pipeline.extract_kaikki && python -m pipeline.extract_seed_tables
python -m pipeline.build_lexicon && python -m pipeline.build_sentences
python -m pipeline.author_chunks && python -m pipeline.author_grammar
python -m pipeline.author_minimal_pairs && python -m pipeline.author_domain_packs
python -m pipeline.author_lessons
python -m pipeline.build_audio --all --band 1 && python -m pipeline.build_audio --chunks
python -m pipeline.test_num2words
```

Every content record carries `source`, `licence`, `attribution`, `review_status`. Nothing has
been reviewed by a native speaker yet — every gloss and chunk is a draft and says so.
