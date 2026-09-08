#!/usr/bin/env python3
"""Minimal pairs for Phase 0 (research App. B) -> content/minimal_pairs.jsonl

Each pair is verified: both members must be real Slovak words hunspell knows, and they must
phonemize differently through Piper's front-end (Q3 proved that is the property that matters).
"""
from __future__ import annotations
import os
from .common import CONTENT, LICENCES, REVIEW_NEEDS, write_jsonl
from .hunspell_sk import load

PAIRS = {
 "length": [("pas","pás","passport / belt"),("sud","súd","barrel / court"),("vila","víla","villa / fairy"),("latka","látka","slat / fabric"),
            ("rad","rád","row / glad"),("krik","krík","shout / bush"),("pila","píla","she drank / saw"),("mama","máma","mum / (dial.) mum"),
            ("zle","zlé","badly / bad (n)"),("byt","být","flat / (Czech: to be)"),("dal","dál","he gave / (Czech: further)"),
            ("vina","vína","guilt / wines"),("kura","kúra","chicken / cure"),("hora","hôra","mountain / (dial.)")],
 "t-ť": [("byt","byť","flat / to be"),("mat","mať","checkmate / to have"),("ten","teň","that / shade"),("chytit","chytiť","(non-std) / to catch"),
         ("kost","kosť","(Czech) / bone"),("plat","plať","salary / pay!"),("hostia","hosťa","guests / guest (acc.)"),("vlak","vľak","train / (nonce)")],
 "l-ľ": [("lak","ľak","varnish / fright"),("lud","ľud","(nonce) / people"),("mal","mal","—"),("kolo","koľko","wheel / how many")],
 "n-ň": [("ten","teň","that / shade"),("kon","kôň","(nonce) / horse"),("plán","pláň","plan / plain"),("den","deň","(Czech) / day"),("san","saň","(nonce) / dragon")],
 "d-ď": [("dom","ďom","house / (nonce)"),("dobry","ďobať","—"),("hadam","hádam","—"),("Madar","maďar","—")],
 "h-ch": [("hlad","chlad","hunger / cold"),("hodiť","chodiť","throw / walk"),("hora","chorá","mountain / sick (f)"),("hlap","chlap","(nonce) / man"),
          ("huba","chuba","mushroom / (nonce)"),("hrad","chrad","castle / (nonce)")],
 "s-š": [("sila","šila","strength / she sewed"),("sok","šok","juice / shock"),("mys","myš","cape / mouse"),("kos","koš","blackbird / (dial.) basket"),
         ("nos","noš","nose / carry!"),("sal","šál","—")],
 "c-č": [("cena","čena","price / (nonce)"),("car","čar","tsar / charm"),("cip","čip","(nonce) / chip"),("ceska","česká","—")],
 "z-ž": [("zena","žena","(nonce) / woman"),("zila","žila","(nonce) / vein"),("kaza","kaža","—")],
 "stress": [("univerzita","—","stress on U-"),("informácia","—","stress on IN-"),("republika","—","stress on RE-"),
            ("Bratislava","—","stress on BRA-"),("Rumunsko","—","stress on RU-"),("autobusová","—","stress on AU-")],
 "diphthong": [("piatok","—","PIA-tok, two syllables"),("viem","—","one syllable"),("môj","—","[muoj]"),("kôň","—","[kuoň]"),("biely","—","[bieli]")],
}

def main():
    hs = load()
    forms = set(f.lower() for f in hs.all_forms())
    from piper import PiperVoice
    voice = PiperVoice.load(os.path.join(os.path.dirname(CONTENT), "spike_data", "voices", "sk_SK-lili-medium.onnx"))
    ipa = lambda t: "".join("".join(p) for p in voice.phonemize(t))
    recs, dropped = [], []
    for contrast, pairs in PAIRS.items():
        for a, b, gloss in pairs:
            if b == "—":                                 # single-word prosody items
                recs.append(dict(id=f"mp:{contrast}:{a}", contrast=contrast, a=a, b=None, ipa_a=ipa(a), ipa_b=None,
                                 gloss=gloss, both_real=a.lower() in forms, kind="prosody"))
                continue
            ra, rb = a.lower() in forms, b.lower() in forms
            pa, pb = ipa(a), ipa(b)
            if pa == pb:
                dropped.append((a, b, "identical phonemes")); continue
            recs.append(dict(id=f"mp:{contrast}:{a}-{b}", contrast=contrast, a=a, b=b, ipa_a=pa, ipa_b=pb, gloss=gloss,
                             both_real=ra and rb, real_a=ra, real_b=rb, kind="pair"))
    for r in recs:
        r.update(audio=None, source="authored (research App. B), hunspell-verified",
                 licence=LICENCES["authored"]["licence"], attribution=LICENCES["authored"]["attribution"], review_status=REVIEW_NEEDS)
    out = os.path.join(CONTENT, "minimal_pairs.jsonl")
    n = write_jsonl(out, recs)
    real = sum(1 for r in recs if r["kind"] == "pair" and r["both_real"])
    print(f"  wrote {n} items -> {out}   ({real} pairs where BOTH members are real Slovak words; the rest use a nonce/Czech member and are marked)")
    if dropped: print("  dropped (no phonemic difference):", dropped)
    by = {}
    for r in recs: by.setdefault(r["contrast"], []).append(r)
    for c, rs in by.items():
        print(f"    {c:9s} {len(rs):2d}  e.g. " + ", ".join(f"{r['a']}/{r['b']}" if r['b'] else r['a'] for r in rs[:4]))

if __name__ == "__main__":
    main()
