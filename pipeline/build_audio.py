#!/usr/bin/env python3
"""Render sentence audio with Piper, pre-spelling every number as words.

    .venv/bin/python -m pipeline.build_audio --limit 200
    .venv/bin/python -m pipeline.build_audio --all

Writes content/audio/<id>.ogg (gitignored -- regenerable) and rewrites
content/sentences.jsonl with the `audio` field filled in.

Q3 (docs/SPIKE-RESULTS.md) measured that Piper mangles currency, decimals and
prices from digits, so `expand_numbers` runs first. Sentences with number forms
we cannot expand safely (ordinals need case agreement) are skipped and listed,
not silently rendered wrong.
"""
from __future__ import annotations

import argparse
import collections
import os
import subprocess
import sys
import wave

from .common import CONTENT, LICENCES, WORK, read_jsonl, write_jsonl
from .num2words_sk import expand_numbers, has_digits, unexpandable

VOICE_DIR = os.path.join(os.path.dirname(CONTENT), "spike_data", "voices")
VOICE = "sk_SK-lili-medium"
AUDIO_DIR = os.path.join(CONTENT, "audio")


def to_ogg(wav_path: str, ogg_path: str) -> bool:
    """WAV -> OGG/Vorbis via libsndfile (bundled with soundfile).

    Avoids depending on a system ffmpeg/oggenc. Vorbis rather than Opus because
    Safari still does not decode Opus in an <audio> tag on older iOS, and this
    is meant to be a PWA that works on a phone.
    """
    try:
        import soundfile as sf
    except ImportError:
        return False
    data, rate = sf.read(wav_path)
    sf.write(ogg_path, data, rate, format="OGG", subtype="VORBIS")
    return True


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=200,
                    help="render only the N highest-value sentences (default 200)")
    ap.add_argument("--all", action="store_true", help="render everything")
    ap.add_argument("--band", type=int, default=1, help="max band to render")
    args = ap.parse_args()

    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(os.path.join(VOICE_DIR, f"{VOICE}.onnx"))
    cfg = SynthesisConfig(length_scale=1.0)
    os.makedirs(AUDIO_DIR, exist_ok=True)
    try:
        import soundfile  # noqa: F401
        can_ogg = True
    except ImportError:
        can_ogg = False
        print("  note: soundfile not installed — keeping WAV (pip install soundfile)")

    path = os.path.join(CONTENT, "sentences.jsonl")
    records = list(read_jsonl(path))

    # highest value first: band-1 clean, native-authored, has a translation
    def score(r):
        return (r["band1_clean"], r["native_author"], bool(r["en"]), -(r["n_words"]))

    todo = [r for r in records
            if r["band"] is not None and r["band"] <= args.band
            and not r["register_flags"]]
    todo.sort(key=score, reverse=True)
    if not args.all:
        todo = todo[: args.limit]

    stats = collections.Counter()
    skipped = []
    by_id = {r["id"]: r for r in records}
    for i, r in enumerate(todo, 1):
        text = r["sk"]
        problems = unexpandable(text) if has_digits(text) else []
        if problems:
            stats["skipped_numbers"] += 1
            skipped.append((r["id"], text, problems))
            continue
        spoken = expand_numbers(text) if has_digits(text) else text
        stem = r["id"].replace(":", "")
        wav = os.path.join(AUDIO_DIR, stem + ".wav")
        with wave.open(wav, "wb") as wf:
            voice.synthesize_wav(spoken, wf, syn_config=cfg)
        out_name = stem + ".wav"
        if can_ogg:
            ogg = os.path.join(AUDIO_DIR, stem + ".ogg")
            if to_ogg(wav, ogg):
                os.remove(wav)
                out_name = stem + ".ogg"
        by_id[r["id"]]["audio"] = {
            "file": f"audio/{out_name}",
            "spoken_text": spoken if spoken != text else None,
            "tts_voice": f"piper:{VOICE}",
            **{k: v for k, v in LICENCES["piper"].items() if k != "url"},
        }
        stats["rendered"] += 1
        if i % 100 == 0:
            print(f"    {i}/{len(todo)} ...", flush=True)

    write_jsonl(path, records)
    print(f"  rendered {stats['rendered']:,} clips -> {AUDIO_DIR}")
    if skipped:
        print(f"  skipped {len(skipped)} with number forms needing hand-written Slovak:")
        for sid, text, probs in skipped[:10]:
            print(f"    {sid}  {text}   ({', '.join(probs)})")


if __name__ == "__main__":
    main()
