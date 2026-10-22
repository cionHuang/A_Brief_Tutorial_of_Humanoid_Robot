import {fk,PHY} from './g1-arm-physics.js';
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export const handPosition=q=>fk(q).links.left_rubber_hand.p;
export const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function solve(A,b){
 const n=b.length,M=A.map((r,i)=>[...r,b[i]]);
 for(let i=0;i<n;i++){
  let k=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[k][i]))k=j;
  [M[i],M[k]]=[M[k],M[i]];if(Math.abs(M[i][i])<1e-12)throw Error('Singular planning system');
  const d=M[i][i];for(let j=i;j<=n;j++)M[i][j]/=d;
  for(let j=0;j<n;j++)if(j!==i){const f=M[j][i];for(let k=i;k<=n;k++)M[j][k]-=f*M[i][k];}
 }
 return M.map(r=>r[n]);
}
/** Position-only damped IK, seeded by the previous sample to maintain continuity. */
export function solveHand(target,seed){
 let q=[...seed];
 for(let k=0;k<100;k++){
  const p=handPosition(q),e=target.map((v,i)=>v-p[i]);if(Math.hypot(...e)<1e-6)return q;
  const J=[0,1,2].map(()=>[]);
  for(let j=0;j<7;j++){const h=[...q];h[j]+=1e-4;const ph=handPosition(h);for(let i=0;i<3;i++)J[i][j]=(ph[i]-p[i])/1e-4;}
  const A=J.map((r,i)=>J.map((s,j)=>r.reduce((a,v,k)=>a+v*s[k],0)+(i===j?.00005:0)));
  const v=solve(A,e);q=q.map((x,j)=>clamp(x+clamp(J.reduce((a,r,i)=>a+r[j]*v[i],0),-.08,.08),PHY.chain[j].lo,PHY.chain[j].hi));
 }
 if(distance(handPosition(q),target)>.0002)throw Error('Teaching target unreachable');return q;
}
export function createReachPaths(){
 const start=[-.2,.4,0,1.35,0,0,0],a=handPosition(start),b=handPosition([-.95,.25,.1,.55,0,.25,0]);
 const cartesian=[start];for(let i=1;i<=100;i++)cartesian.push(solveHand(mix(a,b,i/100),cartesian.at(-1)));
 const end=cartesian.at(-1),joint=Array.from({length:101},(_,i)=>mix(start,end,i/100));
 return {start,end,a,b,joint,cartesian};
}
export function samplePath(path,s){const x=clamp(s)*(path.length-1),i=Math.min(path.length-2,Math.floor(x));return mix(path[i],path[i+1],x-i);}
/** Normalized trapezoid, acceleration/deceleration each occupy one quarter of time. */
export function timing(t){t=clamp(t);return t<.25?8/3*t*t:t<.75?1/6+(t-.25)*4/3:1-8/3*(1-t)**2;}
/** Finite-horizon quadratic optimization for scalar hand-path progress: double integrator.
 * State [progress, velocity], acceleration controls; position/velocity target [1,0].
 * No actuator or collision constraints: purpose is the receding-horizon feedback structure.
 */
export function predict(state,N=10,dt=.12,target=1){
 const free=Array.from({length:N},(_,k)=>[state[0]+(k+1)*dt*state[1]-target,state[1]]);
 const W=Array.from({length:N},(_,k)=>[k===N-1?50:2,k===N-1?8:.1]);
 const B=Array.from({length:N},(_,k)=>Array.from({length:N},(_,j)=>j<=k?[dt*dt*(k-j+.5),dt]:[0,0]));
 const H=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>B.reduce((sum,row,k)=>sum+row[i][0]*W[k][0]*row[j][0]+row[i][1]*W[k][1]*row[j][1],i===j?.08:0)));
 const rhs=Array.from({length:N},(_,i)=>-B.reduce((sum,row,k)=>sum+row[i][0]*W[k][0]*free[k][0]+row[i][1]*W[k][1]*free[k][1],0));
 const controls=solve(H,rhs),states=[state.slice()];
 for(const u of controls){const [s,v]=states.at(-1);states.push([s+dt*v+.5*dt*dt*u,v+dt*u]);}
 return {states,controls,dt};
}
export function createMpcSequence(){
 const frames=[];let state=[0,0],offset=[0,0];
 for(let k=0;k<30;k++){
  const disturbed=k===5;if(disturbed){state=[state[0],state[1]-.4];offset=[offset[0],-.12];}
  const plan=predict(state),offsetPlan=predict(offset,10,.12,0);frames.push({state:[...state],offset:[...offset],plan,offsetPlan,disturbed});state=[...plan.states[1]];offset=[...offsetPlan.states[1]];
 }
 return frames;
}
