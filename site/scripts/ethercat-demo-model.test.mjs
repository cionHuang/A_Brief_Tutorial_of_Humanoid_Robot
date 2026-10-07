import test from 'node:test';
import assert from 'node:assert/strict';
import { JOINTS, DURATION, CHECKPOINTS, sampleDemo, nextCheckpoint } from '../src/lib/ethercat-demo-model.js';

test('each slave receives its own target in order before either mode moves that joint', () => {
  for (const mode of ['synchronized', 'received']) {
    for (const joint of JOINTS) {
      const receiveTime = sampleDemo(0, mode).joints[joint.index].receiveTime;
      const before = sampleDemo(receiveTime - 0.001, mode);
      assert.equal(before.receivedCount, joint.index);
      assert.equal(before.joints[joint.index].received, false);
      assert.equal(before.joints[joint.index].angle, 0);
      assert.equal(before.joints[joint.index].snapshot, null);
      const at = sampleDemo(receiveTime, mode);
      assert.equal(at.receivedCount, joint.index + 1);
      assert.equal(at.activeStation, joint.index);
      assert.equal(at.joints[joint.index].target, joint.kind === 'shoulder' ? 55 : 70);
      assert.equal(at.joints[joint.index].snapshot, 0);
      assert.equal(at.joints[joint.index].angle, 0);
    }
  }
});

test('scheduled execution waits for all commands; immediate execution visibly staggers the arms', () => {
  const waiting = sampleDemo(6.9);
  assert.equal(waiting.receivedCount, JOINTS.length);
  assert.ok(waiting.joints.every((joint) => joint.angle === 0));
  const lifting = sampleDemo(8.5);
  assert.equal(lifting.stage, 'move');
  assert.ok(lifting.joints.every((joint) => joint.startTime === 7));
  assert.ok(lifting.joints.every((joint) => joint.motionProgress === 0.5 && joint.angle === joint.target / 2));

  const staggered = sampleDemo(2, 'received');
  assert.ok(staggered.joints[0].angle > 0);
  assert.ok(staggered.joints.slice(1).every((joint) => joint.angle === 0));
  assert.equal(new Set(sampleDemo(6, 'received').joints.map((joint) => joint.startTime)).size, 4);
  for (let time = 0; time <= DURATION; time += 0.05) {
    for (const mode of ['synchronized', 'received']) {
      assert.ok(sampleDemo(time, mode).joints.every((joint) => joint.received || joint.angle === 0));
    }
  }
});

test('the first frame reports its earlier samples, never the current or future pose', () => {
  const inFlight = sampleDemo(5, 'received');
  assert.ok(inFlight.joints.some((joint) => joint.angle > 0));
  assert.ok(inFlight.joints.every((joint) => joint.snapshot === 0));
  assert.ok(inFlight.joints.every((joint) => joint.latestFeedback === null));
  const returned = sampleDemo(6.5, 'received');
  assert.ok(returned.joints.every((joint) => joint.latestFeedback === 0));
  assert.ok(returned.joints.every((joint) => joint.angle > joint.latestFeedback));
  assert.equal(returned.reportReady, false);
  assert.equal(returned.firstReportReady, true);
});

test('finished motion waits for the next frame without reverting to waiting for execution', () => {
  for (const [mode, finishTime] of [['synchronized', 10], ['received', 7.5]]) {
    assert.equal(sampleDemo(finishTime - 0.001, mode).stage, 'move');
    for (const time of [finishTime, (finishTime + 10.5) / 2, 10.499]) {
      const state = sampleDemo(time, mode);
      assert.equal(state.stage, 'settled');
      assert.equal(state.motionComplete, true);
      assert.equal(state.reportReady, false);
      assert.ok(state.joints.every((joint) => joint.angle === joint.target));
    }
    assert.equal(sampleDemo(10.5, mode).stage, 'feedback');
  }
});

