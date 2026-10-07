/**
 * Teaching-only movement-permission model, shown with a G1 arm. The drive stays
 * powered throughout and is assumed able to hold the arm after a controlled
 * stop. Neither the states nor the timings specify G1 firmware, an emergency
 * stop, torque removal, or a real fault-response strategy.
 *
 * All transitions are pure. Angles are radians; angular speed is radians/sec.
 */
const radians = (degrees) => degrees * Math.PI / 180;
const degrees = (angle) => angle * 180 / Math.PI;
const EPSILON = 1e-10;

export const FAULT_RECOVERY_DEMO = Object.freeze({
  initialAngle: radians(20),
  goalAngle: radians(80),
  // A 0.4 sec acceleration ramp followed by cruising takes about 8 sec.
  normalSpeed: radians(60) / 7.8,
  limitedSpeed: radians(60) / 7.8 * 0.3,
  accelerationSeconds: 0.4,
  stoppingSeconds: 0.55,
  checkingSeconds: 1.2,
});

export function createFaultRecoveryState() {
  return {
    phase: 'ready',
    angle: FAULT_RECOVERY_DEMO.initialAngle,
    target: FAULT_RECOVERY_DEMO.goalAngle,
    speed: 0,
    faultPresent: false,
    limited: false,
    checked: false,
    phaseElapsed: 0,
    stopInitialSpeed: 0,
    stopDuration: FAULT_RECOVERY_DEMO.stoppingSeconds,
    notice: '',
  };
}

const withNotice = (state, notice) => ({ ...state, notice });
const transition = (state, phase, changes = {}) => ({
  ...state, phase, phaseElapsed: 0, notice: '', ...changes,
});
const isMoving = (state) => state.phase === 'running' || state.phase === 'degraded';

/** Events: start, trip, clear, check, limit, unlimit, reset. */
export function actFaultRecovery(state, event) {
  switch (event) {
    case 'reset':
      return createFaultRecoveryState();
    case 'start':
      if (state.phase === 'ready') {
        return transition(state, state.limited ? 'degraded' : 'running', {
          target: FAULT_RECOVERY_DEMO.goalAngle,
          speed: 0,
        });
      }
      if (state.phase === 'latched') {
        return withNotice(state, state.faultPresent
          ? '故障还在。请先排除故障，再确认并检查。'
          : '故障已排除，但运动许可尚未恢复。请先确认并检查。');
      }
      if (state.phase === 'checking') return withNotice(state, '检查尚未完成，现在不能启动。');
      if (state.phase === 'stopping') return withNotice(state, '正在受控减速，现在不能启动。');
      if (state.phase === 'complete') return withNotice(state, '本次抬臂已完成。点击“重置演示”可从头体验。');
      return withNotice(state, '前臂正在运动。');
    case 'trip':
      if (!isMoving(state)) return withNotice(state, '请先启动抬臂，再触发保护。');
      return transition(state, 'stopping', {
        faultPresent: true,
        checked: false,
        stopInitialSpeed: state.speed,
        // Near the destination, stop within the remaining travel instead of
        // showing a moving speed while the displayed angle is already clamped.
        stopDuration: state.speed > 0
          ? Math.min(FAULT_RECOVERY_DEMO.stoppingSeconds,
            2 * Math.max(0, FAULT_RECOVERY_DEMO.goalAngle - state.angle) / state.speed)
          : FAULT_RECOVERY_DEMO.stoppingSeconds,
      });
    case 'clear':
      if (state.phase !== 'latched') return withNotice(state, '等前臂停稳并锁存故障后，再排除故障。');
      if (!state.faultPresent) return withNotice(state, '故障已排除，仍需确认并检查。');
      return withNotice({ ...state, faultPresent: false }, '故障已排除，前臂仍保持不动。现在可以确认并检查。');
    case 'check':
      if (state.phase !== 'latched') return withNotice(state, '故障锁存后，才能进入恢复检查。');
      if (state.faultPresent) return withNotice(state, '检查未通过：故障信号仍在。请先排除故障。');
      return transition(state, 'checking', { speed: 0 });
    case 'limit':
      if (state.phase !== 'running') return withNotice(state, '请在正常抬臂时体验限速。');
      return transition(state, 'degraded', { limited: true });
    case 'unlimit':
      if (state.phase !== 'degraded') return withNotice(state, '当前没有正在限速运行的动作。');
      return transition(state, 'running', { limited: false });
    default:
      return { ...state };
  }
}

/** Integrate a speed ramp exactly, so display frame rate does not alter travel. */
function advanceMoving(state, dt) {
  const p = FAULT_RECOVERY_DEMO;
  const desiredSpeed = state.limited ? p.limitedSpeed : p.normalSpeed;
  const acceleration = p.normalSpeed / p.accelerationSeconds;
  const direction = Math.sign(desiredSpeed - state.speed);
  const rampTime = Math.abs(desiredSpeed - state.speed) / acceleration;
  const acceleratingTime = Math.min(dt, rampTime);
  const nextSpeed = state.speed + direction * acceleration * acceleratingTime;
  const distance = (state.speed + nextSpeed) / 2 * acceleratingTime
    + desiredSpeed * Math.max(0, dt - rampTime);
  const angle = Math.min(p.goalAngle, state.angle + distance);
  if (angle >= p.goalAngle - EPSILON) {
    return transition(state, 'complete', {
      angle: p.goalAngle, target: p.goalAngle, speed: 0,
    });
  }
  return { ...state, angle, speed: nextSpeed, phaseElapsed: state.phaseElapsed + dt };
}

