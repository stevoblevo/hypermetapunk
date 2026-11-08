# Material pen

Draw the same scene in eight materially different families, without changing its content or game state.

This is the private R1 / C4 review candidate. Load `tokens.css`, `bundle.js`, then `materials.js`. Call `Hypermetapunk.pen('schism')` for a resolved ink palette and a still Canvas 2D pen. The original Dusk, Zine and High contrast IDs and controls remain supported.

## Families

- Rainprint combines ink wash, red rain and a few fictional newspaper fragments. Rain amount and normalized paint marks are supplied by the host, so accumulation can remain independent of game progress.
- Techno Future Schism uses porcelain planes, fractured orbit geometry and oxidized architectural relief.
- Steam Funk / Bloomworks adds brass gears, pressure pipes and colorful imaginary plume ecology. It is fantasy, not a claim about real pollution.
- RaeverFaelt makes fibrous paper terraces, a continuous pale route, a crimson river and a leaf-shaped threshold.
- Strawberry Americano is a quieter interpretation with warm cream, espresso, berry lacquer and restrained copper. The exact earlier Strawberry variation was unavailable to this review; it is not claimed as a traced reproduction.

These are implementation labels, not an assertion that Steven dictated this exact taxonomy. The cinematic-comic ambition informs fine linework and focal hierarchy. Magic Eye, physically simulated water, stereoscopic/3D modes, new gameplay and production game integration are not implemented here.

## API

`pen(look)` returns `{ version, look, inks, material, rgb, band, sun, gridFloor, chromeText, misregister, texture, scene }`. `inks` contains RGB arrays resolved from CSS tokens. The active look inherits its current custom accent. An explicit different look resolves that theme’s own palette. For local token overrides, an element can replace the look ID. Recreate the pen when theme or scoped tokens change. No hidden cache retains stale user accents.

- `rgb(name, opacity)` produces a Canvas color; unknown names throw rather than silently turning black.
- `texture(ctx, kind, options)` accepts `fibre`, `xerox`, `halftone` and `scanlines`. Options include x, y, width, height, seed, opacity and gap.
- `band`, `sun`, `gridFloor`, `chromeText` and `misregister` are standalone helpers for the original family.
- `scene(ctx, state, options)` renders a neutral review fixture. State currently contains only `seed`. Options include width, height, detail, rain, backgroundLook and paint. Paint marks are normalized `{x,y,radius}` values; the last 180 valid marks are rendered.

Drawing never mutates state, stores progress, starts motion, loads a network resource, enables sound or installs controls. The returned receipt says `renderer: 'canvas-2d', animated: false`. It is not a Reignfawn or Slipwake adapter.

## Integration and accessibility

Keep physics, collision and readable route cues outside material choice. A different surface cannot give one player a gameplay advantage. Keep a semantic description alongside canvas. Use separate normal controls for rain, paint and focus, and provide a non-drawing alternative. Leave camera, microphone and audio off.

Prefer one focal feature per region, thin selective outlines and ample calm space. Canvas art inks are not text inks. Place captions and controls on measured UI surfaces. High contrast is a functional representation, not a blanket image inversion. All helper calls save/restore Canvas drawing state; the normal Canvas current path is not preserved, so begin a new path after using a helper.

## Verification

Run `python3 -I site/build.py`, `python3 -I tools/contrast.py`, `node tools/materials.test.cjs`, and the browser checker where Chromium can run. CPU Canvas renders and DOM-stub controls are not browser screenshots or device acceptance. The immutable published 0.1.0–0.1.2 snapshots remain unchanged; their legibility and accent API fixes are carried forward in this candidate.
