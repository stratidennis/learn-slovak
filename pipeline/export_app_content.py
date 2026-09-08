#!/usr/bin/env python3
"""Export content/*.jsonl into the small per-unit JSON files the app fetches.

    .venv/bin/python -m pipeline.export_app_content

Writes app/public/content/…  and copies ONLY the audio clips the app actually references
(lesson sentences, chunks + variants, minimal pairs) into app/public/audio/. Both dirs are
gitignored and regenerated at build. Shipping referenced clips instead of all 5,000+ keeps the
deploy at ~1,300 files / ~17 MB, well inside Vercel Hobby limits and fast on a phone.

Lesson-sentence selection per unit follows lessons.jsonl `sentence_selection`: within the unit's
pool band, contains one of the unit's target lemmas, prefers native-authored + English
translation + audio, no register flags, spread across target lemmas.
"""
from __future__ import annotations
import json, os, re, shutil, collections, random
from .common import CONTENT, ROOT, read_jsonl, write_jsonl
from .pronounce import respell_ro, ipa as ipa_of, ALPHABET, DIPHTHONGS
from .translations_ro import PAIR_GLOSS_RO, ALPHABET_I18N, DIPHTHONGS_I18N

APP_PUBLIC = os.path.join(ROOT, "app", "public")
OUT = os.path.join(APP_PUBLIC, "content")
AUDIO_OUT = os.path.join(APP_PUBLIC, "audio")

def dump(name, obj):
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))
    return os.path.getsize(path)

def _get_voice():
    global _voice
    if _voice is None:
        from .build_audio import VOICE_DIR, VOICE
        from piper import PiperVoice
        _voice = PiperVoice.load(os.path.join(VOICE_DIR, f"{VOICE}.onnx"))
    return _voice

from .tts import render as tts_render, DEFAULT_VOICE as TTS_VOICE, flush as tts_flush

# Two speakers so the ear does not lock onto one. Only meaningful for the edge backend; with
# piper every entry resolves to the single Slovak model.
VOICES = {"f": "edge:sk-SK-ViktoriaNeural", "m": "edge:sk-SK-LukasNeural"} if TTS_VOICE.startswith("edge") \
    else {"f": TTS_VOICE, "m": TTS_VOICE}
def unit_voice(unit_id: str, other: bool = False) -> str:
    """Even units → Viktória, odd → Lukáš (by position in the phase); `other` flips it."""
    try:
        n = int(unit_id.split(".")[1])
    except (IndexError, ValueError):
        n = 0
    key = "f" if n % 2 == 0 else "m"
    if other: key = "m" if key == "f" else "f"
    return VOICES[key]

def _existing(stem: str) -> str | None:
    for ext in (".mp3", ".ogg"):
        if os.path.exists(os.path.join(CONTENT, "audio", stem + ext)):
            return f"audio/{stem}{ext}"
    return None

def slow_clip(file: str, text: str, voice: str = TTS_VOICE) -> str:
    """content/audio/<stem>-slow.<ext> — slow speech rendered by the TTS itself (Piper length_scale
    1.4 / Edge rate -30%), never playbackRate. Idempotent; same speaker as the normal clip."""
    stem = os.path.splitext(os.path.basename(file))[0].removesuffix("-slow")
    have = _existing(stem + "-slow")
    if have: return have
    rec = tts_render(text, os.path.join(CONTENT, "audio", stem + "-slow"), voice=voice, slow=True)
    slow_clip.rendered = getattr(slow_clip, "rendered", 0) + 1
    return rec["file"]

