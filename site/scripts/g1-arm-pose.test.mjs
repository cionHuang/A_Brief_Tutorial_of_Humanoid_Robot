import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { g1ArmPose, G1_PAYLOAD_MOUNT } from '../src/lib/g1-arm-view.js';
import { SERVO_ARM, createServoArmState, stepServoArm, setServoPayload, pushServoArm } from '../src/lib/servo-arm-model.js';

// Use the source URDF that sync-robot-assets publishes, not a second set of
// hard-coded arm lengths or transforms. The hand STL also checks load clearance;
// these tests require no DOM or GPU.
const source = readFileSync(new URL('../../robot_descriptions/g1/g1_29dof.urdf', import.meta.url), 'utf8');
const attr = (text, name) => text.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const vector = (text = '0 0 0') => text.trim().split(/\s+/).map(Number);
const joints = new Map([...source.matchAll(/<joint\b([^>]*)>([\s\S]*?)<\/joint>/g)].map(([, attributes, body]) => {
  const tag = (name) => body.match(new RegExp(`<${name}\\b([^>]*)\\/?>`))?.[1] ?? '';
  const limits = tag('limit');
  const joint = {
    name: attr(attributes, 'name'), type: attr(attributes, 'type'),
    parent: attr(tag('parent'), 'link'), child: attr(tag('child'), 'link'),
    xyz: vector(attr(tag('origin'), 'xyz')), rpy: vector(attr(tag('origin'), 'rpy')),
    axis: vector(attr(tag('axis'), 'xyz')),
    lower: Number(attr(limits, 'lower')), upper: Number(attr(limits, 'upper')),
  };
  return [joint.name, joint];
}));
const parents = new Map([...joints.values()].map((joint) => [joint.child, joint]));

function transform(link, values) {
  const joint = parents.get(link);
  if (!joint) return new Matrix4();
  // URDF fixed-axis RPY has matrix order Rz(yaw) Ry(pitch) Rx(roll).
  const rotation = new Quaternion().setFromEuler(new Euler(...joint.rpy, 'ZYX'));
  const local = new Matrix4().compose(new Vector3(...joint.xyz), rotation, new Vector3(1, 1, 1));
  if (joint.type === 'revolute') {
    local.multiply(new Matrix4().makeRotationAxis(new Vector3(...joint.axis), values[joint.name] ?? 0));
  }
  return transform(joint.parent, values).multiply(local);
}

const point = (link, values, xyz = [0, 0, 0]) => new Vector3(...xyz).applyMatrix4(transform(link, values));
const closeVector = (actual, expected, message) => assert.ok(actual.distanceTo(expected) < 1e-10, message);

function linkMeshBounds(link) {
  const body = source.match(new RegExp(`<link\\s+name="${link}"[^>]*>([\\s\\S]*?)<\\/link>`))?.[1];
  const visual = body?.match(/<visual\b[^>]*>([\s\S]*?)<\/visual>/)?.[1];
  assert.ok(visual, 'the attachment link has a visual mesh in the actual URDF');
  const meshTag = visual.match(/<mesh\b([^>]*)\/?>/)?.[1];
  const origin = visual.match(/<origin\b([^>]*)\/?>/)?.[1] ?? '';
  const file = new URL(`../../robot_descriptions/g1/${attr(meshTag, 'filename')}`, import.meta.url);
  const bytes = readFileSync(file);
  const geometry = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const rotation = new Quaternion().setFromEuler(new Euler(...vector(attr(origin, 'rpy')), 'ZYX'));
  geometry.applyMatrix4(new Matrix4().compose(new Vector3(...vector(attr(origin, 'xyz'))), rotation,
    new Vector3(...vector(attr(meshTag, 'scale') ?? '1 1 1'))));
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox.clone();
  geometry.dispose();
  return bounds;
}

test('the actual G1 forearm rises forward about a fixed elbow, from hanging to approximately horizontal', () => {
  const start = g1ArmPose(0), finish = g1ArmPose(SERVO_ARM.raisedAngle);
  const elbow = joints.get('left_elbow_joint');
  assert.ok(elbow, 'the visible joint must exist in the bundled G1');
  assert.deepEqual(elbow.axis, [0, 1, 0]);
  const pivot = point(elbow.child, start);
  const handStart = point('left_rubber_hand', start);
  const handFinish = point('left_rubber_hand', finish);
  const down = handStart.clone().sub(pivot), forward = handFinish.clone().sub(pivot);
  assert.ok(down.z < -.2 && Math.abs(down.x) < .03, 'the initial hand hangs below the elbow');
  assert.ok(forward.x > .2 && Math.abs(forward.z) < .02, 'the raised forearm points along G1 +X, nearly horizontal');
  assert.ok(handFinish.x - handStart.x > .2 && handFinish.z - handStart.z > .2, 'raising moves the hand forward and up');
  const radius = handStart.distanceTo(pivot);
  for (let degree = 0; degree <= 90; degree += 2) {
    const pose = g1ArmPose(degree * Math.PI / 180);
    closeVector(point(elbow.child, pose), pivot, 'the fixed upper arm must not move the elbow pivot');
    assert.ok(Math.abs(point('left_rubber_hand', pose).distanceTo(pivot) - radius) < 1e-10,
      'the full URDF wrist/hand chain rotates rigidly around the elbow');
    for (const [name, value] of Object.entries(start)) {
      if (name !== elbow.name) assert.equal(pose[name], value, 'only the elbow changes during this single-joint lesson');
    }
  }
});

