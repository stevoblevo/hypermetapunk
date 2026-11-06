# Accessibility

- **Contrast.** Standard token text pairs are 4.5:1 or better in every theme, measured by `tools/contrast.py`. Layered text also needs visual checks: Chrome has a solid ground-coloured keyline in High contrast to remain readable over its white sun. High contrast is 13:1 or better. Text on stickers is always photocopy black.
- **Focus.** A 3 px ring in `focus` (acid on Dusk and High contrast, safety orange on Zine), never removed.
- **Targets.** Controls are 44 px tall at least.
- **Reading order.** Slaps sit in the markup next to what they belong to and are read in order; decorative ones (tape, a sticker that repeats a heading) are `aria-hidden`. The ticker is read once.
- **Never by colour alone.** A stamp's status and a sticker's message are words.
- **Motion.** See Motion: reduced motion and the page's own switch stop everything that moves by itself.
- **Forced colours.** Chrome type prints as plain text.
- **The page check.** `Hypermetapunk.taste()` flags stickers over words, low-contrast stickers, turned paragraphs, small chrome and unnamed controls. Add `?hmp-taste` to an address to see its report.
