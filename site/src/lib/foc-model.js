/** One pole-pair, ideal surface-PM teaching model. All values are normalized.
 * Coordinate/current model only: no rotor dynamics or voltage modulation.
 * Amplitude-invariant Clarke convention; normalized torque equals iq.
 */
export function clarke({ a, b, c }) {
  return { alpha: (2 * a - b - c) / 3, beta: (b - c) / Math.sqrt(3) };
}
export function inverseClarke({ alpha, beta }) {
  return { a: alpha, b: -alpha / 2 + Math.sqrt(3) * beta / 2, c: -alpha / 2 - Math.sqrt(3) * beta / 2 };
}
export function park({ alpha, beta }, angle) {
  return { d: alpha * Math.cos(angle) + beta * Math.sin(angle), q: -alpha * Math.sin(angle) + beta * Math.cos(angle) };
}
export function inversePark({ d, q }, angle) {
  return { alpha: d * Math.cos(angle) - q * Math.sin(angle), beta: d * Math.sin(angle) + q * Math.cos(angle) };
}
export function motorSample(angle, effort, fixedCurrent = null) {
  const vector = fixedCurrent ?? inversePark({ d: 0, q: effort }, angle);
  const phases = inverseClarke(vector);
  const dq = park(clarke(phases), angle);
  return { vector, phases, dq, torque: dq.q, fieldSize: Math.hypot(vector.alpha, vector.beta) };
}
