import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import vm from "node:vm";
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const source = readFileSync(join(ROOT, "project/components/bundle.js"), "utf8");
const tokens = Object.fromEntries(
  JSON.parse(
    readFileSync(join(ROOT, "project/tokens.json"), "utf8"),
  ).color.tokens.map((t) => [t.name, t.value]),
);
function harness({ saved = {}, blocked = false, inline = {} } = {}) {
  const values = { ...inline },
    attrs = { "data-theme": "dusk" },
    events = {},
    observers = [];
  const style = {
    getPropertyValue: (n) => values[n] || "",
    getPropertyPriority: () => "",
    setProperty: (n, v) => {
      values[n] = v;
    },
    removeProperty: (n) => {
      delete values[n];
    },
  };
  const root = {
    style,
    classList: { contains: () => false, add() {}, toggle() {} },
    getAttribute: (n) => attrs[n] || null,
    setAttribute: (n, v) => {
      attrs[n] = v;
    },
  };
  const storage = {
    getItem: (k) => {
      if (blocked) throw Error("blocked");
      return saved[k] ?? null;
    },
    setItem: (k, v) => {
      if (blocked) throw Error("blocked");
      saved[k] = v;
    },
    removeItem: (k) => {
      delete saved[k];
    },
  };
  const win = {
    localStorage: storage,
    addEventListener: (n, f) => {
      events[n] = f;
    },
    dispatchEvent() {},
    location: { search: "", href: "" },
    matchMedia: () => ({ matches: false }),
    MutationObserver: class {
      constructor(cb) {
        observers.push(cb);
      }
      observe() {}
    },
  };
  win.self = win;
  win.top = win;
  const doc = {
    documentElement: root,
    readyState: "loading",
    addEventListener() {},
    querySelectorAll: () => [],
    querySelector: () => null,
  };
  vm.runInNewContext(source, {
    window: win,
    document: doc,
    CustomEvent: class {},
    getComputedStyle: () => ({
      getPropertyValue: (n) =>
        values[n] ??
        tokens[n.slice(2)]?.[attrs["data-theme"]] ??
        tokens[n.slice(2)] ??
        "",
    }),
    setTimeout,
    URLSearchParams,
  });
  return { api: win.Hypermetapunk, root, saved, values, events, observers };
}
function rgb(s) {
  return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
}
function lum(c) {
  const v = c.map((n) => {
    n /= 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function ratio(a, b) {
  const x = lum(rgb(a)),
    y = lum(rgb(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const h = harness();
let checked = 0;
for (const theme of h.api.looks.map((look) => look.id)) {
  h.api.theme.set(theme, { keep: false });
  const colors = [
    "#000000",
    "#ffffff",
    "#888888",
    "#e8ff00",
    "#ff5cba",
    "#7fe9ff",
    "#05ffa1",
    "#ff914d",
  ];
  for (let i = 0; i < 512; i++)
    colors.push(
      "#" + ((i * 15485863) % 0x1000000).toString(16).padStart(6, "0"),
    );
  for (const requested of colors) {
    const a = h.api.accent.set(requested, { keep: false });
    assert.ok(a);
    assert.equal(a.requested, requested);
    for (const bg of ["void", "surface", "surface-raised"])
      assert.ok(ratio(a.color, tokens[bg][theme]) >= a.minimumContrast);
    assert.ok(ratio(a.color, a.onColor) >= a.minimumContrast);
    checked++;
  }
  const a = h.api.accent.set("#123");
  assert.equal(a.requested, "#112233");
  for (const invalid of [
    "red",
    "#12",
    "#gggggg",
    "url(https://example.com)",
    null,
    3,
    {},
    "#ffffff; color:red",
  ]) {
    assert.throws(() => h.api.accent.set(invalid));
    assert.equal(h.api.accent.get().requested, "#112233");
  }
  const copy = h.api.accent.get();
  copy.color = "#bad";
  assert.notEqual(h.api.accent.get().color, "#bad");
  assert.equal(h.api.accent.reset(), null);
  assert.equal(h.values["--accent"], undefined);
}
h.api.theme.set("dusk");
h.api.accent.set("#ff5cba");
h.api.theme.set("zine");
assert.equal(h.api.accent.get(), null);
h.api.accent.set("#05ffa1");
h.api.theme.set("dusk");
assert.equal(h.api.accent.get().requested, "#ff5cba");
const reloaded = harness({ saved: h.saved });
reloaded.api.theme.set("zine");
assert.equal(reloaded.api.accent.get().requested, "#05ffa1");
for (const opts of [
  { blocked: true },
  { saved: { "hmp:accents": "not-json" } },
  { saved: { "hmp:accents": '{"dusk":"url(evil)","zine":{}}' } },
]) {
  const x = harness(opts);
  x.api.theme.set("dusk");
  assert.equal(x.api.accent.get(), null);
  assert.ok(x.api.accent.set("#123456"));
}
const authored = harness({
  inline: { "--accent": "#ff00ff", "--on-accent": "#000000" },
});
authored.api.theme.set("dusk");
assert.equal(authored.values["--accent"], "#ff00ff");
authored.api.accent.set("#f00");
authored.api.accent.reset();
assert.equal(authored.values["--accent"], "#ff00ff");
const extern = harness();
extern.api.theme.set("contrast");
extern.api.accent.set("#ff0000");
extern.root.setAttribute("data-theme", "dusk");
extern.observers.forEach((f) => f());
assert.equal(extern.api.accent.get(), null);
extern.saved["hmp:accents"] = '{"dusk":"#00ff00"}';
extern.events.storage({ key: "hmp:accents" });
assert.equal(extern.api.accent.get().requested, "#00ff00");
const presets = h.api.accent.presets();
presets[0].name = "changed";
assert.equal(h.api.accent.presets()[0].name, "Acid");
console.log(
  `PASS: ${checked} accent/theme combinations; safe pairs; invalid input; independent themes; persistence; reset; blocked/corrupt storage; external theme/storage changes; caller-owned inline styles.`,
);
