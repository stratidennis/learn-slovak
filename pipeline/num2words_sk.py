"""Slovak number-to-words, for spelling numbers out before TTS.

Q3 measured why this is load-bearing rather than a nicety (docs/SPIKE-RESULTS.md):
Piper renders `2,50 €` as *"dva čiarka päťdesiat euro"* — it reads the decimal
comma aloud, picks the masculine `dva` where Slovak needs the feminine `dve`,
and leaves `euro` unagreed. Plain cardinals are fine (`25` -> *dvadsaťpäť*);
currency, decimals and prices are not.

Slovak counting rules this implements:
  * 1 and 2 agree in gender: jeden/jedna/jedno, dva/dve.
  * After 1 -> nominative singular; after 2-4 -> nominative plural;
    after 5+ (and 0) -> genitive plural.  `jedno euro, dve eurá, päť eur`.
  * Compounds are written solid: dvadsaťpäť, stotridsaťdva.
"""
from __future__ import annotations

import re

ONES = {
    0: "nula", 1: "jeden", 2: "dva", 3: "tri", 4: "štyri", 5: "päť",
    6: "šesť", 7: "sedem", 8: "osem", 9: "deväť", 10: "desať",
    11: "jedenásť", 12: "dvanásť", 13: "trinásť", 14: "štrnásť", 15: "pätnásť",
    16: "šestnásť", 17: "sedemnásť", 18: "osemnásť", 19: "devätnásť",
}
ONES_F = {1: "jedna", 2: "dve"}
ONES_N = {1: "jedno", 2: "dve"}
TENS = {2: "dvadsať", 3: "tridsať", 4: "štyridsať", 5: "päťdesiat",
        6: "šesťdesiat", 7: "sedemdesiat", 8: "osemdesiat", 9: "deväťdesiat"}
HUNDREDS = {1: "sto", 2: "dvesto", 3: "tristo", 4: "štyristo", 5: "päťsto",
            6: "šesťsto", 7: "sedemsto", 8: "osemsto", 9: "deväťsto"}


