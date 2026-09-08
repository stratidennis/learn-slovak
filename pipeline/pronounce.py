"""Pronunciation guides for a Romanian learner.

Two guides for every Slovak string:

1. `respell_ro(text)` — a **Romanian-orthography respelling**. Slovak spelling is nearly phonemic
   (research §3), so this is deterministic and needs no dictionary. It leans on the §4.1 sound
   map: c→ț, č→ce/ci, š→ș, ž→j, j→y, ch→h, k→c/ch, g→g/gh, ľ/ň/ť/ď→li/ni/ti/di glides,
   ä→e, ô→uo, long vowels doubled, syllabic r/l left bare, final devoicing applied, the v→u glide
   before consonants, and the FIRST SYLLABLE IN CAPS for stress (the biggest RO-speaker fix).
   One special symbol: **ɦ** = Slovak voiced h (Romanian has none), so h/ch stays distinct.

2. `ipa(text)` — IPA. kaikki's Wiktionary IPA is preferred where it exists (58% of bands 1–2);
   otherwise Piper's espeak-ng phonemes are normalised toward Wiktionary's conventions
   (tʲ→c, dʲ→ɟ, ts→t͡s, iʲa→ɪ̯a, uo→u̯ɔ, h→ɦ …). D104 stands: raw espeak strings are never shown.

Also `ALPHABET`: the 46 letters with Slovak letter names (for spelling your name/email — SAS A1
"hláskovanie"), IPA, the Romanian anchor and an example word.
"""
from __future__ import annotations
import re

# ---------------------------------------------------------------- respelling
_VOWEL = "aeiouáéíóúýäôyi"
_SOFTENING = {"d": "di", "t": "ti", "n": "ni", "l": "li"}
_MAP = {
    "a": "a", "á": "aa", "ä": "e", "b": "b", "c": "ț", "d": "d", "ď": "di", "e": "e", "é": "ee", "f": "f",
    "g": "g", "h": "ɦ", "i": "i", "í": "ii", "j": "y", "k": "c", "l": "l", "ĺ": "ll", "ľ": "li", "m": "m",
    "n": "n", "ň": "ni", "o": "o", "ó": "oo", "ô": "uo", "p": "p", "q": "cv", "r": "r", "ŕ": "rr", "s": "s",
    "š": "ș", "t": "t", "ť": "ti", "u": "u", "ú": "uu", "v": "v", "w": "v", "x": "cs", "y": "i", "ý": "ii",
    "z": "z", "ž": "j",
    # placeholders resolved after the k/g rule: Č (č), Ǧ (dž), X (ch), Ż (dz)
    "Č": "Č", "Ǧ": "Ǧ", "X": "h", "Ż": "dz",
}
_DEVOICE = {"b": "p", "d": "t", "ď": "ť", "g": "k", "z": "s", "ž": "š", "v": "f", "h": "X", "Ż": "c", "Ǧ": "Č"}
_VOICE = {v: k for k, v in _DEVOICE.items() if k not in ("v", "h")}   # p->b, t->d, ť->ď, k->g, s->z, š->ž, c->dz, č->dž
_VOICED_OBS, _VOICELESS_OBS = set("bdďgzžŻǦ"), set("ptťkcsšČX")

def _assimilate(w: str) -> str:
    """An obstruent takes the voicing of the obstruent right after it (v does not trigger it)."""
    out = list(w)
    for i in range(len(out) - 2, -1, -1):
        nxt = out[i + 1]
        # v devoices before a voiceless obstruent unless it is the u̯ glide after a vowel: vták -> [ftaːk]
        if out[i] == "v" and nxt in _VOICELESS_OBS and (i == 0 or out[i - 1] not in _VOWEL):
            out[i] = "f"; continue
        if out[i] in _VOICELESS_OBS and nxt in _VOICED_OBS:
            out[i] = _VOICE.get(out[i], out[i])
        elif out[i] in _VOICED_OBS and nxt in _VOICELESS_OBS:
            out[i] = _DEVOICE.get(out[i], out[i])
    return "".join(out)


