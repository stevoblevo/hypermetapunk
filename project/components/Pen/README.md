# Pen

A theme's inks and its horizon for canvas: `Hypermetapunk.pen(theme)` resolves the theme's colours to RGB and draws the dusk band, the banded sun, the grid floor, chrome lettering and misregistered type, so a game drawn on canvas looks like the page around it.

**Provide** `components/pen.js` after `bundle.js`, or alone: a single-file game needs nothing else, and the pen reads no CSS. Then `var P = Hypermetapunk.pen('dusk')` (a theme id, an element whose theme to use, or nothing for the page's theme) → `{ look, name, light, inks, rgb(name, a), band(k), sky(ctx, o), sun(ctx, o), floor(ctx, o), horizon(ctx, o), material(ctx, kind), grain(ctx, o), chrome(ctx, text, x, y, o), misreg(ctx, text, x, y, o), sticker(ctx, src, x, y, o) }`.

- `P.inks` holds every colour token as `[r, g, b]` (`[r, g, b, a]` for the few with alpha). Ask for a colour by its token name, never by a hex value: `P.rgb('wave-cyan', 0.5)`. The same code then prints in every theme.
- `P.sky(ctx, { x, y, w, h, steps, span, ease, lines })` prints the dusk gradient stepped down in hard toner bands, with the printer's lines across it. The box's bottom edge is the horizon. `ease` above 1 holds the dark longer and keeps the hot bands close to the horizon, for a sky with words over it (1 is the even gradient). High contrast prints the void.
- `P.sun(ctx, { x, y, r, tape, glow })` draws the banded disc with its base on `(x, y)`. Dusk prints the gradient with a glow, Zine prints it flat magenta, High contrast in ink. One sun a scene; no words on it.
- `P.floor(ctx, { x, y, w, h, vx, t, rows, gap })` draws the grid floor below the horizon (the box's top edge). `t` in seconds drifts the rows toward the viewer; it holds still under reduced motion, under "hold still", and when the pen was made with `{ still: true }`.
- `P.horizon(ctx, { x, y, w, h, at, sunR, sunX, t })` does sky, sun and floor in one call and returns the horizon's y.
- `P.material(ctx, kind)` gives a pattern: `scan` (the printer's lines), `halftone` (a dot screen) or `xerox` (photocopy speckle). `P.grain(ctx, { x, y, w, h })` lays the theme's grain over a box (none in High contrast).
- `P.chrome(ctx, text, x, y, { size, font, align })` letters in mirror chrome over a slipped magenta plate. `P.misreg(ctx, text, x, y, { size, font, dx, ink })` slips a cyan and a magenta plate either side of the ink.
- `P.sticker(ctx, src, x, y, { w, h, keyline, edge, slap, slip, angle, alpha })` (0.4.0) die-cuts any drawing as a sticker: `src` (a canvas or an image) is drawn centred on `(x, y)` at `w` × `h` (its own size by default), with a keyline round its silhouette (`keyline` px, 3.5% of the smaller side by default, at least 2), a hairline `edge` outside it so it holds on a light ground, a hard offset slap shadow (`slap` px, 6% by default, in the theme's `slap` ink) and, if you ask, a cyan and a magenta plate slipped `slip` px either way under the keyline. `angle` turns it (radians), `alpha` fades it. The keyline is the theme's sticker stock: near-white `ink` in Dusk, `punk-paper` with a `punk-ink` edge in Zine, and in High contrast a solid white keyline that never slips. `ink`, `edgeInk` and `slapInk` take other token names. It stamps the silhouette in a ring of sixteen offsets on offscreen canvases reused by size, so a host can slap an animated drawing every frame without allocating (it was made for AND SO's pet, about 90 × 110 px); it returns the sticker's size with its keyline.
- `Hypermetapunk.looks` lists the three themes as data (`id`, `name`, `light`, `motion`, `print`), the family's shape for a look picker.

Its numbers are `tokens.json` resolved to RGB; `tools/pen-inks.py` fails when they drift.

The crossing pets (`components/pets.js`, the [Pets](../Pets/README.md) page) draw with the same inks.

**Accessibility**: a canvas is a picture; give it `role="img"` and an `aria-label` that says what is drawn, and keep anything a player must read or press out of the canvas. Lettering drawn with `chrome` or `misreg` is art: repeat it in real text where it carries meaning. The floor is the only thing that moves, and it holds still when asked.
