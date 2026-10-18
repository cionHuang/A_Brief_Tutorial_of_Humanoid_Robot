// G1 29 DoF: torso-fixed left arm; SI units, URDF coordinates (Z up).
import { G1_PAYLOAD_MOUNT } from "./g1-arm-view.js";
export const PAYLOAD_POINT = G1_PAYLOAD_MOUNT.blockCenter;
const D2R = Math.PI / 180;
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

const mul3 = (A, B) => A.map((row, i) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const mulVec = (R, v) => R.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
// URDF RPY：Rz(yaw)·Ry(pitch)·Rx(roll)
const rpyMat = (r, p, y) => {
  const cr = Math.cos(r); const sr = Math.sin(r);
  const cp = Math.cos(p); const sp = Math.sin(p);
  const cy = Math.cos(y); const sy = Math.sin(y);
  return [
    [cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr],
    [sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr],
    [-sp, cp * sr, cp * cr],
  ];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const SAG_KP = 8; // N·m/rad，教学示意刚度
export const SAG_CAP = 30 * D2R; // 单关节偏差限幅

// ── URDF 数据（g1_29dof.urdf 左臂链，逐字抄录）────────────────────────────
export const PHY = {
  chain: [
    { name: 'left_shoulder_pitch_joint', key: 'sp', label: '肩 pitch', link: 'left_shoulder_pitch_link', xyz: [0.0039563, 0.10022, 0.23778], rpy: [0.27931, 5.4949e-05, -0.00019159], axis: [0, 1, 0], lo: -3.0892, hi: 2.6704, def: 0, movable: true },
    { name: 'left_shoulder_roll_joint', key: 'sr', label: '肩 roll', link: 'left_shoulder_roll_link', xyz: [0, 0.038, -0.013831], rpy: [-0.27925, 0, 0], axis: [1, 0, 0], lo: -1.5882, hi: 2.2515, def: 20, movable: true },
    { name: 'left_shoulder_yaw_joint', key: 'sy', label: '肩 yaw', link: 'left_shoulder_yaw_link', xyz: [0, 0.00624, -0.1032], rpy: [0, 0, 0], axis: [0, 0, 1], lo: -2.618, hi: 2.618, def: 0, movable: true },
    { name: 'left_elbow_joint', key: 'el', label: '肘', link: 'left_elbow_link', xyz: [0.015783, 0, -0.080518], rpy: [0, 0, 0], axis: [0, 1, 0], lo: -1.0472, hi: 2.0944, def: 40, movable: true },
    { name: 'left_wrist_roll_joint', key: 'wr', label: '腕 roll', link: 'left_wrist_roll_link', xyz: [0.1, 0.00188791, -0.01], rpy: [0, 0, 0], axis: [1, 0, 0], lo: -1.972222054, hi: 1.972222054, def: 0, movable: true },
    { name: 'left_wrist_pitch_joint', key: 'wp', label: '腕 pitch', link: 'left_wrist_pitch_link', xyz: [0.038, 0, 0], rpy: [0, 0, 0], axis: [0, 1, 0], lo: -1.614429558, hi: 1.614429558, def: 0, movable: true },
    { name: 'left_wrist_yaw_joint', key: 'wy', label: '腕 yaw', link: 'left_wrist_yaw_link', xyz: [0.046, 0, 0], rpy: [0, 0, 0], axis: [0, 0, 1], lo: -1.614429558, hi: 1.614429558, def: 0, movable: true },
    { name: 'left_hand_palm_joint', key: 'palm', label: '手', link: 'left_rubber_hand', xyz: [0.0415, 0.003, 0], rpy: [0, 0, 0], axis: [0, 0, 1], lo: 0, hi: 0, def: 0, movable: false, fixed: true },
  ],
  // 每个 link 的 <inertial>：质量与质心（link 系）
  com: {
    left_shoulder_pitch_link: { m: 0.718, c: [0, 0.035892, -0.011628] },
    left_shoulder_roll_link: { m: 0.643, c: [-0.000227, 0.00727, -0.063243] },
    left_shoulder_yaw_link: { m: 0.734, c: [0.010773, -0.002949, -0.072009] },
    left_elbow_link: { m: 0.6, c: [0.064956, 0.004454, -0.010062] },
    left_wrist_roll_link: { m: 0.08544498, c: [0.01713944778, 0.00053759094, 0.00000048864] },
    left_wrist_pitch_link: { m: 0.48404956, c: [0.02299989837, -0.00111685314, -0.00111658096] },
    left_wrist_yaw_link: { m: 0.08457647, c: [0.02200381568, 0.00049485096, 0.00053861123] },
    left_rubber_hand: { m: 0.17, c: [0.05361310808, -0.00295905240, 0.00215413091] },
  },
};

const CH = PHY.chain;
const COM = PHY.com;

// ── URDF 正运动学（Z-up），返回各关节 p/u 与各 link 位姿 ──────────────────
export const fk = (q) => {
  const joints = {};
  const links = {};
  let R = I3;
  let p = [0, 0, 0];
  CH.forEach((j, i) => {
    const d = mulVec(R, j.xyz);
    p = [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
    R = mul3(R, rpyMat(j.rpy[0], j.rpy[1], j.rpy[2]));
    if (j.fixed) { joints[j.name] = { p: p.slice(), u: [0, 0, 0] }; links[j.link] = { p: p.slice(), R: R.map((r) => r.slice()) }; return; }
    joints[j.name] = { p: p.slice(), u: mulVec(R, j.axis) };
    const ang = q[i];
    const n = Math.hypot(j.axis[0], j.axis[1], j.axis[2]) || 1;
    const ux = j.axis[0] / n; const uy = j.axis[1] / n; const uz = j.axis[2] / n;
    const c = Math.cos(ang); const s = Math.sin(ang); const t = 1 - c;
    R = mul3(R, [
      [t * ux * ux + c, t * ux * uy - s * uz, t * ux * uz + s * uy],
      [t * ux * uy + s * uz, t * uy * uy + c, t * uy * uz - s * ux],
      [t * ux * uz - s * uy, t * uy * uz + s * ux, t * uz * uz + c],
    ]);
    links[j.link] = { p: p.slice(), R: R.map((r) => r.slice()) };
  });
  return { joints, links };
};
const comWorld = (links) => {
  const out = {};
  for (const [name, info] of Object.entries(COM)) {
    const f = links[name];
    if (!f) continue;
    const c = mulVec(f.R, info.c);
    out[name] = [f.p[0] + c[0], f.p[1] + c[1], f.p[2] + c[2]];
  }
  return out;
};
// G_j(q)：关节 j 以远各段重力矩沿关节轴的分量之和。
// 符号约定与正文 τ_hold ≈ g(q) 一致：返回的是“电机为保持姿态需要承担的力矩”。
// 因此重力力矢量取 +mg ẑ；若写成 −mg ẑ 会整体反号，关掉补偿后手臂会被算成
// 向上升（势能升高），与物理和正文都相反。
export const gravityTorques = (q, payloadMass = 0) => {
  const { joints, links } = fk(q);
  const com = comWorld(links);
  const out = {};
  CH.forEach((c, ji) => {
    const j = joints[c.name];
    let acc = 0;
    for (const downstream of CH.slice(ji)) {
      const info = COM[downstream.link];
      if (!info) continue;
      const r = [com[downstream.link][0] - j.p[0], com[downstream.link][1] - j.p[1], com[downstream.link][2] - j.p[2]];
      const gg = cross(r, [0, 0, info.m * 9.81]);
      acc += j.u[0] * gg[0] + j.u[1] * gg[1] + j.u[2] * gg[2];
    }
    if (payloadMass) {
      const hand = links.left_rubber_hand;
      const offset = mulVec(hand.R, PAYLOAD_POINT);
      const r = hand.p.map((v, i) => v + offset[i] - j.p[i]);
      const torque = cross(r, [0, 0, payloadMass * 9.81]);
      acc += j.u.reduce((sum, v, i) => sum + v * torque[i], 0);
    }
    out[c.name] = acc;
  });
  return out;
};

export const INERTIAL = {
  "left_shoulder_pitch_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.0004291,
      "ixy": -9.2e-06,
      "ixz": 6.4e-06,
      "iyy": 0.000453,
      "iyz": 2.26e-05,
      "izz": 0.000423
    }
  },
  "left_shoulder_roll_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.0006177,
      "ixy": -1e-06,
      "ixz": 8.7e-06,
      "iyy": 0.0006912,
      "iyz": -5.3e-06,
      "izz": 0.0003894
    }
  },
  "left_shoulder_yaw_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.0009988,
      "ixy": 7.9e-06,
      "ixz": 0.0001412,
      "iyy": 0.0010605,
      "iyz": -2.86e-05,
      "izz": 0.0004354
    }
  },
  "left_elbow_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.0002891,
      "ixy": 6.53e-05,
      "ixz": 1.72e-05,
      "iyy": 0.0004152,
      "iyz": -5.6e-06,
      "izz": 0.0004197
    }
  },
  "left_wrist_roll_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 4.821544023e-05,
      "ixy": -4.24511021e-06,
      "ixz": 5.10599e-09,
      "iyy": 3.722899093e-05,
      "iyz": -1.23525e-09,
      "izz": 5.482106541e-05
    }
  },
  "left_wrist_pitch_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.00016579646273,
      "ixy": -1.231206746e-05,
      "ixz": 1.231699194e-05,
      "iyy": 0.0004295405741,
      "iyz": 8.1417712e-07,
      "izz": 0.00042953697654
    }
  },
  "left_wrist_yaw_link": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 4.929128828e-05,
      "ixy": -4.5735494e-07,
      "ixz": 4.45867591e-06,
      "iyy": 5.973338134e-05,
      "iyz": 4.3217198e-07,
      "izz": 3.928083826e-05
    }
  },
  "left_rubber_hand": {
    "rpy": [
      0.0,
      0.0,
      0.0
    ],
    "tensor": {
      "ixx": 0.00010099485234748,
      "ixy": 3.618590790516e-05,
      "ixz": -7.4301518642e-07,
      "iyy": 0.00028135871571621,
      "iyz": 3.30189743286e-06,
      "izz": 0.00021894770413514
    }
  }
};

