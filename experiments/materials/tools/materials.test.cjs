/* CPU Canvas and DOM-stub evidence. Not a browser or device test. */
const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const { createCanvas } = require("@napi-rs/canvas");
const ROOT = path.resolve(__dirname, ".."),
  TOK = JSON.parse(fs.readFileSync(path.join(ROOT, "project/tokens.json")));
const colors = Object.fromEntries(
  TOK.color.tokens.map((x) => [x.name, x.value]),
);
let storageTouches = 0;
const callbacks = new Map(),
  els = new Map();
function element(tag) {
  const attrs = {},
    events = {},
    inline = {},
    classes = new Set();
  return {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    style: {
      getPropertyValue: (name) => inline[name] || "",
      getPropertyPriority: () => "",
      setProperty: (name, value) => {
        inline[name] = value;
      },
      removeProperty: (name) => {
        delete inline[name];
      },
    },
    value: "",
    textContent: "",
    children: [],
    events,
    attrs,
    classList: {
      contains: (x) => classes.has(x),
      add: (x) => classes.add(x),
      remove: (x) => classes.delete(x),
      toggle(x, on) {
        on === undefined
          ? classes.has(x)
            ? classes.delete(x)
            : classes.add(x)
          : on
            ? classes.add(x)
            : classes.delete(x);
      },
    },
    setAttribute(n, v) {
      attrs[n] = String(v);
    },
    getAttribute: (n) => attrs[n] ?? null,
    hasAttribute: (n) => n in attrs,
    appendChild(e) {
      e.parentElement = this;
      this.children.push(e);
      return e;
    },
    remove() {
      if (this.parentElement)
        this.parentElement.children = this.parentElement.children.filter(
          (x) => x !== this,
        );
    },
    closest() {
      let e = this;
      while (e) {
        if (e.attrs?.["data-theme"]) return e;
        e = e.parentElement;
      }
      return null;
    },
    addEventListener(n, f) {
      (events[n] ??= []).push(f);
    },
    dispatch(n, e = {}) {
      (events[n] || []).forEach((f) => f(e));
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  };
}
const root = element("html");
root.setAttribute("data-theme", "raeverfaelt");
const body = element("body");
root.appendChild(body);
const canvas = createCanvas(1280, 660);
Object.assign(canvas, element("canvas"));
canvas.getBoundingClientRect = () => ({
  width: 1280,
  height: 660,
  left: 0,
  top: 0,
});
let capture = null;
canvas.setPointerCapture = (id) => {
  capture = id;
};
canvas.hasPointerCapture = (id) => capture === id;
canvas.releasePointerCapture = (id) => {
  if (capture === id) capture = null;
};
els.set("scene", canvas);
const document = {
  readyState: "loading",
  documentElement: root,
  body,
  hidden: false,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (t) => (t === "canvas" ? createCanvas(1, 1) : element(t)),
  getElementById(id) {
    if (!els.has(id))
      els.set(id, element(id === "look" || id === "sky" ? "select" : "div"));
    return els.get(id);
  },
  addEventListener(n, f) {
    callbacks.set("document:" + n, f);
  },
};
function getComputedStyle(e) {
  return {
    getPropertyValue(n) {
      for (let scope = e; scope; scope = scope.parentElement) {
        const own = scope.style.getPropertyValue(n);
        if (own) return own;
        const theme = scope.getAttribute("data-theme");
        if (theme && colors[n.slice(2)]?.[theme])
          return colors[n.slice(2)][theme];
      }
      return "";
    },
    color: "#000000",
  };
}
const window = {
  document,
  getComputedStyle,
  location: {
    search: "",
    href: "file:///atelier.html",
  },
  localStorage: {
    getItem() {
      storageTouches++;
      return null;
    },
    setItem() {
      storageTouches++;
    },
    removeItem() {
      storageTouches++;
    },
  },
  matchMedia: () => ({
    matches: false,
  }),
  dispatchEvent() {},
  addEventListener(n, f) {
    callbacks.set("window:" + n, f);
  },
  devicePixelRatio: 1,
  console,
};
window.window = window;
const box = vm.createContext({
  window,
  document,
  console,
  getComputedStyle,
  CustomEvent: class {},
  URLSearchParams,
  setTimeout() {
    throw Error("Unexpected timer");
  },
});
vm.runInContext(
  fs.readFileSync(path.join(ROOT, "project/components/bundle.js"), "utf8"),
  box,
);
const H = window.Hypermetapunk,
  beforeStorage = storageTouches;
vm.runInContext(
  fs.readFileSync(path.join(ROOT, "project/components/materials.js"), "utf8"),
  box,
);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, "project/components/worlds.js"), "utf8"),
  box,
);
const tests = [];
function check(name, f) {
  f();
  tests.push(name);
}
const hash = (c) =>
  crypto.createHash("sha256").update(c.toBuffer("image/png")).digest("hex");
