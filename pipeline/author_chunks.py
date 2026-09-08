#!/usr/bin/env python3
"""Hand-authored Phase-1 chunks -> content/chunks.jsonl  (M3).

Each chunk: what natives actually say, in the register they say it, with the
textbook form marked as such where the two differ. Sources: research Appendix C,
§5.2 colloquial features, SAS A1 lexical minimum (CC BY-NC-SA), and the
sentence bank. Every record is a draft until a native signs it off.

    .venv/bin/python -m pipeline.author_chunks
"""
from __future__ import annotations
import os
from .common import CONTENT, LICENCES, REVIEW_NEEDS, write_jsonl

# (unit, id, sk, ro, en, register, variants[(sk, note)], notes, examples[sk])
C = []
def ch(unit, sk, ro, en, reg="neutral", var=(), note=None, ex=(), fn=None):
    C.append(dict(unit=unit, sk=sk, ro=ro, en=en, register=reg,
                  variants=[{"sk": v[0], "note": v[1], "register": v[2] if len(v) > 2 else "colloquial"} for v in var],
                  notes=note, examples=list(ex), function=fn))

# ---------------------------------------------------------------- 1.1 hello, sorry, thanks
U="1.1"
ch(U,"Dobrý deň.","Bună ziua.","Good day. (the default greeting)",reg="standard",
   var=[("Dobrý.","what you actually hear in shops and corridors — the second word is dropped")],
   fn="pozdraviť", ex=["Dobrý deň, prosím si kávu."])
ch(U,"Dobré ráno.","Bună dimineața.","Good morning.",reg="standard")
ch(U,"Dobrý večer.","Bună seara.","Good evening.",reg="standard")
ch(U,"Dobrú noc.","Noapte bună.","Good night.",reg="standard")
ch(U,"Ahoj.","Salut. / Pa.","Hi. / Bye. (informal, both directions)",reg="colloquial",
   var=[("Ahojte.","to several people"),("Čau. / Čaute.","equally common, slightly younger"),("Servus.","western Slovakia; a shared word with Romanian!","regional")],
   note="Ahoj is both hello AND goodbye, like Romanian 'pa' only for goodbye. Use only with people you address as 'ty'.")
ch(U,"Dovidenia.","La revedere.","Goodbye. (formal)",reg="standard",
   var=[("Dovi.","clipped form, very common"),("Majte sa (pekne).","'take care' — warm, formal-ish"),("Maj sa.","informal 'take care'")])
ch(U,"Ďakujem.","Mulțumesc.","Thank you.",reg="neutral",
   var=[("Ďakujem pekne.","'thanks a lot' — the normal polite form"),("Vďaka.","'thanks', informal"),("Díky.","very informal, Czech-flavoured — recognise, don't imitate","colloquial")],
   ex=["Ďakujem pekne za pomoc."])
ch(U,"Prosím.","Te rog. / Poftim. / Cu plăcere.","Please. / Here you are. / You're welcome. (all three!)",reg="neutral",
   note="One word, three jobs: request (please), handing something over (here you go), answer to thanks (you're welcome). Also 'Prosím?' = 'Sorry, what?'")
ch(U,"Nemáš za čo.","N-ai pentru ce.","You're welcome. (informal)",reg="colloquial",
   var=[("Nemáte za čo.","formal"),("Nie je za čo.","neutral, equally common"),("Rado sa stalo.","'gladly done' — slightly old-fashioned, warm")])
ch(U,"Prepáčte.","Scuzați-mă. / Îmi pare rău.","Excuse me / Sorry. (formal)",reg="standard",
   var=[("Prepáč.","informal"),("Pardon.","bumping into someone, squeezing past — very common"),("Sorry.","young people, everywhere","colloquial")],
   ex=["Prepáčte, kde je zastávka?"])
ch(U,"Nech sa páči.","Poftim. / Poftiți.","Here you are. / Go ahead. / After you.",reg="neutral",
   note="What a waiter says putting down your coffee, what you say holding a door. Learn it as one sound: [ɲex sa paːči].")
