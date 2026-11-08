# Hypermetapunk

The third design system in Bleve's family, the child of [Storeybrook](https://github.com/stevoblevo/storeybrook) (day) and [Depthfield](https://github.com/stevoblevo/depthfield) (night): hyperreal dusk, chrome and neon, slapped with stickers, stamps, tape and marker. Three themes (Dusk, Zine, High contrast), fourteen components and a behaviour bundle exposed as `window.Hypermetapunk`.

Version 0.1 lifts "Hypermetapunk Kit v0", a block of CSS seeded on 1 November 2026 at the top of a bespoke.gig prototype (`storeybrook/show-tell/bespoke/bespoke-gig-hypermetapunk.html`), into the family's format. Unlike its parents it has no Claude artifact yet; this repo is the source until one is made (task C11).

**Live:** <https://stevoblevo.github.io/hypermetapunk/> (front page) and <https://stevoblevo.github.io/hypermetapunk/docs.html> (docs).

## Start here

Read [`project/README.md`](project/README.md), the brand book. What comes next, and why: [`docs/plan.md`](docs/plan.md) and [`docs/creative-direction.md`](docs/creative-direction.md). Any agent can pick a task; [`AGENTS.md`](AGENTS.md) has the rules. The family's shared contracts are in [`depthfield/docs/family.md`](https://github.com/stevoblevo/depthfield/blob/main/docs/family.md).

## Layout

```
project/
  README.md, 01-wave.md … 08-code.md   Brand book
  design-system.json                   Index: title, namespace, asset groups
  tokens.json                          All tokens, three themes, as lists
  tokens.css                           Compiled by site/build.py
  components/
    bundle.css, bundle.js, index.d.ts  Styles, window.Hypermetapunk, types
    <Component>/README.md              Guidelines (first sentence = summary)
    <Component>/preview.html           Live preview card
  assets/Mark/                         The mark
index.html, site/front.css             The front page, built only from the kit
docs.html, site/app.*                  The docs (shared shell with Storeybrook and Depthfield)
site/build.py                          Compiles tokens.css, hooks.css and site.json
site/immersive.js, manifest.webmanifest Full screen on phones (shared with the family)
tools/contrast.py                      Measures every text pair in every theme
tools/check.mjs                        Browser check: three themes, docs previews, phone width
docs/plan.md, creative-direction.md    What comes next, and why
```

## Build and check

```
python3 -I site/build.py          # after any change under project/
python3 -I tools/contrast.py      # fails if any text pair drops under 4.5:1
node tools/check.mjs              # front page and docs in three themes, desktop and phone (needs Playwright)
python3 -m http.server 8703       # then open / and /docs.html
```

## Versioned runtime

Current patch: **0.1.3**. Pin `v/0.1.3/tokens.css`, `v/0.1.3/bundle.css` and `v/0.1.3/bundle.js` together. The original 0.1.0 runtime remains in `v/0.1.0/`. `v/index.json` records each file’s SHA-256. Run `python3 -I tools/release.py` after the build; it refuses to change an existing version.

See [CHANGELOG.md](CHANGELOG.md). A GitHub Pages deployment is not a browser-test pass.

## Custom accents (0.1.2)

Use the controls under “Three themes, one page”, or call `Hypermetapunk.accent.set('#e8ff00')`. Choices are separate per theme; unreadable colours are adjusted and disclosed. `Hypermetapunk.accent.reset()` restores the original. See [Accent](project/components/Accent/README.md) for the API.

## Shared experimental work

See the [Claude continuity handoff](docs/claude-handoff.md) and [isolated material experiment](experiments/materials/README.md). The released 0.1.3 runtime is unchanged.

## Optional game material candidate

The [standalone material package](packages/materials/README.md) offers a pinned, draw-only eight-world Canvas background candidate with a host contract, declarations, integrity manifest and adoption fixture. It is experimental and separate from the released 0.1.3 UI; game-owner and browser/device acceptance are required before production adoption.
