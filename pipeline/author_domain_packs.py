#!/usr/bin/env python3
"""The three v1 domain packs -> content/domain_packs.jsonl  (research §9 Phase 3, §15.3).

HAND-CURATED, NOT FREQUENCY-RANKED. Order inside a pack = the order you need the words in
real life, not their subtitle rank. Each entry: lemma, RO, EN, register, note. Where a lemma is
already in bands 1–2 the lexicon has the paradigm; the rest need a kaikki/hunspell join later.
Sources: SAS A2 lexical minimum (Obchody a nakupovanie; Život online; Práca a kariéra —
CC BY-NC-SA), research §9 domain seeds and §9.1 church core, §5.2 colloquial layer.
"""
from __future__ import annotations
import os
from .common import CONTENT, LICENCES, REVIEW_NEEDS, read_jsonl, write_jsonl

def w(sk, ro, en, reg="neutral", note=None): return dict(sk=sk, ro=ro, en=en, register=reg, note=note)

PACKS = {
"food_market": dict(title="Food, market & shopping", title_ro="Mâncare, piață și cumpărături", sas="A1 5 Jedlo a stravovanie; A2 4 Obchody a nakupovanie",
 sections={
  "places": [w("trh","piață","market"),w("tržnica","hală (piață acoperită)","market hall"),w("stánok","tarabă","stall"),w("potraviny","alimentară","grocery shop"),
             w("pekáreň","brutărie","bakery"),w("mäsiarstvo","măcelărie","butcher's"),w("cukráreň","cofetărie","pastry shop"),w("drogéria","drogherie","drugstore (toiletries)"),
             w("obchodné centrum","mall","shopping centre"),w("supermarket","supermarket","supermarket"),w("kaviareň","cafenea","café"),w("krčma","cârciumă","pub",note="cognate: cârciumă")],
  "at the counter": [w("Prosím si …","Aș dori …","I'd like …"),w("Dáte mi …?","Îmi dați …?","Would you give me …?"),w("deko","10 grame","10 g unit",note="dvadsať deka = 200 g — nobody says gramov"),
             w("kilo / pol kila / štvrť kila","kilogram / jumătate / sfert","kilo / half / quarter"),w("kúsok","bucată","a piece"),w("plátok","felie","a slice"),
             w("Ešte niečo? — To je všetko.","Încă ceva? — Asta e tot.","Anything else? — That's all."),w("Môžem ochutnať?","Pot să gust?","Can I taste?"),
             w("Za koľko?","Cât costă?","How much?",reg="colloquial"),w("Nemáte drobné?","Nu aveți mărunt?","Don't you have change?"),w("vrecko / taška","pungă / sacoșă","bag"),
             w("pokladňa","casă (de marcat)","checkout"),w("pokladničný blok","bon fiscal","receipt"),w("v hotovosti / kartou","numerar / cu cardul","cash / by card")],
  "quality words": [w("čerstvý","proaspăt","fresh"),w("domáci","de casă / local","homemade, local",note="the magic market word"),w("zrelý","copt","ripe"),w("sladký","dulce","sweet"),
             w("kyslý","acru","sour"),w("slaný","sărat","salty"),w("horký","amar","bitter"),w("pikantný","picant","spicy"),w("chutný","gustos","tasty"),w("lacný","ieftin","cheap"),
             w("drahý","scump","expensive"),w("zľava","reducere","discount"),w("akcia","ofertă / promoție","special offer",note="the word on every supermarket sign"),w("výpredaj","lichidare","sale")],
  "bread & dairy": [w("chlieb","pâine","bread"),w("rožok","corn (chiflă)","roll",note="the Slovak breakfast roll"),w("žemľa","chiflă","bun"),w("pečivo","produse de panificație","baked goods"),
             w("mlieko","lapte","milk"),w("maslo","unt","butter"),w("syr","brânză / cașcaval","cheese"),w("bryndza","brânză de oaie (moale)","sheep's cheese",note="national dish base: bryndzové halušky"),
             w("tvaroh","brânză de vaci","quark"),w("smotana","smântână","cream",note="cognate: smântână"),w("jogurt","iaurt","yoghurt"),w("vajcia","ouă","eggs")],
  "fruit & veg": [w("jablko","măr","apple"),w("hruška","pară","pear"),w("slivka","prună","plum"),w("čerešňa","cireașă","cherry"),w("višňa","vișină","sour cherry",note="cognate"),
             w("jahoda","căpșună","strawberry"),w("malina","zmeură","raspberry"),w("hrozno","struguri","grapes"),w("marhuľa","caisă","apricot"),w("broskyňa","piersică","peach"),
             w("zemiaky","cartofi","potatoes"),w("mrkva","morcov","carrot",note="cognate: morcov"),w("cibuľa","ceapă","onion"),w("cesnak","usturoi","garlic"),w("paradajka","roșie","tomato"),
             w("paprika","ardei","pepper"),w("uhorka","castravete","cucumber"),w("kapusta","varză","cabbage",note="kyslá kapusta = sauerkraut"),w("petržlen","pătrunjel","parsley"),w("kôpor","mărar","dill"),w("hríby / huby","ciuperci","mushrooms",note="cognate: hrib")],
  "meat & more": [w("mäso","carne","meat"),w("kuracie","de pui","chicken (adj)"),w("bravčové","de porc","pork"),w("hovädzie","de vită","beef"),w("šunka","șuncă","ham"),
             w("slanina","slănină","bacon",note="cognate"),w("klobása","cârnat","sausage"),w("párky","crenvurști","frankfurters"),w("ryba","pește","fish"),w("med","miere","honey"),
             w("lekvár / džem","dulceață / gem","jam"),w("orechy","nuci","nuts"),w("mak","mac","poppy seed",note="everywhere in Slovak sweets")],
  "drinks": [w("káva","cafea","coffee"),w("čaj","ceai","tea"),w("voda","apă","water"),w("minerálka","apă minerală","mineral water"),w("perlivá / neperlivá","carbogazoasă / plată","sparkling / still"),
             w("pivo","bere","beer"),w("víno","vin","wine"),w("biele / červené","alb / roșu","white / red"),w("kofola","kofola","Kofola (Slovak cola)",note="ask for it; it's a cultural thing"),
             w("džús","suc","juice"),w("slivovica","țuică de prune","plum brandy",note="offered to guests; refusing is allowed but noticed"),w("borovička","gin de ienupăr","juniper spirit")],
  "eating out": [w("obedové menu / denné menu","meniul zilei","lunch menu",note="the cheap weekday lunch — polievka + hlavné jedlo"),w("polievka","supă / ciorbă","soup"),w("hlavné jedlo","fel principal","main course"),
             w("príloha","garnitură","side dish"),w("dezert","desert","dessert"),w("halušky","găluști (din cartofi)","potato dumplings"),w("kapustnica","supă de varză","cabbage soup"),
             w("rezeň","șnițel","schnitzel"),w("Dobrú chuť.","Poftă bună.","Enjoy."),w("Platím.","Nota, vă rog.","I'll pay."),w("prepitné / tringelt","bacșiș","tip",note="~10%, said as a rounded total: 'dvanásť' when the bill is 11,20")],
 }),
"work_tech": dict(title="Work & technology", title_ro="Muncă și tehnologie", sas="A1 2 Štúdium a práca; A2 2 Život online; A2 3 Práca a kariéra",
 sections={
  "the job": [w("firma","firmă","company"),w("práca / robota","muncă","work / job",note="robota is colloquial and universal"),w("kolega / kolegyňa","coleg / colegă","colleague"),w("šéf / šéfka","șef / șefă","boss"),
             w("tím","echipă","team"),w("projekt","proiect","project"),w("zákazník / klient","client","customer"),w("termín / deadline","termen","deadline"),w("stretnutie / míting","întâlnire / ședință","meeting",note="míting is what people say"),
             w("call","apel / call","call (video)",reg="colloquial"),w("dovolenka","concediu","holiday"),w("plat / výplata","salariu","salary / pay"),w("faktúra","factură","invoice"),w("zmluva","contract","contract"),w("živnosť / živnostník","PFA / freelancer","self-employed",note="how a Slovak freelancer is registered")],
  "the day": [w("Na čom robíš?","La ce lucrezi?","What are you working on?"),w("Čo si robil včera?","Ce ai făcut ieri?","What did you do yesterday?"),w("Blokuje ťa niečo?","Te blochează ceva?","Anything blocking you?"),
             w("Ozvem sa.","Revin (cu un răspuns).","I'll get back to you."),w("Dohodnuté.","De acord. / S-a făcut.","Agreed / deal."),w("Pošli mi to.","Trimite-mi.","Send it to me."),w("Pozri sa na to, prosím.","Uită-te, te rog.","Have a look, please."),
             w("Mám otázku.","Am o întrebare.","I have a question."),w("Nefunguje to.","Nu merge.","It doesn't work."),w("Už to ide.","Acum merge.","It works now."),w("Robím z domu.","Lucrez de acasă.","I'm working from home."),w("Som na callе / na mítingu.","Sunt într-un call / ședință.","I'm on a call")],
  "software": [w("softvér","software","software"),w("aplikácia / appka","aplicație","app",note="appka in speech"),w("server","server","server"),w("databáza","bază de date","database"),w("kód","cod","code"),
             w("chyba / bug","eroare / bug","bug",note="both used; bug more among devs"),w("oprava / fix","remediere","fix"),w("verzia","versiune","version"),w("aktualizácia / update","actualizare","update"),
             w("nasadiť / deploynuť","a face deploy","to deploy",note="deploynuť is real Slovak dev speech; nasadiť is the standard"),w("otestovať","a testa","to test"),w("spustiť","a porni / a rula","to run / launch"),
             w("stiahnuť","a descărca","to download"),w("nahrať","a încărca","to upload"),w("uložiť","a salva","to save"),w("vymazať / zmazať","a șterge","to delete"),w("prihlásiť sa / odhlásiť sa","a se loga / deloga","log in / out"),
             w("heslo","parolă","password"),w("účet","cont","account"),w("pripojenie / wifi","conexiune / wifi","connection"),w("súbor","fișier","file"),w("priečinok","folder","folder"),w("obrazovka","ecran","screen"),
             w("klávesnica","tastatură","keyboard"),w("myš","mouse","mouse"),w("nabíjačka","încărcător","charger"),w("slúchadlá","căști","headphones")],
  "dev-speak (colloquial)": [w("pushnúť / pullnuť","a da push / pull","push / pull",reg="colloquial"),w("mergnuť","a face merge","merge",reg="colloquial"),w("commitnuť","a da commit","commit",reg="colloquial"),
             w("PR / pull request","PR","PR",reg="colloquial"),w("task / tiket","task","ticket",reg="colloquial"),w("release","release","release",reg="colloquial"),w("prod / staging","prod / staging","prod / staging",reg="colloquial"),
             w("padá to","cade / crapă","it's crashing",reg="colloquial"),w("Je to v prode.","E pe prod.","It's in production.",reg="colloquial"),w("Hotovo.","Gata.","Done.")],
  "email & messages": [w("Dobrý deň, …","Bună ziua, …","formal opener",reg="formal"),w("Ahoj, …","Salut, …","informal opener"),w("S pozdravom","Cu stimă","Kind regards",reg="formal"),w("Pekný deň.","O zi bună.","Have a nice day."),
             w("Ďakujem za odpoveď.","Mulțumesc pentru răspuns.","Thanks for your reply."),w("V prílohe posielam …","Atașat trimit …","Attached is …",reg="formal"),w("Prepáčte za neskorú odpoveď.","Scuze pentru răspunsul târziu.","Sorry for the late reply."),
             w("Dajte mi vedieť.","Dați-mi de știre.","Let me know."),w("predmet / príloha / kópia","subiect / atașament / CC","subject / attachment / CC")],
 }),
"church": dict(title="Church & faith", title_ro="Biserică și credință", sas=None,
 sections={
  "shared core": [w("Boh","Dumnezeu","God"),w("Pán","Domnul","the Lord"),w("Ježiš Kristus","Iisus Hristos","Jesus Christ"),w("Duch Svätý","Duhul Sfânt","Holy Spirit",note="cognate: duh"),
             w("viera","credință","faith"),w("nádej","nădejde","hope",note="cognate: nădejde"),w("láska","dragoste / iubire","love"),w("milosť","milă / har","grace, mercy",note="cognate: milă"),
             w("modlitba / modliť sa","rugăciune / a se ruga","prayer / to pray"),w("Biblia / Sväté písmo","Biblia / Sfânta Scriptură","Bible"),w("evanjelium","evanghelie","gospel"),w("žalm","psalm","psalm"),
             w("hriech","păcat","sin"),w("odpustenie","iertare","forgiveness"),w("pokánie","pocăință","repentance",note="cognate: pocăință"),w("spása","mântuire","salvation"),w("kríž","cruce","cross"),
             w("vzkriesenie","înviere","resurrection"),w("cirkev","biserică (instituția)","the Church"),w("kostol","biserică (clădirea)","church (building)"),w("kázeň","predică","sermon"),w("kazateľ","predicator","preacher"),
             w("pieseň / spevník","cântare / carte de cântări","hymn / hymnal"),w("chvály","laude (muzică de închinare)","worship songs"),w("bohoslužba","slujbă","service",note="cognate: slujbă"),
             w("krst","botez","baptism"),w("svadba","nuntă","wedding"),w("pohreb","înmormântare","funeral"),w("Vianoce","Crăciun","Christmas"),w("Veľká noc","Paște","Easter"),w("Amen / Aleluja","Amin / Aliluia","Amen / Hallelujah")],
  "which tradition": [w("omša","liturghie (catolică)","Mass",note="Catholic"),w("služby Božie","slujbă (luterană)","divine service",note="Lutheran ECAV term"),w("zbor","adunare / comunitate (protestantă)","congregation",note="Protestant; cognate: sobor"),
             w("farnosť","parohie","parish",note="Catholic"),w("farár","preot paroh / pastor","parish priest / pastor",note="used by BOTH Catholics and Lutherans"),w("kňaz","preot","priest",note="Catholic"),w("pastor","pastor","pastor",note="evangelical/Pentecostal"),
             w("biskup","episcop","bishop"),w("veriaci","credincios","believer"),w("sväté prijímanie","Sfânta Împărtășanie","Communion",note="Catholic"),w("Večera Pánova","Cina Domnului","Lord's Supper",note="Lutheran/Reformed"),
             w("spoveď","spovedanie","confession",note="cognate: a spovedi"),w("fara","casa parohială","parsonage"),w("zborový dom","casa de adunare","church hall",note="Protestant")],
  "what people say": [w("Pán Boh zaplať.","Dumnezeu să vă răsplătească.","Thank you (religious)",reg="formal"),w("Pokoj vám.","Pace vouă.","Peace be with you.",reg="formal"),
             w("Pochválen buď Ježiš Kristus. — Naveky, amen.","Lăudat fie Iisus Hristos. — În veci, amin.","Praised be… — Forever, amen.",reg="formal",note="traditional Catholic greeting, still used by older people"),
             w("S Bohom.","Cu Dumnezeu. (adio)","Go with God.",reg="archaic"),w("Nech ťa Pán Boh požehná.","Dumnezeu să te binecuvânteze.","God bless you.",reg="formal"),
             w("Modlím sa za teba.","Mă rog pentru tine.","I'm praying for you."),w("Požehnanú nedeľu.","Duminică binecuvântată.","Blessed Sunday.",reg="formal"),w("Vďaka Bohu.","Slavă Domnului.","Thank God."),
             w("Modlime sa.","Să ne rugăm.","Let us pray."),w("Otče náš …","Tatăl nostru …","Our Father …",note="fixed text: content/texts/otcenas.json"),w("Zdravas' Mária","Bucură-te, Marie","Hail Mary",note="Catholic")],
  "after the service": [w("Vitajte u nás.","Bine ați venit la noi.","Welcome (to our church)."),w("Ste tu prvýkrát?","Sunteți prima dată aici?","First time here?"),w("Odkiaľ ste?","De unde sunteți?","Where are you from?"),
             w("Páčila sa vám kázeň?","V-a plăcut predica?","Did you like the sermon?"),w("Príďte aj nabudúce.","Veniți și data viitoare.","Come again next time."),w("Dáte si kávu?","Serviți o cafea?","Coffee?"),
             w("stretnutie / biblická hodina","întâlnire / studiu biblic","meeting / Bible study"),w("mládež","tineret","youth group"),w("spevokol","cor","choir")],
 }),
}

