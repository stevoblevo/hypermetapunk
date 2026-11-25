/* Hypermetapunk front page: the five dusk pets (plan C5), each found by doing what the kit is for. Front page only.
   Peel a sticker (Vinyl, the sticker cat) · stop the ticker (Snow, the static moth) · hold the pointer on the
   misregistered heading until its plates slip (Offset, the two-plate koi) · switch to Zine (Postmark, the stamp crab)
   · open every door at the foot of the page (Flutter, the tape bat). Finds go in the family's shared save through
   Hypermetapunk.pets; the counts here read Storeybrook's and Depthfield's pets from the same save. */
(function (w, d) {
  'use strict';
  var H = w.Hypermetapunk, P = H && H.pets;
  if (!P) return;
  var BPM = 96, OF = { sb: 7, df: 5, hmp: P.list.length }, LATTICE = 'https://stevoblevo.github.io/and-so/?lattice=1';
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function pet(id) { return P.list.filter(function (p) { return p.id === id; })[0]; }
  function look() { return H.theme && H.theme.get ? H.theme.get() : 'dusk'; }
  function still() { return H.reducedMotion ? H.reducedMotion() : false; }
  function kept(area, k, v) {   /* storage that may be blocked: a read with no value, a write, or a removal with null */
    try { var s = w[area]; if (v === undefined) return s.getItem(k); if (v === null) s.removeItem(k); else s.setItem(k, v); } catch (e) { /* blocked */ }
    return null;
  }
  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- the drawing loop: every pet canvas on the page, one frame at a time, none when held still ---------- */
  var CANS = [], raf = 0;
  function beat(t) { var per = 60 / BPM, ph = (t % per) / per; return Math.exp(-ph * per * 5.5); }   /* the venue's beat */
  function paint(now) {
    var t = now / 1000, s = still(), L = look();
    CANS.forEach(function (c) {
      if (!c.el.isConnected || c.away) return;
      var dpr = Math.min(2, w.devicePixelRatio || 1), cw = c.el.clientWidth, ch = c.el.clientHeight; if (!cw || !ch) return;
      if (c.el.width !== Math.round(cw * dpr) || c.el.height !== Math.round(ch * dpr)) { c.el.width = Math.round(cw * dpr); c.el.height = Math.round(ch * dpr); }
      var k = c.el.getContext('2d'); k.setTransform(dpr, 0, 0, dpr, 0, 0); k.clearRect(0, 0, cw, ch);
      var ghost = !P.has(c.id);
      P.draw(k, c.id, { x: cw / 2, y: ch / 2, size: ch * (c.big ? 0.8 : 0.72), t: t, beat: ghost ? 0 : beat(t), look: L, still: s || ghost, alpha: ghost ? 0.2 : 1 });
    });
  }
  function frame(now) { paint(now); raf = still() ? 0 : requestAnimationFrame(frame); }
  function wake() { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  var seen = 'IntersectionObserver' in w ? new IntersectionObserver(function (es) { es.forEach(function (e) { var c = CANS.filter(function (x) { return x.el === e.target; })[0]; if (c) c.away = !e.isIntersecting; }); }) : null;
  function watch(canvas, id) { var c = { el: canvas, id: id, away: false }; CANS.push(c); if (seen) seen.observe(canvas); wake(); return c; }
  function unwatch(canvas) { CANS = CANS.filter(function (c) { return c.el !== canvas; }); if (seen) seen.unobserve(canvas); }

  /* ---------- the counts: the chip in the bar, the pet list, the family, the lattice ---------- */
  var list = $('#pet-list'), rows = {};
  if (list) P.list.forEach(function (p) {
    var li = el('li', 'fr-pet'), cv = el('canvas'), txt = el('div'), name = el('b'), line = el('small');
    cv.setAttribute('aria-hidden', 'true'); txt.appendChild(name); txt.appendChild(line); li.appendChild(cv); li.appendChild(txt); list.appendChild(li);
    rows[p.id] = { li: li, name: name, line: line }; watch(cv, p.id);
  });
  function doorsOpen() { try { var v = JSON.parse(kept('localStorage', 'hmp:doors') || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function counts() {
    var n = P.count(), all = P.total();
    $$('[data-pet-n]').forEach(function (x) { x.textContent = String(n); });
    var chip = $('#pet-chip'); if (chip) chip.setAttribute('title', 'Dusk pets: ' + n + ' of ' + OF.hmp + ' found');
    P.list.forEach(function (p) {
      var r = rows[p.id]; if (!r) return; var f = P.has(p.id);
      r.li.classList.toggle('is-found', f);
      r.name.textContent = f ? p.name : 'Still out there';
      var how = p.how; if (p.id === 'tape-bat' && !f) { var o = doorsOpen().length; if (o) how += ' ' + o + ' of ' + DOORS.length + ' open so far.'; }
      r.line.textContent = f ? p.line : how;
    });
    var sum = $('#pet-sum'); if (sum) sum.textContent = n === OF.hmp ? 'All five dusk pets found.' : n + ' of ' + OF.hmp + ' found.';
    var sb = $('#pet-sb'), df = $('#pet-df'); if (sb) sb.textContent = all.sb + ' of ' + OF.sb; if (df) df.textContent = all.df + ' of ' + OF.df;
    var lat = $('#lattice'); if (lat) lat.hidden = all.all < OF.sb + OF.df + OF.hmp;
  }

  /* ---------- the slap-on card: kit Card, Tape, Sticker and Stamp, with the pet drawn by pets.draw ---------- */
  var layer = $('#found'), hideT = 0, cardCanvas = null;
  function hide(now) {
    clearTimeout(hideT); if (!layer || !layer.firstChild) return;
    var wrap = layer.firstChild;
    function gone() { if (cardCanvas) { unwatch(cardCanvas); cardCanvas = null; } layer.textContent = ''; }
    if (now || still()) { gone(); return; }
    wrap.classList.add('is-out'); setTimeout(gone, 340);
  }
  function hold() { clearTimeout(hideT); hideT = setTimeout(function () { if (layer && layer.contains(d.activeElement)) { hold(); return; } hide(); }, 7000); }
  function show(id) {
    var p = pet(id); if (!p || !layer) return;
    hide(true);
    var n = P.count(), wrap = el('div', 'fr-found__wrap'), card = el('article', 'hmp-card fr-found__card'), cv = el('canvas', 'fr-found__pet');
    var body = el('div', 'fr-found__body'), label = el('p', 'hmp-label', 'Dusk pet · ' + n + ' of ' + OF.hmp), h = el('h3', null, p.name), line = el('p', 'fr-found__line', p.line);
    var row = el('p', 'fr-found__row'), stampEl = el('span', 'hmp-stamp hmp-stamp--cue', 'found'), go = el('a', null, n === OF.hmp ? 'All five' : 'Your pets'), close = el('button', 'hmp-btn hmp-btn--ghost hmp-btn--sm', 'Close');
    wrap.setAttribute('data-hmp-slap', String(n + 4)); card.setAttribute('aria-labelledby', 'found-name'); h.id = 'found-name';
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', p.name + ', dancing');
    go.href = '#pets'; close.type = 'button'; close.addEventListener('click', function () { hide(); });
    row.appendChild(stampEl); row.appendChild(go); row.appendChild(close);
    body.appendChild(label); body.appendChild(h); body.appendChild(line);
    if (n === OF.hmp) body.appendChild(el('p', 'fr-found__line', 'Storeybrook and Depthfield count them too.'));
    body.appendChild(row); card.appendChild(cv); card.appendChild(body);
    var tape = el('span', 'hmp-tape hmp-tape--top'), stk = el('span', 'hmp-sticker hmp-sticker--magenta fr-found__n', n + '/' + OF.hmp);
    tape.setAttribute('aria-hidden', 'true'); stk.setAttribute('aria-hidden', 'true');
    wrap.appendChild(card); wrap.appendChild(tape); wrap.appendChild(stk);
    layer.appendChild(wrap);
    if (H.slap) H.slap(wrap);
    if (!still()) wrap.classList.add('is-in');
    cardCanvas = cv; watch(cv, p.id).big = true;
    hold(); counts();
  }
  function found(id) { if (P.find(id)) { show(id); return true; } return false; }

  /* ---------- peel a sticker: Vinyl ---------- */
  $$('.fr-peel').forEach(function (s) {
    var word = (s.textContent || '').trim();
    s.setAttribute('role', 'button'); s.tabIndex = 0; s.setAttribute('aria-label', 'Peel the ' + word + ' sticker');
    s.classList.add('hmp-sticker--live');
    function peel() {
      if (s.classList.contains('is-peeling')) return;
      s.classList.add('is-peeling'); setTimeout(function () { s.classList.remove('is-peeling'); }, 950);
      found('sticker-cat');
    }
    s.addEventListener('click', peel);
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); peel(); } });
  });

  /* ---------- stop the ticker: Snow ---------- */
  var tk = $('#ticker'), stop = $('#ticker-stop');
  if (tk && stop) stop.addEventListener('click', function () {
    var api = H.ticker ? H.ticker(tk) : null, run = tk.classList.contains('is-paused');
    if (api) { if (run) api.play(); else api.pause(); } else tk.classList.toggle('is-paused', !run);
    stop.textContent = run ? 'Stop the ticker' : 'Run the ticker';
    if (!run) found('static-moth');
  });

  /* ---------- hold on the misregistered heading until its plates slip: Offset ---------- */
  var hd = $('#h-parts'), held = 0;
  function arm() { if (held || !hd) return; hd.classList.add('is-holding'); held = setTimeout(function () { held = 0; hd.classList.add('is-slipped'); found('two-plate-koi'); }, 1200); }
  function disarm() { clearTimeout(held); held = 0; if (hd) hd.classList.remove('is-holding', 'is-slipped'); }
  if (hd) {
    hd.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') arm(); });
    hd.addEventListener('pointerleave', disarm);
    hd.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') arm(); });
    hd.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') disarm(); });
    hd.addEventListener('pointercancel', disarm);
  }

  /* ---------- switch to Zine: Postmark ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-hmp-theme="zine"]');
    if (b) setTimeout(function () { found('stamp-crab'); }, 30);   /* after the bundle has set the theme, so the card prints in Zine */
  });

  /* ---------- open every door: Flutter. A door leaves the page, so the card waits for your way back ---------- */
  var DOORS = $$('#doors .hmp-door');
  function markDoors() {
    var o = doorsOpen();
    DOORS.forEach(function (a) {
      var on = o.indexOf(a.getAttribute('data-door')) >= 0, m = $('.fr-door-mark', a);
      a.classList.toggle('is-opened', on);
      if (on && !m) { m = el('span', 'hmp-stamp hmp-stamp--cue fr-door-mark', 'opened'); a.appendChild(m); }
    });
  }
  function opened(a, stay) {
    var o = doorsOpen(), id = a.getAttribute('data-door');
    if (o.indexOf(id) < 0) { o.push(id); kept('localStorage', 'hmp:doors', JSON.stringify(o)); }
    markDoors(); counts();
    var all = DOORS.every(function (x) { return o.indexOf(x.getAttribute('data-door')) >= 0; });
    if (all && P.find('tape-bat')) { if (stay) show('tape-bat'); else kept('sessionStorage', 'hmp:pet-card', 'tape-bat'); }
  }
  DOORS.forEach(function (a) {
    a.addEventListener('click', function (e) { opened(a, e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank'); });
    a.addEventListener('auxclick', function (e) { if (e.button === 1) opened(a, true); });
  });
  function back() { var id = kept('sessionStorage', 'hmp:pet-card'); if (id) { kept('sessionStorage', 'hmp:pet-card', null); counts(); show(id); } }

  /* ---------- keep everything current ---------- */
  ['hmp:theme', 'hmp:still', 'resize'].forEach(function (n) { w.addEventListener(n, wake); });
  try { w.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', wake); } catch (e) { /* old browser */ }
  w.addEventListener('hmp:pet', counts);
  w.addEventListener('storage', function (e) { if (e.key === P.key || e.key === null) { counts(); wake(); } });   /* another tab found one */
  w.addEventListener('pageshow', function (e) { if (e.persisted) { counts(); markDoors(); back(); } });
  if (layer) layer.addEventListener('focusin', hold);
  var lat = $('#lattice a'); if (lat) lat.href = LATTICE;
  markDoors(); counts(); back(); wake();
})(window, document);