ch(U,"Dobrú chuť.","Poftă bună.","Enjoy your meal.",reg="neutral",ex=["Dobrú chuť! — Ďakujem, aj vám."])
ch(U,"Na zdravie.","Noroc! / Sănătate!","Cheers! / Bless you (after a sneeze).",reg="neutral")
ch(U,"Teší ma.","Încântat(ă).","Nice to meet you.",reg="standard",var=[("Aj mňa.","'me too' — the reply")])
ch(U,"Vitajte.","Bine ați venit.","Welcome. (formal/plural)",reg="standard",var=[("Vitaj.","informal singular"),("Poďte ďalej.","'come in' — said at the door")])

# ---------------------------------------------------------------- 1.2 I don't understand
U="1.2"
ch(U,"Nerozumiem.","Nu înțeleg.","I don't understand.",reg="neutral",ex=["Prepáčte, nerozumiem."],fn="vyjadriť neznalosť")
ch(U,"Rozumiem.","Înțeleg.","I understand.",var=[("Jasné.","'got it / sure' — the colloquial reply"),("Aha.","'oh, I see'")])
ch(U,"Ešte raz, prosím.","Încă o dată, vă rog.","Once more, please.",reg="neutral")
ch(U,"Pomalšie, prosím.","Mai încet, vă rog.","Slower, please.",var=[("Pomaly, prosím.","equally fine")])
ch(U,"Neviem.","Nu știu.","I don't know.",var=[("Netuším.","'no idea' — colloquial"),("Nemám tušenia.","'I have no clue'")])
ch(U,"Ako sa povie … po slovensky?","Cum se spune … în slovacă?","How do you say … in Slovak?",ex=["Ako sa povie 'thank you' po slovensky?"])
ch(U,"Čo znamená …?","Ce înseamnă …?","What does … mean?",var=[("Čo to znamená?","'what does that mean?'")])
ch(U,"Hovorím po anglicky a po rumunsky.","Vorbesc engleză și română.","I speak English and Romanian.",
   note="'po + -sky' is how you name a language you speak: po slovensky, po anglicky, po rumunsky, po nemecky.")
ch(U,"Učím sa po slovensky.","Învăț slovacă.","I'm learning Slovak.",var=[("Učím sa slovenčinu.","the noun form — equally common")])
ch(U,"Hovoríte po anglicky?","Vorbiți engleză?","Do you speak English?",reg="standard",var=[("Hovoríš po anglicky?","informal")])
ch(U,"Len trochu.","Doar puțin.","Just a little.",var=[("Trošku.","diminutive — softer, very common")])
ch(U,"Môžete to napísať?","Puteți să scrieți?","Can you write it down?",reg="standard")
ch(U,"Som cudzinec.","Sunt străin.","I'm a foreigner.",var=[("Som cudzinka.","feminine")],note="Useful at offices: it flips people into slow, clear Slovak.")

# ---------------------------------------------------------------- 1.3 who I am
U="1.3"
ch(U,"Volám sa …","Mă numesc …","My name is …",ex=["Volám sa Dennis."],fn="predstaviť sa")
ch(U,"Som z Rumunska.","Sunt din România.","I'm from Romania.",note="z + genitive: z Rumunska, zo Slovenska, z Ameriky.")
ch(U,"Som Rumun.","Sunt român.","I'm Romanian (m).",var=[("Som Rumunka.","feminine")])
ch(U,"Ako sa voláš?","Cum te cheamă?","What's your name? (informal)",var=[("Ako sa voláte?","formal")])
ch(U,"Odkiaľ si?","De unde ești?","Where are you from? (informal)",var=[("Odkiaľ ste?","formal")])
ch(U,"Bývam v Bratislave.","Locuiesc în Bratislava.","I live in Bratislava.",note="v + locative: v Bratislave, v Košiciach, v Prahe, v Bukurešti.")
ch(U,"Pracujem ako programátor.","Lucrez ca programator.","I work as a programmer.",var=[("Robím ako programátor.","'robiť' = to work, very common in speech: Kde robíš? = Where do you work?")],
   ex=["Kde robíš? — Robím v IT firme."])
