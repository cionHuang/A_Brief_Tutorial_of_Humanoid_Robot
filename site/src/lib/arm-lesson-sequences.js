import { ARM_DYNAMICS as A, trajectory, initialState, stepForward } from './arm-dynamics-model.js';
import { PHY, sagFrom } from './g1-arm-physics.js';

export const DYNAMICS_LENGTH = 16;
export function dynamicsLesson(time) {
  const t = Math.max(0, Math.min(DYNAMICS_LENGTH, time));
  const index = t < 5 ? 0 : t < 9 ? 1 : t < 12.5 ? 2 : 3;
  const local = t - [0, 5, 9, 12.5][index];
  if (index < 2) {
    const duration = index === 0 ? A.slow : A.fast;
    const motionTime = Math.min(duration + 1, Math.max(0, local - .6) / (index === 0 ? 1 : 4));
    const sample = trajectory(motionTime, duration);
    return { ...sample, index, duration, progress: Math.min(1, motionTime / duration),
      title: index === 0 ? '① 慢慢抬起' : '② 快速抬起',
      explanation: index === 0 ? '先安排好抬臂动作，再算肘关节要出多大力矩。这是逆动力学。' : '同样抬到这个位置，起动和减速更急，力矩变化也更明显。',
      note: index === 0 ? '慢抬：动作时长 3 秒' : '快抬：动作时长 0.4 秒，画面放慢 4 倍' };
  }
  const torque = index === 2 ? 0 : 2.5;
  const state = initialState();
  stepForward(state, torque, Math.min(.2, Math.max(0, local - .6) / 8));
  return { ...state, torque, index, progress: 0,
    title: index === 2 ? '③ 撤去力矩' : '④ 加力抬起',
    explanation: index === 2 ? '回到相同的起点。撤去电机力矩，手臂在重力作用下向下运动。' : '再次从相同位置出发。给定向上的力矩，算出手臂怎样抬起。这是正动力学。',
    note: '正动力学：给定力矩 → 算出运动 · 画面放慢 8 倍' };
}

export const GRAVITY_LENGTH = 12;
export const GRAVITY_TARGET = PHY.chain.map(j => j.def * Math.PI / 180);
const empty = sagFrom(GRAVITY_TARGET).actual;
const loaded = sagFrom(GRAVITY_TARGET, .5).actual;
export function gravityLesson(time, reducedMotion = false) {
  const t = Math.max(0, Math.min(GRAVITY_LENGTH, time));
  const index = t < 4 ? 0 : t < 8 ? 1 : 2;
  const local = t - index * 4;
  const from = [GRAVITY_TARGET, empty, loaded][index];
  const to = [empty, loaded, GRAVITY_TARGET][index];
  const u = reducedMotion ? (local > 0 ? 1 : 0) : Math.min(1, local / 1.4);
  const blend = u * u * (3 - 2 * u);
  return {index, payloadMass: index === 0 ? 0 : .5, compensation: index === 2,
    angles: from.map((v,i) => v + blend * (to[i] - v)),
    title: ['① 空手，未补偿', '② 加重物，未补偿', '③ 重物保留，开启补偿'][index],
    explanation: ['目标姿势固定。只靠位置反馈支撑时，手臂会留下一些下垂。',
      '手端加上 0.5 kg 重物，肩和肘需要更多支撑力矩，下垂也更明显。',
      '把包含重物在内的支撑力矩提前补上，手臂回到目标姿势。'][index] };
}
