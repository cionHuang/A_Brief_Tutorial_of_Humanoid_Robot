import {Matrix4,Quaternion,Euler,Vector3} from 'three';
import {joints,links} from './g1-balance-data.js';
const V=a=>new Vector3(...a);
const fixed=joints.map(j=>new Matrix4().compose(V(j.xyz),new Quaternion().setFromEuler(new Euler(...j.rpy,'ZYX')),new Vector3(1,1,1)));
export const neutral=Object.fromEntries(['left','right'].flatMap(s=>[[s+'_hip_pitch_joint',-.45],[s+'_knee_joint',.9],[s+'_ankle_pitch_joint',-.45],[s+'_shoulder_roll_joint',s==='left'?.12:-.12],[s+'_elbow_joint',.35]]));
export function fk(q={},root=[0,0,0]){const world={pelvis:new Matrix4().makeTranslation(...root)};joints.forEach((j,i)=>{const rot=new Matrix4().makeRotationAxis(V(j.axis),q[j.name]??0);world[j.child]=world[j.parent].clone().multiply(fixed[i]).multiply(rot);});return world;}
const position=m=>new Vector3().setFromMatrixPosition(m).toArray();
const base=fk(neutral),height=.035-position(base.left_ankle_roll_link)[2];
export const anchors=Object.fromEntries(['left','right'].map(s=>{const p=position(base[s+'_ankle_roll_link']);p[2]+=(height);return [s,p];}));
export function centerOfMass(q,root){const w=fk(q,root);let total=0,c=new Vector3();for(const [name,l] of Object.entries(links)){if(!w[name])continue;c.addScaledVector(V(l.c).applyMatrix4(w[name]),l.m);total+=l.m;}return c.multiplyScalar(1/total).toArray();}
function linear(A,b){A=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<b.length;i++){let k=i;for(let j=i+1;j<b.length;j++)if(Math.abs(A[j][i])>Math.abs(A[k][i]))k=j;[A[i],A[k]]=[A[k],A[i]];const d=A[i][i];if(Math.abs(d)<1e-12)return b.map(()=>0);for(let j=i;j<=b.length;j++)A[i][j]/=d;for(let k=0;k<b.length;k++)if(k!==i){const f=A[k][i];for(let j=i;j<=b.length;j++)A[k][j]-=f*A[i][j];}}return A.map(r=>r[b.length]);}
function solve(q,root,names,read,target,iterations=30){for(let n=0;n<iterations;n++){const cur=read(fk(q,root)),err=target.map((v,i)=>v-cur[i]);if(Math.hypot(...err)<1e-5)break;const columns=names.map(name=>{const prev=q[name]??0;q[name]=prev+1e-4;const next=read(fk(q,root));q[name]=prev;return next.map((v,i)=>(v-cur[i])/1e-4);});const a=columns.map((c,i)=>columns.map((d,j)=>c.reduce((s,v,k)=>s+v*d[k],0)+(i===j?1e-5:0)));const b=columns.map(c=>c.reduce((s,v,k)=>s+v*err[k],0));const delta=linear(a,b);names.forEach((name,i)=>{const j=joints.find(j=>j.name===name);q[name]=Math.max(j.lo,Math.min(j.hi,(q[name]??0)+Math.max(-.08,Math.min(.08,delta[i]))));});}}
export function balancePose(s,kind='capture'){
 const q={...neutral},root=[kind==='reach'?s.pelvisX:s.x,kind==='reach'?s.pelvisY:s.shiftY,height-(kind==='reach'?.035*s.step:0)];
 if(kind==='reach'){
 q.waist_pitch_joint=s.waist;
 q.left_shoulder_pitch_joint=-.3*s.arm;
 q.left_elbow_joint=.35*(1-s.arm);
 }
 for(const side of ['left','right']){
 const target=[...anchors[side]];if(side==='right'){target[0]+=s.rightX;target[2]+=s.rightZ;}
 const names=['hip_pitch','hip_roll','hip_yaw','knee','ankle_pitch','ankle_roll'].map(n=>side+'_'+n+'_joint');
 const read=w=>{const m=w[side+'_ankle_roll_link'],e=new Euler().setFromRotationMatrix(m,'XYZ');return [...position(m),e.x*.2,e.y*.2,e.z*.2];};
 solve(q,root,names,read,[...target,0,0,0]);
 }
 if(kind==='reach'&&s.arm>.999){
 // The nearer hand target stays fixed while the hips compensate; after the step,
 // the hand continues to the farther target. Solve in the sagittal plane.
 const start=fk({...neutral,left_shoulder_pitch_joint:-.3,left_elbow_joint:0},[0,0,height]);
 const p=position(start.left_rubber_hand),target=[p[0]+.14*s.advance,p[1],p[2]];
 solve(q,root,['left_shoulder_pitch_joint','left_shoulder_roll_joint','left_elbow_joint'],w=>position(w.left_rubber_hand),target);
 }
 const world=fk(q,root);
 return {q,root,com:centerOfMass(q,root),hand:position(world.left_rubber_hand),feet:Object.fromEntries(['left','right'].map(s=>[s,position(world[s+'_ankle_roll_link'])]))};
}
