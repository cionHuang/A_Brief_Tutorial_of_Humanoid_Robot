/** Fixed teaching examples. Network/training values are calculated; attention and generation are schematic. */
export function neuron() {
  const products = [2 * 0.5, 1 * -1];
  const sum = products.reduce((a, b) => a + b, 0);
  return { products, sum, z: sum + 0.2, output: Math.max(0, sum + 0.2) };
}
export function trainStep(k) {
  // One sample: t=2 seconds, d=4 metres. L=(2k-4)^2.
  const prediction = 2 * k;
  const loss = (prediction - 4) ** 2;
  const gradient = 4 * (prediction - 4);
  return { k, prediction, loss, gradient, next: k - 0.0625 * gradient };
}
export function trainingFrame(step) {
  const round = Math.min(3, Math.floor(step / 4));
  let k = 1;
  for (let i = 0; i < round; i++) k = trainStep(k).next;
  return { ...trainStep(k), round, phase: step % 4, inference: step === 13 };
}
export function attentionExample(blue = false) {
  const weights = blue ? [0.2, 0.7, 0.1] : [0.7, 0.2, 0.1];
  const values = [[1, 0], [0, 1], [0.2, 0.2]];
  const result = [0, 1].map(j => values.reduce((sum, v, i) => sum + weights[i] * v[j], 0));
  return { weights, values, result };
}
export const targetPoints = [[60, 145], [105, 130], [150, 110], [195, 85], [240, 70], [285, 65]];
const noise = [[60, 55], [105, 170], [150, 45], [195, 160], [240, 40], [285, 145]];
/** Representative numeric updates, deliberately not an implementation of learned samplers. */
export function generationPoints(method, step) {
  const p = Math.min(6, step);
  if (method === 'ar') return targetPoints.slice(0, p);
  const progress = p / 6;
  return targetPoints.map(([x, y], i) => {
    const initial = noise[i][1];
    const remaining = method === 'diffusion' ? (1 - progress) ** 2 : 1 - progress;
    return [x, y + (initial - y) * remaining];
  });
}
