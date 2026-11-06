// Browser gate: real docs previews, theme changes, layered type and phone layout.
// Requires Playwright and a sandbox-capable Chromium. A missing browser is a failure.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const ROOT = normalize(join(fileURLToPath(import.meta.url), '..', '..'));
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.md':'text/markdown', '.webmanifest':'application/manifest+json' };
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url,'http://x').pathname);
    if(path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT,path));
    if(!file.startsWith(ROOT+sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file); res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream'}).end(data);
  } catch { res.writeHead(404).end('not found'); }
});
let browser;
try {
  const { chromium } = createRequire(import.meta.url)('playwright');
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base = `http://127.0.0.1:${server.address().port}`;
  await mkdir(join(ROOT,'test-results'),{recursive:true});
  browser = await chromium.launch({chromiumSandbox:true, ...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})});
  const problems=[];
  const page = await browser.newPage({viewport:{width:1360,height:860}});
  page.on('pageerror',e=>problems.push(String(e)));
  for(const theme of ['dusk','zine','contrast']) {
    await page.goto(`${base}/?theme=${theme}`);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>window.Hypermetapunk.theme.get()),theme);
    const warnings=await page.evaluate(()=>window.Hypermetapunk.taste({log:false}).filter(x=>x.severity==='warn'));
    assert.deepEqual(warnings,[],`${theme} front-page taste`);
    await page.goto(`${base}/docs.html?theme=${theme}#/components/Chrome`);
    const iframe=page.locator('iframe.frame').first(); await iframe.waitFor();
    const frame=await iframe.contentFrame();
    await frame.locator('h1').waitFor(); await frame.locator('h1').evaluate(el=>el.ownerDocument.fonts.ready);
    assert.equal(await frame.locator('h1').textContent(),'Strange work');
    if(theme==='contrast') {
      const outline=await frame.locator('h1').evaluate(el=>{const s=getComputedStyle(el);return {width:parseFloat(s.webkitTextStrokeWidth),stroke:s.webkitTextStrokeColor,fill:s.color,order:s.paintOrder};});
      assert.ok(outline.width>=3,`Layered chrome requires a solid keyline: ${JSON.stringify(outline)}`);
      assert.notEqual(outline.stroke,outline.fill,'The sun must not swallow white letters');
      assert.match(outline.order,/stroke/);
    }
    await iframe.screenshot({path:join(ROOT,`test-results/chrome-${theme}.png`)});
  }
  await page.goto(`${base}/docs.html#/components`);
  const count=JSON.parse(await readFile(join(ROOT,'site/site.json'),'utf8')).components.length;
  await page.waitForFunction(n=>document.querySelectorAll('iframe.frame').length===n,count);
  const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  phone.on('pageerror',e=>problems.push(String(e)));
  for(const path of ['/?theme=contrast','/docs.html?theme=contrast#/components/Chrome']) {
    await phone.goto(base+path); await phone.evaluate(()=>document.fonts.ready);
    assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Phone overflow: ${path}`);
  }
  await phone.screenshot({path:join(ROOT,'test-results/chrome-phone.png'),fullPage:true});
  await page.emulateMedia({forcedColors:'active'});
  await page.goto(`${base}/docs.html?theme=contrast#/components/Chrome`);
  const fc=await page.locator('iframe.frame').first().contentFrame();await fc.locator('h1').waitFor();
  assert.equal(await fc.locator('h1').evaluate(el=>getComputedStyle(el).webkitTextStrokeWidth),'0px');
  assert.deepEqual(problems,[]);
  console.log(`PASS: three themes; ${count} docs previews; layered Chrome keyline; forced colours; 390px layout; no page exceptions.`);
} finally { if(browser) await browser.close(); server.close(); }
