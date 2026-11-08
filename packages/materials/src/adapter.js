// plan C4: optional host boundary. Static palettes, no DOM, timers or game state.
export const version = VERSION;
export const materials = Object.freeze(H.materials.map(({id, kind}) => Object.freeze({id, kind})));
const ids = new Set(materials.map(({id}) => id));
const finite = (v, fallback, min, max) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const record = value => value && typeof value === 'object' ? value : {};
function marks(value, brush) {
  if (!Array.isArray(value)) return [];
  return value.slice(-180).filter(m => m && Number.isFinite(m.x) && Number.isFinite(m.y)).map(m => ({
    x: finite(m.x, 0, 0, 1), y: finite(m.y, 0, 0, 1),
    radius: finite(m.radius, 17, 2, 80),
    ...(brush ? {direction: finite(m.direction, 0, -1, 1)} : {}),
  }));
}
/** The supplied factory must return a fresh, exclusively owned Canvas 2D surface. */
export function createRenderer({createCanvas} = {}) {
  if (typeof createCanvas !== 'function') throw new TypeError('createCanvas(width, height) is required');
  let canvas = null, disposed = false;
  return Object.freeze({
    render(context, input = {}) {
      if (disposed) throw new Error('Renderer is disposed');
      if (!context?.canvas || typeof context.drawImage !== 'function') throw new TypeError('Canvas 2D destination required');
      const o = record(input);
      const width = Math.floor(finite(o.width, context.canvas.width, 1, 2048));
      const height = Math.floor(finite(o.height, context.canvas.height, 1, 2048));
      if (!(width >= 1 && width <= 2048 && height >= 1 && height <= 2048)) throw new RangeError('Supply dimensions from 1 to 2048');
      // Dimension budgets are per renderer. Hosts own total allocations and frame budget.
      if (!canvas) canvas = createCanvas(width, height);
      if (!canvas || canvas === context.canvas || typeof canvas.getContext !== 'function') { canvas = null; throw new TypeError('Factory must return an independent canvas'); }
      const changed = canvas.width !== width || canvas.height !== height;
      if (changed) { canvas.width = width; canvas.height = height; }
      const g = canvas.getContext('2d');
      if (!g) throw new TypeError('Canvas 2D unavailable');
      // Reuse the surface. Reset prior clip/path/styles, including after an exception.
      if (typeof g.reset === 'function') g.reset();
      else if (!changed) canvas.width = width;
      const options = {
        width, height, look: ids.has(o.look) ? o.look : 'dusk',
        layer: o.layer === 'subterrain' ? 'subterrain' : 'surface',
        backgroundLook: ids.has(o.backgroundLook) ? o.backgroundLook : undefined,
        detail: finite(o.detail, 0.6, 0, 1), rain: finite(o.rain, 0.4, 0, 1),
        nap: finite(o.nap, 1, -1, 1), invert: o.invert === true,
        paint: marks(o.paint, false), brush: marks(o.brush, true),
      };
      const seed = Math.floor(finite(o.seed, 1947, 0, 0xffffffff));
      H.worlds.draw(g, {seed}, options);
      context.save();
      try {
        // Pixel-space contract. Host clipping remains effective; current path untouched.
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
        context.shadowBlur = 0; context.shadowOffsetX = 0; context.shadowOffsetY = 0;
        context.shadowColor = 'rgba(0,0,0,0)';
        if ('filter' in context) context.filter = 'none';
        context.drawImage(canvas, 0, 0);
      } finally { context.restore(); }
      return Object.freeze({version, look: options.look, layer: options.layer, width, height, seed, inverted:options.invert, animated:false});
    },
    dispose() { if (canvas) { canvas.width = 0; canvas.height = 0; canvas = null; } disposed = true; },
  });
}
