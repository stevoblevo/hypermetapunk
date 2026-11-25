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
  // Public controls and API: selection survives a reload, themes keep separate choices,
  // reset restores defaults, and the docs preview follows host theme changes.
  await page.goto(`${base}/?theme=dusk`);
  await page.locator('[data-hmp-accent="#7fe9ff"]').click();
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get().requested),'#7fe9ff');
  await page.reload();
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get().requested),'#7fe9ff');
  await page.locator('[data-hmp-theme="zine"]').first().click();
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get()),null);
  await page.locator('[data-hmp-accent="#e8ff00"]').click();
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get().adjusted),true);
  await page.locator('[data-hmp-accent-input]').fill('#000000');
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get().requested),'#000000');
  await page.locator('[data-hmp-accent-reset]').click();
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get()),null);
  await page.evaluate(()=>{window.Hypermetapunk.init(); window.Hypermetapunk.init();});
  await page.locator('[data-hmp-accent="#ff5cba"]').press('Enter');
  assert.equal(await page.evaluate(()=>window.Hypermetapunk.accent.get().requested),'#ff5cba');
  await page.screenshot({path:join(ROOT,'test-results/accents-zine.png'),fullPage:true});
  await page.goto(`${base}/docs.html?theme=contrast#/components/Accent`);
  const accentFrame=page.frameLocator('iframe.frame').first();
  await accentFrame.locator('[data-hmp-accent="#ff914d"]').click();
  await accentFrame.locator('[data-hmp-accent-status]').waitFor();
  assert.match(await accentFrame.locator('[data-hmp-accent-status]').textContent(),/13:1/);
  await page.locator('iframe.frame').first().screenshot({path:join(ROOT,'test-results/accents-contrast.png')});
  // A paper card owns both its accent fill and its paired text ink.
  for (const theme of ['dusk','zine','contrast']) {
    await page.goto(`${base}/?theme=${theme}`);
    for (const accent of [null,'#000000','#ffffff','#e8ff00','#ff5cba','#05ffa1']) {
      const result=await page.evaluate(color=>{
        const H=window.Hypermetapunk; if(color) H.accent.set(color,{keep:false}); else H.accent.reset({keep:false});
        let fixture=document.getElementById('card-ink-fixture');
        if(!fixture){fixture=document.createElement('article'); fixture.id='card-ink-fixture'; fixture.className='hmp-card'; fixture.innerHTML='<button class="hmp-btn hmp-btn--accent">Nested accent</button>';document.body.appendChild(fixture);}
        const style=getComputedStyle(fixture.querySelector('button'));
        function lum(text){const v=text.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
        const a=lum(style.color),b=lum(style.backgroundColor);return {ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),color:style.color,background:style.backgroundColor};
      },accent);
      assert.ok(result.ratio >= 4.5,`${theme}/${accent}: nested card ${JSON.stringify(result)}`);
    }
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
  // family F9 and F10 (0.5.0): the plate. One drawing through the three themes, the moods in the looks data, and the phone headline at chrome's size.
  await page.goto(`${base}/docs.html?theme=dusk#/components/Plate`);
  const pf=await (await page.locator('iframe.frame').first().elementHandle()).contentFrame(); await pf.waitForSelector('#pv-row canvas >> nth=2');
  const plates=await pf.evaluate(()=>{const H=Hypermetapunk,src=document.createElement('canvas');src.width=src.height=200;const g=src.getContext('2d');g.fillStyle='#6b8fae';g.beginPath();g.arc(100,110,60,0,7);g.fill();g.fillStyle='#1f2a37';g.fillRect(60,150,80,30);
    const before=src.toDataURL(),seen={},out={moods:H.looks.map(l=>l.id+':'+l.mood),media:Object.keys(H.plate.media),version:H.plateVersion,plates:{}};
    H.looks.forEach(l=>{const c=H.plate(l.id,src),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,sum=0;for(let i=0;i<d.length;i+=4){if(d[i+3]===255)n++;sum+=d[i]+d[i+1]*3+d[i+2]*7;}out.plates[l.id]={w:c.width,h:c.height,opaque:n/(d.length/4),unique:!seen[sum]};seen[sum]=1;});
    out.sourceKept=src.toDataURL()===before; out.same=H.plate('zine',src).toDataURL()===H.plate('zine',src).toDataURL(); out.noWord=H.plate('dusk',src,{word:''}).toDataURL()!==H.plate('dusk',src).toDataURL();
    out.helpers=H.tint(src,'#f00').width===200&&H.edges(src,[0,0,0],2).height===200; out.named=document.querySelectorAll('canvas[role="img"][aria-label]').length; return out;});
  assert.deepEqual(plates.moods,['dusk:lit','zine:impact','contrast:impact']); assert.deepEqual(plates.media,['dusk','zine','contrast']); assert.equal(plates.version,'0.5.0');
  for(const [id,p] of Object.entries(plates.plates)){assert.equal(p.w,200,id);assert.equal(p.h,200,id);assert.ok(p.opaque>0.99,`${id} covers its ground`);assert.ok(p.unique,`${id} is its own picture`);}
  assert.ok(plates.sourceKept,'the source drawing is never changed'); assert.ok(plates.same,'a plate is deterministic'); assert.ok(plates.noWord,'the sound word can be left out'); assert.ok(plates.helpers,'tint and edges'); assert.equal(plates.named,5,'the source, the large plate and three small ones are named pictures');
  const hp=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); hp.on('pageerror',e=>problems.push(String(e)));
  for(const theme of ['dusk','zine','contrast']){ await hp.goto(`${base}/?theme=${theme}`); await hp.evaluate(()=>document.fonts.ready);
    assert.ok(await hp.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.fr-hero h1')).fontSize))>=32,`${theme}: the phone headline is at chrome's size`);
    assert.deepEqual(await hp.evaluate(()=>Hypermetapunk.taste({log:false}).filter(x=>x.severity==='warn')),[],`${theme} front-page taste at 390 px`);
    assert.equal(await hp.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme}: no sideways scroll at 390 px`); }
  await hp.close();
  // plan C5: the dusk pets. A clean context whose save already holds other kits' pets: every find must keep them.
  const pc = await browser.newContext({viewport:{width:1360,height:860}});
  const pets = await pc.newPage(); pets.on('pageerror',e=>problems.push(String(e)));
  await pets.goto(`${base}/?theme=dusk`);
  await pets.evaluate(()=>localStorage.setItem('crossing:pets',JSON.stringify({found:{'sb:egg':1,'df:winkle':2},active:{sb:'egg'}})));
  await pets.reload(); await pets.evaluate(()=>document.fonts.ready);
  assert.deepEqual(await pets.evaluate(()=>[Hypermetapunk.pets.count(),Hypermetapunk.pets.total()]),[0,{sb:1,df:1,hmp:0,all:2}]);
  assert.equal(await pets.locator('#lattice').isHidden(),true,'the lattice stays hidden until all seventeen');
  const seen=name=>pets.waitForFunction(n=>(document.querySelector('.fr-found h3')||{}).textContent===n,name,{timeout:5000});
  const card=async name=>{await seen(name); await pets.locator('.fr-found button').click(); await pets.waitForFunction(()=>!document.querySelector('#found').firstChild);};
  await pets.locator('.fr-peel').first().click(); await seen('Vinyl');
  assert.deepEqual(await pets.evaluate(()=>Hypermetapunk.taste({log:false}).filter(x=>x.severity==='warn')),[],'taste with the found card up');
  await card('Vinyl');
  await pets.locator('#ticker-stop').click(); await card('Snow');
  await pets.locator('#h-parts').hover(); await card('Offset');
  await pets.mouse.move(5,300);
  await pets.locator('[data-hmp-theme="zine"]').first().click(); await card('Postmark');
  await pets.evaluate(()=>{document.addEventListener('click',e=>{if(e.target.closest('.hmp-door'))e.preventDefault();},true); document.querySelectorAll('#doors .hmp-door').forEach(a=>a.click());});
  await pets.reload(); await seen('Flutter');   /* the doors lead away, so the card waits for the way back */
  const saved=await pets.evaluate(()=>JSON.parse(localStorage.getItem('crossing:pets')));
  assert.ok(saved.found['sb:egg']===1&&saved.found['df:winkle']===2&&saved.active.sb==='egg','other kits\' pets kept');
  assert.deepEqual(Object.keys(saved.found).filter(k=>k.startsWith('hmp:')).sort(),['hmp:stamp-crab','hmp:static-moth','hmp:sticker-cat','hmp:tape-bat','hmp:two-plate-koi']);
  assert.equal(await pets.evaluate(()=>Hypermetapunk.pets.find('hmp:sticker-cat')),false,'a find happens once');
  await pets.evaluate(()=>{const v=JSON.parse(localStorage.getItem('crossing:pets'));['egg','kit','octopus','bunny','sprite','pixie','saelion'].forEach(i=>v.found['sb:'+i]=1);['glass-bloom','mint-spore','frost-seed','winkle','firefly'].forEach(i=>v.found['df:'+i]=1);localStorage.setItem('crossing:pets',JSON.stringify(v));});
  await pets.reload();
  assert.deepEqual(await pets.evaluate(()=>Hypermetapunk.pets.total()),{sb:7,df:5,hmp:5,all:17});
  assert.equal(await pets.locator('#lattice a').getAttribute('href'),'https://stevoblevo.github.io/and-so/?lattice=1');
  assert.equal(await pets.locator('#lattice').isVisible(),true,'all seventeen open the lattice');
  await pets.screenshot({path:join(ROOT,'test-results/pets-front.png')});
  await pc.close();
  await page.emulateMedia({forcedColors:'active'});
  await page.goto(`${base}/docs.html?theme=contrast#/components/Chrome`);
  const fc=await page.locator('iframe.frame').first().contentFrame();await fc.locator('h1').waitFor();
  assert.equal(await fc.locator('h1').evaluate(el=>getComputedStyle(el).webkitTextStrokeWidth),'0px');
  assert.deepEqual(problems,[]);
  console.log(`PASS: three themes; ${count} docs previews; layered Chrome keyline; five dusk pets found and saved beside the family's; forced colours; 390px layout; no page exceptions.`);
} finally { if(browser) await browser.close(); server.close(); }
