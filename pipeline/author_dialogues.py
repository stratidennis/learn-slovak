#!/usr/bin/env python3
"""Hand-authored two-line exchanges -> content/dialogues.jsonl  (the "pick the reply" step).

Each exchange is one line A (the other person) and one line B (the coherent reply). The lesson
engine shows A and asks the learner to pick B from four replies of the same unit
(curriculum/LEARNING-ENGINE.md §2, kind "dialogue"). A is spoken by the unit's *other* voice, B by
the unit's own voice, so the two speakers are always distinguishable (D124).

Sources: the unit's own chunks (content/chunks.jsonl) plus the minimum of new material a real
exchange needs — every new word appears with its meaning in the intro step. Spoken register as in
SPOKEN-SLOVAK.md. Drafts until a native signs them off.

    .venv/bin/python -m pipeline.author_dialogues
"""
from __future__ import annotations
import os, re
from .common import CONTENT, LICENCES, REVIEW_NEEDS, write_jsonl

D = []
def d(unit, a, b, note=None, note_ro=None):
    """a, b = (sk, ro, en)."""
    D.append(dict(unit=unit, a=dict(sk=a[0], ro=a[1], en=a[2]), b=dict(sk=b[0], ro=b[1], en=b[2]), note=note, note_ro=note_ro))

# ------------------------------------------------------------------ 0.5 first twenty chunks
U = "0.5"
d(U, ("Dobrý deň.", "Bună ziua.", "Good day."), ("Dobrý deň.", "Bună ziua.", "Good day."),
  "A greeting is returned as it came.", "Salutul se întoarce așa cum a venit.")
d(U, ("Ďakujem.", "Mulțumesc.", "Thank you."), ("Prosím.", "Cu plăcere.", "You're welcome."),
  "Prosím answers thanks too — the same word as 'please'.", "Prosím răspunde și la mulțumiri — același cuvânt ca „te rog”.")
d(U, ("Ahoj!", "Salut!", "Hi!"), ("Ahoj!", "Salut!", "Hi!"))
d(U, ("Dobrú chuť.", "Poftă bună.", "Enjoy your meal."), ("Ďakujem.", "Mulțumesc.", "Thank you."))
d(U, ("Dobrú noc.", "Noapte bună.", "Good night."), ("Dobrú noc.", "Noapte bună.", "Good night."))
d(U, ("Rozumiete?", "Înțelegeți?", "Do you understand?"), ("Nerozumiem. Pomalšie, prosím.", "Nu înțeleg. Mai încet, vă rog.", "I don't understand. Slower, please."),
  "The sentence you will use most in your first month.", "Propoziția pe care o vei folosi cel mai des în prima lună.")

# ------------------------------------------------------------------ 1.1 hello, sorry, thanks
U = "1.1"
d(U, ("Dobré ráno!", "Bună dimineața!", "Good morning!"), ("Dobré ráno!", "Bună dimineața!", "Good morning!"))
d(U, ("Ďakujem pekne.", "Mulțumesc mult.", "Thanks a lot."), ("Nemáte za čo.", "Nu aveți pentru ce.", "You're welcome. (formal)"),
  "Nemáte za čo to someone you address as vy; Nemáš za čo to a friend.", "Nemáte za čo cuiva căruia îi spui „vy”; Nemáš za čo unui prieten.")
d(U, ("Prepáčte!", "Scuzați-mă!", "Sorry!"), ("Nič sa nestalo.", "Nu s-a întâmplat nimic.", "No harm done."),
  "The standard answer to an apology.", "Răspunsul standard la o scuză.")
d(U, ("Na zdravie!", "Noroc!", "Cheers!"), ("Na zdravie!", "Noroc!", "Cheers!"))
d(U, ("Dovidenia!", "La revedere!", "Goodbye!"), ("Dovidenia, majte sa pekne!", "La revedere, toate cele bune!", "Goodbye, take care!"))
d(U, ("Ja som Peter. Teší ma.", "Eu sunt Peter. Încântat.", "I'm Peter. Nice to meet you."), ("Aj mňa.", "Și pe mine.", "Likewise."),
  "Aj mňa = 'me too' — the whole reply.", "Aj mňa = „și pe mine” — tot răspunsul.")
d(U, ("Vitajte! Poďte ďalej.", "Bine ați venit! Intrați.", "Welcome! Come in."), ("Ďakujem.", "Mulțumesc.", "Thank you."))

