# Slovak Learning App — Source Material & Method Research

**Purpose of this document:** Hand-off research for a Claude Code instance that will build a local-first web application to learn Slovak from zero to a solid conversational level (CEFR A2 → low B1), for a learner whose L1 is **Romanian** and L2 is **English**. Covers: what "basic conversational Slovak" actually requires, how people learn languages efficiently (evidence), what free/open source material exists (frequency data, corpora, dictionaries, grammar, courses, audio, speech tech, NLP tooling), how Romanian helps (and where it misleads), what "real" spoken Slovak looks like versus textbook Slovak, and a concrete curriculum + feature blueprint.

**Research date:** 2026-09-07. Every URL was live at research time unless marked *(verify)*. Items marked *(verify)* were not directly confirmed and should be checked before relying on them.

> **Update — §15 contains executed spike results.** The frequency pipeline was actually built and run; §15 reports measured numbers, corrects two claims elsewhere in this document that the data disproved, and flags a design change to how domain vocabulary is ordered. Read §15 before acting on §9 or §10. Companion files: `lexicon_bands.csv`, `spike_remaining.py`.

**Non-goal:** This is not the app spec. It is the evidence base and the design rationale the spec should be built from. Section 10 ("Blueprint") is a strong recommendation, not a mandate.

---

## 0. Executive summary (read this first)

