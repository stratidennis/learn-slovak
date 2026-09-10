"""Context for the `word` items of unit 0.4 — a word alone, then in a phrase, then in a conversation (D132).

A single word on its own is almost useless to a learner: it has no case, no melody, no situation. So each
of the alphabet's example words gets

  * a **phrase** that contains it — hand-authored in `data/word_context.json` where the corpus has
    nothing usable, else the unit's own chunk, else the shortest natural sentence from the corpus;
  * a **conversation** whose reply contains it — an existing hand-authored dialogue when one covers the
    word, else an authored two-line exchange. Words with neither fall back to the phrase.

`blank` marks which token *is* the word, so the app can blank it (cloze) or make the learner assemble the
line word by word (tiles). Everything authored here is a draft (`needs_review`).

    from .word_context import build
    records = build(words, chunks, dialogues, sentences, forms_index, audio_for)
"""
from __future__ import annotations
import json, os, unicodedata
from .common import ROOT, tokenize

AUTHORED = os.path.join(ROOT, "data", "word_context.json")

def _load() -> dict:
    with open(AUTHORED, encoding="utf-8") as fh:
        return json.load(fh)

def _fold(s: str) -> str:
    """lowercase without diacritics — for matching a form to its word."""
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")

def word_index(text: str, word: str, forms: dict[str, str]) -> int | None:
    """Which token of `text` is (a form of) `word`? Exact token, then its lemma, then the same two
    ignoring diacritics. Never a prefix: that matched "Bratislave" to *brat*, "Mám" to *mama* and
    "škoda" to *škola*, blanking the wrong word (D132)."""
    toks = tokenize(text)
    low = [t.lower() for t in toks]
    w = word.lower()
    if w in low:
        return low.index(w)
    for i, t in enumerate(low):
        if forms.get(t) == w:
            return i
    fw = _fold(w)
    for i, t in enumerate(low):
        if _fold(t) == fw:          # NOT on the lemma: folded, the noun *byt* eats the verb *byť*
            return i
    return None

def word_index_loose(text: str, word: str, forms: dict[str, str]) -> int | None:
    """Where the word sits in text we *authored around it* — so an inflected form is expected and a
    fuzzy hit cannot be a different word. Strict first, then the token sharing the longest prefix with
    the word (>= 3 characters, one clear winner). Locates "džemom", "gitare", "stĺpe"."""
    hit = word_index(text, word, forms)
    if hit is not None:
        return hit
    fw = _fold(word)
    def shared(t: str) -> int:
        ft, n = _fold(t), 0
        while n < min(len(ft), len(fw)) and ft[n] == fw[n]:
            n += 1
        return n
    scores = [(shared(t), i) for i, t in enumerate(tokenize(text))]
    best = max(scores, default=(0, -1))
    if best[0] >= 3 and sum(1 for sc, _ in scores if sc == best[0]) == 1:
        return best[1]
    return None

def _sentence_score(s: dict) -> tuple:
    # natural, translated, already voiced, short — in that order
    return (-(1 if s.get("native_author") else 0), -(1 if s.get("en") else 0),
            -(1 if s.get("audio") else 0), s.get("n_words", 99), len(s["sk"]))

MIN_WORDS = 2          # "Ďakujem." on its own is a word, not a phrase

def pick_phrase(word: str, authored: dict, chunks: list[dict], sentences: list[dict], forms: dict[str, str]) -> dict | None:
    """authored > the unit's own chunk > the shortest natural corpus sentence. At least two words, and
    Romanian is required (the UI is RO-first) — anything else is authored in data/word_context.json."""
    a = authored.get("phrases", {}).get(word)
    if a:
        return {**a, "src": "authored", "attr": "learn-slovak (draft)", "lic": "project"}
    for c in chunks:
        if len(tokenize(c["sk"])) >= MIN_WORDS and c.get("ro") and word_index(c["sk"], word, forms) is not None:
            return {"sk": c["sk"], "ro": c["ro"], "en": c["en"], "src": "chunk", "chunk_id": c["id"],
                    "audio": (c.get("audio") or {}).get("file"), "audio_slow": c.get("audio_slow"),
                    "attr": "learn-slovak (draft)", "lic": "project"}
    cands = [s for s in sentences
             if not s.get("register_flags") and MIN_WORDS <= s.get("n_words", 99) <= 6 and (s.get("ro") or [None])[0]
             and word_index(s["sk"], word, forms) is not None]
    if not cands:
        return None
    s = sorted(cands, key=_sentence_score)[0]
    return {"sk": s["sk"], "ro": (s.get("ro") or [None])[0], "en": (s.get("en") or [None])[0], "src": "tatoeba",
            "sentence_id": s["id"], "audio": (s.get("audio") or {}).get("file"),
            "attr": s.get("attribution"), "lic": s.get("licence")}