def alphabet_json(audio_refs: set) -> list:
    """Letters with name + example audio (Piper). Letter names are spoken via their Slovak name text."""
    out = []
    for letter, name, ipa_, ro_anchor, example, note in ALPHABET:
        stem = "alpha-" + re.sub(r"[^a-z]", lambda m: f"u{ord(m.group(0)):04x}", letter)
        name_rel = _existing(stem + "-name") or tts_render(name, os.path.join(CONTENT, "audio", stem + "-name"), voice=VOICES["f"], slow=True)["file"]
        ex_rel = None
        if example and example != "—":
            ex_rel = _existing(stem + "-ex") or tts_render(example, os.path.join(CONTENT, "audio", stem + "-ex"), voice=VOICES["f"])["file"]
            audio_refs.add(ex_rel)
        audio_refs.add(name_rel)
        a_en, a_ro, n_en, n_ro = ALPHABET_I18N.get(letter, (ro_anchor, ro_anchor, note, note))
        out.append({"letter": letter, "name": name, "ipa": ipa_, "anchor": {"en": a_en, "ro": a_ro}, "example": example,
                    "example_spell": respell_ro(example) if example and example != "—" else None,
                    "note": {"en": n_en, "ro": n_ro}, "audio_name": name_rel, "audio_example": ex_rel})
    return [{"letters": out, "diphthongs": [{"d": d, "ipa": i, "anchor": {"en": DIPHTHONGS_I18N.get(d, (r, r))[0], "ro": DIPHTHONGS_I18N.get(d, (r, r))[1]}, "example": e} for d, i, r, e in DIPHTHONGS]}]

_voice = None
def ensure_audio(picked, voice=TTS_VOICE):
    """Render clips for selected sentences that have none yet (or whose file vanished after a
    re-voice), and persist the audio field."""
    todo = [s for s in picked if not s.get("audio") or not os.path.exists(os.path.join(CONTENT, s["audio"]["file"]))]
    if not todo:
        return
    for s in todo:
        stem = s["id"].replace(":", "")
        have = _existing(stem)
        s["audio"] = {"file": have, "tts_voice": "existing"} if have else tts_render(s["sk"], os.path.join(CONTENT, "audio", stem), voice=voice)
    ensure_audio.rendered = getattr(ensure_audio, "rendered", 0) + sum(1 for s in todo if s["audio"])


