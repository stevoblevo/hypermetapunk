<img src="site/icons/icon-192.png" alt="Hypermetapunk mark" width="84">

# Hypermetapunk

A dusk design system with chrome type, a neon horizon and the marks of a print shop: slipped plates, photocopy grain, tape and stickers. Tape can cross the artwork, never the words.

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
  <link rel="stylesheet" href="v/0.2.0/tokens.css">
  <link rel="stylesheet" href="v/0.2.0/bundle.css">
  <script src="v/0.2.0/bundle.js"></script>
</head>
<body class="hmp-body">
  <h1>The print room</h1>
  <span class="hmp-sticker">Doors open</span>
  <script>Hypermetapunk.accent.set('#e8ff00', { keep: false });</script>
</body>
</html>
```

Use the three files from the same [0.2.0 runtime](v/0.2.0/). The [version manifest](v/index.json) records their SHA-256 hashes. The [Accent](project/components/Accent/README.md) API adjusts chosen colors for legibility; `keep: false` makes the selection temporary. See also [Sticker](project/components/Sticker/README.md).

## Project notes

[Brand book](project/README.md) · [Changelog](CHANGELOG.md) · [Creative direction](docs/creative-direction.md) · [Component types](project/components/index.d.ts)

This repository is the design source. The [standalone materials candidate](packages/materials/README.md) is experimental and separate from the 0.2.0 UI runtime. For ongoing work, see the [continuity handoff](docs/claude-handoff.md) and [material experiment](experiments/materials/README.md). For site development and checks, see [AGENTS.md](AGENTS.md).

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

</details>