const hashes = {},
  scene = Object.freeze({
    seed: 1947,
  });
fs.mkdirSync(path.join(ROOT, "qa"), {
  recursive: true,
});
check("Eight unique families; original API intact", () => {
  assert.equal(H.looks.length, 8);
  assert.equal(new Set(H.looks.map((x) => x.id)).size, 8);
  for (const f of [
    "theme",
    "still",
    "ticker",
    "slap",
    "taste",
    "token",
    "reducedMotion",
    "init",
  ])
    assert.ok(H[f]);
});
check("Original theme values unchanged", () => {
  const original = JSON.parse(
    fs.readFileSync(path.join(ROOT, "tools/fixtures/legacy-colors.json")),
  );
  for (const [name, values] of Object.entries(original))
    for (const id of ["dusk", "zine", "contrast"])
      assert.equal(colors[name][id], values[id]);
});
for (const id of H.looks.map((x) => x.id)) {
  const P = H.pen(id),
    c = createCanvas(1280, 660),
    g = c.getContext("2d");
  check(id + ": resolved inks and finite RGB", () => {
    assert.equal(P.look, id);
    assert.deepEqual(
      Array.from(P.inks.ink),
      colors.ink[id]
        .slice(1)
        .match(/../g)
        .map((x) => parseInt(x, 16)),
    );
    for (const rgb of Object.values(P.inks))
      assert.ok(rgb.every(Number.isFinite));
    assert.throws(() => P.rgb("not-an-ink"), /Unknown ink/);
  });
  check(id + ": deterministic fixture, no input mutation", () => {
    const s = JSON.stringify(scene);
    const receipt = P.scene(g, scene, {
      detail: 0.6,
      rain: 0.4,
    });
    const a = hash(c);
    P.scene(g, scene, {
      detail: 0.6,
      rain: 0.4,
    });
    assert.equal(hash(c), a);
    assert.equal(JSON.stringify(scene), s);
    assert.equal(receipt.animated, false);
    hashes[id] = a;
    fs.writeFileSync(
      path.join(ROOT, "qa", id + "-1280.png"),
      c.toBuffer("image/png"),
    );
  });
  check(id + ": portrait fixture and Canvas state restore", () => {
    const c = createCanvas(390, 410),
      g = c.getContext("2d");
    g.globalAlpha = 0.73;
    const alpha = g.globalAlpha;
    g.lineWidth = 7;
    g.translate(2, 3);
    const t = g.getTransform();
    P.scene(g, scene, {
      width: 390,
      height: 410,
    });
    assert.equal(g.globalAlpha, alpha);
    assert.equal(g.lineWidth, 7);
    assert.equal(g.getTransform().e, t.e);
    assert.equal(g.getTransform().f, t.f);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    P.scene(g, scene, {});
    fs.writeFileSync(
      path.join(ROOT, "qa", id + "-390.png"),
      c.toBuffer("image/png"),
    );
  });
  check(id + ": malformed/options bounded without NaN", () => {
    P.scene(
      g,
      {
        seed: NaN,
      },
      {
        width: -1,
        height: Infinity,
        detail: Infinity,
        rain: "bad",
        paint: [
          null,
          {
            x: NaN,
            y: 0,
          },
          {
            x: Infinity,
            y: 0,
          },
          {
            x: 1,
            y: 0,
            radius: Infinity,
          },
        ],
      },
    );
    for (const fn of ["band", "sun", "gridFloor"])
      P[fn](g, {
        width: 80,
        height: 60,
        radius: 0,
      });
    P.chromeText(g, "WORK", {
      size: 42,
    });
    P.misregister(g, "RAIN", {
      size: 24,
    });
    for (const kind of ["fibre", "xerox", "halftone", "scanlines"])
      P.texture(g, kind, {
        width: 100,
        height: 100,
      });
  });
}
check("All family render hashes differ", () =>
  assert.equal(new Set(Object.values(hashes)).size, 8),
);
check("Unknown family falls back without prototype lookup", () => {
  assert.equal(H.pen("constructor").look, "dusk");
  assert.equal(H.pen("__proto__").look, "dusk");
});
check(
  "Rain accumulates; paint and sky mixing independently alter output",
  () => {
    const p = H.pen("rainprint"),
      c = createCanvas(500, 300),
      g = c.getContext("2d");
    p.scene(g, scene, {
      rain: 0,
    });
    const a = hash(c);
    p.scene(g, scene, {
      rain: 1,
    });
    const b = hash(c);
    assert.notEqual(a, b);
    p.scene(g, scene, {
      rain: 1,
      paint: [
        {
          x: 0.5,
          y: 0.7,
        },
      ],
    });
    const cc = hash(c);
    assert.notEqual(b, cc);
    p.scene(g, scene, {
      rain: 1,
      backgroundLook: "schism",
    });
    assert.notEqual(b, hash(c));
  },
);
check("RaeverFaelt sky override affects actual sky pixels", () => {
  const p = H.pen("raeverfaelt"),
    c = createCanvas(500, 300),
    g = c.getContext("2d");
  p.scene(g, scene, {
    backgroundLook: "contrast",
  });
  const a = Array.from(g.getImageData(50, 20, 1, 1).data);
  p.scene(g, scene, {
    backgroundLook: "strawberry",
  });
  assert.notDeepEqual(Array.from(g.getImageData(50, 20, 1, 1).data), a);
});
check(
  "Pen resolves current accent and local scopes without a stale cache",
  () => {
    const hex = (s) =>
      s
        .slice(1)
        .match(/../g)
        .map((x) => parseInt(x, 16));
    const current = H.accent.set("#e8ff00", { keep: false });
    assert.deepEqual(Array.from(H.pen().inks.accent), hex(current.color));
    assert.deepEqual(
      Array.from(H.pen(H.theme.get()).inks.accent),
      hex(current.color),
    );
    const scoped = element("section");
    scoped.style.setProperty("--accent", "#123456");
    body.appendChild(scoped);
    assert.deepEqual(Array.from(H.pen(scoped).inks.accent), [18, 52, 86]);
    scoped.remove();
    H.accent.reset({ keep: false });
    assert.deepEqual(
      Array.from(H.pen().inks.accent),
      hex(colors.accent[H.theme.get()]),
    );
  },
);
check("No addon persistence, timers or network", () =>
  assert.equal(storageTouches, beforeStorage),
);
check(
  "Real preview control callbacks: repeated changes, paint, cancel, blur and reset",
  () => {
    for (const [id, val] of [
      ["detail", "60"],
      ["rain", "40"],
      ["look", "raeverfaelt"],
      ["sky", ""],
    ])
      document.getElementById(id).value = val;
    document.getElementById("paint").setAttribute("aria-pressed", "false");
    vm.runInContext(
      fs.readFileSync(path.join(ROOT, "site/atelier.js"), "utf8"),
      box,
    );
    const start = hash(canvas),
      paint = document.getElementById("paint");
    H.theme.set("dusk", {
      keep: false,
    });
    callbacks.get("window:hmp:ready")();
    assert.equal(root.getAttribute("data-theme"), "raeverfaelt");
    assert.equal(document.getElementById("look").value, "raeverfaelt");
    assert.equal(hash(canvas), start);
    paint.dispatch("click");
    assert.equal(paint.getAttribute("aria-pressed"), "true");
    canvas.dispatch("pointerdown", {
      pointerId: 1,
      button: 0,
      clientX: 600,
      clientY: 500,
    });
    assert.equal(capture, 1);
    canvas.dispatch("pointermove", {
      pointerId: 2,
      clientX: 10,
      clientY: 20,
    });
    canvas.dispatch("pointerdown", {
      pointerId: 2,
      button: 0,
      clientX: 10,
      clientY: 20,
    });
    canvas.dispatch("pointerup", { pointerId: 2 });
    assert.equal(
      capture,
      1,
      "A second touch ending must not release the active pointer",
    );
    canvas.dispatch("pointercancel", { pointerId: 1 });
    assert.equal(capture, null);
    canvas.dispatch("pointerdown", {
      pointerId: 3,
      button: 0,
      clientX: 650,
      clientY: 490,
    });
    callbacks.get("window:blur")();
    assert.equal(capture, null);
    document.getElementById("shower").dispatch("click");
    assert.equal(document.getElementById("look").value, "rainprint");
    assert.equal(document.getElementById("rain").value, "50");
    for (let i = 0; i < 7; i++)
      document.getElementById("shower").dispatch("click");
    assert.equal(document.getElementById("rain").value, "100");
    document.getElementById("dab").dispatch("click");
    assert.notEqual(hash(canvas), start);
    document.getElementById("reset").dispatch("click");
    assert.equal(paint.getAttribute("aria-pressed"), "false");
    assert.equal(capture, null);
    assert.equal(hash(canvas), start);
    assert.equal(storageTouches, beforeStorage);
  },
);
check("R2 controls: depth, inverse, rubbing, forced-colors and reset", () => {
  const byId = (id) => document.getElementById(id),
    start = hash(canvas);
  byId("layer").value = "subterrain";
  byId("layer").dispatch("change");
  assert.equal(byId("sky").disabled, true);
  assert.notEqual(hash(canvas), start);
  const submerged = hash(canvas);
  byId("inversion").dispatch("click");
  assert.equal(byId("inversion").getAttribute("aria-pressed"), "true");
  assert.equal(byId("palette-viewport").classList.contains("inverted"), true);
  assert.equal(
    hash(canvas),
    submerged,
    "Whole-study CSS inversion does not double-invert the canvas buffer",
  );
  byId("inversion").dispatch("click");
  assert.equal(byId("palette-viewport").classList.contains("inverted"), false);
  byId("reverse-nap").dispatch("click");
  assert.notEqual(hash(canvas), submerged);
  byId("reverse-nap").dispatch("click");
  assert.equal(hash(canvas), submerged);
  byId("brush").dispatch("click");
  assert.equal(byId("paint").getAttribute("aria-pressed"), "false");
  canvas.dispatch("pointerdown", {
    pointerId: 9,
    button: 0,
    clientX: 220,
    clientY: 220,
  });
  canvas.dispatch("pointermove", { pointerId: 9, clientX: 180, clientY: 220 });
  canvas.dispatch("pointerup", { pointerId: 10 });
  assert.equal(capture, 9);
  assert.notEqual(hash(canvas), submerged);
  document.hidden = true;
  callbacks.get("document:visibilitychange")();
  assert.equal(capture, null);
  document.hidden = false;
  byId("look").value = "schism";
  byId("look").dispatch("change");
  assert.equal(byId("brush").getAttribute("aria-pressed"), "false");
  assert.equal(canvas.classList.contains("paint-on"), false);
  const originalMedia = window.matchMedia;
  window.matchMedia = (q) => ({ matches: q.includes("forced-colors") });
  byId("inversion").dispatch("click");
  assert.equal(byId("inversion").disabled, true);
  assert.equal(byId("palette-viewport").classList.contains("inverted"), false);
  window.matchMedia = originalMedia;
  byId("reset").dispatch("click");
  assert.equal(byId("layer").value, "surface");
  assert.equal(byId("sky").disabled, false);
  assert.equal(byId("inversion").disabled, false);
  assert.equal(hash(canvas), start);
  assert.equal(storageTouches, beforeStorage);
});
check("R3 Shower releases felt capture and returns normal scrolling", () => {
  const byId = (id) => document.getElementById(id);
  byId("reset").dispatch("click");
  byId("brush").dispatch("click");
  canvas.dispatch("pointerdown", {
    pointerId: 45,
    button: 0,
    clientX: 220,
    clientY: 220,
  });
  assert.equal(capture, 45);
  byId("shower").dispatch("click");
  assert.equal(capture, null);
  assert.equal(byId("brush").getAttribute("aria-pressed"), "false");
  assert.equal(byId("paint").getAttribute("aria-pressed"), "false");
  assert.equal(canvas.classList.contains("paint-on"), false);
  const after = hash(canvas);
  canvas.dispatch("pointermove", { pointerId: 45, clientX: 120, clientY: 220 });
  assert.equal(hash(canvas), after);
  byId("paint").dispatch("click");
  byId("shower").dispatch("click");
  assert.equal(byId("paint").getAttribute("aria-pressed"), "true");
  assert.equal(
    canvas.classList.contains("paint-on"),
    true,
    "Explicit paint choice stays enabled",
  );
  byId("reset").dispatch("click");
});
check("All atelier ranges have explicit label and output associations", () => {
  const html = fs.readFileSync(path.join(ROOT, "atelier.html"), "utf8");
  for (const id of ["detail", "rain", "nap"]) {
    assert.match(html, new RegExp('<label[^>]+for="' + id + '"'));
    assert.match(html, new RegExp('<output[^>]+for="' + id + '"'));
  }
});
const report = {
  status: "passed",
  groups: tests.length,
  tests,
  hashes,
  scope:
    "Actual Canvas drawing functions on CPU plus DOM-stub control callbacks; not browser, WebGL, physical input or game integration acceptance.",
};
fs.writeFileSync(
  path.join(ROOT, "qa/materials-results.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
module.exports = {
  H,
  createCanvas,
};
