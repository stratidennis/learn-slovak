#!/usr/bin/env python3
"""The 60 v1 grammar micro-notes -> content/grammar_notes.jsonl.

One screen each. English body, a Romanian analogy wherever one honestly exists,
a small table, tags that exercises use to open the right note on a wrong answer.
Sequenced by the SAS A1/A2 grammatical minimum (CC BY-NC-SA) and research App. A.
"""
from __future__ import annotations
import os
from .common import CONTENT, LICENCES, REVIEW_NEEDS, write_jsonl

N = []
def note(id, title, unit, tags, body, ro=None, table=None, examples=(), related=()):
    N.append(dict(id=id, title=title, unit=unit, tags=list(tags), body=body.strip(), ro_analogy=ro,
                  table=table, examples=list(examples), related=list(related)))

# ================================================================= Phase 0
note("sounds-length","Long and short vowels change the word","0.2",["diacritic:length"],
"""
The acute (dĺžeň) doubles the vowel's length — nothing else changes. Length is *meaning*: **pas**
(passport) vs **pás** (belt), **sud** (barrel) vs **súd** (court). Romanian has no length contrast,
so your ear will file both as the same word at first. The fix is not effort but exposure: the
minimal-pair drill runs until you hear it.
Rhythmic rule: two long syllables rarely sit next to each other (**krásny**, not *krásný*).
""", ro="Romanian has nothing like this; the nearest feeling is stressed vs unstressed, but Slovak length is independent of stress.",
table=[["short","long","meaning shifts"],["pas","pás","passport → belt"],["sud","súd","barrel → court"],["vila","víla","villa → fairy"],["rad","rád","row → glad"]])
note("sounds-palatals","ď ť ň ľ — and the hidden softening in de te ne le","0.2",["palatal"],
"""
Four consonants have a soft twin: **d/ď, t/ť, n/ň, l/ľ**. The mäkčeň (ˇ) marks it — except that
before **e, i, í, ia, ie, iu** the softening is *automatic and unwritten*: **deti** is said
[ďeťi], **ten** [ťen], **nemám** [ňemám]. Foreign words and a few natives resist (*teraz*
[teras], *jeden*, *ten* is actually hard in the demonstrative — listen). Romanian speakers
substitute a glide (*ti-* → *tj*); the drill targets exactly that.
""", ro="Romanian palatalises c/g before e/i (ce, gi). Slovak does the same trick with d t n l.",
table=[["written","said","note"],["deti","ďeťi","automatic"],["nie","ňie","automatic"],["ľudia","ľuďia","ľ written, ď automatic"],["ten (that)","ten","exception — hard"]])
note("sounds-h-ch","h is voiced, ch is the Romanian h","0.2",["h-ch"],
"""
Slovak **ch** [x] is your Romanian *h* in *hartă*. Slovak **h** is *voiced* [ɦ] — a breathy sound
Romanian does not have. Swapping them swaps words: **hlad** (hunger) / **chlad** (cold),
**hodiť** (throw) / **chodiť** (walk). Tip: put your hand on your throat — h buzzes, ch does not.
""", table=[["h [ɦ]","ch [x]"],["hlad — hunger","chlad — cold"],["hora — mountain","chorý — sick"],["hodiť — throw","chodiť — walk"]])
note("sounds-stress","Stress is always on the first syllable","0.2",["stress"],
"""
Every Slovak word is stressed on its first syllable: **U**niverzita, **in**formácia,
**Bra**tislava, **Ru**munsko. Romanian stress moves; Slovak stress never does. A long vowel later
in the word is *long*, not stressed — **dobrý** is DOB-rí, not dob-RÍ. Prepositions attach to the
next word and take the stress: **na** stole → NA-stole.
""", ro="Romanian: univerSItate. Slovak: Univerzita. Same word, stress jumps to the front.")
note("sounds-diphthongs","ia ie iu ô are single syllables","0.2",["diphthong"],
"""
**ia, ie, iu** and **ô** are diphthongs: one syllable, glide into the vowel. **piatok** is
PIA-tok (two syllables), **viem**, **kôň** [kuoň], **môj** [muoj]. Never say *mo-oj*.
""", table=[["spelling","sound","example"],["ia","[ɪ̯a]","piatok, Mária"],["ie","[ɪ̯e]","viem, biely"],["iu","[ɪ̯u]","cudziu"],["ô","[u̯o]","môj, kôň, stôl"]])
note("sounds-v","v at the end of a syllable sounds like u","0.2",["diphthong"],
"""
Before a consonant or at the end of a word, **v** becomes [u̯]: **Bratislav**a is fine, but
**pravda** → [prau̯da], **krv** → [kru̯], **dievča** → [ďieu̯ča]. You will hear this constantly;
you do not need to produce it perfectly.
""")
note("alphabet-y-i","y and i sound the same","0.1",["spelling"],
"""
**y/ý** and **i/í** are pronounced identically. The letter is chosen by spelling rules (after
hard consonants: **ty, dy, ny, ly** stay hard — this is *why* the softening rule exists: **ti**
softens, **ty** does not). For a learner: hear them as one vowel, learn spellings as you meet
them, and let hunspell catch the rest.
""")