def main():
    lex = {r["lemma"]: r for r in read_jsonl(os.path.join(CONTENT, "lexemes.jsonl"))}
    recs = []
    for pid, p in PACKS.items():
        entries, n_in_lex = [], 0
        for sec, items in p["sections"].items():
            for i, it in enumerate(items):
                head = it["sk"].split(" / ")[0].split(" …")[0].strip(" .?!")
                inlex = head in lex and lex[head]["band"] <= 2
                n_in_lex += inlex
                entries.append({**it, "section": sec, "order": i, "in_lexicon_band12": inlex,
                                "spoken_rank": lex[head]["spoken_rank"] if head in lex else None})
        recs.append({"id": f"pack:{pid}", "title": p["title"], "title_ro": p["title_ro"], "sas_source": p["sas"],
                     "ordering": "hand-curated by communicative need (research §15.3) — NOT by spoken_rank",
                     "entries": entries, "n_entries": len(entries), "n_already_in_bands_1_2": n_in_lex,
                     "sentences": [], "dialogues": [], "authentic_texts": [],
                     "source": "authored (SAS A2 lexical minimum CC BY-NC-SA; research §9, §9.1, §5.2)",
                     "licence": LICENCES["authored"]["licence"], "attribution": LICENCES["authored"]["attribution"],
                     "review_status": REVIEW_NEEDS})
    out = os.path.join(CONTENT, "domain_packs.jsonl")
    write_jsonl(out, recs)
    for r in recs:
        print(f"  {r['id']:18s} {r['n_entries']:3d} entries, {r['n_already_in_bands_1_2']:3d} already in bands 1–2")

if __name__ == "__main__":
    main()
