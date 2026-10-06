import test from 'node:test';
import assert from 'node:assert/strict';
import { clarke, inverseClarke, park, inversePark, motorSample } from '../src/lib/foc-model.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test('Clarke/Park preserve arbitrary dq currents through a complete round-trip', () => {
  for (const angle of [0, 0.31, Math.PI / 2, 2.3, Math.PI, 5.4, 2 * Math.PI]) {
    for (const current of [{ d: 0.2, q: -0.7 }, { d: -0.4, q: 0.9 }, { d: 0, q: 0 }]) {
      const ab = inversePark(current, angle);
      const rebuilt = clarke(inverseClarke(ab));
      near(rebuilt.alpha, ab.alpha); near(rebuilt.beta, ab.beta);
      const result = park(rebuilt, angle);
      near(result.d, current.d); near(result.q, current.q);
    }
  }
});
test('following the rotor keeps iq and torque constant, and all phase currents sum to zero', () => {
  for (const effort of [0, 0.25, 0.8, 1]) {
    for (let deg = 0; deg <= 360; deg += 3) {
      const s = motorSample(deg * Math.PI / 180, effort);
      near(s.dq.d, 0); near(s.dq.q, effort); near(s.torque, effort);
      near(s.phases.a + s.phases.b + s.phases.c, 0);
    }
  }
});
test('fixed phase currents produce positive, zero, then negative torque as the rotor moves', () => {
  const start = 0.47;
  const fixed = motorSample(start, 0.8).vector;
  const original = motorSample(start, 0.8, fixed);
  for (const [offset, expected] of [[0, 0.8], [Math.PI / 2, 0], [Math.PI, -0.8], [2 * Math.PI, 0.8]]) {
    const s = motorSample(start + offset, 0.8, fixed);
    near(s.torque, expected);
    for (const phase of ['a', 'b', 'c']) near(s.phases[phase], original.phases[phase]);
    near(s.phases.a + s.phases.b + s.phases.c, 0);
  }
});