ch(U,"Pracujem z domu.","Lucrez de acasă.","I work from home.")
ch(U,"Mám tridsať rokov.","Am treizeci de ani.","I'm thirty.",note="'Koľko máš rokov?' — literally 'how many years do you have', same logic as Romanian.")
ch(U,"Som ženatý.","Sunt căsătorit.","I'm married (m).",var=[("Som vydatá.","married (f)"),("Som slobodný / slobodná.","single")])
ch(U,"Čo robíš?","Ce faci? (cu ce te ocupi)","What do you do?",var=[("Čím sa živíš?","'what do you do for a living' — colloquial")],
   note="Careful: 'Čo robíš?' also means 'what are you doing right now'. Context decides — like Romanian 'ce faci'.")

# ---------------------------------------------------------------- 1.4 coffee
U="1.4"
ch(U,"Prosím si kávu.","Aș dori o cafea.","I'd like a coffee. (THE way to order)",reg="neutral",
   var=[("Dám si kávu.","'I'll have a coffee' — equally common, slightly more casual"),("Jednu kávu, prosím.","'one coffee, please' — fine too")],
   ex=["Prosím si kávu s mliekom.","Dám si jedno pivo."],fn="požiadať o niečo")
ch(U,"Čo si dáte?","Ce doriți?","What will you have? (waiter)",reg="standard",var=[("Čo si prosíte?","equally common"),("Čo to bude?","'what'll it be' — casual")])
ch(U,"Koľko to stojí?","Cât costă?","How much is it?",var=[("Koľko je to?","market shorthand"),("Za koľko?","'for how much?' — very casual")],fn="informovať sa")
ch(U,"Platím.","Plătesc. (nota, vă rog)","I'd like to pay.",var=[("Zaplatíme.","'we'll pay' — for a group"),("Účet, prosím.","'the bill, please' — textbook but fine")],
   note="Raising a hand and saying 'Platím' is how you ask for the bill. Nobody says 'Môžem dostať účet?'.")
ch(U,"Kartou, prosím.","Cu cardul, vă rog.","By card, please.",var=[("V hotovosti.","in cash")])
ch(U,"Tu alebo so sebou?","Aici sau la pachet?","Here or to go?",var=[("So sebou.","to go")])
ch(U,"S mliekom, bez cukru.","Cu lapte, fără zahăr.","With milk, no sugar.",note="s + instrumental (s mliekom), bez + genitive (bez cukru) — learn as sounds first.")
ch(U,"Ešte niečo?","Încă ceva?","Anything else?",var=[("To je všetko.","'that's all' — the answer")])
ch(U,"Jedno pivo, prosím.","O bere, vă rog.","One beer, please.",var=[("Dve pivá.","two beers"),("Päť pív.","five beers — genitive plural after 5+")])
ch(U,"Máte …?","Aveți …?","Do you have …?",var=[("Nemáte náhodou …?","'you don't happen to have…?' — softer, very Slovak")],ex=["Máte bezlepkový chlieb?"])
ch(U,"Chutí mi.","Îmi place (la gust).","I like it (food).",var=[("Nechutí mi.","I don't like it (food)")],note="chutiť = taste good; páčiť sa = like the look/idea of. Both dative — exactly like 'îmi place'.")
ch(U,"Bolo to výborné.","A fost excelent.","It was delicious.",var=[("Bolo to super.","casual")])

# ---------------------------------------------------------------- 1.5 numbers / time
U="1.5"
ch(U,"Koľko je hodín?","Cât e ceasul?","What time is it?")
ch(U,"Je pol tretej.","E două și jumătate.","It's half past two.",note="pol tretej = 'half OF THE THIRD' = 2:30. Slovak counts toward the coming hour, like German. pol druhej = 1:30, pol štvrtej = 3:30.")
ch(U,"O koľkej?","La ce oră?","At what time?",var=[("O siedmej.","at seven"),("O pol ôsmej.","at 7:30")])
ch(U,"Dve eurá päťdesiat.","Doi euro cincizeci.","Two euros fifty.",note="1 euro, 2–4 eurá, 5+ eur. Cents follow the same rule (centy / centov) but people just say the number.")
ch(U,"Dvadsať deka šunky.","Două sute de grame de șuncă.","200 g of ham.",note="deko = 10 g, the unit everyone uses at the deli counter. Nobody says 'dvesto gramov'.")
ch(U,"Pol kila.","Jumătate de kilogram.","Half a kilo.",var=[("Kilo jabĺk.","a kilo of apples"),("Štvrť kila.","250 g")])
ch(U,"Stovka.","O sută (bancnotă / sută de euro).","A hundred (colloquial).",reg="colloquial",var=[("Päťdesiatka.","a fifty"),("Desina.","a ten (very colloquial)")])
ch(U,"Aké je vaše telefónne číslo?","Care e numărul dvs. de telefon?","What's your phone number?",reg="standard",
   note="Slovaks read phone numbers in groups: nula deväťsto … Learn 0–9 as sounds and you can take any number.")

