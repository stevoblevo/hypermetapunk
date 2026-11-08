/* plan R2: actual CPU outputs, not browser/device acceptance. */
const { H, createCanvas } = require("./materials.test.cjs");
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, ".."),
  OUT = path.join(ROOT, "qa/r2");
fs.mkdirSync(OUT, { recursive: true });
const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}
const hash = (c) =>
  crypto.createHash("sha256").update(c.toBuffer("image/png")).digest("hex");
const original = Object.freeze({ seed: 1947 }),
  normalHashes = {};
for (const size of [
  { width: 1280, height: 660 },
  { width: 390, height: 480 },
])
  for (const look of H.looks.map((x) => x.id))
    for (const layer of ["surface", "subterrain"]) {
      const c = createCanvas(size.width, size.height),
        g = c.getContext("2d"),
        opts = { ...size, look, layer, detail: 0.65, rain: 0.6, nap: 1 };
      check(
        `${look}/${layer}/${size.width}: deterministic, state-preserving, exact inversion`,
        () => {
          g.lineWidth = 7;
          g.globalAlpha = 0.7;
          g.translate(3, 2);
          const receipt = H.worlds.draw(g, original, opts),
            a = hash(c),
            pixels = Buffer.from(
              g.getImageData(0, 0, size.width, size.height).data,
            );
          assert.equal(receipt.animated, false);
          assert.equal(receipt.layer, layer);
          assert.equal(g.lineWidth, 7);
          assert.ok(Math.abs(g.globalAlpha - 0.7) < 0.01);
          assert.equal(g.getTransform().e, 3);
          H.worlds.draw(g, original, opts);
          assert.equal(hash(c), a);
          assert.equal(original.seed, 1947);
          fs.writeFileSync(
            path.join(OUT, `${look}-${layer}-${size.width}.png`),
            c.toBuffer("image/png"),
          );
          H.worlds.draw(g, original, { ...opts, invert: true });
          const inverse = g.getImageData(0, 0, size.width, size.height).data;
          for (let i = 0; i < pixels.length; i += 4) {
            assert.equal(inverse[i], 255 - pixels[i]);
            assert.equal(inverse[i + 1], 255 - pixels[i + 1]);
            assert.equal(inverse[i + 2], 255 - pixels[i + 2]);
            assert.equal(inverse[i + 3], pixels[i + 3]);
          }
          fs.writeFileSync(
            path.join(OUT, `${look}-${layer}-${size.width}-inverted.png`),
            c.toBuffer("image/png"),
          );
          H.worlds.invert(g, size);
          const restored = g.getImageData(0, 0, size.width, size.height).data;
          for (let i = 0; i < pixels.length; i++)
            if (restored[i] !== pixels[i])
              throw new Error(
                `Double invert mismatch at ${i}: ${restored[i]} vs ${pixels[i]}; alpha=${restored[i - (i % 4) + 3]}`,
              );
          normalHashes[`${look}/${layer}/${size.width}`] = a;
        },
      );
    }
