/**
 * A single control-cycle teaching example, with all times expressed in ms.
 * These are illustrative costs, not measurements or guarantees for a robot.
 * The next command becomes available only when computation is complete; until
 * then the animation must keep displaying the previous command.
 */
export const DEADLINE_DEMO = Object.freeze({ computeMs: 1.2, deadlineMs: 2, waitMs: 0.9 });

// Much smaller than a visible teaching interval; this only absorbs arithmetic
// noise such as repeatedly adding 0.1 ms at an exact event boundary.
const EPSILON = 1e-9;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function normalizeMode(mode) {
  if (mode !== 'normal' && mode !== 'waiting') throw new RangeError('Unknown control deadline demo mode');
  return mode;
}

function boundedTime(value, finishMs, waitMs) {
  const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const time = clamp(numeric, 0, finishMs);
  for (const eventTime of [0, waitMs, DEADLINE_DEMO.deadlineMs, finishMs]) {
    if (eventTime <= finishMs && Math.abs(time - eventTime) <= EPSILON) return eventTime;
  }
  return time;
}

/**
 * `late` describes the scenario's total cost from the start, not whether the
 * visible clock has already passed its deadline. Use `missedDeadline` for the
 * latter: it becomes true at 2 ms in the waiting scenario and stays true.
 * `ready` is the sole signal that the new command can replace the old one.
 */
export function deadlineSnapshot(mode = 'normal', elapsedMs = 0) {
  normalizeMode(mode);
  const waitMs = mode === 'waiting' ? DEADLINE_DEMO.waitMs : 0;
  const computeMs = DEADLINE_DEMO.computeMs;
  const finishMs = waitMs + computeMs;
  const timeMs = boundedTime(elapsedMs, finishMs, waitMs);
  const ready = timeMs >= finishMs;
  const computeElapsedMs = ready ? computeMs : clamp(timeMs - waitMs, 0, computeMs);
  const late = finishMs > DEADLINE_DEMO.deadlineMs;
  return {
    timeMs, waitMs, computeMs, finishMs,
    phase: ready ? 'ready' : timeMs < waitMs ? 'waiting' : 'computing',
    computeElapsedMs,
    waitElapsedMs: Math.min(timeMs, waitMs),
    ready, late,
    missedDeadline: late && timeMs >= DEADLINE_DEMO.deadlineMs,
    remainingComputeMs: ready ? 0 : computeMs - computeElapsedMs,
  };
}

/**
 * Pure playback state transition. The first waiting-case frame that reaches
 * the 2 ms deadline pauses exactly there, even if a large animation-frame delta
 * would have jumped past completion. Resume by setting `paused` to false.
 * Replay with timeMs=0, checkpointSeen=false, paused=false, finished=false.
 * A completed state is paused; negative deltas and paused states never advance.
 */
export function advanceDeadlinePlayback(state, deltaMs = 0) {
  const snapshot = deadlineSnapshot(state.mode, state.timeMs);
  const current = {
    mode: state.mode,
    timeMs: snapshot.timeMs,
    checkpointSeen: Boolean(state.checkpointSeen),
    paused: Boolean(state.paused),
    finished: snapshot.ready,
  };
  if (current.finished) return { ...current, paused: true };
  if (current.paused) return current;

  const delta = typeof deltaMs === 'number' && !Number.isNaN(deltaMs) ? Math.max(0, deltaMs) : 0;
  const next = deadlineSnapshot(current.mode, current.timeMs + delta);
  const deadline = DEADLINE_DEMO.deadlineMs;
  if (current.mode === 'waiting' && !current.checkpointSeen
      && current.timeMs <= deadline && next.timeMs >= deadline) {
    return { ...current, timeMs: deadline, checkpointSeen: true, paused: true };
  }
  return {
    ...current,
    timeMs: next.timeMs,
    checkpointSeen: current.checkpointSeen || (current.mode === 'waiting' && next.timeMs >= deadline),
    paused: next.ready,
    finished: next.ready,
  };
}
