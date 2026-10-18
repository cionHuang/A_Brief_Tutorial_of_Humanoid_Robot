/** Fixed teaching scenarios. Metres/seconds; playback slows physical time by 1/.22. */
export const W=Math.sqrt(9.81/.7);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
export function lipm(x,v,p,t){const c=Math.cosh(W*t),s=Math.sinh(W*t);return {x:p+(x-p)*c+v/W*s,v:(x-p)*W*s+v*c};}
export function recovery(t,large=false){
 const u=Math.max(0,t-2)*.22, speed=large?.46:.2;
 const landing=.55, before=large?lipm(0,speed,.10,landing):null;
 const stop=large?before.x+before.v/W:speed/W;
 let s;
 if(t<2)s={x:0,v:0};
 else if(large&&u<landing)s=lipm(0,speed,.10,u);
 else {const start=large?before:{x:0,v:speed},dt=large?u-landing:u; s={x:stop+(start.x-stop)*Math.exp(-W*dt),v:start.v*Math.exp(-W*dt)};}
 const progress=large?ease((u-.12)/(.55-.12)):0;
 const foot=large?stop-.035:0;
 const single=large&&u>.12&&u<landing;
 const p=t<2?0:large&&u<landing?.10:stop;
 return {...s,cp:s.x+s.v/W,p,a:W*W*(s.x-p),rightX:foot*progress,rightZ:single?.065*Math.sin(Math.PI*progress):0,shiftY:large?.065*Math.sin(Math.PI*clamp(u/1.1,0,1)):0,single,landed:large&&u>=landing,stop,foot,phase:t<2?0:large&&u<.12?1:single?2:large&&u<1?3:4};
}
export function reach(t){
 const arm=ease((t-1)/3),adjust=ease((t-4)/3),step=ease((t-9)/2.5),advance=ease((t-11.5)/3);
 return {arm,adjust,step,advance,pelvisX:-.045*adjust+.16*advance,pelvisY:.065*Math.sin(Math.PI*ease((t-8)/5)),rightX:.23*step,rightZ:t>9&&t<11.5?.065*Math.sin(Math.PI*step):0,waist:-.10*adjust,phase:t<1?0:t<4?1:t<8?2:t<11.5?3:4};
}
