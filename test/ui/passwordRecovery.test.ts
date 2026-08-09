import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateNewPassword } from '../../src/services/passwordRecoveryPolicy.ts';

test('password recovery rejects weak or mismatched passwords before calling Supabase', () => {
  assert.match(validateNewPassword('short', 'short') ?? '', /ít nhất 8/i);
  assert.match(validateNewPassword('correct-horse', 'different') ?? '', /không khớp/i);
});

test('password recovery accepts a confirmed eight-character password', () => {
  assert.equal(validateNewPassword('eightchar', 'eightchar'), null);
});
