// plan C4: sandboxed browser fixture. Failure is not device/visual acceptance.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const server=createServer(async(req,res)=>{try{
 const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);
 if(!path.startsWith(root.endsWith(sep)?root:root+sep))return res.writeHead(403).end();
 const data=await readFile(path);res.writeHead(200,{'content-type':({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream'}).end(data);
}catch{res.writeHead(404).end();}});
let browser;
try {
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({chromiumSandbox:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})});
 const errors=[];
 for(const dpr of [1,2]) {
 const context=await browser.newContext({deviceScaleFactor:dpr});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://127.0.0.1:${server.address().port}/packages/materials/examples/host.html`);
 await page.waitForFunction(()=>window.hostFixture);
 const snapshot=()=>page.evaluate(()=>JSON.stringify(hostFixture.state));
 const pixels=()=>page.evaluate(()=>document.querySelector('canvas').toDataURL());
 const resize=async width=>{
  await page.setViewportSize({width,height:800});
  // Explicit host draw also makes the resize check independent of event scheduling.
  await page.evaluate(()=>hostFixture.draw());
  const dimensions=await page.evaluate(()=>{const c=document.querySelector('canvas');return {width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width,dpr:devicePixelRatio};});
  assert.equal(dimensions.dpr,dpr);
  assert.equal(dimensions.width,Math.round(dimensions.cssWidth*dpr));
  assert.equal(dimensions.height,Math.round(dimensions.width*5/8));
 };
 const initial=await snapshot();
 for(const width of [320,390,1280]){
  await resize(width);
  for(const look of ['dusk','zine','contrast','rainprint','schism','steamfunk','raeverfaelt','strawberry'])for(const layer of ['surface','subterrain']){
   await page.selectOption('#look',look);await page.selectOption('#layer',layer);
   assert.equal(await snapshot(),initial);
  }
  const beforeResize=await pixels();
  await resize(width+16);assert.equal(await snapshot(),initial);
  await resize(width);assert.equal(await snapshot(),initial);
  assert.equal(await pixels(),beforeResize,'returning to the same size must reproduce pixels');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.ok(await page.evaluate(()=>Hypermetapunk===hostFixture.stable && Hypermetapunk.version==='0.1.3' && !Hypermetapunk.worlds));
 await page.click('#step');const moved=await snapshot();assert.notEqual(moved,initial);
 await page.click('#off');await page.click('#off');assert.equal(await snapshot(),moved);
 await page.emulateMedia({reducedMotion:'reduce'});
 const still=await pixels();await page.waitForTimeout(150);assert.equal(await pixels(),still);
 await mkdir(resolve(root,'test-results'),{recursive:true});await page.screenshot({path:resolve(root,`test-results/material-host-dpr${dpr}.png`),fullPage:true});
 await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: browser host coexistence, 96 world/viewport/DPR combinations, physical dimensions, resize round-trip pixels, unchanged gameplay state, fallback and still rendering');
} finally {await browser?.close();await new Promise(r=>server.close(r));}
