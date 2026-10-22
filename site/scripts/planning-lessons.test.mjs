import test from 'node:test';
import assert from 'node:assert/strict';
import {createReachPaths,handPosition,distance,mix,createMpcSequence,predict,timing} from '../src/lib/planning-lessons.js';
import {PHY} from '../src/lib/g1-arm-physics.js';
test('G1 straight hand path is reachable, continuous and distinct from joint interpolation',()=>{
 const paths=createReachPaths();
 for(let i=0;i<=100;i++){
  const q=paths.cartesian[i];assert.ok(distance(handPosition(q),mix(paths.a,paths.b,i/100))<.0002);
  q.forEach((v,j)=>assert.ok(v>=PHY.chain[j].lo&&v<=PHY.chain[j].hi));
  if(i)assert.ok(Math.max(...q.map((v,j)=>Math.abs(v-paths.cartesian[i-1][j])))<.1);
 }
 assert.ok(Math.max(...paths.joint.map((q,i)=>distance(handPosition(q),mix(paths.a,paths.b,i/100))))>.03);
 assert.deepEqual(paths.joint[0],paths.cartesian[0]);assert.ok(distance(paths.joint.at(-1),paths.cartesian.at(-1))<1e-10);
});
test('MPC predictions obey the double integrator and recede from observed state',()=>{
 const frames=createMpcSequence();
 for(let k=0;k<frames.length;k++){
  const f=frames[k],{states,controls,dt}=f.plan;
  for(let i=0;i<controls.length;i++){
   assert.ok(Math.abs(states[i+1][0]-states[i][0]-dt*states[i][1]-.5*dt*dt*controls[i])<1e-10);
  }
  if(k&&k!==5)assert.deepEqual(f.state,frames[k-1].plan.states[1]);
 }
 assert.equal(frames.filter(f=>f.disturbed).length,1);
 assert.ok(Math.abs(frames.at(-1).state[0]-1)<.005);
 assert.ok(Math.abs(frames.at(-1).offset[0])<.001);
 const p=predict([.5,.4]),other=predict([.5,0]);assert.notEqual(p.controls[0],other.controls[0]);
});
test('equal-time markers match integrated trapezoid velocity',()=>{
 assert.equal(timing(0),0);assert.equal(timing(1),1);
 const d=Array.from({length:12},(_,i)=>timing((i+1)/12)-timing(i/12));
 assert.ok(d[0]<d[1]&&d[1]<d[2]);assert.ok(Math.abs(d[4]-d[5])<1e-12);assert.ok(d[9]>d[10]&&d[10]>d[11]);
});
