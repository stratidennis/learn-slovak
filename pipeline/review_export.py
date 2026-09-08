#!/usr/bin/env python3
"""Export a reviewer-friendly CSV of records that need a human.

    .venv/bin/python -m pipeline.review_export --what gloss-gaps --band 1
    .venv/bin/python -m pipeline.review_export --what sentences --band 1 --limit 300

The loop is: export CSV -> open in a spreadsheet -> a Slovak speaker (or you,
for the English glosses) fills the `*_new` and `verdict` columns -> feed it back
through review_import. Provenance columns are carried through untouched so an
imported verdict can never be attached to the wrong record.

Every row carries an example sentence where one exists: glossing `no` or `však`
in the abstract is much harder than glossing it with a sentence in front of you.
"""
from __future__ import annotations

import argparse
import collections
import csv
import os

from .common import CONTENT, ROOT, read_jsonl

REVIEW_DIR = os.path.join(ROOT, "review")

GLOSS_COLUMNS = [
    "id", "lemma", "rank", "band", "pos", "gender", "aspect", "ipa",
    "gloss_en_current", "gloss_en_new", "gloss_ro_current", "gloss_ro_new",
    "example_sk", "example_en", "register_flag", "cognate_ro", "notes", "verdict",
]
SENTENCE_COLUMNS = [
    "id", "sk", "en", "ro_current", "ro_new", "band", "spoken_rank_max",
    "native_author", "register_flags", "sounds_natural", "natives_say", "notes", "verdict",
]


def examples_by_lemma(max_per: int = 1) -> dict[str, list[dict]]:
    """One short, preferably native-authored example per lemma."""
    out: dict[str, list[dict]] = collections.defaultdict(list)
    sents = list(read_jsonl(os.path.join(CONTENT, "sentences.jsonl")))
    sents.sort(key=lambda r: (not r["native_author"], not bool(r["en"]), r["n_words"]))
    for r in sents:
        for lem in r["content_lemmas"]:
            if len(out[lem]) < max_per:
                out[lem].append(r)
    return out


def export_gloss_gaps(band: int, limit: int | None, only_missing: bool) -> str:
    lex = list(read_jsonl(os.path.join(CONTENT, "lexemes.jsonl")))
    ex = examples_by_lemma()
    rows = []
    for r in lex:
        if r["band"] > band:
            continue
        if only_missing and r["gloss_en"] and r["gloss_ro"]:
            continue
        e = ex.get(r["lemma"], [])
        rows.append({
            "id": r["id"], "lemma": r["lemma"], "rank": r["spoken_rank"], "band": r["band"],
            "pos": r["pos"] or "", "gender": r["gender"] or "", "aspect": r["aspect"] or "",
            "ipa": r["ipa"] or "",
            "gloss_en_current": "; ".join(r["gloss_en"]),
            "gloss_en_new": "",
            "gloss_ro_current": "; ".join(r["gloss_ro"]),
            "gloss_ro_new": "",
            "example_sk": e[0]["sk"] if e else "",
            "example_en": (e[0]["en"][0] if e and e[0]["en"] else ""),
            "register_flag": r["register_flag"] or "",
            "cognate_ro": "; ".join(c["ro"] for c in (r["cognate_ro"] or [])),
            "notes": "", "verdict": "",
        })
    rows.sort(key=lambda x: x["rank"])
    if limit:
        rows = rows[:limit]
    # two different jobs, two different files: the gaps file is "write the
    # missing glosses", the review file is "check the drafts that already exist".
    stem = "gloss_gaps" if only_missing else "gloss_review"
    path = os.path.join(REVIEW_DIR, f"{stem}_band{band}.csv")
    write_csv(path, GLOSS_COLUMNS, rows)
    return path


def export_sentences(band: int, limit: int | None) -> str:
    sents = [r for r in read_jsonl(os.path.join(CONTENT, "sentences.jsonl"))
             if r["band"] is not None and r["band"] <= band and not r["register_flags"]]
    sents.sort(key=lambda r: (not r["band1_clean"], not r["native_author"], r["n_words"]))
    if limit:
        sents = sents[:limit]
    rows = [{
        "id": r["id"], "sk": r["sk"], "en": (r["en"][0] if r["en"] else ""),
        "ro_current": (r["ro"][0] if r["ro"] else ""), "ro_new": "",
        "band": r["band"], "spoken_rank_max": r["spoken_rank_max"] or "",
        "native_author": "yes" if r["native_author"] else "no",
        "register_flags": "; ".join(r["register_flags"]),
        "sounds_natural": "", "natives_say": "", "notes": "", "verdict": "",
    } for r in sents]
    path = os.path.join(REVIEW_DIR, f"sentences_band{band}.csv")
    write_csv(path, SENTENCE_COLUMNS, rows)
    return path


def write_csv(path: str, columns: list[str], rows: list[dict]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=columns)
        w.writeheader()
        w.writerows(rows)
    print(f"  wrote {len(rows):,} rows -> {path}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--what", choices=["gloss-gaps", "sentences"], default="gloss-gaps")
    ap.add_argument("--band", type=int, default=1)
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--all-rows", action="store_true",
                    help="include records that already have both glosses")
    args = ap.parse_args()
    if args.what == "gloss-gaps":
        export_gloss_gaps(args.band, args.limit, not args.all_rows)
    else:
        export_sentences(args.band, args.limit)


if __name__ == "__main__":
    main()
