#!/usr/bin/env python3
"""Lesson plans -> content/lessons.jsonl.

A *unit* (LEARNING-MAP.md) is the can-do level; a *lesson* is one day's "new material" block
(§9.2 step 3: 8–12 sentences, ≤ 6 new lemmas). This file defines units with their chunks,
grammar notes, exercise sequence, sentence-selection rules and can-do statements; the app
slices a unit into daily lessons at runtime from the learner's state.
"""
from __future__ import annotations
import os
from .common import CONTENT, LICENCES, REVIEW_NEEDS, read_jsonl, write_jsonl

def unit(id, title, ro, sas, cando, notes, seq, select, roleplay=None, creative=None, domain=None, milestone=None):
    return dict(id=id, title=title, title_ro=ro, sas_area=sas, can_do=cando, grammar_notes=notes,
                exercise_sequence=seq, sentence_selection=select, roleplay=roleplay, creative=creative,
                domain_pack=domain, milestone=milestone)

# exercise ids from curriculum/EXERCISE-TYPES.md
FIRST = ["D1", "A2", "A1", "B1"]            # shadow → choose meaning → dictation → read/gloss
CORE  = ["D1", "A2", "A1", "C1", "B2"]      # + say it in Slovak + pick the form
P0    = ["E4", "A3", "D1"]

