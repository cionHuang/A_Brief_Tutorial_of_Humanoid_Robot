// Deterministic teaching models; angles in rad, torque in N·m, time in seconds.
export function controlComparison(kind) {
  const impedance = kind === 'impedance';
  const dt = .002, duration = impedance ? 13 : 10;
  const target = impedance ? 70 * Math.PI / 180 : .8;
  const cases = impedance
    ? [{name:'较高刚度',kp:60,kd:4,ki:0},{name:'较低刚度',kp:18,kd:4,ki:0}]
    : [{name:'P',kp:8,kd:0,ki:0},{name:'PD',kp:8,kd:2.8,ki:0},{name:'PID',kp:8,kd:2.8,ki:5}];
  const series = cases.map(config => {
    let q = impedance ? target : 0, v = 0, integral = 0;
    const samples = [];
    for(let i=0;i<=Math.round(duration/dt);i++) {
      const t=i*dt, force=impedance && t>=2 && t<9 ? 15 : 0;
      samples.push({t,q,v,force});
      const error=target-q;
      const request=config.kp*error-config.kd*v+config.ki*integral;
      const torque=Math.max(-12,Math.min(12,request));
      if(Math.abs(request)<=12 || request*error<0) integral+=error*dt;
      // Impedance: gravity compensated, identical downward hand force and effective arm length.
      const load=impedance ? force*.3*Math.sin(q) : 1.6;
      const inertia=impedance?.15:.35, friction=impedance?0:.35;
      v+=(torque-load-friction*v)/inertia*dt;
      q+=v*dt;
    }
    return {...config,samples};
  });
  return {dt,duration,target,series};
}
