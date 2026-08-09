import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseSettingsRecord } from '../../src/services/settingsPersistencePolicy.ts';

test('cloud settings win over an old local cache when the account is online', () => {
  const local = { userId: 'learner-1', theme: 'dark' as const, targetLanguage: 'en' };
  const remote = { userId: 'learner-1', theme: 'light' as const, targetLanguage: 'ja' };

  assert.deepEqual(chooseSettingsRecord({ local, remote }), remote);
});

test('local settings remain available when cloud settings cannot be read', () => {
  const local = { userId: 'learner-1', theme: 'dark' as const, targetLanguage: 'en' };

  assert.deepEqual(chooseSettingsRecord({ local, remote: null }), local);
  assert.equal(chooseSettingsRecord({ local: null, remote: null }), null);
});
