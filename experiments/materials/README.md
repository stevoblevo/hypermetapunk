# Experimental material toolkit

Shared for collaboration, not a released runtime or accepted game adapter. Source selected from the existing R1–R3 candidate; private game code/assets are excluded. Historical comments saying “private candidate” describe the earlier review stage, not current access to these deliberately shared files.

Production `project/`, shared site shell and immutable `v/` runtimes remain unchanged. The full [Claude handoff](../../docs/claude-handoff.md) explains direction and outstanding work.

Serve the repository with `python3 -m http.server 8703`, then open `/experiments/materials/atelier.html`. Load this directory's tokens, bundle and modules together. Do not mix experimental tokens with the released 0.1.3 bundle. The optional landmarks module is supplied separately for host review.

From this directory:

```
npm install --no-save --ignore-scripts @napi-rs/canvas@0.1.100
node --max-old-space-size=96 tools/worlds.test.cjs
node tools/accent-test.mjs
python3 -I tools/contrast.py
```

The world suite also runs the material/DOM-stub suite and writes ignored CPU-render evidence under `qa/`. Browser/device acceptance, independent final review, visual quality acceptance and production promotion remain open. `tools/materials-browser.mjs` exports a prepared browser gate for a host runner; it is not an executable claim of passing browser evidence.

Verified on 8 November: 44 material/control groups, 40 paired-world/inversion groups, 4,160 accent cases and 232 text pairs passed. The first unbounded world run exhausted this executor; the documented bounded-heap run passed. Released build produced no diff, with 1,560 production accent cases passing. Local browser launch was blocked by an absent Playwright browser binary.
