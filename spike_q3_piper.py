#!/usr/bin/env python3
"""
Q3 — Piper sk_SK-lili-medium quality check.

Two halves:
  (a) OBJECTIVE — run each probe through the voice's own espeak-ng front-end.
      A TTS voice cannot pronounce a contrast its front-end never emits, so
      this catches the §15.5 failure modes before anyone listens.

      Tests are written as CONTRASTS (does /pas/ differ from /pás/?) rather
      than as "does symbol X appear", because espeak-ng's Slovak transcription
      uses palatalisation diacritics (tʲ dʲ) where strict IPA would use the
      palatal stops (c ɟ), and marks stress after an initial consonant cluster
      (brˈatislava). Both are notation, not pronunciation. What a minimal-pair
      drill actually requires is that the two members phonemize differently.

  (b) SUBJECTIVE — render WAVs into spike_data/q3_audio/ to actually listen to.

Usage:  .venv/bin/python spike_q3_piper.py
"""
import os, re, wave
from piper import PiperVoice, SynthesisConfig

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = os.path.join(HERE, "spike_data", "voices")
OUT = os.path.join(HERE, "spike_data", "q3_audio")
os.makedirs(OUT, exist_ok=True)

voice = PiperVoice.load(os.path.join(VOICES, "sk_SK-lili-medium.onnx"))
def ipa(text):
    return "".join("".join(p) for p in voice.phonemize(text))

VOWELS = "aeiouäôyáéíóúýæɛɪɔʊ"
def stress_in_first_syllable(p):
    """True if the primary stress mark precedes or sits on the first vowel."""
    m = re.search(f"[{VOWELS}]", p)
    s = p.find("ˈ")
    return s != -1 and m is not None and s <= m.start()

results = []
def contrast(a, b, what):
    pa, pb = ipa(a), ipa(b)
    ok = pa != pb
    results.append((ok, f"{a} / {b}", f"/{pa}/ vs /{pb}/", what))

def prop(word, pred, what):
    p = ipa(word)
    results.append((pred(p), word, f"/{p}/", what))

def seg(p):
    """Phonemes with stress marks removed, for segmental substring tests."""
    return p.replace("ˈ", "").replace("ˌ", "")

print("=" * 78)
print("Q3a  espeak-ng front-end: are the contrasts Slovak learners need preserved?")
print("=" * 78)

# 1. palatals — the hard/soft contrast is what matters, not which symbol is used
contrast("ten", "teň",   "n / ň")
contrast("byt", "byť",   "t / ť")
contrast("lak", "ľak",   "l / ľ")
contrast("nos", "noš",   "s / š")
prop("ďakujem", lambda p: "ɟ" in p or "dʲ" in p, "ď is palatal(ised)")
prop("ľudia",   lambda p: "ʎ" in p,              "ľ -> ʎ")
prop("deň",     lambda p: "ɲ" in p,              "ň -> ɲ")
prop("deti",    lambda p: ("dʲ" in p or "ɟ" in p) and ("tʲ" in p or "c" in p),
     "de/ti softening rule applied")

# 2. vowel length
contrast("pas", "pás",   "a / á")
contrast("sud", "súd",   "u / ú")
contrast("vila", "víla", "i / í")
contrast("rad", "rád",   "a / á")
contrast("kava", "káva", "a / á")
prop("prosím", lambda p: "ː" in p, "í carries the length mark")

# 3. diphthongs
prop("piatok", lambda p: "iʲa" in seg(p) or "ia" in seg(p), "ia diphthong")
prop("môj",    lambda p: "uo" in seg(p),          "ô -> u̯o")
prop("kôň",    lambda p: "uo" in seg(p) and "ɲ" in p, "ô + ň")
prop("biely",  lambda p: "ie" in seg(p) or "iʲe" in seg(p), "ie diphthong")

# 4. h / ch  (espeak writes plain h, not ɦ — the contrast is what matters)
contrast("hlad", "chlad",   "h / ch")
contrast("hodiť", "chodiť", "h / ch")

# 5. first-syllable stress
for w in ["univerzita", "informácia", "republika", "Bratislava", "Rumunsko", "autobusová"]:
    prop(w, stress_in_first_syllable, "primary stress on syllable 1")

for ok, label, detail, what in results:
    pad = max(0, 30 - len(detail))
    print(f"  {'PASS' if ok else 'FAIL'}  {label:16s} {detail}{'':>{pad}}  {what}")

# ------------------------------------------------------------------ numbers
print("\n" + "=" * 78)
print("Q3b  numbers: digits are mishandled — this is why we spell them out")
print("=" * 78)
NUM = [
    ("DIGITS", "Stojí to 2,50 eura.",              "reads the comma aloud, wrong gender/case"),
    ("WORDS ", "Stojí to dve eurá päťdesiat.",     "correct"),
    ("DIGITS", "Mám 25 rokov.",                    "cardinal expands correctly here"),
    ("WORDS ", "Mám dvadsaťpäť rokov.",            "correct"),
    ("DIGITS", "Je 15:30.",                        "time"),
    ("WORDS ", "Je pol štvrtej.",                  "time, natural form"),
]
for kind, t, note in NUM:
    print(f"  {kind}  {t}\n          /{ipa(t)}/\n          -> {note}")

# -------------------------------------------------------------------- audio
print("\n" + "=" * 78)
print("Q3c  rendering WAVs to listen to")
print("=" * 78)
SENTENCES = [
    ("01_greeting",  "Dobrý deň. Prosím si kávu a jeden chlieb."),
    ("02_price",     "Koľko to stojí? Dve eurá päťdesiat."),
    ("03_price_dig", "Koľko to stojí? 2,50 €."),
    ("04_repeat",    "Nerozumiem, ešte raz prosím, pomalšie."),
    ("05_palatals",  "Ľudia v Bratislave hovoria ťažko, deti ďakujú."),
    ("06_length",    "Pas a pás. Sud a súd. Vila a víla. Rad a rád."),
    ("07_hch",       "Hlad a chlad. Hodiť a chodiť."),
    ("08_stress",    "Univerzita, informácia, republika, Rumunsko."),
    ("09_diphthong", "V piatok mám vieru, môj kôň a nôž sú biele."),
    ("10_sentence",  "Neviem, kto to urobil. Nechcem ísť do školy."),
    ("11_minpair",   "Ten a teň. Byt a byť. Lak a ľak."),
]
cfg = SynthesisConfig(length_scale=1.0)
for name, text in SENTENCES:
    path = os.path.join(OUT, f"{name}.wav")
    with wave.open(path, "wb") as wf:
        voice.synthesize_wav(text, wf, syn_config=cfg)
    with wave.open(path) as wf:
        dur = wf.getnframes() / wf.getframerate()
    print(f"  {name}.wav  {dur:5.2f}s  {text}")

fails = [r for r in results if not r[0]]
print("\n" + "=" * 78)
if fails:
    print(f"OBJECTIVE RESULT: {len(fails)}/{len(results)} check(s) FAILED:")
    for _, label, detail, what in fails:
        print(f"    {label:16s} {detail}  expected: {what}")
else:
    print(f"OBJECTIVE RESULT: all {len(results)} front-end contrast checks PASS.")
print(f"\nNow LISTEN to spike_data/q3_audio/*.wav and judge naturalness yourself.")
print("=" * 78)