# ================================================================= Phase 1 — used implicitly
note("byt-present","byť — to be","1.1",["verb:byť"],
"""
The only verb you must know cold. Negative is a *separate word* **nie**, not a prefix — the one
verb that does this.
""", ro="Like Romanian *a fi*, it is irregular and pro-drop: *som* = *sunt*, no pronoun needed.",
table=[["","affirmative","negative"],["ja","som","nie som"],["ty","si","nie si"],["on/ona/ono","je","nie je"],["my","sme","nie sme"],["vy","ste","nie ste"],["oni","sú","nie sú"]],
examples=["Som z Rumunska.","Nie som Slovák.","Ste unavený?"])
note("ty-vy","ty or vy — who gets which","1.1",["register:formal"],
"""
**ty** (tykanie) for friends, family, children, anyone who offered it. **vy** (vykanie) for
strangers, shopkeepers, officials, older people, colleagues until told otherwise. Verbs follow:
*Ako sa máš?* / *Ako sa máte?*; *Prepáč* / *Prepáčte*. Slovaks switch to *ty* faster than Germans
but slower than Romanians — wait for *Môžeme si tykať?*
""", ro="Exactly *tu* / *dumneavoastră*, but Slovak uses the plain 2nd-person plural verb — no special pronoun.")
note("neg-prefix","Negation: glue ne- to the verb","1.2",["negation"],
"""
Every verb except *byť* negates with the prefix **ne-** written as one word: **nerozumiem,
neviem, nechcem, nemám**. Double negatives are *required*: **Nikto nič nevie** (nobody knows
anything) stacks three negatives and means one.
""", ro="Romanian also stacks negatives: *Nimeni nu știe nimic.* Same instinct — keep it.",
examples=["Nerozumiem.","Nemám čas.","Nikdy nič nehovorí."])
note("po-sky","Speaking a language: po slovensky","1.2",["adverb:language"],
"""
*po* + language adjective in **-sky/-cky**: **po slovensky, po anglicky, po rumunsky, po
nemecky, po česky**. It is an adverb ("in the Slovak way"), so it never changes.
*Hovorím po slovensky* = I speak Slovak. The noun (**slovenčina**) is for *učiť sa slovenčinu*.
""", examples=["Hovoríte po anglicky?","Učím sa po slovensky.","Ako sa to povie po rumunsky?"])
note("present-3-patterns","Present tense: three endings sets","1.3",["verb:present"],
"""
Slovak verbs sort into three present-tense families by their 1st-person ending. Once you
recognise **-ám / -ím / -em**, you can conjugate almost anything you meet.
""", ro="Romanian also has conjugation groups (-a, -e, -i). Slovak's are more regular.",
table=[["","mať (-ám)","robiť (-ím)","ísť (-em)","rozumieť (-iem)"],["ja","mám","robím","idem","rozumiem"],["ty","máš","robíš","ideš","rozumieš"],["on","má","robí","ide","rozumie"],["my","máme","robíme","ideme","rozumieme"],["vy","máte","robíte","idete","rozumiete"],["oni","majú","robia","idú","rozumejú"]],
examples=["Mám dve deti.","Robím v IT.","Idem domov.","Nerozumiem."])
note("gender-guess","Guessing gender from the ending","1.3",["gender"],
"""
Three genders, and the ending gives it away ~90% of the time:
**consonant → masculine** (stôl, muž, chlieb), **-a → feminine** (žena, káva, kniha),
**-o/-e/-ie → neuter** (auto, pivo, srdce, námestie). Traps: **-ť/-sť** and **-eň** are often
feminine (*kosť, radosť, pieseň*); a few **-a** words for males are masculine (*kolega, turista*).
Masculine also splits **animate** (people, animals) vs **inanimate** — it matters in the
accusative and plural.
""", ro="Romanian -ă ≈ Slovak -a for feminine; Romanian neuter behaves oddly, Slovak neuter is a real class.",
table=[["ending","gender","examples"],["-consonant","m","dom, chlieb, priateľ"],["-a","f","káva, žena, práca"],["-o, -e, -ie","n","auto, pivo, srdce"],["-ť, -sť, -eň","usually f","kosť, radosť, pieseň"]])
note("acc-sg","Accusative singular — the direct object","1.4",["case:acc"],
"""
The first case you *need*: what you order, buy, see, have. Only two things change:
**feminine -a → -u** (káva → kávu, žena → ženu) and **masculine animate adds -a** (brat →
brata, priateľ → priateľa). Everything else stays as in the dictionary: *Prosím si **čaj** /
**pivo** / **chlieb***.
""", ro="Romanian marks the object with *pe* for people (*îl văd pe Petru*). Slovak marks it on the noun itself, and only for two groups.",
table=[["gender","nominative","accusative"],["f -a","káva","kávu"],["m animate","brat","brata"],["m inanimate","chlieb","chlieb (same)"],["n","pivo","pivo (same)"]],
examples=["Prosím si kávu.","Mám brata.","Dám si pivo.","Vidím Tomáša."])
note("jeden","jeden / jedna / jedno","1.4",["numeral:1"],
"""
'One' agrees like an adjective: **jeden** stôl (m), **jedna** káva (f), **jedno** pivo (n). In
the accusative: *Prosím si **jednu** kávu / **jedno** pivo / **jeden** čaj*.
""", ro="*un / o* — Romanian already makes you agree 'one' with gender.")
note("euro-count","1 euro, 2 eurá, 5 eur — counting nouns","1.5",["numeral:agreement"],
"""
After **1**: singular (*jedno euro*). After **2, 3, 4**: nominative plural (*dve eurá, tri
minúty, štyri deti*). After **5 and up** (and *koľko, veľa, pár*): **genitive plural** (*päť eur,
desať minút, veľa detí*). This is the rule behind every price you will hear.
**dva** (m) vs **dve** (f/n): *dva chleby, dve eurá, dve kávy*.
""", ro="Romanian switches at 20 (*douăzeci de lei*). Slovak switches at 5 and again uses a different case.",
table=[["count","form","example"],["1","nom. sg.","jedno euro, jedna káva"],["2–4","nom. pl.","dve eurá, tri kávy"],["5+","gen. pl.","päť eur, desať káv"]],
examples=["Dve eurá päťdesiat.","Päť pív, prosím.","Mám tri deti."])
note("time-half","pol tretej = half past TWO","1.5",["time"],
"""
Slovak tells half-hours by the *coming* hour: **pol tretej** = half of the third hour = **2:30**.
*pol druhej* 1:30, *pol štvrtej* 3:30, *pol ôsmej* 7:30. Quarters: *štvrť na tri* (2:15),
*trištvrte na tri* (2:45). Full hours: *o siedmej* (at 7), *o dvanástej*. In speech people also
just say digits: *o pol siedmej* or *o šiestej tridsať*.
""", ro="Romanian says *două și jumătate* — the past hour. Slovak looks forward. Expect to be an hour off for a month.")
note("gen-quantity","Genitive after quantities: pol kila jabĺk","1.6",["case:gen"],
"""
Amounts and containers take the **genitive**: *kilo **jabĺk***, *pohár **vody***, *veľa
**ľudí***, *trochu **mlieka***, *pol **kila***. Learn the market phrases as chunks now; the full
genitive arrives in Phase 2.
""", ro="Romanian uses *de*: *un kilogram DE mere*. Slovak inflects the noun instead.",
examples=["Prosím si kilo paradajok.","Pohár vody, prosím.","Veľa ľudí."])
note("mat-rad","mať rád vs páčiť sa vs chutiť — three ways to like","1.9",["verb:liking"],
"""
**Mám rád / rada** + accusative: a stable liking (people, foods, activities). Agrees with *you*:
*Mám rád kávu* (m) / *Mám rada kávu* (f).
**Páči sa mi** + nominative: something strikes you as nice/attractive — first impressions, looks,
ideas. The thing is the subject; you are in the dative.
**Chutí mi**: tastes good to me. Dative again.
""", ro="*páči sa mi* IS *îmi place*: dative experiencer, thing as subject. *chutí mi* has no direct equivalent — think *îmi place la gust*.",
table=[["","structure","when"],["mám rád(a) X","I + acc.","lasting preference"],["páči sa mi X","X + dat. me","impression, looks"],["chutí mi X","X + dat. me","taste"]],
examples=["Mám rada kávu.","Páči sa mi Bratislava.","Chutí mi bryndza."])
note("rad-verb","rád + verb: I like doing","1.8",["adjective:rád"],
"""
*rád* is an adjective meaning 'glad', and Slovaks glue it to a verb to mean 'like to':
**Rád čítam** (m) / **Rada čítam** (f) / **Radi čítame** (we, mixed). Negative **nerád**:
*Nerada varím*. It agrees with the *speaker*, not the object.
""", ro="No Romanian equivalent — *îmi place să citesc* uses the dative. Slovak makes it an adjective about you.",
examples=["Rád čítam.","Rada varím.","Nerád vstávam skoro."])
note("dative-experiencer","je mi zima, bolí ma — feelings without 'I am'","1.9",["case:dat","case:acc"],
"""
Physical states use **dative me** (*mi/mne*): **Je mi zima** (I'm cold), **Je mi zle**, **Je mi
ľúto**. Pain uses **accusative me** (*ma/mňa*): **Bolí ma hlava**. Wanting/needing something can
too: *Chce sa mi spať*. The pattern: the feeling is the subject, you are the receiver.
""", ro="Identical: *mi-e frig, mi-e rău, mă doare capul.* One of the places Romanian helps directly.",
examples=["Je mi zima.","Bolí ma hlava.","Je mi to ľúto."])
note("loc-v-na","v / na + locative: where something is","1.7",["case:loc","prep:v","prep:na"],
"""
Location takes the **locative**, mostly after **v/vo** (in) and **na** (on/at). Singular endings:
**-e** for most (*v Bratislave, v práci, na stole*), **-u** for many masculine (*v hoteli — no,
-i; v parku, v byte*), **-i** for soft stems (*v hoteli, na námestí, v posteli*). For now: learn
*v práci, v škole, doma, v meste, na trhu, na Slovensku* as chunks.
Which places take **na**? Open spaces, events, institutions with 'surface' logic: *na trhu, na
pošte, na stanici, na univerzite, na Slovensku* (!), *na koncerte*.
""", ro="Romanian *în* / *la* split similarly (*în oraș* / *la piață*), and *la* often matches *na*.",
table=[["motion (kam?)","location (kde?)"],["do práce","v práci"],["do školy","v škole"],["do mesta","v meste"],["na trh","na trhu"],["na poštu","na pošte"],["domov","doma"]],
examples=["Som v práci.","Bývam v Bratislave.","Stretneme sa na trhu."])
note("do-vs-v","do + genitive vs v + locative: going vs being","1.7",["case:gen","case:loc","prep:do","prep:v"],
"""
**Motion** into a place: **do** + genitive (*do práce, do školy, do mesta, do kostola*).
**Being** in a place: **v** + locative (*v práci, v škole, v meste, v kostole*).
Same pair with **na**: *na trh* (acc.) vs *na trhu* (loc.). One preposition pair, two cases, the
whole 'where/where to' system. Home is special: **domov** (homewards) / **doma** (at home).
""", ro="*la piață* covers both 'to' and 'at' in Romanian; Slovak forces you to choose. Ask yourself: am I moving?",
examples=["Idem do práce. — Som v práci.","Idem na trh. — Som na trhu.","Idem domov. — Som doma."])
note("possessives","môj, tvoj, náš, váš — and the unchanging jeho, jej, ich","1.12",["pronoun:possessive"],
"""
**môj/moja/moje**, **tvoj/tvoja/tvoje**, **náš/naša/naše**, **váš/vaša/vaše** agree with the
noun. **jeho** (his), **jej** (her), **ich** (their) never change — a gift. **svoj** = 'one's own',
used when the owner is the subject: *Mám svoj mobil* (my own) vs *Mám jeho mobil* (his).
""", ro="Romanian possessives agree too (*meu/mea/mei/mele*); *jeho/jej/ich* are like invariable *lui/ei/lor*.",
table=[["","m","f","n","pl"],["my","môj","moja","moje","moje/moji"],["your","tvoj","tvoja","tvoje","tvoje/tvoji"],["our","náš","naša","naše","naše/naši"],["your (pl)","váš","vaša","vaše","vaše/vaši"]])
note("ten-ta-to","ten / tá / to — this, that, the","1.3",["pronoun:demonstrative"],
"""
Slovak has no articles. **ten (m) / tá (f) / to (n)** do the work of 'that/the'; add **-to** for
'this right here': *tento, táto, toto*. **to** alone is the all-purpose 'it/that': *Čo je to?*,
*To je dobré.* — the single most frequent word in the language.
""", ro="Romanian's definite article is a suffix (*omul*); Slovak has none. You will over-use *ten* at first — natives use it less than you expect.",
examples=["Čo je to?","To je moja žena.","Ten chlap je milý.","Táto káva je dobrá."])
note("question-words","kto, čo, kde, kam, kedy, ako, prečo, koľko","1.7",["question"],
"""
**kto** who · **čo** what · **kde** where (at) · **kam** where (to) · **odkiaľ** from where ·
**kedy** when · **ako** how · **prečo** why · **koľko** how much/many · **aký** what kind ·
**ktorý** which. Yes/no questions need no word — just intonation or verb-first: *Máš čas?*
""", ro="*kde/kam* split 'unde' into location and direction, like German *wo/wohin*. Romanian has one word; Slovak two.",
examples=["Kde si? — Kam ideš?","Koľko to stojí?","Prečo nie?"])
note("nom-pl","Nominative plural: -y, -e, -i, -á","1.11",["number:plural"],
"""
Feminine **-a → -y** (*kávy, ženy*), soft **-e** (*ulice*). Masculine inanimate **-y** (*stoly*),
soft **-e** (*stroje*). Masculine **animate -i** (*bratia, chlapi, študenti*) — with consonant
changes (*Slovák → Slováci*). Neuter **-o → -á** (*autá, pivá*), **-e → -ia** (*srdcia*).
Some words are plural-only: **dvere, okuliare, nohavice, hodinky, Vianoce**.
""", table=[["gender","sg","pl"],["f","káva","kávy"],["m inan.","stôl","stoly"],["m anim.","brat","bratia"],["n","auto","autá"],["plural-only","—","dvere, okuliare"]],
examples=["Kde sú moje okuliare?","Dve kávy, prosím.","Deti spia."])
note("imperative-basic","Imperatives you meet as chunks","1.10",["verb:imperative"],
"""
**Poď! / Poďte!** (come), **Choď! / Choďte!** (go), **Daj! / Dajte!** (give), **Napíš! /
Napíšte!** (write), **Zavolaj! / Zavolajte!** (call), **Počkaj! / Počkajte!** (wait), **Sadni si!
/ Sadnite si!** (sit). The **-te** form is for *vy*. Negative imperatives prefer the imperfective:
*Nerob to!* Systematic rules come in Phase 2; for now these are vocabulary.
""", examples=["Poď sem!","Počkajte, prosím.","Napíš mi."])
note("future-budem","Future with budem + infinitive","1.10",["verb:future"],
"""
*budem, budeš, bude, budeme, budete, budú* + infinitive: **Budem pracovať** (I will work),
**Budeš doma?** For *ísť*: **pôjdem**. Perfective verbs have no *budem* — their present *is* the
future: **Zavolám ti** (I'll call you), **Urobím to** (I'll do it). That is why *Zavolám* and
not *Budem volať*.
""", ro="*voi lucra* ≈ *budem pracovať*. The perfective-present-as-future has no Romanian parallel — it is the aspect system showing through.",
examples=["Budem tam o piatej.","Zavolám ti zajtra.","Pôjdeme na výlet."])
note("reflexive-sa","sa and si — the little words that move","1.9",["reflexive","word-order:clitic"],
"""
Many verbs carry **sa** (oneself) or **si** (to oneself): *volať sa* (be called), *učiť sa*
(learn), *páčiť sa*, *dať si* (have food/drink), *prosiť si*. They are unstressed and sit in
**second position** in the clause, not glued to the verb: *Ako **sa** voláš?*, *Volám **sa**
Dennis*, *Rád **si** dám kávu*.
""", ro="Romanian *se/își* attach to the verb (*se numește*). Slovak *sa/si* float to slot 2 — that is the thing to get used to.",
examples=["Ako sa máš?","Učím sa po slovensky.","Dám si kávu."])
note("clitic-second","Second position: som, si, sa, mi, ho…","2.1",["word-order:clitic"],
"""
Unstressed little words — past auxiliaries (*som, si, sme, ste*), reflexives (*sa, si*), short
pronouns (*mi, ti, mu, ho, ju, ma, ťa*) — go in **second position** in the clause, in this
order: auxiliary → reflexive → dative → accusative. *Včera **som sa ho** pýtal.* Break this and
you are instantly foreign; keep it and you sound native even with mistakes elsewhere.
""", table=[["1st position","clitics (slot 2)","rest"],["Včera","som sa ho","pýtal."],["Ja","som ti","písal."],["Prečo","si sa","neozval?"]],
examples=["Včera som ho videl.","Dal som si kávu.","Páčilo sa mi to."])
note("numbers-0-100","Numbers 0–100","1.5",["numeral"],
"""
0 nula · 1 jeden · 2 dva · 3 tri · 4 štyri · 5 päť · 6 šesť · 7 sedem · 8 osem · 9 deväť ·
10 desať · 11 jedenásť · 12 dvanásť · 13 trinásť · 14 štrnásť · 15 pätnásť · 16 šestnásť ·
17 sedemnásť · 18 osemnásť · 19 devätnásť · 20 dvadsať · 30 tridsať · 40 štyridsať · 50 päťdesiat
· 60 šesťdesiat · 70 sedemdesiat · 80 osemdesiat · 90 deväťdesiat · 100 sto · 1000 tisíc.
Compounds are one word: **dvadsaťpäť, stotridsaťdva**. Phone numbers are read digit by digit.
""", ro="*doi/două* ≈ *dva/dve*; *trei* ≈ *tri*; *sută* ≈ *sto*. Slavic loans make the low numbers feel familiar.")
note("v-vo-s-so-z-zo","v/vo, s/so, z/zo, k/ku — the vowel that appears","1.7",["prep:vocalisation"],
"""
One-consonant prepositions grow a vowel before a hard cluster: **vo štvrtok, vo firme, so
sestrou, so mnou, zo školy, zo Slovenska, ku mne**. It is purely for pronounceability. Say *v
škole* aloud and you will feel why *vo štvrtok* exists.
""", examples=["Vo štvrtok nemám čas.","Idem so sestrou.","Som zo Slovenska."])