# ---------------------------------------------------------------- 1.6 the market
U="1.6"
ch(U,"Prosím si pol kila jabĺk.","Aș dori jumătate de kilogram de mere.","Half a kilo of apples, please.",ex=["Prosím si kilo paradajok."])
ch(U,"Dáte mi …?","Îmi dați …?","Would you give me …?",var=[("Dajte mi …","'give me' — direct, fine at a market")])
ch(U,"Ktoré sú sladké?","Care sunt dulci?","Which ones are sweet?",var=[("Sú čerstvé?","are they fresh?"),("Odkiaľ sú?","where are they from?")])
ch(U,"Môžem ochutnať?","Pot să gust?","Can I taste?",note="Market sellers expect this. Ochutnať / skúsiť.")
ch(U,"To je všetko, ďakujem.","Asta e tot, mulțumesc.","That's all, thanks.")
ch(U,"Nemáte drobné?","Nu aveți mărunt?","Don't you have change?",var=[("Máte drobné?","same question, positive")],note="Negative questions are polite in Slovak, not suspicious.")
ch(U,"Je to domáce?","E de casă?","Is it homemade?",note="domáci = homemade/local — the magic word at Slovak markets: domáce vajcia, domáci med, domáca slanina.")
ch(U,"Za koľko je kilo?","Cât e kilogramul?","How much per kilo?")
ch(U,"Ešte jedno, prosím.","Încă unul, vă rog.","One more, please.")
ch(U,"Vrecko, prosím.","O pungă, vă rog.","A bag, please.",var=[("Tašku, prosím.","a (bigger) bag")])
ch(U,"Je tu zľava?","E la reducere?","Is there a discount?",var=[("Je to v akcii?","'is it on offer?' — akcia = special offer, the word on every supermarket sign")])

# ---------------------------------------------------------------- 1.7 where is
U="1.7"
ch(U,"Kde je …?","Unde e …?","Where is …?",ex=["Kde je zastávka?","Kde je lekáreň?"],fn="informovať sa")
ch(U,"Kde sú toalety?","Unde e toaleta?","Where are the toilets?",var=[("Kde je WC?","'vé-cé' — what people actually say"),("Kde je záchod?","also common")])
ch(U,"Rovno.","Drept înainte.","Straight ahead.",var=[("Choďte rovno.","go straight (formal imperative)")])
ch(U,"Doľava. / Doprava.","La stânga. / La dreapta.","Left. / Right.",var=[("Vľavo. / Vpravo.","on the left / on the right (position, not motion)")])
ch(U,"Je to ďaleko?","E departe?","Is it far?",var=[("Je to blízko.","it's close"),("Päť minút pešo.","five minutes on foot")])
ch(U,"Idem do práce.","Merg la muncă.","I'm going to work.",note="do + genitive for 'to/into': do práce, do školy, do mesta, do kostola.")
ch(U,"Som v práci.","Sunt la muncă.","I'm at work.",note="v + locative for 'in/at': v práci, v škole, v meste, v kostole. Motion = do, location = v. Same pair as 'la/în'.")
ch(U,"Idem na trh.","Merg la piață.","I'm going to the market.",note="Some places take 'na' instead: na trh / na trhu, na poštu / na pošte, na stanicu / na stanici, na Slovensko / na Slovensku.")
ch(U,"Ktorá zastávka?","Care stație?","Which stop?",var=[("Ďalšia zastávka.","next stop"),("Vystupujem.","I'm getting off")])
ch(U,"Stratil som sa.","M-am rătăcit.","I'm lost (m).",var=[("Stratila som sa.","f")])
ch(U,"Ako sa dostanem na stanicu?","Cum ajung la gară?","How do I get to the station?")
ch(U,"Tu. / Tam. / Sem.","Aici. / Acolo. / Încoace.","Here. / There. / (to) here.",note="sem = motion towards here: Poď sem! = Come here!")

