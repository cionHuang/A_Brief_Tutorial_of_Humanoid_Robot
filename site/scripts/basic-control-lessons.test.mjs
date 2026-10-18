import test from 'node:test';
import assert from 'node:assert/strict';
import {controlComparison} from '../src/lib/basic-control-lessons.js';
test('P and PD preserve load-induced offset, integral removes it',()=>{
 const {series,target}=controlComparison('pid');
 for(const c of series.slice(0,2))assert.ok(Math.abs(c.samples.at(-1).q-(target-1.6/c.kp))<.005);
 assert.ok(Math.abs(series[2].samples.at(-1).q-target)<.001);
 const peak=c=>Math.max(...c.samples.map(s=>s.q));
 assert.ok(peak(series[0])>target+.15);
 assert.ok(peak(series[1])<target);
});
test('same sustained force produces greater low-stiffness deflection and both return',()=>{
 const {series,target}=controlComparison('impedance');
 const samples=series.map(s=>s.samples.find(p=>p.t===8));
 assert.equal(samples[0].force,15);assert.equal(samples[1].force,15);
 assert.ok(target-samples[1].q>2*(target-samples[0].q));
 series.forEach((c,i)=>{
  const s=samples[i];assert.ok(Math.abs(c.kp*(target-s.q)-15*.3*Math.sin(s.q))<.001);
  assert.ok(Math.abs(c.samples.at(-1).q-target)<.001);
  assert.equal(c.samples.at(-1).force,0);
 });
});
