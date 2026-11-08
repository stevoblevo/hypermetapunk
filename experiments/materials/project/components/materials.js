/* plan R1 / C4: Hypermetphunk material pen, private 0.2.0-revamp.1.
   Load after bundle.js. No simulation, persistence, timers, network or audio.
   One scene, eight families. The pen is additive; legacy theme ids stay intact. */
(function (w, d) {
  "use strict";
  var H = w.Hypermetapunk;
  if (!H || H.pen) return;
  var VERSION = "0.2.0-revamp.1",
    TAU = Math.PI * 2;
  var MATERIALS = {
    dusk: {
      sky: ["#100923", "#64335c", "#e69792"],
      far: "#6b5379",
      mid: "#3c355d",
      land: "#172840",
      paper: "#d7c4bc",
      ink: "#091525",
      red: "#ff6fb5",
      metal: "#79d9d1",
      water: "#303554",
      light: "#fff3ce",
      grain: 0.025,
      kind: "wave",
    },
    zine: {
      sky: ["#efe9dd", "#f3ecde", "#ddd4c0"],
      far: "#c3bbaa",
      mid: "#968d7c",
      land: "#4d514a",
      paper: "#f2ead9",
      ink: "#242627",
      red: "#a13153",
      metal: "#83795e",
      water: "#b4b1a1",
      light: "#fff5dc",
      grain: 0.08,
      kind: "print",
    },
    contrast: {
      sky: ["#000000", "#000000", "#000000"],
      far: "#181818",
      mid: "#444444",
      land: "#ffffff",
      paper: "#000000",
      ink: "#ffffff",
      red: "#e8ff00",
      metal: "#ffffff",
      water: "#000000",
      light: "#ffffff",
      grain: 0,
      kind: "contrast",
    },
    rainprint: {
      sky: ["#f0eadc", "#f4efdf", "#d6d5c6"],
      far: "#c1c5ba",
      mid: "#818e87",
      land: "#363e3d",
      paper: "#e6dfcd",
      ink: "#262b2d",
      red: "#aa3443",
      metal: "#7f8b72",
      water: "#bec7b2",
      light: "#fff6df",
      grain: 0.11,
      kind: "rain",
    },
    schism: {
      sky: ["#d7e3da", "#eee9d7", "#efddb8"],
      far: "#b0c7bb",
      mid: "#6f9d91",
      land: "#285b5a",
      paper: "#e8e3cb",
      ink: "#173d40",
      red: "#a4603b",
      metal: "#b18a55",
      water: "#8ab2a3",
      light: "#fff5d4",
      grain: 0.045,
      kind: "ceramic",
    },
    steamfunk: {
      sky: ["#809b8e", "#cad0ad", "#e6cb99"],
      far: "#8ca38a",
      mid: "#577e6e",
      land: "#214c47",
      paper: "#c0b489",
      ink: "#172f30",
      red: "#b87650",
      metal: "#d6ad69",
      water: "#618c77",
      light: "#ffedb4",
      grain: 0.055,
      kind: "brass",
    },
    raeverfaelt: {
      sky: ["#304752", "#a8b6a0", "#f5d6a8"],
      far: "#96b1a4",
      mid: "#537f7b",
      land: "#294e54",
      paper: "#dfd9b6",
      ink: "#132d39",
      red: "#a53e46",
      metal: "#c99b64",
      water: "#843d48",
      light: "#fff0cb",
      grain: 0.09,
      kind: "relief",
    },
    strawberry: {
      sky: ["#efe4d3", "#f8ebd8", "#e6c5aa"],
      far: "#d4c6ae",
      mid: "#a5b39a",
      land: "#657a69",
      paper: "#f0ddbc",
      ink: "#4e3731",
      red: "#ad5660",
      metal: "#bb865e",
      water: "#bd8b7e",
      light: "#fff4dd",
      grain: 0.04,
      kind: "lacquer",
    },
  };
  var INKS = [
    "void",
    "paper",
    "surface",
    "surface-raised",
    "ink",
    "ink-muted",
    "accent",
    "cue",
    "link",
    "on-accent",
    "on-cue",
    "line",
    "focus",
    "chrome-1",
    "chrome-2",
    "chrome-3",
    "chrome-4",
    "chrome-5",
    "wave-abyss",
    "wave-indigo",
    "wave-violet",
    "wave-magenta",
    "wave-tangerine",
    "wave-sun",
    "wave-cyan",
    "wave-mint",
    "punk-ink",
    "punk-paper",
  ];
  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }
  function number(v, f, a, b) {
    var n = typeof v === "number" && Number.isFinite(v) ? v : f;
    return clamp(Number.isFinite(n) ? n : a, a, b);
  }
  function rng(seed) {
    var s = seed >>> 0 || 7;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function rgba(c, a) {
    return (
      "rgba(" + c.map(Math.round).join(",") + "," + number(a, 1, 0, 1) + ")"
    );
  }
  function rgb(s) {
    var m = /^#([a-f\d]{6})$/i.exec(s || "");
    if (m)
      return [0, 2, 4].map(function (i) {
        return parseInt(m[1].slice(i, i + 2), 16);
      });
    m = /^rgb[a]?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(s || "");
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function path(g, p, fill, stroke, width) {
    g.beginPath();
    g.moveTo(p[0], p[1]);
    for (var i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
    if (fill) {
      g.closePath();
      g.fillStyle = fill;
      g.fill();
    }
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = width || 1;
      g.stroke();
    }
  }
  function disk(g, x, y, r, fill, stroke, width) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    if (fill) {
      g.fillStyle = fill;
      g.fill();
    }
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = width || 1;
      g.stroke();
    }
  }
  function line(g, p, c, width) {
    path(g, p, null, c, width);
  }
  function gradient(g, x, y, x2, y2, colors) {
    var gr = g.createLinearGradient(x, y, x2, y2);
    colors.forEach(function (c, i) {
      gr.addColorStop(i / (colors.length - 1), c);
    });
    return gr;
  }
  function lookOf(v) {
    var e = v && v.nodeType ? v : null;
    var n = e && e.closest && e.closest("[data-theme]");
    var id =
      typeof v === "string"
        ? v
        : n
          ? n.getAttribute("data-theme")
          : H.theme.get();
    return Object.prototype.hasOwnProperty.call(MATERIALS, id) ? id : "dusk";
  }
  function palette(look, el) {
    var p = d.createElement("i"),
      out = {};
    // The active theme must inherit its resolved user accent. An explicit other
    // theme gets an isolated palette, while an Element preserves its local scope.
    var active = look === H.theme.get();
    if (!el && !active) p.setAttribute("data-theme", look);
    p.setAttribute("aria-hidden", "true");
    p.style.cssText =
      "position:absolute;visibility:hidden;pointer-events:none;width:0;height:0";
    (
      el ||
      (active ? d.documentElement : d.body) ||
      d.documentElement
    ).appendChild(p);
    try {
      INKS.forEach(function (n) {
        var s = w
          .getComputedStyle(p)
          .getPropertyValue("--" + n)
          .trim();
        var c = rgb(s);
        if (!c && s) {
          p.style.color = "var(--" + n + ")";
          c = rgb(w.getComputedStyle(p).color);
        }
        if (c) out[n] = c;
      });
    } finally {
      p.remove();
    }
    return out;
  }
  function texture(P, g, kind, o) {
    o = o || {};
    var x = number(o.x, 0, -1e5, 1e5),
      y = number(o.y, 0, -1e5, 1e5),
      ww = number(o.width, g.canvas.width, 0, 8192),
      hh = number(o.height, g.canvas.height, 0, 8192),
      r = rng(number(o.seed, 71, 0, 0xffffffff));
    g.save();
    try {
      g.beginPath();
      g.rect(x, y, ww, hh);
      g.clip();
      g.globalAlpha *= number(o.opacity, P.material.grain, 0, 1);
      g.strokeStyle = g.fillStyle = P.material.ink;
      g.lineWidth = 0.55;
      if (kind === "halftone" || kind === "scanlines") {
        var gap = Math.max(
          number(o.gap, kind === "halftone" ? 7 : 4, 3, 80),
          Math.sqrt((ww * hh) / 20000),
        );
        for (var yy = y; yy < y + hh; yy += gap) {
          if (kind === "scanlines") g.fillRect(x, yy, ww, 0.6);
          else
            for (var xx = x; xx < x + ww; xx += gap)
              disk(
                g,
                xx + ((Math.round(yy / gap) % 2) * gap) / 2,
                yy,
                0.8,
                P.material.ink,
              );
        }
      } else {
        var count = Math.min(16000, Math.ceil((ww * hh) / 80));
        for (var i = 0; i < count; i++) {
          var xx = x + r() * ww,
            yy = y + r() * hh;
          if (kind === "fibre") {
            line(
              g,
              [xx, yy, xx + 1 + r() * 8, yy + (r() - 0.5) * 2],
              P.material.ink,
              0.45,
            );
          } else g.fillRect(xx, yy, 0.5 + r(), 0.4 + r());
        }
      }
    } finally {
      g.restore();
    }
  }
  function gear(g, x, y, size, m) {
    g.save();
    g.translate(x, y);
    var p = [];
    for (var i = 0; i < 64; i++) {
      var a = (i * TAU) / 64,
        r = size * (i % 4 < 2 ? 1 : 0.88);
      p.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    path(g, p, m.metal, m.ink, 0.8);
    disk(g, 0, 0, size * 0.69, m.land, m.light, 0.65);
    for (var i = 0; i < 6; i++) {
      var a = (i * TAU) / 6;
      line(
        g,
        [0, 0, Math.cos(a) * size * 0.65, Math.sin(a) * size * 0.65],
        m.metal,
        size * 0.13,
      );
    }
    disk(g, 0, 0, size * 0.19, m.metal, m.ink, 0.7);
    g.restore();
  }
  function pipe(g, p, m, width) {
    g.save();
    g.lineJoin = g.lineCap = "round";
    line(g, p, m.ink, width + 3);
    line(g, p, m.mid, width);
    line(g, p, m.metal, 1);
    g.restore();
  }
  function tree(g, x, y, size, m, kind) {
    g.save();
    g.translate(x, y);
    g.scale(size, size);
    if (kind === "relief" || kind === "lacquer") {
      for (var j = 0; j < 4; j++) {
        g.save();
        g.translate((j - 1.5) * 8, -36 - j * 8);
        g.rotate((j - 1.5) * 0.28);
        g.beginPath();
        g.moveTo(0, 10);
        g.bezierCurveTo(-28, -20, -25, -64, 0, -83);
        g.bezierCurveTo(28, -60, 24, -14, 0, 10);
        g.fillStyle = j % 2 ? m.mid : m.land;
        g.fill();
        line(g, [0, 10, 0, -75], m.metal, 0.65);
        g.restore();
      }
      line(g, [0, 0, 1, -62], m.ink, 2);
    } else {
      path(g, [-2, 0, -1, -88, 2, 0], m.ink);
      for (var k = 0; k < 3; k++)
        path(
          g,
          [
            -23 + k * 5,
            -25 - k * 18,
            0,
            -100 + k * 5,
            23 - k * 5,
            -25 - k * 18,
          ],
          k % 2 ? m.mid : m.land,
          m.ink,
          0.5,
        );
    }
    g.restore();
  }
  function foundry(g, x, y, m, detail) {
    g.save();
    g.translate(x, y);
    path(g, [-61, 0, -61, -97, 52, -97, 63, -83, 63, 0], m.land, m.ink, 1);
    path(g, [-69, -97, -48, -122, 36, -122, 69, -97], m.red, m.metal, 0.9);
    path(g, [52, 0, 52, -97, 69, -84, 69, 0], m.ink);
    for (var i = 0; i < 3; i++) {
      g.fillStyle = m.ink;
      g.fillRect(-40 + i * 30, -81, 13, 29);
      g.fillStyle = m.light;
      g.fillRect(-38 + i * 30, -78, 8, 12);
      line(g, [-34 + i * 30, -80, -34 + i * 30, -53], m.metal, 1);
    }
    gear(g, -32, -25, 24, m);
    pipe(g, [-66, 0, -76, 0, -76, -143, 13, -143], m, 6);
    g.fillStyle = m.mid;
    g.fillRect(39, -165, 11, 67);
    line(g, [39, -160, 50, -160, 50, -104], m.metal, 2);
    if (detail > 0.3) {
      for (var j = 0; j < 12; j++) {
        disk(g, -56 + j * 10, -89, 1, m.metal);
        disk(g, -56 + j * 10, -5, 1, m.metal);
      }
      g.font = "5px monospace";
      g.fillStyle = m.light;
      g.fillText("BLOOMWORKS", -20, -35);
    }
    g.restore();
  }
  function building(g, x, y, m, kind, detail) {
    if (kind === "brass") {
      foundry(g, x, y, m, detail);
      return;
    }
    g.save();
    g.translate(x, y);
    if (kind === "ceramic") {
      path(
        g,
        [-28, 0, -28, -124, 12, -146, 35, -132, 35, 0],
        m.land,
        m.ink,
        0.8,
      );
      path(g, [-28, -124, 12, -146, 35, -132, -5, -111], m.paper, m.metal, 0.9);
      path(g, [5, 0, 5, -116, 35, -132, 35, 0], m.ink);
      line(g, [-20, -10, -20, -110, 1, -121], m.metal, 1.1);
      for (var i = 0; i < 4; i++)
        line(g, [-13 + i * 5, -97, -13 + i * 5, -67 - i * 3], m.light, 0.7);
    } else if (kind === "rain" || kind === "print") {
      path(g, [-34, 0, -34, -82, 21, -103, 42, -78, 42, 0], m.paper, m.ink, 1);
      path(g, [-42, -79, 19, -113, 48, -79], m.ink);
      g.fillStyle = m.land;
      g.fillRect(-21, -63, 11, 23);
      g.fillRect(14, -63, 11, 23);
      g.fillStyle = m.red;
      g.fillRect(-4, -37, 14, 37);
      if (detail > 0.3) {
        for (var i = 0; i < 25; i++) {
          line(g, [-29 + i * 2.7, -73, -32 + i * 2.7, -5], m.ink, 0.25);
        }
        g.font = "7px serif";
        g.fillStyle = m.ink;
        g.fillText("RIVER PRESS", -27, -69);
      }
    } else {
      path(g, [-31, 0, -31, -74, 27, -86, 43, -69, 43, 0], m.paper, m.ink, 0.8);
      path(g, [27, -86, 43, -69, 43, 0, 27, 0], m.mid);
      path(g, [-42, -74, -5, -111, 50, -75, 27, -86], m.red, m.metal, 1);
      g.fillStyle = m.land;
      g.fillRect(-18, -61, 13, 25);
      g.fillRect(9, -61, 13, 25);
      g.fillStyle = m.light;
      g.fillRect(-15, -58, 5, 18);
      g.fillRect(12, -58, 5, 18);
      g.fillStyle = m.red;
      g.fillRect(-6, -28, 15, 28);
      line(g, [-37, -73, -6, -104, 45, -75], m.light, 0.7);
    }
    g.restore();
  }
  function traveller(g, x, y, m) {
    g.save();
    g.translate(x, y);
    g.shadowColor = "rgba(0,0,0,.18)";
    g.shadowBlur = 5;
    g.fillStyle = m.ink;
    g.beginPath();
    g.ellipse(0, 5, 16, 3, 0, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    line(g, [-4, -18, -6, 3, 0, 3], m.ink, 2.4);
    line(g, [4, -18, 7, 3, 12, 3], m.ink, 2);
    path(g, [-5, -38, 8, -33, 13, -13, -6, -15, -12, -8], m.red, m.ink, 0.6);
    disk(g, 1, -44, 5, m.paper, m.ink, 0.5);
    path(g, [-5, -43, -3, -49, 3, -51, 7, -43, 2, -47], m.metal);
    line(g, [7, -31, 17, -22, 18, -14], m.ink, 1.8);
    g.fillStyle = m.metal;
    g.fillRect(14, -16, 8, 9);
    g.fillStyle = m.light;
    g.fillRect(16, -14, 4, 5);
    g.restore();
  }
  function scene(P, g, input, o) {
    input = input || {};
    o = o || {};
    var W = number(o.width, g.canvas.width, 1, 8192),
      HH = number(o.height, g.canvas.height, 1, 8192),
      detail = number(o.detail, 0.6, 0, 1),
      rain = number(o.rain, 0.4, 0, 1),
      seed = number(input.seed, 1947, 0, 0xffffffff),
      r = rng(seed),
      m = P.material,
      k = m.kind;
    var bg = Object.prototype.hasOwnProperty.call(MATERIALS, o.backgroundLook)
      ? MATERIALS[o.backgroundLook]
      : m;
    var h = 600,
      wid = Math.max(400, (W / HH) * h),
      scale = HH / h,
      ox = (wid - 1100) / 2;
    // Portrait composition moves decorative landmarks, never the shared route or traveller.
    var houseX = wid < 850 ? wid * 0.64 : ox + 798,
      portalX = wid < 850 ? wid * 0.18 : ox + 110;
    g.save();
    try {
      g.beginPath();
      g.rect(0, 0, W, HH);
      g.clip();
      g.scale(scale, scale);
      g.fillStyle = gradient(g, 0, 0, 0, 450, bg.sky);
      g.fillRect(0, 0, wid, h);
      if (
        k === "relief" &&
        !Object.prototype.hasOwnProperty.call(MATERIALS, o.backgroundLook)
      ) {
        g.fillStyle = gradient(g, 0, 0, wid, 0, [
          "#253b4f",
          "#475b64",
          "#d7c39c",
        ]);
        g.fillRect(0, 0, wid, 400);
      }
      if (k === "wave") {
        disk(g, ox + 790, 174, 83, bg.light);
        g.save();
        g.beginPath();
        g.arc(ox + 790, 174, 83, 0, TAU);
        g.clip();
        g.fillStyle = bg.sky[1];
        for (var i = 0; i < 11; i++)
          g.fillRect(ox + 700, 175 + i * 8, 180, 2 + i * 0.35);
        g.restore();
      } else if (k === "ceramic") {
        g.save();
        g.translate(ox + 800, 155);
        g.rotate(-0.22);
        for (var j = 0; j < 3; j++) {
          g.beginPath();
          g.arc(0, 0, 103, (j * TAU) / 3 + 0.09, ((j + 1) * TAU) / 3 - 0.08);
          g.strokeStyle = m.paper;
          g.lineWidth = 22;
          g.stroke();
          g.beginPath();
          g.arc(0, 0, 119, (j * TAU) / 3 + 0.09, ((j + 1) * TAU) / 3 - 0.08);
          g.strokeStyle = m.red;
          g.lineWidth = 0.8;
          g.stroke();
        }
        line(g, [-25, -145, -10, -70, -18, 10, 20, 120], m.ink, 0.8);
        g.restore();
      } else if (k !== "rain" && k !== "print") {
        var sun = g.createRadialGradient(ox + 810, 160, 1, ox + 810, 160, 130);
        sun.addColorStop(0, m.light);
        sun.addColorStop(1, "rgba(255,230,180,0)");
        g.fillStyle = sun;
        g.fillRect(ox + 680, 30, 260, 260);
        disk(g, ox + 810, 160, k === "lacquer" ? 47 : 38, m.light);
      }
      // Seeded atmospheric layers. The same route is visible in every material.
      for (var z = 0; z < 3; z++) {
        var pts = [-30, 430];
        for (var x = -30; x < wid + 80; x += 75) {
          var yy = 235 + z * 53 + (r() - 0.5) * (100 - z * 13);
          pts.push(x, yy);
        }
        pts.push(wid + 90, 470, -30, 470);
        if (k === "relief" || k === "lacquer") {
          g.save();
          g.beginPath();
          g.moveTo(-30, 470);
          g.lineTo(pts[2], pts[3]);
          for (var pi = 4; pi < pts.length - 4; pi += 2) {
            var mx = (pts[pi - 2] + pts[pi]) / 2,
              my = (pts[pi - 1] + pts[pi + 1]) / 2;
            g.quadraticCurveTo(pts[pi - 2], pts[pi - 1], mx, my);
          }
          g.lineTo(wid + 90, 430);
          g.lineTo(wid + 90, 490);
          g.closePath();
          g.shadowColor = "rgba(16,34,36,.2)";
          g.shadowBlur = 10;
          g.shadowOffsetY = 5;
          g.fillStyle = z === 0 ? bg.far : z === 1 ? bg.mid : m.land;
          g.fill();
          g.shadowBlur = 0;
          g.shadowOffsetY = 0;
          g.strokeStyle = z === 2 ? m.metal : m.paper;
          g.lineWidth = k === "relief" ? 1.6 : 0.6;
          g.stroke();
          g.restore();
        } else path(g, pts, z === 0 ? bg.far : z === 1 ? bg.mid : m.land, null);
        if (k === "ceramic") {
          for (var i = 2; i < pts.length - 4; i += 2) {
            path(
              g,
              [
                pts[i],
                pts[i + 1],
                pts[i] + 45,
                pts[i + 1] + z * 8 + 18,
                pts[i + 2],
                pts[i + 3],
                pts[i + 2],
                470,
              ],
              z % 2 ? m.paper : bg.far,
              null,
            );
            g.save();
            g.globalAlpha = 0.4;
            line(
              g,
              [
                pts[i],
                pts[i + 1],
                pts[i] + 45,
                pts[i + 1] + z * 8 + 18,
                pts[i + 2],
                pts[i + 3],
              ],
              m.light,
              0.7,
            );
            g.restore();
          }
        }
      }
      if (k === "rain" || k === "print") {
        g.save();
        g.globalAlpha = 0.2;
        g.fillStyle = m.ink;
        g.font = "8px Georgia,serif";
        g.translate(ox + 140, 307);
        g.rotate(-0.11);
        g.fillText("FICTION • THE RIVER LEDGER", 0, 0);
        g.font = "6px Georgia,serif";
        [
          "Bridge recalls rain; council disputes puddles.",
          "The lost road returned before its owner.",
          "Rumour is not evidence. Ask the ferryman.",
        ].forEach(function (t, i) {
          g.fillText(t, 0, 12 + i * 10);
        });
        g.restore();
      }
      // Shared river: pigment accumulation is supplied by the host, never written to game state.
      g.fillStyle = gradient(g, 0, 414, 0, 600, [m.water, m.ink]);
      g.fillRect(0, 414, wid, 186);
      if (k === "rain") {
        g.save();
        g.globalAlpha = 0.08 + rain * 0.25;
        g.fillStyle = m.red;
        g.fillRect(0, 414, wid, 186);
        g.restore();
      }
      if (k === "relief" || k === "lacquer") {
        g.save();
        g.beginPath();
        g.moveTo(ox + 845, 421);
        g.bezierCurveTo(ox + 740, 458, ox + 845, 478, ox + 705, 503);
        g.bezierCurveTo(ox + 530, 536, ox + 478, 565, ox + 442, 622);
        g.strokeStyle = m.paper;
        g.lineWidth = k === "relief" ? 48 : 39;
        g.lineCap = "round";
        g.stroke();
        g.strokeStyle = m.red;
        g.lineWidth = k === "relief" ? 41 : 32;
        g.stroke();
        g.strokeStyle = m.metal;
        g.lineWidth = 0.7;
        g.stroke();
        g.restore();
      }
      for (var q = 0; q < 90 + detail * 100; q++) {
        var xx = r() * wid,
          yy = 421 + r() * 173;
        g.save();
        g.globalAlpha = 0.05 + r() * 0.14;
        line(
          g,
          [xx, yy, xx + 8 + r() * 60, yy],
          q % 4 ? m.paper : m.red,
          0.6 + r(),
        );
        g.restore();
      }
      // Terraces and a narrow paper road draw the eye to the traveller, then the far house.
      for (var j = 0; j < 4; j++) {
        var yy = 395 + j * 19;
        path(
          g,
          [
            -30,
            yy,
            ox + 140,
            yy - 32,
            ox + 330,
            yy - 11,
            ox + 455,
            yy + 13,
            ox + 670,
            yy - 16,
            ox + 900,
            yy - 20,
            wid + 30,
            yy - 1,
            wid + 30,
            yy + 16,
            ox + 850,
            yy + 2,
            ox + 660,
            yy + 3,
            ox + 450,
            yy + 25,
            ox + 320,
            yy + 4,
            ox + 130,
            yy - 12,
            -30,
            yy + 18,
          ],
          j % 2 ? m.mid : m.land,
          m.ink,
          k === "rain" ? 0.7 : 0.3,
        );
        if (k === "relief" || k === "lacquer") {
          line(
            g,
            [
              -30,
              yy,
              ox + 140,
              yy - 32,
              ox + 330,
              yy - 11,
              ox + 455,
              yy + 13,
              ox + 670,
              yy - 16,
              ox + 900,
              yy - 20,
              wid + 30,
              yy - 1,
            ],
            m.paper,
            2,
          );
        }
      }
      g.save();
      g.beginPath();
      g.moveTo(-20, 441);
      g.bezierCurveTo(ox + 210, 350, ox + 390, 476, ox + 570, 422);
      g.bezierCurveTo(ox + 700, 392, ox + 790, 402, wid + 20, 391);
      g.strokeStyle = m.ink;
      g.lineWidth = 16;
      g.stroke();
      g.strokeStyle = m.paper;
      g.lineWidth = 12;
      g.stroke();
      g.strokeStyle = m.light;
      g.lineWidth = 1;
      g.stroke();
      g.restore();
      tree(g, ox + 128, 386, 0.85, m, k);
      tree(g, ox + 310, 406, 0.54, m, k);
      tree(g, ox + 970, 392, 0.85, m, k);
      building(g, houseX, 397, m, k, detail);
      traveller(g, ox + 540, 429, m);
      // Original landmarks differ in construction, not just color.
      if (k === "brass") {
        pipe(
          g,
          [
            houseX + 42,
            398,
            houseX + 70,
            398,
            houseX + 70,
            352,
            houseX + 120,
            352,
          ],
          m,
          5,
        );
        gear(g, ox + 66, 535, 51, m);
        var bloom = ["#e9a5a3", "#abd3ba", "#e9cf88", "#b2c4df"];
        for (var i = 0; i < 13; i++) {
          g.save();
          g.globalAlpha = 0.18 + (1 - i / 13) * 0.12;
          g.fillStyle = bloom[i % 4];
          g.beginPath();
          g.ellipse(
            houseX + 39 + i * 9,
            229 - i * 8,
            11 + i * 2,
            8 + i * 1.5,
            -0.35,
            0,
            TAU,
          );
          g.fill();
          g.restore();
        }
        for (var i = 0; i < 5; i++) {
          var xx = houseX + 84 + i * 8,
            yy = 349 - (i % 3) * 9;
          line(g, [houseX + 89, 357, xx, yy - 8], m.mid, 1.3);
          disk(g, xx, yy - 8, 4, bloom[i % 4]);
          disk(g, xx, yy - 8, 1, m.light);
        }
      }
      if (k === "relief") {
        g.save();
        g.translate(portalX, 168);
        g.rotate(-0.2);
        g.beginPath();
        g.moveTo(0, 155);
        g.bezierCurveTo(-115, 34, -102, -92, 8, -155);
        g.bezierCurveTo(110, -58, 97, 67, 0, 155);
        g.strokeStyle = m.ink;
        g.lineWidth = 21;
        g.stroke();
        g.strokeStyle = m.metal;
        g.lineWidth = 2;
        g.stroke();
        for (var i = 0; i < 9; i++)
          line(
            g,
            [
              0,
              -130 + i * 30,
              (i < 5 ? -1 : 1) * (45 + Math.sin(i) * 12),
              -90 + i * 23,
            ],
            m.metal,
            0.8,
          );
        g.restore();
      }
      if (k === "rain") {
        g.save();
        g.globalAlpha = 0.18 + rain * 0.5;
        for (var i = 0; i < rain * 95; i++) {
          var xx = r() * wid,
            yy = r() * 420;
          line(g, [xx, yy, xx - 2, yy + 7 + r() * 10], m.red, 0.65);
        }
        g.restore();
        for (var i = 0; i < rain * 16; i++) {
          var xx = r() * wid,
            yy = 420 + r() * 170;
          var wash = g.createRadialGradient(xx, yy, 0, xx, yy, 25 + r() * 42);
          wash.addColorStop(0, "rgba(170,52,67,.10)");
          wash.addColorStop(1, "rgba(170,52,67,0)");
          g.fillStyle = wash;
          g.fillRect(xx - 70, yy - 70, 140, 140);
        }
      }
      if (k === "wave") {
        g.save();
        g.globalAlpha = 0.2;
        for (var i = -12; i < 13; i++)
          line(g, [wid / 2, 440, wid / 2 + i * 70, 600], m.metal, 1);
        for (var y = 460; y < 600; y += Math.max(7, (y - 430) * 0.15))
          line(g, [0, y, wid, y], m.metal, 0.7);
        g.restore();
      }
      // Visit-local paint marks are normalized, bounded and layered without altering the scene.
      (Array.isArray(o.paint) ? o.paint : []).slice(-180).forEach(function (p) {
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
        var xx = clamp(p.x, 0, 1) * wid,
          yy = clamp(p.y, 0, 1) * 600,
          rr = number(p.radius, 17, 2, 40);
        var b = g.createRadialGradient(xx, yy, 0, xx, yy, rr);
        b.addColorStop(0, rgba(rgb(m.red), 0.15));
        b.addColorStop(1, rgba(rgb(m.red), 0));
        g.fillStyle = b;
        g.fillRect(xx - rr, yy - rr, rr * 2, rr * 2);
      });
      if (detail > 0.05 && k !== "contrast")
        texture(P, g, k === "rain" || k === "relief" ? "fibre" : "xerox", {
          width: wid,
          height: 600,
          opacity: m.grain * detail,
          seed: seed,
        });
      if (k === "contrast") {
        g.strokeStyle = "#ffffff";
        g.lineWidth = 1;
        g.strokeRect(6, 6, wid - 12, 588);
      }
    } finally {
      g.restore();
    }
    return {
      look: P.look,
      width: W,
      height: HH,
      seed: seed,
      renderer: "canvas-2d",
      animated: false,
    };
  }
  function pen(look, opt) {
    var el = look && look.nodeType ? look : null;
    look = lookOf(look);
    var inks = palette(look, el);
    var P = {
      version: VERSION,
      look: look,
      inks: inks,
      material: Object.assign({}, MATERIALS[look], {
        sky: MATERIALS[look].sky.slice(),
      }),
    };
    P.rgb = function (n, a) {
      var c = inks[n] || rgb(n);
      if (!c) throw new TypeError("Unknown ink: " + n);
      return rgba(c, a);
    };
    P.texture = function (g, kind, o) {
      texture(P, g, kind, o);
    };
    P.band = function (g, o) {
      o = o || {};
      var W = number(o.width, g.canvas.width, 0, 8192),
        HH = number(o.height, g.canvas.height, 0, 8192);
      g.save();
      try {
        g.fillStyle = gradient(g, 0, 0, 0, HH, P.material.sky);
        g.fillRect(0, 0, W, HH);
      } finally {
        g.restore();
      }
    };
    P.sun = function (g, o) {
      o = o || {};
      var x = number(o.x, 150, -1e5, 1e5),
        y = number(o.y, 100, -1e5, 1e5),
        r = number(o.radius, 50, 0, 4096);
      g.save();
      try {
        disk(g, x, y, r, P.material.light);
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.clip();
        for (var i = 0; i < 8; i++) {
          g.fillStyle = P.material.sky[1];
          g.fillRect(x - r, y + (i * r) / 8, r * 2, 1 + i * 0.5);
        }
      } finally {
        g.restore();
      }
    };
    P.gridFloor = function (g, o) {
      o = o || {};
      var W = number(o.width, g.canvas.width, 0, 8192),
        HH = number(o.height, g.canvas.height, 0, 8192),
        y = number(o.horizon, HH * 0.6, 0, HH);
      g.save();
      try {
        for (var i = -15; i <= 15; i++)
          line(g, [W / 2, y, W / 2 + (i * W) / 12, HH], P.material.metal, 0.7);
        for (var yy = y + 4; yy < HH; yy += Math.max(4, (yy - y) * 0.18))
          line(g, [0, yy, W, yy], P.material.metal, 0.7);
      } finally {
        g.restore();
      }
    };
    P.chromeText = function (g, text, o) {
      o = o || {};
      var x = number(o.x, 0, -1e5, 1e5),
        y = number(o.y, 50, -1e5, 1e5),
        size = number(o.size, 48, 12, 300);
      g.save();
      try {
        g.font = "900 " + size + "px sans-serif";
        g.fillStyle = gradient(g, 0, y - size, 0, y, [
          P.material.light,
          P.material.mid,
          P.material.paper,
          P.material.red,
        ]);
        g.fillText(String(text).slice(0, 120), x, y);
      } finally {
        g.restore();
      }
    };
    P.misregister = function (g, text, o) {
      o = o || {};
      var x = number(o.x, 0, -1e5, 1e5),
        y = number(o.y, 40, -1e5, 1e5),
        size = number(o.size, 36, 12, 300);
      g.save();
      try {
        g.font = "700 " + size + "px serif";
        g.fillStyle = P.material.red;
        g.fillText(String(text).slice(0, 120), x - 1.5, y);
        g.fillStyle = P.material.ink;
        g.fillText(String(text).slice(0, 120), x + 1, y + 0.5);
      } finally {
        g.restore();
      }
    };
    P.scene = function (g, s, o) {
      return scene(P, g, s, o);
    };
    return P;
  }
  H.pen = pen;
  H.materials = Object.keys(MATERIALS).map(function (id) {
    return {
      id: id,
      kind: MATERIALS[id].kind,
      renderer: "canvas-2d",
      motion: false,
    };
  });
})(window, document);
