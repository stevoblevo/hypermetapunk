# Hypermetapunk plan

Owner: Bleve. Last updated 23 Nov 2026 by Claude (session 01SjkUtV9TUafBVoQhywHhYS; first written 3 Nov by session 01ApCRaiX6JVCSowgVuAsG4V). This is the plan for this system; the family plan (shared contracts, versions, the pen across systems) is at <https://github.com/stevoblevo/depthfield/blob/main/docs/family.md>. The picture behind these tasks is in `docs/creative-direction.md`.

**How to take part.** Pick an open task: put your name in **Who**, set **Status** to `doing` on your branch (`<agent>/<task-id>-<topic>`), and set it to `done` with the commit in the change that finishes it. One task per branch. Mark code with `/* plan C3: … */`. Before pushing run `python3 -I site/build.py`, `python3 -I tools/contrast.py` and, if you have Playwright, `node tools/check.mjs`.

## Where things stand

- **0.5.0** is the current runtime (25 Nov 2026): seventeen components, three themes each with a mood, and three canvas add-ons, the pen (0.3.0), the crossing pets (0.4.0) and the plate (0.5.0). Every earlier runtime is kept under `v/`.
- It began as **0.1.0**, served at <https://stevoblevo.github.io/hypermetapunk/>: three themes (Dusk, Zine, High contrast), 77 text pairs at 4.5:1 or better, open-licence type, thirteen components, `window.Hypermetapunk` (theme, still, ticker, slap, taste), a brand book in eight chapters, a front page built only from the kit, and the family's shared docs.
- First hosts not yet moved over: bespoke.gig (`storeybrook/show-tell/bespoke/` and `storeybrook/bespoke-v5/`) and AND SO's `hmp` skin (`stevoblevo.github.io/_src/and-so`).

## Suggested order

1. The punk-damage pass (P3; done, 0.2.0)
2. C4 the pen (done, 0.3.0); H4 bespoke.gig on the kit is still open
3. C5 crossing pets (done, 0.4.0)
4. The plate and the moods (C13, family F9 and F10; done, 0.5.0)
5. C1 Sign, C2 Flyer, C3 the wall, C6 holo foil → 0.6
6. C7 zine reader and print, C8 the signal → 0.7
7. C9 one state, many faces (with family F4 and F9) → 1.0

## Tasks

