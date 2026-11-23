# Changelog

## 0.3.0

- The pen (plan C4, family F4), an add-on at `components/pen.js` that loads after `bundle.js` or alone: `Hypermetapunk.pen(theme)` resolves a theme's inks to RGB and draws the horizon on canvas: `sky` (the dusk gradient in hard toner bands), `sun` (the banded disc with its tape), `floor` (the grid, drifting unless motion is held), `horizon` (all three), `chrome` and `misreg` lettering, and the print materials `scan`, `halftone` and `xerox` with `grain`. It reads no CSS, so a single-file game can load `pen.js` by itself.
- `Hypermetapunk.looks` already listed the three themes as data; the pen completes this system's half of the family's "looks as data and a pen".
- New component page: Pen, drawn live in all three themes. New check: `tools/pen-inks.py` fails when the pen's inks drift from `tokens.json`.
- First host: AND SO 10's Dusk look (`stevoblevo.github.io/_src/and-so`).
- All published 0.1.x and 0.2.0 runtime files remain unchanged.

## 0.2.0

- The punk-damage pass: the wave is printed, not rendered. The horizon gradient steps down in hard toner bands; grain rises (0.24, and 0.28 on Zine); chrome type carries a permanent slipped magenta plate; the sun wears a strip of tape across its face; the grid floor has a torn hole (the void in Dusk, paper in Zine, none in High contrast).
- New slaps: `hmp-tape--cross`, one long strip across the artwork, and `hmp-sticker--peeled`, a sticker with a lifted corner. Every tape strip's ends are torn.
- Doctrine revised: slaps slap the frame — and cross the art, never the words. Stickers and tape may cross the sun, the grid, the gradient or a picture; running text is still never covered or turned, and `taste()` still flags slaps over words only.
- Zine leads the front page: its card stands first in the theme trio, tagged "the lead", with the heaviest grain.
- Fixes the front-page hero headline clipping its final K at wide viewports in Dusk and Zine: the hero measure and the display-xl cap are tightened.
- All published 0.1.0, 0.1.1, 0.1.2 and 0.1.3 runtime files remain unchanged.

## 0.1.3

- Paper cards now scope `on-accent` and `on-cue` with their local fill colours. Accent buttons nested inside a card no longer inherit an incompatible outer-theme ink.
- Adds browser-measured contrast tests for nested accent buttons across every theme and custom accent choice.
- All published 0.1.0, 0.1.1 and 0.1.2 runtime files remain unchanged.

## 0.1.2

- Adds five accent presets, a custom colour picker and reset on the showcase and in the reusable Accent component.
- Keeps custom text colours at 4.5:1 on all base surfaces and 13:1 in High contrast; selects readable button text and explains colour adjustments.
- Remembers choices separately for each theme, tolerates blocked/corrupt storage, and keeps existing API names and CSS classes.
- Preserves the 0.1.0 and 0.1.1 runtimes unchanged.

## 0.1.1

- Chrome type keeps a solid ground-coloured keyline in High contrast. White lettering stays distinct when it overlaps the white sun, including “Strange work” in the docs.
- Forced-colour mode uses system text and canvas colours. Dusk and Zine keep their existing appearance.
- Adds a browser regression check for the layered Chrome preview.
- Preserves the 0.1.0 runtime under `v/0.1.0/`; versioned runtime folders are immutable.

## 0.1.0

The original three themes, thirteen components, tokens, docs and showcase.
