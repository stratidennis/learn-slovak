#!/usr/bin/env python3
"""Build content/lexemes.jsonl — the app's vocabulary backbone.

    .venv/bin/python -m pipeline.build_lexicon

Joins:
    lexicon_bands.csv        rank, band, subtitle frequency
    data/kaikki_subset.jsonl gloss(EN), IPA, POS, gender, aspect, forms, audio
    data/cognates_ro.json    §4.3 Romanian cognate bootstrap
    data/false_friends_ro.json §4.4
    data/register_flags.json §15.2 bug #3
    data/glosses_manual.json hand-written glosses (EN and/or RO), authoritative

Output record shape follows research §10.2, extended with the provenance fields
the START-HERE guardrail requires on every record.
"""
from __future__ import annotations

import collections
import json
import os

from .common import (CONTENT, DATA, LICENCES, REVIEW_NEEDS, REVIEW_OK,
                     REVIEW_UNREVIEWED, load_bands, read_jsonl, write_jsonl)
from .hunspell_sk import load as load_hunspell

# kaikki POS -> UD-style tag used in the app
POS_MAP = {
    "verb": "VERB", "noun": "NOUN", "adj": "ADJ", "adv": "ADV", "pron": "PRON",
    "prep": "ADP", "conj": "CCONJ", "num": "NUM", "intj": "INTJ",
    "particle": "PART", "det": "DET", "name": "PROPN", "character": "X",
    "suffix": "X", "prefix": "X", "phrase": "X", "proverb": "X",
}
# Entries whose POS is a lexical word beat entries that merely describe a
# glyph or a name; see rank_entry().
POS_PRIORITY = {"character": 0, "name": 0, "suffix": 0, "prefix": 0, "phrase": 0}

# kaikki noun head arg -> (gender, animacy)
GENDER_MAP = {
    "m": ("masc", None), "m-in": ("masc", "inanimate"), "m-pr": ("masc", "animate"),
    "m-anml": ("masc", "animate"), "f": ("fem", None), "n": ("neut", None),
}


STATUS_RANK = {REVIEW_NEEDS: 0, REVIEW_UNREVIEWED: 1, REVIEW_OK: 2, None: 0}


def worst_status(en_status, ro_status, gloss_en, gloss_ro):
    if not gloss_en or not gloss_ro:
        return REVIEW_NEEDS
    return min((en_status, ro_status), key=lambda s: STATUS_RANK.get(s, 0))


