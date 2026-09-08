#!/usr/bin/env python3
"""Build content/sentences.jsonl — the sentence bank.

    .venv/bin/python -m pipeline.build_sentences

Sources: Tatoeba Slovak sentences + EN/RO translations via the links table.
Filters (START-HERE M2.2, research §7.3): 3–12 words, Czech grapheme/stopword
check, hunspell OOV <= 1, dedupe, register flags.
Annotations: lemmas, spoken_rank_max, band, translations, native-author flag.
"""
from __future__ import annotations

import bz2
import collections
import json
import os
import re
import tarfile
import unicodedata

import simplemma

from .common import (CONTENT, DATA, LICENCES, REVIEW_NEEDS, REVIEW_UNREVIEWED,
                     WORK, fetch, load_bands, make_denegator, tokenize, write_jsonl)
from .hunspell_sk import load as load_hunspell

TB = "https://downloads.tatoeba.org/exports/"
MIN_WORDS, MAX_WORDS = 3, 12
MAX_OOV = 1

# Czech-only graphemes. Slovak uses none of these.
CZECH_CHARS = set("řěů")
# Czech function words that are not Slovak. Every one checked against the Slovak
# lexicon first -- §15.2 bug #1 is exactly this mistake made in the other
# direction. `ale`, `to`, `no`, `a`, `je`, `se` are shared or Slovak and are NOT here.
CZECH_STOPWORDS = {
    "jsem", "jsi", "jsme", "jste", "jsou", "není", "nejsem", "nevím", "bych",
    "bysme", "byste", "tady", "tohle", "protože", "takže", "jenom", "ještě",
    "můžu", "chci", "jak", "jenže", "dneska", "prosím_tě", "vždyť", "jseš",
    "kluk", "holka", "prostě", "vlastně_cz", "něco", "nějak", "špatně",
    "peníze_cz", "zase", "možná", "asi_cz", "vůbec", "třeba", "vlastně",
}


