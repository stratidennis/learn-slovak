"""One TTS entry point, two backends.

    from pipeline.tts import render
    render("Prosím si kávu.", "content/audio/x.mp3", voice="edge:sk-SK-ViktoriaNeural", slow=False)

Backends
  piper:<model>   sk_SK-lili-medium — local, offline, MIT/CC0, 22 kHz. Robotic but free of any
                  service dependency. Slow = length_scale 1.4.
  edge:<voice>    Microsoft Edge "Read Aloud" neural voices via edge-tts — sk-SK-LukasNeural (m),
                  sk-SK-ViktoriaNeural (f), 24 kHz MP3. Much more natural; needs network at BUILD
                  time only (clips are pre-rendered). Slow = rate -30%, rendered by the service.
                  Licence note: edge-tts talks to an unofficial endpoint; there are no terms
                  granting redistribution. Acceptable for a private, personal deployment (research
                  §15.5 named it as the fallback). The terms-clean route to the *same* voices is
                  Azure Speech's free tier (500k chars/month) with a personal Azure account.

Numbers are spelled out before either backend (Q3). Output format follows the backend: OGG for
Piper, MP3 for Edge — the app plays both; the `audio.file` field carries the extension.
"""
from __future__ import annotations
import asyncio, os, wave, threading
from concurrent.futures import ThreadPoolExecutor
from .num2words_sk import expand_numbers, has_digits, unexpandable
from .common import LICENCES

DEFAULT_VOICE = os.environ.get("SK_TTS_VOICE", "piper:sk_SK-lili-medium")
_piper = {}

# Edge requests are network-bound, so they run on a small pool; render() returns the record
# immediately (paths are deterministic) and flush() waits for the files before anything copies
# them. Four in flight is gentle enough for the unofficial endpoint.
_pool = ThreadPoolExecutor(max_workers=int(os.environ.get("SK_TTS_CONCURRENCY", "4")))
_pending: dict[str, object] = {}
_lock = threading.Lock()

def flush() -> int:
    """Wait for every queued Edge render; re-raise the first failure. Returns how many finished."""
    with _lock:
        futs = list(_pending.items()); _pending.clear()
    n = 0
    for path, f in futs:
        f.result(); n += 1
    return n

def _piper_voice(model: str):
    if model not in _piper:
        from piper import PiperVoice
        from .common import ROOT
        _piper[model] = PiperVoice.load(os.path.join(ROOT, "spike_data", "voices", f"{model}.onnx"))
    return _piper[model]

def _clean(text: str) -> str:
    return text.replace("…", "").replace(" / ", ". ").strip()

def render(text: str, out_path_no_ext: str, voice: str = DEFAULT_VOICE, slow: bool = False) -> dict | None:
    """Render `text` to <out_path_no_ext>.<ext>. Returns the audio record for the content JSON,
    or None when the text has numbers we refuse to guess (ordinals)."""
    if has_digits(text) and unexpandable(text):
        return None
    spoken = _clean(expand_numbers(text) if has_digits(text) else text)
    backend, _, name = voice.partition(":")
    if backend == "piper":
        from piper import SynthesisConfig
        import soundfile as sf
        v = _piper_voice(name)
        wav = out_path_no_ext + ".wav"; ogg = out_path_no_ext + ".ogg"
        with wave.open(wav, "wb") as wf:
            v.synthesize_wav(spoken, wf, syn_config=SynthesisConfig(length_scale=1.4 if slow else 1.0))
        d, r = sf.read(wav); sf.write(ogg, d, r, format="OGG", subtype="VORBIS", compression_level=0.8); os.remove(wav)
        return {"file": os.path.relpath(ogg, os.path.dirname(os.path.dirname(ogg))), "spoken_text": spoken if spoken != text else None,
                "tts_voice": voice, **{k: v_ for k, v_ in LICENCES["piper"].items() if k != "url"}}
    if backend == "edge":
        mp3 = out_path_no_ext + ".mp3"
        if not os.path.exists(mp3):
            with _lock:
                if mp3 not in _pending:
                    _pending[mp3] = _pool.submit(_edge_job, spoken, name, mp3, slow)
        return {"file": os.path.relpath(mp3, os.path.dirname(os.path.dirname(mp3))), "spoken_text": spoken if spoken != text else None,
                "tts_voice": voice, "licence": "Microsoft Edge Read Aloud voice via edge-tts — personal use; no redistribution terms",
                "attribution": f"Microsoft neural voice {name}"}
    raise ValueError(f"unknown TTS backend in {voice!r}")


def _edge_job(spoken: str, name: str, mp3: str, slow: bool) -> None:
    import edge_tts, time
    tmp = mp3 + ".part"
    async def go():
        await edge_tts.Communicate(spoken, name, rate="-30%" if slow else "+0%").save(tmp)
    for attempt in range(4):
        try:
            asyncio.run(go())
            if os.path.getsize(tmp) < 1000:
                raise RuntimeError("empty audio from Edge")
            os.replace(tmp, mp3)
            from .trim_silence import trim_file             # Edge pads ~1 s of silence behind every clip (D131)
            trim_file(mp3)
            return
        except Exception:                          # the unofficial endpoint occasionally drops a request
            if os.path.exists(tmp): os.remove(tmp)
            if attempt == 3: raise
            time.sleep(2 * (attempt + 1))
