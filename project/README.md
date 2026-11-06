# Hypermetapunk

Hypermetapunk is the third design system in Bleve's family, the child of Storeybrook (day, paper, stories) and Depthfield (night, depth, worlds). It takes the hyperreal dusk (chrome type, a banded sun, a neon grid running toward you, glass lit from behind) and slaps punk print culture on it: stickers, rubber stamps, masking tape, marker scrawl in the margins, misregistered plates and photocopy grain.

It began as a block of CSS at the top of one page, "Hypermetapunk Kit v0", written for bespoke.gig on 1 November 2026 (in `storeybrook/show-tell/bespoke/`). Version 0.1 lifts that seed into the family's format: tokens with themes, components with guidelines and live previews, a behaviour bundle, and this book.

Current runtime: **0.1.2**. The 0.1.1 Chrome keyline keeps lettering readable over the High contrast sun; 0.1.2 adds [custom accents](components/Accent/README.md). Original runtime versions remain available under `v/`.

## When to use it

For places where strange, made-by-hand work meets people: a gig board, a zine, a launch, a music night, a game's hub after dark. Use Storeybrook for stories and Depthfield for worlds you scroll through; use Hypermetapunk when the page should feel printed in a hurry and lit by neon.

## Three themes

- **Dusk** (`dusk`, the default). The neon night: a violet ground, chrome over the band, hot pink as the accent, mint as the cue.
- **Zine** (`zine`). The same pages photocopied in daylight: raw paper, photocopy black, magenta ink, heavier grain, no glow.
- **High contrast** (`contrast`). Black, white and acid: every pair at 13:1 or better, no glow, no grain, no chrome.

A theme changes materials, never content, order or meaning.

## The rules that make it Hypermetapunk

1. **One horizon.** The dusk band, the sun and the grid floor open the page and, at most, close it. Everything else sits on the void.
2. **Slap the frame, not the words.** Stickers, tape and stamps go on corners, bars and margins. Running text is never covered and never turned.
3. **One loud thing per region.** One chrome line, one acid button, one sticker that matters. Everything else is plain.
4. **People talk in the margins.** Scrawl is a named person's aside, never the brand's slogan.
5. **Plain-spoken.** Say what a thing does, by its name. Punk does not do "seamless".

## How the files fit

- `01-wave.md` to `08-code.md`: the chapters.
- `tokens.json`: every token, three themes. `tokens.css` is compiled from it by `site/build.py`.
- `components/`: `bundle.css`, `bundle.js` (`window.Hypermetapunk`), `index.d.ts`, and a folder per component with its guidelines and a live preview.
- `assets/Mark/`: the mark.

The family's shared plan and contracts are in `stevoblevo/depthfield`, `docs/family.md`.
