/* plan R2: paired light / sub-T worlds and exact RGB inversion.
   Optional after materials.js. Original pen scenes and simulation state stay intact. */
(function (w) {
  "use strict";
  var H = w.Hypermetapunk;
  if (!H || !H.pen || H.worlds) return;
  var TAU = Math.PI * 2,
    VERSION = "0.2.0-revamp.2";
  var WORLDS = {
    rainprint: {
      name: "The drowned edition",
      ground: "#eee6d5",
      deep: "#252e38",
      wall: "#c7beb1",
      edge: "#f9f3df",
      signal: "#b73550",
      glow: "#e5d7ac",
      kind: "paper",
    },
    schism: {
      name: "The pressure archive",
      ground: "#172f3b",
      deep: "#071a24",
      wall: "#527d81",
      edge: "#d3f3d2",
      signal: "#ffa376",
      glow: "#c4f6cb",
      kind: "machine",
    },
    steamfunk: {
      name: "The bathysphere garden",
      ground: "#163942",
      deep: "#07212d",
      wall: "#537e74",
      edge: "#edc986",
      signal: "#f2a8ad",
      glow: "#bde498",
      kind: "foundry",
    },
    raeverfaelt: {
      name: "The velvet kelp vault",
      ground: "#263c4f",
      deep: "#131e36",
      wall: "#668a83",
      edge: "#d9e5bb",
      signal: "#df8ba6",
      glow: "#b5dcab",
      kind: "felt",
    },
    strawberry: {
      name: "The lacquer spring",
      ground: "#ead9c3",
      deep: "#67494b",
      wall: "#be9084",
      edge: "#fff1cf",
      signal: "#99515c",
      glow: "#f3d6a4",
      kind: "lacquer",
    },
    dusk: {
      name: "The afterglow trench",
      ground: "#291843",
      deep: "#080d26",
      wall: "#70416e",
      edge: "#94ecda",
      signal: "#f59fca",
      glow: "#ffc797",
      kind: "wave",
    },
    zine: {
      name: "The midnight print station",
      ground: "#ede7d5",
      deep: "#333b39",
      wall: "#aab2a1",
      edge: "#fff9dd",
      signal: "#bb3d54",
      glow: "#dedbab",
      kind: "press",
    },
    contrast: {
      name: "The signal chamber",
      ground: "#000000",
      deep: "#000000",
      wall: "#222222",
      edge: "#ffffff",
      signal: "#e8ff00",
      glow: "#ffffff",
      kind: "signal",
    },
  };
  function bounded(v, f, a, b) {
    return Math.max(
      a,
      Math.min(b, typeof v === "number" && Number.isFinite(v) ? v : f),
    );
  }
  function rng(seed) {
    var n = seed >>> 0 || 17;
    return function () {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }
  function poly(g, points, fill, stroke, width) {
    g.beginPath();
    g.moveTo(points[0], points[1]);
    for (var i = 2; i < points.length; i += 2)
      g.lineTo(points[i], points[i + 1]);
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
  function line(g, points, color, width) {
    poly(g, points, null, color, width);
  }
  function oval(g, x, y, rx, ry, fill, stroke, width) {
    g.beginPath();
    g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
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
  function grad(g, x, y, x2, y2, colors) {
    var t = g.createLinearGradient(x, y, x2, y2);
    colors.forEach(function (c, i) {
      t.addColorStop(i / (colors.length - 1), c);
    });
    return t;
  }
  function glow(g, x, y, r, color, alpha) {
    g.save();
    g.globalAlpha = alpha;
    var t = g.createRadialGradient(x, y, 0, x, y, r);
    t.addColorStop(0, color);
    t.addColorStop(1, "transparent");
    g.fillStyle = t;
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.restore();
  }
  function pathCurve(g, x, y, wid, height, color, edge, width) {
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(
      x + wid * 0.23,
      y - height,
      x + wid * 0.67,
      y + height * 0.3,
      x + wid,
      y - height * 0.72,
    );
    g.strokeStyle = color;
    g.lineWidth = width;
    g.lineCap = "round";
    g.stroke();
    if (edge) {
      g.strokeStyle = edge;
      g.lineWidth = 1;
      g.stroke();
    }
  }
  function gear(g, x, y, r, fill, edge) {
    g.save();
    g.translate(x, y);
    var p = [];
    for (var i = 0; i < 64; i++) {
      var a = (i / 64) * TAU,
        rr = i % 4 < 2 ? r : r * 0.87;
      p.push(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    poly(g, p, fill, edge, 1);
    oval(g, 0, 0, r * 0.63, r * 0.63, edge);
    oval(g, 0, 0, r * 0.42, r * 0.42, fill);
    for (var k = 0; k < 6; k++) {
      var a = (k * TAU) / 6;
      line(
        g,
        [
          Math.cos(a) * r * 0.18,
          Math.sin(a) * r * 0.18,
          Math.cos(a) * r * 0.75,
          Math.sin(a) * r * 0.75,
        ],
        fill,
        r * 0.14,
      );
    }
    oval(g, 0, 0, r * 0.16, r * 0.16, edge);
    g.restore();
  }
  function circuit(g, x, y, ww, hh, color, r) {
    g.save();
    g.strokeStyle = color;
    g.lineWidth = 0.8;
    for (var i = 0; i < 7; i++) {
      var yy = y + (i * hh) / 7,
        xx = x + ww * (0.15 + r() * 0.5);
      line(g, [x, yy, xx, yy, xx + 12, yy - 12, x + ww, yy - 12], color, 0.8);
      oval(g, x + ww, yy - 12, 1.6, 1.6, color);
    }
    g.restore();
  }
  function bubble(g, x, y, r, m) {
    oval(g, x, y, r, r, null, m.edge, 0.6);
    g.save();
    g.globalAlpha = 0.55;
    oval(g, x - r * 0.28, y - r * 0.35, r * 0.19, r * 0.13, m.edge);
    g.restore();
  }
  function plankton(g, ww, hh, m, r, detail) {
    g.save();
    for (var i = 0; i < 35 + detail * 110; i++) {
      g.globalAlpha = 0.08 + r() * 0.25;
      var x = r() * ww,
        y = r() * hh;
      oval(g, x, y, 0.4 + r() * 1.4, 0.5 + r(), m.edge);
    }
    g.restore();
  }

  // Directional pile is a view treatment. Strokes only affect the local nap field.
  function felt(g, box, options, base, light, dark) {
    var r = rng(options.seed || 19),
      detail = bounded(options.detail, 0.6, 0, 1),
      nap = bounded(options.nap, 1, -1, 1);
    var strokes = Array.isArray(options.brush)
      ? options.brush
          .filter(function (p) {
            return (
              p &&
              Number.isFinite(p.x) &&
              Number.isFinite(p.y) &&
              Number.isFinite(p.direction)
            );
          })
          .slice(-64)
      : [];
    var density = Math.min(
      3500,
      Math.round(box.w * box.h * (0.025 + detail * 0.03)),
    );
    g.save();
    g.beginPath();
    g.rect(box.x, box.y, box.w, box.h);
    g.clip();
    for (var i = 0; i < density; i++) {
      var x = box.x + r() * box.w,
        y = box.y + r() * box.h,
        dir = nap;
      for (var j = 0; j < strokes.length; j++) {
        var s = strokes[j],
          dx = x - s.x * options.worldWidth,
          dy = y - s.y * 600,
          dist = Math.hypot(dx, dy),
          rad = bounded(s.radius, 55, 20, 130);
        if (dist < rad)
          dir =
            dir +
            (bounded(s.direction, 0, -1, 1) - dir) * (1 - dist / rad) * 0.96;
      }
      var wave = Math.sin(x * 0.021 + y * 0.014) * 0.2,
        lean = (dir + wave) * 2.8;
      g.globalAlpha = 0.18 + r() * 0.32;
      g.strokeStyle = dir + wave > 0.05 ? light : dark;
      g.lineWidth = 0.4 + r() * 0.65;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + lean * 0.6, y - 2.5, x + lean, y - 4 - r() * 3);
      g.stroke();
    }
    g.restore();
  }
  function feltLobe(g, x, y, rx, ry, m, opts) {
    g.save();
    g.beginPath();
    g.ellipse(x, y, rx, ry, -0.16, 0, TAU);
    g.clip();
    g.fillStyle = grad(g, x - rx, y - ry, x + rx, y + ry, [
      m.wall,
      m.ground,
      m.deep,
    ]);
    g.fillRect(x - rx * 1.3, y - ry * 1.2, rx * 2.6, ry * 2.4);
    felt(
      g,
      { x: x - rx * 1.3, y: y - ry * 1.2, w: rx * 2.6, h: ry * 2.4 },
      opts,
      m.wall,
      m.edge,
      m.deep,
    );
    g.restore();
    g.save();
    g.globalAlpha = 0.35;
    oval(g, x, y, rx * 0.92, ry * 0.94, null, m.edge, 0.8);
    g.restore();
  }
  function lacquerPod(g, x, y, rx, ry, m) {
    g.save();
    g.beginPath();
    g.ellipse(x, y, rx, ry, -0.12, 0, TAU);
    g.clip();
    g.fillStyle = grad(g, x - rx, y - ry, x + rx, y + ry, [
      m.edge,
      m.wall,
      m.signal,
      m.deep,
    ]);
    g.fillRect(x - rx * 1.2, y - ry * 1.2, rx * 2.4, ry * 2.4);
    g.globalAlpha = 0.7;
    oval(g, x - rx * 0.3, y - ry * 0.28, rx * 0.2, ry * 0.52, m.edge);
    g.restore();
    oval(g, x, y, rx, ry, null, m.deep, 0.8);
  }
  function submersible(g, x, y, m) {
    glow(g, x + 28, y, 60, m.edge, 0.15);
    g.save();
    g.translate(x, y);
    poly(g, [-34, -7, -45, -13, -43, 10, -32, 7], m.wall, m.edge, 0.8);
    oval(g, 0, 0, 31, 16, m.signal, m.edge, 1.2);
    oval(g, 8, -1, 10, 10, m.deep, m.edge, 2);
    line(g, [-12, -15, -12, -27, 0, -27], m.edge, 3);
    line(g, [-16, 18, 16, 18], m.edge, 2);
    oval(g, 31, -1, 4, 5, m.edge);
    g.restore();
  }
  function guide(g, ww, m) {
    g.save();
    g.beginPath();
    g.moveTo(-15, 523);
    g.bezierCurveTo(ww * 0.27, 465, ww * 0.48, 535, ww * 0.72, 462);
    g.bezierCurveTo(ww * 0.83, 438, ww * 0.91, 440, ww + 15, 432);
    g.strokeStyle = m.deep;
    g.lineWidth = 9;
    g.stroke();
    g.strokeStyle = m.edge;
    g.lineWidth = 2;
    g.stroke();
    g.restore();
    submersible(g, ww * 0.45, 482, m);
  }
  function surface(g, P, ww, opts) {
    var m = WORLDS[P.look],
      r = rng(87),
      detail = opts.detail;
    var focal = ww < 850 ? ww * 0.7 : (ww - 1100) / 2 + 820;
    if (P.look === "schism") {
      // Machined orbital relay and suspended data causeway, distinct from ceramic terrain.
      var x = ww * 0.23;
      poly(
        g,
        [
          x - 70,
          246,
          x - 37,
          159,
          x + 25,
          159,
          x + 70,
          235,
          x + 23,
          215,
          x - 25,
          215,
        ],
        m.deep,
        m.edge,
        1,
      );
      poly(g, [x - 37, 159, x - 9, 104, x + 25, 159], m.wall, m.signal, 1);
      for (var i = 0; i < 5; i++)
        line(g, [x - 26 + i * 12, 158, x - 26 + i * 12, 205], m.glow, 1.4);
      circuit(g, x - 57, 228, 110, 46, m.signal, r);
      line(g, [x, 106, x, 69, x + 17, 69], m.deep, 1);
      oval(g, x + 17, 69, 3, 3, m.signal);
      var tx = ww * 0.49;
      poly(
        g,
        [tx - 75, 155, tx - 13, 119, tx + 85, 132, tx + 22, 171],
        m.edge,
        m.deep,
        1,
      );
      poly(
        g,
        [
          tx - 75,
          155,
          tx - 75,
          166,
          tx + 22,
          183,
          tx + 85,
          145,
          tx + 85,
          132,
          tx + 22,
          171,
        ],
        m.wall,
        m.deep,
        1,
      );
      circuit(g, tx - 52, 146, 98, 20, m.deep, r);
      for (var j = 0; j < 4; j++)
        line(
          g,
          [tx - 20 + j * 15, 179, tx - 20 + j * 15, 222 + j * 5],
          m.signal,
          0.8,
        );
      line(g, [tx + 84, 139, focal - 35, 270], m.deep, 0.8);
      for (var k = 0; k < 3; k++) {
        var yy = 230 + k * 18;
        poly(
          g,
          [
            focal - 38,
            yy,
            focal + 20,
            yy - 12,
            focal + 40,
            yy - 4,
            focal - 17,
            yy + 9,
          ],
          k === 1 ? m.signal : m.edge,
          m.deep,
          0.8,
        );
      }
    } else if (P.look === "raeverfaelt") {
      // A plush threshold and broad pile fields replace the hard-paper reading.
      feltLobe(g, ww * 0.18, 204, ww < 850 ? 72 : 91, 156, m, opts);
      feltLobe(
        g,
        ww * 0.18 + 16,
        208,
        ww < 850 ? 43 : 56,
        114,
        { ...m, wall: m.deep, edge: m.wall },
        opts,
      );
      g.save();
      g.beginPath();
      g.moveTo(ww * 0.32, 350);
      g.bezierCurveTo(ww * 0.42, 225, ww * 0.55, 330, ww * 0.65, 270);
      g.lineTo(ww * 0.7, 377);
      g.lineTo(ww * 0.3, 377);
      g.closePath();
      g.clip();
      g.fillStyle = grad(g, ww * 0.3, 240, ww * 0.6, 380, [m.wall, m.ground]);
      g.fillRect(ww * 0.3, 220, ww * 0.4, 160);
      felt(
        g,
        { x: ww * 0.3, y: 220, w: ww * 0.4, h: 160 },
        opts,
        m.wall,
        m.edge,
        m.deep,
      );
      g.restore();
      for (var a = 0; a < 7; a++)
        line(
          g,
          [ww * 0.13 + a * 6, 360, ww * 0.12 + a * 6, 315 - a * 2],
          m.edge,
          0.6,
        );
    } else if (P.look === "strawberry") {
      // Rounded glazed root sculptures are intentionally unlike fibrous RaeverFaelt.
      for (var i = 0; i < 5; i++) {
        var x = ww * 0.12 + i * 24;
        lacquerPod(g, x, 313 - i * 8, 18 + i * 3, 60 + i * 6, m);
      }
      g.save();
      g.globalAlpha = 0.5;
      oval(g, ww * 0.38, 193, 68, 29, null, m.signal, 1.3);
      oval(g, ww * 0.38, 193, 84, 34, null, m.edge, 3);
      g.restore();
      lacquerPod(g, ww * 0.41, 320, 43, 19, m);
      lacquerPod(g, ww * 0.45, 304, 26, 12, m);
    } else if (P.look === "steamfunk") {
      var x = ww * 0.2;
      line(g, [x - 42, 345, x - 42, 183, x + 46, 183, x + 46, 242], m.deep, 12);
      line(g, [x - 42, 345, x - 42, 183, x + 46, 183, x + 46, 242], m.edge, 2);
      gear(g, x - 40, 230, 32, m.signal, m.deep);
      oval(g, x + 46, 238, 20, 43, m.wall, m.edge, 2);
      for (var i = 0; i < 13; i++) {
        var a = i * 0.45;
        oval(
          g,
          x + 46 + Math.sin(a) * 21,
          173 - i * 6,
          10 + i * 0.6,
          6 + i * 0.5,
          ["#e7cc87", "#c4dba7", "#dbb8c7"][i % 3],
        );
      }
      for (var j = 0; j < 5; j++) {
        var fx = x + Math.sin(j * 1.7) * 45,
          fy = 300 - j * 14;
        line(g, [x - 5, 347, fx, fy], m.wall, 2);
        oval(g, fx, fy, 7, 7, m.signal, m.edge, 0.7);
      }
    } else if (P.look === "rainprint") {
      g.save();
      g.globalAlpha = 0.56;
      for (var i = 0; i < 5; i++) {
        var x = ww * 0.1 + i * 20;
        poly(
          g,
          [
            x,
            155 + i * 8,
            x + 60,
            139 + i * 8,
            x + 45,
            157 + i * 8,
            x + 56,
            182 + i * 8,
            x + 4,
            181 + i * 8,
          ],
          i % 2 ? m.edge : m.wall,
          m.deep,
          0.35,
        );
      }
      g.font = "7px serif";
      g.fillStyle = m.deep;
      g.fillText("FICTION / THE RAIN RETURNS", ww * 0.11, 177);
      g.restore();
      glow(g, ww * 0.45, 557, 100, m.signal, 0.25 + opts.rain * 0.25);
    } else if (P.look === "zine") {
      for (var i = 0; i < 4; i++) {
        var x = ww * 0.12 + i * 28;
        poly(
          g,
          [x, 200, x + 24, 190, x + 24, 311, x, 320],
          i % 2 ? m.deep : m.edge,
          m.deep,
          1,
        );
        for (var j = 0; j < 14; j++)
          line(
            g,
            [x + 3, 210 + j * 6, x + 20, 207 + j * 6],
            i % 2 ? m.edge : m.deep,
            0.5,
          );
      }
      g.font = "700 13px monospace";
      g.fillStyle = m.deep;
      g.fillText("LOW TIDE", ww * 0.12, 186);
    } else if (P.look === "contrast") {
      for (var i = 0; i < 4; i++)
        poly(
          g,
          [
            ww * 0.15 + i * 7,
            300,
            ww * 0.15 + i * 7,
            180 + i * 8,
            ww * 0.35 - i * 7,
            180 + i * 8,
            ww * 0.35 - i * 7,
            300,
          ],
          null,
          m.edge,
          1.5,
        );
      oval(g, ww * 0.25, 239, 11, 11, m.signal);
    }
  }
  function paperVault(g, ww, m, opts) {
    var r = rng(51);
    g.fillStyle = grad(g, 0, 0, 0, 600, [m.ground, m.wall, m.deep]);
    g.fillRect(0, 0, ww, 600);
    for (var z = 0; z < 5; z++) {
      var xx = ww * 0.08 + z * ww * 0.18,
        top = 55 + r() * 75;
      poly(
        g,
        [
          xx - 35,
          -10,
          xx + 35,
          -10,
          xx + 25,
          top + 95,
          xx + 5,
          top + 61,
          xx - 10,
          top + 110,
          xx - 26,
          top + 70,
        ],
        z % 2 ? m.wall : m.edge,
        m.deep,
        0.5,
      );
    }
    for (var side = 0; side < 2; side++) {
      var x = side ? ww - 110 : 0;
      poly(
        g,
        [
          x,
          150,
          x + 87,
          125,
          x + 110,
          170,
          x + 78,
          228,
          x + 104,
          290,
          x + 77,
          352,
          x + 110,
          440,
          x,
          480,
        ],
        m.edge,
        m.deep,
        0.7,
      );
      g.save();
      g.beginPath();
      g.rect(x + 10, 166, 66, 221);
      g.clip();
      g.fillStyle = m.deep;
      g.globalAlpha = 0.35;
      g.font = "8px serif";
      for (var i = 0; i < 18; i++)
        g.fillText(
          i % 3
            ? "Rain remembers what print forgets."
            : "FICTION / RIVER LEDGER",
          x + 12,
          180 + i * 11,
        );
      g.restore();
    }
    var x = ww * 0.65;
    glow(g, x, 330, 180, m.edge, 0.45);
    poly(
      g,
      [
        x - 76,
        452,
        x - 62,
        252,
        x - 21,
        210,
        x + 41,
        222,
        x + 79,
        277,
        x + 67,
        452,
      ],
      m.deep,
      m.edge,
      2,
    );
    for (var i = 0; i < 22; i++) {
      var xx = ww * 0.32 + r() * ww * 0.4,
        yy = 360 + r() * 220;
      glow(g, xx, yy, 15 + r() * 36, m.signal, 0.08 + opts.rain * 0.14);
    }
    pathCurve(g, ww * 0.12, 568, ww * 0.67, 90, m.signal, m.edge, 18);
    H.pen("rainprint").texture(g, "fibre", {
      width: ww,
      height: 600,
      seed: 33,
      opacity: 0.09 + opts.detail * 0.05,
    });
  }
  function machineVault(g, ww, m, opts) {
    g.fillStyle = grad(g, 0, 0, ww, 600, [m.deep, m.ground, m.wall]);
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.64;
    for (var i = 5; i >= 0; i--) {
      var rx = 50 + i * 21,
        top = 130 - i * 16,
        bottom = 430 + i * 11;
      poly(
        g,
        [
          cx - rx,
          bottom,
          cx - rx,
          top + 40,
          cx - rx + 35,
          top,
          cx + rx - 35,
          top,
          cx + rx,
          top + 40,
          cx + rx,
          bottom,
        ],
        null,
        i % 2 ? m.wall : m.edge,
        i === 5 ? 9 : 1.2,
      );
    }
    poly(
      g,
      [
        cx - 31,
        218,
        cx + 31,
        218,
        cx + 49,
        247,
        cx + 49,
        382,
        cx - 49,
        382,
        cx - 49,
        247,
      ],
      m.deep,
      m.signal,
      2,
    );
    for (var j = 0; j < 9; j++)
      line(
        g,
        [cx - 24, 246 + j * 13, cx + 24, 246 + j * 13],
        j === 4 ? m.signal : m.glow,
        j === 4 ? 4 : 1,
      );
    var r = rng(71);
    for (var i = 0; i < 4; i++) {
      var x = ww * 0.08 + i * ww * 0.12;
      poly(g, [x, 40, x + 36, 26, x + 45, 331, x + 10, 357], m.wall, m.edge, 1);
      circuit(g, x + 8, 85, 23, 140, m.signal, r);
      line(g, [x + 9, 358, x + 24, 392, cx - 65, 392], m.wall, 2);
    }
    for (var side = 0; side < 2; side++) {
      var x = side ? ww - 20 : 20;
      line(
        g,
        [
          x,
          0,
          x,
          91,
          side ? cx + 75 : cx - 75,
          91,
          side ? cx + 75 : cx - 75,
          129,
        ],
        m.signal,
        2,
      );
    }
    glow(g, cx, 300, 150, m.glow, 0.12);
    for (var i = 0; i < 7; i++) {
      var x = ww * 0.12 + i * ww * 0.13;
      poly(
        g,
        [x, 579, x + 13, 546, x + 39, 541, x + 51, 579],
        m.deep,
        m.edge,
        0.7,
      );
    }
  }
  function foundryVault(g, ww, m, opts) {
    g.fillStyle = grad(g, 0, 0, 0, 600, [m.deep, m.ground, m.wall]);
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.62,
      rx = Math.min(190, ww * 0.29);
    glow(g, cx, 300, rx * 1.4, m.glow, 0.19);
    oval(g, cx, 301, rx, rx * 0.86, m.deep, m.edge, 9);
    oval(g, cx, 301, rx - 13, rx * 0.86 - 13, m.ground, m.signal, 1.5);
    for (var i = 0; i < 20; i++) {
      var a = (i / 20) * TAU;
      oval(
        g,
        cx + Math.cos(a) * rx,
        301 + Math.sin(a) * rx * 0.86,
        3,
        3,
        m.deep,
      );
    }
    for (var k = -2; k <= 2; k++)
      pathCurve(
        g,
        cx - rx * 0.8,
        357 + k * 17,
        rx * 1.6,
        40,
        m.wall,
        m.edge,
        2,
      );
    for (var j = 0; j < 8; j++) {
      var x = cx - rx * 0.6 + j * rx * 0.17,
        y = 330 - Math.sin(j * 0.7) * 60;
      line(g, [x, 401, x - 9, y], m.wall, 4);
      oval(g, x - 9, y, 10, 15, j % 2 ? m.signal : m.glow, m.edge, 0.8);
      oval(g, x - 9, y, 3, 6, m.edge);
    }
    for (var side = 0; side < 2; side++) {
      var x = side ? ww - 36 : 40;
      line(
        g,
        [x, 0, x, 153, x + (side ? -58 : 58), 153, x + (side ? -58 : 58), 441],
        m.deep,
        23,
      );
      line(
        g,
        [x, 0, x, 153, x + (side ? -58 : 58), 153, x + (side ? -58 : 58), 441],
        m.edge,
        4,
      );
      gear(g, x, 154, 38, m.signal, m.deep);
    }
    for (var i = 0; i < 18; i++) {
      var x = ww * 0.25 + Math.sin(i * 0.55) * 20,
        y = 360 - i * 15;
      bubble(g, x, y, 4 + i * 0.6, m);
    }
    gear(g, ww * 0.17, 557, 42, m.edge, m.deep);
  }
  function feltVault(g, ww, m, opts) {
    g.fillStyle = grad(g, 0, 0, ww, 600, [m.deep, m.ground, m.wall]);
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.66;
    for (var i = 3; i >= 0; i--) {
      feltLobe(
        g,
        ww * 0.13 - i * 18,
        305,
        ww * 0.17 - i * 13,
        370 - i * 19,
        m,
        { ...opts, seed: 31 + i },
      );
      feltLobe(
        g,
        ww * 0.91 + i * 22,
        270,
        ww * 0.14 - i * 8,
        335 - i * 18,
        { ...m, wall: i % 2 ? m.wall : m.ground },
        { ...opts, seed: 42 + i },
      );
    }
    for (var i = 0; i < 5; i++)
      feltLobe(
        g,
        ww * 0.25 + i * ww * 0.13,
        -12,
        ww * 0.1,
        165 - (i % 3) * 25,
        m,
        { ...opts, seed: 56 + i },
      );
    glow(g, cx, 310, 150, m.glow, 0.21);
    oval(g, cx, 305, 70, 137, m.deep, m.wall, 8);
    oval(g, cx, 305, 54, 116, null, m.edge, 1);
    pathCurve(g, cx - 22, 425, -ww * 0.31, -100, m.signal, m.edge, 25);
    for (var j = 0; j < 7; j++) {
      var x = ww * 0.29 + j * ww * 0.055,
        y = 348 + Math.sin(j) * 36;
      pathCurve(g, x, 468, Math.sin(j * 1.6) * 25, 90, m.wall, m.edge, 4);
      feltLobe(
        g,
        x + Math.sin(j * 1.6) * 25,
        y,
        12 + (j % 3) * 4,
        23 + (j % 2) * 8,
        { ...m, wall: m.glow, edge: m.edge },
        { ...opts, seed: 90 + j },
      );
    }
  }
  function lacquerVault(g, ww, m, opts) {
    g.fillStyle = grad(g, 0, 0, 0, 600, [m.edge, m.ground, m.wall]);
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.65;
    for (var i = 0; i < 5; i++) {
      var x = ww * 0.07 + i * ww * 0.22;
      lacquerPod(g, x, -5, ww * 0.12, 125 + (i % 2) * 40, m);
    }
    for (var i = 4; i >= 0; i--) {
      oval(
        g,
        cx,
        324,
        74 + i * 25,
        126 + i * 20,
        i % 2 ? m.ground : m.wall,
        m.edge,
        2,
      );
    }
    oval(g, cx, 327, 49, 107, m.deep, m.signal, 3);
    oval(g, cx - 17, 292, 4, 13, m.edge);
    for (var i = 0; i < 7; i++) {
      var x = ww * 0.08 + i * ww * 0.14,
        y = 492 + (i % 2) * 37;
      lacquerPod(g, x, y, 39, 14, m);
      oval(g, x - 5, y - 2, 22, 4, m.deep);
    }
    for (var i = 0; i < 4; i++) {
      var x = ww * 0.12 + i * 21;
      lacquerPod(g, x, 321 + i * 12, 19, 69 - i * 7, m);
    }
    g.save();
    g.globalAlpha = 0.55;
    for (var i = 0; i < 14; i++)
      line(
        g,
        [ww * 0.1 + i * ww * 0.055, 565, ww * 0.1 + i * ww * 0.055 + 30, 558],
        m.edge,
        1,
      );
    g.restore();
  }
  function waveVault(g, ww, m, opts) {
    g.fillStyle = grad(g, 0, 0, 0, 600, [m.deep, m.ground, m.wall]);
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.65;
    for (var i = 0; i < 6; i++) {
      var x = ww * 0.04 + i * ww * 0.2;
      poly(
        g,
        [
          x - 65,
          -20,
          x + 62,
          -20,
          x + 24,
          180 + (i % 3) * 30,
          x,
          134,
          x - 23,
          223,
        ],
        i % 2 ? m.ground : m.wall,
        m.signal,
        0.5,
      );
    }
    oval(g, cx, 264, 91, 91, m.signal);
    g.save();
    g.beginPath();
    g.arc(cx, 264, 91, 0, TAU);
    g.clip();
    for (var i = 0; i < 11; i++) {
      g.fillStyle = m.ground;
      g.fillRect(cx - 95, 260 + i * 9, 190, 3 + i * 0.4);
    }
    g.restore();
    poly(
      g,
      [cx - 83, 448, cx - 83, 340, cx, 288, cx + 83, 340, cx + 83, 448],
      m.deep,
      m.edge,
      1.4,
    );
    for (var j = 0; j < 6; j++)
      poly(
        g,
        [
          cx - 70 + j * 10,
          448,
          cx - 70 + j * 10,
          349 + j * 3,
          cx,
          305 + j * 7,
          cx + 70 - j * 10,
          349 + j * 3,
          cx + 70 - j * 10,
          448,
        ],
        null,
        j % 2 ? m.signal : m.edge,
        0.7,
      );
    for (var i = -12; i <= 12; i++)
      line(g, [cx, 443, cx + i * ww * 0.12, 600], m.edge, 0.4);
    for (var y = 451; y < 600; y += Math.max(6, (y - 443) * 0.2))
      line(g, [0, y, ww, y], m.signal, 0.5);
  }
  function pressVault(g, ww, m, opts) {
    g.fillStyle = m.ground;
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.66;
    for (var i = 0; i < 6; i++) {
      var x = i * ww * 0.21 - 40;
      poly(
        g,
        [x, 0, x + 74, 0, x + 99, 219, x + 49, 191, x + 29, 244],
        i % 2 ? m.wall : m.deep,
      );
    }
    for (var i = 4; i >= 0; i--)
      poly(
        g,
        [
          cx - 52 - i * 28,
          459,
          cx - 52 - i * 28,
          170 - i * 15,
          cx + 52 + i * 28,
          170 - i * 15,
          cx + 52 + i * 28,
          459,
        ],
        null,
        i % 2 ? m.deep : m.wall,
        9,
      );
    poly(g, [cx - 40, 241, cx + 40, 241, cx + 40, 423, cx - 40, 423], m.deep);
    g.font = "700 13px monospace";
    g.fillStyle = m.deep;
    g.fillText("FICTION / NIGHT PRESS", ww * 0.07, 306);
    for (var i = 0; i < 24; i++) {
      var x = ww * 0.08 + i * ww * 0.034;
      line(g, [x, 351, x + 12, 351], m.deep, 1);
    }
    for (var i = 0; i < 12; i++)
      line(g, [ww * 0.04, 374 + i * 5, ww * 0.31, 374 + i * 5], m.wall, 0.8);
    H.pen("zine").texture(g, "halftone", {
      width: ww,
      height: 600,
      gap: 8,
      opacity: 0.14,
    });
  }
  function signalVault(g, ww, m, opts) {
    g.fillStyle = m.deep;
    g.fillRect(0, 0, ww, 600);
    var cx = ww * 0.65;
    for (var i = 0; i < 5; i++) {
      var rx = 66 + i * 31,
        top = 156 - i * 21;
      poly(
        g,
        [
          cx - rx,
          457,
          cx - rx,
          top + 35,
          cx - rx + 35,
          top,
          cx + rx - 35,
          top,
          cx + rx,
          top + 35,
          cx + rx,
          457,
        ],
        null,
        m.edge,
        i === 4 ? 4 : 1,
      );
    }
    oval(g, cx, 309, 28, 28, m.signal);
    oval(g, cx, 309, 14, 14, m.deep);
    for (var i = 0; i < 13; i++) {
      var y = 100 + i * 29;
      line(g, [30, y, i % 3 ? 43 : 57, y], m.edge, 1.5);
    }
    for (var i = 0; i < 4; i++)
      line(g, [0, 19 + i * 13, ww, 19 + i * 13], m.edge, i === 0 ? 4 : 1);
  }
  var RENDERERS = {
    rainprint: paperVault,
    schism: machineVault,
    steamfunk: foundryVault,
    raeverfaelt: feltVault,
    strawberry: lacquerVault,
    dusk: waveVault,
    zine: pressVault,
    contrast: signalVault,
  };
  function invert(g, options) {
    options = options || {};
    var width = Math.floor(
        bounded(options.width, g.canvas.width, 1, g.canvas.width),
      ),
      height = Math.floor(
        bounded(options.height, g.canvas.height, 1, g.canvas.height),
      );
    var pixels = g.getImageData(0, 0, width, height),
      data = pixels.data;
    for (var i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    // Pixel replacement is expressed in device coordinates, even on Canvas
    // backends that incorrectly apply the host transform to putImageData.
    g.save();
    try {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      g.putImageData(pixels, 0, 0);
    } finally {
      g.restore();
    }
    return {
      width: width,
      height: height,
      operation: "rgb-complement",
      alpha: "preserved",
    };
  }
  function draw(g, state, options) {
    state = state || {};
    options = options || {};
    var look = Object.prototype.hasOwnProperty.call(WORLDS, options.look)
      ? options.look
      : H.theme.get();
    if (!Object.prototype.hasOwnProperty.call(WORLDS, look)) look = "dusk";
    var width = Math.floor(bounded(options.width, g.canvas.width, 1, 8192)),
      height = Math.floor(bounded(options.height, g.canvas.height, 1, 8192));
    var ww = (width / height) * 600,
      layer = options.layer === "subterrain" ? "subterrain" : "surface";
    var opts = {
      ...options,
      worldWidth: ww,
      detail: bounded(options.detail, 0.6, 0, 1),
      rain: bounded(options.rain, 0.4, 0, 1),
      seed: bounded(state.seed, 1947, 0, 4294967295),
    };
    var P = H.pen(look),
      m = WORLDS[look];
    g.save();
    try {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      g.beginPath();
      g.rect(0, 0, width, height);
      g.clip();
      if (layer === "surface")
        P.scene(g, state, { ...opts, width: width, height: height });
      g.scale(height / 600, height / 600);
      if (layer === "surface") surface(g, P, ww, opts);
      else {
        RENDERERS[look](g, ww, m, opts);
        if (look !== "contrast")
          plankton(g, ww, 600, m, rng(opts.seed), opts.detail);
        guide(g, ww, m);
        if (Array.isArray(options.paint)) {
          options.paint.slice(-180).forEach(function (mark) {
            if (!mark || !Number.isFinite(mark.x) || !Number.isFinite(mark.y))
              return;
            glow(
              g,
              bounded(mark.x, 0, 0, 1) * ww,
              bounded(mark.y, 0, 0, 1) * 600,
              bounded(mark.radius, 17, 2, 80),
              m.signal,
              0.35,
            );
          });
        }
      }
      if (options.invert) {
        // These scenes are opaque. White difference is exact RGB complement and
        // respects the host clip, unlike putImageData (used by standalone invert).
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "difference";
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, width, height);
      }
    } finally {
      g.restore();
    }
    return {
      version: VERSION,
      look: look,
      layer: layer,
      name: layer === "surface" ? "The light above" : m.name,
      width: width,
      height: height,
      inverted: !!options.invert,
      renderer: "canvas-2d",
      animated: false,
    };
  }
  H.worlds = {
    version: VERSION,
    draw: draw,
    invert: invert,
    list: Object.keys(WORLDS).map(function (id) {
      return { id: id, name: WORLDS[id].name, material: WORLDS[id].kind };
    }),
  };
})(window);
