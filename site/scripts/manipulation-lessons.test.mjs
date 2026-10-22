import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {joints,palm,poseError,boxPalmTarget,createBoxMotion,sampleArm,fingerPose,graspState,GRASP} from '../src/lib/manipulation-lessons.js';

test('manipulation joint transforms and limits match the vendored with-hand URDF',()=>{
 const xml=readFileSync(new URL('../../robot_descriptions/g1/g1_29dof_with_hand.urdf',import.meta.url),'utf8');
 for(const chain of Object.values(joints))for(const j of chain){
  const block=xml.match(new RegExp(`<joint name="${j.name}"[\\s\\S]*?</joint>`))[0];
  for(const [attribute,want]of [['xyz',j.xyz],['rpy',j.rpy]]){
   const origin=block.match(/<origin[^>]*>/)[0],actual=origin.match(new RegExp(`${attribute}="([^"]+)"`))[1].split(/\s+/).map(Number);assert.deepEqual(actual,want);
  }
  if(j.axis){assert.deepEqual(block.match(/<axis xyz="([^"]+)"/)[1].split(/\s+/).map(Number),j.axis);for(const k of ['lower','upper'])assert.equal(Number(block.match(new RegExp(`${k}="([^"]+)"`))[1]),j[k==='lower'?'lo':'hi']);}
 }
});
test('both G1 palms maintain full grasp pose throughout box translation and rotation',()=>{
 const motion=createBoxMotion();
 for(const side of ['left','right']){
  const chain=joints[side].filter(j=>j.axis&&!j.name.includes('_hand_'));
  for(let i=0;i<=240;i++){
   const t=i/20,q=sampleArm(motion[side],t),e=poseError(palm(side,q),boxPalmTarget(side,t));
   assert.ok(Math.hypot(...e.slice(0,3))<.0005,`position at ${side} ${t}`);assert.ok(Math.hypot(...e.slice(3))<.003);
   q.forEach((v,k)=>assert.ok(v>=chain[k].lo&&v<=chain[k].hi));
   if(i){const prev=sampleArm(motion[side],t-.05);assert.ok(Math.max(...q.map((v,k)=>Math.abs(v-prev[k])))<.03);}
  }
  const closed=fingerPose(side);for(const j of joints[side].filter(j=>j.axis&&j.name.includes('_hand_')))assert.ok(closed[j.name]>=j.lo&&closed[j.name]<=j.hi);
 }
});
test('grasp comparison changes squeeze force with fixed weight and friction and preserves support',()=>{
 assert.ok(2*GRASP.mu*GRASP.weakN<GRASP.mass*GRASP.gravity);
 for(let u=3;u<=7.5;u+=.02){
  const weak=graspState(u),strong=graspState(u+9);
  assert.equal(weak.weight,strong.weight);assert.equal(weak.objectZ,0);assert.equal(strong.objectZ,strong.handZ);
  assert.ok(strong.capacity>strong.weight);assert.ok(strong.support<=strong.capacity);assert.ok(strong.support>0);
 }
 for(const t of [0,9,18]){const s=graspState(t);assert.ok(Math.abs(s.handZ)<1e-10);assert.equal(s.objectZ,0);assert.equal(s.closing,0);}
});
