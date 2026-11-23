/* Hypermetapunk 0.3.0 · behaviours for hyperreal, slapped-together pages. One classic script, no dependencies, no network.
   window.Hypermetapunk: theme, still (motion off), ticker, slap, taste, token, reducedMotion, init, looks, pen (canvas).
   Parents: Storeybrook × Depthfield. Family tasks H2 and H3 (stevoblevo/depthfield, docs/family.md).
   Everything degrades: with JS off the markup reads in order, stickers sit where they were put and tickers wrap. */
(function (w, d) {
  'use strict';
  if (w.Hypermetapunk && w.Hypermetapunk.version) return;
  var VERSION = '0.3.0';
  var THEMES = [
    { id: 'dusk', name: 'Dusk', light: false, motion: true, print: false, line: 'Neon at the horizon, chrome over violet' },
    { id: 'zine', name: 'Zine', light: true, motion: true, print: true, line: 'Photocopied in daylight, stapled, stickered' },
    { id: 'contrast', name: 'High contrast', light: false, motion: false, print: false, line: 'Black, white and acid, nothing lost' }
  ];
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

  /* ---------- theme: three faces, one set of names; kept in the address and on this device ---------- */
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
    if (over) add('slap-over-words', 'warn', over, overS, 'Slap the frame — and cross the art, never the words. Stickers and tape may cross the sun, the grid or a picture; move this one off the text, to a corner or the margin.');
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
  /* ---------- pen (plan C4, family F4): a theme's inks and its horizon, for games that draw on canvas ---------- */
  /* The numbers in INKS are project/tokens.json resolved to RGB; tools/pen-inks.py fails when they drift. A host asks
     for a colour by its token name, never by a hex value, so the same drawing code prints in every theme. */
  var INKS = {
    dusk: { 'void': [11, 6, 24], 'paper': [11, 6, 24], 'surface': [22, 13, 46], 'surface-raised': [33, 21, 67], 'page': [33, 21, 67], 'line': [61, 44, 112], 'ink': [247, 242, 255], 'ink-muted': [201, 189, 240], 'accent': [255, 111, 181], 'accent-soft': [255, 111, 181, 0.16], 'on-accent': [20, 6, 31], 'cue': [5, 255, 161], 'on-cue': [4, 20, 12], 'link': [127, 233, 255], 'focus': [232, 255, 0], 'chrome-1': [253, 253, 255], 'chrome-2': [201, 214, 255], 'chrome-3': [127, 127, 213], 'chrome-4': [255, 113, 206], 'chrome-5': [1, 205, 254], 'wave-abyss': [6, 3, 15], 'wave-indigo': [27, 15, 58], 'wave-violet': [61, 22, 99], 'wave-magenta': [255, 46, 136], 'wave-tangerine': [255, 184, 107], 'wave-sun': [255, 251, 150], 'wave-cyan': [1, 205, 254], 'wave-mint': [5, 255, 161], 'punk-acid': [232, 255, 0], 'punk-orange': [255, 90, 0], 'punk-magenta': [255, 0, 168], 'punk-ink': [13, 13, 18], 'slap': [255, 46, 136], 'punk-paper': [244, 239, 227], 'punk-tape': [255, 235, 150, 0.78], 'scrawl': [255, 113, 206] },
    zine: { 'void': [244, 239, 227], 'paper': [244, 239, 227], 'surface': [233, 226, 207], 'surface-raised': [255, 253, 246], 'page': [255, 253, 246], 'line': [201, 192, 168], 'ink': [13, 13, 18], 'ink-muted': [70, 64, 77], 'accent': [194, 0, 106], 'accent-soft': [194, 0, 106, 0.1], 'on-accent': [255, 255, 255], 'cue': [0, 106, 70], 'on-cue': [255, 255, 255], 'link': [0, 80, 168], 'focus': [255, 90, 0], 'chrome-1': [122, 122, 146], 'chrome-2': [52, 52, 74], 'chrome-3': [13, 13, 18], 'chrome-4': [74, 74, 102], 'chrome-5': [13, 13, 18], 'wave-abyss': [244, 239, 227], 'wave-indigo': [238, 226, 242], 'wave-violet': [246, 207, 230], 'wave-magenta': [255, 155, 203], 'wave-tangerine': [255, 207, 158], 'wave-sun': [255, 243, 166], 'wave-cyan': [1, 165, 212], 'wave-mint': [0, 194, 122], 'punk-acid': [232, 255, 0], 'punk-orange': [255, 90, 0], 'punk-magenta': [255, 0, 168], 'punk-ink': [13, 13, 18], 'slap': [13, 13, 18], 'punk-paper': [255, 253, 246], 'punk-tape': [255, 230, 140, 0.85], 'scrawl': [194, 0, 106] },
    contrast: { 'void': [0, 0, 0], 'paper': [0, 0, 0], 'surface': [11, 11, 11], 'surface-raised': [20, 20, 20], 'page': [20, 20, 20], 'line': [255, 255, 255], 'ink': [255, 255, 255], 'ink-muted': [232, 232, 232], 'accent': [232, 255, 0], 'accent-soft': [232, 255, 0, 0.18], 'on-accent': [0, 0, 0], 'cue': [5, 255, 161], 'on-cue': [0, 0, 0], 'link': [127, 233, 255], 'focus': [232, 255, 0], 'chrome-1': [255, 255, 255], 'chrome-2': [255, 255, 255], 'chrome-3': [232, 232, 232], 'chrome-4': [255, 255, 255], 'chrome-5': [232, 255, 0], 'wave-abyss': [0, 0, 0], 'wave-indigo': [0, 0, 0], 'wave-violet': [17, 17, 17], 'wave-magenta': [51, 51, 51], 'wave-tangerine': [119, 119, 119], 'wave-sun': [255, 255, 255], 'wave-cyan': [255, 255, 255], 'wave-mint': [255, 255, 255], 'punk-acid': [232, 255, 0], 'punk-orange': [255, 255, 255], 'punk-magenta': [255, 255, 255], 'punk-ink': [0, 0, 0], 'slap': [255, 255, 255], 'punk-paper': [255, 255, 255], 'punk-tape': [255, 255, 255, 0.9], 'scrawl': [232, 255, 0] }
  };
  var BAND = [['wave-abyss', 0], ['wave-indigo', 0.34], ['wave-violet', 0.52], ['wave-magenta', 0.72], ['wave-tangerine', 0.9], ['wave-sun', 1.08]];
  var SUN_BARS = [[0, 0.52], [0.55, 0.64], [0.68, 0.76], [0.81, 0.88], [0.94, 1]];   /* the lit bands of the disc; the gaps are the cuts */
  var GRAIN = { dusk: 0.24, zine: 0.28, contrast: 0 };
  function penLook(look) {
    var id = typeof look === 'string' ? look : look && look.closest ? (look.closest('[data-theme]') || root).getAttribute('data-theme') : theme.get();
    return INKS[id] ? id : 'dusk';
  }
  function pen(look, opt) {
    var id = penLook(look), I = INKS[id], T = THEMES[IDS.indexOf(id)], held = !!(opt && opt.still), tiles = {};
    function ink(name) { return I[name] || I.ink; }
    function rgb(name, a) { var c = typeof name === 'string' ? ink(name) : name; return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? (c.length > 3 ? c[3] : 1) : a) + ')'; }
    function mix(a, b, k) { return [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)]; }
    function band(k) {   /* the dusk gradient at k (0 the top of the sky, 1.08 past the sun) */
      for (var i = 1; i < BAND.length; i++) if (k <= BAND[i][1]) return mix(ink(BAND[i - 1][0]), ink(BAND[i][0]), (k - BAND[i - 1][1]) / (BAND[i][1] - BAND[i - 1][1]));
      return ink('wave-sun');
    }
    /* the sky: the gradient stepped down in hard toner bands, with the printer's lines across it. Its bottom edge is the horizon. */
    function sky(ctx, o) {
      var x = o.x || 0, y = o.y || 0, n = Math.max(2, o.steps || 14), span = o.span == null ? 0.9 : o.span, i, y0, y1;
      ctx.save();
      if (id === 'contrast') { ctx.fillStyle = rgb('void'); ctx.fillRect(x, y, o.w, o.h); ctx.restore(); return; }
      for (i = 0; i < n; i++) { y0 = Math.floor(y + (o.h * i) / n); y1 = Math.ceil(y + (o.h * (i + 1)) / n); ctx.fillStyle = rgb(band(((i + 0.5) / n) * span)); ctx.fillRect(x, y0, o.w, y1 - y0); }
      if (o.lines !== false) { ctx.fillStyle = 'rgba(0,0,0,0.115)'; for (i = y; i < y + o.h; i += 5) ctx.fillRect(x, i, o.w, 2); }
      ctx.restore();
    }
    /* the sun: a banded disc with its base on (x, y). Dusk prints the gradient with a glow, Zine prints it flat magenta, High contrast in ink. */
    function sun(ctx, o) {
      var r = o.r, cx = o.x, cy = o.y - r, top = cy - r, g, i;
      ctx.save();
      if (id === 'dusk' && o.glow !== false) { g = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.7); g.addColorStop(0, rgb('chrome-4', 0.4)); g.addColorStop(1, rgb('chrome-4', 0)); ctx.fillStyle = g; ctx.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4); }
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      if (id === 'zine') ctx.fillStyle = rgb('punk-magenta'); else if (id === 'contrast') ctx.fillStyle = rgb('ink');
      else { g = ctx.createLinearGradient(0, top, 0, top + 2 * r); g.addColorStop(0, rgb('wave-sun')); g.addColorStop(0.42, rgb('wave-tangerine')); g.addColorStop(0.78, rgb('wave-magenta')); g.addColorStop(1, rgb('chrome-4')); ctx.fillStyle = g; }
      for (i = 0; i < SUN_BARS.length; i++) ctx.fillRect(cx - r, top + 2 * r * SUN_BARS[i][0], 2 * r, 2 * r * (SUN_BARS[i][1] - SUN_BARS[i][0]) + 0.5);
      if (o.tape !== false && id !== 'contrast') { ctx.translate(cx, top + 2 * r * 0.355); ctx.rotate(-4 * Math.PI / 180); ctx.fillStyle = rgb('punk-tape'); ctx.fillRect(-r * 1.1, -r * 0.13, r * 2.2, r * 0.26); }
      ctx.restore();
    }
    /* the grid floor: rows that close up toward the horizon (its top edge) and lines that fan from the vanishing point. `t` in seconds drifts the rows toward the viewer; it holds still under reduced motion and "hold still". */
    function floor(ctx, o) {
      var x = o.x || 0, y = o.y, w = o.w, h = o.h, vx = o.vx == null ? x + w / 2 : o.vx, rows = o.rows || 11, gap = o.gap || Math.max(40, w / 12), spread = o.spread || 3;
      var ph = held || reduced() ? 0 : (((o.t || 0) / 3.2) % 1 + 1) % 1, i, k, yy, a, j, n, bx;
      var hc = id === 'dusk' ? ink('wave-cyan') : id === 'zine' ? ink('punk-ink') : ink('ink'), vc = id === 'dusk' ? ink('wave-magenta') : hc;
      var ha = id === 'dusk' ? 0.55 : id === 'zine' ? 0.5 : 0.9, va = id === 'dusk' ? 0.45 : id === 'zine' ? 0.35 : 0.7;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.lineWidth = o.line || 2;
      for (i = 0; i <= rows; i++) {
        k = (i + ph) / rows; yy = y + h * Math.pow(k, 2.1); a = Math.min(1, (yy - y) / (h * 0.16)) * Math.min(1, (1.02 - k) * 7);   /* thin out where the rows crowd the horizon */
        if (a <= 0.01) continue;
        ctx.strokeStyle = rgb(hc, ha * a); ctx.beginPath(); ctx.moveTo(x, Math.round(yy) + 0.5); ctx.lineTo(x + w, Math.round(yy) + 0.5); ctx.stroke();
      }
      n = Math.ceil((w / 2 + Math.abs(vx - (x + w / 2))) / (gap * 0.3)) + 1;
      var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, rgb(vc, 0)); g.addColorStop(0.3, rgb(vc, va)); g.addColorStop(0.86, rgb(vc, va)); g.addColorStop(1, rgb(vc, 0)); ctx.strokeStyle = g;
      for (j = -n; j <= n; j++) { bx = vx + j * gap * spread; ctx.beginPath(); ctx.moveTo(vx + j * gap * 0.3, y); ctx.lineTo(bx, y + h); ctx.stroke(); }
      ctx.restore();
    }
    /* sky, sun and floor in one call. `at` is where the horizon sits (0 to 1 down the box). */
    function horizon(ctx, o) {
      var x = o.x || 0, y = o.y || 0, hy = Math.round(y + o.h * (o.at == null ? 0.58 : o.at)), r = o.sunR == null ? Math.min(o.w, o.h) * 0.2 : o.sunR;
      sky(ctx, { x: x, y: y, w: o.w, h: hy - y, steps: o.steps, lines: o.lines });
      if (r > 0) sun(ctx, { x: o.sunX == null ? x + o.w / 2 : o.sunX, y: hy, r: r, tape: o.tape });
      ctx.fillStyle = rgb(id === 'zine' ? 'paper' : 'void'); ctx.fillRect(x, hy, o.w, y + o.h - hy);
      floor(ctx, { x: x, y: hy, w: o.w, h: y + o.h - hy, vx: o.sunX, t: o.t });
      return hy;
    }
    /* print materials as patterns: `scan` (the printer's lines), `halftone` (a dot screen), `xerox` (photocopy speckle) */
    function material(ctx, kind) {
      if (tiles[kind]) return ctx.createPattern(tiles[kind], 'repeat');
      var c = d.createElement('canvas'), k = c.getContext('2d'), i, R;
      if (kind === 'scan') { c.width = 4; c.height = 5; k.fillStyle = 'rgba(0,0,0,0.115)'; k.fillRect(0, 0, 4, 2); }
      else if (kind === 'halftone') { c.width = c.height = 8; k.fillStyle = rgb(id === 'dusk' ? 'wave-abyss' : id === 'zine' ? 'punk-ink' : 'ink', id === 'dusk' ? 0.5 : 0.32); k.beginPath(); k.arc(2, 2, 1.5, 0, 7); k.arc(6, 6, 1.5, 0, 7); k.fill(); }
      else { c.width = c.height = 128; R = rand(1977); for (i = 0; i < 2600; i++) { k.fillStyle = R() < 0.5 ? 'rgba(255,255,255,' + (0.1 + R() * 0.5) + ')' : 'rgba(0,0,0,' + (0.1 + R() * 0.5) + ')'; k.fillRect((R() * 128) | 0, (R() * 128) | 0, 1 + ((R() * 2) | 0), 1); } }
      tiles[kind] = c; return ctx.createPattern(c, 'repeat');
    }
    /* lay the theme's photocopy grain over a box (nothing in High contrast) */
    function grain(ctx, o) {
      var a = (o.amount == null ? GRAIN[id] : o.amount); if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = material(ctx, 'xerox'); ctx.fillRect(o.x || 0, o.y || 0, o.w, o.h); ctx.restore();
    }
    function face(o) { return (o.weight || '') + ' ' + o.size + 'px ' + (o.font || token('font-display') || '"Archivo Black", "Arial Black", Impact, sans-serif'); }
    /* chrome lettering: the mirror gradient over a slipped magenta plate. Zine prints it dark with the plate dropped; High contrast prints solid ink on a ground-coloured keyline. */
    function chrome(ctx, text, x, y, o) {
      var s = o.size, g, slip = Math.max(2, s * (id === 'zine' ? 0.07 : 0.045));
      ctx.save(); ctx.font = face(o); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
      if (id === 'contrast') { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, s * 0.12); ctx.strokeStyle = rgb('void'); ctx.strokeText(text, x, y); ctx.fillStyle = rgb('ink'); ctx.fillText(text, x, y); ctx.restore(); return; }
      ctx.fillStyle = rgb('punk-magenta'); ctx.fillText(text, x + slip, y + slip);
      g = ctx.createLinearGradient(0, y - s * 0.78, 0, y + s * 0.06);
      g.addColorStop(0, rgb('chrome-1')); g.addColorStop(0.32, rgb('chrome-2')); g.addColorStop(0.5, rgb('chrome-3')); if (id === 'dusk') g.addColorStop(0.54, 'rgb(234,246,255)'); g.addColorStop(0.76, rgb('chrome-4')); g.addColorStop(1, rgb('chrome-5'));
      ctx.fillStyle = g; ctx.fillText(text, x, y); ctx.restore();
    }
    /* misregistered type: a cyan plate and a magenta plate slipped either side of the ink */
    function misreg(ctx, text, x, y, o) {
      var dx = o.dx == null ? Math.max(1.5, o.size * 0.035) : o.dx;
      ctx.save(); ctx.font = face(o); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
      if (id !== 'contrast') { ctx.fillStyle = rgb('wave-cyan', 0.85); ctx.fillText(text, x - dx, y - dx * 0.4); ctx.fillStyle = rgb('punk-magenta', 0.85); ctx.fillText(text, x + dx, y + dx * 0.4); }
      ctx.fillStyle = rgb(o.ink || 'ink'); ctx.fillText(text, x, y); ctx.restore();
    }
    return { look: id, name: T.name, light: T.light, inks: I, rgb: rgb, band: band, sky: sky, sun: sun, floor: floor, horizon: horizon, material: material, grain: grain, chrome: chrome, misreg: misreg };
  }

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

  var API = { version: VERSION, themes: THEMES, looks: THEMES, pen: pen, init: init, theme: theme, accent: accent, still: still, ticker: ticker, slap: slap, taste: taste, token: token, reducedMotion: reduced };
  w.Hypermetapunk = API;
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
