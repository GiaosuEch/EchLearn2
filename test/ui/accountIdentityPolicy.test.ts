import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MAX_LOCAL_ACCOUNTS_PER_EMAIL,
  canCreateLocalAccount,
  getAuthModeCopy,
  normalizeAccountEmail,
} from '../../src/services/accountIdentityPolicy.ts';

describe('account identity policy', () => {
  it('normalizes an email before every account-limit decision', () => {
    assert.equal(normalizeAccountEmail('  Learner@Example.COM  '), 'learner@example.com');
  });

  it('permits at most three local demonstration accounts for one normalized email', () => {
    assert.equal(MAX_LOCAL_ACCOUNTS_PER_EMAIL, 3);
    assert.equal(canCreateLocalAccount(0), true);
    assert.equal(canCreateLocalAccount(2), true);
    assert.equal(canCreateLocalAccount(3), false);
  });

  it('states the Supabase identity constraint without promising a fake three-account workaround', () => {
    assert.match(getAuthModeCopy('supabase'), /one verified sign-in identity/i);
    assert.match(getAuthModeCopy('local'), /demonstration/i);
  });
});