test('station highlights start only after its matching command and feedback are available', () => {
  for (const mode of ['synchronized', 'received']) {
    for (const joint of sampleDemo(0, mode).joints) {
      assert.equal(sampleDemo(joint.receiveTime - 0.001, mode).activeStation, -1);
      assert.equal(sampleDemo(joint.sampleTime - 0.001, mode).activeStation, -1);
      assert.equal(sampleDemo(joint.receiveTime, mode).activeStation, joint.index);
      assert.equal(sampleDemo(joint.sampleTime, mode).activeStation, joint.index);
    }
    for (let time = 0; time <= DURATION; time += 0.005) {
      const state = sampleDemo(time, mode);
      if (state.activeStation === -1) continue;
      const joint = state.joints[state.activeStation];
      assert.equal(joint.received, true);
      assert.ok(state.receivedCount >= state.activeStation + 1);
      assert.equal(joint.snapshot, state.packet.leg === 'feedback-outbound' ? joint.target : 0);
    }
  }
});

test('only the later frame samples the raised pose, and the master waits for its return', () => {
  for (const mode of ['synchronized', 'received']) {
    const ended = sampleDemo(10, mode);
    assert.equal(ended.motionComplete, true);
    assert.ok(ended.joints.every((joint) => joint.angle === joint.target));
    assert.ok(ended.joints.every((joint) => joint.latestFeedback === 0));
    assert.equal(ended.reportReady, false);
    for (const joint of ended.joints) {
      const at = sampleDemo(joint.sampleTime, mode);
      assert.equal(at.joints[joint.index].snapshot, joint.target);
      assert.equal(at.joints[joint.index].initialFeedback, 0);
      assert.ok(at.joints.every((j) => j.latestFeedback === 0));
      assert.equal(at.reportReady, false);
    }
    assert.equal(sampleDemo(15.49, mode).reportReady, false);
    const returned = sampleDemo(15.5, mode);
    assert.equal(returned.reportReady, true);
    assert.equal(returned.stage, 'done');
    assert.ok(returned.joints.every((joint) => joint.latestFeedback === joint.target));
  }
});

test('frames travel out and return without teleporting; no live packet is shown while parked', () => {
  assert.deepEqual(sampleDemo(0).packet, { leg: 'home', progress: 0 });
  assert.deepEqual(sampleDemo(0.5).packet, { leg: 'outbound', progress: 0 });
  assert.deepEqual(sampleDemo(5.5).packet, { leg: 'return', progress: 0 });
  assert.deepEqual(sampleDemo(6).packet, { leg: 'return', progress: 0.5 });
  assert.equal(sampleDemo(6.5).packet.leg, 'home');
  assert.equal(sampleDemo(10.5).packet.leg, 'feedback-outbound');
  assert.equal(sampleDemo(14.5).packet.leg, 'feedback-return');
  assert.equal(sampleDemo(15.5).packet.leg, 'home');
  for (let time = 0; time <= DURATION; time += 0.03) {
    const state = sampleDemo(time);
    assert.ok(state.packet.progress >= 0 && state.packet.progress <= 1);
    if (!state.packet.leg.includes('outbound')) assert.equal(state.activeStation, -1);
  }
});

test('reset, bounded time, finite poses, and advancing checkpoints produce a stable final view', () => {
  assert.deepEqual(sampleDemo(-10), sampleDemo(0));
  assert.deepEqual(sampleDemo(NaN), sampleDemo(0));
  assert.deepEqual(sampleDemo(Infinity), sampleDemo(DURATION));
  assert.equal(sampleDemo(0).stage, 'ready');
  assert.ok(sampleDemo(0).joints.every((joint) => joint.angle === 0 && !joint.received));
  let time = 0;
  for (const checkpoint of CHECKPOINTS.slice(1)) {
    time = nextCheckpoint(time);
    assert.equal(time, checkpoint);
  }
  assert.equal(nextCheckpoint(time), DURATION);
  assert.equal(nextCheckpoint(-1), CHECKPOINTS[1]);
  for (const mode of ['synchronized', 'received']) {
    for (let time = 0; time <= DURATION; time += 0.03) {
      for (const joint of sampleDemo(time, mode).joints) {
        assert.ok(Number.isFinite(joint.angle));
        assert.ok(joint.angle >= 0 && joint.angle <= joint.target);
      }
    }
    assert.ok(sampleDemo(DURATION, mode).joints.every((joint) => !joint.active && joint.angle === joint.target));
  }
});
