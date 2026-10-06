/** Single-joint teaching model. All electrical/mechanical quantities are referred
 * to the joint output (including gearing); these are not G1 parameters. */
export const SERVO_ARM = Object.freeze({
  length: 0.72, armMass: 1.2, payloadMass: 0.75, payloadRadius: 0.65,
  gravity: 9.81, inertia: 0.26, damping: 0.45,
  torqueConstant: 5, backEmfConstant: 5, resistance: 1.6, inductance: 0.012,
  voltageLimit: 24, currentLimit: 4, speedLimit: 1.8,
  positionGain: 3.3, velocityGain: 1.4, velocityIntegral: 3,
  currentGain: 3, currentIntegral: 200, raisedAngle: Math.PI / 2,
});
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function createServoArmState() {
  return { time: 0, angle: 0, speed: 0, current: 0, target: 0,
    payload: false, velocityIntegral: 0, currentIntegral: 0,
    targetSpeed: 0, targetCurrent: 0, voltage: 0, pushUntil: -1,
    gravityTorque: 0, motorTorque: 0 };
}
export function servoArmInertia(state) {
  return SERVO_ARM.inertia + (state.payload ? SERVO_ARM.payloadMass * SERVO_ARM.payloadRadius ** 2 : 0);
}
export function servoArmGravity(state) {
  const p = SERVO_ARM;
  return p.gravity * (p.armMass * p.length / 2 + (state.payload ? p.payloadMass * p.payloadRadius : 0)) * Math.sin(state.angle);
}
export function setServoPayload(state, on) {
  const before = servoArmInertia(state);
  state.payload = Boolean(on);
  // Added mass is initially at rest; removing it leaves the arm's speed unchanged.
  if (on) state.speed *= before / servoArmInertia(state);
}
export function pushServoArm(state) { state.pushUntil = state.time + 0.3; }
export function stepServoArm(state, seconds) {
  const p = SERVO_ARM;
  // Substeps resolve electrical RL dynamics independently of display frame rate.
  const steps = Math.max(1, Math.ceil(seconds / 0.0005));
  const dt = seconds / steps;
  for (let k = 0; k < steps; k++) {
    const targetSpeed = clamp(p.positionGain * (state.target - state.angle), -p.speedLimit, p.speedLimit);
    const speedError = targetSpeed - state.speed;
    const currentRaw = p.velocityGain * speedError + state.velocityIntegral;
    const targetCurrent = clamp(currentRaw, -p.currentLimit, p.currentLimit);
    // Conditional integration: no windup into a saturated actuator.
    if (Math.abs(currentRaw) < p.currentLimit || speedError * currentRaw < 0)
      state.velocityIntegral += p.velocityIntegral * speedError * dt;
    const currentError = targetCurrent - state.current;
    const voltageRaw = p.resistance * targetCurrent + p.backEmfConstant * state.speed
      + p.currentGain * currentError + state.currentIntegral;
    const voltage = clamp(voltageRaw, -p.voltageLimit, p.voltageLimit);
    if (Math.abs(voltageRaw) < p.voltageLimit || currentError * voltageRaw < 0)
      state.currentIntegral += p.currentIntegral * currentError * dt;
    state.current += (voltage - p.resistance * state.current - p.backEmfConstant * state.speed) / p.inductance * dt;
    const gravityTorque = servoArmGravity(state);
    const pushTorque = state.time < state.pushUntil ? -5 : 0;
    const motorTorque = p.torqueConstant * state.current;
    state.speed += (motorTorque - gravityTorque - p.damping * state.speed + pushTorque) / servoArmInertia(state) * dt;
    state.angle += state.speed * dt;
    Object.assign(state, { targetSpeed, targetCurrent, voltage, gravityTorque, motorTorque });
    state.time += dt;
  }
  return state;
}
