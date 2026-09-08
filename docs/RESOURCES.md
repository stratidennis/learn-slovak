# Resources — everything the course draws on

Status legend: **✓ in repo** (bundled or derived), **↗ link-out** (copyright — the app points to
it), **◌ build-time** (used to make content, not shipped), **☐ to obtain** (books/PDFs you get).
Licences verified where marked ✔; otherwise as stated by the source.

## Core data (all fetched, all in `pipeline/`)

| Resource | What we use | Licence | Status |
|---|---|---|---|
| OpenSubtitles frequency list (hermitdave, 2018, 50k) | `lexicon_bands.csv` ranks | research / non-commercial | ◌ counts only |
| **Tatoeba** Slovak sentences + EN/RO links + user_languages | `content/sentences.jsonl` (27,608) | CC BY 2.0 FR ✔ | ✓ |
| **kaikki.org** Slovak (English Wiktionary extract) | glosses, IPA, verb/adj/pron paradigms, Commons audio links | CC BY-SA 3.0 ✔ | ✓ subset committed (D106) — upstream deprecated |
| **hunspell-sk** (sk-spell) | noun paradigms with cases, OOV filter, POS fallback | MPL-2.0 ✔ | ✓ (unpacked in `pipeline/work/`) |
| **Piper** `sk_SK-lili-medium` | all audio (5,165 sentences + 290 chunks so far) | MIT / voice CC0-ish ✔ | ✓ |
| **Wikimedia Commons / Lingua Libre** recordings (via kaikki) | 176 lemmas with human audio, 42 in band 1 | CC BY-SA 4.0 per file | ↗ URLs stored; fetch at build if wanted |
| **SAS *Témy a ciele A1 / A2*** (Comenius Univ., 2025) | unit structure, lexical & grammatical minimum, can-do statements | **CC BY-NC-SA 4.0** ✔ | ◌ `pipeline/work/reference/` |
| **SAS *Jazykové funkcie A1–A2*** | function inventory for chunks and roleplays | CC BY-NC-SA 4.0 ✔ | ◌ |
| Research doc §4.3 / §4.4 | 84 cognates, 16 false friends | project | ✓ `data/*.json` |
| **unDraw** illustrations | unit covers, empty/success states | free, no attribution, recolour OK ✔; no bulk download | ✓ `design/illustrations/` (hand-picked) |
| Google Fonts: Inter, Fraunces, JetBrains Mono | typography | SIL OFL | ✓ (self-host at build) |

## Learner-facing sources the app links to (never bundles)

| Resource | Use in app | Why link-out |
|---|---|---|
| **SlovakforU** podcast (slovakforu.sk; YouTube/Spotify) — 40+ episodes, colloquial, A1–B2, downloadable materials | immersion feed; X3 subtitle sprint; unit "listen" blocks | © authors |
| **Comprehensible Slovak** + **News in Easy Slovak** (comprehensibleslovak.com) | Phase 2–3 input; transcripts into the i+1 reader | © |
| **Učíme (sa) slovenčinu** (ucimesaslovencinu.sk) — authentic 2–4 min clips + transcripts | Phase 2+ input; proverbs pack | © |
| **JÚĽŠ dictionary portal** (slovnik.juls.savba.sk) | deep-link from every word popover ("authoritative") | © JÚĽŠ, free online |
| **Lingea dict.com SK↔RO** | deep-link for RO meaning check | © Lingea; do not scrape |
| **Forvo** | native pronunciation of a word | free to listen; API paid |
| **SEB Bible audio** (bible.com / YouVersion) | church track: verse-of-the-day audio | © Štúdio Nádej |
| **Roháček Bible** (biblia.sk) | church track: parallel text — **bundleable** (PD) | public domain ✔ |
| **50languages RO↔SK** (100 lessons, native MP3) | Phase 1 supplementary listening; RO↔SK phrase pairs | free personal use; link |
| **slovake.eu**, **e-slovak.sk** | structural cross-check; optional parallel course | free with registration |
| **Zlatý fond SME**, Slovak Wikisource | Phase 4 reading (archaic-tagged) | CC BY-NC-SA / PD per work |
| RTVS / STVR radio & TV, Rádio Regina | Phase 3–4 native listening | © |
| r/Slovakia, HelloTalk/Tandem, UDSCR (Nădlac) | "talk to real people" prompts | — |

## Books to obtain (research §8, priority order)

1. ☐ **Frekvenčný slovník hovorenej slovenčiny** (Gajdošová, Šimková; VEDA 2018) — *the* spoken-frequency reference. Use: re-rank bands 2–3, validate `SPOKEN-SLOVAK.md` §2.
2. ☐ **Krížom-krážom A1, A2 + Cvičebnica** (SAS) — dialogue models; the SAS standards above are derived from it.
3. ☐ Naughton, **Colloquial Slovak** + **Slovak: An Essential Grammar** — grammar-note paraphrase source.
4. ☐ Oravec, **Slovník slangu a hovorovej slovenčiny** — recognition list for colloquial layer.
5. ☐ **Ghid de conversație român-slovac** (Ed. Univ. București) — RO gloss check.
6. ☐ **Prvá pomoc po slovensky** — English version PDF (only UA/TR versions found on the SAS page; ask SAS or IOM).
7. ☐ Comprehensible Slovak, **60 Conversations in Simple Slovak** (ebook) — Phase 2 reading.

## Still to fetch / verify

- Common Voice Slovak clips (CC0) — real human voices for A3/E4; needs the HF dataset download.
- OPUS `ro-sk` (OpenSubtitles / Europarl) — candidate source of *Romanian* sentence drafts (Tatoeba has 29).
- Second Piper Slovak voice for dialogue speaker B — none published as of Sep 2026; fallback is pitch-shift.
- SAS *Jazykové funkcie B1–B2* — Phase 3.
- hunspell-sk **Essential Data** lemma variant — check whether its POS tags are cleaner than sk-spell's (`hneď` = noun).

## URL index

See research doc §13 for the full list; the ones used so far:
- https://downloads.tatoeba.org/exports/ · https://kaikki.org/dictionary/Slovak/ · https://github.com/sk-spell/hunspell-sk
- https://fphil.uniba.sk/…/standardy-pre-slovencinu-ako-cudzi-jazyk/ (A1/A2 PDFs) · https://stella.uniba.sk/texty/FIF_sacj_jazykove_funkcie_ku_A1-A2.pdf
- https://slovakforu.sk · https://www.comprehensibleslovak.com · https://ucimesaslovencinu.sk
- https://undraw.co (licence: https://undraw.co/license) · https://biblia.sk/citanie/roh/mt/6