check("Requested draw bounds preserve outside pixels and host context", () => {
  for (const look of H.looks.map((entry) => entry.id)) {
    for (const layer of ["surface", "subterrain"]) {
      for (const invert of [false, true]) {
        const c = createCanvas(220, 170),
          g = c.getContext("2d");
        g.fillStyle = "#7d39be";
        g.fillRect(0, 0, 220, 170);
        const before = g.getImageData(0, 0, 220, 170).data;
        g.translate(4, 8);
        g.globalAlpha = 0.6;
        H.worlds.draw(g, original, {
          look,
          layer,
          invert,
          width: 120,
          height: 90,
        });
        const after = g.getImageData(0, 0, 220, 170).data;
        for (let y = 0; y < 170; y++)
          for (let x = 0; x < 220; x++) {
            if (x < 120 && y < 90) continue;
            const i = (y * 220 + x) * 4;
            assert.deepEqual(
              [...after.slice(i, i + 4)],
              [...before.slice(i, i + 4)],
              `${look}/${layer}/${invert} spill ${x},${y}`,
            );
          }
        assert.equal(g.getTransform().e, 4);
        assert.equal(g.getTransform().f, 8);
        assert.ok(Math.abs(g.globalAlpha - 0.6) < 0.01);
        g.resetTransform();
        g.globalAlpha = 1;
        g.fillStyle = "#00ff00";
        g.fillRect(200, 150, 1, 1);
        assert.deepEqual(
          [...g.getImageData(200, 150, 1, 1).data],
          [0, 255, 0, 255],
          "Internal clip must not leak to host",
        );
      }
    }
  }
});
check("Inverted draw respects an existing host clip", () => {
  const c = createCanvas(200, 140),
    g = c.getContext("2d");
  g.fillStyle = "#7d39be";
  g.fillRect(0, 0, 200, 140);
  g.beginPath();
  g.rect(30, 20, 80, 60);
  g.clip();
  H.worlds.draw(g, original, {
    look: "schism",
    layer: "subterrain",
    width: 180,
    height: 120,
    invert: true,
  });
  for (const [x, y] of [
    [5, 5],
    [150, 80],
    [50, 100],
  ])
    assert.deepEqual([...g.getImageData(x, y, 1, 1).data], [125, 57, 190, 255]);
});
check("Every family and stratum has distinct rendered output", () =>
  assert.equal(new Set(Object.values(normalHashes)).size, 32),
);
check(
  "Felt nap reverses, brush changes local texture, and resetting restores the image",
  () => {
    const c = createCanvas(800, 480),
      g = c.getContext("2d");
    for (const layer of ["surface", "subterrain"]) {
      const opts = { look: "raeverfaelt", layer, nap: 1, detail: 0.65 };
      H.worlds.draw(g, original, opts);
      const start = hash(c);
      H.worlds.draw(g, original, { ...opts, nap: -1 });
      assert.notEqual(hash(c), start);
      fs.writeFileSync(
        path.join(OUT, `felt-${layer}-against.png`),
        c.toBuffer("image/png"),
      );
      H.worlds.draw(g, original, {
        ...opts,
        brush: [{ x: 0.16, y: 0.4, direction: -1, radius: 90 }],
      });
      assert.notEqual(hash(c), start);
      H.worlds.draw(g, original, opts);
      assert.equal(hash(c), start);
    }
  },
);
check("Pigment changes undersea output without mutating input", () => {
  const c = createCanvas(400, 300),
    g = c.getContext("2d"),
    marks = Object.freeze([Object.freeze({ x: 0.5, y: 0.8, radius: 30 })]);
  H.worlds.draw(g, original, { look: "rainprint", layer: "subterrain" });
  const start = hash(c);
  H.worlds.draw(g, original, {
    look: "rainprint",
    layer: "subterrain",
    paint: marks,
  });
  assert.notEqual(hash(c), start);
  assert.equal(marks.length, 1);
});
check("Unknown input fallback and non-finite bounds remain safe", () => {
  const c = createCanvas(80, 60),
    g = c.getContext("2d");
  H.worlds.draw(
    g,
    { seed: NaN },
    {
      look: "__proto__",
      width: -2,
      height: Infinity,
      nap: NaN,
      detail: Infinity,
      brush: [null, {}],
      paint: [null, {}],
    },
  );
  assert.equal(H.worlds.draw(g, {}, {}).animated, false);
});
check("Inversion preserves partial alpha", () => {
  const c = createCanvas(2, 2),
    g = c.getContext("2d");
  g.fillStyle = "rgba(30,70,80,.5)";
  g.fillRect(0, 0, 1, 1);
  const a = g.getImageData(0, 0, 2, 2).data;
  H.worlds.invert(g);
  const b = g.getImageData(0, 0, 2, 2).data;
  for (let i = 3; i < a.length; i += 4) assert.equal(b[i], a[i]);
});
const css = fs.readFileSync(path.join(ROOT, "site/atelier.css"), "utf8");
const block = css.match(/#palette-viewport\s*\{([^}]+)\}/)[1],
  colors = Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*#([a-fA-F\d]{6})/g)].map((m) => [
      m[1],
      m[2].match(/../g).map((n) => parseInt(n, 16)),
    ]),
  );
function lum(c) {
  const a = c.map((n) => {
    n /= 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function ratio(a, b) {
  a = lum(a);
  b = lum(b);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const contrast = [];
check(
  "Actual UI pairs and control/focus boundaries pass before and after full color inversion",
  () => {
    for (const inverse of [false, true]) {
      const color = (n) =>
        inverse ? colors[n].map((v) => 255 - v) : colors[n];
      for (const bg of ["void", "surface", "surface-raised"])
        for (const fg of ["ink", "ink-muted", "link"]) {
          let r = ratio(color(fg), color(bg));
          assert.ok(r >= 4.5, `${inverse}/${fg}/${bg} ${r}`);
          contrast.push({ inverse, fg, bg, ratio: r });
        }
      for (const bg of ["void", "surface", "surface-raised"])
        for (const fg of ["line", "focus"])
          assert.ok(ratio(color(fg), color(bg)) >= 3, `${inverse}/${fg}/${bg}`);
      assert.ok(ratio(color("on-accent"), color("accent")) >= 4.5);
    }
    assert.match(
      css,
      /#palette-viewport\.inverted\s*\{\s*filter:\s*invert\(1\)/,
    );
  },
);
const report = {
  status: "passed",
  groups: checks.length,
  checks,
  uiContrast: contrast,
  hashes: normalHashes,
  scope:
    "Real CPU Canvas outputs and exact RGB complement. Browser CSS filter, native inputs and artistic acceptance are separate gates.",
};
fs.writeFileSync(
  path.join(OUT, "results.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    { status: report.status, groups: report.groups, checks },
    null,
    2,
  ),
);
module.exports = { H, createCanvas };
