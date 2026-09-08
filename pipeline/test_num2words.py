"""Checks for num2words_sk. Run: .venv/bin/python -m pipeline.test_num2words"""
from .num2words_sk import (expand_numbers, money, number_to_words, plural,
                           time_to_words, unexpandable)

CARDINAL = [
    (0, "m", "nula"), (1, "m", "jeden"), (1, "f", "jedna"), (1, "n", "jedno"),
    (2, "m", "dva"), (2, "f", "dve"), (2, "n", "dve"), (5, "m", "päť"),
    (11, "m", "jedenásť"), (15, "m", "pätnásť"), (19, "m", "devätnásť"),
    (20, "m", "dvadsať"), (21, "m", "dvadsaťjeden"), (25, "m", "dvadsaťpäť"),
    (42, "m", "štyridsaťdva"), (90, "m", "deväťdesiat"), (100, "m", "sto"),
    (101, "m", "stojeden"), (132, "m", "stotridsaťdva"), (200, "m", "dvesto"),
    (999, "m", "deväťstodeväťdesiatdeväť"), (1000, "m", "tisíc"),
    (1001, "m", "tisíc jeden"), (2000, "m", "dvetisíc"),
    (2026, "m", "dvetisíc dvadsaťšesť"), (10000, "m", "desaťtisíc"),
]
AGREEMENT = [
    (1, "euro"), (2, "eurá"), (3, "eurá"), (4, "eurá"), (5, "eur"), (11, "eur"), (0, "eur"),
]
MONEY = [
    ((2, 50), "dve eurá päťdesiat"),
    ((1, 0),  "jedno euro"),
    ((5, 20), "päť eur dvadsať"),
    ((21, 99), "dvadsaťjeden eur deväťdesiatdeväť"),
    ((22, 0), "dvadsaťdva eur"),
]
TEXT = [
    ("Stojí to 2,50 €.",     "Stojí to dve eurá päťdesiat."),
    ("Stojí to 2,50 eura.",  "Stojí to dve eurá päťdesiat."),
    ("Mám 25 rokov.",        "Mám dvadsaťpäť rokov."),
    ("Je 15:30.",            "Je pätnásť tridsať."),
    ("Kúpil som 3 kg jabĺk.", "Kúpil som tri kilogramy jabĺk."),
    ("Zľava 20 %.",          "Zľava dvadsať percent."),
    ("Bývam na 5. poschodí.", "Bývam na 5. poschodí."),  # ordinal: left alone on purpose
    ("Máme 1 euro a 2 eurá.", "Máme jedno euro a dve eurá."),
    ("Nie sú tu žiadne čísla.", "Nie sú tu žiadne čísla."),
    # a sentence-final period is punctuation, not an ordinal marker
    ("Škola bola založená v roku 1650.", "Škola bola založená v roku tisíc šesťstopäťdesiat."),
    ("Čo tak 20. októbra?", "Čo tak 20. októbra?"),
    ("Tieto hodinky stoja 10 000 frankov.", "Tieto hodinky stoja desaťtisíc frankov."),
    ("Je to 20-krát väčšie.", "Je to dvadsaťkrát väčšie."),
    ("Tom sa naučil 2000 slov.", "Tom sa naučil dvetisíc slov."),
]

def main() -> None:
    fails = []
    for n, g, want in CARDINAL:
        got = number_to_words(n, g)
        if got != want:
            fails.append(f"number_to_words({n},{g!r}) = {got!r}, want {want!r}")
    for n, want in AGREEMENT:
        got = plural(n, "euro", "eurá", "eur")
        if got != want:
            fails.append(f"plural({n}) = {got!r}, want {want!r}")
    for (w, c), want in MONEY:
        got = money(w, c)
        if got != want:
            fails.append(f"money({w},{c}) = {got!r}, want {want!r}")
    for src, want in TEXT:
        got = expand_numbers(src)
        if got != want:
            fails.append(f"expand_numbers({src!r})\n      = {got!r}\n   want {want!r}")
    for src, want in [("Bývam na 5. poschodí.", ["5."]), ("Mám 25 rokov.", []),
                      ("Stojí to 2,50 €.", []),
                      ("Škola bola založená v roku 1650.", []),
                      ("Tieto hodinky stoja 10 000 frankov.", [])]:
        got = unexpandable(src)
        if got != want:
            fails.append(f"unexpandable({src!r}) = {got!r}, want {want!r}")
    total = len(CARDINAL) + len(AGREEMENT) + len(MONEY) + len(TEXT) + 5
    if fails:
        print(f"FAIL {len(fails)}/{total}")
        for f in fails:
            print("   ", f)
        raise SystemExit(1)
    print(f"num2words_sk: all {total} checks pass")

if __name__ == "__main__":
    main()
