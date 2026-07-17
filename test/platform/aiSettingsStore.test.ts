import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AI_SETTINGS_STORAGE_KEY,
  createAISettingsStore,
  createInMemoryAISettingsStorageAdapter,
} from '../../src/platform/ai/aiSettingsStore.ts';

function createTestStore() {
  const storage = createInMemoryAISettingsStorageAdapter();
  let tick = 0;
  const store = createAISettingsStore({
    storage,
    now: () => `2026-07-17T04:00:0${tick++}.000Z`,
  });
  return { storage, store };
}

describe('AI Settings store', () => {
  it('starts with privacy-safe defaults', () => {
    const { store } = createTestStore();

    assert.deepEqual(store.read(), {
      preferredLocalAiTier: 'auto',
      showUnavailableAiFeatures: true,
      allowMetadataAuditLog: false,
      updatedAt: null,
    });
  });

  it('persists only allowlisted preference metadata with an injectable clock', () => {
    const { storage, store } = createTestStore();

    const settings = store.update({
      preferredLocalAiTier: 'standard',
      showUnavailableAiFeatures: false,
      allowMetadataAuditLog: true,
      prompt: 'private learner text',
      transcript: 'private transcript',
    } as Parameters<typeof store.update>[0]);

    assert.deepEqual(settings, {
      preferredLocalAiTier: 'standard',
      showUnavailableAiFeatures: false,
      allowMetadataAuditLog: true,
      updatedAt: '2026-07-17T04:00:00.000Z',
    });
    const raw = storage.getItem(AI_SETTINGS_STORAGE_KEY) ?? '';
    assert.doesNotMatch(raw, /private learner text|private transcript|prompt|transcript/);
    assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), [
      'allowMetadataAuditLog',
      'preferredLocalAiTier',
      'showUnavailableAiFeatures',
      'updatedAt',
    ].sort());
  });

  it('drops unknown and raw-content fields from stored data and rewrites a clean record', () => {
    const { storage, store } = createTestStore();
    storage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify({
      preferredLocalAiTier: 'light',
      showUnavailableAiFeatures: false,
      allowMetadataAuditLog: true,
      updatedAt: '2026-07-17T03:00:00.000Z',
      rawPrompt: 'private prompt',
      rawOutput: 'private output',
      essayText: 'private essay',
      learnerMemoryContent: { weakSkills: ['private'] },
    }));

    assert.deepEqual(store.read(), {
      preferredLocalAiTier: 'light',
      showUnavailableAiFeatures: false,
      allowMetadataAuditLog: true,
      updatedAt: '2026-07-17T03:00:00.000Z',
    });
    const rewritten = storage.getItem(AI_SETTINGS_STORAGE_KEY) ?? '';
    assert.doesNotMatch(rewritten, /rawPrompt|rawOutput|essayText|learnerMemoryContent|private/);
  });

  it('handles malformed localStorage safely and resets to defaults', () => {
    const { storage, store } = createTestStore();
    storage.setItem(AI_SETTINGS_STORAGE_KEY, '{not-json');

    assert.deepEqual(store.read(), {
      preferredLocalAiTier: 'auto',
      showUnavailableAiFeatures: true,
      allowMetadataAuditLog: false,
      updatedAt: null,
    });
    assert.equal(storage.getItem(AI_SETTINGS_STORAGE_KEY), null);
  });

  it('rejects invalid preference values without claiming model readiness', () => {
    const { store } = createTestStore();

    const settings = store.update({
      preferredLocalAiTier: 'model-ready',
      showUnavailableAiFeatures: 'yes',
      allowMetadataAuditLog: 'yes',
    } as Parameters<typeof store.update>[0]);

    assert.deepEqual(settings, {
      preferredLocalAiTier: 'auto',
      showUnavailableAiFeatures: true,
      allowMetadataAuditLog: false,
      updatedAt: '2026-07-17T04:00:00.000Z',
    });
  });

  it('does not create a second learner-memory consent field', () => {
    const { store } = createTestStore();
    const settings = store.read() as unknown as Record<string, unknown>;

    assert.equal('learnerMemoryConsent' in settings, false);
    assert.equal('consent' in settings, false);
  });
});
