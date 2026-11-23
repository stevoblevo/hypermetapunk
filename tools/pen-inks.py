#!/usr/bin/env python3
"""Fail when the pen's ink table in bundle.js no longer matches project/tokens.json."""
import json, re
from pathlib import Path
r = Path(__file__).resolve().parents[1]
tokens = json.loads((r/'project/tokens.json').read_text())['color']['tokens']
js = (r/'project/components/bundle.js').read_text()
block = re.search(r"var INKS = \{\n(.*?)\n  \};", js, re.S).group(1)
bad = 0
for theme in ('dusk', 'zine', 'contrast'):
    row = re.search(rf"^\s*{theme}: \{{ (.*) \}},?$", block, re.M).group(1)
    inks = {m.group(1): [float(x) for x in m.group(2).split(', ')] for m in re.finditer(r"'([a-z0-9-]+)': \[([^\]]+)\]", row)}
    for tok in tokens:
        v = tok['value'][theme] if isinstance(tok['value'], dict) else tok['value']
        m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
        want = [int(m.group(1)[i:i+2], 16) for i in (0, 2, 4)] if m else [float(x) for x in re.fullmatch(r'rgba\(([^)]+)\)', v).group(1).split(', ')]
        if inks.get(tok['name']) != [float(x) for x in want]:
            bad += 1; print(f"{theme} {tok['name']}: tokens.json {want}, pen {inks.get(tok['name'])}")
    for name in inks:
        if not any(t['name'] == name for t in tokens): bad += 1; print(f'{theme} {name}: in the pen, not in tokens.json')
if bad: raise SystemExit(f'{bad} ink(s) drifted')
print(f'Pen inks match tokens.json: {len(tokens)} tokens in 3 themes')
