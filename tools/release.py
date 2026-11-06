#!/usr/bin/env python3
"""Write an immutable versioned runtime. Fail rather than overwrite different bytes."""
import hashlib, json, re
from pathlib import Path
r = Path(__file__).resolve().parents[1]
version = re.search(r"var VERSION = '([^']+)'", (r/'project/components/bundle.js').read_text()).group(1)
files = {'tokens.css': 'project/tokens.css', 'bundle.css': 'project/components/bundle.css', 'bundle.js': 'project/components/bundle.js', 'index.d.ts': 'project/components/index.d.ts'}
dest = r/'v'/version
for name, source in files.items():
    output = dest/name
    data = (r/source).read_bytes()
    if output.exists() and output.read_bytes() != data:
        raise SystemExit(f'Refusing to replace {output.relative_to(r)}')
dest.mkdir(parents=True, exist_ok=True)
for name, source in files.items():
    output = dest/name
    if not output.exists(): output.write_bytes((r/source).read_bytes())
versions = {}
for folder in sorted((r/'v').iterdir()):
    if folder.is_dir(): versions[folder.name] = {name: hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in files}
(r/'v/index.json').write_text(json.dumps({'latest': version, 'versions': versions}, indent=2)+'\n')
print(f'Checked immutable runtime {version}')
