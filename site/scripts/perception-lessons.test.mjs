import test from 'node:test';
import assert from 'node:assert/strict';
import {pixelToBody,loopFrame,routePoint} from '../src/lib/perception-lessons.js';
test('optical point transforms to body with camera mounting height',()=>{
 const {camera,body}=pixelToBody();
 camera.forEach((v,i)=>assert.ok(Math.abs(v-[.12,-.08,.8][i])<1e-12));
 body.forEach((v,i)=>assert.ok(Math.abs(v-[.9,-.12,.58][i])<1e-12));
 assert.equal(body[0],.1+camera[2]);assert.equal(body[1],-camera[0]);
});
test('loop correction leaves reference fixed and reduces accumulated closure error',()=>{
 const before=loopFrame(8),after=loopFrame(13);
 assert.deepEqual(routePoint(0),routePoint(1));
 assert.deepEqual(before.actual,after.actual);
 const error=s=>Math.hypot(...s.points.at(-1).map((v,i)=>v-s.actual[i]));
 assert.ok(error(after)<error(before));assert.ok(error(after)>0);
 assert.deepEqual(before.points[0],after.points[0]);
 assert.equal(loopFrame(9).correction,0);
});
