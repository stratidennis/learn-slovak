"""Romanian versions of the 61 grammar micro-notes: (title_ro, body_ro). Written for a Romanian
reader, so the Romanian analogy is woven into the text rather than appended."""
G = {
"sounds-length": ("Vocalele lungi și scurte schimbă cuvântul", """
Accentul ascuțit (dĺžeň) dublează durata vocalei — nimic altceva nu se schimbă. Lungimea e *sens*:
**pas** (pașaport) vs **pás** (curea), **sud** (butoi) vs **súd** (tribunal). Româna nu are acest
contrast, așa că urechea ta le va pune la început în același sertar. Nu efortul rezolvă asta, ci
expunerea: exercițiul cu perechi minimale rulează până când auzi diferența.
Regula ritmică: rar stau două silabe lungi una lângă alta (**krásny**, nu *krásný*)."""),
"sounds-palatals": ("ď ť ň ľ — și înmuierea ascunsă din de te ne le", """
Patru consoane au un frate „moale”: **d/ď, t/ť, n/ň, l/ľ**. Semnul ˇ (mäkčeň) îl marchează — doar că
înaintea lui **e, i, í, ia, ie, iu** înmuierea e *automată și nescrisă*: **deti** se spune [ďeťi],
**ten** [ťen], **nemám** [ňemám]. Cuvintele străine și câteva excepții rezistă (*teraz* [teras],
*jeden*; demonstrativul *ten* e de fapt dur — ascultă). Vorbitorii de română pun un „i” semivocalic
(*ti-* → *tj*); exercițiul țintește exact asta.
Româna palatalizează c/g înainte de e/i (ce, gi). Slovaca face același truc cu d t n l."""),
"sounds-h-ch": ("h e sonor, ch e h-ul românesc", """
**ch** slovac [x] e h-ul tău din *hartă*. **h** slovac e *sonor* [ɦ] — un sunet cu vibrație pe care
româna nu îl are. Dacă le inversezi, schimbi cuvintele: **hlad** (foame) / **chlad** (frig),
**hodiť** (a arunca) / **chodiť** (a merge). Truc: pune mâna pe gât — h vibrează, ch nu."""),
"sounds-stress": ("Accentul cade mereu pe prima silabă", """
Orice cuvânt slovac e accentuat pe prima silabă: **U**niverzita, **in**formácia, **Bra**tislava,
**Ru**munsko. În română accentul se mută; în slovacă niciodată. O vocală lungă mai încolo în cuvânt e
*lungă*, nu accentuată — **dobrý** e DOB-rii, nu dob-RII. Prepozițiile se lipesc de cuvântul următor
și iau accentul: **na** stole → NA-stole.
Română: univerSItate. Slovacă: Univerzita. Același cuvânt, accentul sare în față."""),
"sounds-diphthongs": ("ia ie iu ô sunt o singură silabă", """
**ia, ie, iu** și **ô** sunt diftongi: o silabă, cu alunecare spre vocală. **piatok** e PIA-tok (două
silabe), **viem**, **kôň** [kuoň], **môj** [muoj]. Niciodată *mo-oj*."""),
"sounds-v": ("v la sfârșit de silabă sună ca u", """
Înaintea unei consoane sau la sfârșit de cuvânt, **v** devine [u̯]: **pravda** → [prau̯da], **krv**
→ [kru̯], **dievča** → [ďieu̯ča]. O vei auzi constant; nu trebuie să o produci perfect."""),
"alphabet-y-i": ("y și i sună la fel", """
**y/ý** și **i/í** se pronunță identic. Litera e aleasă de reguli de ortografie (după consoane dure:
**ty, dy, ny, ly** rămân dure — de aceea există regula înmuierii: **ti** se înmoaie, **ty** nu). Pentru
tine: auzi-le ca o singură vocală, învață ortografiile pe măsură ce le întâlnești și lasă corectorul
să prindă restul."""),
"byt-present": ("byť — a fi", """
Singurul verb pe care trebuie să-l știi la rece. Negația e un *cuvânt separat*, **nie**, nu un prefix —
singurul verb care face asta.
Ca *a fi* în română, e neregulat și pronumele se omite: *som* = *sunt*, fără „ja”."""),
"ty-vy": ("ty sau vy — cui ce", """
**ty** (tykanie) cu prietenii, familia, copiii, oricine ți l-a oferit. **vy** (vykanie) cu străinii,
vânzătorii, funcționarii, persoanele mai în vârstă, colegii până ți se spune altfel. Verbele urmează:
*Ako sa máš?* / *Ako sa máte?*; *Prepáč* / *Prepáčte*. Slovacii trec la *ty* mai repede decât germanii,
dar mai încet decât românii — așteaptă *Môžeme si tykať?*
Exact *tu* / *dumneavoastră*, dar slovaca folosește pur și simplu persoana a II-a plural — fără pronume
special."""),
"neg-prefix": ("Negația: lipești ne- de verb", """
Orice verb în afară de *byť* se neagă cu prefixul **ne-**, scris într-un cuvânt: **nerozumiem,
neviem, nechcem, nemám**. Negațiile duble sunt *obligatorii*: **Nikto nič nevie** (nimeni nu știe
nimic) stivuiește trei negații și înseamnă una.
Româna face la fel: *Nimeni nu știe nimic.* Păstrează instinctul."""),
"po-sky": ("A vorbi o limbă: po slovensky", """
*po* + adjectivul limbii în **-sky/-cky**: **po slovensky, po anglicky, po rumunsky, po nemecky, po
česky**. E adverb („în felul slovac”), deci nu se schimbă niciodată. *Hovorím po slovensky* = vorbesc
slovacă. Substantivul (**slovenčina**) e pentru *učiť sa slovenčinu*."""),
"present-3-patterns": ("Prezentul: trei seturi de terminații", """
Verbele slovace se împart în trei familii de prezent după terminația persoanei I. Odată ce recunoști
**-ám / -ím / -em**, poți conjuga aproape orice întâlnești.
Și româna are grupe de conjugare (-a, -e, -i). Cele slovace sunt mai regulate."""),
"gender-guess": ("Ghicești genul după terminație", """
Trei genuri, și terminația îl dă de gol în ~90% din cazuri: **consoană → masculin** (stôl, muž,
chlieb), **-a → feminin** (žena, káva, kniha), **-o/-e/-ie → neutru** (auto, pivo, srdce, námestie).
Capcane: **-ť/-sť** și **-eň** sunt adesea feminine (*kosť, radosť, pieseň*); câteva cuvinte în **-a**
pentru bărbați sunt masculine (*kolega, turista*). Masculinul se împarte și în **animat** (oameni,
animale) vs **inanimat** — contează la acuzativ și la plural.
Românescul -ă ≈ slovacul -a la feminin; neutrul românesc e ciudat, cel slovac e o clasă adevărată."""),
"acc-sg": ("Acuzativul singular — complementul direct", """
Primul caz de care ai *nevoie*: ce comanzi, cumperi, vezi, ai. Se schimbă doar două lucruri:
**femininul -a → -u** (káva → kávu, žena → ženu) și **masculinul animat primește -a** (brat → brata,
priateľ → priateľa). Restul rămâne ca în dicționar: *Prosím si **čaj** / **pivo** / **chlieb***.
Româna marchează obiectul cu *pe* la persoane (*îl văd pe Petru*). Slovaca îl marchează pe substantiv,
și doar la două grupe."""),
"jeden": ("jeden / jedna / jedno", """
„Unu” se acordă ca un adjectiv: **jeden** stôl (m), **jedna** káva (f), **jedno** pivo (n). La acuzativ:
*Prosím si **jednu** kávu / **jedno** pivo / **jeden** čaj*.
*un / o* — româna te obișnuiește deja să acorzi „unu” cu genul."""),
"euro-count": ("1 euro, 2 eurá, 5 eur — numărăm substantive", """
După **1**: singular (*jedno euro*). După **2, 3, 4**: nominativ plural (*dve eurá, tri minúty, štyri
deti*). De la **5 în sus** (și după *koľko, veľa, pár*): **genitiv plural** (*päť eur, desať minút,
veľa detí*). Asta e regula din spatele fiecărui preț pe care îl vei auzi.
**dva** (m) vs **dve** (f/n): *dva chleby, dve eurá, dve kávy*.
Româna schimbă la 20 (*douăzeci de lei*). Slovaca schimbă la 5 și folosește alt caz."""),
"time-half": ("pol tretej = două și JUMĂTATE", """
Slovaca spune jumătățile de oră prin ora *care vine*: **pol tretej** = jumătate din a treia oră =
**2:30**. *pol druhej* 1:30, *pol štvrtej* 3:30, *pol ôsmej* 7:30. Sferturi: *štvrť na tri* (2:15),
*trištvrte na tri* (2:45). Ore întregi: *o siedmej* (la 7), *o dvanástej*. În vorbire lumea spune și
cifrele: *o pol siedmej* sau *o šiestej tridsať*.
Româna spune *două și jumătate* — ora trecută. Slovaca privește înainte. O lună întreagă vei fi cu o
oră în față."""),
"gen-quantity": ("Genitivul după cantități: pol kila jabĺk", """
Cantitățile și recipientele cer **genitiv**: *kilo **jabĺk***, *pohár **vody***, *veľa **ľudí***,
*trochu **mlieka***, *pol **kila***. Învață acum frazele de piață ca blocuri; genitivul complet vine în
Faza 2.
Româna folosește *de*: *un kilogram DE mere*. Slovaca flexionează substantivul."""),
"mat-rad": ("mať rád vs páčiť sa vs chutiť — trei feluri de „a plăcea”", """
**Mám rád / rada** + acuzativ: o preferință stabilă (oameni, mâncăruri, activități). Se acordă cu
*tine*: *Mám rád kávu* (m) / *Mám rada kávu* (f).
**Páči sa mi** + nominativ: ceva îți pare frumos/atrăgător — prima impresie, aspect, idei. Lucrul e
subiectul; tu ești în dativ.
**Chutí mi**: are gust bun pentru mine. Iar dativ.
*páči sa mi* ESTE *îmi place*: dativul experimentatorului, lucrul ca subiect. *chutí mi* nu are
echivalent direct — gândește-te la *îmi place la gust*."""),
"rad-verb": ("rád + verb: îmi place să", """
*rád* e un adjectiv care înseamnă „bucuros”, iar slovacii îl lipesc de un verb ca să spună „îmi place
să”: **Rád čítam** (m) / **Rada čítam** (f) / **Radi čítame** (noi). Negativul **nerád**: *Nerada
varím*. Se acordă cu *vorbitorul*, nu cu obiectul.
Fără echivalent românesc — *îmi place să citesc* folosește dativul. Slovaca face un adjectiv despre
tine."""),
"dative-experiencer": ("je mi zima, bolí ma — stări fără „eu sunt”", """
Stările fizice folosesc **dativul lui „eu”** (*mi/mne*): **Je mi zima** (mi-e frig), **Je mi zle**,
**Je mi ľúto**. Durerea folosește **acuzativul** (*ma/mňa*): **Bolí ma hlava**. Și dorința: *Chce sa
mi spať*. Tiparul: senzația e subiectul, tu ești cel care o primește.
Identic: *mi-e frig, mi-e rău, mă doare capul.* Unul dintre locurile unde româna ajută direct."""),
"loc-v-na": ("v / na + locativ: unde se află ceva", """
Poziția cere **locativul**, mai ales după **v/vo** (în) și **na** (pe/la). Terminații la singular: **-e**
pentru majoritatea (*v Bratislave, v práci, na stole*), **-u** pentru multe masculine (*v parku, v
byte*), **-i** pentru rădăcini moi (*v hoteli, na námestí, v posteli*). Deocamdată: învață *v práci, v
škole, doma, v meste, na trhu, na Slovensku* ca blocuri.
Care locuri cer **na**? Spații deschise, evenimente, instituții cu logică de „suprafață”: *na trhu, na
pošte, na stanici, na univerzite, na Slovensku* (!), *na koncerte*.
Româna împarte asemănător *în* / *la* (*în oraș* / *la piață*), iar *la* se potrivește adesea cu *na*."""),
"do-vs-v": ("do + genitiv vs v + locativ: a merge vs a fi", """
**Mișcare** spre un loc: **do** + genitiv (*do práce, do školy, do mesta, do kostola*).
**Poziție** într-un loc: **v** + locativ (*v práci, v škole, v meste, v kostole*).
Aceeași pereche cu **na**: *na trh* (acuz.) vs *na trhu* (loc.). O pereche de prepoziții, două cazuri,
tot sistemul „unde / încotro”. Acasă e special: **domov** (spre casă) / **doma** (acasă).
*la piață* acoperă în română și „spre”, și „la”; slovaca te obligă să alegi. Întreabă-te: mă mișc?"""),
"possessives": ("môj, tvoj, náš, váš — și neschimbătoarele jeho, jej, ich", """
**môj/moja/moje**, **tvoj/tvoja/tvoje**, **náš/naša/naše**, **váš/vaša/vaše** se acordă cu
substantivul. **jeho** (al lui), **jej** (al ei), **ich** (al lor) nu se schimbă niciodată — un cadou.
**svoj** = „propriu”, când posesorul e subiectul: *Mám svoj mobil* (al meu) vs *Mám jeho mobil* (al lui).
Posesivele românești se acordă și ele (*meu/mea/mei/mele*); *jeho/jej/ich* sunt ca invariabilele
*lui/ei/lor*."""),
"ten-ta-to": ("ten / tá / to — acesta, acela, „-ul”", """
Slovaca nu are articole. **ten (m) / tá (f) / to (n)** fac treaba lui „acela / -ul”; adaugi **-to**
pentru „acesta de aici”: *tento, táto, toto*. **to** singur e „asta / aia” universal: *Čo je to?*, *To je
dobré.* — cel mai frecvent cuvânt din limbă.
Articolul hotărât românesc e un sufix (*omul*); slovaca nu are niciunul. La început vei folosi *ten*
prea des — nativii îl folosesc mai rar decât te aștepți."""),
"question-words": ("kto, čo, kde, kam, kedy, ako, prečo, koľko", """
**kto** cine · **čo** ce · **kde** unde (poziție) · **kam** încotro · **odkiaľ** de unde · **kedy** când
· **ako** cum · **prečo** de ce · **koľko** cât / câți · **aký** ce fel de · **ktorý** care. Întrebările
da/nu nu au niciun cuvânt special — doar intonația sau verbul pe primul loc: *Máš čas?*
*kde/kam* despart „unde” în poziție și direcție, ca germana *wo/wohin*. Româna are un cuvânt; slovaca
două."""),
"nom-pl": ("Nominativul plural: -y, -e, -i, -á", """
Feminin **-a → -y** (*kávy, ženy*), moale **-e** (*ulice*). Masculin inanimat **-y** (*stoly*), moale
**-e** (*stroje*). Masculin **animat -i** (*bratia, chlapi, študenti*) — cu schimbări de consoană
(*Slovák → Slováci*). Neutru **-o → -á** (*autá, pivá*), **-e → -ia** (*srdcia*).
Unele cuvinte au doar plural: **dvere, okuliare, nohavice, hodinky, Vianoce**."""),
"imperative-basic": ("Imperativele pe care le întâlnești ca blocuri", """
**Poď! / Poďte!** (vino), **Choď! / Choďte!** (du-te), **Daj! / Dajte!** (dă), **Napíš! / Napíšte!**
(scrie), **Zavolaj! / Zavolajte!** (sună), **Počkaj! / Počkajte!** (așteaptă), **Sadni si! / Sadnite
si!** (stai jos). Forma cu **-te** e pentru *vy*. Imperativele negative preferă imperfectivul: *Nerob
to!* Regulile sistematice vin în Faza 2; deocamdată sunt vocabular."""),
"future-budem": ("Viitorul cu budem + infinitiv", """
*budem, budeš, bude, budeme, budete, budú* + infinitiv: **Budem pracovať** (voi lucra), **Budeš doma?**
Pentru *ísť*: **pôjdem**. Verbele perfective nu au *budem* — prezentul lor *este* viitorul: **Zavolám
ti** (te sun), **Urobím to** (o fac). De aceea *Zavolám*, nu *Budem volať*.
*voi lucra* ≈ *budem pracovať*. Prezentul perfectiv ca viitor nu are paralelă în română — e sistemul
aspectului care iese la suprafață."""),
"reflexive-sa": ("sa și si — cuvintele mici care se mută", """
Multe verbe poartă **sa** (pe sine) sau **si** (sieși): *volať sa* (a se numi), *učiť sa* (a învăța),
*páčiť sa*, *dať si* (a lua de mâncat/băut), *prosiť si*. Sunt neaccentuate și stau pe **poziția a
doua** în propoziție, nu lipite de verb: *Ako **sa** voláš?*, *Volám **sa** Dennis*, *Rád **si** dám
kávu*.
Românescul *se/își* se lipește de verb (*se numește*). Slovacul *sa/si* plutește pe locul 2 — cu asta
trebuie să te obișnuiești."""),
"clitic-second": ("Poziția a doua: som, si, sa, mi, ho…", """
Cuvintele mici neaccentuate — auxiliarele de trecut (*som, si, sme, ste*), reflexivele (*sa, si*),
pronumele scurte (*mi, ti, mu, ho, ju, ma, ťa*) — stau pe **poziția a doua** în propoziție, în ordinea:
auxiliar → reflexiv → dativ → acuzativ. *Včera **som sa ho** pýtal.* Încalcă asta și sună instantaneu
străin; respectă-o și suni nativ chiar cu greșeli în altă parte."""),
"numbers-0-100": ("Numerele 0–100", """
0 nula · 1 jeden · 2 dva · 3 tri · 4 štyri · 5 päť · 6 šesť · 7 sedem · 8 osem · 9 deväť · 10 desať · 11
jedenásť · 12 dvanásť · 13 trinásť · 14 štrnásť · 15 pätnásť · 16 šestnásť · 17 sedemnásť · 18 osemnásť
· 19 devätnásť · 20 dvadsať · 30 tridsať · 40 štyridsať · 50 päťdesiat · 60 šesťdesiat · 70 sedemdesiat ·
80 osemdesiat · 90 deväťdesiat · 100 sto · 1000 tisíc.
Compusele sunt un singur cuvânt: **dvadsaťpäť, stotridsaťdva**. Numerele de telefon se citesc cifră cu
cifră.
*doi/două* ≈ *dva/dve*; *trei* ≈ *tri*; *sută* ≈ *sto*. Împrumuturile slave fac numerele mici
familiare."""),
"v-vo-s-so-z-zo": ("v/vo, s/so, z/zo, k/ku — vocala care apare", """
Prepozițiile dintr-o consoană primesc o vocală înaintea unui grup greu: **vo štvrtok, vo firme, so
sestrou, so mnou, zo školy, zo Slovenska, ku mne**. E doar pentru pronunțabilitate. Spune *v škole* cu
voce tare și simți de ce există *vo štvrtok*."""),
"past-tense": ("Trecutul: participiul în -l + som/si", """
Iei infinitivul, schimbi **-ť** cu **-l**, acorzi cu genul/numărul subiectului, adaugi **som/si/–/sme/ste/–**:
*robiť → robil som / robila som / robili sme*. Persoana a III-a nu are auxiliar: *robil, robila,
robili*. **byť**: *bol/bola/boli som/si/…*. **ísť**: *išiel, išla, išli*. Asta e tot trecutul — o
singură formă pentru „am făcut / făceam / am fost făcând”.
Ca *am făcut*: auxiliar + participiu. Dar auxiliarul slovac e *byť*, dispare la persoana a III-a, iar
participiul se acordă în gen."""),
"aspect-intro": ("Aspectul: două verbe pentru un sens", """
Majoritatea acțiunilor vin în **pereche**: imperfectiv (proces, obișnuință, durată) și perfectiv (un
eveniment încheiat, unic). *robiť / urobiť*, *písať / napísať*, *kupovať / kúpiť*, *dávať / dať*,
*hovoriť / povedať*. Imperfectivul are toate cele trei timpuri; perfectivul nu are prezent — forma lui
de prezent *înseamnă viitor*. Învață perechile ca două cuvinte de vocabular, nu ca o regulă.
*scriam* (imperfect) vs *am scris* (perfect) sugerează ideea, dar slovaca o coace direct în verb."""),
"perfective-future": ("Prezentul perfectiv = viitor", """
*Zavolám* nu e „sun” — e **„voi suna”**. *Urobím to* = o voi face. *Stretneme sa* = ne vom întâlni.
Perfectivele nu pot descrie momentul prezent, așa că forma lor de prezent e liberă să însemne viitor —
și e felul *normal* de a promite sau planifica o acțiune unică."""),
"gen-sg": ("Genitivul singular — al, din, fără", """
Terminații: **m -a/-u** (*brata, stola, hotela* / multe inanimate *-u*: *cukru, roku*), **f -y/-e**
(*kávy, ženy* / moale *ulice*), **n -a** (*piva, mesta*). Declanșatori: posesia (*auto brata*), **z/zo,
od, do, bez, u, okolo, vedľa, blízko**, cantitățile, numerele 5+, existența negată (*Nie je tu chleba*).
Acoperă genitivul românesc (*cartea fratelui*) ȘI *de/din/fără/de la*. Unde româna spune *fără zahăr*,
slovaca spune *bez cukru*."""),
"acc-vs-loc-na": ("na + acuzativ (încotro) vs na + locativ (unde)", """
**na** e prepoziția care arată cel mai clar despărțirea mișcare/poziție: *idem **na** trh* (acuz.) /
*som **na** trhu* (loc.); *dám to **na** stôl* / *je to **na** stole*. La fel cu **pod, nad, pred, za,
medzi**: acuzativ pentru mișcare, instrumental pentru poziție."""),
"dat-sg": ("Dativul singular — cui", """
Terminații: **m -ovi/-u** (*bratovi, Tomášovi* / inanimat *stolu*), **f -e/-i** (*žene, sestre* / moale
*ulici*), **n -u** (*mestu, dieťaťu*). Verbe care îl cer: *dať, poslať, kúpiť, volať, telefonovať,
odpovedať, pomôcť, veriť, páčiť sa, chutiť* + **k/ku** (către). Pronume: **mi/mne, ti/tebe, mu, jej,
nám, vám, im**.
Dativul românesc *îi dau fratelui* → *dám bratovi*. Dublarea clitică din română (*îi… fratelui*) nu e
necesară."""),
"instr-sg": ("Instrumentalul — cu, prin", """
Terminații: **m/n -om** (*autom, bratom, pivom*), **f -ou** (*kávou, sestrou, električkou*). Fără
prepoziție pentru *mijloc*: *idem **autom** / **električkou** / **vlakom***. Cu **s/so** pentru
companie: *s kamarátom, so sestrou, s mliekom*. După *pod/nad/pred/za/medzi* pentru poziție. Pronume:
**mnou, tebou, ním, ňou, nami, vami, nimi**.
Româna spune *cu mașina, cu prietenul* — o singură prepoziție. Slovaca renunță la *s* pentru mijloc și
îl păstrează pentru companie."""),
"cases-overview": ("Cele șase cazuri dintr-o privire", """
Slovaca folosește șase cazuri. Le-ai întâlnit în această ordine pentru că asta e ordinea nevoii:
Româna le-a contopit în trei; slovaca păstrează șase, dar *logica* (subiect, obiect, al, cui) e cea pe
care o folosești deja."""),
"adj-agreement": ("Adjectivele se acordă — dobrý, dobrá, dobré", """
**-ý (m), -á (f), -é (n)**; plural **-í** (m animat) / **-é** (restul). Adjectivele moi se termină în
**-í/-ia/-ie** (*cudzí, cudzia, cudzie*). Apoi urmează substantivul prin cazuri: *dobrú kávu* (acuz.),
*v dobrom hoteli* (loc.), *s dobrým kamarátom* (instr.). Regula ritmică scurtează *-ý* după o silabă
lungă: *krásny*, nu *krásný*.
Același instinct ca *bun/bună/buni/bune* — doar cu mai multe căsuțe."""),
"comparison": ("lepší, väčší, viac — comparăm", """
Regulat: **-ší / -ejší** (*starší, rýchlejší*). Neregulate, și exact cele de care ai nevoie: *dobrý →
**lepší***, *zlý → **horší***, *veľký → **väčší***, *malý → **menší***, *veľa → **viac***, *málo →
**menej***. „Decât” e **ako**. Superlativul adaugă **naj-**: *najlepší*. *rád → **radšej*** (mai
degrabă).
*mai bun* → *lepší* e un singur cuvânt; *decât* → *ako*."""),
"conditional": ("by — aș, ai putea, aș dori", """
Participiu trecut + **by** + *som/si/–*: **Chcel by som** (aș dori — m), **Chcela by som** (f), **Mohli
by ste…?** (ați putea…?). *by* e clitic și stă pe poziția a doua. E registrul politicos pentru cereri
peste *prosím si*.
*aș vrea* → *chcel by som*. Aceeași funcție de politețe."""),
"imperative-systematic": ("Cum se formează imperativul", """
De la rădăcina persoanei a III-a plural: *robia → **rob! robte!***, *idú → **choď!*** (neregulat), *píšu
→ **píš! píšte!***, *dajú → **daj! dajte!***. Rădăcinile terminate în două consoane adaugă **-i**:
*sadni si!*, *vezmi!*. *-d/-t/-n/-l* se înmoaie: *plať!, príď!*. Neregulate: **buď! jedz! poď! choď!**.
Imperativele negative folosesc **imperfectivul**: *Nerob to!*, *Nechoď tam!*"""),
"ktory-relative": ("ktorý — omul care, lucrul care", """
**ktorý/ktorá/ktoré** introduce propoziții relative și se acordă cu substantivul la care trimite: *To je
kamarát, **ktorý** robí v IT.* *Aplikácia, **ktorú** používam…* (acuz., fiindcă e obiect în propoziția
lui). Mereu cu virgulă înainte.
*care* — dar slovaca îl flexionează, așa că *ktorý/ktorú/ktorému* poartă cazul rolului din propoziție."""),
"ze-aby-ked": ("že, aby, keď, lebo — legăm propoziții", """
**že** că (relatare) · **aby** ca să / pentru ca (cere forma de condițional: *aby som mohol*) · **keď**
când / dacă (real) · **ak** dacă · **keby** dacă (ipotetic) · **lebo / pretože** pentru că · **preto** de
aceea · **ale** dar · **alebo** sau · **či** dacă (interogativ indirect). Virgulă înaintea fiecăruia.
*că / ca să / când / dacă / pentru că* — unu la unu, inclusiv faptul că *aby* cere o formă specială, ca
*ca să* în română."""),
"motion-verbs": ("ísť vs chodiť, și prefixele", """
**ísť** = a merge (acum, într-o direcție); **chodiť** = a merge (obișnuit, dus-întors). *Idem do práce*
(sunt pe drum) vs *Chodím do práce autom* (fac naveta cu mașina). Prefixele fac perfective cu direcție:
**prísť** a veni, **odísť** a pleca, **prejsť** a traversa, **vyjsť** a ieși, **vojsť** a intra.
Viitorul lui *ísť*: **pôjdem**.
Româna nu desparte obișnuit/unic — *merg* le acoperă pe amândouă. Prefixele corespund cu *a veni / a
pleca / a traversa / a ieși / a intra*."""),
"plural-cases": ("Cazurile la plural, de recunoscut", """
Trebuie să le *recunoști* cu mult înainte să le produci. Genitivul plural e cel mai greu și cel mai
frecvent (după numerele 5+): **m -ov** (*stolov, bratov*), **f/n terminație zero, adesea cu vocala
lungită** (*žien, kníh, miest, eur, detí*). Dativ pl **-om/-ám**, locativ pl **-och/-ách**, instrumental
pl **-mi/-ami**."""),
"dates": ("Datele folosesc genitivul", """
*Dnes je **prvého** septembra* (e 1 septembrie) — ordinal la genitiv + luna la genitiv. Anii: *v roku
2026* (v roku dvetisícdvadsaťšesť). Lunile: *v januári, vo februári, v marci…* (locativ). Zilele: *v
pondelok…* (acuzativ). Anotimpurile: *na jar, v lete, na jeseň, v zime*."""),
"word-order": ("Ordinea cuvintelor: informația nouă la sfârșit", """
Ordinea neutră e subiect–verb–obiect, dar slovaca mută informația *importantă, nouă* la **sfârșit**:
*Kávu mám rád* (cât despre cafea — îmi place) vs *Mám rád kávu* (ceea ce-mi place e cafeaua).
Întrebările pot începe cu verbul. Cliticele rămân pe locul 2 indiferent.
Româna face la fel (*Cafeaua o beau dimineața*). Ai încredere în instinct; doar ține cliticele la locul
lor."""),
"numbers-animate": ("dvaja, traja, štyria — numărăm bărbați", """
Substantivele masculine *animate* au numerale speciale pentru 2–4: **dvaja bratia, traja chlapi,
štyria študenti** (vs *dve ženy, tri deti, štyri autá*). Peste 4 e normalul *päť bratov*."""),
"vocative-remnant": ("Cum te adresezi: mai ales nominativ", """
Slovaca a pierdut vocativul — te adresezi la nominativ: *Peter!*, *Pani Nováková!*. Au supraviețuit
câteva forme înghețate: **Bože!** (Doamne!), **pane** (domnule), **synku**, **mami**, **oci**, și
**chlape** (omule!) în vorbirea relaxată."""),
"diminutives": ("-ko, -ka, -ík, -ička: diminutivele sunt peste tot", """
Nu sunt copilărești — sunt *neutre și calde*. **kávička** (o cafea), **pivko** (o bere), **chvíľka** (o
clipă), **minútka**, **Peťo/Zuzka** (nume), **stovka** (o sută). Să comanzi *jednu kávičku* e vorbire
normală de adult. Recunoaște-le; începe să le folosești pe cele de mâncare.
Româna are *-uț/-iță*, dar le folosește mult mai rar. Diminutivele slovace sunt un registru, nu o
mărime."""),
"vykanie-verbs": ("vy + verb la plural, dar adjectiv la singular", """
*vy* formal ia **verbul la plural**, dar adjectivul/participiul rămâne la **singular** și se acordă cu
persoana reală: *Boli **ste** doma, pani Nováková?* Standardul cere **Boli ste** cu participiu la plural;
în practică vei auzi ambele — folosește *Boli ste*."""),
"negative-existence": ("Nie je / nemám → genitiv", """
Când ceva *lipsește*, slovaca recurge adesea la genitiv: *Nie je tu **chleba**.* *Nemám **času**.*
Colocvial e frecvent și acuzativul (*Nemám čas*). Recunoaște-le pe ambele."""),
"verb-govern": ("Verbe care își aleg prepoziția și cazul", """
Unele verbe vin sudate cu o prepoziție + caz. Învață-le ca unități: **čakať na** + acuz. (a aștepta),
**pýtať sa na** + acuz. (a întreba despre), **myslieť na** + acuz., **tešiť sa na** + acuz. (a aștepta
cu nerăbdare), **báť sa** + gen. (a se teme), **ďakovať za** + acuz., **platiť za** + acuz., **hovoriť
o** + loc., **pripojiť sa na** + acuz. (a se conecta la).
Româna: *a se gândi la, a aștepta, a se teme de* — același fenomen, alte perechi."""),
"bavi-zaujima": ("baví ma, zaujíma ma — „îmi place” impersonal", """
**Baví ma to** (mă distrează / îmi place), **Zaujíma ma to** (mă interesează) — lucrul e subiectul, iar
*tu* ești obiectul în acuzativ. Foarte frecvent când vorbești despre hobby-uri și muncă.
*mă interesează* — experimentator în acuzativ, exact ca în slovacă."""),
"reflexive-passive": ("sa ca pasiv: hovorí sa, robí sa", """
*sa* face și enunțuri impersonale/pasive: **Ako sa to povie?** (cum se spune), **Tu sa nefajčí** (aici
nu se fumează), **To sa nerobí** (asta nu se face). *Ako sa povie…?* îl vei folosi zilnic.
*se spune, nu se fumează* — construcție identică."""),
"czech-radar": ("Cuvinte cehe pe care le vei auzi (recunoaște, nu copia)", """
Media cehă saturează Slovacia; nativii presară cehă în vorbire. Recunoaște: *hodně* (=veľa), *jo* (=hej),
*fakt jo*, *děkuji*, *nevím* (=neviem), *protože* (=lebo). Literele **ř, ě, ů** sunt doar cehe — dacă le
vezi, nu e slovacă. În v1 ignoră-le la producere."""),
"register-map": ("Standard vs. ce spun nativii", """
Fiecare expresie din aplicație poartă o etichetă de registru. **standard** e ce scrii și ce acceptă
orice slovac. **colocvial** e ce *auzi*: *hej* pentru *áno*, *fajn*, *v pohode*, *fakt*, *furt*, *robiť*
pentru *pracovať*, *dovi*, *Dobrý* scurtat. Învață să înțelegi tot; produce întâi stratul neutru și
adaugă formele colocviale pe măsură ce le simți firești. Formele regionale (est) și arhaice sunt
marcate doar pentru recunoaștere."""),
}

