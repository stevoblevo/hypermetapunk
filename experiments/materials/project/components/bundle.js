/* Hypermetapunk 0.2.0-revamp.1 · behaviours for hyperreal, slapped-together pages. One classic script, no dependencies, no network.
   window.Hypermetapunk: theme, still (motion off), ticker, slap, taste, token, reducedMotion, init.
   Parents: Storeybrook × Depthfield. Family tasks H2 and H3 (stevoblevo/depthfield, docs/family.md).
   Everything degrades: with JS off the markup reads in order, stickers sit where they were put and tickers wrap. */
(function (w, d) {
  'use strict';
  if (w.Hypermetapunk && w.Hypermetapunk.version) return;
  var VERSION = '0.2.0-revamp.1';
  var THEMES = [
    { id: 'dusk', name: 'Dusk', light: false, motion: true, print: false, line: 'Neon at the horizon, chrome over violet' },
    { id: 'zine', name: 'Zine', light: true, motion: true, print: true, line: 'Photocopied in daylight, stapled, stickered' },
    { id: 'contrast', name: 'High contrast', light: false, motion: false, print: false, line: 'Black, white and acid, nothing lost' }
  ];
  /* plan R1: extended material families; legacy ids and defaults stay unchanged. */
  THEMES.push.apply(THEMES, [{"id": "rainprint", "name": "Rainprint / Ink Rain", "light": true, "motion": false, "print": true, "line": "Absorbent paper, readable satire, crimson pigment and fine ink."}, {"id": "schism", "name": "Techno Future Schism", "light": true, "motion": false, "print": true, "line": "Porcelain relief, oxidized architecture and a displaced sky."}, {"id": "steamfunk", "name": "Steam Funk / Bloomworks", "light": false, "motion": false, "print": false, "line": "Brass, verdigris and colorful, life-giving imaginary emissions."}, {"id": "raeverfaelt", "name": "RaeverFaelt", "light": false, "motion": false, "print": false, "line": "Torn-paper relief, a pale path and a crimson river through night and dawn."}, {"id": "strawberry", "name": "Strawberry Americano", "light": true, "motion": false, "print": true, "line": "Quiet cream, espresso, berry lacquer and one clear visual story."}]);
  var IDS = THEMES.map(function (t) { return t.id; });
  var root = d.documentElement;

  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function store() { try { var s = w.localStorage, k = '__hmp'; s.setItem(k, '1'); s.removeItem(k); return s; } catch (e) { return null; } }
  var LS = store();
  function get(k) { try { return LS ? LS.getItem(k) : null; } catch (e) { return null; } }
  function put(k, v) { try { if (LS) { if (v == null) LS.removeItem(k); else LS.setItem(k, v); } } catch (e) { /* storage blocked */ } }
  function emit(name, detail) { try { w.dispatchEvent(new CustomEvent('hmp:' + name, { detail: detail })); } catch (e) { /* old browser */ } }
  function token(name, el) { try { return getComputedStyle(el || root).getPropertyValue('--' + name).trim(); } catch (e) { return ''; } }
  function reduced() { try { return root.classList.contains('hmp-still') || w.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function rand(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- theme: eight families, one set of names; kept in the address and on this device ---------- */
  var theme = {
    list: THEMES,
    get: function () { var t = root.getAttribute('data-theme'); return IDS.indexOf(t) >= 0 ? t : 'dusk'; },
    set: function (id, o) {
      if (IDS.indexOf(id) < 0) return theme.get();
      root.setAttribute('data-theme', id); if (!(o && o.keep === false)) put('hmp:theme', id);
      $$('[data-hmp-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-hmp-theme') === id)); });
      var meta = d.querySelector('meta[name="theme-color"]'); if (meta) { var v = token('void'); if (v) meta.setAttribute('content', v); }
      if (accent) applyAccent();
      emit('theme', { theme: id }); return id;
    },
    init: function () {
      var q = null; try { q = new URLSearchParams(w.location.search).get('theme'); } catch (e) { /* old browser */ }
      var framed = true; try { framed = w.self !== w.top; } catch (e) { /* cross-origin parent */ }
      var now = root.getAttribute('data-theme'), saved = get('hmp:theme');
      /* in a frame (a docs preview), the host's choice wins; on a page, the reader's saved choice wins over the markup */
      var start = IDS.indexOf(q) >= 0 ? q : (framed && IDS.indexOf(now) >= 0) ? now : IDS.indexOf(saved) >= 0 ? saved : IDS.indexOf(now) >= 0 ? now : 'dusk';
      theme.set(start, { keep: !!(q || saved) });
    }
  };

  /* ---------- plan P2: an accent is a choice, never an unreadable text pair ---------- */
  var ACCENT_KEY = 'hmp:accents', accentChoices = {}, accentResult = null, accentOriginal = null;
  var accentPresets = [
    { name: 'Acid', color: '#e8ff00' }, { name: 'Pink', color: '#ff5cba' },
    { name: 'Cyan', color: '#7fe9ff' }, { name: 'Mint', color: '#05ffa1' },
    { name: 'Orange', color: '#ff914d' }
  ];
  function hex(value) {
    if (typeof value !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null;
    value = value.toLowerCase();
    return value.length === 4 ? '#' + value.slice(1).split('').map(function (c) { return c + c; }).join('') : value;
  }
  function rgbColor(value) {
    var h = hex(value); if (h) return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
    var m = /^rgba?\(\s*(\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)/.exec(value);
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function luminance(c) {
    var v = c.map(function (n) { n /= 255; return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrastRatio(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function hexColor(c) { return '#' + c.map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join(''); }
  function resolveAccent(requested) {
    var start = rgbColor(requested), floor = theme.get() === 'contrast' ? 13 : 4.5;
    var grounds = ['void', 'surface', 'surface-raised'].map(function (name) { return rgbColor(token(name)); });
    if (grounds.some(function (g) { return !g; })) return null; // unknown host tokens: do not guess at accessibility
    var black = [0, 0, 0], white = [255, 255, 255];
    function valid(c) { return grounds.every(function (g) { return contrastRatio(c, g) >= floor; }) && Math.max(contrastRatio(c, black), contrastRatio(c, white)) >= floor; }
    var chosen = start;
    if (!valid(chosen)) {
      chosen = null;
      // Smallest byte-space adjustment toward either endpoint. Keep hue where possible.
      for (var step = 1; step <= 255 && !chosen; step++) {
        [black, white].some(function (end) {
          var candidate = start.map(function (n, i) { return Math.round(n + (end[i] - n) * step / 255); });
          if (valid(candidate)) { chosen = candidate; return true; } return false;
        });
      }
    }
    if (!chosen) return null;
    var color = hexColor(chosen), onColor = contrastRatio(chosen, black) >= contrastRatio(chosen, white) ? '#000000' : '#ffffff';
    return { requested: requested, color: color, onColor: onColor, adjusted: color !== requested, minimumContrast: floor };
  }
  function readAccentChoices() {
    accentChoices = {};
    try { var saved = JSON.parse(get(ACCENT_KEY) || '{}'); IDS.forEach(function (id) { if (saved && hex(saved[id])) accentChoices[id] = hex(saved[id]); }); } catch (e) { /* corrupt or blocked storage */ }
  }
  function syncAccentControls() {
    var selected = accentChoices[theme.get()] || null;
    $$('[data-hmp-accent]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!selected && hex(b.getAttribute('data-hmp-accent')) === selected)); });
    $$('[data-hmp-accent-input]').forEach(function (input) { input.value = selected || hex(token('accent')) || '#e8ff00'; });
    $$('[data-hmp-accent-status]').forEach(function (out) {
      out.textContent = accentResult ? (accentResult.adjusted ? 'Adjusted to ' + accentResult.color + ' for readable text (' + accentResult.minimumContrast + ':1 or more).' : 'Accent ' + accentResult.color + '. Text contrast ' + accentResult.minimumContrast + ':1 or more.') : 'Using this theme’s original accent.';
    });
  }
  function applyAccent() {
    if (accentOriginal) {
      ['--accent', '--on-accent'].forEach(function (name) {
        var old = accentOriginal[name];
        if (old.value) root.style.setProperty(name, old.value, old.priority); else root.style.removeProperty(name);
      });
    }
    var requested = accentChoices[theme.get()]; accentResult = requested ? resolveAccent(requested) : null;
    if (accentResult && !accentOriginal) {
      accentOriginal = {};
      ['--accent', '--on-accent'].forEach(function (name) { accentOriginal[name] = { value: root.style.getPropertyValue(name), priority: root.style.getPropertyPriority(name) }; });
    }
    if (accentResult) { root.style.setProperty('--accent', accentResult.color); root.style.setProperty('--on-accent', accentResult.onColor); }
    syncAccentControls();
    return accentResult ? Object.assign({}, accentResult) : null;
  }
  var accent = {
    presets: function () { return accentPresets.map(function (p) { return Object.assign({}, p); }); },
    get: function () { return accentResult ? Object.assign({}, accentResult) : null; },
    set: function (value, options) {
      var requested = hex(value); if (!requested) throw new TypeError('Accent must be a #RGB or #RRGGBB colour.');
      accentChoices[theme.get()] = requested; var result = applyAccent();
      if (!(options && options.keep === false)) put(ACCENT_KEY, JSON.stringify(accentChoices));
      emit('accent', { theme: theme.get(), accent: result }); return result;
    },
    reset: function (options) {
      delete accentChoices[theme.get()]; var result = applyAccent();
      if (!(options && options.keep === false)) put(ACCENT_KEY, JSON.stringify(accentChoices));
      emit('accent', { theme: theme.get(), accent: result }); return result;
    }
  };
  readAccentChoices();
  if (w.MutationObserver) new w.MutationObserver(function () { applyAccent(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  w.addEventListener('storage', function (e) { if (e.key === ACCENT_KEY || e.key === null) { readAccentChoices(); applyAccent(); } });

  /* ---------- still: a page-level "motion off", for people who did not set it in their system ---------- */
  var still = {
    get: function () { return root.classList.contains('hmp-still'); },
    set: function (on) { root.classList.toggle('hmp-still', !!on); put('hmp:still', on ? '1' : null); $$('[data-hmp-still]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!on)); }); emit('still', { on: !!on }); return !!on; },
    init: function () { if (get('hmp:still') === '1') still.set(true); }
  };

  /* ---------- ticker: the words appear once for readers; the copy that makes the loop is hidden ---------- */
  function ticker(el) {
    if (!el || el.__hmpTicker) return el && el.__hmpTicker;
    var track = el.querySelector('.hmp-ticker__track');
    if (!track) { track = d.createElement('div'); track.className = 'hmp-ticker__track'; while (el.firstChild) track.appendChild(el.firstChild); el.appendChild(track); }
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (it) { var c = it.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('a, button', c).forEach(function (x) { x.setAttribute('tabindex', '-1'); }); track.appendChild(c); });
    if (!el.hasAttribute('role')) el.setAttribute('role', 'marquee');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'News');
    var api = { el: el, pause: function () { el.classList.add('is-paused'); }, play: function () { el.classList.remove('is-paused'); } };
    el.__hmpTicker = api; return api;
  }

  /* ---------- slap: stickers inside a [data-hmp-slap] frame get a seeded tilt, the same on every visit ---------- */
  function slap(frame, o) {
    o = o || {}; var seed = +(frame.getAttribute('data-hmp-slap') || o.seed || 7), r = rand(seed), max = parseFloat(token('tex-tilt')) || 6;
    $$('.hmp-sticker', frame).forEach(function (s) {
      if (s.style.getPropertyValue('--tilt')) return;
      var t = (r() * 2 - 1) * Math.min(3, max); s.style.setProperty('--tilt', t.toFixed(1) + 'deg');
    });
  }

  /* ---------- taste: the page check (family task F7 shares the generic tells) ---------- */
  function vis(e) { var b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }
  function words(e) { return ((e.textContent || '').trim().match(/\S+/g) || []).length; }
  function rgb(c) { var m = /rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c || ''); return m ? [+m[1], +m[2], +m[3]] : null; }
  function lum(c) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function taste(o) {
    o = o || {}; var scope = o.root || d, out = [];
    function add(rule, severity, count, sample, fix) { out.push({ rule: rule, severity: severity, count: count, sample: String(sample || '').slice(0, 80), fix: fix }); }
    var texts = $$('p, h1, h2, h3, li, blockquote', scope).filter(function (t) { return vis(t) && words(t) > 3 && !t.closest('.hmp-sticker, .hmp-ticker, .hmp-stamp'); });
    var over = 0, overS = '';
    $$('.hmp-sticker, .hmp-tape', scope).filter(vis).forEach(function (s) {
      var a = s.getBoundingClientRect();
      texts.forEach(function (t) { if (t.contains(s) || s.contains(t)) return; var b = t.getBoundingClientRect(); var ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 12 && iy > 8) { over++; overS = overS || (s.textContent || 'tape').trim(); } });
    });
    if (over) add('slap-over-words', 'warn', over, overS, 'Stickers and tape go on the frame, never over the words. Move it to a corner or the margin.');
    var opaque = function (c) { return !/rgba\([^)]*,\s*0(\.0+)?\)$/.test(c) && c !== 'transparent'; };
    var badInk = $$('.hmp-sticker, .hmp-btn', scope).filter(function (s) { var cs = getComputedStyle(s), c = rgb(cs.color), b = rgb(cs.backgroundColor); return vis(s) && opaque(cs.backgroundColor) && c && b && ratio(c, b) < 4.5; });
    if (badInk.length) add('slap-contrast', 'warn', badInk.length, badInk[0].textContent.trim(), 'Text on a sticker or a filled button is photocopy black (punk-ink) or the theme\'s on-accent. Under 4.5:1 it is not read.');
    function ground(e) { for (var x = e.parentElement; x; x = x.parentElement) { var cs = getComputedStyle(x); if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/url\(/.test(cs.backgroundImage)) return null; if (opaque(cs.backgroundColor) && rgb(cs.backgroundColor)) return rgb(cs.backgroundColor); } return null; }
    var faint = $$('.hmp-stamp, .hmp-scrawl, .hmp-label', scope).filter(function (s) { var c = rgb(getComputedStyle(s).color), g = vis(s) && ground(s); return c && g && ratio(c, g) < 4.5; });
    if (faint.length) add('ink-on-ground', 'warn', faint.length, faint[0].textContent.trim(), 'A stamp, scrawl or label must read at 4.5:1 on what is behind it. On paper, use the paper card (it prints with Zine inks).');
    var scrawls = $$('.hmp-scrawl', scope).filter(function (t) { return vis(t) && words(t) > 12; });
    if (scrawls.length) add('scrawl-long', 'info', scrawls.length, scrawls[0].textContent.trim(), 'Scrawl is an aside: a line, maybe two. Put anything longer in the text.');
    var tilted = $$('p, li, .hmp-lede, .hmp-body', scope).filter(function (t) { if (t.closest('.hmp-scrawl, .hmp-sticker, .hmp-stamp')) return false; var tr = getComputedStyle(t); return vis(t) && words(t) > 6 && ((tr.rotate && tr.rotate !== 'none' && Math.abs(parseFloat(tr.rotate)) > 1) || /matrix\((?!1, 0, 0, 1)/.test(tr.transform)); });
    if (tilted.length) add('tilted-reading', 'warn', tilted.length, tilted[0].textContent.trim(), 'Running text is never turned. Turn the sticker, the stamp or the scrawl, not the paragraph.');
    var smallChrome = $$('.hmp-chrome', scope).filter(function (c) { return vis(c) && parseFloat(getComputedStyle(c).fontSize) < 32; });
    if (smallChrome.length) add('chrome-small', 'warn', smallChrome.length, smallChrome[0].textContent.trim(), 'Chrome type is for one display line at 32 px or more; smaller, it stops reading.');
    var chromes = $$('.hmp-chrome', scope).filter(vis);
    if (chromes.length > 2) add('chrome-everywhere', 'info', chromes.length, '', 'One or two chrome lines a page. Chrome on every heading is wallpaper.');
    var stickers = $$('.hmp-sticker', scope).filter(vis);
    if (stickers.length > 8) add('sticker-bomb', 'info', stickers.length, '', 'Past eight stickers the page is a bumper. Keep the slaps for what you want found.');
    var eyebrows = $$('p, span, div', scope).filter(function (e) { var cs = getComputedStyle(e); return vis(e) && cs.textTransform === 'uppercase' && parseFloat(cs.letterSpacing) > 2 && words(e) > 2 && e.nextElementSibling && /^H[1-3]$/.test(e.nextElementSibling.tagName); });
    if (eyebrows.length > 2) add('eyebrow-above-every-heading', 'info', eyebrows.length, eyebrows[0].textContent.trim(), 'A spaced capitals label over every heading reads as a template. Keep labels for the places they inform.');
    var slogans = texts.filter(function (t) { return /\b(becomes a|is the new|reimagined|unleash|elevate|seamless)\b/i.test(t.textContent); });
    if (slogans.length) add('slogan', 'info', slogans.length, slogans[0].textContent.trim(), 'Say what the thing does, by name. Punk is plain-spoken.');
    var unnamed = $$('button, a[href], [role="button"]', scope).filter(function (b) { return vis(b) && !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title'); });
    if (unnamed.length) add('unnamed-control', 'warn', unnamed.length, (unnamed[0].outerHTML || '').slice(0, 60), 'Every control has a name a screen reader can say.');
    var sev = { warn: 0, info: 1 }; out.sort(function (a, b) { return sev[a.severity] - sev[b.severity]; });
    if (o.log !== false && w.console && out.length) { try { console.table(out); } catch (e) { /* no table */ } }
    emit('taste', { findings: out }); return out;
  }
  taste.badge = function (f) {
    f = f || taste({ log: false }); $$('.hmp-taste').forEach(function (x) { x.remove(); });
    var warn = f.filter(function (x) { return x.severity === 'warn'; }).length, p = d.createElement('details'); p.className = 'hmp-taste';
    p.innerHTML = '<summary>Taste: ' + warn + ' to fix, ' + (f.length - warn) + ' to look at</summary><ol></ol>';
    var ol = p.querySelector('ol');
    f.forEach(function (x) { var li = d.createElement('li'); var b = d.createElement('b'); b.textContent = x.rule + (x.count > 1 ? ' ×' + x.count : ''); var s = d.createElement('small'); s.textContent = x.fix; li.appendChild(b); li.appendChild(s); ol.appendChild(li); });
    if (!f.length) ol.outerHTML = '<p>Nothing to fix.</p>';
    d.body.appendChild(p); return p;
  };

  /* ---------- bind the data attributes ---------- */
  function init() {
    theme.init(); still.init();
    root.classList.add('hmp-root'); if (d.body) d.body.classList.remove('hmp-no-js');
    $$('[data-hmp-theme]').forEach(function (b) { if (b.__hmp) return; b.__hmp = true; b.setAttribute('aria-pressed', String(b.getAttribute('data-hmp-theme') === theme.get())); b.addEventListener('click', function () { theme.set(b.getAttribute('data-hmp-theme')); }); });
    $$('[data-hmp-still]').forEach(function (b) { if (b.__hmps) return; b.__hmps = true; b.setAttribute('aria-pressed', String(still.get())); b.addEventListener('click', function () { still.set(!still.get()); }); });
    $$('[data-hmp-accent]').forEach(function (b) { if (b.__hmpa) return; b.__hmpa = true; b.addEventListener('click', function () { accent.set(b.getAttribute('data-hmp-accent')); }); });
    $$('[data-hmp-accent-input]').forEach(function (input) { if (input.__hmpa) return; input.__hmpa = true; input.addEventListener('input', function () { if (hex(input.value)) accent.set(input.value); }); });
    $$('[data-hmp-accent-reset]').forEach(function (b) { if (b.__hmpa) return; b.__hmpa = true; b.addEventListener('click', function () { accent.reset(); }); });
    syncAccentControls();
    $$('.hmp-ticker').forEach(ticker);
    $$('[data-hmp-slap]').forEach(function (f) { slap(f); });
    if (/[?&#]hmp-taste\b/.test(w.location.href)) setTimeout(function () { taste.badge(); }, 700);
    emit('ready', { version: VERSION, theme: theme.get() });
    return API;
  }

  var API = { version: VERSION, themes: THEMES, looks: THEMES, init: init, theme: theme, accent: accent, still: still, ticker: ticker, slap: slap, taste: taste, token: token, reducedMotion: reduced };
  w.Hypermetapunk = API;
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
