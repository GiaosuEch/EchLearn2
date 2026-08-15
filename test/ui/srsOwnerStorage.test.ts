import assert from 'node:assert/strict';
import test from 'node:test';

import { createOwnerScopedSrsStorage } from '../../src/stores/srsOwnerStorage.ts';

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

test('SRS storage isolates the same review id between learner accounts', () => {
  let ownerId = 'learner-a';
  const storage = createOwnerScopedSrsStorage(memoryStorage(), () => ownerId);
  storage.setItem('echlearn_srs_mastery', '{"state":{"items":{"ja:word":1}}}');

  ownerId = 'learner-b';
  assert.equal(storage.getItem('echlearn_srs_mastery'), null);
  storage.setItem('echlearn_srs_mastery', '{"state":{"items":{"ja:word":2}}}');

  ownerId = 'learner-a';
  assert.equal(storage.getItem('echlearn_srs_mastery'), '{"state":{"items":{"ja:word":1}}}');
});

test('SRS storage migrates a legacy unscoped record exactly once', () => {
  let ownerId = 'learner-a';
  const backing = memoryStorage({ echlearn_srs_mastery: '{"state":{"items":{"legacy":1}}}' });
  const storage = createOwnerScopedSrsStorage(backing, () => ownerId);

  assert.equal(storage.getItem('echlearn_srs_mastery'), '{"state":{"items":{"legacy":1}}}');
  ownerId = 'learner-b';
  assert.equal(storage.getItem('echlearn_srs_mastery'), null);
});
