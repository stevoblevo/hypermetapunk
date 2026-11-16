# Grain

Photocopy grain over art and paper, and a halftone for flat fills, so nothing looks rendered.

**Provide** `class="hmp-grain"` on a positioned block (its `::after` lays the grain at `op-grain`), and `hmp-halftone` for a dot screen in the ink colour.

- Grain on the Horizon and on cards; not on small controls.
- Zine lays it heavier (0.28); High contrast removes it.

**Accessibility**: purely visual and under the text's contrast budget: grain never sits between ink and ground at more than `op-grain`.
