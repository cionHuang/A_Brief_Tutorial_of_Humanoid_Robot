import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PHY, INERTIAL, fk, gravityTorques, potentialEnergy, jointInertia, sagFrom } from '../src/lib/g1-arm-physics.js';
import { ARM_DYNAMICS as A, trajectory, gravity, forwardAcceleration, initialState, stepForward } from '../src/lib/arm-dynamics-model.js';
import { g1ArmPose } from '../src/lib/g1-arm-view.js';
const close = (a,b,tolerance=1e-7) => assert.ok(Math.abs(a-b)<tolerance,`${a} ≈ ${b}`);
const def = PHY.chain.map(j=>j.def*Math.PI/180);
const pose = angle => PHY.chain.map(j=>g1ArmPose(angle)[j.name]??0);

test('shared G1 masses, COMs and chain transforms match the source URDF',()=>{
  const source=readFileSync(new URL('../../robot_descriptions/g1/g1_29dof.urdf',import.meta.url),'utf8');
  const attr=(s,k)=>s.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1];
  const vec=s=>s.split(/\s+/).map(Number);
  for(const j of PHY.chain){
    const body=source.match(new RegExp(`<joint name="${j.name}"[^>]*>([\\s\\S]*?)<\\/joint>`))[1];
    const origin=body.match(/<origin([^>]*)/)[1];
    assert.deepEqual(j.xyz,vec(attr(origin,'xyz')));assert.deepEqual(j.rpy,vec(attr(origin,'rpy')));
    const link=source.match(new RegExp(`<link name="${j.link}"[^>]*>([\\s\\S]*?)<\\/link>`))[1];
    const inertial=link.match(/<inertial>([\s\S]*?)<\/inertial>/)[1];
    close(PHY.com[j.link].m,Number(attr(inertial.match(/<mass([^>]*)/)[1],'value')));
    assert.deepEqual(PHY.com[j.link].c,vec(attr(inertial.match(/<origin([^>]*)/)[1],'xyz')));
    for (const [key,value] of Object.entries(INERTIAL[j.link].tensor)) close(value,Number(attr(inertial.match(/<inertia\s([^>]*)/)[1],key)));
    assert.deepEqual(INERTIAL[j.link].rpy,vec(attr(inertial.match(/<origin([^>]*)/)[1],'rpy')??'0 0 0'));
    if(j.movable){assert.deepEqual(j.axis,vec(attr(body.match(/<axis([^>]*)/)[1],'xyz')));const limit=body.match(/<limit([^>]*)/)[1];close(j.lo,Number(attr(limit,'lower')));close(j.hi,Number(attr(limit,'upper')));}
  }
});
test('holding torque equals the potential-energy gradient, including own link and payload',()=>{
  for(const mass of [0,.5])for(const q of [def,pose(.4),pose(1.3)]){
    const G=gravityTorques(q,mass),eps=1e-6;
    PHY.chain.forEach((j,i)=>{
      if(!j.movable)return;
      const plus=q.slice(),minus=q.slice();plus[i]+=eps;minus[i]-=eps;
      close(G[j.name],(potentialEnergy(plus,mass)-potentialEnergy(minus,mass))/(2*eps));
    });
  }
});
test('adding the hand load increases default shoulder/elbow demand and sag without mutating target',()=>{
  const before=def.slice(),empty=sagFrom(def),loaded=sagFrom(def,.5);
  for(const i of [0,3]){
    const name=PHY.chain[i].name;
    assert.ok(Math.abs(loaded.G[name])>Math.abs(empty.G[name]));
    assert.ok(Math.abs(loaded.actual[i]-def[i])>Math.abs(empty.actual[i]-def[i]));
  }
  const hand=q=>fk(q).links.left_wrist_yaw_link.p;
  const distance=q=>Math.hypot(...hand(q).map((v,i)=>v-hand(def)[i]));
  assert.ok(distance(loaded.actual)>distance(empty.actual));
  assert.deepEqual(def,before);assert.deepEqual(sagFrom(def),empty);
});
test('one-joint inertia stays constant and analytic gravity matches all arm poses',()=>{
  for(let angle=0;angle<=A.max;angle+=.1){close(jointInertia(pose(angle),3),A.inertia);close(gravity(angle),-gravityTorques(pose(angle)).left_elbow_joint);}
  assert.ok(A.inertia>.02&&A.inertia<.06);
});
test('inverse and forward dynamics agree through acceleration, braking and holding',()=>{
  for(const duration of [A.slow,A.fast])for(let i=0;i<=120;i++){
    const s=trajectory(i*duration/100,duration);
    close(forwardAcceleration(s.angle,s.speed,s.torque),s.acceleration);
  }
  const start=trajectory(0,A.fast),hold=trajectory(A.fast+1,A.fast);
  close(start.angle,A.initial);close(start.speed,0);close(start.acceleration,0);
  close(hold.angle,A.target);close(hold.speed,0);close(hold.torque,gravity(A.target));
  assert.ok(trajectory(.25*A.fast,A.fast).torque>trajectory(.25*A.slow,A.slow).torque);
  assert.ok(trajectory(.75*A.fast,A.fast).torque<trajectory(.75*A.slow,A.slow).torque);
});
test('forward dynamics falls without torque, holds in balance, rises with extra torque, and stops at boundaries',()=>{
  const fall=initialState(),hold=initialState(),rise=initialState();
  stepForward(fall,0,.1);stepForward(hold,gravity(A.initial),1);stepForward(rise,2.5,.1);
  assert.ok(fall.angle<A.initial);close(hold.angle,A.initial);assert.ok(rise.angle>A.initial);
  stepForward(fall,0,3);stepForward(rise,2.5,3);assert.equal(fall.boundary,true);assert.equal(rise.boundary,true);
  close(fall.angle,A.min);close(rise.angle,A.max);
  const one=initialState(),many=initialState();stepForward(one,.8,.5);for(let i=0;i<50;i++)stepForward(many,.8,.01);
  close(one.angle,many.angle,1e-6);close(one.speed,many.speed,1e-6);
});

