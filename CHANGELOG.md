# Changelog

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