# ================================================================= Phase 2 — systematic
note("past-tense","Past tense: l-participle + som/si","2.1",["verb:past"],
"""
Take the infinitive, swap **-ť** for **-l**, agree with the subject's gender/number, add
**som/si/–/sme/ste/–**: *robiť → robil som / robila som / robili sme*. Third person has no
auxiliary: *robil, robila, robili*. **byť**: *bol/bola/boli som/si/…*. **ísť**: *išiel, išla,
išli*. That is the whole past tense — one form for 'I did / I was doing / I have done'.
""", ro="Like *am făcut*: auxiliary + participle. But the Slovak auxiliary is *byť*, it drops in 3rd person, and the participle agrees in gender.",
table=[["","m","f","pl"],["ja","robil som","robila som","—"],["ty","robil si","robila si","—"],["on/ona","robil","robila","robili"],["my","—","—","robili sme"],["vy","—","—","robili ste"]],
examples=["Včera som bol doma.","Kde si bola?","Išli sme na trh."])
note("aspect-intro","Aspect: two verbs for one meaning","2.1",["aspect"],
"""
Most actions come as a **pair**: imperfective (process, habit, duration) and perfective (a
completed, single event). *robiť / urobiť*, *písať / napísať*, *kupovať / kúpiť*, *dávať /
dať*, *hovoriť / povedať*. The imperfective has all three tenses; the perfective has no present —
its present form *means future*. Learn pairs as two vocabulary items, not as a rule.
""", ro="Romanian *scriam* (was writing) vs *am scris* (wrote) hints at it, but Slovak bakes the distinction into the verb itself.",
table=[["imperfective","perfective","idea"],["robiť","urobiť","do / get done"],["písať","napísať","write / write (finish)"],["kupovať","kúpiť","buy (habit) / buy (once)"],["hovoriť","povedať","speak / say"],["ísť","prísť · odísť","go / arrive · leave"]],
examples=["Každý deň píšem kód. — Včera som napísal test.","Kupujem chlieb v pekárni. — Kúpil som chlieb."])
note("perfective-future","Perfective present = future","2.2",["aspect","verb:future"],
"""
*Zavolám* is not 'I call' — it is **'I will call'**. *Urobím to* = I'll do it. *Stretneme sa* =
we'll meet. Perfectives cannot describe the present moment, so their present form is free to
mean the future — and it is the *normal* way to promise or plan a single action.
""", examples=["Zavolám ti zajtra.","Kúpim chlieb.","Uvidíme sa v piatok."])
note("gen-sg","Genitive singular — of, from, without","2.3",["case:gen"],
"""
Endings: **m -a/-u** (*brata, stola, hotela* / many inanimates *-u*: *cukru, roku*), **f -y/-e**
(*kávy, ženy* / soft *ulice*), **n -a** (*piva, mesta*). Triggers: possession (*auto brata*),
**z/zo, od, do, bez, u, okolo, vedľa, blízko**, quantities, numbers 5+, negated existence
(*Nie je tu chleba*).
""", ro="Covers Romanian's genitive (*cartea fratelui*) AND *de/din/fără/de la*. Where Romanian says *fără zahăr*, Slovak says *bez cukru*.",
table=[["gender","nom","gen","example"],["m anim.","brat","brata","kniha brata"],["m inan.","stôl","stola","noha stola"],["f","káva","kávy","bez kávy"],["n","pivo","piva","pohár piva"]],
examples=["Káva bez cukru.","Som z Rumunska.","Idem do práce.","Bývam u kamaráta."])
note("acc-vs-loc-na","na + accusative (where to) vs na + locative (where)","2.4",["case:acc","case:loc","prep:na"],
"""
**na** is the preposition that most clearly shows the motion/location split: *idem **na**
trh* (acc.) / *som **na** trhu* (loc.); *dám to **na** stôl* / *je to **na** stole*. Same with
**pod, nad, pred, za, medzi**: accusative for motion, instrumental for position.
""", table=[["preposition","motion → acc.","position → loc./instr."],["na","na stôl","na stole"],["do / v","do školy (gen.)","v škole (loc.)"],["pod","pod stôl","pod stolom"],["za","za dom","za domom"]],
examples=["Idem na poštu. — Som na pošte.","Polož to na stôl. — Je to na stole."])
note("dat-sg","Dative singular — to whom","2.5",["case:dat"],
"""
Endings: **m -ovi/-u** (*bratovi, Tomášovi* / inanimate *stolu*), **f -e/-i** (*žene, sestre* /
soft *ulici*), **n -u** (*mestu, dieťaťu*). Verbs that take it: *dať, poslať, kúpiť, volať,
telefonovať, odpovedať, pomôcť, veriť, páčiť sa, chutiť* + **k/ku** (towards).
Pronouns: **mi/mne, ti/tebe, mu, jej, nám, vám, im**.
""", ro="Romanian dative *îi dau fratelui* → *dám bratovi*. Romanian's clitic doubling (*îi… fratelui*) is not needed.",
examples=["Zavolám bratovi.","Kúpim mame darček.","Páči sa mi to.","Pomôžeš mi?"])
note("instr-sg","Instrumental — with, by means of","2.6",["case:instr"],
"""
Endings: **m/n -om** (*autom, bratom, pivom*), **f -ou** (*kávou, sestrou, električkou*).
Bare (no preposition) for *means*: *idem **autom** / **električkou** / **vlakom***. With **s/so**
for company: *s kamarátom, so sestrou, s mliekom*. After *pod/nad/pred/za/medzi* for position.
Pronouns: **mnou, tebou, ním, ňou, nami, vami, nimi**.
""", ro="Romanian says *cu mașina, cu prietenul* — one preposition. Slovak drops *s* for means, keeps it for company.",
table=[["","nom","instr"],["m","brat","bratom"],["f","sestra","sestrou"],["n","auto","autom"],["","ja","mnou"]],
examples=["Idem električkou.","Káva s mliekom.","Bývam s kamarátom."])
note("cases-overview","The six cases at a glance","2.6",["case"],
"""
Slovak uses six cases. You have met them in this order because that is the order of need:
""", table=[["case","question","typical use","typical prepositions"],["nominative","kto? čo?","subject; 'X is Y'","—"],["accusative","koho? čo?","object; motion to","na, do (no), pre, cez, za"],["locative","o kom? o čom?","location","v/vo, na, o, pri, po"],["genitive","koho? čoho?","of, from, without, amounts","z/zo, od, do, bez, u, okolo"],["dative","komu? čomu?","to whom; feelings","k/ku"],["instrumental","s kým? s čím?","with, by means of","s/so, pod, nad, pred, za, medzi"]],
ro="Romanian merged these into three; Slovak keeps six but the *logic* (subject, object, of, to) is the same you already use.")
note("adj-agreement","Adjectives agree — dobrý, dobrá, dobré","2.1",["adjective:agreement"],
"""
**-ý (m), -á (f), -é (n)**; plural **-í** (m animate) / **-é** (everything else). Soft adjectives
end in **-í/-ia/-ie** (*cudzí, cudzia, cudzie*). Adjectives then follow the noun through the
cases: *dobrú kávu* (acc.), *v dobrom hoteli* (loc.), *s dobrým kamarátom* (instr.). The
rhythmic rule shortens *-ý* after a long syllable: *krásny*, not *krásný*.
""", ro="Same instinct as *bun/bună/buni/bune* — just with more slots.",
table=[["","m","f","n","pl"],["nom","dobrý","dobrá","dobré","dobrí / dobré"],["acc","dobrého (anim.) / dobrý","dobrú","dobré","dobrých / dobré"],["loc","dobrom","dobrej","dobrom","dobrých"]])
note("comparison","lepší, väčší, viac — comparing","2.7",["adjective:comparison"],
"""
Regular: **-ší / -ejší** (*starší, rýchlejší*). Irregular, and the ones you need: *dobrý →
**lepší***, *zlý → **horší***, *veľký → **väčší***, *malý → **menší***, *veľa → **viac***, *málo
→ **menej***. 'Than' is **ako**. Superlative adds **naj-**: *najlepší*. *rád → **radšej*** (would
rather).
""", ro="*mai bun* → *lepší* is one word; *decât* → *ako*.",
examples=["Toto je lepšie ako to.","Bratislava je väčšia ako Košice.","Radšej kávu."])
note("conditional","by — would, could, I'd like","2.7",["mood:conditional"],
"""
Past participle + **by** + *som/si/–*: **Chcel by som** (I would like — m), **Chcela by som**
(f), **Mohli by ste…?** (could you…?). *by* is a clitic and sits in second position. This is the
polite register for requests beyond *prosím si*.
""", ro="*aș vrea* → *chcel by som*. Same politeness function.",
examples=["Chcel by som izbu na dve noci.","Mohli by ste to zopakovať?","Bolo by to super."])
note("imperative-systematic","Making imperatives","2.8",["verb:imperative"],
"""
From the 3rd-person plural stem: *robia → **rob! robte!***, *idú → **choď!*** (irregular),
*píšu → **píš! píšte!***, *dajú → **daj! dajte!***. Stems ending in two consonants add **-i**:
*sadni si!*, *vezmi!*. *-d/-t/-n/-l* soften: *plať!, príď!*. Irregular: **buď! jedz! poď!
choď!**. Negative imperatives use the **imperfective**: *Nerob to!*, *Nechoď tam!*
""", examples=["Sadnite si.","Otvorte ústa.","Nerob to!","Poďte ďalej."])
note("ktory-relative","ktorý — the man who, the thing that","2.8",["syntax:relative"],
"""
**ktorý/ktorá/ktoré** introduces relative clauses and agrees with the noun it points back to:
*To je kamarát, **ktorý** robí v IT.* *Aplikácia, **ktorú** používam…* (acc. because it is the
object inside its clause). A comma always precedes it.
""", ro="*care* — but Slovak inflects it, so *ktorý/ktorú/ktorému* carry the case of its role in the clause.",
examples=["To je kolega, ktorý býva v Prahe.","Firma, v ktorej pracujem, je malá."])
note("ze-aby-ked","že, aby, keď, lebo — joining clauses","2.2",["syntax:conjunction"],
"""
**že** that (reported) · **aby** so that / in order to (takes the conditional form: *aby som
mohol*) · **keď** when / if (real) · **ak** if · **keby** if (hypothetical) · **lebo /
pretože** because · **preto** therefore · **ale** but · **alebo** or · **či** whether. A comma
before each.
""", ro="*că / ca să / când / dacă / pentru că* — one-to-one, including *aby* needing a subjunctive-like form the way *ca să* does.",
examples=["Myslím, že má pravdu.","Učím sa, aby som rozumel.","Keď mám čas, čítam."])
note("motion-verbs","ísť vs chodiť, and the prefixes","2.4",["verb:motion","aspect"],
"""
**ísť** = go (now, one direction); **chodiť** = go (habitually, back and forth). *Idem do práce*
(I'm on my way) vs *Chodím do práce autom* (I commute by car). Prefixes make perfectives with
direction: **prísť** arrive, **odísť** leave, **prejsť** cross, **vyjsť** go out, **vojsť** go in.
Future of *ísť*: **pôjdem**.
""", ro="No habitual/single split in Romanian — *merg* covers both. The prefixes map to *a veni / a pleca / a traversa / a ieși / a intra*.",
examples=["Idem domov.","Chodím do kostola každú nedeľu.","Prišiel som včera."])
note("plural-cases","Plural cases as recognition","2.6",["number:plural","case"],
"""
You need to *recognise* these long before you produce them. Genitive plural is the hardest and
the most common (after numbers 5+): **m -ov** (*stolov, bratov*), **f/n zero ending, often with
a lengthened vowel** (*žien, kníh, miest, eur, detí*). Dative pl **-om/-ám**, locative pl
**-och/-ách**, instrumental pl **-mi/-ami**.
""", table=[["","m","f","n"],["gen. pl.","bratov","žien","miest"],["dat. pl.","bratom","ženám","mestám"],["loc. pl.","bratoch","ženách","mestách"],["instr. pl.","bratmi","ženami","mestami"]])
note("dates","Dates use the genitive","2.2",["time","case:gen"],
"""
*Dnes je **prvého** septembra* (it is the 1st of September) — ordinal in genitive + month in
genitive. Years: *v roku 2026* (v roku dvetisícdvadsaťšesť). Months: *v januári, vo februári, v
marci…* (locative). Days: *v pondelok…* (accusative). Seasons: *na jar, v lete, na jeseň, v zime*.
""", examples=["Narodil som sa desiateho mája.","Stretneme sa tretieho.","V lete cestujeme."])
note("word-order","Word order: new information last","2.1",["word-order"],
"""
Neutral order is subject–verb–object, but Slovak moves the *important, new* information to the
**end**: *Kávu mám rád* (as for coffee — I like it) vs *Mám rád kávu* (what I like is coffee).
Questions can start with the verb. Clitics stay in slot 2 regardless.
""", ro="Romanian does this too (*Cafeaua o beau dimineața*). Trust the instinct; just keep the clitics in place.")
note("numbers-animate","dvaja, traja, štyria — counting men","2.11",["numeral:animate"],
"""
Masculine *animate* nouns get special numerals for 2–4: **dvaja bratia, traja chlapi, štyria
študenti** (vs *dve ženy, tri deti, štyri autá*). Above 4 it is the normal *päť bratov*.
""")
note("vocative-remnant","Addressing people: mostly nominative","2.11",["case:voc"],
"""
Slovak lost the vocative — you address people in the nominative: *Peter!*, *Pani Nováková!*.
A few frozen forms survive: **Bože!** (God!), **pane** (sir), **synku**, **mami**, **oci**, and
**chlape** (man!) in casual speech.
""")
note("diminutives","-ko, -ka, -ík, -ička: diminutives are everywhere","2.7",["derivation:diminutive"],
"""
Not childish — *neutral and warm*. **kávička** (a coffee), **pivko** (a beer), **chvíľka** (a
moment), **minútka**, **Peťo/Zuzka** (names), **stovka** (a hundred). Ordering *jednu kávičku*
is normal adult speech. Recognise them; start using the food ones.
""", ro="Romanian has *-uț/-iță* but uses them far less. Slovak diminutives are a register, not a size.")
note("vykanie-verbs","vy + plural verb, but singular adjectives","1.1",["register:formal"],
"""
Formal *vy* takes the **plural verb** but the adjective/participle stays **singular** and
agrees with the actual person: *Boli **ste** doma, pani Nováková?* → *Bola ste doma?* is
wrong-sounding to many but standard says **Boli ste** with plural participle. In practice you
will hear both; use *Boli ste*.
""")
note("negative-existence","Nie je / nemám → genitive","2.3",["case:gen","negation"],
"""
When something is *absent*, Slovak often reaches for the genitive: *Nie je tu **chleba**.*
*Nemám **času**.* Colloquially the accusative is also common (*Nemám čas*). Recognise both.
""")
note("verb-govern","Verbs that pick a preposition and case","2.5",["case","prep"],
"""
Some verbs come welded to a preposition + case. Learn them as units: **čakať na** + acc. (wait
for), **pýtať sa na** + acc. (ask about), **myslieť na** + acc., **tešiť sa na** + acc. (look
forward to), **báť sa** + gen. (fear), **ďakovať za** + acc., **platiť za** + acc., **hovoriť o** +
loc., **pripojiť sa na** + acc. (connect to).
""", ro="Romanian *a se gândi la, a aștepta pe/–, a se teme de* — same phenomenon, different pairings.",
examples=["Čakám na autobus.","Teším sa na víkend.","Bojím sa psov."])
note("bavi-zaujima","baví ma, zaujíma ma — impersonal likes","2.8",["verb:liking","case:acc"],
"""
**Baví ma to** (I enjoy it), **Zaujíma ma to** (I'm interested) — the thing is the subject and
*you* are the accusative object. Very common in speech about hobbies and work.
""", ro="*mă interesează* — accusative experiencer, same as Slovak.",
examples=["Baví ma programovanie.","Nezaujíma ma to."])
note("reflexive-passive","sa as a passive: hovorí sa, robí sa","2.8",["reflexive"],
"""
*sa* also makes impersonal/passive statements: **Ako sa to povie?** (how is it said), **Tu sa
nefajčí** (no smoking here), **To sa nerobí** (that isn't done). You will use *Ako sa povie…?*
daily.
""", ro="*se spune, nu se fumează* — identical construction.")
note("czech-radar","Czech words you will hear (recognise, don't copy)","2.10",["czech"],
"""
Czech media saturate Slovakia; natives sprinkle Czech into speech. Recognise: *hodně* (=veľa),
*jo* (=hej), *fakt jo*, *děkuji*, *nevím* (=neviem), *protože* (=lebo). Letters **ř, ě, ů** are
Czech-only — if you see them, it is not Slovak. Ignore for production in v1.
""")
note("register-map","Standard vs. what natives say","1.9",["register"],
"""
Every phrase in this app carries a register chip. **štandard** is what you write and what any
Slovak will accept. **hovorovo** is what you *hear*: *hej* for *áno*, *fajn*, *v pohode*, *fakt*,
*furt*, *robiť* for *pracovať*, *dovi*, clipped *Dobrý*. Learn to understand all of it; produce the
neutral layer first and add colloquial forms as they feel natural. Regional (east) and archaic
forms are marked for recognition only.
""")

def main():
    recs = []
    for n in N:
        recs.append({**n, "level": "A1" if n["unit"].startswith(("0", "1")) else "A2",
                     "source": "authored (research App. A; SAS A1/A2 grammatical minimum, CC BY-NC-SA)",
                     "licence": LICENCES["authored"]["licence"], "attribution": LICENCES["authored"]["attribution"],
                     "review_status": REVIEW_NEEDS})
    out = os.path.join(CONTENT, "grammar_notes.jsonl")
    k = write_jsonl(out, recs)
    a1 = sum(1 for r in recs if r["level"] == "A1")
    print(f"  wrote {k} grammar notes -> {out}   (A1: {a1}, A2: {k-a1})")

if __name__ == "__main__":
    main()
