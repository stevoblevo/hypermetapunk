// plan C4: CPU host contract evidence, not browser/device acceptance.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {createRenderer, materials, version} from '../v/0.2.0-materials.1/materials.mjs';
const dir = new URL('../v/0.2.0-materials.1/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', dir)));
for (const [name, sha] of Object.entries(manifest.files)) assert.equal(createHash('sha256').update(readFileSync(new URL(name, dir))).digest('hex'), sha);
assert.equal(version, manifest.version);
assert.equal(globalThis.Hypermetapunk, undefined);
assert.throws(() => createRenderer(), TypeError);
let allocations = 0;
const renderer = createRenderer({createCanvas(w,h) { allocations++; return createCanvas(w,h); }});
const canvas = createCanvas(240, 160), g = canvas.getContext('2d');
const hash = () => createHash('sha256').update(g.getImageData(0,0,240,160).data).digest('hex');
const hashes = new Set();
for (const {id} of materials) for (const layer of ['surface','subterrain']) {
  const o = Object.freeze({look:id,layer,seed:42, detail:0.2, paint:Object.freeze([Object.freeze({x:0.3,y:0.5})])});
  const before = JSON.stringify(o);
  renderer.render(g,o); const first = hash();
  renderer.render(g,o); assert.equal(hash(),first);
  assert.equal(JSON.stringify(o),before); hashes.add(first);
}
assert.equal(hashes.size,16);
assert.equal(allocations,1);
assert.equal(renderer.render(g,{width:-10,height:0}).width,1);
assert.equal(renderer.render(g,{width:8,height:99999,detail:0}).height,2048);
assert.equal(allocations,1);
// Existing current path, transform, alpha, shadow, filter, dash and clipping survive.
g.beginPath(); g.rect(0,0,25,25); g.clip();
g.beginPath(); g.rect(3,3,5,5);
g.translate(4,7); g.globalAlpha=0.3; g.shadowBlur=12; g.shadowColor='red'; g.setLineDash([3,7]);
const state = () => [Array.from(g.getTransform().toFloat64Array()), g.globalAlpha,g.shadowBlur,g.shadowColor,g.getLineDash()];
const before = state(); const outside = Array.from(g.getImageData(80,80,1,1).data);
renderer.render(g,{look:'contrast'}); assert.deepEqual(state(),before);
assert.deepEqual(Array.from(g.getImageData(80,80,1,1).data),outside);
g.setTransform(1,0,0,1,0,0); g.globalAlpha=1;g.shadowBlur=0;g.fillStyle='#ff0000';g.fill();
const pathCanvas=createCanvas(40,40), pathContext=pathCanvas.getContext('2d');
pathContext.beginPath();pathContext.rect(3,3,5,5);
renderer.render(pathContext,{width:40,height:40});
pathContext.fillStyle='#ff0000';pathContext.fill();
assert.deepEqual(Array.from(pathContext.getImageData(4,4,1,1).data),[255,0,0,255]);
// Invalid input is normalized without mutating host state; fresh surfaces avoid cross-call residue.
assert.equal(renderer.render(g,{look:'__proto__',width:NaN,height:Infinity,paint:[null,{}, {x:NaN,y:1}]}).look,'dusk');
assert.equal(renderer.render(g,null).width,240);
assert.throws(() => renderer.render(null),TypeError);
const bad = createRenderer({createCanvas:()=>canvas}); assert.throws(()=>bad.render(g),TypeError);
const originalDraw = g.drawImage;
g.drawImage=()=>{throw Error('injected host failure');};
const saved = state();assert.throws(()=>renderer.render(g),/injected/);assert.deepEqual(state(),saved);g.drawImage=originalDraw;
renderer.render(g);renderer.dispose();renderer.dispose();assert.throws(()=>renderer.render(g),/disposed/);
assert.throws(()=>{materials[0].id='changed';},TypeError);
console.log('PASS: manifest, 16 deterministic worlds, immutable inputs, single allocation, clipping/path/state, failure restoration, disposal');
