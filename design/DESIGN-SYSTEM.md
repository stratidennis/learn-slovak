# Design system

Tokens live in `design/tokens.json`; this explains the choices. The look is **warm, calm, and
Slovak-flavoured without flags**: folk-embroidery gold and a deep blue on warm paper. It is
built for a 45-minute daily session, so contrast and rhythm matter more than delight — but the
streak, the coverage meter and the "you got it" moments get the colour.

## Palette

| Role | Token | Hex | Why |
|---|---|---|---|
| **Primary** | `primary` | `#2457C5` | Deep blue — nods to the flag and to Modra ceramics without being a flag. 6.5:1 on white: the one brand colour safe for text. |
| **Secondary** | `secondary` | `#F2B233` | Embroidery gold. Warmth and reward: streak flame, XP, badges, secondary buttons (ink text on gold — gold is *never* text). |
| **Accent** | `accent` | `#E4573D` | Coral from the flag red. Rationed: coverage-meter fill, the "new word" dot, the recording indicator, *natives say* chips. If it appears more than twice on a screen, something is wrong. |
| Success | `success` | `#1E9E62` | Correct. Card border + check. |
| Error | `error` | `#C42F2F` | Wrong. Deliberately cooler and darker than coral so the two never read as one hue. Usable as text (5.5:1). |
| Warning | `warning` | `#D97706` | Almost — diacritics only, leech, needs review. Burnt orange, darker than gold so the two stay distinct. |
| Info | `info` = primary | | Grammar-note callouts. |

Each brand/semantic colour has a `-soft` (tinted surface) and, where the base fails 4.5:1, a
`-deep` for text. Checked with the WCAG formula in the build — see the table in `tokens.json`.

### Light / dark

Light is the default: warm paper `#FAF8F4`, white cards, ink `#1B2430`. Dark swaps the ground
to `#121820` and lightens each brand hue one step (`primary` → `#8FB0F2`) so text keeps ≥ 4.5:1.
Gold stays gold — it works on both. Honour `prefers-color-scheme` and give a manual toggle.

### Register chips (the naturalness layer)

Small pill chips with a text label, colour as *secondary* signal only: standard blue, colloquial
gold-deep, formal slate, regional purple, archaic grey, vulgar red. Never colour without the word.

## Type

| Use | Face | Why |
|---|---|---|
| UI, body, Romanian/English glosses | **Inter** | Clean diacritics at 14–16px; tabular numerals for prices and times. |
| Slovak being learned — chunk cards, sentence cards, headings | **Fraunces** (variable, optical size) | A warm serif gives the *target language* visual weight and separates it from the UI voice. Ď Ť Ľ Ň ô ä ŕ ĺ all present and correct at heavy weights. |
| IPA, typed answers, code-ish (numbers sprint) | **JetBrains Mono** | Unambiguous í/i, ĺ/l, ť/t. |

Hard rule: **learner-facing Slovak is never below 18px** (`typography.slovak-text-min-size`).
A dĺžeň at 13px is a rumour. Target word on a card: 44px.

All three are SIL OFL — self-host the woff2 in the app, no Google Fonts call at runtime (offline
PWA, and no third-party requests).

## Layout & motion

- 4px grid; radius 12px on cards, 999px on chips and the primary button.
- One column on phone, max 720px reading width on desktop — this is a reading app.
- Motion is functional: card flip 200ms, correct-answer pulse 320ms, confetti *only* on a unit
  completion, and everything off under `prefers-reduced-motion`.
- Sound: a soft tick for correct, a lower tock for wrong, nothing else. Slovak audio is the
  soundtrack.

## Components (the ones the exercises need)

| Component | Notes |
|---|---|
| **SentenceCard** | Fraunces target sentence, play button (auto-plays once), 0.7×/1× toggle, tap-to-gloss words, register chip top-right |
| **AnswerField** | Slovak keyboard helper row (`ľ š č ť ž ý á í é ď ň ô ä ú ŕ ĺ`) above the OS keyboard; long-press hints; live hunspell squiggle in writing tasks |
| **Diff** | word-level colouring after an answer: success / warning (diacritics) / error |
| **GlossPopover** | lemma · RO (EN on tap) · IPA · form tag (*instrumental sg.*) · grammar-note link · JÚĽŠ deep-link |
| **CoverageMeter** | a horizontal bar in coral on paper; big number; "of casual speech" |
| **Streak** | gold flame, no shame state — a missed day shows "welcome back", not a broken chain |
| **UnitCover** | unDraw illustration recoloured to `primary`, title in Fraunces, can-do list |
| **RegisterChip** | see above |
| **MistakeDiary** | tag pills with counts; each opens a 2-minute drill |

## Illustrations (unDraw)

Recolour every SVG's `#6c63ff` (unDraw's default purple) to `primary` at build time; keep
skin tones and neutrals. Licence: free for any use, no attribution, no bulk download — we
hand-pick. The set we want, by where it appears:

| Where | unDraw title (search term) |
|---|---|
| Onboarding | *Conversation*, *Learning* / *Studying* |
| 0 Sounds | *Audio conversation* (found), *Voice control* / *Podcast* |
| 1.1 Hello | *Hello* / *Greeting* / *Waving* |
| 1.4 Coffee | *Coffee* / *Coffee break* / *Getting coffee* (found) |
| 1.6 Market | *Shopping* / *Grocery* / *Farmers market* |
| 1.7 Where is | *Navigation* (found: `navigation_agc7`), *City* / *Map* |
| 1.8 My day | *Schedule* / *Calendar* / *Morning* |
| 1.9 Feelings | *Feeling happy* / *Mood* |
| 1.10 Phone | *Calling* (found), *Text messages* (found) |
| 1.11 Home | *Sweet home* (found: `sweet-home_b054`) |
| 1.12 Family | *Family* / *Friends* |
| 1.13 Sunday | *Community* / *Together* |
| 2.8 Work & tech | *Working at home* (found: `working-at-home_usrj`), *Programming*, *Bug detected* (found: `bug-detected_71if`), *Deploy globally* (found: `deploy-globally_2k9s`) |
| 2.9 Pharmacy | *Medicine* / *Doctor* |
| 2.6 Transport | *Bus stop* / *Subway* / *Travelling* |
| Progress | *Progress bar* (found: `progress-bar_o44f`), *Winner* (found: `winner_x40e`), *Done* (found: `done_erdp`) |
| Empty / error | *Empty* / *No data*, *Page not found*, *Warning* |
| Review outbox | *Mail sent* (found: `mail-sent_dagx`), *Document review* (found: `document-review_lfir`) |
| Reader | *Reading* / *Book lover*, *Personal notes* (found: `personal-notes_xrz8`) |

Found slugs come from the site's own catalogue page; the rest need a search each — see
`design/illustrations/MANIFEST.json` for what has actually been downloaded and recoloured.

## Inspiration, and what not to copy

- **Duolingo**: the path metaphor and the tiny-win rhythm. Not: the mascot nagging, hearts,
  theme-first vocabulary.
- **Clozemaster**: frequency-ordered sentence clozes as the core loop — that is ours too. Not:
  the density; ours breathes.
- **Anki**: honest scheduling and the "cards are sentences" idea. Not: the UI.
- **Readlang / LWT / Lute**: per-word status colouring in the reader. Copy this exactly.
- **Language Reactor**: dual-subtitle sprint. Our X3 is the lo-fi version.
- **Babbel**: register notes inside lessons ("this is how people actually say it"). Ours is
  systematic instead of occasional.