U = [
 unit("0.1","The alphabet Romanians already know","Alfabetul pe care îl știi deja",None,
      ["I can read any Slovak word aloud","I know ch dz dž are single letters","I apply the de/te/ne/le rule"],
      ["alphabet-y-i","sounds-palatals","sounds-diphthongs","sounds-v"],P0,
      {"pool":"internationalisms","n":40,"note":"~200 sight-readable words: hotel, banka, telefón, program, aplikácia, minúta, kilo, euro…"}),
 unit("0.2","The four things Romanian ears miss","Cele patru lucruri pe care urechea română le ratează",None,
      ["I hear long vs short","I hear ť ď ň ľ vs t d n l","I hear h vs ch","I stress the first syllable"],
      ["sounds-length","sounds-palatals","sounds-h-ch","sounds-stress"],["A3","A6","A3"],
      {"pool":"minimal_pairs","n":"all"},milestone="A3 ≥ 85% on every contrast"),
 unit("0.3","Words you already own","Cuvinte pe care le ai deja",None,
      ["I recognise 84 Slavic cognates","I know the 16 false friends"],[],["E2","E3","A1"],
      {"pool":"cognates+false_friends"}),
 unit("0.4","Type it","Scrie-le","",["I can type every diacritic without looking"],["sounds-length"],["A1"],
      {"pool":"band1","n":30,"filter":"n_words<=3","note":"single words and 2–3 word chunks for typing"}),
 unit("0.5","First twenty chunks","Primele douăzeci de expresii","1",
      ["I can say hello, thanks, sorry, yes, no, I don't understand"],["byt-present","ty-vy"],["D1","A2","A1"],
      {"pool":"chunks","units":["1.1","1.2"],"n":20}),

 unit("1.1","Hello, sorry, thanks","Salut, scuze, mulțumesc","1 Základné pozdravy",
      ["I can greet formally and informally","I can thank and reply to thanks","I can apologise","I can say goodbye","I choose ty or vy correctly"],
      ["byt-present","ty-vy","vykanie-verbs","ten-ta-to","register-map"],FIRST,
      {"pool":"band1","lemmas":["byť","ďakovať","prosiť","prepáčiť","ahoj","dobrý","deň","večer","noc","pekne","vďaka"],"n":24,"prefer_native":True}),
 unit("1.2","I don't understand","Nu înțeleg","1",
      ["I can ask someone to repeat or slow down","I can ask what a word means / how to say something","I can say which languages I speak"],
      ["neg-prefix","po-sky"],FIRST,
      {"pool":"band1","lemmas":["rozumieť","vedieť","hovoriť","povedať","znamenať","ešte","raz","pomaly","slovo","otázka"],"n":24,"prefer_native":True}),
 unit("1.3","Who I am","Cine sunt","1, 8 Môj život",
      ["I can introduce myself: name, origin, job, city","I can ask the same of someone else"],
      ["present-3-patterns","gender-guess","ten-ta-to"],CORE,
      {"pool":"band1","lemmas":["volať","bývať","pracovať","robiť","mať","rok","človek","muž","žena","meno","mesto"],"n":30,"prefer_native":True},
      domain="work_tech",milestone="a 1-minute self-introduction, recorded"),
 unit("1.4","Coffee","Cafea","5 Jedlo a stravovanie",
      ["I can order a drink and a snack","I can ask the price and pay","I can say if I liked it"],
      ["acc-sg","jeden","mat-rad"],CORE,
      {"pool":"band1","lemmas":["dať","prosiť","káva","chcieť","platiť","stáť","dobrý","ešte","niečo","všetko"],"n":30},
      roleplay="R2-cafe",domain="food_market"),
 unit("1.5","Numbers, prices, time","Numere, prețuri, ceasul","1, 3",
      ["I count to 100","I understand a price said fast","I understand a clock time"],
      ["numbers-0-100","euro-count","time-half"],["A4","A1","C1","A4"],
      {"pool":"generated","note":"A4 number sprint is infinite; plus band-1 sentences with numerals"}),
 unit("1.6","The market","Piața","5",
      ["I can buy by weight","I can ask for things and say that's all","I can ask if it's fresh / homemade / on offer"],
      ["gen-quantity","euro-count","acc-sg"],CORE,
      {"pool":"band1+2","lemmas":["kúpiť","kilo","pol","chlieb","mlieko","syr","jablko","paradajka","čerstvý","domáci","zľava","akcia","drobný","vrecko"],"n":30},
      roleplay="R1-market",creative="X2 menu decoder",domain="food_market",milestone="R1 completed without switching to English"),
 unit("1.7","Where is…?","Unde e…?","6 Mestá a miesta",
      ["I can ask where something is","I understand straight / left / right / far","I know do vs v, na vs na"],
      ["loc-v-na","do-vs-v","question-words","v-vo-s-so-z-zo"],CORE+["F3"],
      {"pool":"band1","lemmas":["kde","kam","ísť","tu","tam","sem","ďaleko","blízko","rovno","zastávka","cesta","mesto","domov","doma"],"n":30},
      domain="transport"),
 unit("1.8","My day","Ziua mea","3 Denný program",
      ["I can say what I usually do and when","I know the days and parts of the day","I can say what I like doing"],
      ["present-3-patterns","rad-verb","reflexive-sa"],CORE,
      {"pool":"band1","lemmas":["ráno","večer","deň","týždeň","víkend","vstávať","spať","čas","často","vždy","nikdy","niekedy","robiť","čítať"],"n":30}),
 unit("1.9","Likes, feelings, small talk","Ce-mi place, cum mă simt","3, 8",
      ["I can say what I like and don't","I can say how I feel","I can react naturally: fakt? jasné, super, škoda"],
      ["mat-rad","dative-experiencer","reflexive-sa","register-map"],CORE,
      {"pool":"band1","lemmas":["páčiť","rád","cítiť","bolieť","hlava","zle","dobre","fajn","super","fakt","jasný","škoda","unavený","hlad"],"n":30,"prefer_colloquial":True},
      roleplay="R7-neighbour",creative="X4 overheard"),
 unit("1.10","Phone & messages","Telefon și mesaje","2 Štúdium a práca, 7",
      ["I can answer the phone and say who I am","I can say I'm late / on my way","I can arrange to call back"],
      ["future-budem","imperative-basic","clitic-second"],CORE,
      {"pool":"band1","lemmas":["volať","zavolať","napísať","poslať","správa","mobil","telefón","meškať","cesta","neskôr","chvíľa","moment"],"n":30},
      roleplay="R8-phone-booking",domain="work_tech"),
 unit("1.11","Home & things","Acasă și lucruri","4 Priestor okolo nás",
      ["I can name rooms and objects","I can say where things are","I can say something doesn't work"],
      ["nom-pl","euro-count","possessives"],CORE,
      {"pool":"band1+2","lemmas":["dom","byt","izba","dvere","okno","stôl","posteľ","kľúč","heslo","fungovať","pokazený","hore","dole","vpravo","vľavo"],"n":30},
      domain="work_tech"),
 unit("1.12","Family & people","Familie și oameni","8 Môj život",
      ["I can talk about my family","I can describe someone simply"],
      ["possessives","acc-sg","adj-agreement"],CORE,
      {"pool":"band1+2","lemmas":["rodina","brat","sestra","otec","matka","mama","dieťa","deti","syn","dcéra","manžel","manželka","kamarát","priateľ","milý","starý","mladý","oko","vlas"],"n":30}),
 unit("1.13","Sunday","Duminică",None,
      ["I can greet and respond at church","I can say the Lord's Prayer","I know omša / bohoslužba / služby Božie"],
      ["vykanie-verbs","reflexive-passive"],["D1","A1","X1"],
      {"pool":"chunks+texts","units":["1.13"],"texts":["otcenas"]},
      roleplay="R4-after-church",creative="X1 verse of the day",domain="church",
      milestone="Phase 1 exit: 2-min self-intro; R1 done; SAS A1 can-do ≥ 80%; coverage ≥ 70%"),

 unit("2.1","Yesterday","Ieri","3 Práca a kariéra (A2)",
      ["I can say what I did yesterday / last weekend","I place som/si/sa correctly"],
      ["past-tense","clitic-second","aspect-intro","word-order","adj-agreement"],CORE+["C4"],
      {"pool":"band1+2","filter":"tense=past","n":40,"prefer_native":True}),
 unit("2.2","Tomorrow","Mâine","3",["I can make plans and appointments","I use perfective present as future"],
      ["perfective-future","future-budem","ze-aby-ked","dates"],CORE+["C4"],{"pool":"band1+2","filter":"tense=future","n":40}),
 unit("2.3","Whose, of what","Al cui, din ce","4 Obchody a nakupovanie",["I use the genitive for of/from/without and after 5+"],
      ["gen-sg","negative-existence","plural-cases"],CORE+["B2","F2"],{"pool":"band1+2","filter":"case=gen","n":40}),
 unit("2.4","Where vs. where to","Unde vs. încotro","1 Priestor (A2), 5 Cestovanie",["I choose accusative vs locative with na / do-v / pod-nad-za"],
      ["acc-vs-loc-na","motion-verbs","do-vs-v"],CORE+["F3","F2"],{"pool":"band1+2","filter":"case in (acc,loc)","n":40},domain="transport"),
 unit("2.5","To whom","Cui","2 Život online",["I can give, send, call, write to people","I use dative pronouns"],
      ["dat-sg","verb-govern","bavi-zaujima"],CORE+["B2"],{"pool":"band1+2","filter":"case=dat","n":40}),
 unit("2.6","With what, with whom","Cu ce, cu cine","5",["I use the instrumental for transport and company","I can name all six cases"],
      ["instr-sg","cases-overview","plural-cases"],CORE+["F2"],{"pool":"band1+2","filter":"case=instr","n":40},
      milestone="F2 case sorter ≥ 80% across all six cases",domain="transport"),
 unit("2.7","Shopping properly","Cumpărături ca lumea","4",["I can ask for sizes, compare, return things","I can make polite requests with by"],
      ["conditional","comparison","diminutives"],CORE+["C6"],{"pool":"domain:food_market","n":40},domain="food_market",creative="X7 diminutive day"),
 unit("2.8","Work & tech","Muncă și tehnologie","2, 3",["I can describe my job, a bug, a meeting","I understand the Anglicisms Slovak devs use"],
      ["imperative-systematic","ktory-relative","bavi-zaujima"],CORE,{"pool":"domain:work_tech","n":40},roleplay="R5-standup",domain="work_tech",creative="X9 teach it back"),
 unit("2.9","Health & pharmacy","Sănătate și farmacie","8 Zdravie",["I can describe symptoms","I understand dosage instructions"],
      ["dative-experiencer","imperative-systematic"],CORE,{"pool":"band2+3","lemmas":["bolieť","liek","lekáreň","lekár","teplota","chorý","zdravý","recept","tabletka","nádcha","chrípka"],"n":30},roleplay="R6-pharmacy"),
 unit("2.10","Slovakia & Romania","Slovacia și România","6 Slovensko a moja krajina",["I can compare the two countries and explain where I'm from"],
      ["comparison","adj-agreement","czech-radar"],CORE,{"pool":"band2","lemmas":["Slovensko","Rumunsko","krajina","hlavný","mesto","hory","rieka","jazyk","ľudia","kultúra"],"n":30}),
 unit("2.11","Family & relationships","Familie și relații","7 Rodina",["I can describe people and relationships","I can invite, accept, decline, congratulate"],
      ["numbers-animate","vocative-remnant","adj-agreement"],CORE,{"pool":"band2","n":40},roleplay="R7-neighbour"),
 unit("2.12","After church","După slujbă",None,["I can make small talk after a service","I know the shared church vocabulary of both traditions"],
      ["reflexive-passive","gen-sg"],["D1","A1","C1","X1"],{"pool":"domain:church","n":40},roleplay="R4-after-church",domain="church",
      milestone="Phase 2 exit: 5-sentence weekend story; 3-min conversation (R4/R5); 60-word message OK"),
]

def main():
    chunks = list(read_jsonl(os.path.join(CONTENT, "chunks.jsonl")))
    notes = {n["id"] for n in read_jsonl(os.path.join(CONTENT, "grammar_notes.jsonl"))}
    recs, missing = [], set()
    for u in U:
        u["chunks"] = [c["id"] for c in chunks if c["unit"] == u["id"]]
        for g in u["grammar_notes"]:
            if g not in notes: missing.add(g)
        u["phase"] = int(u["id"].split(".")[0])
        u.update(source="authored (SAS A1/A2 CC BY-NC-SA; research §9)", licence=LICENCES["authored"]["licence"],
                 attribution=LICENCES["authored"]["attribution"], review_status=REVIEW_NEEDS)
        recs.append(u)
    out = os.path.join(CONTENT, "lessons.jsonl")
    n = write_jsonl(out, recs)
    print(f"  wrote {n} units -> {out}")
    print(f"  chunks attached: {sum(len(u['chunks']) for u in recs)} | grammar note refs: {sum(len(u['grammar_notes']) for u in recs)}")
    if missing: print("  !! grammar notes referenced but not authored:", sorted(missing))

if __name__ == "__main__":
    main()