def norm_key(text: str) -> str:
    """Diacritic- and case-insensitive dedupe key."""
    s = unicodedata.normalize("NFKD", text.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", "", s).strip()


def proper_noun_mask(toks: list[str], known_forms: set[str]) -> list[bool]:
    """Which tokens are proper nouns (transparent to the learner)?

    Tatoeba's Tom-and-Mary convention makes names the single most common
    "unknown lemma" (see docs/SPIKE-RESULTS.md Q1), so they must not be counted
    against a sentence's band. But "capitalised" alone is wrong: the FIRST word
    of every sentence is capitalised too, and treating it as a name silently
    drops the main verb from `Mám ísť s tebou?`.

    Rule: capitalised and not sentence-initial -> name. Capitalised and
    sentence-initial -> name only if hunspell does not recognise the lowercase
    form (so `Mám` stays a verb, `Xemeneus` becomes a name).
    """
    mask = []
    for i, t in enumerate(toks):
        if not t[0].isupper():
            mask.append(False)
        elif i > 0:
            mask.append(True)
        else:
            mask.append(t.lower() not in known_forms)
    return mask


def read_bz2_tsv(path: str):
    with bz2.open(path, "rt", encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\n").split("\t")


def load_links(path: str, want: set[int]) -> dict[int, list[int]]:
    """sentence_id -> [translation_ids], restricted to `want` on the left side."""
    out: dict[int, list[int]] = collections.defaultdict(list)
    with tarfile.open(path, "r:bz2") as tf:
        member = tf.getmember("links.csv")
        fh = tf.extractfile(member)
        for raw in fh:
            a, _, b = raw.decode("utf-8").rstrip("\n").partition("\t")
            try:
                ai = int(a)
            except ValueError:
                continue
            if ai in want:
                try:
                    out[ai].append(int(b))
                except ValueError:
                    pass
    return out


def main() -> None:
    bands = load_bands()
    denegate = make_denegator(bands)
    band_of = {lem: m["band"] for lem, m in bands.items()}
    rank_of = {lem: m["rank"] for lem, m in bands.items()}

    reg_path = os.path.join(DATA, "register_flags.json")
    reg = json.load(open(reg_path, encoding="utf-8")) if os.path.exists(reg_path) else {"flags": {}}
    flags = reg.get("flags", {})

    print("  loading hunspell-sk ...")
    hs = load_hunspell()
    known_forms = set(f.lower() for f in hs.all_forms())
    print(f"    {len(known_forms):,} surface forms")

    # ---------------------------------------------------------------- sources
    detailed = fetch(TB + "per_language/slk/slk_sentences_detailed.tsv.bz2",
                     "slk_sentences_detailed.tsv.bz2")
    sk: dict[int, dict] = {}
    for row in read_bz2_tsv(detailed):
        if len(row) >= 4 and row[1] == "slk":
            sk[int(row[0])] = {"text": row[2], "owner": row[3] or None}
    print(f"  Slovak sentences: {len(sk):,}")

    # native-speaker authorship (research §12: prefer natives)
    ul = fetch(TB + "user_languages.tar.bz2", "user_languages.tar.bz2")
    natives: set[str] = set()
    with tarfile.open(ul, "r:bz2") as tf:
        name = tf.getnames()[0]
        for raw in tf.extractfile(name):
            r = raw.decode("utf-8").rstrip("\n").split("\t")
            # lang, skill_level, username, details ; "5" == native
            if len(r) >= 3 and r[0] == "slk" and r[1] == "5":
                natives.add(r[2])
    print(f"  self-declared native Slovak contributors: {len(natives)}")

    # ---------------------------------------------------------------- filters
    stats = collections.Counter()
    seen_keys: set[str] = set()
    kept: dict[int, dict] = {}
    for sid, row in sk.items():
        text = row["text"]
        toks = tokenize(text)
        stats["total"] += 1
        if not (MIN_WORDS <= len(toks) <= MAX_WORDS):
            stats["drop_length"] += 1
            continue
        low = [t.lower() for t in toks]
        if any(set(t) & CZECH_CHARS for t in low):
            stats["drop_czech_grapheme"] += 1
            continue
        if any(t in CZECH_STOPWORDS for t in low):
            stats["drop_czech_stopword"] += 1
            continue
        is_name = proper_noun_mask(toks, known_forms)
        oov = [t for t, nm in zip(low, is_name) if t not in known_forms and not nm]
        if len(oov) > MAX_OOV:
            stats["drop_oov"] += 1
            continue
        key = norm_key(text)
        if key in seen_keys:
            stats["drop_duplicate"] += 1
            continue
        seen_keys.add(key)

        lemmas = [denegate(simplemma.lemmatize(t, lang="sk")) for t in low]
        # proper nouns are transparent: Tatoeba's Tom/Mary convention would
        # otherwise dominate the i+1 selector (see docs/SPIKE-RESULTS.md Q1).
        content_lemmas = [l for l, nm in zip(lemmas, is_name) if not nm]
        unknown = [l for l in content_lemmas if l not in band_of]
        ranks = [rank_of[l] for l in content_lemmas if l in band_of]
        flagged = sorted({flags[l] for l in lemmas if l in flags})

        kept[sid] = {
            "text": text, "owner": row["owner"], "lemmas": lemmas,
            "content_lemmas": content_lemmas, "unknown": unknown,
            "oov": oov, "ranks": ranks, "flags": flagged,
            "proper_nouns": [t for t, nm in zip(toks, is_name) if nm],
        }
        stats["kept"] += 1

    print("  filter results:")
    for k in sorted(stats):
        print(f"    {k:22s} {stats[k]:7,}")

    # ----------------------------------------------------------- translations
    print("  loading links (150 MB, one pass) ...")
    links_path = fetch(TB + "links.tar.bz2", "links.tar.bz2")
    links = load_links(links_path, set(kept))
    wanted_ids = {t for v in links.values() for t in v}
    print(f"    {len(links):,} sentences have links, {len(wanted_ids):,} translation ids")

    trans: dict[int, tuple[str, str]] = {}
    for lang, fname in (("eng", "eng_sentences.tsv.bz2"), ("ron", "ron_sentences.tsv.bz2")):
        path = fetch(TB + f"per_language/{lang[:3]}/{fname}", fname)
        n = 0
        for row in read_bz2_tsv(path):
            if len(row) >= 3:
                tid = int(row[0])
                if tid in wanted_ids:
                    trans[tid] = (lang, row[2])
                    n += 1
        print(f"    {lang}: {n:,} translations matched")

    # ---------------------------------------------------------------- output
    records = []
    counts = collections.Counter()
    for sid, k in sorted(kept.items()):
        en, ro = [], []
        for tid in links.get(sid, []):
            t = trans.get(tid)
            if not t:
                continue
            (en if t[0] == "eng" else ro).append(t[1])
        band = max((band_of[l] for l in k["content_lemmas"] if l in band_of), default=None)
        if k["unknown"]:
            band = None                      # contains something outside the 3,000
        native = k["owner"] in natives if k["owner"] else False
        rec = {
            "id": f"tat:{sid}",
            "sk": k["text"],
            "en": en[:3],
            "ro": ro[:3],
            "lemmas": sorted(set(k["lemmas"])),
            "content_lemmas": sorted(set(k["content_lemmas"])),
            "unknown_lemmas": sorted(set(k["unknown"])),
            "proper_nouns": k["proper_nouns"],
            "n_words": len(k["lemmas"]),
            "spoken_rank_max": max(k["ranks"]) if k["ranks"] else None,
            "band": band,
            "band1_clean": not k["unknown"] and all(
                band_of.get(l) == 1 for l in k["content_lemmas"] if l in band_of),
            "oov_tokens": k["oov"],
            "register_flags": k["flags"],
            "native_author": native,
            "author": k["owner"],
            "audio": None,                    # filled by build_audio
            "source": "tatoeba",
            "licence": LICENCES["tatoeba"]["licence"],
            "attribution": (f"{k['owner']} @ Tatoeba" if k["owner"] else "Tatoeba"),
            "review_status": REVIEW_UNREVIEWED if native else REVIEW_NEEDS,
        }
        records.append(rec)
        counts["with_en"] += bool(en)
        counts["with_ro"] += bool(ro)
        counts["native"] += native
        counts["flagged"] += bool(k["flags"])
        if rec["band1_clean"]:
            counts["band1_clean"] += 1

    out = os.path.join(CONTENT, "sentences.jsonl")
    n = write_jsonl(out, records)
    print(f"\n  wrote {n:,} sentences -> {out}  ({os.path.getsize(out)/1e6:.1f} MB)")
    for k in sorted(counts):
        print(f"    {k:14s} {counts[k]:6,}  ({counts[k]/n*100:.0f}%)")
    by_band = collections.Counter(r["band"] for r in records)
    print("    by band:", {k: by_band[k] for k in sorted(by_band, key=lambda x: (x is None, x))})


if __name__ == "__main__":
    main()
