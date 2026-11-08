# Hypermetapunk: shared work and creative continuity

Updated 8 November 2026. Start here when continuing in Claude, ChatGPT or another editor. This is a source-grounded handoff, not a claim that every conversation or private prototype has been recovered.

## What is current

- The canonical repository is [stevoblevo/hypermetapunk](https://github.com/stevoblevo/hypermetapunk). The released runtime remains **0.1.3**, based on `7a98cabec33217a657060f655c9660cfbd3043bb`. Keep the three pinned CSS/JS files at the same version. Its paper-card ink fix, custom accents and Chrome lettering fix remain untouched.
- The new [material experiment](../experiments/materials/README.md) shares previously unmerged toolkit source for collaboration. It is **not** an upgrade of the released runtime. Load its files together in isolation rather than mixing experimental tokens with the 0.1.3 bundle.
- Existing remote patch branches `sae/0.1.1-work-legibility`, `sae/0.1.2-custom-accents` and `sae/0.1.3-paper-card-ink` represent changes already on main. No open pull request was found at handoff preparation.
- Claude originated the family-format toolkit and front page. ChatGPT/Sae developed the material pen, paired worlds, inversion and draw-only projected landmarks. Branch names are provenance, not a live lock or promise that a particular worker is still running.

## The design direction

The brief grew beyond vaporwave. Preserve Dusk, Zine and High contrast, but build materially different worlds rather than palette swaps. Keep one dominant path, a clear subject and quiet space around controls. Old and new looks must preserve content, character identity and gameplay state.

1. **Ink Rain / Dreamweave / Rainprint:** fibrous paper, sparse fictional newspaper fragments, pigment blooms and red-rain accumulation. Permit restrained undertones and touch painting alongside play. Fictional conspiratorial lore is fiction, not factual news.
2. **Techno Future Schism:** pale porcelain and ceramic relief, teal architecture, copper circuits, broken orbital forms and displaced planes. Geometry carries the difference.
3. **Steam Funk / Bloomworks:** forged metal, brass, enamel, valves and flywheels, with colorful life-giving imaginary plumes and flowers. Avoid generic pollution dystopia; this is fictional worldbuilding, not a claim about real pollution.
4. **RaeverFaelt:** layered fibrous relief, a pale continuous route, crimson river and copper detail. Directional synthetic felt and reversible nap are now implemented as bounded visual effects, not cloth physics.
5. **Strawberry Americano:** a quieter cream/espresso/berry continuation, rounded lacquer/glazed roots rather than RaeverFaelt's fibre. This is an interpretation, not a claim of exact fidelity to every later reference image.
6. **Cinematic comic:** convincing depth and storytelling, selective pencil/ink rather than heavy outlines on every actor. No third-party superhero characters or copied panels.
7. **Composable lenses:** mix backdrop, terrain, water, actors, effects and UI independently where safe. Magic Eye and true 3D/4X transitions remain ambitions, not delivered features.

The eight implemented registry IDs are `dusk`, `zine`, `contrast`, `rainprint`, `schism`, `steamfunk`, `raeverfaelt`, `strawberry`. They are implementation names, not a claim that this precise taxonomy was dictated by the user.

## What the shared code actually does

- `materials.js`: deterministic Canvas 2D pen, material-specific scene helpers, independent sky, detail and pigment controls.
- `worlds.js`: surface and subterrain constructions for all eight families, bounded brush/nap fields, clipped drawing and exact RGB inversion. Alpha is preserved; do not apply CSS and Canvas inversion together unless intentionally cancelling them.
- `landmarks.js`: optional draw-only projected geometry. The host supplies position, time and scale. It neither replaces simulation nor makes new gameplay worlds.
- `atelier.html`: a standalone comparison with shared route/traveller, ranges with explicit labels, keyboard alternatives, reset, pointer cancellation and print corrections.
- Experimental declarations and CPU/DOM-stub tests accompany the source. The runtime has no npm dependency.

## Verification and remaining gates

The handoff includes reproducible checks: 44 material/control groups, 40 paired-world/inversion groups, 4,160 experimental accent cases and 232 text pairs passed on 8 November. The released build produced no diff and its 1,560 accent cases passed. The full world suite passed with a bounded 96 MB JS heap after an initial unbounded process was killed for resource pressure. Local browser launch was blocked by a missing browser executable. CPU Canvas renders and DOM-stub callbacks are not browser screenshots or device acceptance. Native touch, assistive technology, responsive layout, CSS inversion/print, physical devices, final artistic review and game-owner adoption still need review. Existing prepared browser checks are supplied as checks to run, not passed evidence.

A private game integration previously exercised projected materials without changing trajectory or saved progress. Its game source, portrait, screenshots, private links and newer companion work are intentionally absent. Do not reconstruct or publish that private proof from this handoff. Coordinate with its owner before any adapter adoption.

## Next useful work

1. Run the isolated experiment and its documented checks, then complete actual browser/device and independent review.
2. Review the same scene across materials for focal hierarchy and legibility, not just successful compilation.
3. Promote only reviewed components into a new version. Never rewrite an existing `v/` snapshot or silently replace the published three-theme site.
4. Continue C4 (pen) and then C9 (one state, many faces) with the family contracts. Pet crossings, the wall, sound, true game unlocks and a Claude artifact remain separate tasks.
5. Push small coherent branches, reconcile fresh main, run required checks and merge ready work. Leave unfinished or held work explicitly marked rather than burying it in local-only files.

## Linkable source map

- [Canonical task plan](plan.md), [creative direction](creative-direction.md), [brand book](../project/README.md), [agent rules](../AGENTS.md), [changelog](../CHANGELOG.md).
- [Released demo](https://stevoblevo.github.io/hypermetapunk/), [released docs](https://stevoblevo.github.io/hypermetapunk/docs.html).
- [Storeybrook](https://github.com/stevoblevo/storeybrook), [Depthfield](https://github.com/stevoblevo/depthfield), [family contracts](https://github.com/stevoblevo/depthfield/blob/main/docs/family.md).
- [Toolkit shelf](https://saelion.co/toolkit) connects the family experiences.

Coverage: current repository and branch inventory, existing toolkit source, earlier material studies and recovered user direction, plus game-owner privacy coordination. This is a substantial working continuity map, not a complete export of all Claude/ChatGPT chats or inaccessible reference artwork. Private conversations and internal research notes are not public source artifacts.

## Optional host package continuation (8 November)

The [0.2.0-materials.1 standalone candidate](../packages/materials/README.md) now extracts the shared material/world renderers into an isolated ESM module with pinned palettes, declarations and SHA-256 manifest. It uses one bounded private Canvas surface per renderer, preserves destination paths/state, and exposes only static background rendering. No experimental UI tokens or globals are needed alongside 0.1.3. The public host fixture and CI gate test appearance switching without simulation changes. Projected landmarks, full family pen API, actual RF/Hush or Signal Orchard adapters, physical-device/visual acceptance and production enablement are still separate work. Follow the package's explicit cache, DPR, fallback and adoption contract; do not treat a candidate as an accepted game integration.
