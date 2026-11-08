# Optional materials candidate

**0.2.0-materials.1 is experimental, not a production promotion.** This additive ESM package prepares a safe game-host boundary for the eight paired material worlds. It does not upgrade the released **0.1.3** UI runtime, expose a new global, modify CSS, or import any private game source/assets. C4 pen work remains partial; this is a bounded scene renderer, not the complete family pen contract or a new gameplay system.

Import the exact `v/0.2.0-materials.1/materials.mjs` path. Adjacent `manifest.json` records SHA-256 hashes and experimental status; `index.d.ts` is the standalone contract. The snapshot is generated from the shared experiments and this package's adapter, with a DOM palette resolver replaced by pinned token values. It has no runtime dependency, DOM queries, network, storage, timers, listeners, audio or randomness. Palette changes require a new version. CSS accents intentionally do not alter these scene palettes. Projected landmarks remain a separate experiment, not this package's API.

## Host integration

```js
import { createRenderer } from './vendor/hmp-materials/0.2.0-materials.1/materials.mjs';
const renderer = createRenderer({
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
});
// Draw only when size/look/seed/paint changes, preferably into a cached backdrop.
renderer.render(backgroundContext, {
  width: 800, height: 450, look: 'rainprint', layer: 'surface', seed: 1947
});
// Host draws route, characters, HUD and accessible text above the backdrop.
// At teardown (idempotent):
renderer.dispose();
```

The factory must return a fresh, exclusively owned Canvas 2D surface. An HTMLCanvasElement or OffscreenCanvas is supported. One surface is retained per renderer, reused and reset; dispose releases its backing dimensions. Don't return the destination or share the private surface with another renderer. The caller owns aggregate memory, invalidation and scheduling. Rendering builds paths and bounded option arrays, so **do not call it every animation frame**. Cache the result by version/look/layer/backgroundLook/seed/physical size/detail/rain/nap/invert/paint/brush. This release is a static background cache source, not a real-time character or shader pipeline.

### Units, state and limits

- Width/height are physical backing pixels, 1–2048 on each axis, at most 4,194,304 pixels per retained surface. Explicit finite values clamp; omitted/invalid values default to destination backing dimensions and throw if those exceed the budget. The destination is never resized. A host using logical 800×450 at DPR 2 supplies 1600×900 and performs its own cache-to-display scaling. No implicit DPR lookup or transformation.
- Drawing targets destination pixel origin with identity transform and source-over composition. The host clip remains effective. Transform, styles, alpha, filters, shadows, dash, composite and current path are preserved. Destination pixels inside the clipped rectangle are replaced by the opaque scene. No pixel readback or externally sourced image is used.
- Seed is an explicit uint32-like integer; default 1947. Invalid look falls back to dusk; invalid layer to surface. Detail/rain clamp to 0–1, nap to -1–1. Paint/brush use normalized x/y; only the latest 180 marks are copied, with finite values bounded. Inputs are never mutated or retained. Use ordinary data objects, not accessor/proxy objects with side effects.
- Time, motion, simulation state, hit testing, route geometry, unlocks, scores, portraits and saves are deliberately absent. Every draw is static, including reduced-motion mode. The host owns those behaviors. The package must not receive whole game state; pass a seed and visual options only.
- No automatic error swallowing: factory/render failure throws; final destination copy restores state even on failure. Host must keep its existing untextured fallback and disable the optional feature if rendering fails. Test context loss and memory pressure in the actual host before enabling.

## Adoption steps and release gates

1. Vendor the pinned snapshot plus manifest and declaration; verify SHA-256. Keep all three 0.1.3 UI files pinned together if using that UI. Do not load experimental CSS/bundle or replace published `v/` assets.
2. Introduce an opt-in backdrop adapter and stable untextured fallback. Preserve the existing simulation, input, audio, save format, accessibility tree, focus, route and hit testing. The public [fixture](examples/host.html) demonstrates appearance-only switching and disabling, not a production game.
3. Run CPU checks and the sandboxed browser fixture. Capture actual host evidence at DPR 1/2, 320/390 px and desktop, all selected themes/layers, still/paused mode, repeated switching, disable/re-enable, resize and teardown. Compare simulation snapshots before/after visual changes. Measure cache creation time and frame performance on target devices; no universal frame-budget claim is made here.
4. Obtain game-owner review and visual/accessibility/performance acceptance before enabling it in a production game. RF/Hush needs a host adapter for its own render signature and normalized hit points; Signal Orchard remains an SVG host and needs an explicitly optional Canvas backdrop, not replacement of accessible SVG or its projection/capture rules. Neither host has been modified or certified by this package.
5. For the next package revision, use a new snapshot directory and update the generator/package entry together. The generator refuses any changed, missing or extra files in an existing snapshot before writing anything, and exact rebuilds perform no writes. New snapshots are staged then renamed into place. Never modify already-published snapshots. Rollback is removing the optional import/adapter; gameplay data needs no migration.

## Reproducible checks

From repository root:

```sh
npm install --no-save --ignore-scripts @napi-rs/canvas@0.1.100 typescript@5.9.3 playwright@1.56.1
node packages/materials/build.mjs
node packages/materials/test/build.test.mjs
git diff --exit-code -- packages/materials/v
node --max-old-space-size=96 packages/materials/test/host.test.mjs
npx --no-install tsc --noEmit --lib es2020,dom packages/materials/v/0.2.0-materials.1/index.d.ts
CHROME_BIN=/path/to/sandbox-capable/chrome node packages/materials/test/browser.mjs
```

The existing material CI runs these gates and saves a screenshot for each DPR. The generic browser fixture covers 96 look/layer/viewport/DPR combinations (320, 390 and 1280 px at DPR 1/2), physical backing dimensions and deterministic pixels after resizing away and back. Browser launch failure is a failure, never a skip or a reason to disable the sandbox. CPU evidence does not establish browser/device or artistic acceptance. Full experimental suites and released toolkit checks still apply.

## Verification recorded 8 November 2026

Local CPU host contract and strict TypeScript consumer fixture passed, including sixteen deterministic look/layer combinations, copied frozen inputs, one allocated surface across repeats/resizes, Canvas clipping/path/state preservation, copy-failure restoration, disposal and manifest hashes. Existing experiment suites passed 44 material/control groups, 40 paired-world groups, 4,160 accent cases and 232 contrast pairs. Released 0.1.3 build/immutable verification and 1,560 accent cases/87 text pairs passed; `project/`, root `v/`, shared site files and public pages have no diff.

Local browser launch was attempted with `chromiumSandbox: true` and failed before any page loaded because the executor denied Chromium's socket creation. **No browser checks or screenshots passed locally.** The sandboxed CI gate is supplied for remote verification; production host/device/performance/visual acceptance remains open even after CI passes.
