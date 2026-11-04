// A quick check for any agent before pushing: the front page and the docs in all three themes, desktop and phone.
// Fails on a console error, a page check (taste) warning on the front page, sideways scroll at 390 px, or a docs
// page without all its previews. Needs Playwright with Chromium; serves the repo itself on a free port.
//   node tools/check.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = normalize(join(fileURLToPath(import.meta.url), '..', '..'));
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(await readFile(file)); }
  catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

let playwright;
try { playwright = await import('playwright'); }
catch { try { playwright = createRequire(import.meta.url)('playwright'); /* a global install (NODE_PATH) */ } catch { console.log('Playwright is not installed here; skipping the browser check.'); server.close(); process.exit(0); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const browser = await playwright.chromium.launch();
const watch = (page, tag) => {
  page.on('pageerror', e => problems.push(`${tag}: ${String(e).slice(0, 200)}`));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) problems.push(`${tag}: ${m.text().slice(0, 200)}`); });
};
const desk = await browser.newPage({ viewport: { width: 1360, height: 860 } }); watch(desk, 'desktop');
for (const theme of ['dusk', 'zine', 'contrast']) {
  await desk.goto(`${base}/?theme=${theme}`); await sleep(1500);
  const warn = await desk.evaluate(() => window.Hypermetapunk.taste({ log: false }).filter(f => f.severity === 'warn').map(f => `${f.rule}: ${f.sample}`));
  warn.forEach(w => problems.push(`front (${theme}) taste: ${w}`));
}
await desk.goto(`${base}/docs.html#/components`); await sleep(3000);
const previews = await desk.evaluate(() => document.querySelectorAll('iframe').length);
const comps = JSON.parse(await readFile(join(ROOT, 'site', 'site.json'), 'utf8')).components.length;
if (previews < comps) problems.push(`docs: ${previews} previews for ${comps} components`);
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); watch(phone, 'phone');
for (const path of ['/', '/docs.html']) {
  await phone.goto(base + path); await sleep(1500);
  const over = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) problems.push(`phone ${path}: ${over}px sideways scroll`);
}
await browser.close(); server.close();
if (problems.length) { console.log('Problems:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log(`OK: front page in three themes, ${previews} previews, no sideways scroll at 390 px, no console errors.`);
