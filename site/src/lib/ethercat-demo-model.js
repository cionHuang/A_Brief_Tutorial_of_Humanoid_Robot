/**
 * A deliberately slowed teaching timeline, not measured EtherCAT timing.
 * Four relative joint displacements drive a G1 visual model. The renderer maps
 * them to URDF angles; this timeline does not describe G1 firmware or wiring.
 * Only two selected frames are shown; real communication keeps cycling and a
 * cycle may contain several frames. Frame exchange alone does not synchronize
 * motion. The synchronized case assumes configured, clock-based execution.
 * Sampling and each drive's local controller are simplified: a passing frame
 * carries an available local-state snapshot. This does not mean a real drive
 * must sample its sensor precisely when an EtherCAT frame passes.
 * Equal motion profiles here make the comparison readable; distributed clocks
 * do not by themselves guarantee identical mechanical trajectories.
 */
export const JOINTS = Object.freeze([
  { id: 'left-shoulder', name: '左肩', side: 'left', kind: 'shoulder', target: 55 },
  { id: 'left-elbow', name: '左肘', side: 'left', kind: 'elbow', target: 70 },
  { id: 'right-shoulder', name: '右肩', side: 'right', kind: 'shoulder', target: 55 },
  { id: 'right-elbow', name: '右肘', side: 'right', kind: 'elbow', target: 70 },
].map((joint, index) => Object.freeze({ ...joint, index, position: (index + 1) / 5 })));

export const DURATION = 16;
export const CHECKPOINTS = Object.freeze([
  0, 1.5, 2.5, 3.5, 4.5, 6.5, 7, 8.5, 10, 11.3, 12.1, 12.9, 13.7, 15.5, DURATION,
]);

const FIRST_DEPARTURE = 0.5;
const FIRST_TURN = 5.5;
const FIRST_RETURN = 6.5;
const SYNCHRONIZED_START = 7;
const MOTION_DURATION = 3;
const SECOND_DEPARTURE = 10.5;
const SECOND_TURN = 14.5;
const SECOND_RETURN = 15.5;
const EPSILON = 1e-8;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalizedTime = (value) => Number.isNaN(value) ? 0 : clamp(value, 0, DURATION);
const smoothstep = (progress) => progress * progress * (3 - 2 * progress);
const reached = (time, eventTime) => time + EPSILON >= eventTime;

function arrival(joint, departure, turn) {
  return departure + joint.position * (turn - departure);
}

function jointAngle(time, startTime, target) {
  return target * smoothstep(clamp((time - startTime) / MOTION_DURATION, 0, 1));
}

function packetAt(time) {
  if (time < FIRST_DEPARTURE || time >= SECOND_RETURN) return { leg: 'home', progress: 0 };
  if (time < FIRST_TURN)
    return { leg: 'outbound', progress: (time - FIRST_DEPARTURE) / (FIRST_TURN - FIRST_DEPARTURE) };
  if (time < FIRST_RETURN)
    return { leg: 'return', progress: (time - FIRST_TURN) / (FIRST_RETURN - FIRST_TURN) };
  if (time < SECOND_DEPARTURE) return { leg: 'home', progress: 0 };
  if (time < SECOND_TURN)
    return { leg: 'feedback-outbound', progress: (time - SECOND_DEPARTURE) / (SECOND_TURN - SECOND_DEPARTURE) };
  return { leg: 'feedback-return', progress: (time - SECOND_TURN) / (SECOND_RETURN - SECOND_TURN) };
}

/**
 * Sample a deterministic frame. Angles are in degrees and time is in teaching
 * seconds. `snapshot` is the most recent sample collected at that slave;
 * `latestFeedback` is what the master has received, which changes only when the
 * frame returns. Neither is an instantaneous measurement of the moving arm.
 * `activeStation` briefly highlights the station just passed by an outbound
 * frame, after that station's data has been exchanged, or is -1.
 * Return-leg progress runs from the far end (0) to the master (1).
 */
export function sampleDemo(seconds, mode = 'synchronized') {
  const time = normalizedTime(seconds);
  if (mode !== 'synchronized' && mode !== 'received') throw new RangeError('Unknown EtherCAT demo mode');

  const packet = packetAt(time);
  const joints = JOINTS.map((joint) => {
    const receiveTime = arrival(joint, FIRST_DEPARTURE, FIRST_TURN);
    const sampleTime = arrival(joint, SECOND_DEPARTURE, SECOND_TURN);
    const startTime = mode === 'received' ? receiveTime : SYNCHRONIZED_START;
    const received = reached(time, receiveTime);
    const motionProgress = clamp((time - startTime) / MOTION_DURATION, 0, 1);
    // First-pass sampling occurs as the new command is received, before motion
    // under that command has advanced, even in the immediate-execution mode.
    const initialFeedback = received ? jointAngle(receiveTime, startTime, joint.target) : null;
    const subsequentFeedback = reached(time, sampleTime) ? jointAngle(sampleTime, startTime, joint.target) : null;
    const snapshot = subsequentFeedback ?? initialFeedback;
    const latestFeedback = reached(time, SECOND_RETURN) ? subsequentFeedback
      : reached(time, FIRST_RETURN) ? initialFeedback : null;
    return {
      ...joint, receiveTime, startTime, sampleTime, received,
      angle: jointAngle(time, startTime, joint.target), motionProgress,
      active: time >= startTime && time < startTime + MOTION_DURATION,
      snapshot, initialFeedback, latestFeedback,
    };
  });
  const lastMotionEnd = Math.max(...joints.map((joint) => joint.startTime + MOTION_DURATION));
  let stage;
  if (time < FIRST_DEPARTURE) stage = 'ready';
  else if (time < FIRST_RETURN) stage = 'exchange';
  else if (time >= SECOND_RETURN) stage = 'done';
  else if (time >= SECOND_DEPARTURE) stage = 'feedback';
  else if (time >= lastMotionEnd) stage = 'settled';
  else if (time >= Math.min(...joints.map((joint) => joint.startTime)) && time < lastMotionEnd) stage = 'move';
  else stage = 'wait';

  const outbound = packet.leg === 'outbound' || packet.leg === 'feedback-outbound';
  const activeStation = outbound ? joints.findIndex((joint) => {
    const passTime = packet.leg === 'feedback-outbound' ? joint.sampleTime : joint.receiveTime;
    return reached(time, passTime) && packet.progress - joint.position <= 0.1 + EPSILON;
  }) : -1;
  return {
    time, mode, joints, stage, activeStation, packet,
    receivedCount: joints.filter((joint) => joint.received).length,
    reportReady: reached(time, SECOND_RETURN),
    firstReportReady: reached(time, FIRST_RETURN),
    motionComplete: reached(time, lastMotionEnd),
  };
}

/** A paused step always advances; the last step remains at the completed pose. */
export function nextCheckpoint(seconds) {
  const time = normalizedTime(seconds);
  return CHECKPOINTS.find((checkpoint) => checkpoint > time + EPSILON) ?? DURATION;
}
