import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  updateBKT, 
  calculateRetrievability, 
  calculateOptimalInterval, 
  stepCognitiveState, 
  DEFAULT_BKT_PARAMS 
} from '../../src/curriculum/cognitiveModel.ts';

describe('CognitiveModel - Bayesian Knowledge Tracing (BKT) & FSRS', () => {
  it('updateBKT: should increase probability of mastery upon correct response', () => {
    const prior = 0.20;
    const posterior = updateBKT(prior, true, DEFAULT_BKT_PARAMS);
    assert.ok(posterior > prior, `Expected posterior ${posterior} > prior ${prior}`);
  });

  it('updateBKT: should decrease probability of mastery upon incorrect response', () => {
    const prior = 0.80;
    const posterior = updateBKT(prior, false, DEFAULT_BKT_PARAMS);
    assert.ok(posterior < prior, `Expected posterior ${posterior} < prior ${prior}`);
  });

  it('updateBKT: should converge toward mastery over consecutive correct answers', () => {
    let p = 0.15;
    for (let i = 0; i < 5; i++) {
      p = updateBKT(p, true);
    }
    assert.ok(p > 0.85, `Expected converged p ${p} > 0.85`);
  });

  it('calculateRetrievability: should decay with time according to power law', () => {
    const stability = 10; // 10 days
    const rDay0 = calculateRetrievability(stability, 0);
    const rDay5 = calculateRetrievability(stability, 5);
    const rDay20 = calculateRetrievability(stability, 20);

    assert.strictEqual(rDay0, 1.0);
    assert.ok(rDay5 < rDay0);
    assert.ok(rDay20 < rDay5);
    assert.ok(rDay5 > 0.85); // High retrievability before stability duration
  });

  it('calculateOptimalInterval: should scale with stability for 90% retention', () => {
    const interval10 = calculateOptimalInterval(10, 0.90);
    const interval30 = calculateOptimalInterval(30, 0.90);

    assert.ok(interval30 > interval10);
    assert.ok(interval10 >= 1);
  });

  it('stepCognitiveState: should initialize state on first attempt', () => {
    const state = stepCognitiveState(undefined, 'vocab_apple', true);
    assert.strictEqual(state.nodeId, 'vocab_apple');
    assert.strictEqual(state.repetitions, 1);
    assert.strictEqual(state.streak, 1);
    assert.ok(state.probabilityKnown > 0.15);
  });

  it('stepCognitiveState: should penalize stability on lapse/mistake', () => {
    const initial = stepCognitiveState(undefined, 'vocab_apple', true);
    const mastered = stepCognitiveState(initial, 'vocab_apple', true);
    const lapsed = stepCognitiveState(mastered, 'vocab_apple', false);

    assert.strictEqual(lapsed.streak, 0);
    assert.ok(lapsed.stability < mastered.stability);
    assert.strictEqual(lapsed.repetitions, 3);
  });
});
