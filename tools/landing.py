#!/usr/bin/env python3
"""Freeze the front page with its release (Bleve, 25 Nov 2026: "we can version landing pages too").

A release is more than its runtime: the front page that showed it off is part of it. This writes
v/<version>/index.html, the front page as it shipped, running on that version's own runtime, with the
styles and scripts it loads frozen beside it under v/<version>/site/. So every version keeps an address:
  /v/<version>/            the front page of that release
  /v/<version>/bundle.js   its runtime (written by tools/release.py)
The docs, the manifest, icons and brand assets a frozen page links to are the current ones, two folders up.

tools/release.py calls this for the current version. To back-fill a release from history:
  python3 -I tools/landing.py --rev <git revision> --version <x.y.z>
Like the runtime, a frozen page is never rewritten: a different front page needs a new version.
"""
import posixpath, re, subprocess, sys
from pathlib import Path

ATTR = re.compile(r'\b(href|src)="([^"]*)"')
FROZEN = ('.css', '.js', '.html')   # what a page loads from site/ and takes with it


def reader(root, rev=None):
    if not rev:
        return lambda path: (root / path).read_bytes()
    def read(path):
        got = subprocess.run(['git', '-C', str(root), 'show', f'{rev}:{path}'], capture_output=True)
        if got.returncode:
            raise FileNotFoundError(f'{rev}:{path}')
        return got.stdout
    return read


def rewrite(html, here, runtime, want):
    """Point one page at its frozen neighbours. `here` is the page's folder in the repo ('' or 'site/')."""
    up = '../' * here.count('/')    # from the frozen page to v/<version>/
    top = up + '../../'             # from the frozen page to the repo root
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if not url or url.startswith(('#', '/', 'data:', 'mailto:', 'tel:')) or re.match(r'[a-z][a-z0-9+.-]*:', url):
            return m.group(0)
        path, tail = re.match(r'([^?#]*)(.*)', url, re.S).groups()
        full = posixpath.normpath(here + path)
        if full.startswith('..'):
            return m.group(0)
        if path.endswith('/'):
            full += '/'
        name = full[len('project/components/'):] if full.startswith('project/components/') else None
        if full == 'project/tokens.css':
            new = up + 'tokens.css'
        elif name in runtime:
            new = up + name
        elif full.startswith('site/') and full.endswith(FROZEN):
            want(full)
            new = up + full
        else:
            new = top + full
        return f'{attr}="{new}{tail}"'
    return ATTR.sub(fix, html)


def snapshot(root, version, rev=None, page='index.html'):
    """Write v/<version>/index.html and the site files it loads. Returns the paths written or checked."""
    read, dest = reader(root, rev), root / 'v' / version
    if not dest.is_dir():
        raise SystemExit(f'v/{version}/ has no runtime yet: run tools/release.py first')
    runtime = {p.name for p in dest.iterdir() if p.is_file()}
    queue, seen, out = [page], set(), {}
    while queue:
        path = queue.pop(0)
        if path in seen:
            continue
        seen.add(path)
        try:
            data = read(path)
        except FileNotFoundError:
            continue   # the page named a file that was not there at that revision: leave the link as it is
        if path.endswith('.html'):
            text = rewrite(data.decode(), posixpath.dirname(path) + '/' if '/' in path else '', runtime, queue.append)
            if path == page:
                note = f'<!-- The front page of release {version}, frozen by tools/landing.py. The current one is at ../../ -->\n'
                text = re.sub(r'(<!doctype html>\s*)', lambda m: m.group(1) + note, text, count=1, flags=re.I)
                if 'rel="canonical"' not in text:
                    text = re.sub(r'(<meta charset="?utf-8"?\s*/?>)', r'\1\n<link rel="canonical" href="../../">', text, count=1, flags=re.I)
            data = text.encode()
        out[path] = data
    for path, data in out.items():
        target = dest / path
        if target.exists() and target.read_bytes() != data:
            raise SystemExit(f'Refusing to replace v/{version}/{path}: the front page of a release is frozen. '
                             f'A change to index.html or to the site/ files it loads needs a new version.')
    for path, data in out.items():
        target = dest / path
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    return sorted(out)


if __name__ == '__main__':
    args, root = sys.argv[1:], Path(__file__).resolve().parents[1]
    def opt(name):
        return args[args.index(name) + 1] if name in args else None
    version, rev = opt('--version'), opt('--rev')
    if not version:
        raise SystemExit(__doc__)
    done = snapshot(root, version, rev)
    print(f'Front page of {version} frozen from {rev or "the working tree"}: {len(done)} files under v/{version}/. Now run tools/release.py to refresh v/index.json.')
