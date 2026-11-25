/* Hypermetapunk 0.5.0 · the plate: one drawing, printed in a theme's material (family task F9, the Hypermetapunk half).
   Hypermetapunk.plate(theme, source, o)  takes a canvas of flat fills on transparency and returns a new canvas of the
                                          same size: a neon halftone in Dusk, a xerox with one red in Zine, a solid cut
                                          in High contrast. Nothing is redrawn by hand, and the source is never changed.
   Hypermetapunk.plate.media              the three materials as data: { theme: { id, name, accent } }
   Hypermetapunk.tint, .edges             the family's two shared helpers, the same as Depthfield's and Storeybrook's.
   An add-on: load it after pen.js (bundle.js is not needed). It reads no CSS; every colour is one of the pen's inks.
   A plate is still, so reduced motion and "hold still" need no branch. */
(function (w, d) {
  'use strict';
  var H = w.Hypermetapunk;
  if (!H || !H.pen || H.plate) return;
  var VERSION = '0.5.0', TAU = Math.PI * 2;
  /* one accent per theme: the one mark that is not the subject. Here it is always the sound word, slapped three ways. */
  var MEDIA = {
    dusk: { id: 'neon', name: 'Neon halftone', accent: 'a sound word on a sticker' },
    zine: { id: 'xerox', name: 'Xerox with one red', accent: 'a sound word, rubber-stamped' },
    contrast: { id: 'solid', name: 'Solid cut', accent: 'a sound word in acid' }
  };
  var FACE = '"Archivo Black", "Arial Black", Impact, sans-serif';

  function mk(wd, ht) { var c = d.createElement('canvas'); c.width = wd; c.height = ht; return c; }
  function rand(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function pixels(src) { var c = mk(src.width, src.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; }
  function lum(p, i) { return (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) / 255; }
  /* the emptiest corner for the accent: of the four bw x bh boxes inset by m, the one the drawing covers least */
  function corner(p, W, Ht, bw, bh, m) {
    var st = Math.max(2, Math.round(W / 120)), best = null, x, y, n;
    [[W - m - bw, m], [m, m], [W - m - bw, Ht - m - bh], [m, Ht - m - bh]].forEach(function (c) {
      n = 0;
      for (y = Math.max(0, c[1] | 0); y < Math.min(Ht, c[1] + bh); y += st) for (x = Math.max(0, c[0] | 0); x < Math.min(W, c[0] + bw); x += st) if (p[(y * W + x) * 4 + 3] > 40) n++;
      if (!best || n < best.n) best = { x: c[0], y: c[1], n: n };
    });
    return best;
  }

  /* ---------- the family's two helpers (the same as Depthfield.tint and Depthfield.edges) ---------- */
  var tint = H.tint || function (source, colour) {
    var c = mk(source.width, source.height), g = c.getContext('2d');
    g.drawImage(source, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = colour; g.fillRect(0, 0, c.width, c.height); return c;
  };
  var edges = H.edges || function (source, rgb, gain) {
    var W = source.width, Ht = source.height, src = pixels(source), sc = mk(W, Ht), sg = sc.getContext('2d'), out = sg.createImageData(W, Ht), od = out.data, L = new Float32Array(W * Ht), i, j, x, y;
    for (i = 0, j = 0; i < src.length; i += 4, j++) L[j] = (src[i + 3] / 255) * (60 + 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2]);
    for (y = 1; y < Ht - 1; y++) for (x = 1; x < W - 1; x++) {
      j = y * W + x;
      var gx = L[j - W + 1] + 2 * L[j + 1] + L[j + W + 1] - L[j - W - 1] - 2 * L[j - 1] - L[j + W - 1];
      var gy = L[j + W - 1] + 2 * L[j + W] + L[j + W + 1] - L[j - W - 1] - 2 * L[j - W] - L[j - W + 1];
      var m = Math.min(255, Math.sqrt(gx * gx + gy * gy) * (gain || 2) * 0.5);
      if (m < 28) continue;
      od[j * 4] = rgb[0]; od[j * 4 + 1] = rgb[1]; od[j * 4 + 2] = rgb[2]; od[j * 4 + 3] = m;
    }
    sg.putImageData(out, 0, 0); return sc;
  };
  /* two layers from the drawing's tones: its darks, and the middle band that takes the one spot colour */
  function split(p, W, Ht, dark, mid, lo, hi) {
    var a = mk(W, Ht), b = mk(W, Ht), ag = a.getContext('2d'), bg = b.getContext('2d'), ad = ag.createImageData(W, Ht), bd = bg.createImageData(W, Ht), i, L, o, c;
    for (i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 128) continue; L = lum(p, i);
      if (L < lo) { o = ad.data; c = dark; } else if (L < hi) { o = bd.data; c = mid; } else continue;
      o[i] = c[0]; o[i + 1] = c[1]; o[i + 2] = c[2]; o[i + 3] = 255;
    }
    ag.putImageData(ad, 0, 0); bg.putImageData(bd, 0, 0); return [a, b];
  }
  function word(o) { return String(o.word == null ? 'SLAP' : o.word).toUpperCase(); }

  /* ---------- Dusk: a neon halftone. The drawing is a dot screen in the dusk band's own inks, outlined in tube light,
     with the magenta plate slipped under it ---------- */
  function neon(P, g, src, W, Ht, k, o, p) {
    var x, y, i, L, row = 0, cell = Math.max(4, Math.round(W / 60)), r = rand(o.seed || 5);
    P.sky(g, { w: W, h: Ht, ease: 2.4, span: 0.86 });
    g.drawImage(tint(src, P.rgb('wave-abyss', 0.9)), 0, 0);
    for (y = cell / 2; y < Ht; y += cell * 0.86, row++) for (x = (row % 2 ? cell : cell / 2); x < W; x += cell) {
      i = ((y | 0) * W + (x | 0)) * 4; if (p[i + 3] < 128) continue; L = lum(p, i);
      g.fillStyle = P.rgb(L > 0.72 ? 'wave-sun' : L > 0.5 ? 'wave-tangerine' : L > 0.3 ? 'wave-magenta' : 'wave-violet');
      g.beginPath(); g.arc(x, y, cell * (0.2 + 0.36 * L), 0, TAU); g.fill();
    }
    g.drawImage(edges(src, P.inks['punk-magenta'], 3), 3 * k, 2 * k);
    g.save(); g.shadowColor = P.rgb('wave-cyan', 0.9); g.shadowBlur = 9 * k; var E = edges(src, P.inks['wave-cyan'], 3.4); g.drawImage(E, 0, 0); g.shadowBlur = 0; g.drawImage(E, 0, 0); g.restore();
    P.grain(g, { w: W, h: Ht });
    /* accent: the sound word on an acid sticker, with its hard slap shadow */
    var t = word(o); if (!t) return;
    var fs = Math.round(19 * k); g.save(); g.font = fs + 'px ' + (o.font || FACE);
    var tw = g.measureText(t).width, bw = tw + 18 * k, bh = fs * 1.7, c = corner(p, W, Ht, bw + 8 * k, bh + 12 * k, 10 * k);
    g.translate(c.x + bw / 2 + 4 * k, c.y + bh / 2 + 6 * k); g.rotate(-0.09 + (r() - 0.5) * 0.04);
    g.fillStyle = P.rgb('slap'); g.fillRect(-bw / 2 + 4 * k, -bh / 2 + 4 * k, bw, bh);
    g.fillStyle = P.rgb('punk-acid'); g.fillRect(-bw / 2, -bh / 2, bw, bh);
    g.fillStyle = P.rgb('punk-ink'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 0, fs * 0.06); g.restore();
  }

  /* ---------- Zine: a xerox with one red. Darks go to toner, the middle tones to one spot colour off register, the
     lights are left as paper ---------- */
  function xerox(P, g, src, W, Ht, k, o, p) {
    var r = rand(o.seed || 9), i, ink = P.inks['punk-ink'], red = P.inks.accent, L2 = split(p, W, Ht, ink, red, 0.45, 0.74);
    g.fillStyle = P.rgb('punk-paper'); g.fillRect(0, 0, W, Ht);
    g.drawImage(tint(src, P.rgb('surface', 1)), 0, 0);   /* the lights: a breath of grey, so the paper shape holds */
    g.drawImage(L2[1], 3 * k, 2 * k);                    /* the one red, off register */
    g.drawImage(L2[0], 0, 0);
    var E = edges(src, ink, 3.6); g.drawImage(E, 0, 0); g.drawImage(E, 0.8 * k, 0.5 * k);
    g.save(); g.fillStyle = P.rgb('punk-ink', 0.07); for (i = 0; i < 3; i++) g.fillRect(Math.round(r() * W), 0, Math.max(1, Math.round((1 + r() * 2) * k)), Ht); g.restore();   /* the copier's streaks */
    P.grain(g, { w: W, h: Ht, amount: 0.5 });
    /* accent: the sound word, rubber-stamped with uneven pressure */
    var t = word(o); if (!t) return;
    var fs = Math.round(18 * k), st = mk(W, Ht), s = st.getContext('2d'); s.font = fs + 'px ' + (o.font || FACE);
    var tw = s.measureText(t).width, bw = tw + 18 * k, bh = fs * 1.75, c = corner(p, W, Ht, bw + 8 * k, bh + 10 * k, 10 * k);
    s.translate(c.x + bw / 2 + 4 * k, c.y + bh / 2 + 5 * k); s.rotate(-0.1);
    s.strokeStyle = s.fillStyle = P.rgb('accent'); s.lineWidth = 2.6 * k; s.strokeRect(-bw / 2, -bh / 2, bw, bh);
    s.textAlign = 'center'; s.textBaseline = 'middle'; s.fillText(t, 0, fs * 0.06);
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'destination-out';
    for (i = 0; i < 260; i++) { s.globalAlpha = 0.25 + r() * 0.6; s.fillRect(c.x + r() * (bw + 10 * k), c.y + r() * (bh + 10 * k), (1 + r() * 2.5) * k, (0.6 + r()) * k); }
    g.drawImage(st, 0, 0);
  }

  /* ---------- High contrast: a solid cut. White on black with an acid keyline; the inner lines are cut back to black.
     No grain, no slipped plate, nothing lost ---------- */
  function solid(P, g, src, W, Ht, k, o, p) {
    var i, key = tint(src, P.rgb('punk-acid', 1)), rad = 3.2 * k;
    g.fillStyle = P.rgb('void'); g.fillRect(0, 0, W, Ht);
    for (i = 0; i < 12; i++) g.drawImage(key, Math.cos(i / 12 * TAU) * rad, Math.sin(i / 12 * TAU) * rad);
    g.drawImage(tint(src, P.rgb('ink', 1)), 0, 0);
    var E = edges(src, P.inks['void'], 4);
    g.drawImage(E, 0, 0); g.drawImage(E, 0.8 * k, 0); g.drawImage(E, 0, 0.8 * k);
    /* accent: the sound word in acid */
    var t = word(o); if (!t) return;
    var fs = Math.round(19 * k); g.save(); g.font = fs + 'px ' + (o.font || FACE);
    var tw = g.measureText(t).width, bw = tw + 18 * k, bh = fs * 1.7, c = corner(p, W, Ht, bw + 4 * k, bh + 4 * k, 12 * k);
    g.fillStyle = P.rgb('punk-acid'); g.fillRect(c.x, c.y, bw, bh);
    g.fillStyle = P.rgb('on-accent'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, c.x + bw / 2, c.y + bh / 2 + fs * 0.06); g.restore();
  }

  var MAKE = { dusk: neon, zine: xerox, contrast: solid };

  /* plate(theme, source, { word, seed, font }): theme is a theme id, or an element whose theme to use */
  function plate(theme, source, o) {
    o = o || {};
    var P = H.pen(theme, { still: true }), W = source.width, Ht = source.height, c = mk(W, Ht);
    if (!W || !Ht) return c;
    (MAKE[P.look] || neon)(P, c.getContext('2d'), source, W, Ht, W / 320, o, pixels(source));
    return c;
  }
  plate.media = MEDIA; plate.version = VERSION;
  H.plate = plate; H.tint = tint; H.edges = edges; H.plateVersion = VERSION;
})(window, document);
