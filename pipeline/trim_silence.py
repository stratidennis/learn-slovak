"""Trim the silence Edge leaves around every clip (measured: ~0.2 s lead, 0.8–1.2 s tail) so a sequence —
letter → word, dialogue A → B — and every autoplay feel immediate (D131).

    .venv/bin/python -m pipeline.trim_silence                 # every clip under content/audio, in place
    .venv/bin/python -m pipeline.trim_silence a.mp3 b.mp3     # just these

Idempotent: a clip that already has ≤ LEAD+0.06 s in front and ≤ TAIL+0.15 s behind is left alone.
MP3 is re-encoded by libsndfile/LAME (mono 24 kHz, as Edge delivers it); OGG (Piper) by Vorbis.
tts.render() calls trim_file() on every new Edge clip, so freshly rendered audio is tight from the start.
"""
from __future__ import annotations
import os, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import soundfile as sf

LEAD, TAIL, THR = 0.08, 0.20, 0.01          # seconds kept in front / behind the speech; amplitude floor

def trim_file(path: str, lead: float = LEAD, tail: float = TAIL, thr: float = THR) -> bool:
    """Trim one file in place. Returns True when it was rewritten."""
    d, r = sf.read(path, dtype="float32")
    mono = d if d.ndim == 1 else d.mean(axis=1)
    loud = np.where(np.abs(mono) > thr)[0]
    if not len(loud):
        return False
    start, end = int(loud[0]), int(loud[-1]) + 1
    if start / r <= lead + 0.06 and (len(mono) - end) / r <= tail + 0.15:
        return False
    a, b = max(0, start - int(lead * r)), min(len(mono), end + int(tail * r))
    out = np.array(d[a:b], copy=True)
    n = min(int(0.008 * r), len(out) // 4)      # 8 ms fades: no click at the cut
    if n > 0:
        ramp = np.linspace(0.0, 1.0, n, dtype="float32")
        if out.ndim == 1: out[:n] *= ramp; out[-n:] *= ramp[::-1]
        else: out[:n] *= ramp[:, None]; out[-n:] *= ramp[::-1][:, None]
    mp3 = path.lower().endswith(".mp3")
    tmp = path + ".trim"
    sf.write(tmp, out, r, format="MP3" if mp3 else "OGG", subtype="MPEG_LAYER_III" if mp3 else "VORBIS")
    os.replace(tmp, path)
    return True

def silence_of(path: str, thr: float = THR) -> tuple[float, float, float]:
    """(total, lead, tail) seconds — for checks."""
    d, r = sf.read(path, dtype="float32")
    mono = d if d.ndim == 1 else d.mean(axis=1)
    loud = np.where(np.abs(mono) > thr)[0]
    if not len(loud): return (len(mono) / r, 0.0, 0.0)
    return (len(mono) / r, loud[0] / r, (len(mono) - loud[-1] - 1) / r)

def main(argv: list[str]) -> None:
    from .common import CONTENT
    files = argv or sorted(os.path.join(CONTENT, "audio", f) for f in os.listdir(os.path.join(CONTENT, "audio")) if f.lower().endswith((".mp3", ".ogg")))
    def one(p):
        try: return trim_file(p)
        except Exception as e:                    # a corrupt file must not stop the run
            print(f"  skip {os.path.basename(p)}: {e}", file=sys.stderr); return False
    with ThreadPoolExecutor(max_workers=6) as ex:
        done = sum(1 for x in ex.map(one, files) if x)
    print(f"trimmed {done} of {len(files)} clips")

if __name__ == "__main__":
    main(sys.argv[1:])
