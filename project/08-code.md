# Code

## Files

```
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="components/bundle.js"></script>
```
`<html data-theme="dusk">` picks the theme; `[data-theme]` works on any element, nested. `body.hmp-body` sets the ground, ink and face.

## window.Hypermetapunk

- `theme.get()`, `theme.set(id)`, `theme.list`: kept in the address (`?theme=zine`) and on this device. Buttons with `data-hmp-theme="zine"` switch it.
- `still.get()`, `still.set(on)`: the page's motion switch; buttons with `data-hmp-still`.
- `ticker(el)`, `slap(frame)`: run by `init()` for `.hmp-ticker` and `[data-hmp-slap]`.
- `taste({ root, log })` returns findings `{ rule, severity, count, sample, fix }`; `taste.badge()` shows them.
- `token(name, el)`, `reducedMotion()`, `looks` (the themes as data: `id`, `name`, `light`, `motion`, `print`).
- Events: `hmp:theme`, `hmp:still`, `hmp:taste`, `hmp:ready`.

`init()` runs by itself on load and is safe to call again.

## Budgets

`bundle.css` 24 KB, `bundle.js` 16 KB. No dependencies, no network except the fonts.

## The plate, an add-on

`components/plate.js` (0.5.0) is loaded after `pen.js` by pages and games that make plates; `bundle.js` is not needed. It adds `Hypermetapunk.plate(theme, source, opts)`, which takes one canvas of flat fills on transparency and returns a new canvas of the same size in the theme's material, and the family's two helpers, `Hypermetapunk.tint` and `Hypermetapunk.edges`. Its colours are the pen's inks, it reads no CSS, and it never changes the source. Its budget is 12 KB. Make a plate once and keep the canvas; do not make plates in an animation frame.

## The family

Hypermetapunk keeps the family contracts (shared token names, complete theme blocks, a runtime on `window`, reduced motion everywhere, versions never replaced). Its plan and open tasks (H4 onward: the showcase, bespoke.gig rebuilt on the kit, a pen for AND SO's `hmp` skin) are in `stevoblevo/depthfield`, `docs/family.md`.