# ------------------------------------------------------------------ 1.2 I don't understand
U = "1.2"
d(U, ("Hovoríte po slovensky?", "Vorbiți slovacă?", "Do you speak Slovak?"), ("Len trochu. Učím sa.", "Doar puțin. Învăț.", "Only a little. I'm learning."))
d(U, ("Rozumiete?", "Înțelegeți?", "Do you understand?"), ("Nie, nerozumiem. Ešte raz, prosím.", "Nu, nu înțeleg. Încă o dată, vă rog.", "No, I don't understand. Once more, please."))
d(U, ("Hovoríte po anglicky?", "Vorbiți engleză?", "Do you speak English?"), ("Áno, hovorím po anglicky a po rumunsky.", "Da, vorbesc engleză și română.", "Yes, I speak English and Romanian."))
d(U, ("Ako sa to povie po slovensky?", "Cum se spune asta în slovacă?", "How do you say this in Slovak?"), ("Neviem. Som cudzinec.", "Nu știu. Sunt străin.", "I don't know. I'm a foreigner."))
d(U, ("Rozumiete, čo hovorím?", "Înțelegeți ce spun?", "Do you understand what I'm saying?"), ("Rozumiem, ale pomalšie, prosím.", "Înțeleg, dar mai încet, vă rog.", "I understand, but slower, please."))
d(U, ("Môžem vám pomôcť?", "Pot să vă ajut?", "Can I help you?"), ("Áno, prosím. Môžete to napísať?", "Da, vă rog. Puteți să scrieți?", "Yes, please. Can you write it down?"))

# ------------------------------------------------------------------ 1.3 who I am
U = "1.3"
d(U, ("Ako sa voláte?", "Cum vă numiți?", "What's your name?"), ("Volám sa Dennis.", "Mă numesc Dennis.", "My name is Dennis."))
d(U, ("Odkiaľ ste?", "De unde sunteți?", "Where are you from?"), ("Som z Rumunska.", "Sunt din România.", "I'm from Romania."))
d(U, ("Kde bývate?", "Unde locuiți?", "Where do you live?"), ("Bývam v Bratislave.", "Locuiesc în Bratislava.", "I live in Bratislava."))
d(U, ("Čo robíte?", "Cu ce vă ocupați?", "What do you do?"), ("Pracujem ako programátor.", "Lucrez ca programator.", "I work as a programmer."))
d(U, ("Koľko máte rokov?", "Câți ani aveți?", "How old are you?"), ("Mám tridsať rokov.", "Am treizeci de ani.", "I'm thirty."))
d(U, ("Pracujete z domu?", "Lucrați de acasă?", "Do you work from home?"), ("Áno, pracujem z domu.", "Da, lucrez de acasă.", "Yes, I work from home."))

# ------------------------------------------------------------------ 1.4 coffee
U = "1.4"
d(U, ("Dobrý deň, čo si dáte?", "Bună ziua, ce doriți?", "Good day, what will you have?"), ("Prosím si kávu.", "Aș dori o cafea.", "I'd like a coffee."))
d(U, ("S mliekom?", "Cu lapte?", "With milk?"), ("S mliekom, bez cukru.", "Cu lapte, fără zahăr.", "With milk, no sugar."))
d(U, ("Tu alebo so sebou?", "Aici sau la pachet?", "Here or to go?"), ("So sebou, prosím.", "La pachet, vă rog.", "To go, please."))
d(U, ("Ešte niečo?", "Încă ceva?", "Anything else?"), ("Nie, to je všetko.", "Nu, asta e tot.", "No, that's all."))
d(U, ("Dve eurá päťdesiat.", "Doi euro cincizeci.", "Two euros fifty."), ("Kartou, prosím.", "Cu cardul, vă rog.", "By card, please."))
d(U, ("Chutilo vám?", "V-a plăcut?", "Did you enjoy it?"), ("Áno, bolo to výborné.", "Da, a fost excelent.", "Yes, it was excellent."))
d(U, ("Platíte spolu alebo zvlášť?", "Plătiți împreună sau separat?", "Paying together or separately?"), ("Spolu, prosím.", "Împreună, vă rog.", "Together, please."),
  "Every waiter asks this; zvlášť = separately.", "Orice chelner întreabă asta; zvlášť = separat.")

# ------------------------------------------------------------------ 1.5 numbers, prices, time
U = "1.5"
d(U, ("Koľko je hodín?", "Cât e ceasul?", "What time is it?"), ("Je pol tretej.", "E două și jumătate.", "It's half past two."))
d(U, ("O koľkej sa stretneme?", "La ce oră ne întâlnim?", "What time shall we meet?"), ("O siedmej.", "La șapte.", "At seven."))
d(U, ("Koľko to stojí?", "Cât costă?", "How much is it?"), ("Dve eurá päťdesiat.", "Doi euro cincizeci.", "Two euros fifty."))
d(U, ("Aké je vaše telefónne číslo?", "Care e numărul dumneavoastră de telefon?", "What's your phone number?"),
  ("Nula deväť jeden dva, tri štyri päť, šesť sedem osem.", "Zero nouă unu doi, trei patru cinci, șase șapte opt.", "Zero nine one two, three four five, six seven eight."),
  "Digit by digit is always understood.", "Cifră cu cifră e mereu înțeles.")