# ---------------------------------------------------------------- 1.8 my day
U="1.8"
ch(U,"Ráno vstávam o siedmej.","Dimineața mă trezesc la șapte.","I get up at seven in the morning.")
ch(U,"Cez víkend …","În weekend …","On the weekend …",var=[("Cez týždeň …","during the week")])
ch(U,"V pondelok.","Luni.","On Monday.",note="v/vo + accusative for days: v pondelok, v utorok, v stredu, vo štvrtok, v piatok, v sobotu, v nedeľu.")
ch(U,"Rád čítam.","Îmi place să citesc.","I like reading (m).",var=[("Rada čítam.","f"),("Radi čítame.","we")],note="rád/rada agrees with the speaker's gender — the first grammar you'll actually feel. It is an adjective glued to a verb.")
ch(U,"Nemám čas.","Nu am timp.",  "I don't have time.",var=[("Dnes nemám čas.","not today"),("Máš čas?","do you have time?")])
ch(U,"Idem spať.","Mă duc la culcare.","I'm going to bed.")
ch(U,"Čo robíš cez víkend?","Ce faci în weekend?","What are you doing this weekend?")
ch(U,"Nič moc.","Nimic special.","Nothing much.",reg="colloquial")
ch(U,"Ako často?","Cât de des?","How often?",var=[("Každý deň.","every day"),("Niekedy.","sometimes"),("Nikdy.","never"),("Furt.","'always' — very colloquial, everywhere in speech","colloquial")])

# ---------------------------------------------------------------- 1.9 likes, feelings, small talk
U="1.9"
ch(U,"Ako sa máš?","Ce mai faci?","How are you? (informal)",var=[("Ako sa máte?","formal"),("Ako?","'how?' — what friends actually say"),("Čo nové?","what's new?"),("Ako ide?","how's it going?")],
   note="Textbooks want 'Mám sa dobre, ďakujem, a vy?'. Real answers below.")
ch(U,"Dobre.","Bine.","Fine.",var=[("Ide to.","'it goes' — the default honest answer"),("Fajn.","fine (informal)"),("V pohode.","'all good'"),("Nič moc.","'meh'"),("Super.","great")],reg="colloquial")
ch(U,"Páči sa mi to.","Îmi place.","I like it.",var=[("Nepáči sa mi to.","I don't like it"),("Páči sa mi Bratislava.","I like Bratislava")],
   note="páči SA MI = 'it pleases to-me'. Dative experiencer, identical logic to 'îmi place'. The thing liked is the subject.")
ch(U,"Mám rád kávu.","Îmi place cafeaua. (o iubesc)","I like/love coffee (m).",var=[("Mám rada kávu.","f")],note="mať rád = a stable liking (people, foods, activities); páčiť sa = something strikes you as nice.")
ch(U,"To je super.","E super.","That's great.",var=[("To je fajn.","nice"),("To je v pohode.","that's fine / no problem"),("To je skvelé.","that's excellent"),("Paráda.","'awesome' — colloquial")])
ch(U,"Fakt?","Serios?","Really?",reg="colloquial",var=[("Naozaj?","'really?' — neutral"),("Vážne?","seriously?")])
ch(U,"Jasné.","Sigur. / Clar.","Sure. / Of course.",reg="colloquial",var=[("Samozrejme.","of course — neutral"),("Jasnačka.","very colloquial")])
ch(U,"To je škoda.","Păcat.","That's a pity.")
ch(U,"Bolí ma hlava.","Mă doare capul.","My head hurts.",var=[("Bolí ma brucho.","stomach"),("Bolí ma hrdlo.","throat")],note="bolí MA = 'hurts me' (accusative). Romanian: 'mă doare' — same structure.")
ch(U,"Je mi zle.","Mi-e rău.","I feel sick.",var=[("Je mi zima.","I'm cold"),("Je mi teplo.","I'm warm")],note="je MI + adverb — dative again, like 'mi-e frig'.")
ch(U,"Som unavený.","Sunt obosit.","I'm tired (m).",var=[("Som unavená.","f")])
ch(U,"Mám hlad.","Mi-e foame.","I'm hungry.",var=[("Mám smäd.","I'm thirsty"),("Som hladný / hladná.","also fine")])
ch(U,"Všetko najlepšie!","La mulți ani!","Happy birthday! / All the best!")
ch(U,"Veľa šťastia.","Mult noroc.","Good luck.",var=[("Držím ti palce.","'I'm holding my thumbs for you' = fingers crossed")])
ch(U,"Uvidíme.","Vom vedea.","We'll see.")
ch(U,"Dobrý nápad.","Bună idee.","Good idea.")