def main():
    lex = list(read_jsonl(f"{CONTENT}/lexemes.jsonl"))
    sents = list(read_jsonl(f"{CONTENT}/sentences.jsonl"))
    chunks = list(read_jsonl(f"{CONTENT}/chunks.jsonl"))
    notes = list(read_jsonl(f"{CONTENT}/grammar_notes.jsonl"))
    units = list(read_jsonl(f"{CONTENT}/lessons.jsonl"))
    pairs = list(read_jsonl(f"{CONTENT}/minimal_pairs.jsonl"))
    sizes, audio_refs = {}, set()
    emoji = json.load(open(os.path.join(ROOT, "data", "emoji.json"), encoding="utf-8"))["map"]
    emoji = {k.strip(): v for k, v in emoji.items()}
    pos_of = {r["lemma"]: r["pos"] for r in lex}
    def emoji_for(lemmas):
        ls = [l for l in lemmas if l]
        for l in ls:                                  # a thing first: "Prosím si kávu" -> ☕, not 🙏
            if l in emoji and pos_of.get(l) == "NOUN": return emoji[l]
        for l in ls:
            if l in emoji: return emoji[l]
        return None
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)

    # ---- lexemes (bands 1–2, teachable) + forms index + coverage weights -------
    total = sum(r["subtitle_count"] for r in lex)
    lite, forms_index = [], {}
    for r in lex:
        if r["band"] <= 2 and not r.get("exclude_from_teaching"):
            gen = None if r["ipa"] else ipa_of(r["lemma"])
            lite.append({"l": r["lemma"], "pos": r["pos"], "ro": r["gloss_ro"], "en": r["gloss_en"],
                         "ipa": r["ipa"] or gen, "ipa_src": "kaikki" if r["ipa"] else ("generated" if gen else None),
                         "spell": respell_ro(r["lemma"]),
                         "b": r["band"], "rk": r["spoken_rank"], "g": r["gender"], "asp": r["aspect"],
                         "flag": r["register_flag"], "cog": r["cognate_ro"], "ff": r["false_friend_ro"],
                         "forms": [[f["form"], f["tags"]] for f in (r["forms"] or [])][:60],
                         "emoji": emoji.get(r["lemma"]), "rs": r["review_status"]["overall"]})
            forms_index.setdefault(r["lemma"].lower(), r["lemma"])
            for f in r["forms"] or []:
                forms_index.setdefault(f["form"].lower(), r["lemma"])
    sizes["lexemes.json"] = dump("lexemes.json", lite)
    sizes["forms_index.json"] = dump("forms_index.json", forms_index)
    # fractions of the 3,000-lemma total — what the coverage meter needs, not raw counts
    sizes["coverage.json"] = dump("coverage.json", {r["lemma"]: round(r["subtitle_count"] / total, 7) for r in lex})
    cog = json.load(open(os.path.join(ROOT, "data", "cognates_ro.json"), encoding="utf-8"))["entries"]
    sizes["cognates.json"] = dump("cognates.json", [{"id": f"cog:{c['sk_lemmas'][0]}", "sk": c["sk_lemmas"][0], "sk_all": c["sk"], "ro": c["ro"],
        "en": c["meaning_en"], "note": c["note"], "shift": c["semantic_shift"], "spell": respell_ro(c["sk_lemmas"][0]),
        "emoji": emoji.get(c["sk_lemmas"][0]), "audio": _existing("cog-" + re.sub(r"[^a-z]", lambda m: f"u{ord(m.group(0)):04x}", c["sk_lemmas"][0].lower()))
            or tts_render(c["sk_lemmas"][0], os.path.join(CONTENT, "audio", "cog-" + re.sub(r"[^a-z]", lambda m: f"u{ord(m.group(0)):04x}", c["sk_lemmas"][0].lower())), voice=VOICES["f"])["file"]} for c in cog])
    for c in json.load(open(os.path.join(OUT, "cognates.json"), encoding="utf-8")): audio_refs.add(c["audio"])

    # ---- chunks, notes, pairs (units are written last: they list the picked sentences) ----
    unit_sentence_ids = {}
    by_unit = collections.defaultdict(list)
    chunks_changed = False
    for c in chunks:
        by_unit[c["unit"]].append(c)
        c["guide"] = {"ro": respell_ro(c["sk"]), "ipa": ipa_of(c["sk"])}
        c["emoji"] = emoji_for([forms_index.get(w.lower().strip(".,!?…")) for w in c["sk"].split()] + [w.lower().strip(".,!?…") for w in c["sk"].split()])
        stem = c["id"].replace(":", "-").replace(".", "_")
        if not c.get("audio"):
            c["audio"] = tts_render(c["sk"], os.path.join(CONTENT, "audio", stem), voice=unit_voice(c["unit"])); chunks_changed = True
        if c.get("audio"):
            audio_refs.add(c["audio"]["file"]); c["audio_slow"] = slow_clip(c["audio"]["file"], c["sk"], unit_voice(c["unit"])); audio_refs.add(c["audio_slow"])
        for i, v in enumerate(c.get("variants", [])):
            v["guide"] = {"ro": respell_ro(v["sk"]), "ipa": ipa_of(v["sk"])}
            if not v.get("audio"):
                v["audio"] = tts_render(v["sk"], os.path.join(CONTENT, "audio", f"{stem}-v{i+1}"), voice=unit_voice(c["unit"], other=True)); chunks_changed = True
            if v.get("audio"):
                audio_refs.add(v["audio"]["file"]); v["audio_slow"] = slow_clip(v["audio"]["file"], v["sk"], unit_voice(c["unit"], other=True)); audio_refs.add(v["audio_slow"])
    if chunks_changed:
        write_jsonl(f"{CONTENT}/chunks.jsonl", chunks)
    for uid, cs in by_unit.items():
        sizes[f"chunks/{uid}.json"] = dump(f"chunks/{uid}.json", cs)
    sizes["grammar_notes.json"] = dump("grammar_notes.json", notes)
    pairs_changed = False
    for p in pairs:
        if not p.get("audio"):
            stem = p["id"].replace(":", "-").replace("/", "_")
            p["audio"] = {"a": tts_render(p["a"], os.path.join(CONTENT, "audio", stem + "-a"), voice=VOICES["f"], slow=True)}
            if p.get("b"): p["audio"]["b"] = tts_render(p["b"], os.path.join(CONTENT, "audio", stem + "-b"), voice=VOICES["f"], slow=True)
            pairs_changed = True
        for k in ("a", "b"):
            if p.get("audio") and p["audio"].get(k): audio_refs.add(p["audio"][k]["file"])
    if pairs_changed:
        write_jsonl(f"{CONTENT}/minimal_pairs.jsonl", pairs)
    for p in pairs:
        p["guide"] = {"a": respell_ro(p["a"], mark_stress=False), "b": respell_ro(p["b"], mark_stress=False) if p.get("b") else None}
        p["gloss_ro"] = PAIR_GLOSS_RO.get(p["gloss"], p["gloss"])
    sizes["minimal_pairs.json"] = dump("minimal_pairs.json", pairs)
    sizes["alphabet.json"] = dump("alphabet.json", alphabet_json(audio_refs))

    # ---- lesson sentences per unit ---------------------------------------------
    # NOT filtered on audio: only band-1 sentences were pre-rendered, which silently excluded every
    # sentence containing a band-3 market word. Missing clips are synthesized after selection.
    good = [s for s in sents if not s["register_flags"] and s["band"] is not None and not s["unknown_lemmas"]]
    rnd = random.Random(7)
    rank_of = {r["lemma"]: r["spoken_rank"] for r in lex}
    band_of = {r["lemma"]: r["band"] for r in lex}
    import math
    def score(s, targets):
        # A hit on a rare target lemma (káva #615, platiť #532) is worth far more than a hit on a
        # glue verb (chcieť #25): otherwise the unit "Coffee" fills up with sentences about wanting.
        # Same failure §15.3 describes, at sentence level.
        w = sum(math.sqrt(rank_of.get(l, 3000)) for l in set(s["content_lemmas"]) & targets)
        short = s["n_words"] <= 8
        return (round(w, 1), short, s["native_author"], bool(s["en"]), -abs(s["n_words"] - 5))
    n_sent = 0
    used: set[str] = set()          # a sentence should teach in ONE unit, not be recycled by every unit
    for u in units:
        sel = u.get("sentence_selection") or {}
        pool = sel.get("pool", "band1")
        max_band = 2 if "2" in pool else 1
        n = sel["n"] if isinstance(sel.get("n"), int) else 30
        targets = set(sel.get("lemmas", []))
        # A sentence qualifies when every content lemma is inside the pool band OR is one of the
        # unit's own target lemmas. Market words are band 3 (chlieb #2142, kilo #2770 — §15.3), so
        # a plain "band <= 2" filter threw away exactly the sentences unit 1.6 exists to teach.
        allowance = 0 if u["phase"] <= 1 else 1
        def fits(s):
            out = [l for l in s["content_lemmas"] if band_of.get(l, 99) > max_band and l not in targets]
            return len(out) <= allowance
        cands = [s for s in good if fits(s)]
        if targets:
            hits = [s for s in cands if set(s["content_lemmas"]) & targets]
            cands = hits or cands
        cands.sort(key=lambda s: (s["id"] not in used,) + score(s, targets), reverse=True)
        picked, per_lemma = [], collections.Counter()
        cap = max(3, n // max(1, len(targets)) + 2) if targets else n
        for s in cands:
            hits = set(s["content_lemmas"]) & targets
            if targets and hits and all(per_lemma[h] >= cap for h in hits):
                continue
            picked.append(s)
            for h in hits: per_lemma[h] += 1
            if len(picked) >= n: break
        rnd.shuffle(picked)
        ensure_audio(picked, unit_voice(u["id"]))
        picked = [s for s in picked if s.get("audio")]
        unit_sentence_ids[u["id"]] = [s["id"] for s in picked]
        for s in picked:
            audio_refs.add(s["audio"]["file"]); used.add(s["id"])
        n_sent += len(picked)
        sizes[f"sentences/{u['id']}.json"] = dump(f"sentences/{u['id']}.json",
            [{"id": s["id"], "sk": s["sk"], "en": s["en"][:1], "ro": s["ro"][:1], "lemmas": s["content_lemmas"],
              "audio": s["audio"]["file"], "audio_slow": slow_clip(s["audio"]["file"], s["sk"], unit_voice(u["id"])),
              "guide": {"ro": respell_ro(s["sk"]), "ipa": ipa_of(s["sk"])}, "emoji": emoji_for(s["content_lemmas"]),
              "native": s["native_author"], "band": s["band"],
              "attr": s["attribution"], "lic": s["licence"]} for s in picked])
        for s in picked: audio_refs.add(slow_clip(s["audio"]["file"], s["sk"], unit_voice(u["id"])))

    if getattr(slow_clip, "rendered", 0):
        print(f"  rendered {slow_clip.rendered} slow clips (length_scale 1.4)")
    if getattr(ensure_audio, "rendered", 0):
        from .common import write_jsonl as _w
        _w(f"{CONTENT}/sentences.jsonl", sents)
        print(f"  synthesized {ensure_audio.rendered} new clips for selected sentences (persisted to content/sentences.jsonl)")

    def unit_items(u):
        uid = u["id"]
        if uid == "0.1": return [{"kind": "letter", "id": f"letter:{l[0]}"} for l in ALPHABET]
        if uid == "0.2": return [{"kind": "pair", "id": p["id"]} for p in pairs if p["kind"] == "pair"]
        if uid == "0.3": return [{"kind": "cognate", "id": f"cog:{c['sk_lemmas'][0]}"} for c in cog]
        if uid == "0.4": return [{"kind": "word", "id": f"word:{l[4]}"} for l in ALPHABET if l[4] and l[4] != "—"]
        if uid == "0.5": return [{"kind": "chunk", "id": c["id"]} for c in chunks if c["unit"] in ("1.1", "1.2")][:20]
        items = [{"kind": "chunk", "id": c["id"]} for c in chunks if c["unit"] == uid]
        items += [{"kind": "sentence", "id": sid} for sid in unit_sentence_ids.get(uid, [])]
        return items
    sizes["units.json"] = dump("units.json", [{**{k: u.get(k) for k in ("id","title","title_ro","sas_area","can_do","can_do_ro","grammar_notes",
        "exercise_sequence","roleplay","creative","domain_pack","milestone","phase","chunks")}, "items": unit_items(u)} for u in units])

    n_flushed = tts_flush()                     # wait for queued Edge renders before copying
    if n_flushed: print(f"  rendered {n_flushed} clips with {TTS_VOICE.split(':')[0]} (concurrent)")

    # ---- referenced audio only ------------------------------------------------------
    if os.path.islink(AUDIO_OUT): os.remove(AUDIO_OUT)
    if os.path.isdir(AUDIO_OUT): shutil.rmtree(AUDIO_OUT)
    os.makedirs(AUDIO_OUT)
    copied = missing = 0
    for ref in sorted(audio_refs):
        src = os.path.join(CONTENT, ref)                # ref is "audio/<file>"
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(AUDIO_OUT, os.path.basename(ref))); copied += 1
        else:
            missing += 1
    audio_mb = sum(os.path.getsize(os.path.join(AUDIO_OUT, f)) for f in os.listdir(AUDIO_OUT)) / 1e6

    tot = sum(sizes.values())
    print(f"  content: {len(sizes)} files, {tot/1e6:.1f} MB -> {OUT}")
    for k in ("lexemes.json","forms_index.json","coverage.json","units.json","grammar_notes.json","minimal_pairs.json"):
        print(f"    {k:22s} {sizes[k]/1e3:7.0f} KB")
    print(f"    sentences/*.json      {sum(v for k,v in sizes.items() if k.startswith('sentences/'))/1e3:7.0f} KB  ({n_sent} sentences over {len(units)} units)")
    print(f"    chunks/*.json         {sum(v for k,v in sizes.items() if k.startswith('chunks/'))/1e3:7.0f} KB")
    print(f"  audio: {copied} referenced clips copied ({audio_mb:.1f} MB), {missing} missing -> {AUDIO_OUT}   [voice: {TTS_VOICE}]")

if __name__ == "__main__":
    main()
