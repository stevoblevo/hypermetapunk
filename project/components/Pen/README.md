# Pen

A theme's inks and its horizon for canvas: `Hypermetapunk.pen(theme)` resolves the theme's colours to RGB and draws the dusk band, the banded sun, the grid floor, chrome lettering and misregistered type, so a game drawn on canvas looks like the page around it.

**Provide** nothing extra: the pen is part of `bundle.js` from 0.3.0. `var P = Hypermetapunk.pen('dusk')` (a theme id, an element whose theme to use, or nothing for the page's theme) → `{ look, name, light, inks, rgb(name, a), band(k), sky(ctx, o), sun(ctx, o), floor(ctx, o), horizon(ctx, o), material(ctx, kind), grain(ctx, o), chrome(ctx, text, x, y, o), misreg(ctx, text, x, y, o) }`.

- `P.inks` holds every colour token as `[r, g, b]` (`[r, g, b, a]` for the few with alpha). Ask for a colour by its token name, never by a hex value: `P.rgb('wave-cyan', 0.5)`. The same code then prints in every theme.
- `P.sky(ctx, { x, y, w, h, steps, span, lines })` prints the dusk gradient stepped down in hard toner bands, with the printer's lines across it. The box's bottom edge is the horizon. High contrast prints the void.
- `P.sun(ctx, { x, y, r, tape, glow })` draws the banded disc with its base on `(x, y)`. Dusk prints the gradient with a glow, Zine prints it flat magenta, High contrast in ink. One sun a scene; no words on it.
- `P.floor(ctx, { x, y, w, h, vx, t, rows, gap })` draws the grid floor below the horizon (the box's top edge). `t` in seconds drifts the rows toward the viewer; it holds still under reduced motion, under "hold still", and when the pen was made with `{ still: true }`.
- `P.horizon(ctx, { x, y, w, h, at, sunR, sunX, t })` does sky, sun and floor in one call and returns the horizon's y.
- `P.material(ctx, kind)` gives a pattern: `scan` (the printer's lines), `halftone` (a dot screen) or `xerox` (photocopy speckle). `P.grain(ctx, { x, y, w, h })` lays the theme's grain over a box (none in High contrast).
- `P.chrome(ctx, text, x, y, { size, font, align })` letters in mirror chrome over a slipped magenta plate. `P.misreg(ctx, text, x, y, { size, font, dx, ink })` slips a cyan and a magenta plate either side of the ink.
- `Hypermetapunk.looks` lists the three themes as data (`id`, `name`, `light`, `motion`, `print`), the family's shape for a look picker.

The pen does not depend on the page's CSS, so it works in a single-file game that only loads `bundle.js`. Its numbers are `tokens.json` resolved to RGB; `tools/pen-inks.py` fails when they drift.

**Accessibility**: a canvas is a picture; give it `role="img"` and an `aria-label` that says what is drawn, and keep anything a player must read or press out of the canvas. Lettering drawn with `chrome` or `misreg` is art: repeat it in real text where it carries meaning. The floor is the only thing that moves, and it holds still when asked.
