// plan C4: immutable snapshots fail closed without partial file modification.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, appendFileSync, readdirSync, statSync, unlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const source=fileURLToPath(new URL('../../../',import.meta.url));
const root=mkdtempSync(resolve(tmpdir(),'hmp-immutable-'));
try {
 for(const path of ['packages/materials/build.mjs','packages/materials/src','experiments/materials/project']) {
  mkdirSync(dirname(resolve(root,path)),{recursive:true});cpSync(resolve(source,path),resolve(root,path),{recursive:true});
 }
 const build=()=>spawnSync(process.execPath,[resolve(root,'packages/materials/build.mjs')],{encoding:'utf8'});
 const dest=resolve(root,'packages/materials/v/0.2.0-materials.1');
 assert.equal(build().status,0,'initial version is created');
 const snapshot=()=>Object.fromEntries(readdirSync(dest).sort().map(name=>[name,{bytes:readFileSync(resolve(dest,name)).toString('base64'),mtime:statSync(resolve(dest,name)).mtimeMs}]));
 const original=snapshot();assert.equal(build().status,0);assert.deepEqual(snapshot(),original,'rebuild must perform no writes');
 // Change both outputs. Detection must happen before either could be rewritten.
 appendFileSync(resolve(root,'packages/materials/src/adapter.js'),'\n// changed source\n');
 appendFileSync(resolve(root,'packages/materials/src/index.d.ts'),'\n// changed declaration\n');
 let result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/Immutable snapshot/);assert.deepEqual(snapshot(),original,'mismatch cannot partially modify snapshot');
 // An incomplete existing snapshot is not silently repaired.
 unlinkSync(resolve(dest,'index.d.ts'));const incomplete=snapshot();
 result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/file inventory/);assert.deepEqual(snapshot(),incomplete);
 // A corrupted manifest is also protected after restoring other original bytes.
 for(const [name,{bytes}] of Object.entries(original))writeFileSync(resolve(dest,name),Buffer.from(bytes,'base64'));
 cpSync(resolve(source,'packages/materials/src'),resolve(root,'packages/materials/src'),{recursive:true});
 writeFileSync(resolve(dest,'manifest.json'),'corrupt manifest');const corrupt=snapshot();
 result=build();assert.notEqual(result.status,0);assert.match(result.stderr,/Immutable snapshot/);assert.deepEqual(snapshot(),corrupt);
 console.log('PASS: initial atomic snapshot, exact no-write rebuild, source mismatch/incomplete/corrupt snapshot fail without partial modification');
} finally {rmSync(root,{recursive:true,force:true});}
