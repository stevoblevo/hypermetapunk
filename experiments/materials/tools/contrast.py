#!/usr/bin/env python3
"""Measure every text pair in every theme of project/tokens.json against WCAG 2 (family task H2).

    python3 -I tools/contrast.py            # prints the table; exits 1 if a pair is under its floor
    python3 -I tools/contrast.py --md       # the same table as Markdown, for project/03-color.md
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TEXT = ["ink", "ink-muted", "accent", "link", "cue"]
GROUNDS = ["void", "surface", "surface-raised"]
FILLS = [("on-accent", "accent"), ("on-cue", "cue"), ("punk-ink", "punk-acid"), ("punk-ink", "punk-orange"), ("punk-ink", "punk-magenta"), ("punk-ink", "wave-mint"), ("punk-ink", "wave-cyan"), ("punk-ink", "punk-paper")]
FLOOR = 4.5


def rgb(v):
    v = v.strip()
    if v.startswith("#"):
        h = v[1:]
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    return None  # translucent tokens are tints, not text colours


def lum(c):
    f = lambda x: x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    r, g, b = (x / 255 for x in c)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    t = json.load(open(os.path.join(ROOT, "project", "tokens.json")))
    themes = [x["id"] for x in t["color"]["themes"]]
    val = {x["name"]: x["value"] for x in t["color"]["tokens"]}
    css = open(os.path.join(ROOT, "project", "components", "bundle.css")).read()
    def scoped(selector):
        block = re.search(r"^" + re.escape(selector) + r"\s*\{([^}]+)\}", css, re.M)
        if not block:
            raise ValueError("Missing paper-card scope: " + selector)
        return dict(re.findall(r"--([a-z-]+):\s*(#[a-fA-F0-9]+)", block.group(1)))
    paper = scoped('.hmp-card:not(.hmp-card--glass)')
    high = scoped('[data-theme="contrast"] .hmp-card:not(.hmp-card--glass)')
    rows, bad = [], []
    for th in themes:
        get = lambda n: rgb(val[n][th] if isinstance(val[n], dict) else val[n])
        pairs = [(fg, bg) for bg in GROUNDS for fg in TEXT] + FILLS
        for fg, bg in pairs:
            a, b = get(fg), get(bg)
            if a is None or b is None:
                continue
            r = ratio(a, b)
            rows.append((th, fg, bg, r))
            if r < FLOOR:
                bad.append((th, fg, bg, r))
        # Read actual scoped CSS pairs: root accent choices must not leak on-colours
        # into a card that fixes its own accent/cue fills.
        card = {**paper, **high} if th == "contrast" else paper
        ground = get("void" if th == "contrast" else "punk-paper")
        card_pairs = [(ink, "card ground", rgb(card[ink]), ground) for ink in ("accent", "cue", "link", "scrawl")]
        card_pairs += [(ink, fill + " (card)", rgb(card[ink]), rgb(card[fill])) for ink, fill in (("on-accent", "accent"), ("on-cue", "cue"))]
        for ink, bg, a, b in card_pairs:
            r = ratio(a, b)
            rows.append((th, ink + " (card)", bg, r))
            if r < FLOOR:
                bad.append((th, ink, bg, r))
    if "--md" in sys.argv:
        print("| Theme | Text | On | Ratio |\n| --- | --- | --- | --- |")
        for th, fg, bg, r in rows:
            print(f"| {th} | `{fg}` | `{bg}` | {r:.1f}:1 |")
    else:
        for th, fg, bg, r in rows:
            print(f"{th:9} {fg:10} on {bg:15} {r:5.1f}{'  FAIL' if r < FLOOR else ''}")
        print(f"{len(rows)} pairs, {len(bad)} under {FLOOR}:1")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
