# Content pipeline

Build-time only. Produces `content/*.jsonl` + `content/audio/*.ogg` from free sources.
Nothing here runs in the app.

```bash
source .venv/bin/activate          # or prefix everything with .venv/bin/
python -m pipeline.extract_kaikki        # 53MB dump  -> data/kaikki_subset.jsonl
python -m pipeline.extract_seed_tables   # research §4.3/§4.4 -> data/*.json
python -m pipeline.build_lexicon         # -> content/lexemes.jsonl   (3,000)
python -m pipeline.build_sentences       # -> content/sentences.jsonl (27,608)
python -m pipeline.build_audio --all --band 1   # -> content/audio/*.ogg (5,165)
python -m pipeline.test_num2words         # 57 checks
```

`pipeline/work/` holds downloads (gitignored). `hunspell-sk` must be unpacked there:

```bash
curl -sL -o pipeline/work/hunspell-sk.tar.gz \
  https://codeload.github.com/sk-spell/hunspell-sk/tar.gz/refs/heads/master
tar xzf pipeline/work/hunspell-sk.tar.gz -C pipeline/work
```

## Modules

| Module | Does |
|---|---|
| `common.py` | Paths, licence constants, `fetch()` (certifi + streaming), `load_bands()`, `make_denegator()` (§15.2 bug #2), Slovak tokenizer |
| `hunspell_sk.py` | Affix expander. Tagged paradigms (nouns especially) + the 2.2M-form set used for OOV checking |
| `extract_kaikki.py` | Pulls only our lemmas out of the deprecated kaikki dump |
| `extract_seed_tables.py` | Parses the §4.3 cognate and §4.4 false-friend tables out of the research doc |
| `build_lexicon.py` | Joins everything into `content/lexemes.jsonl` |
| `build_sentences.py` | Tatoeba → filtered, annotated `content/sentences.jsonl` |
| `num2words_sk.py` | Slovak number→words. Mandatory before TTS (Q3) |
| `build_audio.py` | Piper → OGG/Vorbis via `soundfile` |
| `review_export.py` / `review_import.py` | The native-review CSV loop (D006) |

## Where the data comes from

| Field | Source | Licence |
|---|---|---|
| rank, band, subtitle_count | `lexicon_bands.csv` (OpenSubtitles via hermitdave) | research / non-commercial — **build-time only** |
| gloss_en, IPA, aspect, gender | kaikki (English Wiktionary) | CC BY-SA 3.0 / GFDL |
| verb + adjective + pronoun paradigms | kaikki | CC BY-SA 3.0 |
| **noun paradigms**, OOV check | hunspell-sk | MPL-2.0 |
| gloss_ro, hand-written gloss_en | this project | project-authored |
| sentences, en/ro translations | Tatoeba | CC BY 2.0 FR |
| audio | Piper `sk_SK-lili-medium` | MIT / CC0 |
| human word audio (176 lemmas) | Wikimedia Commons (Lingua Libre) | CC BY-SA 4.0, per file |

Every record carries `source`, `licence`, `attribution`, `review_status`.

## Review loop

```bash
python -m pipeline.review_export --what gloss-gaps --band 1   # missing glosses to write
python -m pipeline.review_export --what gloss-gaps --band 1 --all-rows  # drafts to check
python -m pipeline.review_export --what sentences  --band 1 --limit 400
# ... fill the *_new / verdict columns in a spreadsheet ...
python -m pipeline.review_import review/gloss_gaps_band1.csv --reviewed-by-native
python -m pipeline.build_lexicon
```

`verdict` is `ok` / `fix` / `drop` / blank. Blank means "not reached yet" and changes nothing.
`--reviewed-by-native` is what promotes a draft to `reviewed_ok`; without it, edits stay
`needs_review`. Sign-off is tracked **per language** (`reviewed_en`, `reviewed_ro`) — see D112.

## Known gaps

- **Romanian sentence translations: 29 of 27,608.** Tatoeba effectively has no sk↔ro links (D110).
- **421 English glosses** missing across bands 1–2 (kaikki is thin on function words).
- **Band 2–4 Romanian glosses** not drafted yet (band 1 is done, as drafts).
- **17 sentences** contain ordinals the number expander refuses to guess at (D111).
- Noun paradigms come from hunspell affix expansion, which under-generates where a rule
  carries a continuation class (`naj/s`). Never over-generates.
- **hunspell POS tags are a hint, not gospel** — it is a spell-checker first, and tags `hneď`
  (adverb) as `po:noun is:feminine`. `pos_source` on each lexeme records the provenance.
- ~100 lemmas in bands 1–2 still have no POS: words like `už`, `však`, `no`, `nikdy`, `kam`, `až`
  exist in hunspell only as derived forms, not as headwords, and kaikki has no entry. They are the
  same function words already queued for hand-written glosses.

## `corpus_bias`

Every lexeme carries a `corpus_bias` code, because the ranks in `lexicon_bands.csv` come from
film subtitles and are **not** a teaching order (research §15.3).

| Value | Means |
|---|---|
| `subtitles:trusted` | Closed-class words — pronouns, prepositions, conjunctions, particles, numerals, adverbs. Subtitle frequency is genuinely reliable here. |
| `subtitles:review` | Band-1 content words (verbs, nouns, adjectives). Mostly the real core — *byť, mať, vedieť, chcieť* — but the crime cluster lives here too: *zabiť* 117, *mŕtvy* 233, *zbraň* 250, *smrť* 291. Skim before teaching. |
| `subtitles:domain-skewed` | Band 2+ content words. OpenSubtitles is dubbed Hollywood drama: *chlieb* is rank 2,142 and *zastávka*, *lekáreň*, *kaviareň*, *zľava*, *pokladňa* fall outside the top 3,000 entirely. **Never order domain vocabulary by rank** — hand-curate against the SAS A1/A2 topics. |

## Authoring scripts (added 2026-09-08)

Hand-authored content lives *in* these scripts so it is diffable and rebuilt like everything else:

| Script | Output | Content |
|---|---|---|
| `author_chunks.py` | `content/chunks.jsonl` | 144 Phase-1 chunks + 146 colloquial/formal variants, per unit |
| `author_grammar.py` | `content/grammar_notes.jsonl` | 61 micro-notes with RO analogies, tables, tags |
| `author_lessons.py` | `content/lessons.jsonl` | 30 units: can-do, chunks, notes, exercise sequence, sentence selection, roleplay |
| `author_minimal_pairs.py` | `content/minimal_pairs.jsonl` | 64 items, hunspell-verified, phonemically distinct through Piper |
| `author_domain_packs.py` | `content/domain_packs.jsonl` | food/market · work/tech · church, hand-ordered |
| `render_prompt.py` | stdout / file | fills `{{KNOWN_WORDS}}` etc. in a roleplay prompt |
| `build_audio.py --chunks` | `content/audio/chunk-*.ogg` | chunk + variant clips |

`content/texts/otcenas.json` is hand-written JSON (Roháček text is public domain).
