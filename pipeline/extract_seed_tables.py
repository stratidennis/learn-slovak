#!/usr/bin/env python3
"""Parse the §4.3 cognate and §4.4 false-friend tables out of the research doc.

Transcribing ~100 rows by hand invites typos in exactly the data whose whole
purpose is to be trustworthy on day 1. Parse once, commit the JSON, and let the
pipeline read that.

    .venv/bin/python -m pipeline.extract_seed_tables

Output: data/cognates_ro.json, data/false_friends_ro.json  (both committed)
"""
from __future__ import annotations

import json
import os
import re

from .common import DATA, ROOT

DOC = os.path.join(ROOT, "SLOVAK-LEARNING-APP-RESEARCH.md")
CELL_MD = re.compile(r"\*\*(.+?)\*\*|\*(.+?)\*")


def strip_md(s: str) -> str:
    """Drop bold/italic markers, keep the text."""
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    s = re.sub(r"\*(.+?)\*", r"\1", s)
    return s.strip()


def table_rows(lines: list[str], start: int) -> list[list[str]]:
    """Read a markdown table starting at/after `start`, until the first non-row."""
    rows, seen_table = [], False
    for line in lines[start:]:
        line = line.rstrip()
        if not line.startswith("|"):
            if seen_table:
                break
            continue
        seen_table = True
        cells = [strip_md(c) for c in line.strip("|").split("|")]
        if all(set(c) <= set("-: ") for c in cells):   # separator row
            continue
        rows.append(cells)
    return rows


def section_line(lines: list[str], heading: str) -> int:
    for i, line in enumerate(lines):
        if line.startswith("###") and heading in line:
            return i
    raise SystemExit(f"heading not found: {heading}")


def main() -> None:
    lines = open(DOC, encoding="utf-8").read().splitlines()

    # ---- §4.3 cognates: | Romanian | Slovak | Meaning (SK) | Note |
    rows = table_rows(lines, section_line(lines, "4.3 Cognate bootstrap"))
    header, rows = rows[0], rows[1:]
    assert header[:2] == ["Romanian", "Slovak"], header
    cognates = []
    for r in rows:
        if len(r) < 4:
            continue
        ro, sk, meaning, note = r[0], r[1], r[2], r[3]
        # a few cells hold alternates: "boľavý / bolesť, bolieť"
        sk_forms = [x.strip() for x in re.split(r"[/,]", sk) if x.strip()]
        cognates.append({
            "ro": ro,
            "sk": sk,
            "sk_lemmas": sk_forms,
            "meaning_en": meaning,
            "note": note,
            # "(shift)" marks a meaning that moved -- still a memory hook, but
            # the learner must be told, not left to assume.
            "semantic_shift": "(shift)" in note,
        })

    # ---- §4.4 false friends: | Romanian | means | Slovak look-alike | actually means |
    rows = table_rows(lines, section_line(lines, "4.4 False friends"))
    header, rows = rows[0], rows[1:]
    assert header[0] == "Romanian" and "look-alike" in header[2], header
    friends = []
    for r in rows:
        if len(r) < 4:
            continue
        ro, ro_means, sk, sk_means = r[0], r[1], r[2], r[3]
        if sk.strip() in ("—", "-", ""):
            continue                        # rows with no Slovak counterpart
        sk_lemma = sk.split("(")[0].strip()
        friends.append({
            "ro": ro,
            "ro_means": ro_means,
            "sk": sk_lemma,
            "sk_note": sk.strip(),
            "sk_means": sk_means,
        })

    for name, payload in (("cognates_ro", cognates), ("false_friends_ro", friends)):
        path = os.path.join(DATA, f"{name}.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump({
                "source": "SLOVAK-LEARNING-APP-RESEARCH.md",
                "section": "§4.3" if "cognate" in name else "§4.4",
                "review_status": "needs_review",   # §4.3: "verify a handful with a native"
                "entries": payload,
            }, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"  wrote {len(payload):3d} entries -> {path}")


if __name__ == "__main__":
    main()
