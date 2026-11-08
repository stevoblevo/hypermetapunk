/* plan R2: only this preview's visit-local material state, never simulation. */
(function (w, d) {
  "use strict";
  var H = w.Hypermetapunk,
    c = d.getElementById("scene"),
    g = c.getContext("2d"),
    look = d.getElementById("look"),
    sky = d.getElementById("sky"),
    detail = d.getElementById("detail"),
    rain = d.getElementById("rain"),
    paint = d.getElementById("paint"),
    layer = d.getElementById("layer"),
    nap = d.getElementById("nap"),
    brush = d.getElementById("brush"),
    inversion = d.getElementById("inversion"),
    viewport = d.getElementById("palette-viewport"),
    status = d.getElementById("status");
  var marks = [],
    brushMarks = [],
    lastPoint = null,
    framePending = false,
    drawing = false,
    pointer = null;
  var descriptions = {
    rainprint:
      "Ink, paper fibres, fictional newsprint and accumulating crimson pigment.",
    schism:
      "Machined relays, floating data causeways and a pressure archive beneath.",
    steamfunk: "Weathered brass, pressure pipes and living colorful plumes.",
    raeverfaelt:
      "Directional felt pile, a soft threshold and a velvet kelp vault below.",
    strawberry: "Quieter cream, espresso, berry lacquer and restrained copper.",
    dusk: "The original neon horizon, chrome and a fine receding grid.",
    zine: "The original photocopy family, paper and ink.",
    contrast: "The original high-contrast family, held still.",
  };
  H.looks.forEach(function (l) {
    [look, sky].forEach(function (s) {
      var o = d.createElement("option");
      o.value = l.id;
      o.textContent = l.name;
      s.appendChild(o);
    });
  });
  look.value = "raeverfaelt";
  layer.value = "surface";
  nap.value = "100";
  inversion.setAttribute("aria-pressed", "false");
  brush.setAttribute("aria-pressed", "false");
  function say(t) {
    status.textContent = t;
  }
  function draw() {
    var id = look.value;
    H.theme.set(id, {
      keep: false,
    });
    var name = H.looks.find(function (l) {
      return l.id === id;
    }).name;
    d.getElementById("family-name").textContent = name;
    d.getElementById("family-line").textContent = descriptions[id];
    d.getElementById("detail-value").textContent = detail.value + "%";
    d.getElementById("rain-value").textContent = rain.value + "%";
    d.getElementById("nap-value").textContent =
      +nap.value < 0 ? "Against pile" : "With pile";
    var forcedColors =
      w.matchMedia && w.matchMedia("(forced-colors: active)").matches;
    var inverted =
      !forcedColors && inversion.getAttribute("aria-pressed") === "true";
    inversion.disabled = !!forcedColors;
    if (forcedColors) inversion.setAttribute("aria-pressed", "false");
    viewport.classList.toggle("inverted", inverted);
    inversion.textContent = forcedColors
      ? "Inversion off: system forced colors"
      : "Invert all colors: " + (inverted ? "on" : "off");
    sky.disabled = layer.value === "subterrain";
    nap.disabled = id !== "raeverfaelt";
    rain.disabled = id !== "rainprint";
    var box = c.getBoundingClientRect(),
      width = box.width || 1280,
      height = box.height || 660,
      dpr = Math.min(w.devicePixelRatio || 1, 2);
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    var receipt = H.worlds.draw(
      g,
      {
        seed: 1947,
      },
      {
        width: c.width,
        height: c.height,
        look: id,
        layer: layer.value,
        nap: +nap.value / 100,
        brush: brushMarks,
        detail: +detail.value / 100,
        rain: +rain.value / 100,
        paint: marks,
        backgroundLook: sky.value,
      },
    );
    if (layer.value === "subterrain")
      d.getElementById("family-line").textContent =
        receipt.name + ". Follow the pale guide cable to the lit grotto.";
    c.setAttribute(
      "aria-label",
      layer.value === "subterrain"
        ? "A small submersible follows a pale guide cable through a material-specific undersea grotto. " +
            receipt.name +
            "."
        : "A traveller follows a pale surface road toward a workshop, with material-specific landmarks.",
    );
  }
  function stop() {
    drawing = false;
    lastPoint = null;
    if (pointer !== null && c.hasPointerCapture && c.hasPointerCapture(pointer))
      c.releasePointerCapture(pointer);
    pointer = null;
  }
  function scheduleDraw() {
    if (!w.requestAnimationFrame) {
      draw();
      return;
    }
    if (framePending) return;
    framePending = true;
    w.requestAnimationFrame(function () {
      framePending = false;
      draw();
    });
  }
  function add(x, y, deferred) {
    marks.push({
      x: x,
      y: y,
      radius: 17,
    });
    if (marks.length > 180) marks.shift();
    if (deferred) scheduleDraw();
    else draw();
  }
  function point(e) {
    var b = c.getBoundingClientRect();
    if (!b.width || !b.height) return;
    var x = (e.clientX - b.left) / b.width,
      y = (e.clientY - b.top) / b.height;
    if (brush.getAttribute("aria-pressed") === "true") {
      var delta = lastPoint ? x - lastPoint.x : 0;
      brushMarks.push({
        x: x,
        y: y,
        direction:
          Math.abs(delta) > 0.0001 ? Math.sign(delta) : +nap.value / 100,
        radius: 65,
      });
      if (brushMarks.length > 64) brushMarks.shift();
      lastPoint = { x: x, y: y };
      scheduleDraw();
    } else add(x, y, true);
  }
  [look, sky, layer].forEach(function (x) {
    x.addEventListener("change", function () {
      stop();
      if (look.value !== "raeverfaelt") {
        brush.setAttribute("aria-pressed", "false");
        brush.textContent = "Rub felt: off";
        c.classList.toggle(
          "paint-on",
          paint.getAttribute("aria-pressed") === "true",
        );
      }
      draw();
      say("View changed. Only the study's materials and depth view changed.");
    });
  });
  [detail, rain, nap].forEach(function (x) {
    x.addEventListener("input", draw);
  });
  paint.addEventListener("click", function () {
    stop();
    var on = paint.getAttribute("aria-pressed") !== "true";
    brush.setAttribute("aria-pressed", "false");
    brush.textContent = "Rub felt: off";
    paint.setAttribute("aria-pressed", String(on));
    paint.textContent = "Paint by touch: " + (on ? "on" : "off");
    c.classList.toggle("paint-on", on);
    say(
      on
        ? "Draw pigment on the scene. Turn painting off to scroll normally."
        : "Painting off. Normal touch scrolling restored.",
    );
  });
  brush.addEventListener("click", function () {
    stop();
    var on = brush.getAttribute("aria-pressed") !== "true";
    brush.setAttribute("aria-pressed", String(on));
    brush.textContent = "Rub felt: " + (on ? "on" : "off");
    paint.setAttribute("aria-pressed", "false");
    paint.textContent = "Paint by touch: off";
    c.classList.toggle("paint-on", on);
    if (on) look.value = "raeverfaelt";
    draw();
    say(
      on
        ? "Stroke right to lay the pile down; left to rub it the other way. Normal scrolling returns when rubbing is off."
        : "Felt rubbing off. Normal touch scrolling restored.",
    );
  });
  inversion.addEventListener("click", function () {
    stop();
    inversion.setAttribute(
      "aria-pressed",
      String(inversion.getAttribute("aria-pressed") !== "true"),
    );
    draw();
    say(
      inversion.getAttribute("aria-pressed") === "true"
        ? "All study colors are inverted, including the interface. Geometry and state are unchanged."
        : "Original colors restored.",
    );
  });
  d.getElementById("reverse-nap").addEventListener("click", function () {
    stop();
    look.value = "raeverfaelt";
    nap.value = String(-(+nap.value || 100));
    brushMarks = [];
    draw();
    say(
      "The whole felt pile is brushed the opposite way. Activate again to reverse it.",
    );
  });
  c.addEventListener("pointerdown", function (e) {
    if (
      (paint.getAttribute("aria-pressed") !== "true" &&
        brush.getAttribute("aria-pressed") !== "true") ||
      pointer !== null ||
      e.button > 0
    )
      return;
    drawing = true;
    pointer = e.pointerId;
    c.setPointerCapture(pointer);
    point(e);
  });
  c.addEventListener("pointermove", function (e) {
    if (drawing && e.pointerId === pointer) point(e);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (n) {
    c.addEventListener(n, function (e) {
      if (e.pointerId === pointer) stop();
    });
  });
  w.addEventListener("blur", stop);
  d.addEventListener("visibilitychange", function () {
    if (d.hidden) stop();
  });
  d.getElementById("dab").addEventListener("click", function () {
    add(0.5, 0.78);
    say("One pigment dab placed in the river.");
  });
  d.getElementById("shower").addEventListener("click", function () {
    stop();
    brush.setAttribute("aria-pressed", "false");
    brush.textContent = "Rub felt: off";
    c.classList.toggle(
      "paint-on",
      paint.getAttribute("aria-pressed") === "true",
    );
    look.value = "rainprint";
    rain.value = String(Math.min(100, +rain.value + 10));
    draw();
    say(
      "A shower settled into the river and paper. Pigment " + rain.value + "%.",
    );
  });
  d.getElementById("reset").addEventListener("click", function () {
    stop();
    marks = [];
    brushMarks = [];
    layer.value = "surface";
    nap.value = "100";
    inversion.setAttribute("aria-pressed", "false");
    brush.setAttribute("aria-pressed", "false");
    brush.textContent = "Rub felt: off";
    detail.value = "60";
    rain.value = "40";
    sky.value = "";
    look.value = "raeverfaelt";
    paint.setAttribute("aria-pressed", "false");
    paint.textContent = "Paint by touch: off";
    c.classList.remove("paint-on");
    draw();
    say("View reset. No game state was changed.");
  });
  // bundle.js may finish applying a saved theme at DOMContentLoaded.
  // Reconcile this visit-only view after that lifecycle event, without writing it back.
  w.addEventListener("hmp:ready", draw);
  w.addEventListener("resize", draw);
  var forcedMedia = w.matchMedia && w.matchMedia("(forced-colors: active)");
  if (forcedMedia && forcedMedia.addEventListener)
    forcedMedia.addEventListener("change", draw);
  draw();
})(window, document);
