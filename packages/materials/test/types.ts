// plan C4: a representative browser host must type-check against the shipped API.
import {createRenderer, materials, RenderOptions} from '../v/0.2.0-materials.1/index';
const renderer = createRenderer({createCanvas:(w,h)=>new OffscreenCanvas(w,h)});
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;
const options: RenderOptions = {look:materials[0].id, seed:42, width:800, height:450,
  paint:Object.freeze([Object.freeze({x:0.3,y:0.5})])};
const result = renderer.render(ctx,options);
const still: false = result.animated;
renderer.dispose();
// @ts-expect-error Unknown material IDs must not silently enter typed hosts.
renderer.render(ctx,{look:'unregistered'});