| ID | Task | Acceptance check | Size | Who | Status |
| --- | --- | --- | --- | --- | --- |
| H1 | Own repo and Pages | Front page serves at `/hypermetapunk/` | S | Claude | done (3 Nov) |
| H2 | Tokens from Kit v0, three themes, measured contrast | `tools/contrast.py` passes | M | Claude | done (0.1) |
| H3 | Components from the seed, `window.Hypermetapunk` | Thirteen previews run in the docs with no errors | L | Claude | done (0.1) |
| H4 | Showcase: the front page, then bespoke.gig rebuilt on the kit | The bespoke.gig page uses only the kit's tokens and components; Kit v0's inline block is gone; offered to its home through a branch and PR | M | Claude (front page) | doing: front page done |
| H5 | Family membership: crossing pets, `pen()`, shared Taste rules | See C4, C5 and family F7 | M | Claude (pets, pen) | doing: the pen (C4, 0.3.0) and the dusk pets (C5, 0.4.0) are done, with `pets.total()` counting the whole family from one save; the shared Taste list (F7) is open |
| C1 | **Sign**: tube lettering with scanlines that flickers on once when revealed, then holds; states (`open`, `live`, `sold-out`) also said in words | README and preview; holds still under reduced motion and "hold still"; taste clean | S | open | open |
| C2 | **Flyer**: a torn A5 sheet for an event with a stamp and tear-off tabs, each tab a real link | README and preview; prints on one A5 page in Zine | M | open | open |
| C3 | **The wall**: a board where stickers, flyers and cards can be re-slapped by drag or keyboard (arrows move, Delete peels), seeded so it looks the same for everyone, a viewer's moves kept on their device | `Hypermetapunk.wall(el)` with README and preview; keyboard-only run passes; taste clean after moves | L | open | open |
| C4 | **The pen**: `Hypermetapunk.pen(theme)` with inks and canvas helpers for the band, sun, grid floor, chrome text, scanlines, halftone, xerox noise and misregistered type | A canvas preview draws the horizon in all three themes from the pen alone; AND SO's `hmp` skin could use it | M | Claude | done (0.3.0): `pen(theme)` in the add-on `components/pen.js` with `sky`, `sun`, `floor`, `horizon`, `chrome`, `misreg`, `material`, `grain`; Pen preview draws all three themes; first host AND SO 10's Dusk look |
| C5 | **Crossing pets, third set**: five `hmp:` pets in `crossing:pets` (sticker cat, static moth, two-plate koi, stamp crab, tape bat), each found by doing what the kit is for; the count shows on all three sites | Finding one shows a slap-on card; Storeybrook's and Depthfield's pet lists count them | M | Claude | done (0.4.0, 613021f on branch `claude/C5-pets`): the add-on `components/pets.js`, `Hypermetapunk.pets` with the family contract (`kit`, `key`, `version`, `list`, `has`, `find`, `count`, `total`, `draw`); Vinyl, Snow, Offset, Postmark and Flutter drawn on canvas in the kit's materials, dancing with a swing, `still` for reduced motion; found on the front page by peeling a sticker, stopping the ticker (its own stop button), holding on the misregistered heading, switching to Zine and opening every door; a slap-on card, a Pets n/5 chip, a Dusk pets list with the day and night counts and, at seventeen, the lattice link to AND SO; plus `pen().sticker()`. Storeybrook's and Depthfield's own lists counting `hmp:` keys is their side of the contract |
| C6 | **Holo foil**: a rare sticker whose sheen follows the pointer, and tilt on phones | README and preview; still under reduced motion; one per screen in the guidelines | S | open | open |
| C7 | **Zine reader and print**: stapled photocopy spreads with a light-bar page turn, and a print stylesheet that imposes an A5 booklet | Printing the front page in Zine gives a foldable booklet; the reader works by keyboard | M | open | open |
| C8 | **The signal**: an original, off-by-default sound palette (sign hum, tape wow, stamp thud) behind a visible switch; room for a Bohlen–Pierce "club" mode shared with AND SO | Silent until switched on; remembered for the visit only; no outside samples | M | open | open |
| C9 | **One state, many faces**: a demo page where one scene moves between Storeybrook, Depthfield and Hypermetapunk without changing its words (needs family F4) | The same DOM wears all three systems' looks from one switch | L | open | open |
| C10 | **Icons** on the family's 24 px grid (star, door, stamp, tape, sign, flyer, tab, moth) and an Icons asset group | `Hypermetapunk.icon(name)`; shown in the docs' Assets | M | open | open |
| C11 | **A Claude artifact** for Hypermetapunk (family F8), so Claude Design can use it | The artifact lists the same components as `project/` | M | open | open |
| C12 | **Tape-deck motion**: an optional tracking wobble on page cuts and a rewind smear on a jump to the top | Off under reduced motion and "hold still"; never longer than 400 ms | S | open | open |
| C13 | **The plate** (family F9, the Hypermetapunk half) and **moods** (family F10): `components/plate.js`, `Hypermetapunk.plate(theme, source)`: a neon halftone in Dusk, a xerox with one red in Zine, a solid cut in High contrast, the sound word as the one accent, with the shared `tint` and `edges`; `mood` on every theme in `Hypermetapunk.looks`. The front page's headline stands at 32 px or more on phones and the page no longer scrolls sideways at 390 px | The Plate page makes three plates from one drawing and remakes them when the drawing changes; `tools/check.mjs` passes, with taste clean at 390 px in all three themes | M | Claude | done (0.5.0, branch `claude/F9-plate-mood`) |
| C14 | **Versioned front pages** (Bleve, 25 Nov: "we can version landing pages too"): `tools/release.py` freezes `index.html` and the `site/` files it loads under `v/<version>/`, pointed at that version's runtime; `tools/landing.py` back-fills from history | `/v/0.2.0/` to `/v/0.5.0/` each open their own front page with no console errors and report their own version; a second release run leaves no diff; a changed front page without a new version is refused | S | Claude | done (with 0.5.0, branch `claude/F9-plate-mood`). The front pages of 0.1.0 to 0.1.3 are not back-filled |

## Parked (needs Bleve)

- Optional camera play (slap with a gesture): off by default, explicit consent every visit, in-browser only, visible indicator; see `docs/creative-direction.md` section 10.
- Moving bespoke.gig out of the Storeybrook repo into a home of its own.

## Patch releases requested 6 November 2026

| ID | Task | Acceptance | Who | Status |
| --- | --- | --- | --- | --- |
| P1 | 0.1.1: keep WORK readable where Chrome crosses the high-contrast sun | Exact Chrome preview at phone and desktop sizes; no lost glyphs; other themes unchanged | Sae(lion) | done: 5671e15; sandboxed browser gate 42294663780 and screenshots checked |
| P2 | 0.1.2: configurable accent colours | Accessible text pairing, theme changes, persistence, reset and existing API compatibility | Sae(lion) | done: 03f7145; 1,560 colour/theme cases and sandboxed browser gate 42295292979 |
| P3 | 0.2.0: the punk-damage pass — printed, not rendered; slaps cross the art, never the words | Front page in Dusk and Zine at desktop and phone widths: headline whole, bands, grain and tape read as cheap print; contrast check passes | Sae | done |

## Optional material host boundary (8 November 2026)

| ID | Task | Acceptance | Who | Status |
| --- | --- | --- | --- | --- |
| C4a | Standalone pinned material scene candidate and host contract | Reproducible manifest, deterministic CPU contract checks, sandboxed host fixture, explicit production gates | Sae(lion) | candidate prepared in this commit; browser/device and game-owner acceptance remain open |

[Optional materials package](../packages/materials/README.md) prepares game adoption without replacing 0.1.3 or completing all of C4. Production enablement remains a separate host-owned change after its acceptance gates.
