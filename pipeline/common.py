"""Shared plumbing for the content pipeline.

Every content record carries source / licence / attribution / review_status from
day one (START-HERE guardrail, research §12). The constants below are the single
place those strings are defined.
"""
from __future__ import annotations

import csv
import json
import os
import re
import shutil
import ssl
import urllib.request
from typing import Iterable, Iterator

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")          # committed derived data
CONTENT = os.path.join(ROOT, "content")    # pipeline output, committed
WORK = os.path.join(ROOT, "pipeline", "work")   # gitignored scratch + downloads
SPIKE = os.path.join(ROOT, "spike_data")   # gitignored spike artefacts (reused as cache)

for d in (DATA, CONTENT, WORK):
    os.makedirs(d, exist_ok=True)

# --------------------------------------------------------------------- licences
LICENCES = {
    "tatoeba": {
        "licence": "CC BY 2.0 FR",
        "attribution": "Tatoeba (tatoeba.org), sentence contributors",
        "url": "https://tatoeba.org/en/downloads",
    },
    "kaikki": {
        "licence": "CC BY-SA 3.0 / GFDL",
        "attribution": "English Wiktionary via kaikki.org (wiktextract)",
        "url": "https://kaikki.org/dictionary/Slovak/",
    },
    "hunspell-sk": {
        "licence": "MPL-2.0 / GPL-2.0+ / LGPL-2.1+ tri-licence",
        "attribution": "sk-spell project",
        "url": "https://github.com/sk-spell/hunspell-sk",
    },
    "piper": {
        "licence": "MIT (engine) / CC0-ish voice",
        "attribution": "Piper TTS, voice sk_SK-lili-medium",
        "url": "https://github.com/OHF-Voice/piper1-gpl",
    },
    "opensubtitles-freq": {
        "licence": "research / non-commercial",
        "attribution": "hermitdave FrequencyWords, OpenSubtitles 2018",
        "url": "https://github.com/hermitdave/FrequencyWords",
    },
    "authored": {
        "licence": "project-authored",
        "attribution": "this project",
        "url": None,
    },
    "wikimedia-commons": {
        "licence": "CC BY-SA 4.0 (per-file, verify)",
        "attribution": "Wikimedia Commons contributors (Lingua Libre)",
        "url": "https://commons.wikimedia.org",
    },
}

REVIEW_UNREVIEWED = "unreviewed"     # from a trusted source, not yet read by a human
REVIEW_NEEDS = "needs_review"        # drafted/MT-generated — MUST be reviewed before it ships
REVIEW_OK = "reviewed_ok"            # a native speaker signed off

# --------------------------------------------------------------------- download
# python.org framework builds on macOS carry no CA bundle; certifi is already a
# requests dependency. See docs/DECISIONS.md D102.
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:  # pragma: no cover
    SSL_CTX = ssl.create_default_context()


def fetch(url: str, dest_name: str, work_dir: str | None = None) -> str:
    """Download `url` to `work_dir/dest_name`, cached, streamed via a .part file."""
    work_dir = work_dir or WORK
    os.makedirs(work_dir, exist_ok=True)
    dest = os.path.join(work_dir, dest_name)
    if os.path.exists(dest):
        return dest
    # reuse anything the spike already downloaded rather than fetching twice
    cached = os.path.join(SPIKE, dest_name)
    if os.path.exists(cached):
        print(f"  reusing spike cache: {cached}")
        return cached
    print(f"  downloading {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "slovak-app-pipeline/1.0"})
    tmp = dest + ".part"
    with urllib.request.urlopen(req, context=SSL_CTX) as r, open(tmp, "wb") as fh:
        shutil.copyfileobj(r, fh, 1 << 20)
    os.replace(tmp, dest)
    return dest


# ---------------------------------------------------------------------- lexicon
def load_bands(path: str | None = None) -> dict[str, dict]:
    """lemma -> {rank, band, subtitle_count, n_forms_seen} from lexicon_bands.csv."""
    path = path or os.path.join(ROOT, "lexicon_bands.csv")
    out: dict[str, dict] = {}
    with open(path, encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            out[row["lemma"]] = {
                "rank": int(row["rank"]),
                "band": int(row["band"]),
                "subtitle_count": int(row["subtitle_count"]),
                "n_forms_seen": int(row["n_forms_seen"]),
            }
    return out


def make_denegator(known: Iterable[str]):
    """Return a function merging negated verbs into their positives (§15.2 bug #2).

    simplemma lemmatizes `nechcem` -> `nechcieť`, splitting a verb's frequency
    across two entries. The band list was built *after* this merge, so anything
    downstream that lemmatizes fresh text must apply it too or band membership
    silently disagrees with the lexicon.

    Narrow on purpose: strip `ne-` only when the remainder is a known lemma
    ending in `ť` (i.e. an infinitive). That leaves genuine ne-initial words
    alone -- `nejaký`, `nechať`, `nech`, `než`, `nemocnica`, `nenávidieť`,
    `nebo`, `nedeľa` all survive, because none of their stripped forms is a
    known infinitive.
    """
    known = set(known)

    def denegate(lemma: str) -> str:
        if lemma.startswith("ne") and len(lemma) > 4:
            stem = lemma[2:]
            if stem.endswith("ť") and stem in known:
                return stem
        return lemma

    return denegate


WORD_RE = re.compile(r"[a-záäčďéíĺľňóôŕšťúýžA-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]+")


def tokenize(text: str) -> list[str]:
    """Slovak word tokens. Explicit alphabet, not a codepoint range: `á-ž`
    silently includes ÷ and a pile of non-Slovak Latin letters."""
    return WORD_RE.findall(text)


# --------------------------------------------------------------------------- io
def write_jsonl(path: str, records: Iterable[dict]) -> int:
    n = 0
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        for r in records:
            fh.write(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n")
            n += 1
    os.replace(tmp, path)
    return n


def read_jsonl(path: str) -> Iterator[dict]:
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                yield json.loads(line)