1. **Free material is sufficient.** Every layer the app needs exists in open or freely accessible form: word-frequency lists (subtitle-based, CC BY-SA), ~33k Slovak sentences with translations (Tatoeba, CC BY), tens of thousands of Romanian↔Slovak and English↔Slovak aligned sentence pairs (OPUS), a machine-readable dictionary with inflection tables and IPA (kaikki.org/Wiktionary), an offline Slovak TTS voice (Piper `sk_SK-lili-medium`, CC0 data, MIT code), open speech recognition for Slovak (Whisper + a Slovak fine-tune), lemmatizers/taggers (Stanza, hunspell-sk), free A1–B2 courses with audio (slovake.eu, e-slovak.sk), public-domain literature (Zlatý fond SME), and podcasts with transcripts (Comprehensible Slovak, SlovakforU).
2. **The key differentiator you asked for — "teach what people actually say" — has a real scientific backbone.** The Slovak Academy of Sciences published a *Frequency Dictionary of Spoken Slovak* (2018) built from a 6.6-million-token spoken corpus. Together with the OpenSubtitles frequency list (dialogue-heavy) and the SlovakforU podcast (explicitly colloquial), this lets you rank vocabulary by *spoken* usage instead of textbook themes. Section 5 explains how to build a "naturalness layer".
3. **Target size is knowable.** Research on lexical coverage: roughly 2,000–3,000 word families give ~95% coverage of informal spoken language, which is the threshold for comfortable listening comprehension. So the whole project is: master ~300 "glue" words + ~200 formulaic chunks fast, then grow to ~2,500 words across your chosen domains, all embedded in natural sentences with audio.
4. **Romanian is a genuine head start, not just a UI language.** Romanian has hundreds of Slavic loanwords (prieten↔priateľ, iubi↔ľúbiť, trebuie↔treba, târg↔trh, graniță↔hranica, slujbă↔služba…), shares double negation, pro-drop, gendered nouns, clitic pronouns, and a formal *voi/vy* system. Romanian also has ~direct sound equivalents for Slovak c/č/š/ž/dž/j. Section 4 gives the mapping and a curated cognate + false-friend list to bootstrap ~300 "free" words on day one.
5. **Speech is the weakest free layer, and it's still good enough.** Tatoeba has *no* native Slovak audio, so sentence audio will be TTS. Piper's Slovak voice is offline and decent; Coqui has a Slovak VITS model; Microsoft's neural sk-SK voices are reachable via unofficial Edge-TTS wrappers (licence caveat). For real human voices: Common Voice Slovak (CC0), podcasts, RTVS, audio Bible. For recognition: Whisper large-v3 works; a Slovak-fine-tuned Whisper-small cuts error rates sharply.
6. **Existing apps to learn from (not copy):** Ling (the one you're using), Mondly (Romanian company, has RO→SK), Clozemaster (sentence-cloze from Tatoeba), Anki + FSRS (scheduling), Lute/LWT (tap-to-gloss reading), Language Reactor (subtitles). Your app's edge = spoken-frequency ordering + Romanian-aware scaffolding + domain tracks (market, tech, church, daily life) + local/offline + real speech tech.

---

## 1. Learner profile and target

| Item | Value |
|---|---|
| L1 | Romanian (native) |
| L2 | English (fluent) |
| Target language | Slovak (standard *spisovná slovenčina*, with awareness of colloquial *hovorová slovenčina*) |
| Goal | Understand and hold a normal everyday conversation with a Slovak speaker; read simple texts and eventually a short book; write short messages. Not academic/literary Slovak. |
| CEFR anchor | A2 solid, B1 receptive. ("Basic" as you define it = A2+ speaking, B1 listening/reading.) |
| Domains requested | Everyday life, markets/shopping, technology/work, reading, church life, plus the usual (family, food, travel, weather, health basics, hobbies, opinions, phone/messaging). |
| Constraints | Free, local-running web app; no paywall; content from open/free sources; both RO and EN as support languages (RO preferred). |

### 1.1 What "basic conversational" means in numbers

- **Lexical coverage research** (Nation; Adolphs & Schmitt; van Zeeland & Schmitt; Webb & Rodgers): informal spoken language (conversation, TV, narratives) is ~95% covered by the most frequent **2,000–3,000 word families**; 95% is the comprehension threshold for listening to informal speech; 98% (needed for effortless reading of novels) requires 6,000–9,000. Sources: Cambridge *Learning Vocabulary in Another Language* ch. 4; van Zeeland & Schmitt 2013; Nation 2006 (see §13 links).
- **Practical translation for Slovak:** Slovak is highly inflected, so "word family" = lemma + all its case/tense forms. The app must count *lemmas*, not surface forms, and must teach forms in context (a learner who knows *dom* must also recognize *doma, domu, dome, domov, domy*).
- **Working targets:**
  - Phase 1 (survival): ~300 glue words + ~150 chunks (≈ A1 speaking).
  - Phase 2 (core): ~1,000 lemmas (≈ A1+/A2).
  - Phase 3 (domains): ~2,500 lemmas (≈ A2/B1 listening at 95% coverage of casual speech).
  - Phase 4 (reading a short book): ~3,500–4,000 with tap-to-gloss assistance.
- **Official Slovak reference for levels:** Studia Academica Slovaca (Comenius University) publishes *Štandardy pre slovenčinu ako cudzí jazyk*: *Témy a ciele jazykového kurzu A1* (PDF online) and *Jazykové funkcie na komunikačnej úrovni A1–A2*. Use these as the syllabus skeleton (they were derived from CEFR + corpus data). URLs in §13.
- **Time reality check:** Slovak adult A1 courses are typically ~70 contact hours per level (Slovak Ministry teacher handbook, 2018). Self-study with SRS + input, 45–60 min/day: expect A1 in ~2–3 months, A2 in ~6–8 months, B1 listening in ~12 months. Slavic case morphology is the main time sink; don't let the app hide it, but don't front-load it either (see §9).

---

## 2. How people actually learn languages — principles the app should encode

These are the evidence-backed ideas that should drive design decisions. Each maps to a feature in §10.

| # | Principle | Evidence / origin | What it means for the app |
|---|---|---|---|
| P1 | **Frequency-first vocabulary** | Nation's four strands; coverage studies (§1.1). The first 1,000 lemmas do most of the work. | Order all content by *spoken* frequency rank, not by theme. Themes are a filter on top of frequency, not the primary axis. Measured: "want" (*chcieť*) rank 25, "know" (*vedieť*) 16, "can" (*môcť*) 17, "go" (*ísť*) 21 — all top-30; "sick" (*chorý*) is rank 642, i.e. real band-3 vocabulary, not lesson-one material. But see §15: pure frequency has its own failure mode. |
| P2 | **Chunks / formulaic language before grammar** | Lexical Approach (Lewis), formulaic sequences (Wray), Pimsleur-style graduated recall. Fluent speakers retrieve prefabricated chunks, not rules. | Teach *Prosím si kávu* / *Koľko to stojí?* / *Nerozumiem, ešte raz, prosím* as units on day 2, and only later decompose them. |
| P3 | **Sentences, not isolated words, in SRS** | Context aids retention and teaches collocation + morphology. Clozemaster and "sentence mining" (Refold/AJATT) show this works at scale. | The review card is a sentence with one target item (cloze or full), with audio. Words are tracked, sentences are the delivery vehicle. |
| P4 | **Spaced repetition with a modern scheduler** | FSRS (Free Spaced Repetition Scheduler) outperforms SM-2; open-source in TS (`ts-fsrs`, FSRS-6). | Use `ts-fsrs`. Store per-card difficulty/stability/retrievability. Target 85–90% retention. |
| P5 | **Retrieval practice > recognition** | Testing effect (Roediger & Karpicke). Producing beats re-reading. | Prefer "type it" / "say it" / "pick the form" over "flip and nod". Grade leniently on diacritics early, strictly later. |
| P6 | **Comprehensible input at i+1** | Krashen; extensive reading/listening research (Nation & Waring: ~98% known words for pleasure reading; 95% ok for listening). | An "i+1 reader": only present a sentence/text if ≤1 unknown lemma (adjustable). Show an unknown-word meter on any imported text. |
| P7 | **Pronunciation first, briefly** | Wyner (*Fluent Forever*): train the ear on new phonemic contrasts (Slovak: vowel length, ľ/l, ť/t, ď/d, ň/n, h/ch) before vocabulary, via minimal pairs. | Week 1 = sounds + alphabet + minimal-pair listening tests. Keep it to a few days, then recycle inside lessons. |
| P8 | **Output early, but low-stakes** | Swain's output hypothesis; speaking forces noticing gaps. | Shadowing from day 1; short RO→SK production prompts; LLM roleplay bounded to known vocab. |
| P9 | **Interleaving and desirable difficulty** | Cognitive science of learning (Bjork). | Mix exercise types within a session; don't run 20 identical drills. |
| P10 | **Grammar as "just-in-time" explanation** | Focus-on-form research: brief, contextual grammar notes attached to real sentences outperform front-loaded grammar chapters for communicative goals. | Tap any word → why it has this ending (case, gender, aspect) + Romanian analogy. Full grammar reference available, never mandatory. |
| P11 | **Authentic input, graded** | Naturalness: textbook dialogues are often not what natives say. | Every phrase carries a "natives say" field (standard vs. colloquial); source sentences from subtitles, podcasts and native-written corpora, not only textbooks. |
| P12 | **Motivation through visible progress** | Coverage % is a motivating, honest metric. | Show "you now understand X% of casual speech" computed from known lemmas × frequency weights. |

**Debate to be aware of:** input-only purists (Krashen/ALG) vs. output-early. For a *conversational* goal with a one-year horizon, the pragmatic consensus is: heavy input + daily short output + SRS. Do both.

---

## 3. What Slovak is, briefly (for the builder, not the learner)

- West Slavic; ~5 million speakers in Slovakia + minorities (Czechia, Serbia/Vojvodina, Hungary, **Romania**, Ukraine, diaspora). Mutually intelligible with Czech to a very high degree (commonly cited ~95% for Slovak speakers understanding Czech; a bit lower the other way).
- Latin alphabet with diacritics: `a á ä b c č d ď dz dž e é f g h ch i í j k l ĺ ľ m n ň o ó ô p q r ŕ s š t ť u ú v w x y ý z ž`. `ch`, `dz`, `dž` are single letters (matters for sorting/hyphenation).
- **Orthography is nearly phonemic** — a huge gift: once the ~40 sound rules are known, any written word can be pronounced and vice versa (unlike English). Exceptions: `y` vs `i` (same sound), the *de/te/ne/le* softening rule, voicing assimilation, and the *v* → [u̯] rule.
- **Standard vs. colloquial:** codified standard (*spisovná slovenčina*) is maintained by the Ľ. Štúr Institute of Linguistics (JÚĽŠ SAV); the codification handbooks are *Pravidlá slovenského pravopisu* (2013), *Krátky slovník slovenského jazyka* (2020), *Pravidlá slovenskej výslovnosti* (2009), *Morfológia slovenského jazyka* (1966). Everyday speech (*hovorová slovenčina*) differs modestly in phonetics, lexicon and some morphology; dialects (western/central/eastern) differ more. The app should teach standard forms as the base and mark colloquial variants explicitly (§5).
- **Grammar headline:** 3 genders (+ masculine animate/inanimate split), 6 cases in active use (nominative, genitive, dative, accusative, locative, instrumental; vocative is vestigial), adjectives agree, verbs have perfective/imperfective aspect, 3 conjugation classes, past tense = l-participle + auxiliary, pro-drop, flexible word order, second-position clitics, double negation, formal address = 2nd plural (*vykanie*).

---

## 4. The Romanian advantage — and where it bites

Romanian is a Romance language with a heavy Slavic lexical layer (Slavic loans are commonly estimated at ≥15% of the total vocabulary and are concentrated in everyday, emotional and rural registers — exactly the register a conversational learner needs). Romanian also spent centuries in contact with Hungarian and German, as did Slovak, so there is a second layer of *shared borrowings* (Transylvanian Romanian ↔ Slovak via Hungarian/German). And Romanian grammar has features (gender, cases, clitics, pro-drop, double negation) that make Slovak grammar *conceptually* familiar even where forms differ.

### 4.1 Sound mapping (Romanian speaker → Slovak)

| Slovak letter | Sound | Closest Romanian | Note for the learner |
|---|---|---|---|
| c | [ts] | **ț** | Never [k]! *cena* = "țena". |
| č | [tʃ] | **ce/ci "c"** (ceai) | |
| š | [ʃ] | **ș** | |
| ž | [ʒ] | **j** (joc) | |
| dž | [dʒ] | **ge/gi "g"** (geam) | rare |
| dz | [dz] | — (like "dz" in *dzeu* dialectal) | rare; *medzi* |
| j | [j] | **i** semivowel (iar, doi) | *ja* = "ia" |
| ch | [x] | **h** in *hram*, but always strong/velar | *chlieb*, *chcem* |
| h | [ɦ] voiced | — (softer, voiced version of h) | *hovoriť*; contrast **h/ch** is phonemic |
| ľ | [ʎ] palatal l | ≈ "li" glide in *liliac*, but a single sound | *ľúbiť*, *ľudia*; also written l before e/i in native words (*leto*, *lipa*) — regional/optional today |
| ň | [ɲ] | ≈ *ni* in *nimic* but single sound | *ňu*, *deň* |
| ť, ď | [c], [ɟ] palatal t/d | — no RO equivalent; NOT "ti/di" | *ťava*, *ďakujem*; also spelled t/d before e/i in native words (*deti* = [ɟeci]) |
| ä | [æ]→[ɛ] | between a and e; most speakers say *e* | rare: *mäso*, *päť* |
| ô | [u̯o] | ≈ "uo" | *môj*, *stôl* |
| ia, ie, iu | diphthongs | "ia", "ie", "iu" as glides | *piatok*, *viem* |
| á é í ó ú ý, ĺ ŕ | **long** vowels / syllabic consonants | — Romanian has no length | Length is **phonemic**: *pas* (passport) vs *pás* (belt); *sud* (barrel) vs *súd* (court) |
| r, l syllabic | *prst, vlk, stĺp, vŕba* | — | No vowel needed |
| y / ý | same as i / í | i | Spelling only (historical), affects morphology tables |
| v before consonant / final | [u̯] | "u" glide | *pravda* ≈ [prau̯da], *dav* ≈ [dau̯] |
| stress | **always first syllable** | RO stress is variable | Biggest prosody fix for RO speakers; long vowels are not stress |
| final devoicing | *chlieb* → [xliep], *hrad* → [hrat] | — | |
| rhythmic law | no two long syllables in a row | — | Explains ending changes (*krásny* but *dobrý*) |

**Shared greeting:** *Servus* is a normal informal greeting in western Slovakia and in Transylvanian/Banat Romanian. *Čau* ↔ *ciao*. *Ahoj* is the default informal hello/goodbye.

### 4.2 Grammar transfer map

| Feature | Romanian | Slovak | Transfer |
|---|---|---|---|
| Articles | enclitic definite (*omul*), indefinite (*un om*) | **none** | Simplification — drop them. |
| Gender | m/f/n (neuter = m sg / f pl) | m/f/n, real neuter; masc. animate vs inanimate | Concept transfers; assignment mostly from endings (‑a → f, ‑o/‑e → n, consonant → m). |
| Cases | N/A, G/D, V (mostly via articles) | 6 cases on noun + adjective + pronoun | Concept transfers ("*lui* Ion / *Ionului*" ≈ dative); forms don't. Teach case by *function + preposition*, not by table. |
| Pro-drop | yes | yes | Direct transfer. |
| Clitic pronouns | *îl, îi, mă, te, se* | *ho, mu, ma, ťa, sa* | Direct concept transfer; Slovak clitics sit in **second position** of the clause (Wackernagel), e.g. *Včera som ho videl*. |
| Reflexive | *se/își* | *sa/si* | Direct. *a se spăla* = *umývať sa*; *a-și cumpăra* = *kúpiť si*. |
| Double negation | *Nimeni nu a văzut nimic* | *Nikto nič nevidel* | Direct transfer — a Slovak strength for RO speakers. |
| Formal address | *dumneavoastră* + plural verb | *vy* + plural verb (*vykanie*) | Direct. *Ako sa máte?* |
| "It is necessary" | *trebuie* | *treba* | Same word, same construction: *Treba ísť* = *Trebuie să mergem*. |
| Past tense | compound *am fost* | compound *bol som* (l-participle + *byť*) | Parallel structure; note participle agrees in gender/number. |
| Future | *voi merge* / *o să merg* | *budem* + inf. (imperfective) **or** perfective present (*pôjdem*) | Half transfers; aspect is new. |
| Aspect | none (some via *a* vs *a se*) | every verb is perfective or imperfective (pairs: *robiť/urobiť*, *písať/napísať*) | **New concept.** Teach as "process vs. result", introduce pairs gradually, never as a grammar chapter first. |
| Numbers + nouns | *doi oameni, cinci oameni* | *dvaja muži, päť mužov* (2–4 + Nom pl; 5+ + Gen pl) | New rule; drill with prices/quantities. |
| Subjunctive | *să* clauses | infinitive or *aby* + past form | *Vreau să merg* = *Chcem ísť*; *Vreau să mergi* = *Chcem, aby si šiel*. |
| Word order | SVO-ish, flexible | very flexible, topic–comment; new info last | Mostly fine; watch clitic placement. |

### 4.3 Cognate bootstrap: Romanian words of Slavic origin with living Slovak counterparts

Use these on day 1–3 as "you already know these". Confidence: high unless marked *(shift)* — meaning shifted, still useful as a memory hook. Verify a handful with a native or the JÚĽŠ dictionary portal before publishing; etymologies are standard but individual Slovak usage notes should be checked.

| Romanian | Slovak | Meaning (SK) | Note |
|---|---|---|---|
| prieten | priateľ | friend | core |
| a iubi | ľúbiť | to love | *Ľúbim ťa* |
| drag | drahý | dear; **expensive** | *(shift)* both meanings live in SK |
| bogat | bohatý | rich | g→h regular correspondence |
| slab | slabý | weak | |
| sfânt | svätý | holy | church |
| a citi | čítať | to read | |
| a plăti | platiť | to pay | market |
| trebuie / treabă | treba | it is necessary | grammar transfer |
| veac | vek | age, century | |
| duh | duch | spirit; ghost | *Svätý Duch* = Sfântul Duh |
| nădejde | nádej | hope | |
| pivniță | pivnica | cellar | |
| lopată | lopata | shovel | |
| coasă | kosa | scythe | |
| plug | pluh | plough | |
| pahar | pohár | glass, cup | via Hungarian in RO |
| prag | prah | threshold | |
| praf | prach | dust | |
| pernă | perina | feather duvet | *(shift)* SK pillow = *vankúš* |
| stâlp | stĺp | pillar, post | syllabic ĺ |
| sticlă | sklo | glass (material) | RO also "bottle" |
| coș | kôš | basket | |
| clește | kliešte | pliers | |
| zăvor | závora | bolt, barrier | |
| **târg** | **trh** | market | your "markets" domain! *na trhu* |
| veselie | veselý | merry, cheerful | |
| ogradă | ohrada | fence, enclosure | |
| grădină | záhrada | garden | shared root *grad-* |
| a sădi | sadiť | to plant | |
| dar | dar | gift | |
| a dărui | darovať | to give as a gift | |
| odihnă | oddych | rest | |
| cinste | česť | honour | |
| a topi | topiť | to melt | |
| a lipi | lepiť | to glue, stick | |
| coajă | koža | skin, leather | *(shift)* RO peel/crust |
| iaz | jaz | weir | RO pond |
| sută | sto | hundred | |
| ceas | čas | time | *(shift)* RO clock; SK clock = *hodiny* |
| bolnav / boală | boľavý / bolesť, bolieť | sore / pain, to hurt | *Bolí ma hlava* |
| a răni | raniť | to wound | |
| vină | vina | guilt, fault | |
| rai | raj | heaven, paradise | church |
| milă | milosť | mercy, grace | church; *milý* = nice/dear |
| obicei | obyčaj | custom | |
| a primi | prijať | to accept, receive | |
| graniță | hranica | border | |
| sfert | štvrť / štvrtina | quarter | *štvrť na tri* |
| vârstă | vrstva | layer | *(shift)* memory hook only |
| lebădă | labuť | swan | |
| gâscă | hus | goose | g↔h |
| morcov | mrkva | carrot | food |
| hrean | chren | horseradish | food |
| smântână | smotana | cream | food |
| colac | koláč | cake, pastry | food |
| slănină | slanina | bacon | food |
| hrib | hríb | mushroom | food |
| ovăz | ovos | oats | |
| vișină | višňa | sour cherry | |
| oțet | ocot | vinegar | |
| veveriță | veverica | squirrel | |
| vrabie | vrabec | sparrow | |
| rac | rak | crayfish | |
| știucă | šťuka | pike | |
| babă | baba | old woman | mild |
| gazdă | gazda | farmer, householder | via Hungarian; RO host |
| cojoc | kožuch | fur coat | |
| cizmă | čižma | boot | via Hungarian *csizma* |
| cârciumă | krčma | pub, tavern | |
| zori | zore | dawn (poetic) | |
| **slujbă** | **služba** | service (also church service) | church + work |
| slavă / a slăvi | sláva / sláviť | glory / to celebrate | church |
| a blagoslovi | blahoslavený | blessed | church |
| pocăință / a se pocăi | pokánie | repentance, penance | church |
| mucenic | mučeník | martyr | church |
| a spovedi | spoveď | confession | church |
| a izbăvi | zbaviť (sa) | to rid, get rid of | *(shift)* RO deliver/save |
| sobor | zbor | congregation, choir (Protestant usage); assembly | church |
| vecernie | večer | evening (RO vespers) | |
| praznic | prázdny / prázdniny | empty / school holidays | *(shift)* |
| a se trezi | triezvy | sober | *(shift)* RO wake up |
| bumb (Transylvanian: button) | gombík | button | via Hungarian *gomb* |
| servus | servus | hi (informal, western SK) | shared greeting |

Grammar-word near-matches worth pointing out: *tu ↔ ty*, *voi ↔ vy*, *noi ↔ my* (no), *ce ↔ čo*, *da* ≠ *áno* (but colloquial *hej* = yes), *nu ↔ nie*, *nimeni/nimic ↔ nikto/nič*, *doi ↔ dva*, *trei ↔ tri*.

### 4.4 False friends (teach explicitly, early)

| Romanian | means | Slovak look-alike | actually means |
|---|---|---|---|
| nevastă | wife | nevesta | **bride** (wife = *manželka*, *žena*) |
| muncă | work | muka | **torment** (work = *práca*) |
| a lovi | to hit | loviť | **to hunt / catch** (to hit = *udrieť*) |
| obraz | cheek | obraz | **picture, painting** (cheek = *líce*) |
| pod | bridge / attic | pod | **under** (bridge = *most*) |
| zăpadă | snow | západ | **west; sunset** (snow = *sneh*) |
| iad | hell | jed | **poison** (hell = *peklo*) |
| scump | expensive | skúpy | **stingy** (expensive = *drahý*) |
| prost | stupid | prostý | **simple, plain** (stupid = *hlúpy*) |
| a hrăni | to feed | chrániť | **to protect** (to feed = *kŕmiť*) |
| a opri | to stop | oprieť (sa) | **to lean** (to stop = *zastaviť*) |
| drag | dear | drahý | dear **and expensive** — context decides |
| gol | empty / naked | gól | **goal (sport)**; *holý* = bare |
| ceas | clock | čas | **time** (clock = *hodiny*) |
| vreme | weather / time | — | no Slovak *vreme*; weather = *počasie*, time = *čas* |
| da | yes | — | Slovak *áno* / colloquial *hej*; *da* means nothing |
| pită | bread | pita | (only the Middle-Eastern bread); bread = *chlieb* |
| cocoș | rooster | kokoš (dialect) | hen-ish; rooster = *kohút* |

### 4.5 Where Romanian actively hurts

1. **Stress** — Romanian variable stress makes learners stress the wrong syllable and hear long vowels as stress. Drill first-syllable stress relentlessly in week 1.
2. **Vowel length** — RO speakers don't hear it; minimal-pair listening tests are mandatory (*pas/pás, sud/súd, latka/látka, vila/víla*).
3. **Palatals ť/ď/ň/ľ** — RO speakers substitute "ti/di/ni/li" glides. Explicit articulation + minimal pairs (*ten/teň, dom/ďom*).
4. **"h" vs "ch"** — RO has one h. Slovak *h* is voiced; *ch* is the RO-like [x]. Mixing them changes words (*hlad* hunger vs *chlad* cold).
5. **Articles** — RO speakers try to mark definiteness; Slovak uses word order (new info last) and demonstratives (*ten/tá/to*) sparingly.
6. **Aspect** — no RO analogue. Expect this to be the long-term grammar hurdle; the app should surface aspect pairs as vocabulary items (*robiť ↔ urobiť*) with example pairs, not as theory.
7. **Czech contamination** — much "Slovak" on the internet (subtitles, forums) is actually Czech or Czech-influenced. Filter corpora (§7.3) and warn the learner about frequent Czechisms natives themselves use.

---

## 5. Standard vs. real spoken Slovak — the "what natives actually say" layer

Your observation is correct: apps and textbooks teach forms that are grammatically standard but pragmatically odd (*Ako sa máte? — Mám sa dobre, ďakujem. A vy?*), and they order vocabulary by theme rather than usage. Here is how to ground the app in real usage.

### 5.1 Authoritative frequency sources for *spoken* Slovak

| Source | What it is | Access | Use |
|---|---|---|---|
| **Frekvenčný slovník hovorenej slovenčiny** (Gajdošová, Šimková et al., VEDA 2018, ISBN 978-80-224-1678-8) | First frequency dictionary of *spoken* standard Slovak; ~10,000 most frequent words + word combinations, from the **Slovak Spoken Corpus** (~6.6 M tokens, speakers from all regions). Sorted by absolute frequency, average reduced frequency, and alphabetically. | Printed book (VEDA). **Request this book** — it is the single most valuable reference for your goal. | Ground truth for "is this word/phrase something people say?" and for ordering the first 3,000 lemmas. Do not copy the list into the app (copyright); use it to validate/re-rank the open subtitle list and to hand-curate the top 1,000. |
| **Frekvenčný slovník slovenčiny na báze SNK** (2017) | Written-language counterpart (books, press, web). | Printed book. | Secondary ranking for reading vocabulary. |
| **Slovak National Corpus (SNK)** frequency lists | Lemma / word-form / POS frequency lists from prim-10.0 (1.68 bn tokens) and sub-corpora incl. the Spoken Corpus and **ERRKORP** (learner corpus, v3 released 2026 — useful for "what mistakes do foreigners make"). | https://korpus.juls.savba.sk/res.html — free for research after registration; licence is non-commercial/research. | Query concordances for naturalness checks; obtain lists for internal ranking (respect licence; don't redistribute). |
| **OpenSubtitles-based frequency list** (hermitdave/FrequencyWords, `sk_50k.txt`) | 50k word forms with counts from Slovak movie/TV subtitles = dialogue register. CC BY-SA 4.0. | https://github.com/hermitdave/FrequencyWords/blob/master/content/2016/sk/sk_50k.txt (also 2018) | **Primary open ranking** for conversational vocabulary. Caveats: word *forms* not lemmas (lemmatize); contains Czech contamination and subtitle artefacts (names, "OK", profanity); skews to drama. |
| **brm.sk Slovak wordlist** | 1.8 M forms / 50k top with counts merged from Slovak Wikipedia + subtitles (+ misc). | https://p.brm.sk/sk_wordlist/ (npm: `slovak-wordlist`) | Broader spelling coverage; use for diacritics tooling, not for ranking. |
| **Wiktionary frequency page** | Index page pointing to the above; notes SNK n-gram lists have an incompatible licence. | https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Slovak | Pointer. |

**Sanity check of the top of the subtitle list** (first entries): *a, v, je, sa, na, to, si, s, ako, že, som, ale, nie, čo, tak, aj, len, mi, ma, ty, ja…* — i.e., glue words. The app's Phase 1 list is essentially the first ~300 entries after lemmatization, plus pronouns/numbers/question words the list under-represents.

### 5.2 Colloquial Slovak features to encode (mark as *hovorové*)

These are widely attested features of everyday spoken Slovak. Present them as "how people say it", alongside the standard form, never as replacements for the standard in writing. Verify wording with the spoken frequency dictionary / SlovakforU / a native before publishing.

- **Yes/no/well:** *áno* (std) → **hej** (very common informal yes), *no* (= "well… / yeah" — a discourse particle, not "no"), *nie* (no), *jasné* (sure), *v pohode* / *v poho* (fine, no problem), *fajn*, *super*, *dobre*.
- **Greetings:** *Dobrý deň* → informally *Dobrý* ; *Dovidenia* → *Dovi*; *Ahoj/Ahojte* (to several people), *Čau/Čaute*, *Servus* (west), *Zdravím*. "How are you?" natives more often use *Ako?* / *Ako sa máš?* / *Čo nové?* / *Ako ide?* and answer *Dobre. / Ide to. / Nič moc. / Fajn.*, rarely the textbook full sentence.
- **Diminutives are everywhere and neutral:** *kávička, pivko, chvíľka, minútka, sto eúr → stovka*.
- **Intensifiers/fillers:** *fakt* (really), *strašne / hrozne* (very, lit. terribly — positive or negative), *úplne*, *proste* (simply), *vlastne* (actually), *akože* (like…), *no* (well), *tak* (so), *hej?* (right?), *však?* (isn't it?), *veď* (after all).
- **Colloquial lexicon:** *furt* (always), *ísť dole/hore* (down/up), *robiť* (to work — *Kde robíš?* = where do you work?), *zobrať* (take, colloquial vs *vziať*), *fúra* (a lot), *kľud* (calm), *frajer/frajerka* (boyfriend/girlfriend), *chalan* (guy), *baba* (girl — informal), *decko* (kid), *telka* (TV), *foťák* (camera), *mobil* (phone), *auto*, *kompl* (computer) — many are shared with Czech.
- **Money/shopping:** *Koľko to stojí?* (std) — at a market also *Koľko je to?* / *Za koľko?*; *Platím / Zaplatíme* (bill please), *Nemáte drobné?*, *Ešte niečo? — To je všetko.*, *Dáte mi kilo…*, *deko* (10 g unit — *dvadsať deka šunky*).
- **Requests:** *Prosím si…* (I'd like — the most natural way to order), *Dáme si…* (we'll have…), *Môžem…?*, *Nemáte náhodou…?* (you don't happen to have…?).
- **Thanks/please:** *Ďakujem / Ďakujem pekne / Vďaka* (informal) — *Nemáš zač / Nie je za čo / Prosím* (you're welcome). Religious/rural thanks: *Pán Boh zaplať*.
- **Czechisms natives use** (recognize, don't imitate in writing): *hodně* (SK *veľa*), *ale ne* → *ale nie*, *fakt jo* → *fakt hej*.
- **Phonetic colloquial:** dropping *ľ* softness in western dialects; *je* → *jé*; *som* often reduced. Don't teach these; just make the ear robust via real audio.
- **Regional awareness:** west (Bratislava, *záhorské*), central (the standard's base), east (*východniari* — very different: penultimate stress, *co* for *čo*). Tell the learner: the standard is understood everywhere; expect eastern speech to sound foreign at first.

### 5.3 Living sources of colloquial Slovak

- **SlovakforU podcast** — 10–15 min episodes, A1–B2, "practical vocabulary and colloquial Slovak", transcripts in Slovak (+ UA/RU). Website slovakforu.sk; on Spotify/Apple/YouTube.
- **Bodkaschool.sk** — blog by a Slovak teacher for foreigners; formal *and* colloquial phrases, weekly Q&A.
- **Slovak with Ani** (TikTok `slovencinasani`) — expressions/phrases explained by a fluent foreigner.
- **Učíme (sa) slovenčinu** (ucimesaslovencinu.sk) — authentic 2–4 min video clips (TV reports, vlogs) with transcripts and tasks, A1.2–C2; blog articles (e.g. 30 most common proverbs with explanations, May 2026).
- **Comprehensible Slovak** podcast (Michal) + **News in Easy Slovak** — slow authentic speech with full transcripts; author also sells an ebook *60 Conversations in Simple Slovak*.
- **Slang dictionaries (books):** Peter Oravec, *Slovník slangu a hovorovej slovenčiny*; Braňo Hochel, *Slovník slovenského slangu* (1993). Use for recognition of very informal speech only.
- **Reddit r/Slovakia**, HelloTalk/Tandem — for asking "do people actually say X?".
- **Slovak minority in Romania** — Slovak-language schools in Nădlac (Arad County) and Bihor, the Democratic Union of Slovaks and Czechs in Romania (UDSCR), the newspaper *Naše snahy*, and Editura Ivan Krasko (Nădlac). A real-world source of Slovak speakers who also speak Romanian; their Slovak has archaic/dialectal (and Romanian-influenced) features, so treat as practice partners rather than as a norm.

### 5.4 The "naturalness layer" in the app

Every phrase/sentence record carries:
- `register`: `standard | neutral | colloquial | formal | regional | archaic`
- `natives_say`: optional alternative(s) with note (e.g. *áno* → "in speech you'll mostly hear **hej**")
- `spoken_rank`: max frequency rank of its lemmas in the spoken/subtitle ranking (used for gating and for the "you understand X% of speech" meter)
- `source`: `tatoeba | opensubtitles | podcast_transcript | textbook | generated | native_reviewed`
- `review_status`: `unreviewed | native_ok | flagged`

Rule: a sentence tagged `textbook` or `generated` cannot enter the core path until it passes a spoken-frequency check (all lemmas within the current band) and, ideally, a native review. This is the mechanism that keeps *chorý* out of lesson 1 and *Prosím si kávu* in.

---

## 6. Source material inventory

Legend: **Licence** = what we know; always re-check before bundling. **Use** = how the app consumes it. "Bundle" = ship inside the app; "Link" = point the learner to it; "Build-time" = use to generate app content, don't redistribute raw.

### 6.1 Sentence corpora and parallel data

| Source | Content | Size (Slovak) | Licence | Use |
|---|---|---|---|---|
| **Tatoeba** — https://tatoeba.org/en/downloads | Community-written sentences with translations; per-sentence licence. | **32,999 Slovak sentences** (Sept 2026); Romanian 41,317; Czech 89,872. Slovak has **no native audio** (Romanian: 52 clips). Direct SK↔RO links are few (OPUS Tatoeba ro-sk ≈ hundreds); SK↔EN links are the bulk. | CC BY 2.0 FR (some CC0); attribution required. | **Bundle** (with attribution). Core sentence bank for A1–A2. Filter by length (3–12 words), by "belongs to native speaker" flag, and by spoken_rank. Use the Vuizur `tatoeba-to-anki` project as a reference for difficulty ordering (avg word frequency × length). |
| **OPUS** — https://opus.nlpl.eu | Aggregated parallel corpora, sentence-aligned; ro–sk and en–sk pairs available in: OpenSubtitles2018 (dialogue — the goldmine), Europarl (formal), DGT-TM / JRC-Acquis / EUbookshop (EU legal/admin), WikiMatrix, MultiCCAligned, ParaCrawl, TED2020, Tatoeba, QED, GlobalVoices, Bible-uedin. OPUS also offers **OPUS-dic** (word alignments = bilingual dictionary by statistics) and OPUS-search (online concordance). | Europarl ro–sk: ~hundreds of thousands of pairs; OpenSubtitles ro–sk: large (verify exact counts on the OPUS page for the pair). | Varies per sub-corpus; OpenSubtitles is for research/non-commercial use (check OPUS statement); Europarl/DGT are free EU data. | **Build-time.** Mine short natural dialogue lines (OpenSubtitles) with RO and EN translations; extract collocations; build the RO↔SK glossary via alignments. Europarl/DGT only for the "work/formal" domain and for B1 reading. Quality filters mandatory (§7.3). |
| **Bible parallel text** | Slovak: **Roháček** translation (1936; author d. 1948 → public domain) at biblia.sk; **Slovenský ekumenický preklad** (SEB, 2007/2015, © Slovenská biblická spoločnosť) with **free audio** on YouVersion/Bible.com (© Štúdio Nádej) and paid download at audio.biblia.sk; Catholic translation (SSV). Romanian: Cornilescu (1924 — licence status contested; treat as "check"), *Biblia Fidela* (free licence), NTR (Biblica, free online). | Whole Bible, verse-aligned by nature. | Roháček PD; SEB/Cornilescu copyrighted (link/stream, don't bundle text unless permission). | **Church domain track.** Verse-of-the-day parallel reading RO↔SK; psalms and gospels as graded-ish reading; audio via Bible.com links. Vocabulary: Roháček is archaic in places — mark `register: archaic`; prefer SEB wording for modern usage. |
| **Common Voice — Slovak** (Mozilla) | Read sentences by volunteers, CC0. Together with FLEURS and VoxPopuli ≈ **~100 h** of Slovak speech (SloPal paper, 2025/26). | Thousands of clips. | CC0 (Common Voice) | **Bundle a curated subset** as *real human voices* for listening drills and as a TTS-free pronunciation reference; the sentence texts double as a corpus. |
| **SloPalSpeech / Slovak Plenary ASR Corpus** | 2,806 h of aligned parliamentary speech + 60 M-word text corpus (Bozik et al., arXiv 2509.19270). | Huge but formal register. | Open (HF: `erikbozik/slovak-plenary-asr-corpus`). | Build-time only: ASR fine-tuning reference; not learner content (register). |
| **Podcast transcripts** (Comprehensible Slovak, SlovakforU, Učíme (sa) slovenčinu) | Slow, natural, learner-targeted Slovak with transcripts. | Dozens–hundreds of episodes. | © authors; free to listen/read. | **Link** from the app's "immersion feed" with tap-to-gloss on the transcript the learner pastes/loads; do not redistribute. |

### 6.2 Dictionaries and morphology

| Source | Content | Licence | Use |
|---|---|---|---|
| **kaikki.org Slovak dictionary** — https://kaikki.org/dictionary/Slovak/ | Machine-readable JSONL extract of English Wiktionary's Slovak entries (wiktextract): glosses in English, **IPA**, part of speech, gender, **inflection tables (forms with tags)**, examples, phrasebook entries (e.g. *do videnia* → "goodbye", IPA /dɔviɟeɲɪ̯a/). Updated monthly from dumps (latest seen: 2026-08). | CC BY-SA 3.0 / GFDL (Wiktionary) | **Bundle** (with attribution). Backbone of the lexicon: lemma → gloss, IPA, forms. Coverage is good for common words, patchy for colloquialisms; supplement via hunspell-sk. |
| **JÚĽŠ Dictionary Portal** — https://slovnik.juls.savba.sk | Federated search across the codification dictionaries: *Krátky slovník slovenského jazyka* (KSSJ 4), *Pravidlá slovenského pravopisu* (2013), *Ortograficko-gramatický slovník* (2022 — paradigms!), *Slovník súčasného slovenského jazyka* (A–Pn, ongoing), synonyms, foreign words, dialect dictionary, historical dictionaries. Monolingual. | © JÚĽŠ; free online use. | **Link** (deep-link per word) for authoritative meaning, spelling and paradigm; also the *Jazyková poradňa* (language advice service) for "is this correct?" questions. |
| **Lingea dict.com Slovak↔Romanian** — https://www.dict.com/slovac-roman | *Slovensko-rumunský študijný slovník* v2.2: 18,900 headwords, 2,900 examples, 34,500 translations. Free online. | © Lingea | **Link**; the best RO↔SK dictionary online. Use at build-time to hand-verify the RO glosses of the top 3,000 lemmas (don't scrape). |
| **Linguee RO↔SK** — https://ro.linguee.com/română-slovacă | Dictionary + ~4 M translated sentence contexts (mostly EU texts). | © DeepL/Linguee | **Link** for context examples. |
| **Glosbe SK↔EN / SK↔RO** | Community + parallel-corpus dictionary with examples. | Mixed | Link. |
| **hunspell-sk** (sk-spell project) — https://github.com/sk-spell/hunspell-sk ; **essential-data/hunspell-sk** — https://github.com/essential-data/hunspell-sk | Spell-check dictionaries; the Essential Data variant preserves lemma↔form relations (built from JÚĽŠ data) and ships a **lemmatizer** variant (`sk_SK-lemma`). | sk-spell: LGPL/GPL/MPL tri-licence (check); Essential Data: different licence — read repo. | **Bundle** for spell-check of typed answers, diacritics-tolerant matching, and lemmatization fallback. |
| **English Wiktionary Slovak declension/conjugation templates** | Full paradigms per lemma. | CC BY-SA | Via kaikki forms; also link the live page. |
| **Wikipedia: "Slovak declension"**, "Slovak orthography", "Slovak phonology" | Compact reference tables. | CC BY-SA | Build-time reference for the grammar notes. |
| **Slovak WordNet** (SNK) | Semantic network. | Research licence | Optional: synonyms/relations for exercises. |
| **Slovak Terminology Database** (JÚĽŠ) | Domain terminology (incl. IT). | Free online | Tech-domain vocabulary checks. |

### 6.3 Grammar references

| Source | Notes |
|---|---|
| **slovake.eu grammar section** | Learner-oriented explanations in 13 interface languages (not Romanian; use English or Czech), A1–B2. Free registration. https://slovake.eu |
| **Wikibooks: Slovak** | Small but free; basic tables. |
| **Naughton, *Slovak: An Essential Grammar* (Routledge)** and **Naughton, *Colloquial Slovak*** | Best English-language references; not free — request via your book sources (§8). Archive.org has a lending copy of *Colloquial Slovak*. Routledge has made Colloquial-series audio freely available on its site *(verify for the Slovak title)*. |
| **JÚĽŠ *Ortograficko-gramatický slovník* (2022)** via the dictionary portal | Shows the declension pattern (vzor) and forms for each headword — authoritative paradigm lookup. |
| ***Morfológia slovenského jazyka* (1966)** | The codified morphology; scanned/online at JÚĽŠ *(verify availability)*; for the builder, not the learner. |
| **Slovak Ministry teacher handbook** *Slovenčina ako cudzí jazyk — príručka pre učiteľov* (Kvapil et al., 2018, PDF) | How Slovak grammar is sequenced for foreigners; hour allocations. https://edu.nivam.sk/pages/mpc_pre_ukrajinu/slovencina_ako_cudzi_jazyk.pdf |
| **SAS Standards** *Témy a ciele jazykového kurzu A1* (PDF), *Jazykové funkcie A1–A2* | The official topic/function inventory for A1–A2 — **use as syllabus checklist**. https://fphil.uniba.sk/fileadmin/fif/katedry_pracoviska/sas/TESTY_standardy/Te__my_a_ciele_A1-online.pdf |
| **Wikipedia (sk/en) — Slovak language articles; ro.wikipedia "Limba slovacă"** | Romanian-language overview, incl. the codification handbooks list. |

### 6.4 Free courses and textbook-like material

| Resource | Level | Language of instruction | What's useful | URL |
|---|---|---|---|---|
| **slovake.eu** | A1–B2 | EN, DE, FR, ES, IT, HU, PL, RU, LT, HR, CS, EO, SK (no RO) | Full courses, exercises, dictionary, grammar, texts with audio. EU-funded, free. Good structural reference for lesson topics. | https://slovake.eu |
| **e-slovak.sk** (Studia Academica Slovaca, Comenius Univ.) | A1–A2 | EN | Free e-learning mirroring **Krížom-krážom A1/A2**; 10 topic units; tutored cohorts in the school year; 12-episode video series (Katherine Gajdoš) for A1/A2; certificate. | https://www.e-slovak.sk |
| **Krížom-krážom** textbook series (SAS) | A1, A2, B1, B2 + workbook (*Cvičebnica A1+A2*) + audio | SK (no bridge language) | The de-facto standard textbook for Slovak as a foreign language; used at universities abroad. Audio program and worksheets exist online via SAS. Not free (request the books). |
| **Učíme (sa) slovenčinu** | A1.2–C2 | SK | Authentic short videos + transcripts + interactive tasks; two new videos weekly; worksheets. | https://ucimesaslovencinu.sk |
| **Hovoríme po slovensky!** comics course | A1/A2 | SK + bridge | 12 topics as comics + grammar + exercises + memory game; **free download**. | via IOM MIC page (§13) |
| **Prvá pomoc po slovensky / First Aid in Slovak** (SAS, 2016) | A1 | EN↔SK, UA↔SK, + other languages incl. Turkish (2025/26) | Practical phrasebook for everyday situations; free PDF. | via fphil.uniba.sk / IOM |
| **Slovenčina pre azylantov a žiadateľov o azyl** (Uramová, 2007) | A1 | SK with pictures | Free PDF; focuses on the most-used grammar only — a good model for "minimal grammar". | via IOM MIC page |
| **YouTube: Slovenčina ako cudzí jazyk** | A1–A2 | SK | Weekly 5–15 min story/culture videos in simple Slovak. | YouTube |
| **50languages / book2 "Slovak for beginners"** | A1–A2 | **Romanian available** (and 50+ others) | 100 lessons of phrase pairs RO↔SK with **native MP3 audio**; free for personal use; apps offline. Phrases are somewhat textbook-ish — use for RO↔SK pairs and audio, not for ordering. | https://50languages.com/slovak-for-free |
| **Loecsen Slovak** | A1 | Interface incl. RO *(verify)* | Free phrase course with audio; MP3+PDF download. | https://www.loecsen.com/en/download-mp3-and-pdf-slovak |
| **Live Lingua / Peace Corps Slovak** | A1–A2 | EN | Peace Corps courses are public domain; a Slovak workbook for volunteers exists (1990s). *(verify presence on Live Lingua)* | https://www.livelingua.com/peace-corps/ |
| **Slovak Language Lessons for Beginners** (Marek Hlaváč) | A1 | EN | Basic words/phrases with audio files. | see language-learners forum list |
| **IOM Migration Information Centre — "Materials for self-learning"** | — | EN | The best curated meta-list (everything above + apps). | https://mic.iom.sk/en/social-issues/education/498-learn-slovak-language-for-free.html |
| **language-learners.org Slovak resources thread** | — | EN | Comprehensive community list (courses, dictionaries, corpora, media, exams). | https://forum.language-learners.org/viewtopic.php?t=17285 |

### 6.5 Listening: podcasts, radio, TV, audio

| Resource | Register / level | Notes |
|---|---|---|
| **Comprehensible Slovak** (podcast; + *News in Easy Slovak*) | slow natural, A2–B1 | Full transcripts per episode. Spotify/Apple/website. |
| **SlovakforU** (podcast) | A1–B2, colloquial | Transcripts + exercises; Tue/Thu + Friday bonus. slovakforu.sk |
| **RTVS** (public broadcaster): Rádio Slovensko, Rádio Regina, Rádio Devín, Rádio FM; TV: STVR/RTVS Jednotka, Dvojka; **Radio Slovakia International** | native, B1+ | Live streams and archives (rtvs.sk / stvr.sk); RSI has slower "for foreigners" programming. |
| **Private TV**: Markíza, JOJ, TA3 (news) | native | Archives online, geo-restrictions possible. |
| **Audio Bible (SEB)** on YouVersion / Bible.com | native, formal-literary | Free streaming; professional actors. |
| **Common Voice Slovak** | read speech | CC0 — bundleable clips. |
| **Slovak children's TV** (*Večerníček* fairy tales, Slovak dubbing of cartoons) | simple native | Great i+1 listening; YouTube. |
| **Music** | — | Popular Slovak artists (e.g., IMT Smile, Elán, Peter Nagy, Richard Müller, Katarína Knechtová, Jana Kirschner). Link to lyrics sites; **do not bundle lyrics** (copyright). |
| **Forvo** | word pronunciations by natives | Free to listen; API paid; link only. |

### 6.6 Reading material by level

| Level | Material |
|---|---|
| A1 | App-generated micro-texts (3–6 sentences) from the sentence bank; *Hovoríme po slovensky!* comics; 50languages phrases; Wikipedia captions; menus/signs photos. |
| A2 | *News in Easy Slovak* transcripts; Comprehensible Slovak transcripts; *60 Conversations in Simple Slovak* (ebook, paid); children's picture books; Slovak Wikipedia intros on familiar topics (your own field: software, church, Romania…); Gospel of Mark in SEB (short sentences). |
| B1 | Slovak translations of books you know (*Malý princ*; Harry Potter *Harry Potter a Kameň mudrcov* — copyrighted, buy/borrow); Dobšinský fairy tales in **modern retellings**; Slovak news sites (sme.sk, dennikn.sk, aktuality.sk, tvnoviny.sk) — start with sports/weather/local; **Zlatý fond SME** simpler pieces. |
| B1+ (public domain / free) | **Zlatý fond denníka SME** — https://zlatyfond.sme.sk — the largest free e-library of Slovak literature (Dobšinský *Prostonárodné slovenské povesti*, Podjavorinská, Kukučín, Timrava, Hviezdoslav…). Licence: CC BY-NC-SA per work *(verify)*. Caveat: 19th-century Slovak is partly archaic/dialectal (*statočnô, druhô, ustavične*) — flag `archaic`. **Slovak Wikisource** for more PD texts. |

**A short book to aim for after ~8 months:** *Malý princ* (Slovak translation; short, known plot, modern language) or a children's book by Daniel Hevier / Ľubomír Feldek; then a Dobšinský selection in a modern edition (e.g., *Soľ nad zlato*, *Popolvár*, *Janko Hraško* — the plots are also known via Romanian/European folk tale analogues). The app's i+1 reader should accept pasted or OCR'd text and compute an unknown-word meter to decide readiness.

### 6.7 Romanian-specific resources

| Resource | Notes |
|---|---|
| **Lingea dict.com SK↔RO** (free online; also print *Slovensko-rumunský slovník*) | Best bilingual dictionary. |
| **Linguee RO↔SK** | Context examples (EU-heavy). |
| **Editura Universității din București** — *Ghid de conversație român-slovac*; *Dicționar frazeologic slovac-român* | The Slovak section (Filologie Rusă și Slavă, Univ. of Bucharest) trains Slovak philologists; their publications are the most systematic RO-medium Slovak materials. Request via your book sources. |
| **University of Bucharest — Limba slovacă programme page** | Notes on the alphabet for Romanians, course structure; contact point for materials. https://filologierusasislava.lls.unibuc.ro/programe-de-studii/licenta/limba-slovaca/ |
| **UDSCR / Editura Ivan Krasko (Nădlac) / newspaper *Naše snahy*** | Slovak-minority publishing in Romania; bilingual community; teacher-training events with Matej Bel University (Banská Bystrica). |
| **Romanoslavica** (UniBuc journal, on biblioteca-digitala.ro) | Academic articles on Slovak–Romanian language contact and on the Slovak dialects of Nădlac/Bihor. Background only. |
| **50languages RO→SK** | Native audio phrase pairs. |
| **Mondly (Brașov) RO→SK** | Commercial app; a reference for how RO→SK is presented, not a source. |
| **Slavic-loanword lists for Romanian** (WordReference forum threads; Wikipedia *Slavic influence on Romanian*) | Starting points for the cognate module (§4.3). |

### 6.8 Existing apps to study

| App | What to learn from it | What not to copy |
|---|---|---|
| **Ling** (your current app) | Gamified path, speaking exercises, chatbot dialogues. | Theme-first vocabulary; unnatural phrases; paywall after lesson ~6. |
| **Mondly** | RO-medium UI, conversation simulations, daily lesson cadence. | Same theme-first ordering. |
| **Clozemaster** | Sentence-cloze from Tatoeba, ordered by frequency ("Fast Track"); shows what a frequency-ordered sentence app feels like; has Slovak from English. | Freemium limits; EN-only base. |
| **Anki** (+ FSRS) | Scheduling, card design, huge shared-deck ecosystem (several Slovak decks exist: frequency 1000/2000, phrases). | UI complexity. |
| **Lute / LWT (Learning With Texts)**, **Readlang** | Tap-to-gloss reading with per-word status (unknown → learning → known); import any text; Lute is open source and language-agnostic. | — |
| **Language Reactor** | Dual subtitles, word status on video. | Browser-extension coupling. |
| **LibreLingo** | Open-source Duolingo clone (course-as-YAML). No Slovak course. | — |
| **Duolingo** | No Slovak. **Czech** course exists — some learners use it as a bridge; risky for interference. | — |

---

## 7. Speech and language technology (all free / open, runnable locally)

### 7.1 Text-to-speech (needed because Tatoeba has no Slovak audio)

| Engine | Slovak voice | Quality | Licence | Notes |
|---|---|---|---|---|
| **Piper** (rhasspy) | `sk_SK-lili-medium` (single female speaker, 22.05 kHz, fine-tuned from the English *lessac* voice; dataset CC0 from NabuCasa voice-datasets) | Intelligible, robotic-ish but correct palatals and length. Digits are expanded by eSpeak-ng's Slovak rules; a GitHub discussion (#225) shows custom Slovak voices mispronouncing some numerals, so **spell numbers out as words** (*štyri*, not *4*) to be safe and to control case forms (*dve eurá*). | MIT (code), CC0 (data) | **Default offline engine.** Runs on CPU via ONNX; can run in-browser with `piper-wasm`/onnxruntime-web or as a tiny local service. Pre-generate MP3/OGG for the whole sentence bank at build time (cache). Model: https://huggingface.co/rhasspy/piper-voices/tree/main/sk/sk_SK/lili/medium |
| **Coqui TTS** | `tts_models/sk/cv/vits` (female, trained on Common Voice) | Comparable; Coqui is now community-maintained (`coqui-tts` fork). | MPL 2.0 / model licences vary | Alternative voice for variety. |
| **Meta MMS-TTS** | `facebook/mms-tts-slk` | Basic. | CC BY-NC 4.0 | Non-commercial only; optional third voice. |
| **Microsoft Edge neural voices** | `sk-SK-LukasNeural`, `sk-SK-ViktoriaNeural` | Best natural quality available free. | Unofficial access (edge-tts) — ToS grey zone; **don't redistribute generated audio publicly**; fine for personal local use. | Use for dialogue audio if you accept the caveat; otherwise Piper. |
| **Browser Web Speech API** (`speechSynthesis`) | Chrome ships Google sk-SK voice; Edge ships MS voices; Firefox depends on OS voices. | Varies by OS/browser. | Free | Zero-setup fallback; requires online for cloud voices. |
| **Commercial/free tiers** (ElevenLabs 10k chars/month, speechgen, etc.) | many | High | Free tier terms | Only for a handful of showcase dialogues. |

**Recommendation:** Piper `lili` for everything by default (pre-rendered), plus per-speaker variety from Common Voice clips for real-voice exposure; optionally Edge neural voices for the ~500 core chunks.

### 7.2 Speech recognition (for speaking practice and dictation)

| Model | Slovak WER | Notes |
|---|---|---|
| **OpenAI Whisper** (open weights) | large-v3: usable; small: **58.4%** WER on Common Voice 21 sk, 36.1% on FLEURS (baseline figures from the SloPal paper). | Run locally with `whisper.cpp` (in-browser via WASM for tiny/base — too weak for Slovak) or `faster-whisper` as a local Python service. Use `large-v3` or `medium` for scoring; `language="sk"`. |
| **NaiveNeuron/whisper-small-sk** (fine-tuned on 2,806 h parliamentary Slovak) | **25.7%** CV21, **10.6%** FLEURS | Fast, small, much better on Slovak; slight formal-speech bias. MIT. https://huggingface.co/NaiveNeuron/whisper-small-sk |
| wav2vec2-XLS-R Slovak fine-tunes (HF community) | 20–30% CV | CTC models, very fast; good for phoneme-level feedback. |
| **Web Speech API** `SpeechRecognition` (`lang="sk-SK"`) | good (Google server) | Chrome only, online, zero setup — a pragmatic first version. |

**How to grade speaking:** don't demand exact transcription. Compute normalized Levenshtein similarity between expected and recognized text after stripping punctuation and (optionally) diacritics; show word-level diff; for pronunciation drills, compare the *target phoneme* region only (e.g., did *ľ* come out as *l*?). For shadowing, show waveform + duration comparison; correctness is secondary to fluency there.

### 7.3 NLP tooling for content generation and QA

| Tool | Use |
|---|---|
| **Stanza** (`stanfordnlp/stanza-sk`, Apache-2.0; trained on UD_Slovak-SNK) | Tokenize, lemmatize, POS-tag, morphological features (Case=Gen, Tense=Past, Aspect=Perf…), dependency parse. → difficulty scoring, grammar tags, cloze target selection. |
| **UDPipe 2** (Slovak-SNK model) | Same, REST API available; lighter. |
| **spaCy** | No official Slovak model; skip unless a community model appears. |
| **simplemma** | Dictionary-based lemmatizer with Slovak support; fast, no ML. |
| **hunspell-sk (Essential Data lemma variant)** | Lemmatization + spell-check in JS/Python; also generates forms. |
| **Slovak Dependency Treebank / UD_Slovak-SNK** | Gold data for tags (LINDAT). |
| **kaikki forms** | Inflection tables for exercise generation ("give the genitive of *stôl*"). |
| **Language ID / Czech filter** | Reject sentences containing Czech-only graphemes `ř ě ů` and common Czech function words (*jsem, jsi, není, ale ne, takže*≠ fine, *protože*≠ fine — build a stoplist); run hunspell-sk OOV rate; sentences with >10% OOV are probably Czech, misspelled, or names. |
| **Machine translation (build-time helper)** | Helsinki-NLP `opus-mt-sk-en` / `opus-mt-en-sk` (Marian); Meta **NLLB-200** (Slovak `slk_Latn`, Romanian `ron_Latn` both supported); Argos Translate/LibreTranslate. Use to draft RO glosses and to back-translate for QA; never ship MT output unreviewed as "the" translation. |
| **Slovak LLMs** | JÚĽŠ released **Qwen3-14B-sk** (Slovak-tuned Qwen3, March 2026) and earlier a Slovak Mistral-7B; run via Ollama/llama.cpp for local dialogue generation and naturalness judgments (with a native-review queue). See `slovak-nlp/resources` MODELS.md. |
| **slovak-nlp/resources** (GitHub) | Curated list of all Slovak datasets/tools — check it first when something is missing. https://github.com/slovak-nlp/resources |
| **Sentence embeddings** (LaBSE / multilingual-e5) | Align RO↔SK sentences, dedupe, find "similar sentences you already know". |

### 7.4 Build-time content pipeline (proposal)

1. **Lexicon**
   - Take `sk_50k.txt` (subtitles) → lemmatize (Stanza + hunspell fallback) → aggregate counts per lemma → `spoken_rank`.
   - Cross-check the top 3,000 against the *Frekvenčný slovník hovorenej slovenčiny* (manual pass) → adjust; add function words/pronouns/numerals the subtitle list under-represents.
   - Join kaikki.org: gloss(EN), IPA, POS, gender, aspect, forms. Missing entries → hunspell forms + LLM-drafted gloss flagged `needs_review`.
   - Add RO gloss: draft via NLLB/Lingea lookup, mark cognate/false-friend from §4.3–4.4 lists.
   - Assign `band` (1: ≤300, 2: ≤1000, 3: ≤2500, 4: ≤4000) and `domains[]` (from a hand list per domain + LLM classification).
2. **Sentence bank**
   - Tatoeba sk + links to en/ro; OpenSubtitles ro–sk and en–sk pairs; Common Voice sentence texts; podcast transcripts (for reading only).
   - Filters: 3–12 words; Slovak language ID; hunspell OOV ≤ 1 (names allowed via NER); no profanity unless `flag`; dedupe by embedding; remove subtitle artefacts.
   - Annotate: lemmas, `spoken_rank` (max), grammar features (Stanza), `register`, `domain`.
   - Generate audio (Piper) for all; store as OGG/Opus.
3. **Chunks** (≈200 for A1, 300 for A2): hand-curated from *Prvá pomoc po slovensky*, SAS *Jazykové funkcie A1–A2*, 50languages, SlovakforU; each with standard + colloquial variant, RO + EN gloss, audio, and 3–5 example sentences from the bank.
4. **Grammar notes**: ~120 micro-notes (one screen each) keyed by feature tag (e.g. `Case=Loc+v/na`), each with a Romanian analogy, 5 corpus examples, 1 contrastive false-friend if relevant.
5. **Domain packs**: per domain, a vocabulary list (bands 2–3), 30–60 sentences, 3 dialogues (generated by Slovak LLM → native review), 1–2 authentic texts (link).
6. **QA loop**: native review queue (export CSV → Google Sheet → a Slovak speaker marks ok/odd/fix); re-import.

---

## 8. Books worth requesting (you said you can obtain digital books)

Priority order for *this* project:

1. **Gajdošová, K. – Šimková, M. a kol.: *Frekvenčný slovník hovorenej slovenčiny na báze Slovenského hovoreného korpusu*** (VEDA, 2018). The single most important reference for "what people actually say". Also: ***Frekvenčný slovník slovenčiny na báze SNK*** (2017) and ***Slovník slovných spojení. Podstatné mená*** (collocations, 2017) from the same team.
2. **Kamenárová, R. et al.: *Krížom-krážom – Slovenčina A1*; *A2*; *Cvičebnica A1+A2*** (Studia Academica Slovaca) + audio. The reference for topic sequencing and dialogue models at A1–A2.
3. **Naughton, J.: *Colloquial Slovak* (Routledge)** and ***Slovak: An Essential Grammar*** (Routledge). Best English explanations; *Colloquial* has genuinely conversational dialogues.
4. **Böhmerová, A.: *Slovak for You*** (Perfekt) — English-medium textbook with a vocabulary index.
5. ***Hovorme spolu po slovensky! A (A1–A2)*** and ***Tri, dva, jeden – Slovenčina A2*** (Comenius Univ. CĎV/ÚJOP) — the other university series; also *Hovorme spolu po slovensky! Gramatika B1+B2* later.
6. **Oravec, P.: *Slovník slangu a hovorovej slovenčiny*** (and/or Hochel, *Slovník slovenského slangu*) — for recognizing very informal speech.
7. **Editura Universității din București:** *Ghid de conversație român-slovac*; *Dicționar frazeologic slovac-român*. **Lingea:** *Slovensko-rumunský / Rumunsko-slovenský slovník*.
8. ***Pravidlá slovenskej výslovnosti*** (Kráľ, 2009) — only if you want to get pronunciation notes exactly right.
9. **Readers for later:** *Malý princ* (SK), a modern Dobšinský selection, Daniel Hevier / Ľubomír Feldek children's books, *60 Conversations in Simple Slovak* (Comprehensible Slovak). Slovak translation of a book you know well (e.g., a Harry Potter volume) as the B1 milestone.
10. **Optional linguistics:** Mistrík, *Frekvencia slov v slovenčine* (1969) — historical frequency dictionary; Sokolová et al., *Slovenčina a čeština* (contrastive) — if you want to handle Czech interference systematically.

What to extract from each: (1) rankings + "phrase" entries for the naturalness layer; (2) topic order, dialogue patterns, grammar sequence per unit; (3) grammar explanations to paraphrase (never copy); (4) vocabulary index; (5) cross-check of A2 syllabus; (6) recognition list; (7) RO glosses and idioms; (8) pronunciation rules; (9) reading roadmap texts (to load into the i+1 reader, for personal use).

---

## 9. Curriculum design: zero → conversational

Design rule: **frequency decides *what*; communicative need decides *when*; grammar is explained *after* it has been used.** Each phase lists (a) the communicative goals (mapped to the SAS A1/A2 standards), (b) the vocabulary band, (c) the grammar that gets *used* (implicitly) and *explained* (just-in-time), (d) input sources.

### Phase 0 — Sounds and script (days 1–5)

- Goals: read any Slovak word aloud correctly; hear length, palatals, h/ch; know the alphabet order (for dictionaries); type diacritics.
- Content: the §4.1 sound map with Romanian anchors; minimal pairs with audio (length: *pas/pás, sud/súd, vila/víla, latka/látka, byt/byť*; palatals: *ten/teň, dom/ďom, lak/ľak*; *h/ch*: *hlad/chlad*); first-syllable stress drill on 3–4 syllable words (*univerzita, informácia, autobusová*); *de/te/ne/le* rule; *ô*, *ä*; internationalisms readable on sight (~200: *hotel, banka, telefón, autobus, reštaurácia, program, internet, počítač* (native), *e-mail, aplikácia, kultúra, história, minúta, sekunda, kilo, liter, euro, cent…*).
- Cognate bootstrap: the §4.3 list as "words you already own" cards (recognition only) — ~100 words.
- Output: shadow 20 short chunks (*Ahoj. Dobrý deň. Ďakujem. Prosím. Áno. Nie. Neviem. Dobre. Prepáčte.*).

### Phase 1 — Survival chunks + glue words (weeks 1–6) ≈ A1

- Goals (SAS A1 topics): greet/introduce, ask/say where things are, numbers/prices/time, order food/drink, shop at a market/shop, ask for repetition/slower speech, basic personal info (name, origin, job, family), yes/no questions, likes/dislikes, simple directions, phone/messaging basics.
- Vocabulary: **band 1 (top ~300 lemmas by spoken rank)** — this is dominated by: *byť, mať, môcť, chcieť, vedieť, ísť, robiť, hovoriť, vidieť, dať, prísť, povedať, myslieť, musieť*; pronouns; *to, tu, tam, teraz, dnes, zajtra, včera*; *áno/hej, nie, ne-*; question words *čo, kto, kde, kedy, ako, prečo, koľko, ktorý*; *a, ale, alebo, že, aby, keď, lebo/pretože*; numbers 0–100, 1000; *dobrý, zlý, veľký, malý, nový, starý, pekný*; *deň, čas, človek, ľudia, žena, muž, dieťa, práca, dom, mesto, voda, káva, chlieb, peniaze, euro*.
- Chunks (~150): from *Prvá pomoc po slovensky* + SAS *Jazykové funkcie A1*: *Volám sa… / Som z Rumunska. / Hovorím po anglicky a po rumunsky. / Učím sa po slovensky. / Nerozumiem. / Ešte raz, prosím. / Pomalšie, prosím. / Ako sa povie … po slovensky? / Prosím si… / Koľko to stojí? / Kde je…? / Máte…? / Ďakujem pekne. / Nemáš zač. / Dobrú chuť. / Na zdravie. / Prepáčte, … / To je v pohode. / Neviem. / Uvidíme. / Dobrý nápad.*
- Grammar used (explained briefly on tap): *byť* and *mať* present; the three present-tense patterns (*-ám, -ím, -em*: *mám, robím, idem*); gender guessing from endings; nominative vs accusative for direct objects (*Mám kávu*); *v/na* + locative for "where" (*v Bratislave, na trhu*) as fixed chunks; negation with *ne-*; *je/sú*; possessives *môj/moja/moje, tvoj, jeho/jej, náš, váš*; *ten/tá/to*; *rád/rada + verb* (*Rád čítam*); *páči sa mi* (like — dative!) as a chunk; polite *vy*.
- Input: 50languages RO↔SK audio pairs; Slovenčina ako cudzí jazyk videos; first Comprehensible Slovak episodes (listening for gist).
- Milestone: a 2-minute self-introduction; a market purchase roleplay; understand slow "where/when/how much" questions.

### Phase 2 — The sentence engine (weeks 7–16) ≈ A2

- Goals (SAS A2): narrate yesterday/plans, describe people/places/daily routine, express opinions and reasons, make appointments, handle transport, doctor/pharmacy basics, weather, ask for/give directions, talk about work and hobbies, write a short message/email.
- Vocabulary: **band 2 (to ~1,000 lemmas)**; aspect pairs introduced as *two words* for the 60 most common verbs (*robiť/urobiť, písať/napísať, kupovať/kúpiť, dávať/dať, hovoriť/povedať, ísť/prísť/odísť*).
- Grammar used and explained: past tense (*bol som, robil/robila som*); future (*budem* + inf.; perfective present = future); the **big four cases by function**: accusative (object, direction *do/na*), genitive (possession, *z/od/do/bez*, quantities *veľa/päť*), locative (*v/na/o/pri*), dative (recipient, *páči sa mi, chutí mi, je mi zle*); instrumental as chunks (*s kamarátom, autom, električkou*); adjective agreement in N/A; plural nominative; numbers 2–4 vs 5+; modal verbs; *chcem, aby…*; *keď/ak*; comparatives (*lepší, väčší, viac/menej*); time expressions (*o tretej, v pondelok, v lete, minulý týždeň*); reflexive *sa/si* placement; clitic order (*som ho, si ju, sa mi*).
- Input: SlovakforU A1–A2 episodes with transcripts; Učíme (sa) slovenčinu A1.2–A2 clips; e-slovak A1/A2 units as a parallel track; Gospel of Mark (SEB, via Bible.com) verse-by-verse if you choose the church track.
- Milestone: tell a 5-sentence story about your weekend; a 3-minute conversation with a native on daily topics; write a 60-word message.

### Phase 3 — Domain tracks and fluency (months 4–8) ≈ A2+/B1 listening

- Vocabulary: **band 3 (to ~2,500 lemmas)**, delivered through selectable domain packs (each ~150–250 lemmas + 60 sentences + 3 dialogues + authentic text):
  1. **Home & family** (*rodina, manžel/manželka, deti, byt, kuchyňa, upratovať, variť*) 
  2. **Food, market, shopping** (*trh, stánok, kilo, deko, zľava, pokladňa, účet, hotovosť/karta, čerstvý, domáci, ochutnať*; produce names; *Prosím si pol kila…*) 
  3. **Town, transport, directions** (*zastávka, električka, lístok, prestúpiť, rovno, doľava/doprava, križovatka*) 
  4. **Work & technology** (*firma, projekt, termín, stretnutie, zákazník, faktúra, softvér, aplikácia, server, databáza, kód, chyba (bug), nasadiť (deploy), aktualizácia, heslo, prihlásiť sa, stiahnuť, nahrať*; note IT Slovak mixes English loans: *deploynuť, pushnúť* in speech) 
  5. **Church & faith** (see 9.1) 
  6. **Health basics** (*bolí ma…, lekáreň, liek, recept, teplota, prechladnutie, poistenie*) 
  7. **Weather & nature** (*prší, sneží, fúka, hory, les, rieka, Tatry*) 
  8. **Feelings, opinions, small talk** (*myslím si, že…; podľa mňa; súhlasím; to záleží; mám pocit, že*) 
  9. **Phone, messaging, online** (*zavolám ti, napíš mi, som na ceste, meškám*) 
  10. **Romania ↔ Slovakia** (talking about where you're from, cultural comparison, food names both ways) 
  11. **Hobbies, sport, media** 
  12. **Travel & accommodation**
- Grammar: instrumental fully; aspect systematically (imperative *choď/poď*, negative imperative uses imperfective); conditional *by som*; relative clauses *ktorý*; indirect speech; prefixed motion verbs (*prísť, odísť, prejsť, vyjsť*); plural cases as recognition; passive/participles as recognition only.
- Input: Comprehensible Slovak; News in Easy Slovak; children's TV; Slovak Wikipedia on your own topics; church services (streams) if relevant.
- Milestone: 95% comprehension of an easy-news episode without transcript; 10-minute conversation; read a 2-page text with ≤5 lookups.

### Phase 4 — Native input and the short book (months 8–12)

- Vocabulary: band 4 (to ~4,000) via reading with tap-to-gloss; SRS only for words met ≥2 times.
- Reading roadmap: *Malý princ* → children's books → modern Dobšinský retellings → Slovak translation of a known novel → news.
- Listening: RTVS radio, TV news, podcasts for natives (start with interviews — slower, dialogic).
- Speaking: weekly conversation with a native (tandem); the app's roleplay for daily reps.

### 9.1 Church-life vocabulary track (both traditions, so it's usable anywhere)

Slovakia is majority Roman Catholic with a significant Lutheran (*evanjelická cirkev a. v.*) minority and smaller Reformed, Greek-Catholic, Orthodox and evangelical/Pentecostal communities. Vocabulary differs by tradition; teach the shared core, then mark variants.

- Shared core: *Boh, Pán, Ježiš Kristus, Duch Svätý, viera, nádej, láska, milosť, modlitba, modliť sa, Biblia / Sväté písmo, evanjelium, žalm, hriech, odpustenie, pokánie, spása, kríž, vzkriesenie, cirkev, kostol, kázeň, kazateľ, pieseň, spevokol, chvály, zbor (congregation — Protestant usage) / farnosť (parish — Catholic), bohoslužba (service), omša (Mass — Catholic), služby Božie (Lutheran term for the service), krst, Večera Pánova (Lutheran) / sväté prijímanie (Catholic Communion), svadba, pohreb, Vianoce, Veľká noc, Zoslanie Ducha Svätého, Amen, Aleluja.*
- Roles: *kňaz, farár (both Catholic and Lutheran pastors are called farár), pastor (evangelical), biskup, diakon, veriaci, zborový dom (Protestant church hall), fara (parsonage), sakristia*.
- Greetings/phrases: *Pochválen buď Ježiš Kristus. — Naveky, amen.* (traditional Catholic greeting); *Pán Boh zaplať* (thank you — religious/rural); *S Bohom* (goodbye, formal/old); *Pokoj vám*; *Nech ťa Pán Boh požehná*; *modlime sa*; *Otčenáš / Modlitba Pána* — the Lord's Prayer in Slovak is a fixed text every learner can use for pronunciation and case forms (*Otče náš, ktorý si na nebesiach…*); *Zdravas' Mária* (Catholic).
- Sources: SEB Bible text + free audio (Bible.com); Roháček (PD, archaic flavour); parish/congregation websites and YouTube streams (e.g., TV LUX — Catholic; ECAV streams — Lutheran; various evangelical church channels) for authentic listening; hymnals: *Evanjelický spevník*, *Jednotný katolícky spevník* (copyrighted — link only).
- Cognate bridge from Romanian (§4.3): *sfânt/svätý, duh/duch, rai/raj, milă/milosť, slujbă/služba, slavă/sláva, pocăință/pokánie, mucenic/mučeník, spovedi/spoveď, blagoslovi/blahoslavený, sobor/zbor*.

### 9.2 Daily session template (≈45 min)

1. 3 min — pronunciation micro-drill (rotating contrast).
2. 12 min — SRS reviews (sentence cards; typing or speaking answers).
3. 10 min — new material: 8–12 new sentences introducing ≤6 new lemmas (i+1), with chunk audio + shadowing.
4. 10 min — input: one podcast/video/text at current level with tap-to-gloss; unknown-word meter must be ≤5%.
5. 7 min — output: 5 RO→SK production prompts **or** a 3-minute roleplay (LLM) **or** a 60-word writing task; auto-graded + saved to "mistake diary".
6. 3 min — progress: coverage %, streak, next grammar note unlocked.

---

## 10. App feature blueprint (recommendation)

### 10.1 Skills → features

| Skill | Features |
|---|---|
| **Listening** | Audio-first sentence cards (hear → choose/type meaning); **dictation** (type what you hear; lenient diacritics mode → strict); minimal-pair discrimination tests; variable speed (0.7×–1.0×); short comprehension passages with 2–3 questions; "real voice" clips from Common Voice; immersion feed (podcast/video links with pasted transcript + tap-to-gloss). |
| **Speaking** | **Shadowing studio** (play → record → overlay waveforms; loop a phrase); ASR check (Whisper/Web Speech) with word-level diff; pronunciation drills targeting *ľ ť ď ň, h/ch, length, stress*; **RO→SK "say it" prompts**; **LLM roleplay** (market, café, meeting a neighbour, after church, at the office) constrained to the learner's known lexicon + current band, with ASR in and TTS out, and an "I didn't understand" button that slows/rephrases. |
| **Reading** | Sentence reading with tap-to-gloss (RO/EN, IPA, forms, grammar note); **i+1 reader** for any pasted/imported text (unknown-word meter, per-word status unknown→learning→known, add-to-SRS); **parallel reader** (Bible RO↔SK, Tatoeba pairs, Europarl for B1); graded micro-texts; cloze reading. |
| **Writing** | Slovak keyboard trainer + on-screen diacritics helper (long-press / dead-key hints for *ľščťžýáíéďňôäúŕĺ*); RO→SK translation with fuzzy grading (Levenshtein on normalized forms; accept synonyms from a list); word-tile sentence building; **form drills** ("*stôl* in the locative?") generated from kaikki forms; short guided writing (60 words) with hunspell spell-check and LLM feedback (local). |
| **Vocabulary/SRS** | `ts-fsrs` scheduler; cards are sentences; each sentence targets one lemma; word knowledge = aggregate over its cards; daily new-card cap; interleaving of exercise types; leech handling. |
| **Grammar** | 120 micro-notes, unlocked when first needed; tap-any-word explanation; case/aspect visualizers; Romanian analogy in every note; searchable reference. |
| **Naturalness** | Standard/colloquial toggle per phrase; "natives say" chips; register tags; a "textbook phrase" warning; flag-for-native-review button. |
| **Domains** | Selectable tracks (§9.1 list); domain progress; domain-specific roleplays. |
| **Progress** | Known lemmas by band; **coverage % of casual speech** (weighted by spoken frequency); minutes of input; mistake diary → auto-generated drills; weekly "can-do" self-checks from the SAS A1/A2 descriptors. |

### 10.2 Data model (sketch)

```json
{
  "lexeme": {"id": "sk:chcieť", "lemma": "chcieť", "pos": "VERB", "aspect": "impf", "pair": "sk:zachcieť?", "gender": null,
             "spoken_rank": 23, "written_rank": 61, "band": 1, "ipa": "/xcɪ̯ec/",
             "gloss_en": ["to want"], "gloss_ro": ["a vrea"], "cognate_ro": null, "false_friend_ro": null,
             "forms": [{"form": "chcem", "tags": ["1s","pres"]}, {"form": "chceš", "tags": ["2s","pres"]}],
             "domains": ["core"], "source": ["kaikki","subtitles"]},
  "sentence": {"id": "tat:1234567", "sk": "Chcem si dať kávu.", "en": "I want to have a coffee.", "ro": "Vreau să beau o cafea.",
               "lemmas": ["chcieť","si","dať","káva"], "target": "sk:chcieť", "spoken_rank_max": 210, "band": 1,
               "grammar": ["Refl=si","Inf","Case=Acc"], "register": "neutral", "natives_say": "Dám si kávu. / Prosím si kávu.",
               "audio": "audio/tat1234567.ogg", "tts_voice": "piper:sk_SK-lili-medium", "source": "tatoeba",
               "licence": "CC BY 2.0 FR", "attribution": "user X @ Tatoeba", "review_status": "unreviewed", "domains": ["food"]},
  "chunk": {"id": "chunk:prosim-si", "sk": "Prosím si …", "meaning_ro": "Aș dori …", "register": "neutral",
            "variants": [{"sk": "Dám si …", "note": "very common when ordering"}], "examples": ["tat:..."]},
  "card": {"sentence_id": "tat:1234567", "mode": "listen_type", "fsrs": {"stability": 3.2, "difficulty": 5.6, "due": "2026-09-09"}},
  "grammar_note": {"id": "case-loc-v-na", "title": "v / na + locative: where?", "ro_analogy": "…", "examples": ["tat:..."]}
}
```

### 10.3 Stack suggestions (local-first)

- **Frontend**: React/TypeScript SPA or Next.js; PWA for offline; IndexedDB (Dexie) or SQLite-WASM for data; `ts-fsrs` for scheduling; Web Audio for playback/recording; Web Speech API as ASR fallback.
- **Local services (optional, Docker-compose)**: `faster-whisper` server (medium or the Slovak-fine-tuned small); Piper HTTP (or pre-rendered audio only); Ollama with Qwen3-14B-sk (or a general model) for roleplay/feedback; Stanza/UDPipe microservice only at build-time.
- **Build-time (Python)**: pipeline in §7.4 → emits `content/*.jsonl` + `audio/*.ogg`.
- **No accounts, no cloud** — all progress in the browser DB with export/import (JSON). If you later move to a phone, the PWA + export covers it.

---

## 11. Ideas and concepts worth building in

1. **Cognate bootstrap day** — 100 Slavic-origin Romanian words + 200 internationalisms as "free" vocabulary in the first session; instant sense of progress and a Romanian-specific hook no other app has.
2. **"What natives say" toggle** — every textbook-standard phrase paired with the colloquial one, with the spoken-frequency evidence shown. (Measured: *áno* rank 32, *hej* rank 58 — **both** are top-60 words, so teach them as equals, `áno` neutral / `hej` informal. My earlier guess that *hej* dominates was wrong.)
3. **Parallel verse-of-the-day** — RO↔SK Bible verse with SEB audio link; taps to gloss; a natural daily ritual for the church track and a source of beautiful, known-in-advance sentences.
4. **i+1 reader for anything** — paste a chapter, a news article, a sermon transcript; the app shows your unknown-word %, glosses on tap, and lets you add words to SRS. This is how the "short Slovak book" goal gets reached.
5. **Roleplay with a bounded LLM** — scenarios (market, café, coffee after the service, stand-up meeting) where the model may only use lemmas from your known set + current band; ASR in, TTS out; "slower/simpler" button. Conversations get saved and mined for mistakes.
6. **Shadowing studio** — the single most effective speaking exercise for pronunciation/prosody; loop, slow, overlay.
7. **Mistake diary → drills** — every ASR/typing error (wrong case ending, wrong aspect, *l* for *ľ*) becomes a tag; the app schedules 2-minute targeted drills.
8. **Aspect as vocabulary** — show *robiť/urobiť* as one card pair with a "process vs result" picture; never a grammar chapter first.
9. **Case by function, with Romanian analogies** — "*páči sa mi*" ≈ "*îmi place*" (dative experiencer in both!), "*u kamaráta*" ≈ "*la un prieten*".
10. **Czech radar** — when reading imported text, flag likely Czech words/forms so the learner doesn't absorb them; explain the most common SK/CZ differences as a mini-module later (huge real-world payoff because Czech media are everywhere in Slovakia).
11. **Diminutive trainer** — Slovak conversation is full of *-ka/-ko/-ík/-ička*; a tiny module makes speech sound native fast.
12. **Numbers & prices sprint** — market-style rapid listening for numbers, weights and prices (*dve eurá päťdesiat, deväťdesiat deka*), since numbers are the most common comprehension failure for beginners.
13. **Proverbs & fixed expressions pack (A2+)** — from ucimesaslovencinu.sk's list and the collocation dictionary; small but very "native".
14. **Immersion feed** — RSS of Comprehensible Slovak / News in Easy Slovak / SlovakforU with one-tap transcript import.
15. **Weekly can-do checklist** — SAS A1/A2 functions ("I can order in a café", "I can say what I did yesterday"), self-ticked, driving what the app schedules next.
16. **Talk to real people** — prompts to book a tandem (HelloTalk/Tandem/italki-free exchange), r/Slovakia threads, and — uniquely for you — Slovak-speaking communities in western Romania (Nădlac/Bihor) and Slovak-Romanian cultural events.
17. **Eventually: Czech as a bonus** — after B1 Slovak, a short "Czech in 2 weeks for Slovak speakers" module unlocks most Czech media.

---

## 12. Risks, caveats, licences

| Risk | Mitigation |
|---|---|
| **Corpus licences**: SNK lists are research-only; OpenSubtitles is research/non-commercial; Zlatý fond works are CC BY-NC-SA *(verify each)*; SEB Bible and podcast transcripts are copyrighted. | Personal, local, non-commercial use is fine for all of these. If the app is ever published, ship only CC-BY/CC0/PD content (Tatoeba, Common Voice, kaikki, Roháček, Piper audio) and keep the rest as *build-time* or *link-out*. Keep `licence` + `attribution` fields on every record from day one. |
| **Tatoeba quality**: some Slovak sentences are translations by non-natives or stilted. | Prefer sentences with the native-speaker flag; run the spoken-rank check; native review for band 1–2. |
| **Czech contamination** in subtitle corpora and frequency lists. | Grapheme/stopword filters + hunspell OOV; manual pass on the top 1,000. |
| **TTS artefacts**: numeral expansion and rare words can be off; a single synthetic voice may bias the ear. | Spell out numbers; mix in Common Voice human clips; optional second voice; spot-check band-1 audio by ear. |
| **ASR weakness**: Whisper base/small is poor on Slovak; fine-tuned model biased to formal speech. | Use large-v3 or the fine-tuned small; grade by similarity, not exact match; use Web Speech API as fallback. |
| **Archaic reading material** (Dobšinský 1880s). | Tag `archaic`; use for Phase 4 only; prefer modern retellings. |
| **Over-engineering the grammar**. | Cap grammar notes at one screen; unlock only when a sentence needs them. |
| **Motivation collapse around month 3** (the case system). | Coverage meter, domain packs of *your* interest (tech, church, market), weekly conversation with a human. |
| **Colloquial ≠ dialect ≠ slang**. | Teach standard + neutral colloquial; recognize slang; avoid dialect except as awareness. |
| **Romanian interference** (stress, length, palatals, articles). | Phase 0 drills and recurring 3-minute micro-drills. |

---

## 13. URL index

### Frequency & corpora
- OpenSubtitles frequency list (Slovak, 50k): https://github.com/hermitdave/FrequencyWords/blob/master/content/2016/sk/sk_50k.txt (also `content/2018/sk/`)
- brm.sk Slovak wordlist: https://p.brm.sk/sk_wordlist/ · npm `slovak-wordlist`: https://github.com/danielhusar/slovak-wordlist
- Wiktionary frequency-list index (Slovak): https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Slovak
- Slovak National Corpus (SNK) — resources & frequency lists (registration): https://korpus.juls.savba.sk/res.html · EN home: https://korpus.juls.savba.sk/index_en.html · books incl. *Frekvenčný slovník hovorenej slovenčiny*: https://korpus.juls.savba.sk/snkbooks.html
- Tatoeba downloads: https://tatoeba.org/en/downloads · sentence counts: https://tatoeba.org/en/stats/sentences_by_language · Slovak browse: https://tatoeba.org/en/sentences/show_all_in/slk/none/none/indifferent
- tatoeba-to-anki (difficulty ordering + TTS reference implementation): https://github.com/Vuizur/tatoeba-to-anki
- OPUS (parallel corpora; ro–sk, en–sk): https://opus.nlpl.eu · OPUS GitHub: https://github.com/Helsinki-NLP/OPUS
- Europarl: https://www.statmt.org/europarl/
- Common Voice (Slovak): https://commonvoice.mozilla.org/sk
- SloPal paper (Slovak ASR corpus & fine-tuned Whisper): https://arxiv.org/abs/2509.19270 · model: https://huggingface.co/NaiveNeuron/whisper-small-sk

### Dictionaries & grammar
- kaikki.org Slovak (JSONL downloads at page bottom): https://kaikki.org/dictionary/Slovak/index.html · raw data: https://kaikki.org/dictionary/rawdata.html
- JÚĽŠ dictionary portal: https://slovnik.juls.savba.sk/?lang=en · JÚĽŠ home (news incl. Qwen3-14B-sk, ERRKORP v3): https://www.juls.savba.sk/index_en.html
- Lingea SK↔RO: https://www.dict.com/slovac-roman
- Linguee RO↔SK: https://ro.linguee.com/rom%C3%A2n%C4%83-slovac%C4%83
- hunspell-sk (sk-spell): https://github.com/sk-spell/hunspell-sk · Essential Data (lemma-preserving): https://github.com/essential-data/hunspell-sk
- slovak-nlp/resources (curated tools/datasets/models): https://github.com/slovak-nlp/resources · MODELS.md: https://github.com/slovak-nlp/resources/blob/master/MODELS.md
- Stanza Slovak model: https://huggingface.co/stanfordnlp/stanza-sk
- Romanian Wikipedia on Slovak (codification handbooks list): https://ro.wikipedia.org/wiki/Limba_slovac%C4%83

### Courses & learner materials
- slovake.eu: https://slovake.eu · courses: https://slovake.eu/courses
- e-slovak (SAS, Comenius): https://www.e-slovak.sk · A1 course info: https://www.e-slovak.sk/mod/page/view.php?id=2497
- SAS — Vzdelávací program *Slovenčina ako cudzí jazyk*: https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/veda-research/vzdelavaci-program-slovencina-ako-cudzi-jazyk/
- SAS — *Štandardy pre slovenčinu ako cudzí jazyk* (A1–A2 functions, topics): https://fphil.uniba.sk/katedry-a-odborne-pracoviska/sas/edicna-cinnost-publications/standardy-pre-slovencinu-ako-cudzi-jazyk/ · *Témy a ciele A1* PDF: https://fphil.uniba.sk/fileadmin/fif/katedry_pracoviska/sas/TESTY_standardy/Te__my_a_ciele_A1-online.pdf
- Ministry teacher handbook (2018) PDF: https://edu.nivam.sk/pages/mpc_pre_ukrajinu/slovencina_ako_cudzi_jazyk.pdf
- IOM MIC — free self-learning materials (meta-list; PDFs for *Slovenčina pre azylantov*, *Hovoríme po slovensky!*, *Prvá pomoc po slovensky*): https://mic.iom.sk/en/social-issues/education/498-learn-slovak-language-for-free.html
- Study in Slovakia — language page: https://www.studyinslovakia.saia.sk/en/main/life-in-slovakia/daily-life-in-slovakia/language · https://www.studyinslovakia.sk/where-can-foreign-students-learn-the-slovak-language/
- Učíme (sa) slovenčinu: https://ucimesaslovencinu.sk (proverbs article: https://ucimesaslovencinu.sk/clanok/slovenske-prislovia-a-porekadla/)
- Bodkaschool: https://bodkaschool.sk *(verify current domain)*
- 50languages Slovak (RO available): https://50languages.com/slovak-for-free
- Loecsen Slovak downloads: https://www.loecsen.com/en/download-mp3-and-pdf-slovak
- Live Lingua Peace Corps courses: https://www.livelingua.com/peace-corps/
- language-learners.org Slovak resources thread: https://forum.language-learners.org/viewtopic.php?t=17285
- University of Iowa Slovak resources list: https://clcl.uiowa.edu/language-resources/slovak-language-and-culture-resources
- LanguageList Slovak: https://www.languagelist.org/slovak · Universe of Memory: https://universeofmemory.com/slovak-language-resources/
- Colloquial Slovak (Naughton) on Internet Archive (lending): https://archive.org/details/colloquialslovak

### Listening & reading
- Comprehensible Slovak podcast: https://www.comprehensibleslovak.com · Spotify: https://open.spotify.com/show/6MvnsnHhqilfzXgUDVpQAu · Apple: https://podcasts.apple.com/sk/podcast/comprehensible-slovak/id1517633308
- SlovakforU podcast: https://slovakforu.sk *(verify)*
- Zlatý fond SME (PD literature): https://zlatyfond.sme.sk · Dobšinský: https://zlatyfond.sme.sk/autor/40/Pavol-Dobsinsky
- Bible: Roháček online https://biblia.sk/citanie/roh/mt/1 · SEB audio on YouVersion https://www.bible.com/audio-bible-app-versions/465-seb-slovensky-ekumenicky-biblia · SEB audio shop https://audio.biblia.sk/ · MojaBiblia https://mojabiblia.sk/
- RTVS/STVR: https://www.rtvs.sk · Radio Slovakia International: https://enrsi.rtvs.sk *(verify)*

### Speech tech
- Piper voices list: https://github.com/rhasspy/piper/blob/master/VOICES.md · Slovak model files: https://huggingface.co/rhasspy/piper-voices/tree/main/sk/sk_SK/lili/medium · numbers issue thread: https://github.com/rhasspy/piper/discussions/225
- Coqui TTS Slovak VITS: model id `tts_models/sk/cv/vits` (coqui-tts fork on GitHub)
- Meta MMS-TTS Slovak: https://huggingface.co/facebook/mms-tts-slk *(verify id)*
- Whisper: https://github.com/openai/whisper · faster-whisper: https://github.com/SYSTRAN/faster-whisper · whisper.cpp: https://github.com/ggerganov/whisper.cpp

### Spaced repetition
- ts-fsrs: https://github.com/open-spaced-repetition/ts-fsrs · docs: https://open-spaced-repetition.github.io/ts-fsrs/ · FSRS algorithm: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler · awesome-fsrs: https://github.com/open-spaced-repetition/awesome-fsrs

### Romanian–Slovak
- Editura Univ. București — Ghid de conversație român-slovac: https://editura-unibuc.ro/en/ghid-de-conversatie-roman-slovac/ · Dicționar frazeologic slovac-român: https://editura-unibuc.ro/en/dictionar-frazeologic-slovac-roman/
- UniBuc Slovak programme: https://filologierusasislava.lls.unibuc.ro/programe-de-studii/licenta/limba-slovaca/
- Romanoslavica (journal): https://biblioteca-digitala.ro/reviste/Romanoslavica/
- ISPMN (Slovak & Czech minority chronicles, mentions UDSCR, Nădlac, *Naše snahy*): https://ispmn.gov.ro/node/minoritile-slovac-i-ceh-2010
- Slavic loanwords in Romanian (discussion lists): https://forum.wordreference.com/threads/romanian-words-of-slavic-origin.2408557/

### Learning science
- Cambridge, *Learning Vocabulary in Another Language*, ch. 4 (coverage figures): https://www.cambridge.org/core/books/abs/learning-vocabulary-in-another-language/vocabulary-and-listening-and-speaking/E1AACDB39B0F72636009BC910FD455C5
- van Zeeland & Schmitt replication summary (ERIC): https://eric.ed.gov/?id=EJ1139942
- Nation (2006) *How large a vocabulary is needed for reading and listening?*: https://utppublishing.com/doi/10.3138/cmlr.63.1.59

---

## 15. Spike results (executed 2026-09-07) — READ BEFORE BUILDING

Steps 0–1 of the feasibility spike were actually run. Everything below is measured, not estimated. Artefacts: `lexicon_bands.csv` (3,000 ranked lemmas) and `spike_remaining.py` (the steps that need blocked domains).

### 15.1 What was run

Downloaded `sk_50k.txt` (OpenSubtitles 2018, 50,000 word forms, **47.9 M tokens**), lemmatized with **simplemma** (`lang="sk"` — spot-checked and accurate: *som→byť, chcem→chcieť, deti→dieťa, peknú→pekný*), filtered, aggregated to lemma level, and validated against the **hunspell-sk** dictionary (159,675 POS-tagged entries, **MPL 2.0** — permissive, safe to bundle).

| Metric | Value |
|---|---|
| Input word forms | 50,000 |
| Total tokens | 47,918,044 |
| Dropped as Czech contamination | 16 (*jsem, není, nevím, tady, protože, bych, tohle, byl…*) |
| Dropped as junk / English leakage | 278 |
| Distinct lemmas | 23,021 → **22,247** after merging negated verbs |
| Band-1 lemmas validated in hunspell-sk | **282/300 (94%)** |
| Band-1+2 validated | 915/1000 (91.5%) |

**Cumulative token coverage by lemma rank** (within the 50k list, so a slight over-estimate of true corpus coverage):

| Top N lemmas | Coverage |
|---|---|
| 100 | 58.8% |
| 300 | 72.3% |
| 500 | 77.6% |
| 1,000 | 83.7% |
| 2,000 | 89.0% |
| 2,500 | **90.6%** |
| 3,000 | 91.8% |

This **confirms the §1.1 targets**: ~2,500 lemmas really does land around 90% coverage of dialogue, and the 95% comfort threshold sits near 4,000–5,000 — consistent with the published research. The phase structure in §9 stands.

### 15.2 Three pipeline bugs found by running it (fix these in the build)

1. **Don't filter English words that are also Slovak.** My first filter pass silently deleted *to* and *no* — *to* is the **single most frequent Slovak word** and *no* is the ubiquitous discourse particle ("well…"). Removing them cost 4 percentage points of coverage. Blocklist entries must be checked against the Slovak lexicon first.
2. **Merge negated verbs into their positives.** simplemma lemmatizes *nechcem* → *nechcieť*, not *chcieť*, splitting each verb's frequency across two entries. **774 negated lemmas** were merged; this moved *chcieť* from rank 34 → 25, *môcť* 19 → 17. Without the merge, band 1 is measurably wrong.
3. **Profanity needs an explicit filter.** *kurva* sits at **rank 244** — inside band 1 — purely from film subtitles. Needs a `flag: profanity` field, excluded from lessons, available for recognition later.

### 15.3 The important finding: pure subtitle frequency picks the wrong domain vocabulary

Your instinct was right that theme-first apps teach useless words early. But the data shows a **pure frequency-first approach from subtitles has the opposite failure**, and it is arguably worse:

| Crime/drama vocabulary | rank | | Everyday transactional vocabulary | rank |
|---|---|---|---|---|
| zabiť (to kill) | **117** | | cena (price) | 621 |
| mŕtvy (dead) | **233** | | účet (bill) | 802 |
| zbraň (weapon) | **250** | | mlieko (milk) | 1,605 |
| smrť (death) | **291** | | trh (market) | 1,565 |
| polícia | 367 | | chlieb (bread) | 2,142 |
| krv (blood) | 389 | | kilo | 2,770 |
| vražda (murder) | 420 | | euro, jablko, zelenina, zľava, pokladňa | **>3,000** |
| väzenie (prison) | 623 | | kaviareň, zastávka, lekáreň | **>3,000** |

An app built on raw subtitle frequency would teach you *kill, dead, weapon, murder, blood* before *bus stop, café, pharmacy, apple, euro*. OpenSubtitles is dubbed Hollywood drama, not Slovak daily life.

**Design consequence — this changes the plan:**

- **Band 1 (function words + core verbs): trust the frequency data.** It's excellent for this. The measured top 300 (`lexicon_bands.csv`) is a genuinely good Phase-1 list — *byť, to, sa, mať, vedieť, môcť, chcieť, ísť, povedať, myslieť, musieť…*
- **Domain vocabulary (bands 2–3): do NOT rank by subtitle frequency.** Hand-curate against communicative need, using the SAS A1/A2 topic standards as the checklist and the *Frekvenčný slovník hovorenej slovenčiny* (real conversation, not film) to order within each domain. This is precisely where that book stops being a nice-to-have and becomes necessary.
- Add a `corpus_bias` note to the data model so future-you remembers why domain lists aren't frequency-sorted.

### 15.4 Also checked

- **hunspell-sk thematic dictionaries are not the shortcut I hoped.** `_tematicke/nabozenske.dic` (43 entries) and `_terminy/it.dic` (39) are almost entirely proper nouns and acronyms (*Deuteronómium, ECAV, Firefox, Nvidia*), not usable domain vocabulary. Church and tech packs must be hand-built. The main 159k dictionary is still valuable for spell-check, form generation, and validation.
- **The 18 band-1 lemmas missing from hunspell** are mostly the negated-verb artefacts from bug #2 plus real words stored under affix flags (*niečo, nič, potom, stále, trochu, späť, tri*) — not lemmatizer failures. Validation rate is effectively ~98%.

### 15.5 Still to run — `spike_remaining.py`

`tatoeba.org`, `kaikki.org` and `huggingface.co` were all unreachable (HTTP 403) from the sandbox, so three questions remain open. The script answers all three; run `python3 spike_remaining.py` next to `lexicon_bands.csv`.

| Q | Question | Why it matters | Decision rule |
|---|---|---|---|
| **Q1** | How many Tatoeba sentences contain **only** band-1 lemmas? | **The go/no-go number.** Determines whether Phase 1 can be taught from free sentences at all. | >400 → build as designed · 100–400 → Tatoeba for drills, generate + native-review lesson sentences · <100 → generate everything for band 1, Tatoeba from band 2 up |
| **Q2** | What % of band-1 lemmas have gloss + IPA + inflection in kaikki? | Determines hand-authoring effort. | <90% gloss coverage → budget an afternoon writing 300 glosses (small either way) |
| **Q3** | Does Piper `sk_SK-lili-medium` render palatals, vowel length and numbers acceptably? | Audio quality is load-bearing for a listening-first app. | Fails any → use Edge neural voices for the ~500 core chunks, Piper for bulk |

Given ~33,000 Slovak sentences on Tatoeba and a 300-lemma band, my expectation for Q1 is a few hundred clean sentences — enough to build on, but probably needing generated supplements. The script will settle it.

---

## 14. Open decisions for the build phase

1. **Primary support language in UI**: Romanian default, English toggle? (Recommended: RO glosses first, EN on tap; grammar notes in RO or EN — pick one to avoid double authoring; EN is easier to source, RO is more natural for you.)
2. **Audio strategy**: pre-render everything with Piper at build time (simple, offline) vs. live TTS service. Recommended: pre-render + optional Edge voices for the 500 core chunks.
3. **ASR**: start with Web Speech API (zero setup, online) or go straight to local faster-whisper? Recommended: Web Speech first, local Whisper behind a settings flag.
4. **LLM roleplay**: local (Ollama + Qwen3-14B-sk or a general model) vs. none in v1. Recommended: v1 without; add in v2 once the content pipeline is solid.
5. **Scope of v1 content**: bands 1–2 (1,000 lemmas), ~2,500 sentences, 200 chunks, 60 grammar notes, 3 domain packs (food/market, work/tech, church). Bands 3–4 via the i+1 reader + imported texts.
6. **Native review**: who validates band 1–2 sentences? (Options: a Slovak-speaking acquaintance; r/Slovakia; a paid hour with a tutor on italki/Preply to review a spreadsheet.)
7. **Which Bible translation** to show by default in the church track (SEB modern, streamed/linked; Roháček PD, bundleable but archaic).
8. **Czech**: ignore in v1; add "Czech radar" flags in v2.

### Suggested first tasks for the build instance
1. ~~Download and lemmatize `sk_50k.txt`; produce the band list~~ — **DONE**, see §15 and `lexicon_bands.csv` (3,000 ranked lemmas, bands assigned). Apply the three bug fixes in §15.2 if regenerating.
2. Run `spike_remaining.py` (Q1 Tatoeba availability, Q2 kaikki coverage, Q3 Piper audio) — **this is the next action**; Q1 determines the Phase-1 content strategy.
3. Hand-curate domain vocabulary rather than frequency-ranking it (§15.3).
4. Render audio for band-1 sentences with Piper `sk_SK-lili-medium` (numbers spelled out as words).
5. Hand-write 150 chunks (RO/EN/SK, standard+colloquial) using *Prvá pomoc po slovensky* + SAS A1 functions; render audio.
6. Scaffold the SPA: SRS with `ts-fsrs`, listen-type card, tap-to-gloss, coverage meter, Slovak keyboard helper.
7. Ship Phase 0 (sounds) + Phase 1 (survival) as the first usable build; iterate with real daily use.

---

## Appendix A — Slovak grammar cheat-sheet for the builder (to seed grammar notes)

- **Nouns**: 3 genders; masc. animate vs inanimate (affects Acc sg = Gen sg for animates; Nom pl endings). Declension patterns (*vzory*): masc. *chlap, hrdina, dub, stroj*; fem. *žena, ulica, dlaň, kosť*; neut. *mesto, srdce, vysvedčenie, dievča*. Learners don't need pattern names; they need ending tables per case *by function*.
- **Cases by function** (teach in this order): Nom (subject; "what is it") → Acc (object; direction with *do/na/cez/pre*) → Loc (location with *v/na/o/pri/po*) → Gen (possession; *z/od/do/bez/u/okolo*; after numbers 5+; quantities) → Dat (recipient; *k*; experiencer verbs *páči sa mi, chutí mi, je mi zima*) → Instr (*s*/*so*; means: *autom, vlakom*; *byť* + profession in Instr is formal).
- **Prepositions with two cases** (motion vs. location): *do* (+Gen, into) vs *v* (+Loc, in); *na* (+Acc onto / +Loc on); *pod, nad, pred, za, medzi* (+Acc motion / +Instr location).
- **Verbs**: infinitive *-ť*; present classes *-ám/-áš* (*mať*), *-ím/-íš* (*robiť*), *-em/-eš* (*ísť, písať*), *-iem/-ieš* (*rozumieť*); past = l-participle (*robil/robila/robilo/robili*) + *som/si/–/sme/ste/–*; future imperf. *budem robiť*; perfective present = future (*urobím*); imperative *rob!/robte!*, *poď!/poďte!*; conditional *robil by som*; reflexive *sa/si*.
- **Aspect**: imperfective = process/habit/duration; perfective = completed/single result. Perfectives have no present meaning. Negative imperatives prefer imperfective (*Nerob to!*).
- **Motion**: *ísť/chodiť* (go on foot; single vs habitual), *prísť* (arrive), *odísť* (leave), *cestovať* (travel), *bežať*, prefixes *pri-, od-, pre-, vy-, v-, do-, roz-*.
- **Pronouns**: *ja, ty, on/ona/ono, my, vy, oni/ony*; object forms *ma/mňa, ťa/teba, ho/jeho, ju, nás, vás, ich*; dative *mi/mne, ti/tebe, mu, jej, nám, vám, im*; clitics in second position: *Včera **som ho** videl.*
- **Numerals**: *jeden/jedna/jedno* (agrees), *dva/dve* (m / f+n), *traja/štyria* (animate) vs *tri/štyri*; 2–4 + Nom pl; 5+ + Gen pl; *päť eur, dve eurá*.
- **Adjectives**: *dobrý/dobrá/dobré*; soft *cudzí/cudzia/cudzie*; comparatives *-ší/-ejší* (*lepší, krajší, väčší, menší*), superlative *naj-*.
- **Negation**: *ne-* prefixed to the verb; negative pronouns *nikto, nič, nikdy, nikde, žiadny* co-occur (*Nikdy nič nehovorí*).
- **Word order**: neutral SVO; new/important information goes last; yes/no questions by intonation or verb-first; *či* introduces indirect yes/no questions.
- **Politeness**: *vykanie* (*Ako sa máte? Prosím vás,…*) vs *tykanie*; *pán/pani + surname*; *Prepáčte / Prepáč*.

## Appendix B — Minimal-pair seed list (Phase 0)

Length: *pas–pás, sud–súd, vila–víla, latka–látka, rad–rád, krik–krík, pila–píla* (add more from the spoken frequency list; verify each is a real pair).
Palatals: *ten–teň, lak–ľak, byt–byť, mat–mať, nos–noš* (t/ť, l/ľ, n/ň); for d/ď use word-internal contrasts (*deti* [ɟeci] vs *diéta* [dieta]).
Sibilants: *sila–šila, cena–čena (nonce)* — c/č and s/š map cleanly from Romanian, so these are quick wins.
h/ch: *hlad–chlad, hodiť–chodiť*.
Diphthongs: *piatok, viera, viem, môj, kôň, nôž, biely*.
Stress (first syllable): *univerzita, informácia, republika, autobusová, Bratislava, Rumunsko*.

## Appendix C — Chunk starter list (Phase 1, 40 of ~150)

*Ahoj. / Dobrý deň. / Dobrý večer. / Dovidenia. / Čau. / Ďakujem (pekne). / Vďaka. / Prosím. / Nemáš zač. / Nie je za čo. / Prepáčte. / Prepáč. / Áno. / Hej. / Nie. / Neviem. / Nerozumiem. / Ešte raz, prosím. / Pomalšie, prosím. / Rozumiem. / Volám sa … / Som z Rumunska. / Som Rumun / Rumunka. / Hovorím po anglicky. / Učím sa po slovensky. / Ako sa povie … po slovensky? / Čo znamená …? / Koľko to stojí? / Prosím si … / Dám si … / Máte …? / Kde je …? / Kde sú toalety? / Platím. / Účet, prosím. / Dobrú chuť. / Na zdravie. / Všetko najlepšie. / Ako sa máš? — Dobre, a ty? / V pohode. / Uvidíme sa. / Maj sa. / Majte sa pekne.*

---

*End of research document.*
