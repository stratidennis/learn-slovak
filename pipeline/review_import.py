#!/usr/bin/env python3
"""Read a filled-in review CSV back into the project's authored data.

    .venv/bin/python -m pipeline.review_import review/gloss_gaps_band1.csv

Gloss rows land in data/glosses_manual.json, which build_lexicon treats as
authoritative (it overrides kaikki). Sentence verdicts land in
data/sentence_review.json.

`verdict` is one of: ok | fix | drop | (blank = not reviewed yet).
A row is only applied when it actually says something -- a blank row is a
reviewer who has not got there yet, not an instruction to erase a gloss.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys

from .common import DATA

VALID = {"ok", "fix", "drop", ""}


def split_gloss(cell: str) -> list[str]:
    return [g.strip() for g in cell.split(";") if g.strip()]


def import_glosses(path: str, reviewed: bool) -> None:
    out_path = os.path.join(DATA, "glosses_manual.json")
    store = {"_comment": "Hand-authored glosses. Authoritative — build_lexicon "
                         "prefers these over kaikki. reviewed_en / reviewed_ro "
                         "mean a native signed off on THAT language; anything "
                         "else stays needs_review.",
             "glosses": {}}
    if os.path.exists(out_path):
        store = json.load(open(out_path, encoding="utf-8"))
    glosses = store.setdefault("glosses", {})

    applied = skipped = dropped = 0
    with open(path, encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh):
            verdict = (row.get("verdict") or "").strip().lower()
            if verdict not in VALID:
                sys.exit(f"row {row.get('lemma')!r}: bad verdict {verdict!r} "
                         f"(expected one of {sorted(VALID - {''})})")
            en = split_gloss(row.get("gloss_en_new", ""))
            ro = split_gloss(row.get("gloss_ro_new", ""))
            lemma = (row.get("lemma") or "").strip()
            if not lemma:
                continue
            if verdict == "drop":
                glosses.pop(lemma, None)
                dropped += 1
                continue
            if not en and not ro and verdict != "ok":
                skipped += 1          # blank row: reviewer hasn't reached it
                continue
            entry = glosses.setdefault(lemma, {})
            # Sign-off is per language. A reviewer who fixes the English gloss
            # has said nothing about the Romanian draft sitting in the next
            # column, and marking both reviewed would quietly launder a draft
            # into an approved translation.
            ok = bool(reviewed and verdict == "ok")
            if en:
                entry["en"] = en
                entry["reviewed_en"] = ok
            if ro:
                entry["ro"] = ro
                entry["reviewed_ro"] = ok
            if row.get("notes", "").strip():
                entry["notes"] = row["notes"].strip()
            entry.pop("reviewed", None)
            applied += 1

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(store, fh, ensure_ascii=False, indent=2, sort_keys=True)
        fh.write("\n")
    print(f"  applied {applied}, skipped {skipped} blank, dropped {dropped}")
    print(f"  -> {out_path} ({len(glosses)} lemmas total)")
    print("  now re-run:  .venv/bin/python -m pipeline.build_lexicon")


def import_sentences(path: str) -> None:
    out_path = os.path.join(DATA, "sentence_review.json")
    store = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {}
    n = 0
    with open(path, encoding="utf-8-sig", newline="") as fh:
        for row in csv.DictReader(fh):
            verdict = (row.get("verdict") or "").strip().lower()
            natural = (row.get("sounds_natural") or "").strip().lower()
            ro = (row.get("ro_new") or "").strip()
            says = (row.get("natives_say") or "").strip()
            if not (verdict or natural or ro or says):
                continue
            store[row["id"]] = {k: v for k, v in {
                "verdict": verdict or None, "sounds_natural": natural or None,
                "ro": ro or None, "natives_say": says or None,
                "notes": (row.get("notes") or "").strip() or None,
            }.items() if v}
            n += 1
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(store, fh, ensure_ascii=False, indent=2, sort_keys=True)
        fh.write("\n")
    print(f"  applied {n} sentence verdicts -> {out_path} ({len(store)} total)")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("csv_path")
    ap.add_argument("--reviewed-by-native", action="store_true",
                    help="mark `ok` rows as native-reviewed rather than drafted")
    args = ap.parse_args()
    name = os.path.basename(args.csv_path)
    if name.startswith("gloss"):
        import_glosses(args.csv_path, args.reviewed_by_native)
    else:
        import_sentences(args.csv_path)


if __name__ == "__main__":
    main()
