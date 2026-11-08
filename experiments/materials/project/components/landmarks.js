/* plan R3: draw-only material geometry for projected game landmarks.
   Optional after materials.js. The host owns camera, physics, time and inputs. */
(function (w) {
  "use strict";
  const H = w.Hypermetapunk;
  if (!H?.pen || H.landmarks) return;
  const TAU = Math.PI * 2;
  const finite = (v, fallback, lo, hi) =>
    Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : fallback));
  const hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  };
  const mix = (a, b, t) =>
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - t) +
            parseInt(b.slice(i, i + 2), 16) * t,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  const materials = Object.fromEntries(
    H.materials.map(({ id }) => [id, H.pen(id).material]),
  );
  function resolved(look) {
    return Object.hasOwn(materials, look) ? look : "raeverfaelt";
  }
  function palette(look, layer = "surface") {
    const m = materials[resolved(look)],
      sub = layer === "subterrain";
    // Construct every host palette from the kit's material definition, never a copied UI theme.
    return {
      sky: sub
        ? [
            mix(m.ink, "#081c29", 0.65),
            mix(m.land, "#081c29", 0.5),
            m.mid,
            m.water,
          ]
        : [...m.sky, m.light],
      water: sub
        ? [m.water, mix(m.land, "#0b2633", 0.5), mix(m.ink, "#0b2633", 0.5)]
        : [m.water, mix(m.water, m.land, 0.45), m.ink],
      route: [mix(m.red, m.paper, 0.34), mix(m.red, m.ink, 0.18)],
      rim: m.paper,
      land: [m.paper, m.far, m.mid, m.land],
      ink: m.ink,
      light: m.light,
      accent: m.metal,
      mist: m.sky[1],
    };
  }
  function helpers(g) {
    const line = (p, c, width = 0.006) => {
      g.beginPath();
      p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = c;
      g.lineWidth = width;
      g.stroke();
    };
    const poly = (p, c, stroke, width = 0.006) => {
      g.beginPath();
      p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = c;
      g.fill();
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = width;
        g.stroke();
      }
    };
    const oval = (x, y, rx, ry, c, rotate = 0) => {
      g.beginPath();
      g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rotate, 0, TAU);
      g.fillStyle = c;
      g.fill();
    };
    const leaf = (x, y, size, c, angle = 0) => {
      g.save();
      g.translate(x, y);
      g.rotate(angle);
      g.beginPath();
      g.moveTo(0, 0);
      g.bezierCurveTo(-size * 0.7, -size * 0.3, -size * 0.3, -size, 0, -size);
      g.bezierCurveTo(size * 0.65, -size * 0.7, size * 0.4, -size * 0.2, 0, 0);
      g.fillStyle = c;
      g.fill();
      g.restore();
    };
    return { line, poly, oval, leaf };
  }
  function felt(g, m, h, o) {
    const { oval, line, leaf } = h,
      nap = o.nap;
    for (let tier = 3; tier >= 0; tier--) {
      const x = Math.sin(tier + o.seed) * 0.09,
        y = -0.08 - tier * 0.1;
      oval(
        x,
        y,
        0.47 - tier * 0.06,
        0.15,
        [m.paper, m.far, m.mid, m.land][tier],
      );
      // Pile is directional, and its highlight flips with the nap control.
      for (let j = 0; j < 48; j++) {
        const xx =
            x + (hash(j + tier * 47 + o.seed) - 0.5) * (0.88 - tier * 0.1),
          yy = y + (hash(j + 973 + tier) - 0.5) * 0.19;
        line(
          [
            [xx, yy],
            [xx + nap * 0.035, yy - 0.026],
          ],
          j % 3 ? mix(m.paper, m.mid, nap > 0 ? 0.22 : 0.72) : m.metal,
          0.002,
        );
      }
    }
    leaf(0.12, -0.2, 0.81, m.mid, 0.29);
    leaf(0.12, -0.2, 0.68, mix(m.paper, m.mid, 0.38), 0.29);
    line(
      [
        [0.12, -0.2],
        [0.3, -0.83],
      ],
      m.metal,
      0.008,
    );
    for (let j = 0; j < 9; j++)
      line(
        [
          [0.14 + j * 0.016, -0.26 - j * 0.056],
          [0.03 + j * 0.035, -0.31 - j * 0.056],
        ],
        m.metal,
        0.003,
      );
    if (o.sub)
      for (let j = 0; j < 3; j++)
        leaf(-0.38 + j * 0.15, 0.02, 0.4 + j * 0.06, m.water, -0.25 + j * 0.15);
  }
  function schism(g, m, { poly, line, oval }, o) {
    for (let j = 0; j < 3; j++) {
      const x = (j - 1) * 0.25,
        height = 0.45 + hash(o.seed + j) * 0.45;
      poly(
        [
          [x - 0.1, 0],
          [x - 0.13, -height * 0.75],
          [x + 0.01, -height],
          [x + 0.14, -height * 0.72],
          [x + 0.11, -0.02],
        ],
        m.paper,
        m.metal,
      );
      poly(
        [
          [x + 0.01, -height],
          [x + 0.14, -height * 0.72],
          [x + 0.11, -0.02],
          [x + 0.025, -0.04],
        ],
        m.land,
      );
      // Lit bus traces, ceramic fractures, floating processors: future tech, not just spires.
      for (let k = 0; k < 4; k++) {
        const y = -0.1 - k * height * 0.15;
        line(
          [
            [x - 0.08, y],
            [x - 0.015, y],
            [x + 0.02, y - 0.045],
            [x + 0.07, y - 0.045],
          ],
          m.land,
          0.007,
        );
        oval(x + 0.07, y - 0.045, 0.009, 0.009, m.red);
      }
      line(
        [
          [x - 0.1, -height * 0.5],
          [x + 0.01, -height * 0.43],
          [x + 0.08, -height * 0.56],
        ],
        m.metal,
        0.01,
      );
      poly(
        [
          [x - 0.055, -height - 0.13],
          [x + 0.025, -height - 0.17],
          [x + 0.075, -height - 0.09],
          [x - 0.005, -height - 0.05],
        ],
        m.land,
        m.metal,
      );
    }
    g.beginPath();
    g.ellipse(0, -0.55, 0.5, 0.19, -0.32, 0.12, TAU - 0.5);
    g.strokeStyle = m.light;
    g.lineWidth = 0.016;
    g.stroke();
    if (o.sub) {
      line(
        [
          [-0.46, 0.06],
          [-0.46, -0.74],
          [-0.3, -0.9],
        ],
        m.metal,
        0.035,
      );
      oval(-0.3, -0.9, 0.055, 0.055, m.light);
    }
  }
  function steam(g, m, { poly, line, oval, leaf }, o) {
    poly(
      [
        [-0.37, 0],
        [-0.37, -0.52],
        [-0.27, -0.62],
        [-0.02, -0.62],
        [0.08, -0.51],
        [0.08, 0],
      ],
      m.metal,
      m.ink,
    );
    poly(
      [
        [-0.03, -0.6],
        [0.08, -0.51],
        [0.08, 0],
        [-0.03, 0],
      ],
      m.land,
    );
    oval(-0.15, -0.33, 0.15, 0.15, m.ink);
    oval(-0.15, -0.33, 0.12, 0.12, m.paper);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      line(
        [
          [-0.15, -0.33],
          [-0.15 + Math.cos(a) * 0.12, -0.33 + Math.sin(a) * 0.12],
        ],
        m.metal,
        0.018,
      );
    }
    line(
      [
        [0.02, -0.22],
        [0.25, -0.22],
        [0.25, -0.7],
      ],
      m.ink,
      0.075,
    );
    line(
      [
        [0.02, -0.22],
        [0.25, -0.22],
        [0.25, -0.7],
      ],
      m.metal,
      0.048,
    );
    // Fictional living plumes form foliage, never a dystopian smoke overlay.
    for (let k = 0; k < 5; k++) {
      const x = 0.25 + Math.sin(o.time * 0.4 + k) * 0.035,
        y = -0.7 - k * 0.085;
      oval(
        x,
        y,
        0.07 + k * 0.018,
        0.09,
        ["#da9eaa", "#a9cba0", "#e8ca7d", "#acd6c5", "#b3b9d7"][k],
      );
      leaf(x, y, 0.09, m.light, 0.8);
    }
    for (let j = 0; j < 3; j++) {
      const x = 0.23 + j * 0.12,
        y = -0.18 - (j % 2) * 0.13;
      line(
        [
          [x, 0.03],
          [x, y],
        ],
        m.mid,
        0.015,
      );
      for (let k = 0; k < 5; k++)
        oval(
          x + Math.cos((k * TAU) / 5) * 0.045,
          y + Math.sin((k * TAU) / 5) * 0.045,
          0.043,
          0.025,
          [m.light, "#e8a5b6", "#a4d5c2"][j],
          k,
        );
      oval(x, y, 0.024, 0.024, m.metal);
    }
  }
  function lacquer(g, m, { oval, line, leaf }, o) {
    for (let j = 0; j < 4; j++) {
      const x = (j - 1.5) * 0.21,
        height = 0.33 + hash(o.seed + j) * 0.42;
      g.beginPath();
      g.moveTo(x, 0.04);
      g.bezierCurveTo(x - 0.17, -0.19, x + 0.19, -height * 0.56, x, -height);
      g.strokeStyle = m.red;
      g.lineWidth = 0.15;
      g.lineCap = "round";
      g.stroke();
      g.strokeStyle = m.paper;
      g.lineWidth = 0.05;
      g.stroke();
      oval(x, -height, 0.19, 0.12, j % 2 ? m.mid : m.red, -0.15);
      oval(x - 0.045, -height - 0.045, 0.07, 0.018, m.light, -0.18);
      for (let k = 0; k < 4; k++)
        oval(x + (k - 1.5) * 0.045, -height + 0.02, 0.007, 0.013, m.metal, 0.3);
      leaf(x + 0.08, -height - 0.06, 0.15, m.mid, 0.8);
    }
    line(
      [
        [-0.45, 0.03],
        [-0.22, -0.035],
        [0.08, 0.025],
        [0.44, -0.04],
      ],
      m.metal,
      0.009,
    );
  }
  function paper(g, m, { poly, line, oval }, o) {
    for (let j = 0; j < 5; j++) {
      const y = -0.08 - j * 0.095,
        shift = Math.sin(j + o.seed) * 0.06;
      poly(
        [
          [-0.45 + shift, y],
          [-0.27 + shift, y - 0.14],
          [0.28, y - 0.1],
          [0.45, y + 0.04],
          [0.2, y + 0.12],
        ],
        j % 2 ? m.paper : m.far,
        m.mid,
        0.003,
      );
      for (let k = 0; k < 5; k++)
        line(
          [
            [-0.23 + shift, y - 0.07 + k * 0.015],
            [0.14 + shift, y - 0.05 + k * 0.015],
          ],
          m.ink + "55",
          0.003,
        );
    }
    g.font = "bold .055px Georgia";
    g.fillStyle = m.ink;
    g.fillText("TIDE / FICTION", -0.23, -0.53);
    for (let j = 0; j < 10; j++) {
      const x = (hash(o.seed + j) - 0.5) * 0.8,
        y = -0.06 - hash(j + 44) * 0.5;
      oval(x, y, 0.04 + hash(j + 33) * 0.04, 0.018, m.red + "65", 0.3);
    }
    if (o.sub)
      for (let j = 0; j < 3; j++)
        poly(
          [
            [-0.3 + j * 0.2, -0.4],
            [-0.38 + j * 0.2, -0.82],
            [-0.19 + j * 0.2, -0.7],
          ],
          m.paper,
          m.mid,
        );
  }
  function zine(g, m, { poly, line, oval }) {
    poly(
      [
        [-0.4, 0],
        [-0.4, -0.65],
        [0.3, -0.65],
        [0.4, -0.55],
        [0.4, 0],
      ],
      m.paper,
      m.ink,
      0.018,
    );
    poly(
      [
        [0.16, -0.65],
        [0.3, -0.65],
        [0.4, -0.55],
        [0.4, 0],
        [0.16, 0],
      ],
      m.ink,
    );
    for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++)
        oval(
          -0.35 + x * 0.055,
          -0.59 + y * 0.05,
          0.007 + (y % 3) * 0.002,
          0.007,
          m.ink,
        );
    line(
      [
        [-0.34, -0.14],
        [0.09, -0.14],
      ],
      m.red,
      0.04,
    );
    g.save();
    g.translate(-0.17, -0.76);
    g.rotate(-0.09);
    g.fillStyle = m.red;
    g.fillRect(-0.22, -0.1, 0.44, 0.19);
    g.fillStyle = m.light;
    g.font = "bold .085px monospace";
    g.fillText("OVERPRINT", -0.215, 0.018);
    g.restore();
  }
  function dusk(g, m, { poly, line, oval }, o) {
    for (let j = 0; j < 3; j++) {
      const x = (j - 1) * 0.29,
        h = 0.37 + j * 0.14;
      poly(
        [
          [x - 0.1, 0.04],
          [x - 0.1, -h],
          [x + 0.08, -h - 0.08],
          [x + 0.14, -h],
          [x + 0.14, 0],
        ],
        j % 2 ? m.mid : m.land,
        m.red,
      );
      for (let k = 1; k < 5; k++)
        line(
          [
            [x - 0.08, (-k * h) / 5],
            [x + 0.1, (-k * h) / 5],
          ],
          m.metal,
          0.006,
        );
    }
    g.beginPath();
    g.ellipse(0, -0.79, 0.32, 0.16, -0.35, 0, TAU);
    g.strokeStyle = m.metal;
    g.lineWidth = 0.035;
    g.stroke();
    oval(0, -0.79, 0.11, 0.11, m.red);
    line(
      [
        [-0.5, 0.07],
        [0.5, 0.07],
      ],
      m.light,
      0.012,
    );
  }
  function signal(g, m, { poly, line, oval }) {
    poly(
      [
        [-0.4, 0],
        [-0.4, -0.7],
        [-0.18, -0.9],
        [0.35, -0.9],
        [0.4, -0.1],
      ],
      m.paper,
      m.ink,
      0.024,
    );
    for (let j = 0; j < 6; j++)
      line(
        [
          [-0.34 + j * 0.12, -0.05],
          [-0.34 + j * 0.12, -0.67],
        ],
        m.ink,
        0.008,
      );
    g.fillStyle = m.red;
    g.fillRect(-0.2, -0.65, 0.43, 0.13);
    oval(0.1, -0.78, 0.06, 0.06, m.ink);
    line(
      [
        [-0.49, 0.05],
        [-0.49, -0.35],
        [-0.57, -0.42],
      ],
      m.ink,
      0.02,
    );
  }
  const painters = {
    raeverfaelt: felt,
    schism,
    steamfunk: steam,
    strawberry: lacquer,
    rainprint: paper,
    zine,
    dusk,
    contrast: signal,
  };
  function draw(g, options = {}) {
    if (!g?.canvas) throw new TypeError("A Canvas 2D context is required");
    const look = resolved(options.look),
      m = materials[look],
      size = finite(options.size, 100, 0.1, 3000);
    const o = {
      seed: finite(options.seed, 17, -1e6, 1e6),
      time: options.still ? 0 : finite(options.time, 0, -1e9, 1e9),
      nap: finite(options.nap, 1, -1, 1),
      sub: options.layer === "subterrain",
    };
    g.save();
    try {
      g.translate(
        finite(options.x, 0, -1e6, 1e6),
        finite(options.y, 0, -1e6, 1e6),
      );
      g.scale(size, size);
      painters[look](g, m, helpers(g), o);
    } finally {
      g.restore();
    }
    return { look, layer: o.sub ? "subterrain" : "surface", animated: false };
  }
  function horizon(g, { look, layer, width, height, time = 0, still = false }) {
    look = resolved(look);
    const m = materials[look],
      sub = layer === "subterrain",
      W = finite(width, g.canvas.width, 1, 16384),
      T = finite(height, g.canvas.height, 1, 16384);
    g.save();
    try {
      g.beginPath();
      g.rect(0, 0, W, T * 0.49);
      g.clip();
      const h = helpers(g),
        x = W * 0.73,
        y = T * 0.19,
        r = Math.min(W, T) * 0.09;
      if (sub) {
        // A distinct ceiling, leaving the middle of the navigable course clear.
        const p = [
          [0, 0],
          [W, 0],
        ];
        for (let i = 14; i >= 0; i--)
          p.push([(W * i) / 14, T * (0.055 + hash(i + 42) * 0.07)]);
        h.poly(p, m.land);
        for (let i = 0; i < 9; i++) {
          const xx = ((i + 0.5) / 9) * W,
            yy = T * 0.07;
          if (look === "schism" || look === "contrast") {
            h.line(
              [
                [xx, 0],
                [xx, yy + T * 0.08],
              ],
              m.metal,
              2,
            );
            h.oval(xx, yy + T * 0.08, 5, 3, m.light);
          } else if (look === "steamfunk") {
            h.line(
              [
                [xx, 0],
                [xx, yy + T * 0.035],
                [xx + 17, yy + T * 0.035],
              ],
              m.metal,
              5,
            );
            h.oval(
              xx + 17,
              yy + T * 0.035,
              8,
              11,
              i % 2 ? "#a9cba0" : "#da9eaa",
            );
          } else {
            h.leaf(
              xx,
              yy,
              T * (0.07 + hash(i) * 0.1),
              i % 2 ? m.mid : m.far,
              Math.PI,
            );
          }
        }
      } else {
        h.oval(x, y, r, r, m.light);
        if (look === "schism") {
          g.beginPath();
          g.ellipse(x, y, r * 1.6, r * 0.5, -0.3, 0.15, TAU - 0.3);
          g.strokeStyle = m.land;
          g.lineWidth = 3;
          g.stroke();
        }
        if (look === "dusk")
          for (let j = 0; j < 7; j++)
            h.line(
              [
                [x - r, y + (j * r) / 7],
                [x + r, y + (j * r) / 7],
              ],
              m.sky[1],
              3,
            );
      }
      for (let j = 0; j < 4; j++) {
        const p = [[0, T * 0.5]];
        for (let i = 0; i <= 36; i++)
          p.push([
            (i / 36) * W,
            T *
              (0.38 +
                j * 0.025 -
                Math.abs(Math.sin(i * 0.16 + j)) * (0.1 - j * 0.018)),
          ]);
        p.push([W, T * 0.5]);
        h.poly(p, [m.far, m.mid, m.land, m.ink][j]);
      }
    } finally {
      g.restore();
    }
  }
  H.landmarks = Object.freeze({
    version: "0.2.0-revamp.3",
    draw,
    horizon,
    palette,
  });
})(window);
