/* Immersive: let the page take the whole screen on phones and tablets.
   - Browsers allow full screen only after a person's tap, so the first tap on a touch screen asks for it
     (Android, iPad). Leaving full screen is respected for the rest of the visit; [data-immersive] buttons
     toggle it back.
   - iPhone Safari offers full screen only to sites opened from the Home Screen, so iPhones get a one-time
     hint, and the page ships a manifest and Apple meta so it opens there without Safari's bars.
   - The browser's own chrome is tinted to the page's ground as the look changes.
   Shared by both design-system sites; no dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, w = window;
  var site = (location.pathname.split('/')[1] || 'site');
  var OFF = 'immersive:off:' + site, HINTED = 'immersive:hinted';
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var app = w.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
  if (app) root.classList.add('is-app');
  var canFS = !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
  var iPhone = /iPhone|iPod/.test(navigator.userAgent);
  var touch = w.matchMedia('(pointer: coarse)').matches;

  function isFS() { return !!(d.fullscreenElement || d.webkitFullscreenElement); }
  function enter() {
    var f = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!f) return;
    try { var p = f.call(root, { navigationUI: 'hide' }); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function leave() {
    var f = d.exitFullscreen || d.webkitExitFullscreen;
    if (!f) return;
    try { var p = f.call(d); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }

  /* ---------- the toggle buttons ---------- */
  function buttons() { return Array.prototype.slice.call(d.querySelectorAll('[data-immersive]')); }
  function paint() {
    var on = isFS();
    root.classList.toggle('is-fullscreen', on);
    buttons().forEach(function (b) {
      b.hidden = app || (!canFS && !iPhone);
      b.setAttribute('aria-pressed', String(on));
      var label = on ? (b.getAttribute('data-off') || 'Exit full screen') : (b.getAttribute('data-on') || 'Full screen');
      var t = b.querySelector('[data-immersive-label]');
      if (t) t.textContent = label; else if (!b.children.length) b.textContent = label;
      b.setAttribute('aria-label', label); b.title = label;
    });
  }
  function toggle() {
    if (!canFS) { hint(true); return; }
    if (isFS()) { sset(OFF, '1'); leave(); } else { sset(OFF, ''); enter(); }
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-immersive]');
    if (b) { e.preventDefault(); toggle(); }
  });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (n) {
    d.addEventListener(n, function () { if (!isFS()) sset(OFF, '1'); paint(); });
  });

  /* ---------- the first tap on a touch screen goes full screen ---------- */
  if (canFS && touch && !app) {
    d.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' || isFS() || sget(OFF)) return;
      if (e.target.closest && e.target.closest('[data-immersive]')) return;
      enter();
    }, true);
  }

  /* ---------- iPhone: full screen lives on the Home Screen ---------- */
  function hint(force) {
    if (!iPhone || app || d.getElementById('immersive-hint')) return;
    if (!force && lget(HINTED)) return;
    lset(HINTED, '1');
    var card = d.createElement('div');
    card.id = 'immersive-hint'; card.setAttribute('role', 'status');
    card.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 76px);z-index:2147483000;' +
      'width:min(360px,calc(100vw - 32px));box-sizing:border-box;padding:14px 16px;border-radius:16px;display:flex;gap:12px;align-items:flex-start;' +
      'background:var(--page,var(--surface-raised,#fff));color:var(--ink,#111);box-shadow:0 18px 48px rgba(0,0,0,.28);font:15px/1.4 system-ui,sans-serif';
    card.innerHTML = '<span style="flex:1">For full screen on iPhone, tap <b>Share</b>, then <b>Add to Home Screen</b>. It opens without Safari’s bars.</span>' +
      '<button type="button" style="border:0;background:none;color:inherit;font:600 15px/1 system-ui,sans-serif;padding:4px;cursor:pointer">Got it</button>';
    card.querySelector('button').addEventListener('click', function () { card.remove(); });
    d.body.appendChild(card);
    setTimeout(function () { if (card.isConnected) card.remove(); }, 12000);
  }
  if (iPhone && !app && touch) setTimeout(hint, 2500);

  /* ---------- tint the browser's chrome to the page's ground ---------- */
  var meta = d.querySelector('meta[name="theme-color"]');
  if (!meta) { meta = d.createElement('meta'); meta.name = 'theme-color'; d.head.appendChild(meta); }
  function tint() {
    var cs = getComputedStyle(root), c = '';
    ['--paper', '--void', '--s-bg'].some(function (k) { c = cs.getPropertyValue(k).trim(); return !!c; });
    if (c) meta.setAttribute('content', c);
  }
  new MutationObserver(tint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  w.Immersive = { enter: enter, leave: leave, toggle: toggle, on: isFS, app: app, canFullscreen: canFS };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { paint(); tint(); }); else { paint(); tint(); }
})();
