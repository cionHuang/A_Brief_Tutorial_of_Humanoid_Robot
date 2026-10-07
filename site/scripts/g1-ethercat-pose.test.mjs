import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { JOINTS, DURATION, sampleDemo } from '../src/lib/ethercat-demo-model.js';
import { G1_JOINT_POSE, toG1JointValues } from '../src/lib/g1-ethercat-view.js';

// Read the actual robot description, so a changed model cannot silently keep
// passing against a second hard-coded copy of its kinematics and joint limits.
const urdf = readFileSync(new URL('../../robot_descriptions/g1/g1_29dof.urdf', import.meta.url), 'utf8');
const attribute = (source, name) => source.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const vector = (value = '0 0 0') => value.split(/\s+/).map(Number);
const joints = new Map([...urdf.matchAll(/<joint\b([^>]*)>([\s\S]*?)<\/joint>/g)].map((match) => {
  const [, attributes, body] = match;
  const tag = (name) => body.match(new RegExp(`<${name}\\b([^>]*)\\/?>`))?.[1] ?? '';
  const limit = tag('limit');
  const joint = {
    name: attribute(attributes, 'name'), type: attribute(attributes, 'type'),
    parent: attribute(tag('parent'), 'link'), child: attribute(tag('child'), 'link'),
    xyz: vector(attribute(tag('origin'), 'xyz')), rpy: vector(attribute(tag('origin'), 'rpy')),
    axis: vector(attribute(tag('axis'), 'xyz')),
    lower: Number(attribute(limit, 'lower')), upper: Number(attribute(limit, 'upper')),
  };
  return [joint.name, joint];
}));
const parents = new Map([...joints.values()].map((joint) => [joint.child, joint]));

function handPosition(side, values) {
  function transform(link) {
    const joint = parents.get(link);
    if (!joint) return new Matrix4();
    // URDF origins use fixed-axis roll, pitch, yaw: Rz(yaw) Ry(pitch) Rx(roll).
    const rotation = new Quaternion().setFromEuler(new Euler(...joint.rpy, 'ZYX'));
    const local = new Matrix4().compose(new Vector3(...joint.xyz), rotation, new Vector3(1, 1, 1));
    if (joint.type === 'revolute') {
      local.multiply(new Matrix4().makeRotationAxis(new Vector3(...joint.axis), values[joint.name] ?? 0));
    }
    return transform(joint.parent).multiply(local);
  }
  return new Vector3().setFromMatrixPosition(transform(`${side}_rubber_hand`));
}

test('the four driver stations map to actual G1 pitch and elbow joints with matching axes and limits', () => {
  assert.equal(G1_JOINT_POSE.length, JOINTS.length);
  G1_JOINT_POSE.forEach((mapping, index) => {
    const station = JOINTS[index];
    const expectedName = `${station.side}_${station.kind === 'shoulder' ? 'shoulder_pitch' : 'elbow'}_joint`;
    assert.equal(mapping.name, expectedName);
    const joint = joints.get(mapping.name);
    assert.ok(joint, `${mapping.name} exists in the robot description`);
    assert.equal(joint.type, 'revolute');
    assert.deepEqual(joint.axis, [0, 1, 0]);
    assert.equal(mapping.lower, joint.lower);
    assert.equal(mapping.upper, joint.upper);
  });
  for (const side of ['left', 'right']) {
    assert.deepEqual(joints.get(`${side}_shoulder_roll_joint`).axis, [1, 0, 0]);
    assert.equal(parents.get(`${side}_rubber_hand`).type, 'fixed');
  }
});

test('both complete timelines stay within G1 limits and preserve the outward shoulder clearance', () => {
  for (const mode of ['synchronized', 'received']) {
    for (let frame = 0; frame <= DURATION * 40; frame += 1) {
      const values = toG1JointValues(sampleDemo(frame / 40, mode));
      assert.equal(Object.keys(values).length, 6);
      assert.ok(Math.abs(values.left_shoulder_roll_joint - 12 * Math.PI / 180) < 1e-12);
      assert.ok(Math.abs(values.right_shoulder_roll_joint + 12 * Math.PI / 180) < 1e-12);
      for (const [name, angle] of Object.entries(values)) {
        const joint = joints.get(name);
        assert.ok(joint && Number.isFinite(angle) && angle >= joint.lower && angle <= joint.upper,
          `${mode} at ${frame / 40}s: ${name} must respect the actual URDF limits`);
      }
    }
  }
});

test('the real G1 hand transforms rise forward and preserve the intended synchronization comparison', () => {
  const hands = (time, mode) => {
    const values = toG1JointValues(sampleDemo(time, mode));
    return ['left', 'right'].map((side) => handPosition(side, values));
  };
  const start = hands(0, 'synchronized');
  const finish = hands(DURATION, 'synchronized');
  for (let side = 0; side < 2; side += 1) {
    assert.ok(finish[side].x - start[side].x > 0.2, 'the hand moves forward along G1 +X');
    assert.ok(finish[side].z - start[side].z > 0.2, 'the hand rises along G1 +Z');
  }
  // The supplied URDF has micrometre-scale left/right origin differences.
  for (const time of [0, 8.5, DURATION]) {
    const [left, right] = hands(time, 'synchronized');
    assert.ok(Math.abs(left.x - right.x) < 0.00005);
    assert.ok(Math.abs(left.y + right.y) < 0.00005);
    assert.ok(Math.abs(left.z - right.z) < 0.00005);
  }
  const [left, right] = hands(2.5, 'received');
  assert.ok(left.x - right.x > 0.05, 'the earlier left-shoulder command visibly advances the left hand first');
  assert.ok(left.z - right.z > 0.005, 'the earlier arm has also begun to rise');
});
