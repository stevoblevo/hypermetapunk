# Sticker

A slap tag: a short word or two in heavy capitals on acid, orange, magenta, mint or cyan stock, outlined and shadowed in photocopy black and turned a little.

**Provide** `<span class="hmp-sticker">v2 louder</span>`; colours `hmp-sticker--orange`, `--magenta`, `--mint`, `--cyan`; `hmp-sticker--round` for a round one; `hmp-sticker--peeled` for one whose corner has lifted. As a link or button it wobbles back when pointed at. Put several inside `<div data-hmp-slap="7">` and each gets a tilt from the seed, the same on every visit.

- Text on a sticker is always `punk-ink`. (Kit v0 printed white on orange and magenta; that is 3.1:1 and 3.6:1, so 0.1 changed it.)
- Stickers go on the frame (corners, the top bar, beside a heading) and may cross the artwork — the sun, the grid, a picture — never over running text. `Hypermetapunk.taste()` flags any that cover words.
- Three to five a screen. A sticker says the one thing you want noticed.

**Accessibility**: it is text, so it is read in order; a decorative sticker that repeats a heading takes `aria-hidden="true"`. It turns at most `tex-tilt` (6°), most near 2.5°.