// Guided timelines retain the original comparisons with no free-form controls.
import { dynamicsLesson, gravityLesson, DYNAMICS_LENGTH, GRAVITY_LENGTH, GRAVITY_TARGET } from '../src/lib/arm-lesson-sequences.js';
test('guided dynamics compares two speeds and resets to the same pose before each force example',()=>{
  const slow=dynamicsLesson(4),fast=dynamicsLesson(7.5);
  close(slow.angle,A.target);close(fast.angle,A.target);
  close(dynamicsLesson(9).angle,A.initial);close(dynamicsLesson(12.5).angle,A.initial);
  assert.ok(dynamicsLesson(12.4).angle<A.initial);
  assert.ok(dynamicsLesson(16).angle>A.initial);
  assert.deepEqual(dynamicsLesson(100),dynamicsLesson(DYNAMICS_LENGTH));
  assert.deepEqual(dynamicsLesson(0),dynamicsLesson(-1));
});
test('guided load comparison adds mass before enabling compensation and ends exactly at target',()=>{
  const empty=gravityLesson(3.9),loaded=gravityLesson(7.9),compensated=gravityLesson(GRAVITY_LENGTH);
  assert.equal(empty.payloadMass,0);assert.equal(loaded.payloadMass,.5);assert.equal(compensated.payloadMass,.5);
  assert.equal(empty.compensation,false);assert.equal(loaded.compensation,false);assert.equal(compensated.compensation,true);
  assert.deepEqual(compensated.angles,GRAVITY_TARGET);
  assert.deepEqual(gravityLesson(4).angles,empty.angles);
  assert.deepEqual(gravityLesson(8).angles,loaded.angles);
  assert.deepEqual(gravityLesson(100),compensated);
  assert.deepEqual(gravityLesson(.1,true).angles,empty.angles);
});