d(U, ("Koľko chcete?", "Cât doriți?", "How much do you want?"), ("Dvadsať deka šunky, prosím.", "Două sute de grame de șuncă, vă rog.", "Two hundred grams of ham, please."))
d(U, ("Máte drobné?", "Aveți mărunt?", "Do you have change?"), ("Mám len stovku.", "Am doar o sută.", "I only have a hundred."))

# ------------------------------------------------------------------ 1.6 the market
U = "1.6"
d(U, ("Nech sa páči, čo to bude?", "Poftiți, ce să fie?", "Yes please, what will it be?"), ("Prosím si pol kila jabĺk.", "Aș dori jumătate de kilogram de mere.", "Half a kilo of apples, please."))
d(U, ("Ešte niečo?", "Încă ceva?", "Anything else?"), ("Nie, to je všetko, ďakujem.", "Nu, asta e tot, mulțumesc.", "No, that's all, thank you."))
d(U, ("Sú sladké?", "Sunt dulci?", "Are they sweet?"), ("Môžem ochutnať?", "Pot să gust?", "May I taste one?"))
d(U, ("Tri eurá za kilo.", "Trei euro kilogramul.", "Three euros a kilo."), ("Dobre, dajte mi kilo.", "Bine, dați-mi un kilogram.", "Fine, give me a kilo."))
d(U, ("Sú domáce, od nás z dvora.", "Sunt de casă, de la noi din curte.", "They're homemade, from our own yard."), ("Super. Dajte mi desať.", "Super. Dați-mi zece.", "Great. Give me ten."))
d(U, ("Chcete vrecko?", "Doriți o pungă?", "Do you want a bag?"), ("Nie, ďakujem, mám tašku.", "Nu, mulțumesc, am o plasă.", "No thanks, I have a bag."))

# ------------------------------------------------------------------ 1.7 where is…?
U = "1.7"
d(U, ("Prepáčte, kde sú toalety?", "Scuzați-mă, unde e toaleta?", "Excuse me, where are the toilets?"), ("Rovno a potom doľava.", "Drept înainte și apoi la stânga.", "Straight on, then left."))
d(U, ("Je to ďaleko?", "E departe?", "Is it far?"), ("Nie, päť minút pešo.", "Nu, cinci minute pe jos.", "No, five minutes on foot."))
d(U, ("Kam ideš?", "Unde te duci?", "Where are you going?"), ("Idem do práce.", "Merg la muncă.", "I'm going to work."))
d(U, ("Kde si?", "Unde ești?", "Where are you?"), ("Som v práci.", "Sunt la muncă.", "I'm at work."),
  "kam → do (movement), kde → v (position).", "kam → do (mișcare), kde → v (poziție).")
d(U, ("Ako sa dostanem na stanicu?", "Cum ajung la gară?", "How do I get to the station?"), ("Choďte rovno, stanica je tam.", "Mergeți drept, gara e acolo.", "Go straight, the station is there."))
d(U, ("Kde je centrum?", "Unde e centrul?", "Where is the centre?"), ("Tam. Doprava a rovno.", "Acolo. La dreapta și drept înainte.", "There. Right, then straight on."))
d(U, ("Ktorá zastávka?", "Care stație?", "Which stop?"), ("Ďalšia. Vystupujeme.", "Următoarea. Coborâm.", "The next one. We're getting off."))

# ------------------------------------------------------------------ 1.8 my day
U = "1.8"
d(U, ("Čo robíš cez víkend?", "Ce faci în weekend?", "What are you doing at the weekend?"), ("Nič moc. Rád čítam.", "Nimic special. Îmi place să citesc.", "Not much. I like reading."))
d(U, ("Máš čas?", "Ai timp?", "Do you have time?"), ("Dnes nemám čas. Prepáč.", "Azi nu am timp. Scuze.", "I don't have time today. Sorry."))
d(U, ("Kedy vstávaš?", "Când te trezești?", "When do you get up?"), ("Ráno vstávam o siedmej.", "Dimineața mă trezesc la șapte.", "I get up at seven in the morning."))
d(U, ("Ako často piješ kávu?", "Cât de des bei cafea?", "How often do you drink coffee?"), ("Každý deň.", "În fiecare zi.", "Every day."))
d(U, ("Ideš už spať?", "Te duci deja la culcare?", "Going to bed already?"), ("Áno, idem spať. Dobrú noc.", "Da, mă duc la culcare. Noapte bună.", "Yes, I'm going to bed. Good night."))
d(U, ("Kedy máš čas? V pondelok?", "Când ai timp? Luni?", "When do you have time? Monday?"), ("V pondelok nie. Cez víkend.", "Luni nu. În weekend.", "Not Monday. At the weekend."))