# ---------------------------------------------------------------- 1.10 phone & messages
U="1.10"
ch(U,"Haló?","Alo?","Hello? (answering the phone)",var=[("Prosím?","also used to answer"),("Tu je Dennis.","'Dennis here'")])
ch(U,"Zavolám ti.","Te sun (eu).","I'll call you.",var=[("Zavolám neskôr.","I'll call later"),("Zavolaj mi.","call me")])
ch(U,"Napíš mi.","Scrie-mi.","Text me.",var=[("Napíšem ti.","I'll text you")])
ch(U,"Som na ceste.","Sunt pe drum.","I'm on my way.")
ch(U,"Meškám.","Întârzii.","I'm running late.",var=[("Prepáčte, že meškám.","sorry I'm late"),("Budem tam o desať minút.","I'll be there in ten")])
ch(U,"Nepočujem ťa.","Nu te aud.","I can't hear you.",var=[("Mám slabý signál.","bad signal"),("Vypadlo to.","the call dropped")])
ch(U,"Dopočutia.","La revedere. (la telefon)","Goodbye (on the phone).",note="Literally 'until hearing' — phone-only version of dovidenia.")
ch(U,"Moment.","Un moment.","One moment.",var=[("Chvíľku.","'a little while' — diminutive, very common"),("Sekundu.","'a second'")])
ch(U,"Pošli mi to.","Trimite-mi.","Send it to me.")
ch(U,"Ozvem sa.","Te contactez eu. / Dau un semn.","I'll be in touch.",note="ozvať sa = 'to make oneself heard' — the standard sign-off for 'I'll get back to you'.")

# ---------------------------------------------------------------- 1.11 home & things
U="1.11"
ch(U,"Kde je nabíjačka?","Unde e încărcătorul?","Where's the charger?")
ch(U,"Nefunguje to.","Nu funcționează.","It doesn't work.",var=[("Je to pokazené.","it's broken"),("Nejde to.","'it doesn't go' — colloquial for 'it's not working'")])
ch(U,"Aké je heslo na wifi?","Care e parola de la wifi?","What's the wifi password?",note="'vifi' — Slovaks say it the English way.")
ch(U,"Je tu wifi?","E wifi aici?","Is there wifi here?")
ch(U,"Môžem si sadnúť?","Pot să mă așez?","May I sit down?",var=[("Sadnite si.","sit down (formal)"),("Sadni si.","sit down (informal)")])
ch(U,"Hore. / Dole.","Sus. / Jos.","Upstairs. / Downstairs.",var=[("Na prvom poschodí.","on the first floor"),("Na prízemí.","on the ground floor")])
ch(U,"Potrebujem pomoc.","Am nevoie de ajutor.","I need help.",var=[("Môžete mi pomôcť?","can you help me?")])
ch(U,"Je to moje.","E al meu.","It's mine.",var=[("To je tvoje?","is that yours?")])
ch(U,"Pozor!","Atenție!","Watch out!",var=[("Horí!","fire!"),("Pomoc!","help!")])

# ---------------------------------------------------------------- 1.12 family & people
U="1.12"
ch(U,"Mám brata a sestru.","Am un frate și o soră.","I have a brother and a sister.",note="brat → brata, sestra → sestru: the accusative you met with 'kávu'.")
ch(U,"Moja žena.","Soția mea.","My wife.",var=[("Moja manželka.","more formal"),("Môj muž.","my husband"),("Môj manžel.","formal")])
ch(U,"Mám dve deti.","Am doi copii.","I have two kids.",var=[("Nemám deti.","I don't have kids")])
ch(U,"Toto je môj kamarát.","Acesta e prietenul meu.","This is my friend (m).",var=[("Toto je moja kamarátka.","f"),("priateľ / priateľka","boyfriend / girlfriend — careful!")],
   note="kamarát = friend. priateľ can mean friend OR boyfriend. Introduce a mere friend as kamarát to avoid the raised eyebrow.")
