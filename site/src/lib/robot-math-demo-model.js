// All teaching geometry uses right-handed coordinates, metres and radians.
export const DEG = Math.PI / 180;
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export const mul = (a, b) => a.map(row => b[0].map((_, j) => row.reduce((s, v, k) => s + v*b[k][j], 0)));
export const apply = (r, p) => r.map(row => dot(row, p));
export const transpose = r => r[0].map((_, j) => r.map(row => row[j]));
export const add = (a, b) => a.map((v, i) => v+b[i]);
export function rotationZYX(yaw, pitch, roll) {
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch), cr=Math.cos(roll), sr=Math.sin(roll);
  return [[cy*cp, cy*sp*sr-sy*cr, cy*sp*cr+sy*sr], [sy*cp, sy*sp*sr+cy*cr, sy*sp*cr-cy*sr], [-sp, cp*sr, cp*cr]];
}
export const transformPoint = (pose, point) => add(apply(pose.r, point), pose.p);
export const inversePoint = (pose, point) => apply(transpose(pose.r), point.map((v,i)=>v-pose.p[i]));
export const poseMatrix = pose => [...pose.r.map((row,i)=>[...row,pose.p[i]]),[0,0,0,1]];
export const BASE_POSE = Object.freeze({ p: Object.freeze([.30,.20,.80]), yaw: 40*DEG });
export function lessonPose(step=1, kind='translate', amount=0) {
  const p=[...BASE_POSE.p];
  let yaw=BASE_POSE.yaw;
  if (step===2 && kind==='translate') p[0]+=amount/100;
  if (step===2 && kind==='rotate') yaw+=amount*DEG;
  return {p,yaw,r:rotationZYX(yaw,0,0)};
}
export function composeLesson(basis, kind, progress=1) {
  const base=lessonPose(), angle=90*DEG*progress;
  if (kind==='translate') {
    const delta=[.10*progress,0,0];
    return {...base,p:add(base.p,basis==='world'?delta:apply(base.r,delta))};
  }
  const rd=rotationZYX(angle,0,0);
  return {p:basis==='world'?apply(rd,base.p):[...base.p],r:basis==='world'?mul(rd,base.r):mul(base.r,rd),yaw:base.yaw+angle};
}
export const pushPower = angle => 10 * .2 * Math.cos(angle*DEG);
export const doorTorque = (angle, distance) => 10*distance*Math.sin(angle*DEG);