# ------------------------------------------------------------------ 1.9 likes, feelings, small talk
U = "1.9"
d(U, ("Ahoj! Ako sa máš?", "Salut! Ce mai faci?", "Hi! How are you?"), ("Dobre, ďakujem. A ty?", "Bine, mulțumesc. Tu?", "Fine, thanks. And you?"))
d(U, ("Páči sa ti Bratislava?", "Îți place Bratislava?", "Do you like Bratislava?"), ("Áno, veľmi sa mi páči.", "Da, îmi place foarte mult.", "Yes, I like it a lot."))
d(U, ("Máš rád kávu?", "Îți place cafeaua?", "Do you like coffee?"), ("Áno, mám rád kávu.", "Da, îmi place cafeaua.", "Yes, I like coffee."))
d(U, ("Čo je? Si v pohode?", "Ce e? Ești ok?", "What's up? You okay?"), ("Bolí ma hlava.", "Mă doare capul.", "I have a headache."))
d(U, ("Mám nové auto!", "Am mașină nouă!", "I have a new car!"), ("Fakt? To je super!", "Serios? E super!", "Really? That's great!"))
d(U, ("Nemôžem prísť, som chorý.", "Nu pot veni, sunt bolnav.", "I can't come, I'm ill."), ("To je škoda.", "Păcat.", "That's a pity."))
d(U, ("Mám dnes narodeniny.", "Azi e ziua mea.", "It's my birthday today."), ("Všetko najlepšie!", "La mulți ani!", "Happy birthday!"))
d(U, ("Ideme na pivo?", "Mergem la o bere?", "Shall we go for a beer?"), ("Dobrý nápad!", "Bună idee!", "Good idea!"))

# ------------------------------------------------------------------ 1.10 phone & messages
U = "1.10"
d(U, ("Haló?", "Alo?", "Hello?"), ("Ahoj, tu je Dennis.", "Salut, sunt Dennis.", "Hi, it's Dennis."),
  "Tu je … = 'this is …' on the phone.", "Tu je … = „sunt …” la telefon.")
d(U, ("Kde si? Meškáš.", "Unde ești? Întârzii.", "Where are you? You're late."), ("Prepáč, som na ceste. Budem tam o desať minút.", "Scuze, sunt pe drum. Ajung în zece minute.", "Sorry, I'm on my way. I'll be there in ten minutes."))
d(U, ("Nepočujem ťa.", "Nu te aud.", "I can't hear you."), ("Moment, mám slabý signál.", "Un moment, am semnal slab.", "One moment, I have a weak signal."))
d(U, ("Môžeš mi to poslať?", "Poți să mi-l trimiți?", "Can you send it to me?"), ("Áno, hneď ti to pošlem.", "Da, ți-l trimit imediat.", "Yes, I'll send it right away."))
d(U, ("Zavoláš mi neskôr?", "Mă suni mai târziu?", "Will you call me later?"), ("Áno, ozvem sa.", "Da, dau un semn.", "Yes, I'll be in touch."))
d(U, ("Musím ísť. Dopočutia!", "Trebuie să plec. La revedere!", "I have to go. Bye!"), ("Dopočutia, maj sa.", "La revedere, ai grijă de tine.", "Bye, take care."))

# ------------------------------------------------------------------ 1.11 home & things
U = "1.11"
d(U, ("Je tu wifi?", "E wifi aici?", "Is there wifi here?"), ("Áno, heslo je tu.", "Da, parola e aici.", "Yes, the password is here."))
d(U, ("Kde je nabíjačka?", "Unde e încărcătorul?", "Where's the charger?"), ("Na stole.", "Pe masă.", "On the table."))
d(U, ("Môžem si sadnúť?", "Pot să mă așez?", "May I sit down?"), ("Samozrejme, sadnite si.", "Desigur, luați loc.", "Of course, sit down."))
d(U, ("Nefunguje to.", "Nu funcționează.", "It doesn't work."), ("Skúste to ešte raz.", "Încercați încă o dată.", "Try once more."))
d(U, ("Kde je kúpeľňa?", "Unde e baia?", "Where's the bathroom?"), ("Hore. Prvé dvere doprava.", "Sus. Prima ușă la dreapta.", "Upstairs. First door on the right."))
d(U, ("Je to tvoje?", "E al tău?", "Is this yours?"), ("Áno, je to moje.", "Da, e al meu.", "Yes, it's mine."))

