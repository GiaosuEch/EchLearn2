import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AI_FEATURE_REGISTRY,
  getAIFeatureById,
} from '../../src/platform/ai/aiFeatureRegistry.ts';
import { buildAICoachHubViewModel } from '../../src/platform/ai/aiFeatureRegistryViewModel.ts';

const expectedIds = [
  'ai-tutor',
  'practice-generator',
  'learner-memory',
  'writing-coach',
  'speaking-coach',
] as const;

const expectedRoutes = [
  '/app/ai-tutor',
  '/app/practice-generator',
  '/app/learner-memory',
  '/app/ai-writing',
  '/app/ai-speaking',
];

describe('AI feature registry', () => {
  it('contains exactly the five current AI-facing platform features', () => {
    assert.deepEqual(
      AI_FEATURE_REGISTRY.map((feature) => feature.id),
      expectedIds,
    );
  });

  it('provides complete generic metadata for every feature', () => {
    for (const feature of AI_FEATURE_REGISTRY) {
      assert.ok(feature.id.length > 0);
      assert.ok(feature.label.length > 0);
      assert.ok(feature.description.length > 0);
      assert.ok(feature.route.length > 0);
      assert.ok(feature.category.length > 0);
      assert.equal(typeof feature.requiresLocalModel, 'boolean');
      assert.equal(typeof feature.supportsLearnerMemory, 'boolean');
      assert.equal(typeof feature.requiresLearnerMemoryConsent, 'boolean');
      assert.ok(feature.status.length > 0);
      assert.ok(feature.safetyNote.length > 0);
    }
    assert.equal(new Set(AI_FEATURE_REGISTRY.map((feature) => feature.id)).size, 5);
  });

  it('provides one valid and unique app route for every feature', () => {
    const routes = AI_FEATURE_REGISTRY.map((feature) => feature.route);

    assert.deepEqual(routes, expectedRoutes);
    assert.equal(new Set(routes).size, routes.length);
    for (const route of routes) assert.match(route, /^\/app\/[a-z0-9-]+$/);
  });

  it('marks model requirements without claiming runtime readiness', () => {
    const modelRequired = AI_FEATURE_REGISTRY
      .filter((feature) => feature.requiresLocalModel)
      .map((feature) => feature.id);

    assert.deepEqual(modelRequired, [
      'ai-tutor',
      'practice-generator',
      'writing-coach',
      'speaking-coach',
    ]);
    assert.ok(
      AI_FEATURE_REGISTRY
        .filter((feature) => feature.requiresLocalModel)
        .every((feature) => feature.status === 'shell-ready'),
    );
  });

  it('marks learner-memory consumers and consent requirements explicitly', () => {
    const memoryConsumers = AI_FEATURE_REGISTRY
      .filter((feature) => feature.supportsLearnerMemory)
      .map((feature) => feature.id);

    assert.deepEqual(memoryConsumers, [
      'ai-tutor',
      'practice-generator',
      'writing-coach',
      'speaking-coach',
    ]);
    assert.ok(
      AI_FEATURE_REGISTRY
        .filter((feature) => feature.supportsLearnerMemory)
        .every((feature) => feature.requiresLearnerMemoryConsent),
    );
    assert.equal(getAIFeatureById('learner-memory')?.requiresLearnerMemoryConsent, true);
  });

  it('keeps learner memory separate from generated AI output', () => {
    const memory = getAIFeatureById('learner-memory');

    assert.ok(memory);
    assert.equal(memory.requiresLocalModel, false);
    assert.equal(memory.supportsLearnerMemory, false);
    assert.equal(memory.status, 'available-without-model');
    assert.match(memory.safetyNote, /does not generate coaching output/i);
  });

  it('does not contain exam-specific language or prohibited marketing claims', () => {
    const text = JSON.stringify(AI_FEATURE_REGISTRY);

    assert.doesNotMatch(text, /IELTS|TOEIC|TOEFL|band score|Speaking Part|Writing Task/i);
    assert.doesNotMatch(
      text,
      /unlimited AI|ChatGPT-like|official IELTS score|guaranteed band|stronger than ELSA/i,
    );
  });

  it('builds honest hub cards without insights, scores, or recommendations', () => {
    const view = buildAICoachHubViewModel();
    const text = JSON.stringify(view);

    assert.equal(view.features.length, 5);
    assert.match(view.foundationDescription, /does not verify.*model or runtime/i);
    assert.ok(view.features.every((feature) => feature.route.startsWith('/app/')));
    assert.doesNotMatch(text, /personalized recommendation|generated insight|score:/i);
  });
});
