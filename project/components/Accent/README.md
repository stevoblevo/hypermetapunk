# Accent

Choose an accent for the current theme without losing readable text. Five presets and a native colour picker work with the existing theme controls.

`Hypermetapunk.accent.set('#e8ff00')` accepts `#RGB` or `#RRGGBB`. It adjusts the chosen colour only when necessary to keep text at 4.5:1 against all three theme surfaces, or 13:1 in High contrast. It also selects black or white `on-accent` text. The returned record contains `requested`, effective `color`, `onColor`, `adjusted` and `minimumContrast`. Unsupported custom surface token formats return `null` and leave the theme defaults in place.

`accent.get()` returns a copy of that record, or `null` for the original theme accent. `accent.reset()` restores the current theme’s original. Choices are remembered separately for each theme in `hmp:accents`; `{ keep: false }` makes a set or reset temporary. Blocked or corrupt storage does not stop the controls. `accent.presets()` returns copies of the five named colours.

Use `data-hmp-accent="#e8ff00"` on a button, `data-hmp-accent-input` on a labelled colour input, and `data-hmp-accent-reset` on a reset button. A `data-hmp-accent-status` element announces adjustments. Call `Hypermetapunk.init()` after adding controls; repeated calls do not duplicate handlers. Changes emit `hmp:accent`.

This changes only `accent` and `on-accent`. Paper cards retain their paper-safe inks, nested theme samples retain their own palette, and decorative wave colours, focus rings, links and cues do not change. Existing CSS classes and APIs remain available. Do not use the accent API to inject arbitrary CSS.
