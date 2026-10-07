import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FAULT_RECOVERY_DEMO as DEMO,
  createFaultRecoveryState,
  actFaultRecovery,
  stepFaultRecovery,
  faultRecoverySnapshot,
} from '../src/lib/fault-recovery-model.js';

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const moving = () => stepFaultRecovery(actFaultRecovery(createFaultRecoveryState(), 'start'), 2);
const locked = () => stepFaultRecovery(actFaultRecovery(moving(), 'trip'), 1);
const cleared = () => actFaultRecovery(locked(), 'clear');

test('normal playback starts only on request and reaches the target in about eight seconds', () => {
  const initial = createFaultRecoveryState();
  assert.equal(initial.phase, 'ready');
  assert.deepEqual(stepFaultRecovery(initial, 100), initial);
  near(faultRecoverySnapshot(initial).angleDegrees, 20);
  const started = actFaultRecovery(initial, 'start');
  assert.equal(started.phase, 'running');
  near(started.angle, initial.angle);
  const before = stepFaultRecovery(started, 7.9);
  assert.equal(before.phase, 'running');
  const done = stepFaultRecovery(before, 0.1);
  assert.equal(done.phase, 'complete');
  near(faultRecoverySnapshot(done).angleDegrees, 80);
  assert.equal(done.speed, 0);
  assert.equal(actFaultRecovery(done, 'start').phase, 'complete');
  near(actFaultRecovery(done, 'start').angle, done.angle);
  assert.deepEqual(actFaultRecovery(done, 'reset'), initial);
});

test('a protection signal produces a controlled stop, then a stable fault latch', () => {
  const before = moving();
  const stopping = actFaultRecovery(before, 'trip');
  assert.equal(stopping.phase, 'stopping');
  assert.equal(stopping.faultPresent, true);
  near(stopping.angle, before.angle);
  near(stopping.speed, before.speed);
  const halfway = stepFaultRecovery(stopping, DEMO.stoppingSeconds / 2);
  assert.equal(halfway.phase, 'stopping');
  assert.ok(halfway.speed > 0 && halfway.speed < stopping.speed);
  assert.ok(halfway.angle > stopping.angle);
  const latched = stepFaultRecovery(halfway, 100);
  assert.equal(latched.phase, 'latched');
  assert.equal(latched.speed, 0);
  near(latched.target, DEMO.goalAngle);
  near(latched.angle, before.angle + before.speed * DEMO.stoppingSeconds / 2);
  assert.deepEqual(stepFaultRecovery(latched, 100), latched);
  assert.equal(faultRecoverySnapshot(latched).drivePowered, true);
  assert.equal(faultRecoverySnapshot(latched).motionPermitted, false);
});

test('clearing the trigger does not release the latch, move the arm, or permit a start', () => {
  const latched = locked();
  const clear = actFaultRecovery(latched, 'clear');
  assert.equal(clear.faultPresent, false);
  assert.equal(clear.phase, 'latched');
  assert.equal(clear.speed, 0);
  near(clear.angle, latched.angle);
  assert.deepEqual(stepFaultRecovery(clear, 1000), clear);
  const denied = actFaultRecovery(clear, 'start');
  assert.equal(denied.phase, 'latched');
  assert.match(denied.notice, /确认并检查/);
  near(denied.angle, clear.angle);
  assert.equal(faultRecoverySnapshot(clear).canStart, true);
  assert.equal(faultRecoverySnapshot(clear).motionPermitted, false);
});

test('a persisting fault rejects both recovery checking and a start', () => {
  const latched = locked();
  for (const event of ['check', 'start']) {
    const denied = actFaultRecovery(latched, event);
    assert.equal(denied.phase, 'latched');
    assert.equal(denied.faultPresent, true);
    assert.equal(denied.checked, false);
    assert.match(denied.notice, /故障/);
    near(denied.angle, latched.angle);
  }
  assert.equal(faultRecoverySnapshot(latched).canCheck, true);
});

test('display snapshots explain rejected checks and attempted starts', () => {
  const checkDenied = actFaultRecovery(locked(), 'check');
  assert.equal(faultRecoverySnapshot(checkDenied).story, checkDenied.notice);
  assert.match(faultRecoverySnapshot(checkDenied).story, /故障信号仍在/);
  const startDenied = actFaultRecovery(cleared(), 'start');
  assert.equal(faultRecoverySnapshot(startDenied).story, startDenied.notice);
  assert.match(faultRecoverySnapshot(startDenied).story, /运动许可尚未恢复/);
  const checking = actFaultRecovery(cleared(), 'check');
  const prematureStart = actFaultRecovery(checking, 'start');
  assert.equal(faultRecoverySnapshot(prematureStart).story, prematureStart.notice);
  assert.match(faultRecoverySnapshot(prematureStart).story, /检查尚未完成/);
});

test('checking holds position and a large frame cannot skip waiting for a separate start', () => {
  const start = actFaultRecovery(cleared(), 'check');
  assert.equal(start.phase, 'checking');
  const mid = stepFaultRecovery(start, 0.6);
  assert.equal(mid.phase, 'checking');
  near(mid.angle, start.angle);
  near(faultRecoverySnapshot(mid).checkProgress, 0.5);
  const denied = actFaultRecovery(mid, 'start');
  assert.equal(denied.phase, 'checking');
  assert.match(denied.notice, /检查尚未完成/);
  const ready = stepFaultRecovery(denied, 1000);
  assert.equal(ready.phase, 'ready');
  assert.equal(ready.checked, true);
  assert.equal(ready.speed, 0);
  near(ready.target, ready.angle);
  near(ready.angle, start.angle);
  assert.deepEqual(stepFaultRecovery(ready, 1000), ready);
  const restarted = actFaultRecovery(ready, 'start');
  assert.equal(restarted.phase, 'running');
  near(restarted.angle, ready.angle);
  assert.equal(restarted.speed, 0);
  near(restarted.target, DEMO.goalAngle);
  const firstFrame = stepFaultRecovery(restarted, 1 / 60);
  assert.ok(firstFrame.angle > ready.angle);
  assert.ok(firstFrame.angle - ready.angle < 0.001);
});

