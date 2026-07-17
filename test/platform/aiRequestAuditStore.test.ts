import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AI_REQUEST_AUDIT_STORAGE_KEY,
  createAIRequestAuditStore,
  createInMemoryAIRequestAuditStorage,
} from '../../src/platform/ai/aiRequestAuditStore.ts';

function createTestStore(maxEntries = 50) {
  const storage = createInMemoryAIRequestAuditStorage();
  let id = 0;
  let second = 0;
  const store = createAIRequestAuditStore({
    storage,
    maxEntries,
    createId: () => `audit-${++id}`,
    now: () => `2026-07-17T00:00:${String(second++).padStart(2, '0')}.000Z`,
  });

  return { storage, store };
}

const baseInput = {
  featureId: 'ai-tutor' as const,
  actionType: 'conversation' as const,
  status: 'unavailable' as const,
  learnerMemoryContextUsed: false,
  learnerMemoryConsentAtRequest: false,
  errorCode: 'runtime-not-implemented',
  safetyFlags: ['no-raw-content-stored', 'runtime-not-ready'] as const,
};

describe('AI request audit store', () => {
  it('starts empty', () => {
    const { store } = createTestStore();
    assert.deepEqual(store.read(), []);
  });

  it('records metadata-only entries and derives route/model requirements from the feature registry', () => {
    const { store } = createTestStore();
    const entry = store.record(baseInput);

    assert.equal(entry.id, 'audit-1');
    assert.equal(entry.featureId, 'ai-tutor');
    assert.equal(entry.source, '/app/ai-tutor');
    assert.equal(entry.requiresLocalModel, true);
    assert.equal(entry.status, 'unavailable');
    assert.equal(entry.learnerMemoryContextUsed, false);
    assert.equal(entry.learnerMemoryConsentAtRequest, false);
    assert.deepEqual(store.read(), [entry]);
  });

  it('never persists raw learner or generated content fields', () => {
    const { storage, store } = createTestStore();
    store.record({
      ...baseInput,
      rawPrompt: 'private prompt',
      prompt: 'private prompt',
      rawOutput: 'private output',
      output: 'private output',
      essayText: 'private essay',
      transcript: 'private transcript',
      answerText: 'private answer',
      generatedContent: 'private exercise',
    } as Parameters<typeof store.record>[0]);

    const raw = storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY) ?? '';
    for (const forbidden of [
      'rawPrompt',
      'prompt',
      'rawOutput',
      'output',
      'essayText',
      'transcript',
      'answerText',
      'generatedContent',
      'private prompt',
      'private output',
      'private essay',
      'private transcript',
      'private answer',
      'private exercise',
    ]) {
      assert.equal(raw.includes(forbidden), false, forbidden);
    }
  });

  it('sanitizes previously stored entries and removes unknown content fields', () => {
    const { storage, store } = createTestStore();
    storage.setItem(AI_REQUEST_AUDIT_STORAGE_KEY, JSON.stringify([{
      id: 'legacy-1',
      featureId: 'writing-coach',
      actionType: 'feedback',
      source: '/app/untrusted',
      status: 'failed',
      startedAt: '2026-07-17T00:00:00.000Z',
      requiresLocalModel: false,
      learnerMemoryContextUsed: false,
      learnerMemoryConsentAtRequest: false,
      safetyFlags: ['no-raw-content-stored'],
      essayText: 'private legacy essay',
    }]));

    const [entry] = store.read();
    assert.equal(entry.source, '/app/ai-writing');
    assert.equal(entry.requiresLocalModel, true);
    assert.doesNotMatch(storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY) ?? '', /essayText|private legacy essay/);
  });

  it('rejects unknown action/status metadata instead of persisting arbitrary strings', () => {
    const { storage, store } = createTestStore();

    assert.throws(() => store.record({
      ...baseInput,
      actionType: 'private learner text',
    } as Parameters<typeof store.record>[0]), /action type/);
    assert.throws(() => store.record({
      ...baseInput,
      status: 'private learner text',
    } as Parameters<typeof store.record>[0]), /status/);
    assert.equal(storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY), null);
  });

  it('handles malformed localStorage safely and resets to empty history', () => {
    const { storage, store } = createTestStore();
    storage.setItem(AI_REQUEST_AUDIT_STORAGE_KEY, '{not-json');

    assert.deepEqual(store.read(), []);
    assert.equal(storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY), null);
  });

  it('keeps bounded history and trims the oldest entries', () => {
    const { store } = createTestStore(2);
    store.record(baseInput);
    store.record({ ...baseInput, featureId: 'writing-coach', actionType: 'feedback' });
    store.record({ ...baseInput, featureId: 'speaking-coach', actionType: 'feedback' });

    assert.deepEqual(store.read().map((entry) => entry.id), ['audit-2', 'audit-3']);
  });

  it('clears history', () => {
    const { storage, store } = createTestStore();
    store.record(baseInput);
    store.clear();

    assert.deepEqual(store.read(), []);
    assert.equal(storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY), null);
  });

  it('exports metadata-only JSON', () => {
    const { store } = createTestStore();
    store.record(baseInput);

    const exported = JSON.parse(store.exportJSON()) as unknown[];
    assert.equal(exported.length, 1);
    assert.deepEqual(Object.keys(exported[0] as object).sort(), [
      'actionType',
      'errorCode',
      'featureId',
      'id',
      'learnerMemoryConsentAtRequest',
      'learnerMemoryContextUsed',
      'requiresLocalModel',
      'safetyFlags',
      'source',
      'startedAt',
      'status',
    ].sort());
  });

  it('stores learner-memory consent booleans without storing memory content', () => {
    const { storage, store } = createTestStore();
    store.record({
      ...baseInput,
      featureId: 'practice-generator',
      actionType: 'generate-practice',
      learnerMemoryContextUsed: true,
      learnerMemoryConsentAtRequest: true,
      learnerMemory: { weakSkills: ['private-value'] },
    } as Parameters<typeof store.record>[0]);

    const [entry] = store.read();
    assert.equal(entry.learnerMemoryContextUsed, true);
    assert.equal(entry.learnerMemoryConsentAtRequest, true);
    assert.doesNotMatch(storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY) ?? '', /private-value|weakSkills/);
  });
});
