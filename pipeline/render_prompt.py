#!/usr/bin/env python3
"""Fill an AI-roleplay prompt's {{slots}} from the content the app has.

    .venv/bin/python -m pipeline.render_prompt R1-market --unit 1.6 --name Dennis --level A1

Until the app tracks real progress, KNOWN_WORDS = every band-1 lemma (the Phase-1 learner) and
WEAK_TAGS is a sensible default. The app will replace both with live data.
"""
from __future__ import annotations
import argparse, os, re
from .common import CONTENT, ROOT, read_jsonl

PROMPTS = os.path.join(ROOT, "curriculum", "ai-roleplay")


def known_words(max_band: int) -> list[str]:
    lex = [r for r in read_jsonl(os.path.join(CONTENT, "lexemes.jsonl"))
           if r["band"] <= max_band and not r.get("exclude_from_teaching")
           and r.get("register_flag") not in ("vulgar", "insult")]
    lex.sort(key=lambda r: r["spoken_rank"])
    return [r["lemma"] for r in lex]


def unit_chunks(unit: str) -> str:
    out = []
    for c in read_jsonl(os.path.join(CONTENT, "chunks.jsonl")):
        if c["unit"] == unit:
            line = c["sk"]
            if c["variants"]:
                line += "   (also: " + " / ".join(v["sk"] for v in c["variants"][:2]) + ")"
            out.append(line)
    return "\n".join(out)


def render(name: str, unit: str, learner: str, level: str, weak: str, text: str | None = None) -> str:
    path = os.path.join(PROMPTS, f"{name}.md")
    md = open(path, encoding="utf-8").read()
    body = re.search(r"```\n(.*?)\n```", md, re.S).group(1)
    max_band = 1 if level == "A1" else 2
    filled = (body.replace("{{NAME}}", learner).replace("{{LEVEL}}", level)
              .replace("{{KNOWN_WORDS}}", ", ".join(known_words(max_band)))
              .replace("{{UNIT_CHUNKS}}", unit_chunks(unit))
              .replace("{{WEAK_TAGS}}", weak))
    if text is not None:
        filled = filled.replace("{{TEXT}}", text)
    return filled


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt"); ap.add_argument("--unit", default="1.6")
    ap.add_argument("--name", default="Dennis"); ap.add_argument("--level", default="A1")
    ap.add_argument("--weak", default="case:acc (kávu not káva), palatal:ť, register (textbook vs spoken)")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    s = render(a.prompt, a.unit, a.name, a.level, a.weak)
    if a.out:
        open(a.out, "w", encoding="utf-8").write(s); print(f"wrote {a.out} ({len(s)} chars)")
    else:
        print(s)

if __name__ == "__main__":
    main()