# Table cells: English labels -> Romanian. Slovak forms pass through untouched (they are not here).
TABLE_CELL_RO = {
 "gender": "gen", "example": "exemplu", "examples": "exemple", "nominative": "nominativ", "accusative": "acuzativ", "genitive": "genitiv",
 "dative": "dativ", "locative": "locativ", "instrumental": "instrumental", "nom": "nom", "gen": "gen", "acc": "acuz", "loc": "loc", "instr": "instr",
 "pl": "pl", "sg": "sg", "nom. sg.": "nom. sg.", "nom. pl.": "nom. pl.", "gen. pl.": "gen. pl.", "dat. pl.": "dat. pl.", "loc. pl.": "loc. pl.", "instr. pl.": "instr. pl.",
 "m": "m", "f": "f", "n": "n", "m inan.": "m inanim.", "m anim.": "m anim.", "m animate": "m animat", "m inanimate": "m inanimat", "f -a": "f -a", "usually f": "de obicei f",
 "automatic": "automat", "short": "scurt", "long": "lung", "meaning shifts": "sensul se schimbă", "written": "scris", "said": "pronunțat", "note": "notă",
 "passport → belt": "pașaport → curea", "barrel → court": "butoi → tribunal", "villa → fairy": "vilă → zână", "row → glad": "rând → bucuros",
 "ľ written, ď automatic": "ľ scris, ď automat", "ten (that)": "ten (acela)", "exception — hard": "excepție — dur",
 "hlad — hunger": "hlad — foame", "chlad — cold": "chlad — frig", "hora — mountain": "hora — munte", "chorý — sick": "chorý — bolnav",
 "hodiť — throw": "hodiť — a arunca", "chodiť — walk": "chodiť — a merge", "spelling": "ortografie", "sound": "sunet",
 "affirmative": "afirmativ", "negative": "negativ", "ending": "terminație", "-consonant": "-consoană",
 "chlieb (same)": "chlieb (la fel)", "pivo (same)": "pivo (la fel)", "count": "număr", "form": "formă",
 "structure": "structură", "when": "când", "I + acc.": "eu + acuz.", "lasting preference": "preferință durabilă", "X + dat. me": "X + eu la dativ",
 "impression, looks": "impresie, aspect", "taste": "gust", "motion (kam?)": "mișcare (kam?)", "location (kde?)": "poziție (kde?)",
 "my": "meu", "your": "tău", "our": "nostru", "your (pl)": "vostru / dvs.", "plural-only": "doar plural",
 "1st position": "poziția 1", "clitics (slot 2)": "clitice (locul 2)", "rest": "restul",
 "ja": "ja", "ty": "ty", "vy": "vy", "oni": "oni", "on": "on", "on/ona/ono": "on/ona/ono", "on/ona": "on/ona",
 "imperfective": "imperfectiv", "perfective": "perfectiv", "idea": "ideea", "do / get done": "a face / a termina de făcut",
 "write / write (finish)": "a scrie / a scrie (până la capăt)", "buy (habit) / buy (once)": "a cumpăra (obicei) / a cumpăra (o dată)",
 "speak / say": "a vorbi / a spune", "go / arrive · leave": "a merge / a veni · a pleca",
 "preposition": "prepoziție", "motion → acc.": "mișcare → acuz.", "position → loc./instr.": "poziție → loc./instr.", "do školy (gen.)": "do školy (gen.)", "v škole (loc.)": "v škole (loc.)",
 "case": "caz", "question": "întrebare", "typical use": "uz tipic", "typical prepositions": "prepoziții tipice",
 "subject; 'X is Y'": "subiect; „X este Y”", "object; motion to": "obiect; mișcare spre", "na, do (no), pre, cez, za": "na, do (nu), pre, cez, za",
 "location": "poziție", "of, from, without, amounts": "al, din, fără, cantități", "to whom; feelings": "cui; stări", "with, by means of": "cu, prin",
 "dobrého (anim.) / dobrý": "dobrého (anim.) / dobrý", "—": "—", "": "",
}