test('raising, adding and removing the load, and a push all stay inside the actual G1 joint limits', () => {
  const state = createServoArmState();
  const check = () => {
    for (const [name, angle] of Object.entries(g1ArmPose(state.angle))) {
      const joint = joints.get(name);
      assert.ok(joint?.type === 'revolute', `${name} is a real movable G1 joint`);
      assert.ok(Number.isFinite(angle) && angle >= joint.lower && angle <= joint.upper,
        `${name} respects its URDF range at simulation time ${state.time}`);
    }
  };
  const advance = (seconds) => {
    for (let i = 0; i < seconds * 100; i += 1) {
      stepServoArm(state, .01);
      check();
    }
  };
  check();
  advance(1);
  state.target = SERVO_ARM.raisedAngle;
  advance(5);
  setServoPayload(state, true);
  advance(5);
  pushServoArm(state);
  advance(5);
  setServoPayload(state, false);
  advance(5);
});

test('the teaching load sits on its tray at the real G1 hand and follows the sagging forearm', () => {
  const mount = G1_PAYLOAD_MOUNT;
  const parent = parents.get(mount.link);
  assert.ok(parent, 'the load mount must be an actual URDF link');
  let ancestor = mount.link;
  while (ancestor && ancestor !== 'left_elbow_link') ancestor = parents.get(ancestor)?.parent;
  assert.equal(ancestor, 'left_elbow_link', 'the payload belongs to the moving forearm chain');
  assert.equal(parent.type, 'fixed', 'the teaching mount is fixed to the hand, not a new controllable joint');
  const handBounds = linkMeshBounds(mount.link);
  const trayBottom = mount.trayCenter[2] - mount.traySize[2] / 2;
  assert.ok(trayBottom >= handBounds.max.z && trayBottom - handBounds.max.z < .01,
    'the tray clears the real hand mesh with a small gap, rather than intersecting it or floating far away');
  for (const axis of [0, 1]) {
    assert.ok(mount.trayCenter[axis] + mount.traySize[axis] / 2 > handBounds.min.getComponent(axis)
      && mount.trayCenter[axis] - mount.traySize[axis] / 2 < handBounds.max.getComponent(axis),
    'the tray overlaps the hand footprint');
  }
  const trayTop = [...mount.trayCenter];
  trayTop[2] += mount.traySize[2] / 2;
  const blockBottom = [...mount.blockCenter];
  blockBottom[2] -= mount.blockSize[2] / 2;
  const initial = g1ArmPose(0), raised = g1ArmPose(SERVO_ARM.raisedAngle);
  const hand = point(mount.link, raised);
  const load = point(mount.link, raised, mount.blockCenter);
  assert.ok(load.distanceTo(hand) < .14, 'the weight is attached near the G1 palm, not at the old schematic arm length');
  assert.ok(load.x > hand.x && load.z > hand.z, 'the raised weight sits forward of and above the hand');
  assert.ok(load.z > point(mount.link, initial, mount.blockCenter).z + .15, 'raising the arm raises the attached load');
  for (const angle of [0, .5, 1, SERVO_ARM.raisedAngle - .08, SERVO_ARM.raisedAngle]) {
    const values = g1ArmPose(angle);
    closeVector(point(mount.link, values, trayTop), point(mount.link, values, blockBottom),
      'the block bottom remains in contact with the tray top while the arm moves');
    const offset = point(mount.link, values, mount.blockCenter).sub(point(mount.link, values));
    assert.ok(Math.abs(offset.length() - new Vector3(...mount.blockCenter).length()) < 1e-10,
      'the payload must not drift away from the hand during rotation');
  }
  const sagged = point(mount.link, g1ArmPose(SERVO_ARM.raisedAngle - .08), mount.blockCenter);
  assert.ok(load.z - sagged.z > .01, 'a downward model disturbance visibly lowers the attached load');
});
