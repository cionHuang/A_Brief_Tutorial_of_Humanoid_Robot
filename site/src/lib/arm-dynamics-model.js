import { PHY, gravityTorques, jointInertia } from './g1-arm-physics.js';
import { g1ArmPose } from './g1-arm-view.js';

const pose = angle => {
  const values = g1ArmPose(angle);
  return PHY.chain.map(j => values[j.name] ?? 0);
};
export const ARM_DYNAMICS = Object.freeze({
  initial: 20 * Math.PI / 180, target: 80 * Math.PI / 180,
  slow: 3, fast: .4, damping: .04,
  inertia: jointInertia(pose(0), 3),
  min: 0, max: 100 * Math.PI / 180,
});
// The lesson angle increases while the URDF elbow coordinate decreases.
const gCos = -gravityTorques(pose(0)).left_elbow_joint;
const gSin = -gravityTorques(pose(Math.PI / 2)).left_elbow_joint;
export const gravity = angle => gCos * Math.cos(angle) + gSin * Math.sin(angle);
export const inverseTorque = (angle, speed, acceleration) =>
  ARM_DYNAMICS.inertia * acceleration + ARM_DYNAMICS.damping * speed + gravity(angle);
export const forwardAcceleration = (angle, speed, torque) =>
  (torque - gravity(angle) - ARM_DYNAMICS.damping * speed) / ARM_DYNAMICS.inertia;

export function trajectory(time, duration) {
  const u = Math.min(1, Math.max(0, time / duration));
  const delta = ARM_DYNAMICS.target - ARM_DYNAMICS.initial;
  const angle = ARM_DYNAMICS.initial + delta * (10*u**3 - 15*u**4 + 6*u**5);
  const speed = delta * (30*u**2 - 60*u**3 + 30*u**4) / duration;
  const acceleration = delta * (60*u - 180*u**2 + 120*u**3) / duration**2;
  return { angle, speed, acceleration, torque: inverseTorque(angle, speed, acceleration),
    stage: time <= 0 ? '准备' : time >= duration ? '保持' : u < .5 ? '加速抬起' : '减速到位' };
}
export function initialState() { return {angle: ARM_DYNAMICS.initial, speed:0, time:0, boundary:false}; }
// Fixed substeps with RK4 keep forward motion independent of display refresh rate.
export function stepForward(state, torque, dt) {
  let left = dt;
  while (left > 1e-10 && !state.boundary) {
    const h = Math.min(left, 1/240), a = state.angle, v = state.speed;
    const a1 = forwardAcceleration(a,v,torque);
    const v2 = v+h*a1/2, a2 = forwardAcceleration(a+h*v/2,v2,torque);
    const v3 = v+h*a2/2, a3 = forwardAcceleration(a+h*v2/2,v3,torque);
    const v4 = v+h*a3, a4 = forwardAcceleration(a+h*v3,v4,torque);
    state.angle += h*(v+2*v2+2*v3+v4)/6;
    state.speed += h*(a1+2*a2+2*a3+a4)/6;
    state.time += h; left -= h;
    if (state.angle < ARM_DYNAMICS.min || state.angle > ARM_DYNAMICS.max) {
      state.angle = Math.min(ARM_DYNAMICS.max,Math.max(ARM_DYNAMICS.min,state.angle));
      state.speed = 0; state.boundary = true;
    }
  }
  return state;
}
