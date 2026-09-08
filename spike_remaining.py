#!/usr/bin/env python3
"""
Slovak app — remaining feasibility spike (steps 2-4).

Run this on your own machine; it needs tatoeba.org, kaikki.org and huggingface.co,
which were unreachable from the sandbox where steps 0-1 were done.

Prereqs:
    pip install simplemma requests
    # for audio (optional):
    pip install piper-tts

Inputs:
    lexicon_bands.csv   <- produced by step 1 (ships alongside this script)

Answers:
    Q1  How many Tatoeba sentences are usable at band 1 / band 2? (the go/no-go number)
    Q2  What % of band-1 lemmas have a gloss + IPA + inflection table in kaikki?
    Q3  Does Piper's Slovak voice sound good enough to learn pronunciation from?
"""
import csv, json, os, sys, urllib.request, collections, re

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "spike_data")
os.makedirs(WORK, exist_ok=True)

def fetch(url, dest):
    dest = os.path.join(WORK, dest)
    if os.path.exists(dest):
        print(f"  cached: {dest}")
        return dest
    print(f"  downloading {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "slovak-app-spike/1.0"})
    with urllib.request.urlopen(req) as r, open(dest, "wb") as fh:
        fh.write(r.read())
    return dest

# ---------------------------------------------------------------- load bands
bands = {}
with open(os.path.join(HERE, "lexicon_bands.csv"), encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        bands[row["lemma"]] = int(row["band"])
band1 = {w for w, b in bands.items() if b == 1}
band2 = {w for w, b in bands.items() if b <= 2}
print(f"loaded lexicon: {len(band1)} band-1 lemmas, {len(band2)} band-1+2 lemmas\n")

# ============================================================ Q1: TATOEBA
print("=" * 70)
print("Q1  Tatoeba sentence availability  <-- THE GO/NO-GO NUMBER")
print("=" * 70)
try:
    import simplemma
except ImportError:
    sys.exit("pip install simplemma")

# Slovak sentences only. The links table (for EN/RO translations) is a large
# download and is NOT needed to answer Q1 -- fetch it later, in the M2 pipeline,
# once you know Phase 1 is viable.
sk_tar = fetch("https://downloads.tatoeba.org/exports/per_language/slk/slk_sentences.tsv.bz2",
               "slk_sentences.tsv.bz2")

import bz2
sentences = {}
with bz2.open(sk_tar, "rt", encoding="utf-8") as fh:
    for line in fh:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 3:
            sentences[int(parts[0])] = parts[2]
print(f"  Slovak sentences downloaded: {len(sentences):,}")

WORD = re.compile(r"[a-zá-žA-ZÁ-Ž]+", re.UNICODE)
def lemmas_of(s):
    return [simplemma.lemmatize(w.lower(), lang="sk") for w in WORD.findall(s)]

stats = collections.Counter()
usable_b1, usable_b2 = [], []
for sid, text in sentences.items():
    lems = lemmas_of(text)
    if not (3 <= len(lems) <= 12):
        stats["wrong_length"] += 1
        continue
    unknown_b1 = [l for l in lems if l not in band1]
    unknown_b2 = [l for l in lems if l not in band2]
    if not unknown_b1:
        usable_b1.append((sid, text)); stats["band1_clean"] += 1
    elif len(unknown_b1) == 1:
        stats["band1_plus_one"] += 1
    if not unknown_b2:
        usable_b2.append((sid, text)); stats["band2_clean"] += 1

print(f"""
  RESULT
    sentences 3-12 words                     : {len(sentences) - stats['wrong_length']:,}
    fully inside band 1 (0 unknown lemmas)   : {stats['band1_clean']:,}   <-- Phase 1 pool
    band 1 + exactly one new word (i+1)      : {stats['band1_plus_one']:,}   <-- Phase 1 teaching pool
    fully inside band 1+2                    : {stats['band2_clean']:,}   <-- Phase 2 pool

  INTERPRETATION
    >400 clean band-1 sentences  -> the Tatoeba-only plan works, build it.
    100-400                      -> works for drilling, but you must generate
                                    + native-review extra sentences for lessons.
    <100                         -> change plan: generate sentences with an LLM
                                    from the band-1 list, native-review them,
                                    and use Tatoeba only from band 2 upward.
""")
with open(os.path.join(WORK, "sentences_band1.jsonl"), "w", encoding="utf-8") as fh:
    for sid, text in usable_b1:
        fh.write(json.dumps({"id": f"tat:{sid}", "sk": text}, ensure_ascii=False) + "\n")
print("  sample band-1 sentences:")
for _, t in usable_b1[:15]:
    print("   ", t)

# ============================================================ Q2: KAIKKI
print("\n" + "=" * 70)
print("Q2  kaikki.org dictionary coverage of band 1")
print("=" * 70)
kk = fetch("https://kaikki.org/dictionary/Slovak/kaikki.org-dictionary-Slovak.jsonl",
           "kaikki-slovak.jsonl")
have = {}
with open(kk, encoding="utf-8") as fh:
    for line in fh:
        try: e = json.loads(line)
        except Exception: continue
        w = e.get("word", "").lower()
        if w not in bands: continue
        rec = have.setdefault(w, {"gloss": False, "ipa": False, "forms": False})
        if any(s.get("glosses") for s in e.get("senses", [])): rec["gloss"] = True
        if any("ipa" in s for s in e.get("sounds", [])):       rec["ipa"] = True
        if len(e.get("forms", [])) > 1:                        rec["forms"] = True

n = len(band1)
g = sum(1 for w in band1 if have.get(w, {}).get("gloss"))
i = sum(1 for w in band1 if have.get(w, {}).get("ipa"))
f = sum(1 for w in band1 if have.get(w, {}).get("forms"))
print(f"""
  band-1 lemmas ({n}):
    present in kaikki      : {len([w for w in band1 if w in have])} ({len([w for w in band1 if w in have])/n*100:.0f}%)
    with an English gloss  : {g} ({g/n*100:.0f}%)
    with IPA               : {i} ({i/n*100:.0f}%)
    with inflection forms  : {f} ({f/n*100:.0f}%)

  If gloss coverage <90%, budget time to hand-write the missing glosses
  (band 1 is only 300 words, so this is an afternoon, not a project).
""")
missing = sorted(w for w in band1 if not have.get(w, {}).get("gloss"))
print("  band-1 lemmas with no kaikki gloss:", ", ".join(missing[:40]))
with open(os.path.join(WORK, "kaikki_gaps.txt"), "w", encoding="utf-8") as fh:
    fh.write("\n".join(missing))

# ============================================================ Q3: PIPER
print("\n" + "=" * 70)
print("Q3  Piper Slovak voice — listen and judge for yourself")
print("=" * 70)
print("""
  Run these three commands, then LISTEN to spike_data/*.wav:

    pip install piper-tts
    python -m piper.download_voices sk_SK-lili-medium

    echo "Dobry den. Prosim si kavu a jeden chlieb." | piper -m sk_SK-lili-medium -f spike_data/t1.wav
    echo "Kolko to stoji? Dve eura patdesat." | piper -m sk_SK-lili-medium -f spike_data/t2.wav
    echo "Nerozumiem, este raz prosim, pomalsie." | piper -m sk_SK-lili-medium -f spike_data/t3.wav

  (Type them WITH diacritics in the real thing: "Dobrý deň. Prosím si kávu...")

  Judge three things:
    1. Are the palatals right?   ď ť ň ľ  in "deň", "prosím", "ľudia"
    2. Is vowel LENGTH audible?  "kávu" vs "kava",  "prosím" vs "prosim"
    3. Are numbers correct?      "dve eurá päťdesiat" — spell numbers as WORDS
  If any of these fail, fall back to Microsoft Edge neural voices
  (pip install edge-tts; voices sk-SK-LukasNeural / sk-SK-ViktoriaNeural)
  for the ~500 core chunks, and keep Piper for bulk sentences.
""")
print("done. artefacts in:", WORK)
