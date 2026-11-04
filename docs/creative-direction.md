# Hypermetapunk: creative direction

Written 3 Nov 2026 by Claude (session 01ApCRaiX6JVCSowgVuAsG4V) for every agent who picks this up next. The tasks that make these ideas real are in `docs/plan.md`; this file is the why and the picture. Add to it; sign what you add.

## What it is for

Hypermetapunk is the family's after-dark public square: where strange, hand-made work meets its people. Storeybrook is a book on a table; Depthfield is a world you scroll through; Hypermetapunk is the wall outside the venue, covered in flyers, under a neon sign, at the hour the sun goes down. Its first host is bespoke.gig ("strange work finds its people"); its second is AND SO's neon skin.

## The picture

- **Two halves, always both.** The wave (chrome, the banded sun, the grid floor, glass) is what looks rendered too well. The punk (stickers, stamps, tape, marker, misregistration, grain) is what was printed cheaply and stuck on top. A page with only one half is either a screensaver or a photocopy. Hold them in tension.
- **One horizon per page.** The dusk is the opening shot. Everything after it is the wall.
- **People in the margins.** Scrawl is a named person talking. The page should feel made by a crew, not a brand.
- **Loud, and it still reads.** Every text pair at 4.5:1 or better, measured. Loudness comes from scale, colour fields and slaps on the frame, never from making words hard to read.

## Where it goes next

### 1. The wall (the system's signature interaction)
A board of flyers, cards and stickers that people can re-slap. Drag a sticker to another corner, peel one off (it curls back), pin a flyer with a thumbtack. Positions are seeded so the wall looks the same for everyone until someone moves something; a viewer's own moves are theirs (stored on their device). Keyboard: Tab to a slap, arrow keys move it, Delete peels it. Reduced motion: moves snap. This is bespoke.gig's "find work" board, and a place for any Saelion event.

### 2. Neon signs that mean something
A Sign component: a word in tube lettering with scanlines that flickers on once when revealed and then holds. Signs are status, not decoration: OPEN, LIVE, SOLD OUT, ON AIR. The sign's state is also said in words for readers.

### 3. Flyers and zines you can print
- **Flyer**: a torn A5 sheet for a gig or event: big type, a stamp, and tear-off tabs along the bottom, each tab a real link (calendar, map, contact). It prints cleanly on Zine.
- **Zine reader**: photocopied pages in a stapled spread; a page turns with the sweep of a photocopier's light bar (cut instantly under reduced motion). Print gives a real booklet: an A5 imposition stylesheet so anyone can photocopy, fold and staple the site.

### 4. Rare things: holo foil
A holographic foil sticker whose sheen moves with the pointer and, on phones, with Depthfield's tilt. Foil is for what was earned: an unlocked pet, a finished gig, a found secret. One per screen.

### 5. Crossing pets, the third set
Storeybrook has seven day pets and Depthfield five night pets in the shared `crossing:pets` save. Hypermetapunk adds a third set of five, found by doing what the kit is for: peel a sticker (a sticker cat), stop the ticker (a static moth), hover a misregistered heading until the plates slip (a two-plate koi), switch to Zine (a stamp crab), open every door (a tape bat). Find all seventeen across the three sites and a hidden page opens: the lattice, where one state shows through all three systems at once.

### 6. One state, many faces (the 5D lattice)
Bleve's picture for the whole project: one underlying state (a story, a sound, a scene) seen through different skins: storybook watercolour, night depth, neon punk, calm daylight, e-ink. Hypermetapunk should be able to wear the same content as its parents. Concretely: a shared look registry across the three systems (family task F4) so an app can offer all the family's looks from one list, and a demo page where one scene moves between Storeybrook, Depthfield and Hypermetapunk without changing its words.

### 7. The pen for canvas
`Hypermetapunk.pen(theme)`, the neon sibling of `Storeybrook.pen`: resolved inks and canvas helpers to draw the band, the banded sun, the grid floor, chrome text, scanlines, halftone and xerox noise, and misregistered type. AND SO's `hmp` skin and any game's night hub draw from it instead of re-deriving the look.

### 8. The signal (sound, off until asked)
A small, original sound palette: a gated chord when a sign comes on, tape wow when a page turns, a stamp's thud. Off by default behind a visible switch, remembered for the visit only, like Depthfield's sound. There is room for something stranger: AND SO already has a Bohlen–Pierce "club" mode (13 steps over a tritave); a Hypermetapunk venue could be where that tuning lives. Everything original; no samples of anyone else's music.

### 9. Video-tape motion, sparingly
A tracking wobble on a page cut, a rewind smear when you jump back to the top. Short, opt-in through the theme, and gone under reduced motion and the page's own "hold still" switch.

### 10. Optional camera play (parked)
Bleve has pictured gesture control through the webcam: for example, slap a sticker by showing a palm. If built, it is off by default, needs an explicit "use my camera" choice every visit, runs entirely in the browser, shows a visible indicator while on, and nothing leaves the device. Parked until Bleve says go.

## Guard rails

- Original work only: no other studio's characters, logos, names or music.
- Every text pair at 4.5:1 or better (`tools/contrast.py`); slaps never cover words; running text is never turned (`Hypermetapunk.taste()`).
- Reduced motion and the page's "hold still" switch stop everything that moves by itself.
- Never replace a published build; add a version.
