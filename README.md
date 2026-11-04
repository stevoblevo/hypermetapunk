# Hypermetapunk

The third design system in Bleve's family, the child of [Storeybrook](https://github.com/stevoblevo/storeybrook) (day) and [Depthfield](https://github.com/stevoblevo/depthfield) (night): hyperreal dusk, chrome and neon, slapped with stickers, stamps, tape and marker. Three themes (Dusk, Zine, High contrast), thirteen components and a behaviour bundle exposed as `window.Hypermetapunk`.

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
