/** Scalar Kalman update: identity observation, independent prediction/measurement errors. */
export function kalmanUpdate(prediction, measurement, predictionVariance, measurementVariance) {
  const gain = predictionVariance / (predictionVariance + measurementVariance);
  return { gain, estimate: prediction + gain * (measurement - prediction) };
}
export function kalmanLesson(time) {
  const t = Math.max(0, Math.min(26, time));
  const scenario = t < 13 ? 0 : 1;
  const local = t - scenario * 13;
  const stage = local < 3 ? 0 : local < 6 ? 1 : 2;
  const sigma = scenario === 0 ? 1 : 4;
  const result = kalmanUpdate(10, 12, 4, sigma * sigma);
  const progress = Math.max(0, Math.min(1, (local - 6) / 2));
  const estimate = stage === 0 ? 8 : stage === 1 ? 8 + 2 * Math.min(1, (local - 3) / 1.5) : 10 + (result.estimate - 10) * progress;
  return {scenario, stage, sigma, estimate, result: result.estimate, gain: result.gain};
}
