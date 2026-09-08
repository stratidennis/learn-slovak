"""Minimal hunspell-sk reader: affix expansion with morphology tags.

Two jobs, both needed by the pipeline:

  1. **Tagged paradigms.** kaikki's Slovak NOUN tables are untagged and lossy
     (see extract_kaikki.split_forms), but hunspell-sk's affix rules carry
     `is:genitive`, `is:plural`, ... annotations — so expanding `stôl/B` yields
     ("stola", ["genitive","singular"]) and the whole declension with cases
     attached. It also covers the many band-2 nouns kaikki has no entry for.

  2. **OOV checking** for the sentence filter (research §7.3): a sentence full
     of words hunspell does not recognise is probably Czech, a typo, or names.

This implements the subset of hunspell that sk_SK.aff actually uses: SFX/PFX
rules with a strip, an append, a condition, and morph tags. It is not a general
hunspell — no compounding, no flag aliasing — which is fine, because sk_SK.aff
uses neither.

Licence: hunspell-sk is MPL-2.0 (verified in the repo's LICENSE), safe to bundle.
"""
from __future__ import annotations

import os
import re
import collections
from typing import Iterator

from .common import WORK

HUNSPELL_DIR = os.path.join(WORK, "hunspell-sk-master")
NUM_RE = re.compile(r"^\d+$")


class Rule:
    __slots__ = ("kind", "flag", "strip", "add", "cond_re", "tags")

    def __init__(self, kind, flag, strip, add, cond, tags):
        self.kind = kind            # "SFX" or "PFX"
        self.flag = flag
        self.strip = "" if strip == "0" else strip
        # "naj/s" carries a continuation class; we generate the surface form
        # and drop the onward flag. Slightly under-generates, never over-generates.
        self.add = "" if add == "0" else add.split("/")[0]
        self.tags = tags
        if cond == ".":
            self.cond_re = None
        elif kind == "SFX":
            self.cond_re = re.compile(cond + "$")
        else:
            self.cond_re = re.compile("^" + cond)

    def applies(self, word: str) -> bool:
        if self.cond_re is not None and not self.cond_re.search(word):
            return False
        if self.kind == "SFX":
            return word.endswith(self.strip) if self.strip else True
        return word.startswith(self.strip) if self.strip else True

    def apply(self, word: str) -> str:
        if self.kind == "SFX":
            return (word[: len(word) - len(self.strip)] if self.strip else word) + self.add
        return self.add + (word[len(self.strip):] if self.strip else word)


def _parse_morph(fields: list[str]) -> list[str]:
    """`is:genitive is:plural tp:negation` -> ["genitive","plural","negation"]."""
    tags = []
    for f in fields:
        if (f.startswith("is:") or f.startswith("tp:")) and len(f) > 3:
            tags.append(f[3:])
    return tags


class HunspellSk:
    def __init__(self, base_dir: str = HUNSPELL_DIR):
        self.dir = base_dir
        self.rules: dict[str, list[Rule]] = collections.defaultdict(list)
        self.cross: dict[str, bool] = {}
        self.entries: dict[str, list[tuple[str, list[str], str | None]]] = collections.defaultdict(list)
        self._load_aff()
        self._load_dic()

    # ------------------------------------------------------------------ load
    def _load_aff(self) -> None:
        path = os.path.join(self.dir, "sk_SK.aff")
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.split("#")[0].rstrip()
                if not (line.startswith("SFX ") or line.startswith("PFX ")):
                    continue
                parts = line.split()
                # header line: "SFX B Y 238"  -> 4 fields, 3rd is Y/N
                if len(parts) == 4 and parts[2] in ("Y", "N") and NUM_RE.match(parts[3]):
                    self.cross[parts[1]] = parts[2] == "Y"
                    continue
                if len(parts) < 5:
                    continue
                kind, flag, strip, add, cond = parts[0], parts[1], parts[2], parts[3], parts[4]
                self.rules[flag].append(Rule(kind, flag, strip, add, cond, _parse_morph(parts[5:])))

    def _load_dic(self) -> None:
        path = os.path.join(self.dir, "sk_SK.dic")
        with open(path, encoding="utf-8") as fh:
            first = fh.readline()
            if not NUM_RE.match(first.strip()):
                fh.seek(0)
            for line in fh:
                line = line.rstrip("\n")
                if not line.strip():
                    continue
                # The morph fields are separated from the headword by whitespace
                # -- spaces, not tabs, despite what the format usually looks like.
                # Splitting on "\t" leaves "B po:noun is:masculine" as the flag
                # string, and iterating THAT as flags picks up the "n" in "noun",
                # which fires the -násobný rules and invents `stôlnásobny`.
                parts = line.split()
                head, fields = parts[0], parts[1:]
                word, _, flags = head.partition("/")
                if not word:
                    continue
                pos = next((f[3:] for f in fields if f.startswith("po:")), None)
                self.entries[word].append((flags, _parse_morph(fields), pos))

    # ---------------------------------------------------------------- expand
    def expand(self, lemma: str) -> list[dict]:
        """All forms of `lemma` with their morphology tags.

        Every flag in sk_SK.aff is cross-product enabled, and Slovak leans on it
        hard: `rozumieť/XN` is SFX X (conjugation) plus PFX N (the `ne-`
        negation), so `nerozumiem` only exists as PFX x SFX. Expanding the two
        independently misses every negated finite verb -- which is most of what
        a beginner actually says.
        """
        out, seen = [], set()

        def add(form, tags):
            key = (form, tuple(tags))
            if key in seen:
                return
            seen.add(key)
            out.append({"form": form, "tags": list(tags), "pos": pos, "lemma_form": form == lemma})

        for flags, base_tags, pos in self.entries.get(lemma, []):
            sfx = [r for f in flags for r in self.rules.get(f, []) if r.kind == "SFX"]
            pfx = [r for f in flags for r in self.rules.get(f, []) if r.kind == "PFX"]
            add(lemma, sorted(set(base_tags)))
            suffixed = [(lemma, base_tags)]
            for r in sfx:
                if r.applies(lemma):
                    tags = sorted(set(base_tags) | set(r.tags))
                    form = r.apply(lemma)
                    suffixed.append((form, tags))
                    add(form, tags)
            for pr in pfx:
                if not self.cross.get(pr.flag, True):
                    continue
                for form, tags in suffixed:
                    if pr.applies(form):
                        add(pr.apply(form), sorted(set(tags) | set(pr.tags)))
        return out

    def pos_of(self, lemma: str) -> str | None:
        for _, _, pos in self.entries.get(lemma, []):
            if pos:
                return pos
        return None

    def known_lemma(self, word: str) -> bool:
        return word in self.entries

    # ------------------------------------------------------------------- OOV
    def all_forms(self) -> Iterator[str]:
        """Every surface form the dictionary licenses, including PFX x SFX."""
        for lemma, rows in self.entries.items():
            for flags, _, _ in rows:
                sfx = [r for f in flags for r in self.rules.get(f, []) if r.kind == "SFX"]
                pfx = [r for f in flags for r in self.rules.get(f, []) if r.kind == "PFX"]
                forms = [lemma]
                for r in sfx:
                    if r.applies(lemma):
                        forms.append(r.apply(lemma))
                yield from forms
                for pr in pfx:
                    for form in forms:
                        if pr.applies(form):
                            yield pr.apply(form)


_CACHED: HunspellSk | None = None


def load() -> HunspellSk:
    global _CACHED
    if _CACHED is None:
        _CACHED = HunspellSk()
    return _CACHED