def load_json(name: str) -> dict:
    path = os.path.join(DATA, name)
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main() -> None:
    bands = load_bands()
    kaikki = {r["lemma"]: r for r in read_jsonl(os.path.join(DATA, "kaikki_subset.jsonl"))}
    cognates = load_json("cognates_ro.json").get("entries", [])
    friends = load_json("false_friends_ro.json").get("entries", [])
    reg = load_json("register_flags.json")
    manual = load_json("glosses_manual.json").get("glosses", {})
    # kaikki's Slovak noun tables are untagged and lossy (D107); hunspell-sk's
    # affix rules carry the cases, so nouns get their paradigm from there.
    try:
        hs = load_hunspell()
    except FileNotFoundError:
        hs = None
        print("  note: hunspell-sk not unpacked — noun paradigms will be missing")

    # index the Romanian tables by Slovak lemma
    cog_by_sk: dict[str, list[dict]] = collections.defaultdict(list)
    for c in cognates:
        for lem in c["sk_lemmas"]:
            cog_by_sk[lem].append(c)
    ff_by_sk: dict[str, list[dict]] = collections.defaultdict(list)
    for f in friends:
        ff_by_sk[f["sk"]].append(f)

    records, stats = [], collections.Counter()
    for lemma, meta in sorted(bands.items(), key=lambda kv: kv[1]["rank"]):
        kk = kaikki.get(lemma)
        entries = kk["entries"] if kk else []
        # Prefer the entry that carries a gloss, then a *useful* part of speech,
        # then the richest one. Without the POS term, `a` picks its "character"
        # entry ("the first letter of the Slovak alphabet") over its conjunction
        # entry ("and") -- the single most common word in the language, glossed
        # as a letter.
        def rank_entry(e):
            return (bool(e["senses"]), POS_PRIORITY.get(e["pos"], 1), len(e["forms"]))

        entries = sorted(entries, key=rank_entry, reverse=True)
        main_e = entries[0] if entries else None

        gloss_en, sources, gloss_status = [], [], None
        man = manual.get(lemma) or {}
        if man.get("en"):
            gloss_en = list(man["en"])
            sources.append("authored")
            gloss_status = REVIEW_OK if man.get("reviewed_en") else REVIEW_NEEDS
            stats["gloss_en_manual"] += 1
        elif main_e and main_e["senses"]:
            gloss_en = [g for s in main_e["senses"] for g in s["glosses"]][:4]
            sources.append("kaikki")
            gloss_status = REVIEW_UNREVIEWED
            stats["gloss_en_kaikki"] += 1
        else:
            stats["gloss_en_MISSING"] += 1

        gloss_ro, ro_status = [], None
        if man.get("ro"):
            gloss_ro = list(man["ro"])
            ro_status = REVIEW_OK if man.get("reviewed_ro") else REVIEW_NEEDS
            stats["gloss_ro_manual"] += 1
        else:
            stats["gloss_ro_MISSING"] += 1

        gender = animacy = None
        if main_e and main_e.get("gender"):
            gender, animacy = GENDER_MAP.get(main_e["gender"], (None, None))

        forms = main_e.get("forms") if main_e else []
        forms_source = "kaikki" if forms else None
        if not forms and hs is not None:
            hf = [{"form": f["form"], "tags": f["tags"]}
                  for f in hs.expand(lemma) if f["tags"]]
            if hf:
                forms, forms_source = hf, "hunspell-sk"
                stats["forms_from_hunspell"] += 1

        flag = reg.get("flags", {}).get(lemma)
        cog = cog_by_sk.get(lemma)
        ff = ff_by_sk.get(lemma)

        rec = {
            "id": f"sk:{lemma}",
            "lemma": lemma,
            "pos": POS_MAP.get(main_e["pos"], "X") if main_e else None,
            "pos_all": sorted({POS_MAP.get(e["pos"], "X") for e in entries}) or None,
            "gender": gender,
            "animacy": animacy,
            "aspect": main_e.get("aspect") if main_e else None,
            "spoken_rank": meta["rank"],
            "band": meta["band"],
            "subtitle_count": meta["subtitle_count"],
            "ipa": main_e.get("ipa") if main_e else None,
            "ipa_phonetic": main_e.get("ipa_phonetic") if main_e else None,
            "gloss_en": gloss_en,
            "gloss_ro": gloss_ro,
            "forms": forms,
            "forms_source": forms_source,
            "forms_untagged": main_e.get("paradigm_cells_untagged") if main_e else None,
            "paradigm_args": main_e.get("paradigm_args") if main_e else None,
            "derived": main_e.get("derived") if main_e else [],
            "human_audio": main_e.get("audio") if main_e else [],
            "cognate_ro": [{"ro": c["ro"], "note": c["note"],
                            "semantic_shift": c["semantic_shift"]} for c in cog] if cog else None,
            "false_friend_ro": [{"ro": f["ro"], "ro_means": f["ro_means"],
                                 "sk_means": f["sk_means"]} for f in ff] if ff else None,
            "register_flag": flag,
            # §15.3: band 1 is trustworthy frequency data; domain vocabulary is NOT
            # frequency-ordered and must be hand-curated. Recorded per-record so
            # future-me does not re-derive the wrong conclusion from the ranks.
            "corpus_bias": ("subtitle frequency is reliable for function words and core verbs; "
                            "it over-weights crime/drama vocabulary and under-weights everyday "
                            "transactional words — see research §15.3"),
            "domains": ["core"] if meta["band"] == 1 else [],
            "source": sorted(set(sources + (["kaikki"] if kk else [])
                                 + ([forms_source] if forms_source else []))),
            "licence": LICENCES["kaikki"]["licence"] if kk else LICENCES["authored"]["licence"],
            "attribution": LICENCES["kaikki"]["attribution"] if kk else LICENCES["authored"]["attribution"],
            "review_status": {
                "gloss_en": gloss_status,
                "gloss_ro": ro_status,
                # the weakest component wins: a record is only as trustworthy as
                # its least-checked field
                "overall": worst_status(gloss_status, ro_status, gloss_en, gloss_ro),
            },
        }
        if flag:
            stats[f"flag_{flag}"] += 1
        if cog:
            stats["has_cognate_ro"] += 1
        if ff:
            stats["has_false_friend"] += 1
        if rec["ipa"]:
            stats["has_ipa"] += 1
        if rec["forms"]:
            stats["has_tagged_forms"] += 1
        elif rec["forms_untagged"]:
            stats["forms_untagged_only"] += 1
        records.append(rec)

    out = os.path.join(CONTENT, "lexemes.jsonl")
    n = write_jsonl(out, records)
    print(f"  wrote {n:,} lexemes -> {out}  ({os.path.getsize(out)/1e6:.1f} MB)")
    for k in sorted(stats):
        print(f"    {k:24s} {stats[k]:5d}")

    print("\n  gloss coverage by band:")
    for band in (1, 2, 3, 4):
        rs = [r for r in records if r["band"] == band]
        en = sum(1 for r in rs if r["gloss_en"])
        ro = sum(1 for r in rs if r["gloss_ro"])
        print(f"    band {band}: EN {en:4d}/{len(rs):4d} ({en/len(rs)*100:3.0f}%)   "
              f"RO {ro:4d}/{len(rs):4d} ({ro/len(rs)*100:3.0f}%)")


if __name__ == "__main__":
    main()
