#!/usr/bin/env python3
"""
Q1 re-measurement with the §15.2 bug-#2 fix applied.

spike_remaining.py calls simplemma directly, so `nechcem` lemmatizes to
`nechcieť` -- which is NOT in band 1, because band 1 was built *after* the
negated-verb merge. Every negated sentence therefore looks like it contains an
unknown word. Negation is very common in conversational sentences, so the
shipped Q1 number is a systematic undercount.

This script re-runs Q1 with the merge applied and reports both numbers, so the
decision gate is evaluated on the corrected one.

Reuses spike_data/slk_sentences.tsv.bz2 -- run spike_remaining.py first.
"""
import csv, json, os, re, bz2, collections, unicodedata
import simplemma

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "spike_data")

bands = {}
with open(os.path.join(HERE, "lexicon_bands.csv"), encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        bands[row["lemma"]] = int(row["band"])
band1 = {w for w, b in bands.items() if b == 1}
band2 = {w for w, b in bands.items() if b <= 2}

# ---- bug #2: merge negated verbs into their positives ----------------------
# Rule: a lemma starting with "ne" merges to lemma[2:] only when the remainder
# is itself a known lemma AND looks like an infinitive (ends in "ť"). That
# keeps genuine ne-initial words (nejaký, nechať, nech, než, nemocnica,
# nenávidieť) intact -- none of their stripped forms are lemmas ending in "ť".
_ALL = set(bands)
def denegate(lem):
    if lem.startswith("ne") and len(lem) > 4:
        stem = lem[2:]
        if stem.endswith("ť") and stem in _ALL:
            return stem
    return lem

# sanity check the rule against the words it must not damage
for w in ["nejaký", "nechať", "nech", "než", "nemocnica", "nenávidieť", "nebo", "nedeľa"]:
    assert denegate(w) == w, f"denegate wrongly rewrote {w} -> {denegate(w)}"
for w, expect in [("nebyť", "byť"), ("nemať", "mať"), ("nechcieť", "chcieť"),
                  ("nevedieť", "vedieť"), ("nemôcť", "môcť")]:
    assert denegate(w) == expect, f"denegate failed {w}: got {denegate(w)}"
print("denegate() sanity checks pass\n")

WORD = re.compile(r"[a-zá-žA-ZÁ-Ž]+", re.UNICODE)

sentences = {}
with bz2.open(os.path.join(WORK, "slk_sentences.tsv.bz2"), "rt", encoding="utf-8") as fh:
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 3:
            sentences[int(parts[0])] = parts[2]
print(f"Slovak sentences: {len(sentences):,}")

def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", "", s).strip()

stats = collections.Counter()
raw_b1, fixed_b1, fixed_b2, fixed_b1_plus1 = [], [], [], []
seen = set()
for sid, text in sentences.items():
    toks = WORD.findall(text)
    if not (3 <= len(toks) <= 12):
        stats["wrong_length"] += 1
        continue
    stats["in_length"] += 1
    key = norm(text)
    if key in seen:
        stats["duplicate"] += 1
        continue
    seen.add(key)
    stats["unique_in_length"] += 1

    raw = [simplemma.lemmatize(w.lower(), lang="sk") for w in toks]
    fix = [denegate(l) for l in raw]

    if not [l for l in raw if l not in band1]:
        raw_b1.append((sid, text))
    unk1 = [l for l in fix if l not in band1]
    if not unk1:
        fixed_b1.append((sid, text))
    elif len(unk1) == 1:
        fixed_b1_plus1.append((sid, text, unk1[0]))
    if not [l for l in fix if l not in band2]:
        fixed_b2.append((sid, text))

print(f"""
  3-12 tokens                        : {stats['in_length']:,}
  ... after dedupe                   : {stats['unique_in_length']:,}   ({stats['duplicate']:,} duplicates dropped)

  band-1 clean, AS SHIPPED (bug #2)  : {len(raw_b1):,}
  band-1 clean, NEGATION MERGED      : {len(fixed_b1):,}   <-- the real Q1 number
  band-1 + exactly one new word      : {len(fixed_b1_plus1):,}
  band-1+2 clean                     : {len(fixed_b2):,}
""")

os.makedirs(WORK, exist_ok=True)
with open(os.path.join(WORK, "sentences_band1_fixed.jsonl"), "w", encoding="utf-8") as fh:
    for sid, text in fixed_b1:
        fh.write(json.dumps({"id": f"tat:{sid}", "sk": text}, ensure_ascii=False) + "\n")
with open(os.path.join(WORK, "sentences_band1_plus1.jsonl"), "w", encoding="utf-8") as fh:
    for sid, text, new in fixed_b1_plus1:
        fh.write(json.dumps({"id": f"tat:{sid}", "sk": text, "new_lemma": new}, ensure_ascii=False) + "\n")

recovered = [t for sid, t in fixed_b1 if (sid, t) not in set(raw_b1)]
print(f"  sentences recovered by the negation fix ({len(recovered)}), sample:")
for t in recovered[:12]:
    print("   ", t)

print("\n  most common 'one new word' lemmas in the i+1 pool:")
for lem, c in collections.Counter(n for _, _, n in fixed_b1_plus1).most_common(25):
    print(f"    {lem:20s} {c:4d}   (band {bands.get(lem, '-')})")
