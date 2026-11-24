# Pets

Five dusk pets, the family's third set of crossing pets, found by doing what the kit is for and kept in the save Storeybrook's day pets and Depthfield's night pets already share: `Hypermetapunk.pets` records them and draws them on canvas, dancing to a beat with a swing.

**Provide** `components/pets.js` after `bundle.js`, or alone: like the pen it reads no CSS, and drawing needs only a 2D context. Then:

```js
var P = Hypermetapunk.pets;   // { kit: 'hmp', key: 'crossing:pets', version: '0.4.0', list, has, find, count, total, draw }
if (P.find('sticker-cat')) showCard('sticker-cat');   // true only the first time
P.draw(ctx, 'tape-bat', { x: 80, y: 60, size: 96, t: now / 1000, beat: env, look: 'dusk' });
```

- `P.list` holds the five as `{ id, name, line, how, where }`: `line` is what it says when found, `how` the hint, `where` the address on this kit's site where it is found.
- `P.has(id)` and `P.find(id)` take the id with or without `hmp:`. `find` writes `found['hmp:' + id] = Date.now()` and returns `true` only when the pet is new; it also sends a `hmp:pet` window event (`detail: { id, name, count }`).
- `P.count()` is this kit's found count. `P.total()` counts the whole family from the same save: `{ sb, df, hmp, all }`, out of 7, 5 and 5 (17 in all).
- The save is `localStorage['crossing:pets']` on stevoblevo.github.io: `{ found: { 'sb:<id>': ms, 'df:<id>': ms, 'hmp:<id>': ms }, active: { sb: id } }`. Every write reads it first and adds one key; nobody else's entries are ever removed or rewritten. If storage is blocked, finds last for the visit.

| id | Name | Found on the front page by | Drawn as |
| --- | --- | --- | --- |
| `sticker-cat` | Vinyl | peeling a sticker on the parts board | a die-cut vinyl cat with a thick keyline and a hard slap shadow; a corner peels up on the beat and shows the liner |
| `static-moth` | Snow | stopping the ticker | wings of TV static and scanlines that flicker, a vertical hold rolling through, test-card eyespots, a chrome body |
| `two-plate-koi` | Offset | holding the pointer (or a finger) on the misregistered heading until its plates slip | a koi printed as a cyan plate and a magenta plate on its own paper; on the beat the plates slip apart and snap back |
| `stamp-crab` | Postmark | switching the page to Zine | a rubber-stamp crab in one ink, pressed unevenly over a halftone; it sidesteps on the beat and leaves its last impression fading |
| `tape-bat` | Flutter | opening every door at the foot of the page | wings of cassette tape (an arm to the wrist, three loops for fingers) twisting glossy and matte, reels for eyes, a label for a belly |

## Drawing

`P.draw(ctx, id, { x, y, size, t, beat, look, still, alpha })` draws the pet centred on `(x, y)`, `size` about its height in CSS pixels (the bat, wings out, is wider than tall). It saves and restores the context.

- `t` is seconds. `beat` is 0 to 1: it jumps to 1 on each beat and decays; 0 or missing means no music, and the pet idles.
- Each pet dances its own way with a swing feel: the weight lands a little behind the beat, and there is a lighter, shorter hit two thirds of the way through it (long, short). The cat leans and its corner peels, the moth's wings slam open, the koi's plates slip, the crab sidesteps, the bat beats its wings.
- `look` is `dusk` (default), `zine` or `contrast`; the inks are the pen's token tables (`tools/pen-inks.py` checks them). Every pet keeps a light and a dark edge, so it holds on dark and light grounds.
- `still: true` draws one fixed pose with no motion at all. Pass it under reduced motion and "hold still" (`Hypermetapunk.reducedMotion()` tells you both).
- It is cheap enough for seven pets at 60 frames a second: the cat and the crab are baked once per look and size, the moth's static is four small tiles, the koi reuses one scratch canvas, and nothing allocates a canvas per frame. It looks right from 24 to 160 px.

**Accessibility**: a pet on canvas is a picture. Give the canvas `role="img"` and an `aria-label` (its name), or hide it when its name is printed beside it. A find is announced in words (the front page's card is a polite live region) and never depends on colour. Four of the five can be found with a keyboard alone; the koi needs a pointer or a finger. Nothing flashes: the static changes texture at an even brightness, and its lift on the beat is small and covers far less than the flash threshold's area.

On the front page the count shows in the bar ("Pets 0/5") and in the Dusk pets list, with Storeybrook's and Depthfield's counts from the same save. Find all seventeen and a link appears: the lattice, in AND SO.
