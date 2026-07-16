import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LEARNER_MEMORY_STORAGE_KEY,
  createInMemoryStorageAdapter,
  deleteLearnerMemory,
  disableLearnerMemory,
  enableLearnerMemory,
  exportLearnerMemory,
  readLearnerMemoryRecord,
} from '../../src/platform/learning/learnerMemoryStore.ts';

describe('learner memory store', () => {
  it('defaults to memory off / consent disabled', () => {
    const storage = createInMemoryStorageAdapter();
    const record = readLearnerMemoryRecord(storage);

    assert.equal(record.consent, false);
    assert.equal(record.snapshot, null);
  });

  it('enabling consent stores a snapshot with consent true', () => {
    const storage = createInMemoryStorageAdapter();
    const record = enableLearnerMemory(storage, { targetLanguage: 'en', skillFocus: 'listening' });

    assert.equal(record.consent, true);
    assert.equal(record.snapshot?.targetLanguage, 'en');
    assert.equal(record.snapshot?.skillFocus, 'listening');
    assert.equal(readLearnerMemoryRecord(storage).consent, true);
  });

  it('disabling consent keeps the snapshot but marks consent false', () => {
    const storage = createInMemoryStorageAdapter();
    enableLearnerMemory(storage, { targetLanguage: 'en' });
    const record = disableLearnerMemory(storage);

    assert.equal(record.consent, false);
    assert.ok(record.snapshot);
    assert.equal(readLearnerMemoryRecord(storage).consent, false);
  });

  it('deleting memory clears stored memory and returns the default safe state', () => {
    const storage = createInMemoryStorageAdapter();
    enableLearnerMemory(storage, { targetLanguage: 'en' });
    const record = deleteLearnerMemory(storage);

    assert.equal(record.consent, false);
    assert.equal(record.snapshot, null);
    assert.equal(storage.getItem(LEARNER_MEMORY_STORAGE_KEY), null);
  });

  it('export returns JSON-safe bounded data with no secrets', () => {
    const storage = createInMemoryStorageAdapter();
    enableLearnerMemory(storage, { targetLanguage: 'en', nativeLanguage: 'vi' });
    const exported = exportLearnerMemory(storage);

    assert.equal(typeof exported.exportedAt, 'string');
    assert.equal(exported.consent, true);
    assert.doesNotMatch(JSON.stringify(exported), /apiKey|token|password|secret/i);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(exported)));
  });

  it('handles malformed (non-JSON) localStorage data without throwing', () => {
    const storage = createInMemoryStorageAdapter();
    storage.setItem(LEARNER_MEMORY_STORAGE_KEY, '{not-json');
    const record = readLearnerMemoryRecord(storage);

    assert.equal(record.consent, false);
    assert.equal(record.snapshot, null);
  });

  it('handles malformed (wrong shape) localStorage data without throwing', () => {
    const storage = createInMemoryStorageAdapter();
    storage.setItem(LEARNER_MEMORY_STORAGE_KEY, JSON.stringify({ consent: 'yes', snapshot: 'nope' }));
    const record = readLearnerMemoryRecord(storage);

    assert.equal(record.consent, false);
    assert.equal(record.snapshot, null);
  });
});
