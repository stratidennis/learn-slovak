#!/usr/bin/env python3
"""Switch the whole app to another TTS voice.

    SK_TTS_VOICE=edge:sk-SK-ViktoriaNeural .venv/bin/python -m pipeline.revoice

Moves every clip the app references (sentences, chunks, pairs, alphabet, their -slow twins) out of
content/audio into content/audio_old/<voice>/ and clears the `audio` fields of chunk/pair records
so export_app_content re-renders them with SK_TTS_VOICE. Sentence records keep their old audio
path but the exporter re-renders anything whose file is missing. Piper clips for the other 4,000
band-1 sentences are untouched (they are not shipped).
"""
import os, shutil, json
from .common import CONTENT, read_jsonl, write_jsonl
from .tts import DEFAULT_VOICE

def main():
    old = os.path.join(CONTENT, "audio_old", "piper"); os.makedirs(old, exist_ok=True)
    refs = set()
    for f in ("chunks", "minimal_pairs", "sentences"):
        path = f"{CONTENT}/{f}.jsonl"; recs = list(read_jsonl(path)); changed = False
        for r in recs:
            for key in ("audio",):
                a = r.get(key)
                if isinstance(a, dict) and a.get("file"): refs.add(a["file"]); 
                if isinstance(a, dict) and a.get("a"):   # minimal pairs {a:{file},b:{file}}
                    for k in ("a", "b"):
                        if a.get(k): refs.add(a[k]["file"])
            for v in r.get("variants", []) or []:
                if v.get("audio"): refs.add(v["audio"]["file"])
            if f in ("chunks", "minimal_pairs"):
                if r.get("audio"): r["audio"] = None; changed = True
                for v in r.get("variants", []) or []:
                    if v.get("audio"): v["audio"] = None; changed = True
        if changed: write_jsonl(path, recs)
    moved = 0
    for ref in sorted(refs):
        stem = os.path.splitext(os.path.basename(ref))[0]
        for cand in (ref, f"audio/{stem}-slow.ogg", f"audio/{stem}-slow.mp3"):
            src = os.path.join(CONTENT, cand)
            if os.path.exists(src):
                shutil.move(src, os.path.join(old, os.path.basename(cand))); moved += 1
    for f in os.listdir(os.path.join(CONTENT, "audio")):
        if f.startswith("alpha-"):
            shutil.move(os.path.join(CONTENT, "audio", f), os.path.join(old, f)); moved += 1
    print(f"moved {moved} clips to {old}; next export renders with {DEFAULT_VOICE}")
    print("now run:  SK_TTS_VOICE=<voice> .venv/bin/python -m pipeline.export_app_content")

if __name__ == "__main__":
    main()
