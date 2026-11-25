<img src="site/icons/icon-192.png" alt="Hypermetapunk mark" width="84">


**Patch 0.5.1:** The pet canvases repaint when they return onscreen with reduced motion on, and a retiring discovery card no longer dismisses the next one. Pending discoveries are saved alongside other kits’ progress on the next successful find. [Open the 0.5.1 showcase](https://stevoblevo.github.io/hypermetapunk/v/0.5.1/).

# Hypermetapunk

A dusk design system with chrome type, a neon horizon and the marks of a print shop: slipped plates, photocopy grain, tape and stickers. Tape can cross the artwork, never the words.

It is the third system in Bleve's toolkit family, the child of Storeybrook (day) and Depthfield (night): three themes, seventeen components, a behaviour bundle exposed as `window.Hypermetapunk`, and three add-ons for canvas: the pen, the plate and the crossing pets.

**Dusk · Zine · High contrast**

[Open the showcase](https://stevoblevo.github.io/hypermetapunk/) · [Read the interactive docs](https://stevoblevo.github.io/hypermetapunk/docs.html) · [Compare the Saelion toolkits](https://saelion.co/toolkits)

## Try it

Open the [live front page](https://stevoblevo.github.io/hypermetapunk/) and swap from **Dusk** to **Zine** to see the same parts turn into a print layout. Then try **High contrast** or choose an accent under **Three themes, one page**.

## Use it in a page

From the repository root, save this as `scratch.html` and run `python3 -m http.server 8703`. Open `http://localhost:8703/scratch.html`. No package install is needed for this example. The kit stylesheets can load web fonts; your browser uses fallback fonts when unavailable.

```html
<!doctype html>
<html lang="en" data-theme="zine">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hypermetapunk example</title>
  <link rel="stylesheet" href="v/0.5.0/tokens.css">
  <link rel="stylesheet" href="v/0.5.0/bundle.css">
  <script src="v/0.5.0/bundle.js"></script>
</head>
<body class="hmp-body">
  <h1>The print room</h1>
  <span class="hmp-sticker">Doors open</span>
  <script>Hypermetapunk.accent.set('#e8ff00', { keep: false });</script>
</body>
</html>
```

Use the three files from the same [0.5.0 runtime](v/0.5.0/). The [version manifest](v/index.json) records their SHA-256 hashes. The [Accent](project/components/Accent/README.md) API adjusts chosen colors for legibility; `keep: false` makes the selection temporary. See also [Sticker](project/components/Sticker/README.md).

## Draw with it on canvas

Three add-ons work after `bundle.js` or without it, and read no CSS, so a single-file game can use them.

- **The pen** (`v/0.5.0/pen.js`): `Hypermetapunk.looks` lists the three themes as data, each with the mood it rewards in play, and `Hypermetapunk.pen(theme)` draws the horizon from the theme's own inks: sky, sun, grid floor, chrome and misregistered lettering, halftone, scanlines and grain. `pen.sticker(ctx, source, x, y)` die-cuts any drawing as a sticker. See [Pen](project/components/Pen/README.md).
- **The plate** (`v/0.5.0/plate.js`, after `pen.js`): `Hypermetapunk.plate(theme, source)` takes one canvas of flat fills and prints it in the theme's material: a neon halftone, a xerox with one red, or a solid cut, each with the sound word as its one accent. Storeybrook and Depthfield make plates from the same source canvas. See [Plate](project/components/Plate/README.md).
- **The dusk pets** (`v/0.5.0/pets.js`): `Hypermetapunk.pets` holds the five pets found on the front page, their place in the family's shared save, and `draw(ctx, id, o)`, which makes each one dance to a beat. See [Pets](project/components/Pets/README.md).

## Project notes

[Brand book](project/README.md) · [Changelog](CHANGELOG.md) · [Creative direction](docs/creative-direction.md) · [Component types](project/components/index.d.ts)

This repository is the design source. The [standalone materials candidate](packages/materials/README.md) is experimental and separate from the released UI runtime. For ongoing work, see the [continuity handoff](docs/claude-handoff.md) and [material experiment](experiments/materials/README.md). For site development and checks, see [AGENTS.md](AGENTS.md).

### The toolkit family

[Storeybrook](https://github.com/stevoblevo/storeybrook) · [Depthfield](https://github.com/stevoblevo/depthfield) · [Shared toolkit contracts](https://github.com/stevoblevo/depthfield/blob/main/docs/family.md)

### License

The source is publicly viewable. No repository-wide license is published here; public visibility does not grant general permission to reuse or redistribute the code or artwork. Check individual notices for third-party materials, and ask the owner before reusing toolkit assets or code outside the repository.

<details>
<summary>Repository reference and maintenance notes</summary>

## Layout

```
project/
  README.md, 01-wave.md … 08-code.md   Brand book
  design-system.json                   Index: title, namespace, asset groups
  tokens.json                          All tokens, three themes, as lists
  tokens.css                           Compiled by site/build.py
  components/
    bundle.css, bundle.js, index.d.ts  Styles, window.Hypermetapunk, types
    pen.js, plate.js, pets.js          Add-ons: the pen for canvas, the plate, the crossing pets
    <Component>/README.md              Guidelines (first sentence = summary)
    <Component>/preview.html           Live preview card
  assets/Mark/                         The mark
index.html, site/front.css, front.js  The front page, built only from the kit (and where the dusk pets are found)
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

## Versions

Current release: **0.5.0**. Pin `v/0.5.0/tokens.css`, `v/0.5.0/bundle.css` and `v/0.5.0/bundle.js` together; a game that only draws on canvas can pin `v/0.5.0/pen.js`, `v/0.5.0/plate.js` and `v/0.5.0/pets.js` alone. Every earlier runtime stays where it was, byte for byte, from `v/0.1.0/` on. Each version also keeps its own front page: open [`v/0.5.0/`](v/0.5.0/) for the page as it shipped, running on that version's runtime, and `v/0.2.0/`, `v/0.3.0/` or `v/0.4.0/` for the ones before it. `v/index.json` records each file's SHA-256. Run `python3 -I tools/release.py` after the build; it refuses to change an existing version, its front page included. A GitHub Pages deployment is not a browser-test pass.

</details>
