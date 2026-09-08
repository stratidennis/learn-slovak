#!/usr/bin/env python3
"""Extract just the lemmas we care about from the 53 MB kaikki dump.

kaikki.org marks its per-language `kaikki.org-dictionary-*.jsonl` files as
DEPRECATED, and its replacement per-Wiktionary-edition extracts do not include
Slovak. So this file is the only packaged Slovak extraction available and will
eventually disappear. We commit the extracted subset (small, diffable, exactly
the fields we consume) and keep the raw dump as a local cache. See
docs/DECISIONS.md D106.

    .venv/bin/python -m pipeline.extract_kaikki

Input :  pipeline/work/kaikki-slovak.jsonl  (or spike_data/, or downloaded)
Output:  data/kaikki_subset.jsonl           (committed)
"""
from __future__ import annotations

import collections
import json
import os

from .common import DATA, LICENCES, fetch, load_bands, write_jsonl

KAIKKI_URL = "https://kaikki.org/dictionary/Slovak/kaikki.org-dictionary-Slovak.jsonl"

# `forms` mixes three things: table scaffolding, paradigm cells, and derived
# words (comparative, adverb, relational adjective, diminutive). Split them.
SCAFFOLD_TAGS = {"table-tags", "inflection-template"}
SCAFFOLD_WORDS = {"no-table-tags", "sk-ndecl", "sk-adecl", "sk-conj", "sk-pron-decl"}
PARADIGM_SOURCES = {"declension", "conjugation"}
# Row/column headers wiktextract emits as untagged cells inside an untagged table.
TABLE_HEADERS = {
    "singular", "plural", "dual", "nominative", "genitive", "dative",
    "accusative", "locative", "instrumental", "vocative", "case", "number",
    "masculine", "feminine", "neuter", "animate", "inanimate",
}


def split_forms(entry: dict) -> tuple[list[dict], list[dict], list[str]]:
    """-> (tagged paradigm cells, derived words, untagged paradigm cells)

    Slovak NOUN tables in this dump are emitted `no-table-tags`: the cells carry
    `source: "declension"` but no morphological tags, and wiktextract dedupes
    repeated values, so `žena` loses gen sg (== nom pl `ženy`) and `stôl` loses
    its whole accusative row. Those tables therefore CANNOT be reconstructed
    positionally. Verbs, adjectives and most pronouns are properly tagged.

    Untagged cells are still returned -- as an ordered list, honestly labelled --
    so the data is preserved for a later paradigm-generation pass rather than
    silently dropped. See docs/DECISIONS.md D107.
    """
    paradigm, derived, untagged = [], [], []
    seen_p, seen_d = set(), set()
    for f in entry.get("forms", []):
        form = (f.get("form") or "").strip()
        raw_tags = f.get("tags", [])
        if not form or form in SCAFFOLD_WORDS or (set(raw_tags) & SCAFFOLD_TAGS):
            continue
        tags = [t for t in raw_tags if t not in SCAFFOLD_TAGS]
        in_table = f.get("source") in PARADIGM_SOURCES
        if in_table and not tags:
            if form.lower() not in TABLE_HEADERS:
                untagged.append(form)
            continue
        if not tags:
            continue
        key = (form, tuple(tags))
        if in_table:
            if key not in seen_p:
                seen_p.add(key)
                paradigm.append({"form": form, "tags": tags})
        else:
            if key not in seen_d:
                seen_d.add(key)
                derived.append({"form": form, "tags": tags})
    return paradigm, derived, untagged


def pick_ipa(entry: dict) -> tuple[str | None, str | None]:
    """(phonemic /.../, phonetic [...]) — kaikki usually gives both."""
    phonemic = phonetic = None
    for s in entry.get("sounds", []):
        ipa = s.get("ipa")
        if not ipa:
            continue
        if ipa.startswith("[") and phonetic is None:
            phonetic = ipa
        elif ipa.startswith("/") and phonemic is None:
            phonemic = ipa
    return phonemic, phonetic


def pick_audio(entry: dict) -> list[dict]:
    """Wikimedia Commons recordings — real human voices, worth keeping (§11.2)."""
    out = []
    for s in entry.get("sounds", []):
        url = s.get("ogg_url") or s.get("mp3_url")
        if url:
            out.append({"url": url, "note": s.get("note"),
                        **LICENCES["wikimedia-commons"]})
    return out


def head_args(entry: dict) -> dict:
    hts = entry.get("head_templates") or []
    return (hts[0].get("args") or {}) if hts else {}


def extract(entry: dict) -> dict:
    args = head_args(entry)
    phonemic, phonetic = pick_ipa(entry)
    pos = entry.get("pos")
    senses = []
    for s in entry.get("senses", []):
        glosses = s.get("glosses")
        if not glosses:
            continue
        senses.append({"glosses": glosses,
                       "tags": [t for t in s.get("tags", []) if t != "form-of"]})
    paradigm, derived, untagged = split_forms(entry)
    # noun gender/animacy lives in head arg "1" (f / m-in / m-pr / m-anml / n);
    # verb aspect in head arg "a" (impf/pf/both).
    gender = args.get("1") if pos == "noun" else None
    rec = {
        "word": entry["word"],
        "pos": pos,
        "gender": gender if isinstance(gender, str) else None,
        "aspect": args.get("a") if pos == "verb" else None,
        "ipa": phonemic,
        "ipa_phonetic": phonetic,
        "senses": senses,
        "forms": paradigm,
        "derived": derived,
        "audio": pick_audio(entry),
        "etymology": entry.get("etymology_text"),
        "head_args": {k: v for k, v in args.items() if isinstance(v, str)},
    }
    if untagged:
        # preserved, not parsed -- see split_forms()
        rec["paradigm_cells_untagged"] = untagged
        rec["paradigm_args"] = [
            it.get("args", {}) for it in (entry.get("inflection_templates") or [])
        ]
    return rec


def main() -> None:
    bands = load_bands()
    src = fetch(KAIKKI_URL, "kaikki-slovak.jsonl")
    print(f"  reading {src}")

    kept: dict[str, list[dict]] = collections.defaultdict(list)
    total = 0
    for line in open(src, encoding="utf-8"):
        total += 1
        try:
            e = json.loads(line)
        except json.JSONDecodeError:
            continue
        w = e.get("word", "")
        if w.lower() in bands:
            kept[w.lower()].append(extract(e))

    # One record per lemma; a lemma with several POS entries keeps them all so
    # build_lexicon can choose (e.g. `rád` adj vs adv).
    records = []
    for lemma in sorted(kept):
        records.append({
            "lemma": lemma,
            "entries": kept[lemma],
            "source": "kaikki",
            **{k: v for k, v in LICENCES["kaikki"].items() if k != "url"},
            "source_url": LICENCES["kaikki"]["url"],
        })
    out = os.path.join(DATA, "kaikki_subset.jsonl")
    n = write_jsonl(out, records)

    covered = collections.Counter()
    for lemma in kept:
        covered[bands[lemma]["band"]] += 1
    size_mb = os.path.getsize(out) / 1e6
    print(f"  scanned {total:,} kaikki entries")
    print(f"  wrote {n:,} lemmas -> {out}  ({size_mb:.1f} MB)")
    for band in sorted(covered):
        total_in_band = sum(1 for v in bands.values() if v["band"] == band)
        print(f"    band {band}: {covered[band]:4d} / {total_in_band:4d} "
              f"({covered[band]/total_in_band*100:.0f}%)")


if __name__ == "__main__":
    main()
