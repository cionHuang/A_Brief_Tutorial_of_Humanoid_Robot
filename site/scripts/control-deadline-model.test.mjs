import test from 'node:test';
import assert from 'node:assert/strict';
import { DEADLINE_DEMO, deadlineSnapshot, advanceDeadlinePlayback } from '../src/lib/control-deadline-model.js';

const initial = (mode) => ({ mode, timeMs: 0, checkpointSeen: false, paused: false, finished: false });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

test('waiting consumes 0.9 ms before the same 1.2 ms of computation can begin', () => {
  const normal = deadlineSnapshot('normal', 0);
  const waiting = deadlineSnapshot('waiting', 0);
  assert.equal(normal.phase, 'computing');
  assert.equal(waiting.phase, 'waiting');
  assert.equal(normal.computeMs, waiting.computeMs);
  assert.equal(normal.computeMs, DEADLINE_DEMO.computeMs);
  assert.equal(normal.finishMs, 1.2);
  assert.equal(waiting.finishMs, 2.1);
  const blocked = deadlineSnapshot('waiting', 0.899999);
  assert.equal(blocked.phase, 'waiting');
  assert.equal(blocked.computeElapsedMs, 0);
  const released = deadlineSnapshot('waiting', 0.9);
  assert.equal(released.phase, 'computing');
  assert.equal(released.waitElapsedMs, 0.9);
  assert.equal(released.computeElapsedMs, 0);
  assert.equal(released.remainingComputeMs, 1.2);
  near(deadlineSnapshot('waiting', 1).computeElapsedMs, 0.1);
});

test('at the 2 ms deadline the waiting case still lacks a new command', () => {
  assert.equal(deadlineSnapshot('waiting', 0).late, true);
  assert.equal(deadlineSnapshot('waiting', 0).missedDeadline, false);
  assert.equal(deadlineSnapshot('waiting', 1.999999).missedDeadline, false);
  const deadline = deadlineSnapshot('waiting', 2);
  assert.equal(deadline.timeMs, 2);
  assert.equal(deadline.ready, false);
  assert.equal(deadline.phase, 'computing');
  assert.equal(deadline.missedDeadline, true);
  near(deadline.computeElapsedMs, 1.1);
  near(deadline.remainingComputeMs, 0.1);
  assert.equal(deadlineSnapshot('waiting', 2.1).missedDeadline, true);
  const normal = deadlineSnapshot('normal', 2);
  assert.equal(normal.ready, true);
  assert.equal(normal.late, false);
  assert.equal(normal.missedDeadline, false);
});

test('only full computation makes the next command ready, including exact completion boundaries', () => {
  for (const [mode, finish] of [['normal', 1.2], ['waiting', 2.1]]) {
    for (let time = 0; time < finish - 0.000001; time += 0.01) {
      const snapshot = deadlineSnapshot(mode, time);
      assert.equal(snapshot.ready, false, 'the previous command must remain in use');
      assert.notEqual(snapshot.phase, 'ready');
      assert.ok(snapshot.remainingComputeMs > 0);
    }
    assert.equal(deadlineSnapshot(mode, finish - 0.000001).ready, false);
    const complete = deadlineSnapshot(mode, finish);
    assert.equal(complete.ready, true);
    assert.equal(complete.phase, 'ready');
    assert.equal(complete.computeElapsedMs, 1.2);
    assert.equal(complete.remainingComputeMs, 0);
    let accumulated = 0;
    for (let i = 0; i < Math.round(finish * 10); i++) accumulated += 0.1;
    assert.deepEqual(deadlineSnapshot(mode, accumulated), complete);
  }
});

test('time is bounded and its elapsed wait plus elapsed computation is conserved', () => {
  for (const mode of ['normal', 'waiting']) {
    const beginning = deadlineSnapshot(mode, 0);
    const end = deadlineSnapshot(mode, Infinity);
    assert.deepEqual(deadlineSnapshot(mode, -1), beginning);
    assert.deepEqual(deadlineSnapshot(mode, NaN), beginning);
    assert.equal(end.timeMs, beginning.finishMs);
    for (let time = 0; time < 2.5; time += 0.017) {
      const snapshot = deadlineSnapshot(mode, time);
      near(snapshot.waitElapsedMs + snapshot.computeElapsedMs, snapshot.timeMs);
      near(snapshot.computeElapsedMs + snapshot.remainingComputeMs, snapshot.computeMs);
    }
  }
});

test('a large display-frame jump cannot skip the waiting-case deadline checkpoint', () => {
  const before = advanceDeadlinePlayback(initial('waiting'), 1.95);
  const checkpoint = advanceDeadlinePlayback(before, 100);
  assert.equal(checkpoint.timeMs, 2);
  assert.equal(checkpoint.paused, true);
  assert.equal(checkpoint.checkpointSeen, true);
  assert.equal(checkpoint.finished, false);
  assert.equal(deadlineSnapshot(checkpoint.mode, checkpoint.timeMs).ready, false);
  assert.deepEqual(advanceDeadlinePlayback(checkpoint, 100), checkpoint);
  const resumed = advanceDeadlinePlayback({ ...checkpoint, paused: false }, 0.05);
  near(resumed.timeMs, 2.05);
  assert.equal(resumed.paused, false);
  assert.equal(resumed.finished, false);
  const finished = advanceDeadlinePlayback(resumed, 100);
  assert.equal(finished.timeMs, 2.1);
  assert.equal(finished.paused, true);
  assert.equal(finished.finished, true);
  assert.deepEqual(advanceDeadlinePlayback(initial('waiting'), Infinity), checkpoint);
});

test('normal playback completes at 1.2 ms without an artificial deadline stop', () => {
  const finished = advanceDeadlinePlayback(initial('normal'), 100);
  assert.equal(finished.timeMs, 1.2);
  assert.equal(finished.paused, true);
  assert.equal(finished.finished, true);
  assert.equal(finished.checkpointSeen, false);
  assert.deepEqual(advanceDeadlinePlayback(finished, 100), finished);
});

test('pausing is stable, input state is immutable, and playback never goes backwards', () => {
  for (const mode of ['normal', 'waiting']) {
    const start = Object.freeze(initial(mode));
    const playing = advanceDeadlinePlayback(start, 0.5);
    assert.equal(start.timeMs, 0);
    assert.equal(playing.timeMs, 0.5);
    assert.deepEqual(advanceDeadlinePlayback(playing, -1), playing);
    assert.deepEqual(advanceDeadlinePlayback(playing, NaN), playing);
    const paused = { ...playing, paused: true };
    assert.deepEqual(advanceDeadlinePlayback(paused, 100), paused);
    assert.equal(advanceDeadlinePlayback({ ...paused, paused: false }, 0.1).timeMs, 0.6);
  }
});

test('replaying clears completion and permits the deadline checkpoint again', () => {
  let first = advanceDeadlinePlayback(initial('waiting'), 100);
  first = advanceDeadlinePlayback({ ...first, paused: false }, 100);
  assert.equal(first.finished, true);
  const replay = initial(first.mode);
  assert.equal(deadlineSnapshot(replay.mode, replay.timeMs).ready, false);
  const stoppedAgain = advanceDeadlinePlayback(replay, 100);
  assert.equal(stoppedAgain.timeMs, 2);
  assert.equal(stoppedAgain.paused, true);
  assert.equal(stoppedAgain.finished, false);
});
