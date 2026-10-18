import test from 'node:test';
import assert from 'node:assert/strict';
import {trainStep,trainingFrame,attentionExample,generationPoints,targetPoints} from '../src/lib/ai-foundations.js';
test('analytic gradient matches numerical loss gradient and lowers loss',()=>{
 for(const k of [0.5,1,1.875,2.4]){
  const s=trainStep(k),eps=1e-5;
  const numeric=(trainStep(k+eps).loss-trainStep(k-eps).loss)/(2*eps);
  assert.ok(Math.abs(numeric-s.gradient)<1e-6);
  assert.ok(trainStep(s.next).loss<=s.loss);
 }
 assert.equal(trainingFrame(12).k,1.875);
 assert.equal(trainingFrame(13).k,trainingFrame(12).k);
});
test('attention presets retain normalized weights and swap aggregated components',()=>{
 const a=attentionExample(),b=attentionExample(true);
 assert.ok(Math.abs(a.weights.reduce((x,y)=>x+y)-1)<1e-12);
 assert.equal(a.result[0],b.result[1]);assert.equal(a.result[1],b.result[0]);
});
test('generation completes all targets before execution begins',()=>{
 for(const method of ['ar','diffusion','flow']){
  assert.deepEqual(generationPoints(method,6),targetPoints);
  assert.deepEqual(generationPoints(method,12),targetPoints);
 }
 assert.equal(generationPoints('ar',0).length,0);
 assert.equal(generationPoints('ar',3).length,3);
 assert.equal(generationPoints('flow',0).length,6);
});
