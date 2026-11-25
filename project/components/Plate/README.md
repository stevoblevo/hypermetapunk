# Plate

One drawing, printed in a theme's material: `Hypermetapunk.plate(theme, source)` takes a canvas of flat fills on transparency and returns the same drawing as a neon halftone, a xerox with one red, or a solid cut. Nothing is redrawn by hand.

**Provide** `components/pen.js` and then `components/plate.js` (after `bundle.js`, or without it: the plate reads no CSS), and a source canvas. Call `Hypermetapunk.plate(theme, source, options)` with a theme id, or an element whose theme to use, and place the canvas it returns.

- **Dusk, a neon halftone.** The drawing becomes a dot screen in the dusk band's own inks (violet in the darks up to sun yellow in the lights), outlined in cyan tube light with the magenta plate slipped under it, over the toner-banded sky.
- **Zine, a xerox with one red.** Darks go to toner, the middle tones to a coarse dot screen at 45 degrees whose dots grow with the dark, and the lights are left as paper. The one red is a spot colour: it goes only to what was warm in the drawing (a sun, a lamp, a star, a red stripe), a hair off register. The copier leaves its streaks and its speckle. (Before 0.5.2 every middle tone took the red and filled its shape.)
- **High contrast, a solid cut.** White on black with an acid keyline; the lines inside the shape are cut back to black. No grain and no slipped plate, so nothing is lost.
- The accent is always the sound word: on an acid sticker in Dusk, rubber-stamped in Zine, in an acid box in High contrast. `word` sets it (`SLAP` unless you say otherwise) and `word: ''` leaves it out. The plate puts it in the emptiest corner. One accent a plate: do not add a second.
- Draw the source in flat fills with no outlines, shading or text: the material adds those. About 320 to 640 px a side is enough. A plate takes a few milliseconds, so make it once and keep the canvas.
- `Hypermetapunk.plate.media` lists the three as data (`{ id, name, accent }` by theme). `Hypermetapunk.tint(source, colour)` and `Hypermetapunk.edges(source, rgb, gain)` are the two helpers the family shares; Storeybrook and Depthfield make their plates from the same two.
- Text on the sticker is `punk-ink`, and the plate never covers running text: it is a picture, so place it like one.

**Accessibility**: give the canvas `role="img"` and an `aria-label` that names the subject and the material. The sound word is part of the picture, so say it in the label when it matters. A plate is still: reduced motion and "hold still" need no branch.

Family task F9; Storeybrook's plate (six materials) and Depthfield's (scan and stage) take the same source canvas.