def pick_convo(word: str, authored: dict, dialogues: list[dict], forms: dict[str, str]) -> dict | None:
    """The authored exchange when there is one — it exists because the automatic pick was poor (the
    phone-number dialogue for *jeden*) — else an existing dialogue whose reply contains the word."""
    a = authored.get("convos", {}).get(word)
    if a:
        return {"a": dict(a["a"]), "b": dict(a["b"]), "src": "authored"}
    for d in dialogues:
        if word_index(d["b"]["sk"], word, forms) is not None:
            return {"a": {k: d["a"].get(k) for k in ("sk", "ro", "en", "audio", "audio_slow")},
                    "b": {k: d["b"].get(k) for k in ("sk", "ro", "en", "audio", "audio_slow")},
                    "src": "dialogue", "dialogue_id": d["id"]}
    return None

def short_gloss(text: str | None) -> str | None:
    """One clean sense for a card: the lexicon's "hand, arm (the upper limb of a human…)" becomes "hand"."""
    if not text:
        return None
    return text.split("(")[0].split(",")[0].split(";")[0].strip(" .") or None

def build(words: list[str], chunks: list[dict], dialogues: list[dict], sentences: list[dict],
          forms: dict[str, str], voice_line, gloss_of=lambda w: (None, None)) -> list[dict]:
    """One record per word. `voice_line(text, stem, other=False, slow=False) -> rel path` renders/reuses
    audio; `gloss_of(word) -> (ro, en)` supplies the word's own meaning from the lexicon."""
    authored = _load()
    out = []
    for w in words:
        key = w.split("(")[0].strip()          # cognate lemmas can carry a parenthetical: "zbaviť (sa)"
        slug = "".join(f"u{ord(c):04x}" if not ("a" <= c <= "z" or c.isdigit()) else c for c in key.lower())
        rec: dict = {"w": w}
        # the word's own meaning: authored where the lexicon has no entry, else its first clean sense.
        # NOT the phrase's translation — "auto" means "car", not "Where's your car?" (D132).
        g = authored.get("glosses", {}).get(w) or authored.get("glosses", {}).get(key)
        lex_ro, lex_en = gloss_of(w)
        rec["gloss"] = {"ro": (g or {}).get("ro") or short_gloss(lex_ro), "en": (g or {}).get("en") or short_gloss(lex_en)}
        ph = pick_phrase(w, authored, chunks, sentences, forms) or (pick_phrase(key, authored, chunks, sentences, forms) if key != w else None)
        if ph:
            ph["blank"] = (word_index_loose if ph["src"] == "authored" else word_index)(ph["sk"], key, forms)
            if not ph.get("audio"):
                ph["audio"] = voice_line(ph["sk"], f"word-{slug}-phrase")
            ph["audio_slow"] = ph.get("audio_slow") or voice_line(ph["sk"], f"word-{slug}-phrase", slow=True)
            rec["phrase"] = ph
        cv = pick_convo(w, authored, dialogues, forms)
        if cv:
            cv["blank"] = (word_index_loose if cv["src"] == "authored" else word_index)(cv["b"]["sk"], key, forms)
            if not cv["a"].get("audio"):
                cv["a"]["audio"] = voice_line(cv["a"]["sk"], f"word-{slug}-convo-a", other=True)
            if not cv["b"].get("audio"):
                cv["b"]["audio"] = voice_line(cv["b"]["sk"], f"word-{slug}-convo-b")
            cv["b"]["audio_slow"] = cv["b"].get("audio_slow") or voice_line(cv["b"]["sk"], f"word-{slug}-convo-b", slow=True)
            rec["convo"] = cv
        out.append(rec)
    return out
