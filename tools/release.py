#!/usr/bin/env python3
"""Write an immutable versioned runtime. Fail rather than overwrite different bytes."""
import hashlib, json, re
from pathlib import Path
r = Path(__file__).resolve().parents[1]
version = re.search(r"var VERSION = '([^']+)'", (r/'project/components/bundle.js').read_text()).group(1)
files = {'tokens.css': 'project/tokens.css', 'bundle.css': 'project/components/bundle.css', 'bundle.js': 'project/components/bundle.js', 'index.d.ts': 'project/components/index.d.ts', 'pen.js': 'project/components/pen.js', 'pets.js': 'project/components/pets.js', 'plate.js': 'project/components/plate.js'}
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
# the front page is part of the release: freeze it, with the site files it loads, beside the runtime (tools/landing.py)
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import landing
landing.snapshot(r, version)
versions = {}
for folder in sorted((r/'v').iterdir()):
    if not folder.is_dir(): continue
    # the runtime files first, in their usual order (a file added in a later version is simply absent from older folders),
    # then whatever else the version holds: its frozen front page and the site files that page loads
    names = [name for name in files if (folder/name).exists()]
    names += sorted(p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file() and p.relative_to(folder).as_posix() not in files)
    versions[folder.name] = {name: hashlib.sha256((folder/name).read_bytes()).hexdigest() for name in names}
(r/'v/index.json').write_text(json.dumps({'latest': version, 'versions': versions}, indent=2)+'\n')
print(f'Checked immutable runtime {version}')