/**
 * Advance only the current phase. A long display interval can finish a stop or
 * a check, but it can never grant a new start command or bypass the ready state.
 */
export function stepFaultRecovery(state, dtSeconds = 0) {
  const dt = typeof dtSeconds === 'number' && Number.isFinite(dtSeconds)
    ? Math.max(0, dtSeconds) : 0;
  if (dt === 0) return { ...state };
  if (isMoving(state)) return advanceMoving(state, dt);
  const p = FAULT_RECOVERY_DEMO;
  if (state.phase === 'stopping') {
    const elapsed = Math.min(state.stopDuration, state.phaseElapsed + dt);
    const delta = elapsed - state.phaseElapsed;
    const speed = state.stopDuration > 0
      ? state.stopInitialSpeed * Math.max(0, 1 - elapsed / state.stopDuration) : 0;
    const angle = Math.min(p.goalAngle, state.angle + (state.speed + speed) / 2 * delta);
    if (elapsed >= state.stopDuration - EPSILON) {
      // Keep the previous requested target visible, but withhold its permission
      // to move. The recovery check explicitly discards it before a new start.
      return transition(state, 'latched', { angle, speed: 0 });
    }
    return { ...state, angle, speed, phaseElapsed: elapsed };
  }
  if (state.phase === 'checking') {
    const elapsed = Math.min(p.checkingSeconds, state.phaseElapsed + dt);
    if (elapsed >= p.checkingSeconds - EPSILON) {
      return transition(state, 'ready', {
        speed: 0,
        target: state.angle,
        checked: true,
        notice: '检查通过，旧目标已清除。请再次点击“启动抬臂”。',
      });
    }
    return { ...state, phaseElapsed: elapsed };
  }
  return { ...state };
}

/** Display labels and actionable controls; the state itself remains untouched. */
export function faultRecoverySnapshot(state) {
  const label = {
    ready: state.checked ? '检查通过 · 待命' : '待命',
    running: '正常运行',
    degraded: '限速运行',
    stopping: '受控减速',
    latched: state.faultPresent ? '故障已锁存' : '故障已排除 · 仍锁存',
    checking: '正在检查',
    complete: '抬臂完成',
  };
  const story = {
    ready: state.checked
      ? '前臂保持当前位置。检查通过只允许重新启动，还没有下达运动命令。'
      : '点击“开始抬臂”，让前臂从 20° 缓慢抬到 80°。',
    running: '前臂正在抬起。试着触发保护，观察它怎样停止。',
    degraded: '前臂放慢后继续抬起。限速保留运动许可，与故障锁存不同。',
    stopping: '收到保护信号后，前臂先受控减速；停稳后锁存故障。',
    latched: state.faultPresent
      ? '驱动仍在保持前臂，运动许可已撤销。先排除故障，再确认并检查。'
      : '触发信号已消失，运动许可仍未恢复。试着点击“尝试继续抬臂”。',
    checking: '模拟读取当前姿态、确认恢复条件并清除旧目标。检查期间保持不动。',
    complete: '前臂已到达 80°。点击“重置演示”可再次体验保护与恢复流程。',
  };
  return {
    ...state,
    stateLabel: label[state.phase] ?? '未知状态',
    story: state.notice || story[state.phase] || '',
    // The start button deliberately remains available at the two recovery
    // checkpoints so readers can discover why their command is rejected.
    canStart: ['ready', 'latched', 'checking'].includes(state.phase),
    canTrip: isMoving(state),
    canClear: state.phase === 'latched' && state.faultPresent,
    // Allow a failed check to explain that the fault must first be removed.
    canCheck: state.phase === 'latched',
    canLimit: state.phase === 'running',
    canUnlimit: state.phase === 'degraded',
    canReset: true,
    drivePowered: true,
    motionPermitted: ['ready', 'running', 'degraded'].includes(state.phase),
    progress: Math.max(0, Math.min(1, (state.angle - FAULT_RECOVERY_DEMO.initialAngle)
      / (FAULT_RECOVERY_DEMO.goalAngle - FAULT_RECOVERY_DEMO.initialAngle))),
    checkProgress: state.phase === 'checking'
      ? state.phaseElapsed / FAULT_RECOVERY_DEMO.checkingSeconds : state.checked ? 1 : 0,
    angleDegrees: degrees(state.angle),
    targetDegrees: degrees(state.target),
    goalDegrees: degrees(FAULT_RECOVERY_DEMO.goalAngle),
    speedDegrees: degrees(state.speed),
  };
}
