# AI roleplay prompts

You paste one of these into ChatGPT (or Claude, Gemini, a local model) and talk. The app fills the
`{{…}}` slots from your progress before you copy it. Nothing here needs a specific model — every
prompt was tested against a smaller model (Claude Sonnet) to make sure a weaker model still
obeys the constraints; see `TEST-LOG.md`.

## Design rules (why the prompts look the way they do)

1. **The model plays a person, not a teacher.** A shopkeeper who happens to be patient. Teaching
   happens in a separate *debrief* step at the end, never mid-conversation — corrections
   mid-flow kill the roleplay and the model drifts into lecture mode.
2. **Bounded vocabulary.** The prompt carries your known-lemma list and tells the model to stay
   inside it plus a small allowance of new words per turn. This is the i+1 principle applied to
   conversation, and it is the single constraint smaller models most often break — hence the
   explicit "if you need a word outside the list, use it *and* put its Romanian in brackets".
3. **Short turns.** One or two sentences per model turn. Long turns are the second most common
   failure.
4. **Spoken Slovak, not textbook.** The prompt names the specific colloquial forms to prefer
   (*hej, fajn, v pohode, Dobrý, prosím si, dám si*) and the textbook forms to avoid
   (*Mám sa dobre, ďakujem, a vy?*). Left to itself, every model produces textbook Slovak.
5. **Escape hatch.** You type `?` → the model gives the Romanian for its last line. You type
   `!` → it says the same thing more slowly/simply (shorter words, same meaning). You type
   `koniec` → debrief.
6. **Debrief format is fixed** so you can paste it back into the app's mistake diary: a table
   of *what you said → what a native would say → why (one line)*, then three phrases to add to
   SRS.

## Files

| File | Scenario | Unit | Length |
|---|---|---|---|
| `R1-market.md` | Buying fruit and cheese at a Saturday market | 1.6 | 8–10 turns |
| `R2-cafe.md` | Ordering, asking for wifi, paying | 1.4 | 6–8 turns |
| `R3-feedback.md` | *Not a roleplay* — paste something you wrote or a transcript, get the debrief only | any | — |
| `R4-after-church.md` | Small talk after the service; someone asks where you're from | 1.13 / 2.12 | 8–10 turns |
| `R5-standup.md` | Daily stand-up: what you did, what you'll do, a blocker | 2.8 | 8–10 turns |
| `R6-pharmacy.md` | Describe a cold, understand dosage instructions | 2.9 | 8 turns |
| `R7-neighbour.md` | Meeting a neighbour in the corridor; the invitation you have to politely decline | 1.9 / 2.11 | 8–10 turns |
| `R8-phone-booking.md` | Phoning to book a table / an appointment | 1.10 | 6–8 turns |

## Slot reference

| Slot | Filled with |
|---|---|
| `{{KNOWN_WORDS}}` | comma-separated lemmas the SRS marks as *learning* or *known* (band order) |
| `{{UNIT_CHUNKS}}` | the current unit's chunks, one per line, standard + colloquial variant |
| `{{WEAK_TAGS}}` | your top 3 mistake-diary tags this week, e.g. `case:acc, palatal:ť, register` — the debrief pays extra attention to these |
| `{{LEVEL}}` | `A1` / `A2` |
| `{{NAME}}` | your first name (the character will use it) |
