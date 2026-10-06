import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVO_ARM, createServoArmState, stepServoArm, setServoPayload, pushServoArm, servoArmGravity } from '../src/lib/servo-arm-model.js';
function run(state, seconds, frame = .01) {
  let min = state.angle, max = state.angle, maxCurrent = 0, maxVoltage = 0;
  for (let time = 0; time < seconds - 1e-9; time += frame) {
    stepServoArm(state, Math.min(frame, seconds - time));
    min = Math.min(min, state.angle); max = Math.max(max, state.angle);
    maxCurrent = Math.max(maxCurrent, Math.abs(state.current)); maxVoltage = Math.max(maxVoltage, Math.abs(state.voltage));
    assert.ok(Number.isFinite(state.angle) && Number.isFinite(state.current));
  }
  return { min, max, maxCurrent, maxVoltage };
}
function raised() { const s = createServoArmState(); s.target = SERVO_ARM.raisedAngle; run(s, 5); return s; }
test('initial hanging arm stays still; raising settles while supplying gravity holding current', () => {
  const s = createServoArmState(); run(s, 1);
  assert.equal(s.angle, 0); assert.equal(s.current, 0);
  s.target = SERVO_ARM.raisedAngle; const result = run(s, 5);
  assert.ok(Math.abs(s.angle - s.target) < .001);
  assert.ok(Math.abs(s.speed) < .001);
  assert.ok(s.current > .5, 'a horizontal arm requires nonzero current');
  assert.ok(Math.abs(s.current * SERVO_ARM.torqueConstant - servoArmGravity(s)) < .005);
  assert.ok(result.max < s.target + .03, 'gentle lift does not overshoot sharply');
  assert.ok(result.maxVoltage <= SERVO_ARM.voltageLimit);
  assert.ok(result.maxCurrent < SERVO_ARM.currentLimit + .1);
});
test('adding a payload makes the arm sag then recover with higher holding current', () => {
  const s = raised(), unloadedCurrent = s.current;
  setServoPayload(s, true); const result = run(s, 5);
  assert.ok(result.min < s.target - .015, 'load causes observable sag');
  assert.ok(result.min > s.target - .12, 'load does not make the arm collapse');
  assert.ok(Math.abs(s.angle - s.target) < .001);
  assert.ok(s.current > unloadedCurrent * 1.8);
  assert.ok(Math.abs(s.current * SERVO_ARM.torqueConstant - servoArmGravity(s)) < .005);
  setServoPayload(s, false); run(s, 5);
  assert.ok(Math.abs(s.current - unloadedCurrent) < .002);
});
test('brief downward push deflects the arm and closed loops restore the target', () => {
  const s = raised(); setServoPayload(s, true); run(s, 5); pushServoArm(s);
  const result = run(s, 5);
  assert.ok(result.min < s.target - .015);
  assert.ok(Math.abs(s.angle - s.target) < .001);
  assert.ok(Math.abs(s.speed) < .001);
});
test('display frame rate does not change the equilibrium', () => {
  const fine = createServoArmState(), coarse = createServoArmState();
  fine.target = coarse.target = SERVO_ARM.raisedAngle;
  setServoPayload(fine, true); setServoPayload(coarse, true);
  run(fine, 5, 1 / 120); run(coarse, 5, 1 / 25);
  assert.ok(Math.abs(fine.angle - coarse.angle) < .0001);
  assert.ok(Math.abs(fine.current - coarse.current) < .0001);
});
