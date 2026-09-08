# Spike results — Q1, Q2, Q3

**Run** 2026-09-07 on macOS 25.6 (darwin), Python 3.11.1 venv, simplemma 2.0.0, piper-tts 1.8.0.
**Inputs** `lexicon_bands.csv` (3,000 lemmas: 300/700/1,500/500 across bands 1–4).
**Reproduce**

```bash
.venv/bin/python spike_remaining.py          # Q1 (as shipped), Q2, Q3 instructions
.venv/bin/python spike_q1_negation_check.py  # Q1 with the §15.2 bug-#2 fix
.venv/bin/python spike_q3_piper.py           # Q3 objective checks + audio
```

Artefacts land in `spike_data/` (gitignored).

---

## Summary

| Q | Answer | Verdict |
|---|---|---|
| **Q1** | **4,366** Tatoeba sentences fully inside band 1 | **GO** — >400 gate cleared ~11×. Build Phase 1 from Tatoeba as designed. |
| **Q2** | Band 1 **76%** glossed; band 2 **50%**; bands 1+2 **58%** | **Worse than §15.5 assumed.** 421 of the 1,000 v1 lemmas need hand-written glosses, and the gap is concentrated in function words. |
| **Q3** | **26/26** front-end contrast checks pass | **PASS objectively**, pending a listen. Digits confirmed broken → spell numbers out, as already planned. |

---

## Q1 — Tatoeba sentence availability

32,944 Slovak sentences downloaded (`slk_sentences.tsv.bz2`, 368 KB, CC BY 2.0 FR).

| Measure | Count |
|---|---|
| Sentences, 3–12 tokens | 27,920 |
| … after dedupe (diacritic/case-insensitive) | 27,689 *(231 duplicates)* |
| **Fully inside band 1 — as `spike_remaining.py` ships** | 3,845 |
| **Fully inside band 1 — negation merged (the real number)** | **4,366** |
| Band 1 + exactly one new lemma (the i+1 teaching pool) | 9,462 |
| Fully inside bands 1+2 | 9,532 |

### The shipped script under-reports Q1

`spike_remaining.py` calls simplemma directly, so `nechcem → nechcieť`. Band 1 was built *after*
the §15.2 bug-#2 merge, so it contains `chcieť` but not `nechcieť` — every negated sentence looks
like it has an unknown word. **521 sentences** are recovered by applying the merge, and they are
exactly the ones a beginner needs most:

> *Nerozumiem tomu slovu. · Nechcem ísť do školy. · Nemusíte mi ďakovať. · Dlho sme sa nevideli. · Nehovor mi, že si to nevedel.*

`spike_q1_negation_check.py` re-measures with the fix. The merge rule is narrow — strip `ne-` only
when the remainder is a known lemma ending in `ť` — and is asserted not to damage genuine
`ne`-initial words (`nejaký, nechať, nech, než, nemocnica, nenávidieť, nebo, nedeľa`).

### Two things M2 must handle

1. **Proper nouns are not vocabulary.** The i+1 pool's most common "new lemma" is `Mária` (88),
   then `francúzsky` (78), `zajtra` (74), `tomovi` (60), `toma` (59). Tatoeba's Tom-and-Mary
   convention plus simplemma not lemmatising proper nouns means names are counted as unknown
   words. Detect and treat them as transparent, or the i+1 selector will waste slots on them.
2. **The band-1 pool is subtitle-flavoured too.** Same §15.3 caveat: these sentences come from a
   corpus of film dialogue translations. Skim before shipping.

Sample of the clean band-1 pool (unedited):

> *Mám ísť s tebou? · Kto je ten chlap? · Je tam niekto? · Život je pekný. · Čo sa tam deje? · Ako sa máš? · Môžete mi pomôcť? · Daj mi vedieť, kedy sa vrátiš domov.*

---

## Q2 — kaikki.org dictionary coverage

Downloaded `kaikki.org-dictionary-Slovak.jsonl` (53 MB, 17,711 entries, extracted 2026-09-06 from
the 2026-09-02 **English** Wiktionary dump).

| Set | Has entry | Gloss | IPA | Inflection forms |
|---|---|---|---|---|
| Band 1 (300) | 78% | **76%** | 77% | 56% |
| Band 2 (700) | 50% | **50%** | 49% | 44% |
| **Bands 1+2 (1,000) — the v1 scope** | 59% | **58%** | 58% | 48% |

§15.5's decision rule said "<90% gloss coverage → budget an afternoon writing 300 glosses". Band 1
alone is that afternoon (71 words). **Band 2 is not** — it needs 350 more, so the v1 total is
**421 hand-written English glosses**, on top of ~1,000 Romanian glosses.

### Why the gap is worse than the percentage suggests

The dump is overwhelmingly nominal — 9,237 nouns and 4,059 proper names are 75% of it, against
**34 conjunctions, 53 prepositions, 106 pronouns and 187 adverbs for the entire language**. That
is precisely the shape of band 1. The missing band-1 words are the load-bearing ones:

> v(10), tak(18), **ale**(19), tu(23), už(38), aby(39), za(45), **no**(53), k(65), potom(91),
> nikdy(92), pred(119), sem(129), keby(149), vždy(150), pri(156), až(172), však(195), nech(206),
> než(212), kam(254), u(279) … *(71 total, listed in `spike_data/kaikki_gaps.txt`)*

Verified these are genuinely absent, not a scan artefact: `grep` finds `"word": "ale"` in the file,
but only nested inside the `lenže` entry's synonym list — there is no top-level `ale` entry.
`k` and `pri` do have entries, tagged `no-gloss`.