# ------------------------------------------------------------------ 1.12 family & people
U = "1.12"
d(U, ("Máš brata?", "Ai frate?", "Do you have a brother?"), ("Áno, mám brata a sestru.", "Da, am un frate și o soră.", "Yes, I have a brother and a sister."))
d(U, ("Máte deti?", "Aveți copii?", "Do you have children?"), ("Áno, mám dve deti.", "Da, am doi copii.", "Yes, I have two children."))
d(U, ("Kto je to?", "Cine e?", "Who is that?"), ("Toto je môj kamarát Peter.", "Acesta e prietenul meu Peter.", "This is my friend Peter."))
d(U, ("Aký je?", "Cum e?", "What's he like?"), ("Je milý.", "E drăguț.", "He's nice."))
d(U, ("Koľko má rokov tvoj brat?", "Câți ani are fratele tău?", "How old is your brother?"), ("Má dvadsaťpäť.", "Are douăzeci și cinci.", "He's twenty-five."))
d(U, ("Bývaš sám?", "Locuiești singur?", "Do you live alone?"), ("Nie, bývam s rodinou.", "Nu, locuiesc cu familia.", "No, I live with my family."))

# ------------------------------------------------------------------ 1.13 Sunday
U = "1.13"
d(U, ("Pochválen buď Ježiš Kristus.", "Lăudat fie Iisus Hristos.", "Praised be Jesus Christ."), ("Naveky, amen.", "În veci, amin.", "Forever, amen."),
  "The Catholic greeting and its fixed answer.", "Salutul catolic și răspunsul lui fix.")
d(U, ("Pokoj vám.", "Pace vouă.", "Peace be with you."), ("Pokoj s tebou.", "Pace și cu tine.", "Peace be with you too."))
d(U, ("Ideš dnes na omšu?", "Mergi azi la liturghie?", "Are you going to Mass today?"), ("Áno, ideme na omšu o desiatej.", "Da, mergem la liturghie la zece.", "Yes, we're going to the ten o'clock Mass."))
d(U, ("Nech sa páči.", "Poftiți.", "Here you are."), ("Pán Boh zaplať.", "Dumnezeu să vă răsplătească.", "May God repay you. (heartfelt thanks)"))
d(U, ("Požehnanú nedeľu!", "Duminică binecuvântată!", "Blessed Sunday!"), ("Ďakujem, aj vám.", "Mulțumesc, și dumneavoastră.", "Thank you, you too."))
d(U, ("Modlím sa za teba.", "Mă rog pentru tine.", "I'm praying for you."), ("Ďakujem. Nech ťa Pán Boh požehná.", "Mulțumesc. Dumnezeu să te binecuvânteze.", "Thank you. God bless you."))

# ------------------------------------------------------------------ 2.1 yesterday
U = "2.1"
d(U, ("Čo si robil včera?", "Ce ai făcut ieri?", "What did you do yesterday?"), ("Bol som v práci.", "Am fost la muncă.", "I was at work."))
d(U, ("Bol si cez víkend doma?", "Ai fost acasă în weekend?", "Were you home at the weekend?"), ("Nie, bol som v Bratislave.", "Nu, am fost în Bratislava.", "No, I was in Bratislava."))
d(U, ("Videl si ten film?", "Ai văzut filmul ăla?", "Did you see that film?"), ("Áno, videl som ho včera.", "Da, l-am văzut ieri.", "Yes, I saw it yesterday."))
d(U, ("Kde ste boli?", "Unde ați fost?", "Where were you?"), ("Boli sme na trhu.", "Am fost la piață.", "We were at the market."))
d(U, ("Už si jedol?", "Ai mâncat deja?", "Have you eaten yet?"), ("Áno, už som jedol.", "Da, am mâncat deja.", "Yes, I've already eaten."))

# ------------------------------------------------------------------ 2.2 tomorrow
U = "2.2"
d(U, ("Čo budeš robiť zajtra?", "Ce faci mâine?", "What will you do tomorrow?"), ("Zajtra budem pracovať.", "Mâine lucrez.", "Tomorrow I'll be working."))
d(U, ("Stretneme sa o siedmej?", "Ne întâlnim la șapte?", "Shall we meet at seven?"), ("Jasné, prídem o siedmej.", "Sigur, vin la șapte.", "Sure, I'll come at seven."))
d(U, ("Pôjdeš zajtra na trh?", "Te duci mâine la piață?", "Will you go to the market tomorrow?"), ("Áno, pôjdem ráno.", "Da, mă duc dimineața.", "Yes, I'll go in the morning."))
d(U, ("Kedy mi zavoláš?", "Când mă suni?", "When will you call me?"), ("Zavolám ti večer.", "Te sun seara.", "I'll call you this evening."))
d(U, ("Máš zajtra čas?", "Ai timp mâine?", "Do you have time tomorrow?"), ("Zajtra nie, ale v piatok áno.", "Mâine nu, dar vineri da.", "Not tomorrow, but Friday yes."))

