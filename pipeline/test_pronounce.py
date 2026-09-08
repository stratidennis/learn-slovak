"""Run: .venv/bin/python -m pipeline.test_pronounce"""
from .pronounce import respell_ro, ipa
CASES = [
    ("Prosím si kávu.", "PROsiim si CAAvu."),
    ("Ďakujem pekne.", "DIAcuyem PEcnie."),
    ("Dobrý deň.", "DObrii DIEni."),
    ("Koľko to stojí?", "COlico to STOyii?"),
    ("chlieb", "hliep"),            # ch -> h, final devoicing
    ("čaj", "ciay"),                # č+a -> "cia" (RO ciai ≈ [t͡ʃaj]); j -> y
    ("džem", "gem"),                # RO ge = [d͡ʒe]
    ("dievča", "DIEucia"),          # v -> u glide after a vowel; č+a -> cia
    ("kde", "gdie"),                # assimilation k->g before ď
    ("hovoriť", "ɦOvoriti"),        # voiced h kept as ɦ, not uppercased
    ("pravda", "PRAuda"),
    ("Rumunsko", "RUmunsco"),
    ("ľudia", "LIUdia"),
    ("kôň", "CUOni"),
    ("cena", "ȚEna"),
    ("kilo", "CHIlo"),              # k before i -> ch (RO chi = [ki])
    ("vták", "ftaac"),              # v -> f before voiceless
]
def main():
    fails = []
    for sk, want in CASES:
        got = respell_ro(sk)
        if got != want: fails.append(f"respell_ro({sk!r}) = {got!r}, want {want!r}")
    for sk, frag in [("nie", "ɲɪ̯e"), ("kde", "ɟ"), ("hovoriť", "ɦ"), ("chcieť", "xt͡sɪ̯ec"), ("žena", "ʒena")]:
        got = ipa(sk) or ""
        if frag not in got: fails.append(f"ipa({sk!r}) = {got!r}, expected to contain {frag!r}")
    if ipa("a") is not None: fails.append("ipa('a') should be None (espeak reads letter names)")
    if fails:
        print(f"FAIL {len(fails)}"); [print("  ", f) for f in fails]; raise SystemExit(1)
    print(f"pronounce: all {len(CASES) + 6} checks pass")
if __name__ == "__main__": main()