def _small(n: int, gender: str) -> str:
    """0-999 as one solid word."""
    out = ""
    if n >= 100:
        out += HUNDREDS[n // 100]
        n %= 100
    if n >= 20:
        out += TENS[n // 10]
        n %= 10
        if n == 0:
            return out
    if n == 0:
        return out or ONES[0]
    if n < 20:
        # Only a BARE 1/2 takes gender: `dve eurá`, `dvetisíc`. In a compound the
        # numeral is invariant -- `dvadsaťdva eur`, `dvadsaťdvatisíc`, never
        # `dvadsaťdve`. Getting this wrong produced `dvatisíc` and `dvadsaťjedno`.
        if n in (1, 2) and not out:
            word = {"m": ONES, "f": ONES_F, "n": ONES_N}[gender].get(n, ONES[n])
        else:
            word = ONES[n]
        return out + word
    return out


def number_to_words(n: int, gender: str = "m") -> str:
    """Non-negative integer -> Slovak words. gender applies to the final 1/2."""
    if n < 0:
        return "mínus " + number_to_words(-n, gender)
    if n < 1000:
        return _small(n, gender)
    if n < 1_000_000:
        th, rest = divmod(n, 1000)
        # 2000 = dvetisíc (bare 2 -> dve), but 22000 = dvadsaťdvatisíc
        head = "tisíc" if th == 1 else _small(th, "f") + "tisíc"
        return head if rest == 0 else f"{head} {_small(rest, gender)}"
    mil, rest = divmod(n, 1_000_000)
    head = "milión" if mil == 1 else f"{_small(mil, 'm')} {plural(mil, 'milión', 'milióny', 'miliónov')}"
    return head if rest == 0 else f"{head} {number_to_words(rest, gender)}"


def plural(n: int, one: str, few: str, many: str) -> str:
    """Slovak count agreement: 1 -> nom sg, 2-4 -> nom pl, 0 and 5+ -> gen pl."""
    if n == 1:
        return one
    if 2 <= n <= 4:
        return few
    return many


UNITS = {
    # symbol/word -> (gender of the numeral, sg, 2-4, 5+)
    "€":  ("n", "euro", "eurá", "eur"),
    "eur": ("n", "euro", "eurá", "eur"),
    "euro": ("n", "euro", "eurá", "eur"),
    "cent": ("m", "cent", "centy", "centov"),
    "kg": ("m", "kilogram", "kilogramy", "kilogramov"),
    "km": ("m", "kilometer", "kilometre", "kilometrov"),
    "l":  ("m", "liter", "litre", "litrov"),
    "h":  ("f", "hodina", "hodiny", "hodín"),
    "%":  ("n", "percento", "percentá", "percent"),
}


def money(whole: int, cents: int, unit: str = "€") -> str:
    """`2,50 €` -> 'dve eurá päťdesiat'. Prices are said this short way in shops."""
    g, one, few, many = UNITS.get(unit, UNITS["€"])
    out = f"{number_to_words(whole, g)} {plural(whole, one, few, many)}"
    if cents:
        out += f" {number_to_words(cents, 'm')}"
    return out


def time_to_words(h: int, m: int) -> str:
    """24h clock, read the transparent way: 'pätnásť tridsať'."""
    if m == 0:
        return f"{number_to_words(h, 'f')} hodín" if h not in (1, 2) else \
               f"{number_to_words(h, 'f')} {plural(h, 'hodina', 'hodiny', 'hodín')}"
    return f"{number_to_words(h, 'f')} {number_to_words(m, 'f')}"


# ------------------------------------------------------------------ text pass
_MONEY = re.compile(r"(?<![\w,.])(\d{1,3}(?:[  ]\d{3})*|\d+)[,.](\d{2})\s*(€|eur[aáo]?)")
_MONEY_INT = re.compile(r"(?<![\w,.])(\d+)\s*(€|eur[aáo]?)")
_TIME = re.compile(r"(?<![\w:])([01]?\d|2[0-3]):([0-5]\d)(?![\d:])")
_DECIMAL = re.compile(r"(?<![\w,.])(\d+)[,](\d+)(?![\d])")
_UNIT = re.compile(r"(?<![\w])(\d+)\s*(kg|km|%)(?![\w])")
# A digit followed by "." is an ordinal (5. poschodie); expanding it as a
# cardinal gives `päť. poschodie`, which is wrong. Left alone on purpose --
# use `unexpandable()` to find and hand-fix these.
#
# But the "." must be an ordinal marker, not the end of the sentence: in
# `Škola bola založená v roku 1650.` the period is punctuation and the number
# is an ordinary cardinal. Require a following lowercase word, which is what an
# ordinal modifies (`20. októbra`, `5. poschodie`).
_ORDINAL = re.compile(r"(?<![\w])(\d+)\.(?=\s*[a-záäčďéíĺľňóôŕšťúýž])")
# Thousands written with a space or NBSP: `10 000`, `1 000 000`.
_GROUPED = re.compile(r"(?<![\w])(\d{1,3}(?:[  ]\d{3})+)(?![\d])")
# `20-krát` -> `dvadsaťkrát` (written solid in Slovak).
_TIMES = re.compile(r"(?<![\w])(\d+)-(krát|krat)(?![\w])")
_INT = re.compile(r"(?<![\w.,:])(\d+)(?![\w.,:]*\d)")


def expand_numbers(text: str, gender: str = "m") -> str:
    """Rewrite every numeric expression as words, ready for TTS."""
    def _money(m):
        whole = int(re.sub(r"[  ]", "", m.group(1)))
        return money(whole, int(m.group(2)), "€")

    def _money_int(m):
        return money(int(m.group(1)), 0, "€")

    def _time(m):
        return time_to_words(int(m.group(1)), int(m.group(2)))

    def _decimal(m):
        whole, frac = m.group(1), m.group(2)
        return (f"{number_to_words(int(whole), 'f')} celá "
                f"{number_to_words(int(frac), 'f')}")

    def _unit(m):
        n, u = int(m.group(1)), m.group(2)
        g, one, few, many = UNITS[u]
        return f"{number_to_words(n, g)} {plural(n, one, few, many)}"

    text = _MONEY.sub(_money, text)
    text = _MONEY_INT.sub(_money_int, text)
    text = _TIME.sub(_time, text)
    text = _UNIT.sub(_unit, text)
    text = _DECIMAL.sub(_decimal, text)
    text = _TIMES.sub(lambda m: number_to_words(int(m.group(1)), "m") + "krát", text)
    text = _GROUPED.sub(
        lambda m: number_to_words(int(re.sub(r"[  ]", "", m.group(1))), gender), text)
    # Mask ordinals so the plain-integer pass cannot turn `5.` into `päť.`;
    # a lookahead is not enough because the digit itself still matches.
    ordinals: list[str] = []

    def _mask(m):
        ordinals.append(m.group(0))
        # Private-use codepoint: the placeholder must contain no digits of its
        # own, or the integer pass rewrites the placeholder itself.
        return chr(0xE000 + len(ordinals) - 1)

    text = _ORDINAL.sub(_mask, text)
    text = _INT.sub(lambda m: number_to_words(int(m.group(1)), gender), text)
    for i, o in enumerate(ordinals):
        text = text.replace(chr(0xE000 + i), o)
    return text


def has_digits(text: str) -> bool:
    return any(c.isdigit() for c in text)


def unexpandable(text: str) -> list[str]:
    """Numeric expressions expand_numbers() deliberately will not touch.

    Right now that is ordinals: Slovak ordinals inflect for case, so `5.` in
    `na 5. poschodí` must become `piatom`, which needs the syntactic context.
    Emitting `päť.` would teach the learner wrong Slovak, so these sentences are
    reported and either hand-written or skipped.
    """
    issues = [m.group(0) for m in _ORDINAL.finditer(text)]
    leftover = expand_numbers(text)
    if has_digits(leftover):
        issues += [t for t in re.findall(r"\S*\d\S*", leftover) if t not in issues]
    return sorted(set(issues))