# ------------------------------------------------------------------ 2.3 whose, of what (genitive)
U = "2.3"
d(U, ("Čí je to kľúč?", "A cui e cheia asta?", "Whose key is this?"), ("To je kľúč od auta.", "E cheia de la mașină.", "That's the car key."))
d(U, ("Odkiaľ je tá káva?", "De unde e cafeaua asta?", "Where is this coffee from?"), ("Z Talianska.", "Din Italia.", "From Italy."))
d(U, ("Chceš kávu bez mlieka?", "Vrei cafea fără lapte?", "Do you want coffee without milk?"), ("Nie, s mliekom, ale bez cukru.", "Nu, cu lapte, dar fără zahăr.", "No, with milk, but without sugar."))
d(U, ("Koľko pív si dáte?", "Câte beri doriți?", "How many beers will you have?"), ("Päť pív, prosím.", "Cinci beri, vă rog.", "Five beers, please."),
  "5 and above take the genitive plural: päť pív.", "De la 5 în sus, genitiv plural: päť pív.")
d(U, ("Kde je centrum mesta?", "Unde e centrul orașului?", "Where is the town centre?"), ("Vedľa kostola.", "Lângă biserică.", "Next to the church."))

# ------------------------------------------------------------------ 2.4 where vs where to
U = "2.4"
d(U, ("Kam ideš?", "Unde te duci?", "Where are you going?"), ("Idem na poštu.", "Mă duc la poștă.", "I'm going to the post office."))
d(U, ("Kde si bol?", "Unde ai fost?", "Where were you?"), ("Na pošte.", "La poștă.", "At the post office."))
d(U, ("Ideme do kina?", "Mergem la cinema?", "Shall we go to the cinema?"), ("Áno, poďme do kina.", "Da, hai la cinema.", "Yes, let's go to the cinema."))
d(U, ("Kde je mačka?", "Unde e pisica?", "Where's the cat?"), ("Pod stolom.", "Sub masă.", "Under the table."))
d(U, ("Kam dáš tašku?", "Unde pui geanta?", "Where will you put the bag?"), ("Na stôl.", "Pe masă.", "On the table."))
d(U, ("Kde bývaš?", "Unde locuiești?", "Where do you live?"), ("V Bratislave, v centre.", "În Bratislava, în centru.", "In Bratislava, in the centre."))

# ------------------------------------------------------------------ 2.5 to whom (dative)
U = "2.5"
d(U, ("Komu voláš?", "Pe cine suni?", "Who are you calling?"), ("Volám mame.", "O sun pe mama.", "I'm calling my mum."))
d(U, ("Dáš mi to?", "Mi-l dai?", "Will you give it to me?"), ("Áno, dám ti to.", "Da, ți-l dau.", "Yes, I'll give it to you."))
d(U, ("Komu píšeš?", "Cui îi scrii?", "Who are you writing to?"), ("Píšem kamarátovi.", "Îi scriu unui prieten.", "I'm writing to a friend."))
d(U, ("Pomôžeš mi?", "Mă ajuți?", "Will you help me?"), ("Jasné, pomôžem ti.", "Sigur, te ajut.", "Sure, I'll help you."))
d(U, ("Čo kúpiš sestre?", "Ce-i cumperi surorii tale?", "What will you buy your sister?"), ("Kúpim jej knihu.", "Îi cumpăr o carte.", "I'll buy her a book."))

# ------------------------------------------------------------------ 2.6 with what, with whom (instrumental)
U = "2.6"
d(U, ("S kým ideš?", "Cu cine mergi?", "Who are you going with?"), ("S bratom.", "Cu fratele meu.", "With my brother."))
d(U, ("Čím ideš do práce?", "Cu ce mergi la muncă?", "How do you get to work?"), ("Autobusom.", "Cu autobuzul.", "By bus."))
d(U, ("Kávu s mliekom?", "Cafea cu lapte?", "Coffee with milk?"), ("Áno, s mliekom, prosím.", "Da, cu lapte, vă rog.", "Yes, with milk, please."))
d(U, ("Ideš vlakom alebo autom?", "Mergi cu trenul sau cu mașina?", "Are you going by train or by car?"), ("Vlakom.", "Cu trenul.", "By train."))
d(U, ("S kým bývaš?", "Cu cine locuiești?", "Who do you live with?"), ("Bývam so ženou a s deťmi.", "Locuiesc cu soția și copiii.", "I live with my wife and the children."))