def _respell_word(word: str) -> str:
    w = word.lower()
    w = w.replace("ch", "X").replace("dž", "Ǧ").replace("dz", "Ż").replace("č", "Č")
    # final devoicing: chlieb -> [xliep], hrad -> [hrat]
    if w and w[-1] in _DEVOICE:
        w = w[:-1] + _DEVOICE[w[-1]]
    # regressive voicing assimilation inside a word: kde -> [gɟe], takže -> [tagʒe], vták -> [ftaːk]
    w = _assimilate(w)
    out: list[str] = []
    i = 0
    while i < len(w):
        c, nxt = w[i], (w[i + 1] if i + 1 < len(w) else "")
        # de/te/ne/le softening (research §3): written plain, said soft before e, i, í, ia, ie, iu.
        # Before e: write the glide (die/tie/nie/lie). Before i/í: Romanian already reads ti/di/ni/li
        # with a following i, so plain letter + i is the closest.
        if c in _SOFTENING and nxt in "eiíi":
            out.append(_SOFTENING[c] if nxt == "e" else c); i += 1; continue
        # v after a vowel and before a consonant / at the end -> [u̯]: pravda -> prauda
        if c == "v" and i > 0 and w[i - 1] in _VOWEL and (nxt == "" or nxt not in _VOWEL):
            out.append("u"); i += 1; continue
        out.append(_MAP.get(c, c)); i += 1
    s = "".join(out)
    # Romanian reads c/g before e,i as [t͡ʃ]/[d͡ʒ]; Slovak k/g must stay hard there -> ch/gh
    s = re.sub(r"c(?=[eií])", "ch", s)
    s = re.sub(r"g(?=[eií])", "gh", s)
    # now resolve the affricate placeholders the Romanian way: ce/ci before e/i, cia/cio/ciu otherwise
    s = re.sub(r"Č(?=[ei])", "c", s); s = s.replace("Č", "ci")
    s = re.sub(r"Ǧ(?=[ei])", "g", s); s = s.replace("Ǧ", "gi")
    return s


_SYLL = re.compile(r"^([^aeiouy]*(?:aa|ee|ii|oo|uu|uo|ia|ie|iu|[aeiou]))")

def respell_ro(text: str, mark_stress: bool = True) -> str:
    """Whole sentence. Stress (always first syllable) is shown in CAPS on words of 2+ syllables."""
    words = []
    for tok in re.findall(r"[\wáäčďéíĺľňóôŕšťúýž]+|[^\w\s]", text, flags=re.I):
        if not re.match(r"[\wáäčďéíĺľňóôŕšťúýž]", tok, flags=re.I):
            if words: words[-1] += tok
            continue
        r = _respell_word(tok)
        if mark_stress and len(re.findall(r"aa|ee|ii|oo|uu|uo|ia|ie|iu|[aeiou]", r)) > 1:
            m = _SYLL.match(r)
            if m: r = m.group(1).upper().replace("Ɦ", "ɦ") + r[m.end():]
        words.append(r)
    return " ".join(words)


# ---------------------------------------------------------------- IPA (espeak -> Wiktionary-style)
_IPA_RULES = [("tʲ", "c"), ("dʲ", "ɟ"), ("ʲ", ""), ("ia", "ɪ̯a"), ("ie", "ɪ̯e"), ("iu", "ɪ̯u"),
              ("uo", "u̯ɔ"), ("ts", "t͡s"), ("tʃ", "t͡ʃ"), ("dʒ", "d͡ʒ"), ("dz", "d͡z"), ("h", "ɦ"),
              ("ɾ", "r"), ("æ", "e"), ("ɛ", "e"), ("o", "ɔ"), ("ˌ", "")]
_voice = None

def _espeak(text: str) -> str:
    global _voice
    if _voice is None:
        import os
        from piper import PiperVoice
        from .common import ROOT
        _voice = PiperVoice.load(os.path.join(ROOT, "spike_data", "voices", "sk_SK-lili-medium.onnx"))
    return "".join("".join(p) for p in _voice.phonemize(text))

def ipa(text: str) -> str | None:
    """IPA for any Slovak string via normalised espeak. Single letters are read as letter names by
    espeak, so they are refused here — use kaikki or the ALPHABET table for those."""
    if len(re.sub(r"[^\w]", "", text)) <= 1:
        return None
    p = _espeak(text).replace("ˈ", "").replace("ˌ", "")   # stress is always initial in Slovak
    for a, b in _IPA_RULES:
        p = p.replace(a, b)
    return f"[{p}]"


