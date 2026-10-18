import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {W,recovery,reach} from '../src/lib/balance-lessons.js';
import {balancePose,anchors} from '../src/lib/g1-balance-pose.js';
import {joints,links} from '../src/lib/g1-balance-data.js';
const near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
test('small push decelerates with feasible ZMP; large push requires the new support',()=>{
 assert.ok(recovery(2,false).cp<.12);assert.ok(recovery(2,true).cp>.12);
 for(const large of [false,true])for(let t=2.01;t<=14;t+=.03){const s=recovery(t,large);near(s.cp,s.x+s.v/W);assert.ok(s.p>=-.05&&s.p<=(s.landed?s.rightX:0)+.12);if(!large||s.landed)assert.ok(s.a<=0);assert.ok(s.v>=0);if(s.single)assert.ok(s.rightZ>0);}
 for(const large of [false,true]){const s=recovery(14,large);assert.ok(s.v<.001);near(s.x,s.stop,.001);}
 const before=recovery(4.5-1e-7,true),after=recovery(4.5+1e-7,true);near(before.x,after.x);near(before.v,after.v);near(after.cp,after.stop);near(after.rightZ,0);
});
test('G1 stepping keeps support feet planted and all joints inside URDF limits',()=>{
 for(const kind of ['capture','reach'])for(let t=0;t<=16;t+=.15){const s=kind==='reach'?reach(t):recovery(t,true),p=balancePose(s,kind);
 for(const side of ['left','right']){const target=anchors[side].map((v,i)=>v+(side==='right'?(i===0?s.rightX:i===2?s.rightZ:0):0));p.feet[side].forEach((v,i)=>near(v,target[i],3e-5));}
 for(const [name,v]of Object.entries(p.q)){const j=joints.find(j=>j.name===name);assert.ok(v>=j.lo&&v<=j.hi);}
 }
});
test('hand remains on its target while hips compensate, then reaches the farther target',()=>{
 const target=balancePose(reach(4),'reach').hand;
 for(let t=4;t<=16;t+=.1){const s=reach(t),p=balancePose(s,'reach');p.hand.forEach((v,i)=>near(v,target[i]+(i===0?.14*s.advance:0),5e-5));}
 assert.ok(balancePose(reach(7),'reach').com[0]<balancePose(reach(4),'reach').com[0]);
});
test('balance kinematic metadata matches the checked-in G1 model',()=>{
 const xml=readFileSync(new URL('../../robot_descriptions/g1/g1_29dof.urdf',import.meta.url),'utf8');
 const attr=(s,k)=>s.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1];const vec=s=>s.split(/\s+/).map(Number);
 for(const j of joints){const b=xml.match(new RegExp(`<joint name="${j.name}"[^>]*>([\\s\\S]*?)</joint>`))[1],o=b.match(/<origin([^>]*)/)?.[1];assert.deepEqual(j.xyz,vec(o?attr(o,'xyz')??'0 0 0':'0 0 0'));assert.deepEqual(j.rpy,vec(o?attr(o,'rpy')??'0 0 0':'0 0 0'));}
 for(const[name,l]of Object.entries(links)){const b=xml.match(new RegExp(`<link name="${name}"[^>]*>([\\s\\S]*?)</link>`))[1].match(/<inertial>([\s\S]*?)<\/inertial>/)[1];near(l.m,Number(attr(b.match(/<mass([^>]*)/)[1],'value')));assert.deepEqual(l.c,vec(attr(b.match(/<origin([^>]*)/)[1],'xyz')));}
});