ch(U,"Je milý.","E drăguț / amabil.","He's nice.",var=[("Je milá.","she's nice"),("Je fajn.","he/she's cool")])
ch(U,"Má modré oči.","Are ochi albaștri.","He/she has blue eyes.")
ch(U,"Koľko má rokov?","Câți ani are?","How old is he/she?")
ch(U,"Bývam sám.","Locuiesc singur.","I live alone (m).",var=[("Bývam sama.","f"),("Bývam s rodinou.","with my family")])

# ---------------------------------------------------------------- 1.13 Sunday (church)
U="1.13"
ch(U,"Pán Boh zaplať.","Dumnezeu să vă răsplătească. (mulțumesc)","Thank you (religious/rural — 'may God repay').",reg="formal",
   note="Heard in villages and church settings for a heartfelt thank-you. Reply: 'Nech sa páči' or 'Pán Boh uslyš'.")
ch(U,"Pokoj vám.","Pace vouă.","Peace be with you.",reg="formal",var=[("Pokoj s tebou.","peace be with you (sg)")])
ch(U,"Pochválen buď Ježiš Kristus.","Lăudat fie Iisus Hristos.","Praised be Jesus Christ. (traditional Catholic greeting)",reg="formal",
   var=[("Naveky, amen.","the reply: 'forever, amen'")])
ch(U,"S Bohom.","Rămâi cu Dumnezeu. (adio)","Go with God. (old-fashioned goodbye)",reg="archaic")
ch(U,"Ideme na omšu.","Mergem la liturghie.","We're going to Mass. (Catholic)",var=[("Ideme na bohoslužbu.","to the service — neutral, any tradition"),("Ideme na služby Božie.","Lutheran term")],
   note="omša = Catholic Mass; služby Božie = Lutheran service; bohoslužba = generic. zbor (Protestant congregation) vs farnosť (parish).")
ch(U,"Otče náš, ktorý si na nebesiach…","Tatăl nostru, care ești în ceruri…","Our Father, who art in heaven…",reg="formal",
   note="Fixed text: the whole Lord's Prayer is in content/texts/. Perfect pronunciation practice — you already know what every word means.")
ch(U,"Amen.","Amin.","Amen.",var=[("Aleluja.","Hallelujah")])
ch(U,"Nech ťa Pán Boh požehná.","Dumnezeu să te binecuvânteze.","God bless you.",reg="formal")
ch(U,"Modlím sa za teba.","Mă rog pentru tine.","I'm praying for you.")
ch(U,"Požehnanú nedeľu.","Duminică binecuvântată.","Blessed Sunday.",reg="formal")


def main():
    recs = []
    for i, c in enumerate(C, 1):
        slug = (c["sk"].lower().replace("…", "").strip(" .!?")
                .translate(str.maketrans("áäčďéíĺľňóôŕšťúýž", "aacdeillnoorstuyz"))
                .replace(" ", "-").replace("/", "").replace(",", "").replace("?", "").replace("--", "-")[:40])
        recs.append({
            "id": f"chunk:{c['unit']}:{slug}",
            "unit": c["unit"], "sk": c["sk"], "ro": c["ro"], "en": c["en"],
            "register": c["register"], "variants": c["variants"],
            "function": c["function"], "notes": c["notes"], "examples": c["examples"],
            "audio": None,
            "source": "authored (research App. C, §5.2; SAS A1 lexical minimum CC BY-NC-SA)",
            "licence": LICENCES["authored"]["licence"], "attribution": LICENCES["authored"]["attribution"],
            "review_status": REVIEW_NEEDS,
        })
    out = os.path.join(CONTENT, "chunks.jsonl")
    n = write_jsonl(out, recs)
    from collections import Counter
    by_unit = Counter(r["unit"] for r in recs)
    nvar = sum(len(r["variants"]) for r in recs)
    print(f"  wrote {n} chunks (+{nvar} variants) -> {out}")
    print("  per unit:", dict(sorted(by_unit.items(), key=lambda kv: [int(x) for x in kv[0].split('.')])))

if __name__ == "__main__":
    main()