# ---------------------------------------------------------------- alphabet
# letter, Slovak letter name (what you say when spelling), IPA of the sound, Romanian anchor,
# example word, note. Sources: research §4.1; SAS A1 (hláskovanie). Letter names as commonly taught.
ALPHABET = [
    ("a", "á", "a", "a (casă)", "auto", None),
    ("á", "dlhé á", "aː", "a lung — ține-l de două ori", "káva", "length is meaning: pas/pás"),
    ("ä", "široké e", "e", "e (most speakers say plain e)", "mäso", "rare"),
    ("b", "bé", "b", "b", "brat", None),
    ("c", "cé", "t͡s", "ț (țară)", "cena", "NEVER [k]: cena = 'țena'"),
    ("č", "čé", "t͡ʃ", "ce/ci (ceai)", "čaj", None),
    ("d", "dé", "d", "d", "dom", "soft before e/i: deti = 'dieti'"),
    ("ď", "ďé", "ɟ", "≈ di- glide (diavol), one sound", "ďakujem", "no RO equivalent"),
    ("dz", "dzé", "d͡z", "dz", "medzi", "rare"),
    ("dž", "džé", "d͡ʒ", "ge/gi (geam)", "džem", "rare"),
    ("e", "é", "e", "e", "jeden", None),
    ("é", "dlhé é", "eː", "e lung", "kolégium", None),
    ("f", "ef", "f", "f", "firma", None),
    ("g", "gé", "g", "g (gară)", "gitara", "never soft like RO ge/gi"),
    ("h", "há", "ɦ", "— voiced h: h with a buzz (ɦ)", "hovoriť", "h ≠ ch: hlad/chlad"),
    ("ch", "chá", "x", "h (hram) — strong, in the throat", "chlieb", "one letter; sorts after h"),
    ("i", "í", "i", "i", "izba", None),
    ("í", "dlhé í", "iː", "i lung", "prosím", None),
    ("j", "jé", "j", "i semivowel (iar) — written y in the guide", "ja", None),
    ("k", "ká", "k", "c (casă) / ch before e,i (chem)", "káva", None),
    ("l", "el", "l", "l", "les", None),
    ("ĺ", "dlhé el", "lː", "l lung, syllabic", "stĺp", "rare"),
    ("ľ", "eľ", "ʎ", "≈ li- glide (liliac), one sound", "ľudia", None),
    ("m", "em", "m", "m", "mama", None),
    ("n", "en", "n", "n", "noc", "soft before e/i: nie = 'nie'"),
    ("ň", "eň", "ɲ", "≈ ni- glide (nimic), one sound", "deň", None),
    ("o", "ó", "ɔ", "o", "okno", None),
    ("ó", "dlhé ó", "ɔː", "o lung", "móda", "rare in native words"),
    ("ô", "ó s vokáňom", "u̯ɔ", "uo — one syllable", "môj", None),
    ("p", "pé", "p", "p", "pivo", None),
    ("q", "kvé", "kv", "cv", "—", "foreign words only"),
    ("r", "er", "r", "r", "ruka", "can carry a syllable: prst"),
    ("ŕ", "dlhé er", "rː", "r lung, syllabic", "vŕba", "rare"),
    ("s", "es", "s", "s", "syn", None),
    ("š", "eš", "ʃ", "ș (șapte)", "škola", None),
    ("t", "té", "t", "t", "to", "soft before e/i: teraz? no — exceptions exist"),
    ("ť", "ťé", "c", "≈ ti- glide, one sound", "ťažký", "no RO equivalent"),
    ("u", "ú", "u", "u", "ulica", None),
    ("ú", "dlhé ú", "uː", "u lung", "ústa", None),
    ("v", "vé", "v", "v; after a vowel before a consonant → u (prauda)", "voda", None),
    ("w", "dvojité vé", "v", "v", "—", "foreign words only"),
    ("x", "iks", "ks", "cs", "taxi", "foreign words only"),
    ("y", "ypsilon", "i", "i — same sound as i, different spelling", "byt", "keeps the consonant before it hard: ty vs ti"),
    ("ý", "dlhé ypsilon", "iː", "i lung", "dobrý", None),
    ("z", "zet", "z", "z", "zima", None),
    ("ž", "žet", "ʒ", "j (joc)", "žena", None),
]
DIPHTHONGS = [("ia", "ɪ̯a", "ia", "piatok"), ("ie", "ɪ̯e", "ie", "viem"), ("iu", "ɪ̯u", "iu", "cudziu"), ("ô", "u̯ɔ", "uo", "kôň")]

if __name__ == "__main__":
    for s in ["Prosím si kávu.", "Ďakujem pekne.", "Dobrý deň.", "Koľko to stojí?", "Nerozumiem.", "chlieb a mlieko",
              "čaj", "džem", "dievča", "hovoriť", "chodiť", "pravda", "hrad", "kde je záchod", "ľudia", "kôň", "prst", "Rumunsko"]:
        print(f"  {s:20s} → {respell_ro(s):28s} {ipa(s)}")
