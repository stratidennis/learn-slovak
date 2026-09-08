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
import json, os, shutil, collections, random
from .common import CONTENT, ROOT, read_jsonl

APP_PUBLIC = os.path.join(ROOT, "app", "public")
OUT = os.path.join(APP_PUBLIC, "content")
AUDIO_OUT = os.path.join(APP_PUBLIC, "audio")

def dump(name, obj):
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))
    return os.path.getsize(path)

def main():
    lex = list(read_jsonl(f"{CONTENT}/lexemes.jsonl"))
    sents = list(read_jsonl(f"{CONTENT}/sentences.jsonl"))
    chunks = list(read_jsonl(f"{CONTENT}/chunks.jsonl"))
    notes = list(read_jsonl(f"{CONTENT}/grammar_notes.jsonl"))
    units = list(read_jsonl(f"{CONTENT}/lessons.jsonl"))
    pairs = list(read_jsonl(f"{CONTENT}/minimal_pairs.jsonl"))
    sizes, audio_refs = {}, set()
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)

    # ---- lexemes (bands 1–2, teachable) + forms index + coverage weights -------
    total = sum(r["subtitle_count"] for r in lex)
    lite, forms_index = [], {}
    for r in lex:
        if r["band"] <= 2 and not r.get("exclude_from_teaching"):
            lite.append({"l": r["lemma"], "pos": r["pos"], "ro": r["gloss_ro"], "en": r["gloss_en"], "ipa": r["ipa"],
                         "b": r["band"], "rk": r["spoken_rank"], "g": r["gender"], "asp": r["aspect"],
                         "flag": r["register_flag"], "cog": r["cognate_ro"], "ff": r["false_friend_ro"],
                         "forms": [[f["form"], f["tags"]] for f in (r["forms"] or [])][:60],
                         "rs": r["review_status"]["overall"]})
            forms_index.setdefault(r["lemma"].lower(), r["lemma"])
            for f in r["forms"] or []:
                forms_index.setdefault(f["form"].lower(), r["lemma"])
    sizes["lexemes.json"] = dump("lexemes.json", lite)
    sizes["forms_index.json"] = dump("forms_index.json", forms_index)
    # fractions of the 3,000-lemma total — what the coverage meter needs, not raw counts
    sizes["coverage.json"] = dump("coverage.json", {r["lemma"]: round(r["subtitle_count"] / total, 7) for r in lex})

    # ---- units, chunks, notes, pairs -------------------------------------------
    sizes["units.json"] = dump("units.json", [{k: u.get(k) for k in ("id","title","title_ro","sas_area","can_do","grammar_notes",
        "exercise_sequence","roleplay","creative","domain_pack","milestone","phase","chunks")} for u in units])
    by_unit = collections.defaultdict(list)
    for c in chunks:
        by_unit[c["unit"]].append(c)
        if c.get("audio"): audio_refs.add(c["audio"]["file"])
        for v in c.get("variants", []):
            if v.get("audio"): audio_refs.add(v["audio"]["file"])
    for uid, cs in by_unit.items():
        sizes[f"chunks/{uid}.json"] = dump(f"chunks/{uid}.json", cs)
    sizes["grammar_notes.json"] = dump("grammar_notes.json", notes)
    for p in pairs:
        for k in ("a", "b"):
            if p.get("audio") and p["audio"].get(k): audio_refs.add(p["audio"][k]["file"])
    sizes["minimal_pairs.json"] = dump("minimal_pairs.json", pairs)

    # ---- lesson sentences per unit ---------------------------------------------
    good = [s for s in sents if s["audio"] and not s["register_flags"] and s["band"] is not None]
    rnd = random.Random(7)
    def score(s, targets):
        return (len(set(s["content_lemmas"]) & targets), s["native_author"], bool(s["en"]), -abs(s["n_words"] - 6))
    n_sent = 0
    used: set[str] = set()          # a sentence should teach in ONE unit, not be recycled by every unit
    for u in units:
        sel = u.get("sentence_selection") or {}
        pool = sel.get("pool", "band1")
        max_band = 2 if "2" in pool else 1
        n = sel["n"] if isinstance(sel.get("n"), int) else 30
        targets = set(sel.get("lemmas", []))
        cands = [s for s in good if s["band"] <= max_band]
        if targets:
            cands = [s for s in cands if set(s["content_lemmas"]) & targets] or cands
        cands.sort(key=lambda s: (s["id"] not in used,) + score(s, targets), reverse=True)
        picked, per_lemma = [], collections.Counter()
        cap = max(2, n // max(1, len(targets)) + 1) if targets else n
        for s in cands:
            hits = set(s["content_lemmas"]) & targets
            if targets and hits and all(per_lemma[h] >= cap for h in hits):
                continue
            picked.append(s)
            for h in hits: per_lemma[h] += 1
            if len(picked) >= n: break
        rnd.shuffle(picked)
        for s in picked:
            audio_refs.add(s["audio"]["file"]); used.add(s["id"])
        n_sent += len(picked)
        sizes[f"sentences/{u['id']}.json"] = dump(f"sentences/{u['id']}.json",
            [{"id": s["id"], "sk": s["sk"], "en": s["en"][:1], "ro": s["ro"][:1], "lemmas": s["content_lemmas"],
              "audio": s["audio"]["file"], "native": s["native_author"], "band": s["band"],
              "attr": s["attribution"], "lic": s["licence"]} for s in picked])

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
    print(f"  audio: {copied} referenced clips copied ({audio_mb:.1f} MB), {missing} missing -> {AUDIO_OUT}")

if __name__ == "__main__":
    main()