# ------------------------------------------------------------------ 2.7 shopping properly
U = "2.7"
d(U, ("Akú veľkosť potrebujete?", "Ce mărime vă trebuie?", "What size do you need?"), ("Potrebujem väčšiu.", "Îmi trebuie una mai mare.", "I need a bigger one."))
d(U, ("Môžem si to vyskúšať?", "Pot să probez?", "Can I try it on?"), ("Samozrejme, kabínky sú vzadu.", "Desigur, cabinele sunt în spate.", "Of course, the fitting rooms are at the back."))
d(U, ("Máte to aj v inej farbe?", "O aveți și în altă culoare?", "Do you have it in another colour?"), ("Áno, máme to aj v čiernej.", "Da, o avem și în negru.", "Yes, we have it in black too."))
d(U, ("Chcel by som to vrátiť.", "Aș vrea să returnez asta.", "I'd like to return this."), ("Máte bloček?", "Aveți bonul?", "Do you have the receipt?"),
  "bloček — the everyday word for a receipt.", "bloček — cuvântul de zi cu zi pentru bon.")
d(U, ("Mohli by ste mi pomôcť?", "Ați putea să mă ajutați?", "Could you help me?"), ("Samozrejme, čo potrebujete?", "Desigur, ce vă trebuie?", "Of course, what do you need?"))
d(U, ("Je to v akcii?", "E la ofertă?", "Is it on offer?"), ("Áno, je tam zľava dvadsať percent.", "Da, e reducere de douăzeci la sută.", "Yes, there's a twenty percent discount."))

# ------------------------------------------------------------------ 2.8 work & tech
U = "2.8"
d(U, ("Máš dnes meeting?", "Ai azi ședință?", "Do you have a meeting today?"), ("Áno, o desiatej. Online.", "Da, la zece. Online.", "Yes, at ten. Online."))
d(U, ("Funguje to už?", "Merge deja?", "Does it work yet?"), ("Nie, ešte je tam bug.", "Nu, mai e un bug.", "No, there's still a bug."))
d(U, ("Pracuješ z domu?", "Lucrezi de acasă?", "Do you work from home?"), ("Áno, väčšinou z domu.", "Da, în mare parte de acasă.", "Yes, mostly from home."))
d(U, ("Môžeš mi poslať ten kód?", "Poți să-mi trimiți codul?", "Can you send me that code?"), ("Jasné, pošlem ti link.", "Sigur, îți trimit un link.", "Sure, I'll send you a link."))
d(U, ("Kedy máš deadline?", "Când ai deadline?", "When's your deadline?"), ("V piatok. Ale asi to nestihnem.", "Vineri. Dar probabil nu apuc.", "Friday. But I probably won't make it."),
  "stihnúť = to make it in time; nestihnem = I won't make it.", "stihnúť = a apuca (la timp); nestihnem = nu apuc.")

# ------------------------------------------------------------------ 2.9 health & pharmacy
U = "2.9"
d(U, ("Čo vás bolí?", "Ce vă doare?", "What hurts?"), ("Bolí ma hrdlo a mám teplotu.", "Mă doare gâtul și am temperatură.", "My throat hurts and I have a temperature."))
d(U, ("Máte recept?", "Aveți rețetă?", "Do you have a prescription?"), ("Nie, nemám. Potrebujem niečo bez receptu.", "Nu. Îmi trebuie ceva fără rețetă.", "No. I need something over the counter."))
d(U, ("Ako často to mám brať?", "Cât de des să le iau?", "How often should I take it?"), ("Dvakrát denne, po jedle.", "De două ori pe zi, după masă.", "Twice a day, after meals."))
d(U, ("Ste alergický na niečo?", "Sunteți alergic la ceva?", "Are you allergic to anything?"), ("Nie, na nič.", "Nu, la nimic.", "No, nothing."))
d(U, ("Ako sa cítite?", "Cum vă simțiți?", "How are you feeling?"), ("Už lepšie, ďakujem.", "Mai bine deja, mulțumesc.", "Better already, thank you."))

# ------------------------------------------------------------------ 2.10 Slovakia & Romania
U = "2.10"
d(U, ("Odkiaľ presne si?", "De unde ești exact?", "Where exactly are you from?"), ("Z Bukurešti, hlavného mesta Rumunska.", "Din București, capitala României.", "From Bucharest, the capital of Romania."))
d(U, ("Aké je hlavné mesto Slovenska?", "Care e capitala Slovaciei?", "What's the capital of Slovakia?"), ("Bratislava.", "Bratislava.", "Bratislava."))
d(U, ("Je Rumunsko väčšie ako Slovensko?", "E România mai mare decât Slovacia?", "Is Romania bigger than Slovakia?"), ("Áno, oveľa väčšie.", "Da, mult mai mare.", "Yes, much bigger."))
d(U, ("Máte v Rumunsku hory?", "Aveți munți în România?", "Do you have mountains in Romania?"), ("Áno, Karpaty. Ako vy.", "Da, Carpații. Ca voi.", "Yes, the Carpathians. Like you."))
d(U, ("Akým jazykom sa hovorí v Rumunsku?", "Ce limbă se vorbește în România?", "What language is spoken in Romania?"), ("Po rumunsky. Je to románsky jazyk.", "Româna. E o limbă romanică.", "Romanian. It's a Romance language."))