Silver lining: these are the words where a dictionary gloss would be poor anyway. `no` is not
"no" — it is the discourse particle "well…". `nuž`, `však`, `veď`, `fajn` need a usage note, not a
translation. Hand-authoring them is the right outcome, just a bigger slice of work than budgeted.

### The source is deprecated

kaikki.org marks `kaikki.org-dictionary-*.jsonl` as **DEPRECATED, will be removed**. The
replacement is per-Wiktionary-edition extracts — and **Slovak is not among them** (zh, cs, nl, fr,
de, el, id, it, ja, ko, pl, ru, es, tr, vi only). So the file we have is the only packaged Slovak
extraction kaikki offers, and it will disappear. The alternative is filtering the full 2.7 GB
compressed raw dump.

**Action needed:** our copy at `spike_data/kaikki-slovak.jsonl` is gitignored — a `git clean -x`
destroys it. It should be archived deliberately in M2. See the open question below.

### Alternatives checked

- **FreeDict `slk-eng`** — 827 headwords, last content update 2018, GPL. Too small to move the
  needle and the licence is awkward for bundling. Rejected.
- **kaikki `skwiktionary` extraction** — does not exist (404).
- **Not yet checked:** PanLex (CC0, has sk↔ron pairs) and Wikidata lexemes (CC0). Both are
  plausible for Romanian glosses specifically, which kaikki cannot supply at all.

---

## Q3 — Piper `sk_SK-lili-medium`

Voice: 60 MB ONNX, 22.05 kHz, espeak-ng front-end (`sk`), MIT/CC0.

### Objective: 26/26 contrast checks pass

A voice cannot pronounce a distinction its front-end never emits, so `spike_q3_piper.py`
phonemizes probes through the voice's own espeak-ng and checks the §15.5 contrasts survive.

| Group | Result |
|---|---|
| Palatals `ť ď ň ľ` | PASS — `ten/teň` → `/tˈen/ vs /tʲˈeɲ/`, `byt/byť`, `lak/ľak` all distinct; the `de/ti` softening rule fires (`deti` → `/dʲˈetʲi/`) |
| Vowel length | PASS — `pas/pás`, `sud/súd`, `vila/víla`, `rad/rád`, `kava/káva` all distinct, `ː` present |
| Diphthongs | PASS — `piatok` `/piʲˈatok/`, `môj` `/mˈuoj/`, `kôň` `/kˈuoɲ/`, `biely` `/biʲˈeli/` |
| `h` / `ch` | PASS — `hlad/chlad` → `/hlˈat/ vs /xlˈat/` |
| First-syllable stress | PASS — all six probes incl. `Bratislava` `/brˈatʲislˌava/`, `autobusová` |

Two notation caveats, neither a defect: espeak writes `ť ď` as palatalised `tʲ dʲ` rather than the
strict-IPA palatal stops `c ɟ`, and writes Slovak `h` as plain `h` rather than voiced `ɦ`. The
contrasts are preserved in both cases. **Do not copy espeak's phoneme strings into the app as
learner-facing IPA** — take IPA from kaikki, or hand-write it.

### Numbers: digits are broken, confirming the spell-out rule

| Input | Phonemized as | |
|---|---|---|
| `Stojí to 2,50 eura.` | *…dva **čiarka** päťdesiat eura* | reads the comma aloud; wrong gender (`dva`, should be `dve`) |
| `Stojí to dve eurá päťdesiat.` | *…dve eurá päťdesiat* | correct |
| `Je 15:30.` | *pätnásť tridsať* | literal, not how anyone says it |
| `Je pol štvrtej.` | *pol štvrtej* | correct |

`Mám 25 rokov.` does expand correctly to *dvadsaťpäť*, so cardinals alone are fine — it is
currency, decimals and times that break. **Spelling numbers out as words at build time is
mandatory, not optional.** Also note `päťdesiat` is realised `/pedʲ…/` when spelled out but
`/pædʲ…/` from digits; the spelled-out form matches modern standard Slovak (`ä` → `[e]`).

### Subjective: needs your ears

11 WAVs in `spike_data/q3_audio/`. The diagnostic pairs are `02_price` vs `03_price_dig` (spelled
out vs digits), `06_length` (length minimal pairs), `11_minpair` (palatals), `05_palatals`.
Objective checks cannot tell you whether the voice is *pleasant* enough to listen to daily.

---

## Deviations from the shipped spike script

1. **`fetch()` patched for TLS.** python.org framework builds carry no CA bundle, so every download
   died with `CERTIFICATE_VERIFY_FAILED`. Now uses `certifi` (already a `requests` dependency) and
   streams to a `.part` file rather than `r.read()`-ing 53 MB into memory.
2. **`spike_q1_negation_check.py` added** — Q1 re-measured with the bug-#2 merge (see above).
3. **`spike_q3_piper.py` added** — the shipped script only printed manual instructions, and its
   example commands drop diacritics (`"Dobry den"`), which would have tested nothing.

---

## Open questions for M2

1. **Archiving kaikki.** The only packaged Slovak extraction is deprecated upstream and our copy is
   gitignored. Commit the 53 MB to git (or git-lfs), or extract just the ~3,000 lemmas we care
   about into a small committed JSON and keep the raw file as a local cache?
2. **Romanian glosses.** kaikki is English-only, so all ~1,000 RO glosses are ours to produce.
   Worth evaluating PanLex (CC0, has sk↔ron) before falling back to draft-and-review?
3. **421 English glosses** is a real slice of authoring. Confirm this is hand-work, or accept MT
   drafts marked `needs_review` for the band-2 content words while hand-writing the band-1
   function words.