test('limiting slows continued motion and can later lead to a fault latch', () => {
  const normal = moving();
  const limited = actFaultRecovery(normal, 'limit');
  assert.equal(limited.phase, 'degraded');
  assert.equal(limited.limited, true);
  assert.equal(limited.faultPresent, false);
  assert.equal(faultRecoverySnapshot(limited).motionPermitted, true);
  near(limited.speed, normal.speed);
  const slow = stepFaultRecovery(limited, 1);
  assert.ok(slow.angle > limited.angle);
  assert.ok(slow.angle < stepFaultRecovery(normal, 1).angle);
  near(slow.speed, DEMO.limitedSpeed);
  const restored = actFaultRecovery(slow, 'unlimit');
  assert.equal(restored.phase, 'running');
  assert.equal(restored.limited, false);
  near(restored.angle, slow.angle);
  near(stepFaultRecovery(restored, 1).speed, DEMO.normalSpeed);
  const latched = stepFaultRecovery(actFaultRecovery(slow, 'trip'), 1);
  assert.equal(latched.phase, 'latched');
  assert.equal(latched.faultPresent, true);
  assert.equal(latched.speed, 0);
});

test('restoring movement permission does not silently remove a speed limitation', () => {
  let state = actFaultRecovery(moving(), 'limit');
  state = stepFaultRecovery(state, 1);
  state = stepFaultRecovery(actFaultRecovery(state, 'trip'), 1);
  state = stepFaultRecovery(actFaultRecovery(actFaultRecovery(state, 'clear'), 'check'), 2);
  assert.equal(state.phase, 'ready');
  assert.equal(state.limited, true);
  const resumed = actFaultRecovery(state, 'start');
  assert.equal(resumed.phase, 'degraded');
  near(resumed.angle, state.angle);
  near(stepFaultRecovery(resumed, 1).speed, DEMO.limitedSpeed);
});

test('transitions do not mutate state and invalid time cannot create invalid or backward motion', () => {
  const before = Object.freeze(moving());
  for (const dt of [-1, NaN, Infinity, -Infinity, '1', undefined]) {
    assert.deepEqual(stepFaultRecovery(before, dt), before);
  }
  const stopping = Object.freeze(actFaultRecovery(before, 'trip'));
  const stopped = stepFaultRecovery(stopping, Number.MAX_VALUE);
  assert.equal(stopped.phase, 'latched');
  assert.ok(Number.isFinite(stopped.angle));
  assert.equal(before.phase, 'running');
  assert.equal(stopping.phase, 'stopping');
  for (const event of ['start', 'trip', 'clear', 'check', 'limit', 'unlimit', 'reset', 'unknown']) {
    assert.doesNotThrow(() => actFaultRecovery(before, event));
  }
  for (const state of [createFaultRecoveryState(), before, stopping, stopped]) {
    assert.ok(state.angle >= DEMO.initialAngle && state.angle <= DEMO.goalAngle);
    assert.ok(state.speed >= 0 && Number.isFinite(state.speed));
  }
});

test('speed ramps and stopping travel do not depend on display frame partitioning', () => {
  const start = actFaultRecovery(createFaultRecoveryState(), 'start');
  let many = start;
  for (let i = 0; i < 120; i++) many = stepFaultRecovery(many, 1 / 60);
  const one = stepFaultRecovery(start, 2);
  near(many.angle, one.angle);
  near(many.speed, one.speed);
  many = actFaultRecovery(many, 'limit');
  for (let i = 0; i < 60; i++) many = stepFaultRecovery(many, 1 / 60);
  const limited = stepFaultRecovery(actFaultRecovery(one, 'limit'), 1);
  near(many.angle, limited.angle);
  near(many.speed, limited.speed);
  many = actFaultRecovery(many, 'trip');
  for (let i = 0; i < 60; i++) many = stepFaultRecovery(many, 1 / 60);
  const stopped = stepFaultRecovery(actFaultRecovery(limited, 'trip'), 1);
  assert.equal(many.phase, 'latched');
  near(many.angle, stopped.angle);
});

test('a fault near the destination still latches and stops within remaining travel', () => {
  const almostDone = stepFaultRecovery(actFaultRecovery(createFaultRecoveryState(), 'start'), 7.99);
  const stopping = actFaultRecovery(almostDone, 'trip');
  assert.ok(stopping.stopDuration > 0 && stopping.stopDuration < DEMO.stoppingSeconds);
  const halfway = stepFaultRecovery(stopping, stopping.stopDuration / 2);
  assert.ok(halfway.angle < DEMO.goalAngle);
  assert.ok(halfway.speed > 0 && halfway.speed < stopping.speed);
  const latched = stepFaultRecovery(halfway, 1);
  assert.equal(latched.phase, 'latched');
  near(latched.angle, DEMO.goalAngle);
  assert.equal(latched.speed, 0);
  assert.equal(latched.faultPresent, true);
});
