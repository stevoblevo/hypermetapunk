# Changelog

## 0.5.0

- The plate (family F9, the Hypermetapunk half): a new add-on, `components/plate.js`, loaded after `pen.js`. `Hypermetapunk.plate(theme, source, { word, seed, font })` takes one canvas of flat fills on transparency and returns a new canvas of the same size in the theme's material: a neon halftone in Dusk, a xerox with one red in Zine, a solid cut in High contrast. The accent is always the sound word (`SLAP` unless told otherwise; `word: ''` leaves it out), placed in the emptiest corner. `Hypermetapunk.tint` and `Hypermetapunk.edges` are the family's two shared helpers. It reads no CSS and never changes the source.
- Moods (family F10): every entry of `Hypermetapunk.looks` carries `mood`, `lit` in Dusk and `impact` in Zine and High contrast.
- New Plate component page: the source drawing (drag on it to add to it), the plate in the current theme, and all three side by side.
- Front page on phones: the one long word now breaks after "Hypermeta" and stands at 32 px or more, so chrome type passes its own taste rule at 390 px; a slap that hangs off a card's corner no longer makes the page scroll sideways.
- `tools/check.mjs` makes the three plates from one drawing and checks the phone headline, taste and width in all three themes.
- All published runtimes from 0.1.0 to 0.4.0 remain unchanged; `pets.js` is byte-identical to 0.4.0.

## 0.4.0

- Crossing pets, the third set (plan C5): the add-on `components/pets.js` gives `Hypermetapunk.pets` (`kit`, `key`, `version`, `list`, `has`, `find`, `count`, `total`, `draw`), the same contract Storeybrook and Depthfield keep. Five dusk pets join the family's shared save, `localStorage['crossing:pets']`, as `hmp:` keys; every write reads the save first and adds one key, so the day (`sb:`) and night (`df:`) pets are never touched. `total()` counts the family from the same save (7 + 5 + 5 = 17).
- The five, drawn on canvas in the kit's materials and dancing to a beat with a swing (the weight a little behind the beat, a lighter hit two thirds through it): Vinyl (`sticker-cat`), a die-cut vinyl cat whose corner peels up on the beat; Snow (`static-moth`), wings of TV static with test-card eyespots and a chrome body; Offset (`two-plate-koi`), a koi printed as a cyan and a magenta plate that slip apart and snap back; Postmark (`stamp-crab`), a halftone rubber-stamp crab that sidesteps and leaves its last impression fading; Flutter (`tape-bat`), wings of cassette tape, reels for eyes. `still: true` draws one fixed pose; nothing allocates a canvas per frame.
- The front page finds them by doing what the kit is for: peel a sticker on the parts board, stop the ticker (it now has its own stop button), hold the pointer or a finger on the misregistered heading until its plates slip, switch to Zine, open every door at the foot of the page. A find slaps on a card (Card, Tape, Sticker and Stamp, the pet drawn by `pets.draw`); the bar counts "Pets n/5"; a new Dusk pets section lists all five with Storeybrook's and Depthfield's counts, and when all seventeen are found a link appears: the lattice, in AND SO.
- The pen draws stickers: `pen(theme).sticker(ctx, src, x, y, o)` die-cuts any canvas or image with a keyline in the theme's sticker stock, a hairline edge, a hard slap shadow and optional slipped cyan and magenta plates (none in High contrast), on offscreen canvases reused by size. The Pen page shows a drawn creature turned into a sticker in all three themes.
- `taste()` treats a floating layer (`[data-hmp-layer]`: the sticky bar, a found card) as its own page: its slaps are measured against its own words only.
- New component page: Pets. `tools/pen-inks.py` now checks the ink table in `pets.js` too; `tools/check.mjs` finds all five pets on the front page and checks that the family's other pets survive in the save.
- All published 0.1.x, 0.2.0 and 0.3.0 runtime files remain unchanged.

## 0.3.0

- The pen (plan C4, family F4), an add-on at `components/pen.js` that loads after `bundle.js` or alone: `Hypermetapunk.pen(theme)` resolves a theme's inks to RGB and draws the horizon on canvas: `sky` (the dusk gradient in hard toner bands; `ease` keeps the hot bands by the horizon when words sit over the sky), `sun` (the banded disc with its tape), `floor` (the grid, drifting unless motion is held), `horizon` (all three), `chrome` and `misreg` lettering, and the print materials `scan`, `halftone` and `xerox` with `grain`. It reads no CSS, so a single-file game can load `pen.js` by itself.
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
