# Color

Three themes over one set of names. The names follow the family contract, so code shared with Storeybrook and Depthfield reads `void` (or `paper`), `surface`, `surface-raised` (or `page`), `line`, `ink`, `ink-muted`, `accent`, `on-accent`, `cue`, `link` and `focus` without change.

## The families

- **Ground and text**: `void`, `surface`, `surface-raised`, `line`, `ink`, `ink-muted`.
- **Signals**: `accent` (the hot one, one per region), `cue` (something to find or press in the art), `link`, `focus` (acid on Dusk, safety orange on Zine).
- **Wave**: `wave-abyss`, `wave-indigo`, `wave-violet`, `wave-magenta`, `wave-tangerine`, `wave-sun`, `wave-cyan`, `wave-mint`: art only.
- **Chrome**: `chrome-1` to `chrome-5`: chrome type only.
- **Punk**: `punk-acid`, `punk-orange`, `punk-magenta` (sticker stock), `punk-ink` (photocopy black), `punk-paper`, `punk-tape`, `scrawl`.

## Contrast, measured

The standard token text pairs in every theme are 4.5:1 or better. Layered artwork must also be checked visually; token ratios alone do not prove legibility. `tools/contrast.py` measures them from `tokens.json` and fails if one drops; this table is its output for 0.1.

| Theme | Text | On | Ratio |
| --- | --- | --- | --- |
| dusk | `ink` | `void` | 18.1:1 |
| dusk | `ink-muted` | `void` | 11.4:1 |
| dusk | `accent` | `void` | 7.8:1 |
| dusk | `link` | `void` | 14.2:1 |
| dusk | `cue` | `void` | 15.0:1 |
| dusk | `ink` | `surface` | 16.9:1 |
| dusk | `ink-muted` | `surface` | 10.6:1 |
| dusk | `accent` | `surface` | 7.2:1 |
| dusk | `link` | `surface` | 13.3:1 |
| dusk | `cue` | `surface` | 14.0:1 |
| dusk | `ink` | `surface-raised` | 15.2:1 |
| dusk | `ink-muted` | `surface-raised` | 9.6:1 |
| dusk | `accent` | `surface-raised` | 6.5:1 |
| dusk | `link` | `surface-raised` | 12.0:1 |
| dusk | `cue` | `surface-raised` | 12.6:1 |
| dusk | `on-accent` | `accent` | 7.6:1 |
| dusk | `on-cue` | `cue` | 14.2:1 |
| dusk | `punk-ink` | `punk-acid` | 17.3:1 |
| dusk | `punk-ink` | `punk-orange` | 6.2:1 |
| dusk | `punk-ink` | `punk-magenta` | 5.4:1 |
| dusk | `punk-ink` | `wave-mint` | 14.6:1 |
| dusk | `punk-ink` | `wave-cyan` | 10.3:1 |
| dusk | `punk-ink` | `punk-paper` | 16.9:1 |
| zine | `ink` | `void` | 16.9:1 |
| zine | `ink-muted` | `void` | 8.7:1 |
| zine | `accent` | `void` | 5.2:1 |
| zine | `link` | `void` | 6.7:1 |
| zine | `cue` | `void` | 5.8:1 |
| zine | `ink` | `surface` | 15.0:1 |
| zine | `ink-muted` | `surface` | 7.7:1 |
| zine | `accent` | `surface` | 4.6:1 |
| zine | `link` | `surface` | 6.0:1 |
| zine | `cue` | `surface` | 5.2:1 |
| zine | `ink` | `surface-raised` | 19.0:1 |
| zine | `ink-muted` | `surface-raised` | 9.8:1 |
| zine | `accent` | `surface-raised` | 5.9:1 |
| zine | `link` | `surface-raised` | 7.6:1 |
| zine | `cue` | `surface-raised` | 6.6:1 |
| zine | `on-accent` | `accent` | 6.0:1 |
| zine | `on-cue` | `cue` | 6.7:1 |
| zine | `punk-ink` | `punk-acid` | 17.3:1 |
| zine | `punk-ink` | `punk-orange` | 6.2:1 |
| zine | `punk-ink` | `punk-magenta` | 5.4:1 |
| zine | `punk-ink` | `wave-mint` | 8.3:1 |
| zine | `punk-ink` | `wave-cyan` | 6.8:1 |
| zine | `punk-ink` | `punk-paper` | 19.0:1 |
| contrast | `ink` | `void` | 21.0:1 |
| contrast | `ink-muted` | `void` | 17.1:1 |
| contrast | `accent` | `void` | 18.7:1 |
| contrast | `link` | `void` | 15.0:1 |
| contrast | `cue` | `void` | 15.8:1 |
| contrast | `ink` | `surface` | 19.7:1 |
| contrast | `ink-muted` | `surface` | 16.1:1 |
| contrast | `accent` | `surface` | 17.6:1 |
| contrast | `link` | `surface` | 14.1:1 |
| contrast | `cue` | `surface` | 14.8:1 |
| contrast | `ink` | `surface-raised` | 18.4:1 |
| contrast | `ink-muted` | `surface-raised` | 15.0:1 |
| contrast | `accent` | `surface-raised` | 16.4:1 |
| contrast | `link` | `surface-raised` | 13.2:1 |
| contrast | `cue` | `surface-raised` | 13.9:1 |
| contrast | `on-accent` | `accent` | 18.7:1 |
| contrast | `on-cue` | `cue` | 15.8:1 |
| contrast | `punk-ink` | `punk-acid` | 18.7:1 |
| contrast | `punk-ink` | `punk-orange` | 21.0:1 |
| contrast | `punk-ink` | `punk-magenta` | 21.0:1 |
| contrast | `punk-ink` | `wave-mint` | 21.0:1 |
| contrast | `punk-ink` | `wave-cyan` | 21.0:1 |
| contrast | `punk-ink` | `punk-paper` | 21.0:1 |

Kit v0 printed white text on orange and magenta stickers (3.1:1 and 3.6:1). In 0.1 text on any sticker is `punk-ink`.

## Custom accents in 0.1.2

`Hypermetapunk.accent.set('#e8ff00')` sets an accent per theme and chooses matching `on-accent` text. It adjusts unreadable requests to at least 4.5:1 on `void`, `surface` and `surface-raised`, or 13:1 in High contrast. Controls show the effective colour when it differs from the request. Reset restores that theme’s original; paper-card inks and decorative wave colours are unchanged. High contrast retains monochrome button styling; stamps and other accent-token text take the custom colour. See the Accent component for the complete API.
