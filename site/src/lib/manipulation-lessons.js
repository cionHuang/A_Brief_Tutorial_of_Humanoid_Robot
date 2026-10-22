import {Matrix4,Vector3,Quaternion,Euler} from 'three';
import joints from '../data/g1-manipulation-joints.json' with {type:'json'};
export {joints};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));};
const vec=a=>new Vector3(...a);
const rotation=(axis,q)=>new Matrix4().makeRotationAxis(vec(axis),q);
const origins=Object.fromEntries(Object.values(joints).flat().map(j=>[j.name,new Matrix4().compose(vec(j.xyz),new Quaternion().setFromEuler(new Euler(...j.rpy,'ZYX')),new Vector3(1,1,1))]));
/** Torso-fixed transforms from the vendored with-hand URDF, metres and radians. */
export function forward(side,q=[],fingers={}){
 const links={torso_link:new Matrix4()};let n=0;
 for(const j of joints[side]){
  let angle=0;if(j.axis)angle=j.name.includes('_hand_')?(fingers[j.name]||0):(q[n++]||0);
  links[j.child]=links[j.parent].clone().multiply(origins[j.name]);
  if(j.axis)links[j.child].multiply(rotation(j.axis,angle));
 }
 return links;
}
export const palm=(side,q)=>forward(side,q)[side+'_hand_palm_link'];
function linearSolve(A,b){const M=A.map((r,i)=>[...r,b[i]]),n=b.length;for(let i=0;i<n;i++){
 let k=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[k][i]))k=j;
 [M[i],M[k]]=[M[k],M[i]];if(Math.abs(M[i][i])<1e-12)throw Error('Singular arm solve');
 const d=M[i][i];for(let j=i;j<=n;j++)M[i][j]/=d;
 for(let j=0;j<n;j++)if(j!==i){const r=M[j][i];for(let k=i;k<=n;k++)M[j][k]-=r*M[i][k];}
 }return M.map(r=>r[n]);}
export function poseError(actual,target){
 const p=new Vector3().setFromMatrixPosition(target).sub(new Vector3().setFromMatrixPosition(actual));
 const a=new Quaternion().setFromRotationMatrix(actual),b=new Quaternion().setFromRotationMatrix(target),d=b.multiply(a.invert());
 if(d.w<0){d.x*=-1;d.y*=-1;d.z*=-1;d.w*=-1;}
 const s=Math.hypot(d.x,d.y,d.z),gain=s>1e-10?2*Math.atan2(s,d.w)/s:2;
 return [...p.toArray(),d.x*gain,d.y*gain,d.z*gain];
}
export function solvePalm(side,target,seed){
 let q=[...seed];const chain=joints[side].filter(j=>j.axis&&!j.name.includes('_hand_'));
 for(let k=0;k<180;k++){
  const here=palm(side,q),err=poseError(here,target);if(Math.hypot(...err.slice(0,3))<1e-5&&Math.hypot(...err.slice(3))<1e-4)return q;
  const weights=[1,1,1,.22,.22,.22],J=Array.from({length:6},()=>[]);
  for(let j=0;j<7;j++){const next=[...q];next[j]+=1e-4;const col=poseError(here,palm(side,next));for(let i=0;i<6;i++)J[i][j]=col[i]/1e-4*weights[i];}
  const H=J.map((a,i)=>J.map((b,j)=>a.reduce((s,v,k)=>s+v*b[k],0)+(i===j?1e-5:0)));
  const v=linearSolve(H,err.map((x,i)=>x*weights[i]));
  q=q.map((x,j)=>clamp(x+clamp(J.reduce((s,r,i)=>s+r[j]*v[i],0),-.12,.12),chain[j].lo,chain[j].hi));
 }
 const err=poseError(palm(side,q),target);if(Math.hypot(...err.slice(0,3))>.0005||Math.hypot(...err.slice(3))>.003)throw Error('Unreachable manipulation pose');return q;
}
export function fingerPose(side,close=1){
 const sign=side==='left'?1:-1,out={};
 const values={thumb_0:0,thumb_1:1,thumb_2:1.5,index_0:-.8,index_1:-(Math.PI*1.5-2.5-.8),middle_0:-.8,middle_1:-(Math.PI*1.5-2.5-.8)};
 for(const [name,v]of Object.entries(values))out[`${side}_hand_${name}_joint`]=v*sign*close;
 return out;
}
// Box handles match the same local three-finger grasp, mirrored across the torso.
export const GRIP_CENTER=[.085575,-.03765,0];
export const GRIP_ANGLE=2.5-Math.PI/2;
export const BOX_CENTER=[.37,0,.05];
export const BOX_HANDLES={left:[0,.16,0],right:[0,-.16,0]};
export function boxTransform(t){
 const shift=smooth((t-1)/3),turn=smooth((t-5)/4);
 return new Matrix4().compose(vec([.37+.015*shift,.018*shift,.05+.045*shift]),new Quaternion().setFromAxisAngle(vec([0,0,1]),.24*turn),vec([1,1,1]));
}
export function boxPalmTarget(side,t){
 const g=side==='left'?GRIP_CENTER:[GRIP_CENTER[0],-GRIP_CENTER[1],0];
 return boxTransform(t).multiply(new Matrix4().makeTranslation(...BOX_HANDLES[side].map((x,i)=>x-g[i])));
}
export function createBoxMotion(){
 const samples={left:[],right:[]};
 for(const side of ['left','right']){
  let q=[-.5,side==='left'?.2:-.2,0,.8,0,-.3,0];
  for(let i=0;i<=120;i++){q=solvePalm(side,boxPalmTarget(side,i/10),q);samples[side].push(q);}
 }
 return samples;
}
export function sampleArm(samples,t){const at=clamp(t,0,12)*10,i=Math.min(119,Math.floor(at)),u=at-i;return samples[i].map((v,j)=>v+(samples[i+1][j]-v)*u);}
// Teaching values: 80 g, mu=.5, opposing groups each provide N newtons.
export const GRASP={mass:.08,gravity:9.81,mu:.5,weakN:.3,strongN:1.2,lift:.065,liftSeconds:2};
export function graspState(t){
 const strong=t>=9,u=strong?t-9:t,stage=u<1.5?0:u<3?1:u<5?2:3;
 const closing=smooth((u-1.5)/1.5)*(1-smooth((u-7.5))),lifting=smooth((u-3)/2),lowering=smooth((u-6)/1.5);
 const handZ=GRASP.lift*(lifting-lowering),N=(strong?GRASP.strongN:GRASP.weakN)*closing;
 const weight=GRASP.mass*GRASP.gravity,capacity=2*GRASP.mu*N;
 const x=clamp((u-3)/2),a=u>=3&&u<=5?GRASP.lift/(2*2)*60*x*(1-x)*(1-2*x):0;
 const y=clamp((u-6)/1.5),downA=u>=6&&u<=7.5?-GRASP.lift/(1.5*1.5)*60*y*(1-y)*(1-2*y):0;
 const support=strong?Math.min(capacity,Math.max(0,weight+GRASP.mass*(a+downA))):capacity;
 return {strong,u,stage,closing,handZ,objectZ:strong?handZ:0,N,weight,capacity,support,approach:.035*(1-smooth(u/1.5)+smooth(u-8)),done:t>=18};
}
