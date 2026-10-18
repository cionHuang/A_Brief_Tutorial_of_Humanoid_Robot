export const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b,x));
export function pixelToBody() {
  const u=380,v=200,fx=400,fy=400,cx=320,cy=240,z=.8;
  const camera=[(u-cx)/fx*z,(v-cy)/fy*z,z];
  // Optical: right/down/forward. Body: forward/left/up; camera 0.1 m forward and 0.5 m above pelvis.
  return {camera,body:[.1+camera[2],-camera[0],.5-camera[1]]};
}
const corners=[[80,180],[80,65],[285,65],[285,180],[80,180]];
export function routePoint(u) {
  const t=clamp(u)*4,i=Math.min(3,Math.floor(t)),a=t-i;
  return corners[i].map((v,j)=>v+(corners[i+1][j]-v)*a);
}
export function loopFrame(time) {
  const progress=clamp(time/8),correction=clamp((time-10)/3);
  const actual=routePoint(progress);
  const points=Array.from({length:65},(_,i)=>{
    const u=progress*i/64,p=routePoint(u),remaining=1-.85*correction;
    return [p[0]+28*u*remaining,p[1]-18*u*remaining];
  });
  return {actual,points,correction,phase:time<8?0:time<10?1:time<13?2:3};
}