# ------------------------------------------------------------------ 2.11 family & relationships
U = "2.11"
d(U, ("Kto je to na fotke?", "Cine e în poză?", "Who's that in the photo?"), ("To je moja sestra s manželom.", "E sora mea cu soțul ei.", "That's my sister with her husband."))
d(U, ("Prídeš na svadbu?", "Vii la nuntă?", "Are you coming to the wedding?"), ("Jasné, ďakujem za pozvanie.", "Sigur, mulțumesc pentru invitație.", "Sure, thanks for the invitation."))
d(U, ("Nechceš prísť v sobotu na večeru?", "Nu vrei să vii sâmbătă la cină?", "Would you like to come for dinner on Saturday?"), ("Rád by som, ale nemôžem.", "Aș vrea, dar nu pot.", "I'd love to, but I can't."),
  "Rád by som = 'I'd love to' — the polite refusal opener.", "Rád by som = „aș vrea” — începutul refuzului politicos.")
d(U, ("Máme dieťa!", "Avem un copil!", "We've had a baby!"), ("Gratulujem! Chlapec alebo dievča?", "Felicitări! Băiat sau fată?", "Congratulations! Boy or girl?"))
d(U, ("Ako sa má tvoja mama?", "Ce mai face mama ta?", "How's your mum?"), ("Dobre, ďakujem, pozdravuje ťa.", "Bine, mulțumesc, te salută.", "Fine, thanks, she says hello."))

# ------------------------------------------------------------------ 2.12 after church
U = "2.12"
d(U, ("Aká bola kázeň?", "Cum a fost predica?", "How was the sermon?"), ("Pekná, ale dlhá.", "Frumoasă, dar lungă.", "Nice, but long."))
d(U, ("Idete na kávu po omši?", "Mergeți la o cafea după liturghie?", "Are you going for coffee after Mass?"), ("Áno, poďte s nami.", "Da, veniți cu noi.", "Yes, come with us."))
d(U, ("Ste tu noví?", "Sunteți noi aici?", "Are you new here?"), ("Áno, sme z Rumunska.", "Da, suntem din România.", "Yes, we're from Romania."))
d(U, ("Chodíte sem každú nedeľu?", "Veniți aici în fiecare duminică?", "Do you come here every Sunday?"), ("Väčšinou áno.", "De obicei, da.", "Usually, yes."))
d(U, ("Pekný týždeň vám prajem.", "Vă doresc o săptămână frumoasă.", "Have a nice week."), ("Ďakujem, aj vám. Dovidenia.", "Mulțumesc, și dumneavoastră. La revedere.", "Thank you, you too. Goodbye."))


def slug(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[áä]", "a", s); s = re.sub(r"[čc]", "c", s); s = re.sub(r"[ďd]", "d", s); s = re.sub(r"[éě]", "e", s)
    s = re.sub(r"[í]", "i", s); s = re.sub(r"[ľĺ]", "l", s); s = re.sub(r"[ň]", "n", s); s = re.sub(r"[óô]", "o", s)
    s = re.sub(r"[ŕ]", "r", s); s = re.sub(r"[š]", "s", s); s = re.sub(r"[ť]", "t", s); s = re.sub(r"[úů]", "u", s)
    s = re.sub(r"[ýy]", "y", s); s = re.sub(r"[ž]", "z", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:40]

def main():
    out, seen = [], set()
    per_unit = {}
    for x in D:
        n = per_unit.get(x["unit"], 0) + 1; per_unit[x["unit"]] = n
        sid = f"dlg:{x['unit']}:{n}-{slug(x['b']['sk'])}"
        assert sid not in seen, sid; seen.add(sid)
        out.append(dict(id=sid, unit=x["unit"], a=x["a"], b=x["b"], note=x["note"], note_ro=x["note_ro"],
                        source="authored (unit chunks + minimal new material; SPOKEN-SLOVAK.md)",
                        licence=LICENCES["authored"]["licence"], attribution=LICENCES["authored"]["attribution"],
                        review_status=REVIEW_NEEDS))
    write_jsonl(os.path.join(CONTENT, "dialogues.jsonl"), out)
    small = [u for u, n in per_unit.items() if n < 4]
    print(f"dialogues: {len(out)} exchanges over {len(per_unit)} units -> content/dialogues.jsonl" + (f"  (units with <4: {small})" if small else ""))

if __name__ == "__main__":
    main()