export function potentialEnergy(q, payloadMass = 0) {
  const { links } = fk(q), centers = comWorld(links);
  let energy = Object.entries(COM).reduce((sum, [name, info]) => sum + info.m * 9.81 * centers[name][2], 0);
  const hand = links.left_rubber_hand;
  return energy + payloadMass * 9.81 * (hand.p[2] + mulVec(hand.R, PAYLOAD_POINT)[2]);
}
// Effective inertia about a single moving joint; all other joints are locked.
export function jointInertia(q, index) {
  const { joints, links } = fk(q), centers = comWorld(links);
  const joint = joints[CH[index].name];
  return CH.slice(index).reduce((sum, item) => {
    const info = COM[item.link], pose = links[item.link], data = INERTIAL[item.link];
    const r = centers[item.link].map((v, i) => v - joint.p[i]);
    const radius = cross(joint.u, r);
    const R = mul3(pose.R, rpyMat(...data.rpy));
    const axis = [0,1,2].map(i => R.reduce((s, row, j) => s + row[i] * joint.u[j], 0));
    const t = data.tensor, I = [[t.ixx,t.ixy,t.ixz],[t.ixy,t.iyy,t.iyz],[t.ixz,t.iyz,t.izz]];
    return sum + info.m * radius.reduce((s,v) => s+v*v,0) + mulVec(I,axis).reduce((s,v,i)=>s+v*axis[i],0);
  },0);
}
export function sagFrom(q, payloadMass = 0) {
  const G = gravityTorques(q, payloadMass);
  return { G, actual: CH.map((c,i)=>clamp(q[i]+clamp(-G[c.name]/SAG_KP,-SAG_CAP,SAG_CAP),c.lo,c.hi)) };
}
