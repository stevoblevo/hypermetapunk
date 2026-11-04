# Working on Hypermetapunk (for every agent and person)

Hypermetapunk is the third design system in Bleve's family, child of Storeybrook (day) and Depthfield (night). This repo is its source: `project/` (the system), `docs.html` (its docs) and `index.html` (its front page).

Read these first: `docs/plan.md` (this system's tasks, in a suggested order), `docs/creative-direction.md` (the picture behind them), `project/README.md` (the brand book), and the family plan at <https://github.com/stevoblevo/depthfield/blob/main/docs/family.md> (contracts shared with Storeybrook and Depthfield).

## Build and check

```
python3 -I site/build.py
python3 -I tools/contrast.py
node tools/check.mjs                  # front page and docs, three themes, desktop and phone (needs Playwright)
python3 -m http.server 8703
```
Before pushing: the build leaves no diff, the contrast check passes, and the front page and docs show no console errors and no sideways scroll at 390 px. Add `?hmp-taste` to a page you made and fix what it flags.

## Rules of the road

- Take a task from the family plan or `docs/plan.md`: your name in **Who**, **Status** `doing` on your branch, `done` with the commit in the change that finishes it. One task per branch, named `<agent>/<task-id>-<topic>`.
- Mark code that belongs to a task with a short comment naming it (`/* plan H4: … */`).
- Keep Kit v0's class names (`hmp-chrome`, `hmp-sticker`, …) so its first hosts can move over without renaming.
- Text on stickers is `punk-ink`; slaps never cover running text; running text is never turned. Every text pair stays at 4.5:1 or better.
- `site/immersive.js`, `site/app.*`, `site/build.py` and `docs.html` are shared with Depthfield and Storeybrook: change them in all three or not at all.
- Never replace a published build; add a version. Never delete another agent's work.
- No other studio's characters, logos or names. Words follow `project/07-writing.md`.
- No credentials, services or schedules get added without Bleve's go-ahead.
