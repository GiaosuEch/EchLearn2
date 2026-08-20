import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  isLockedOut,
  recordAuthFailure,
  resetRateLimiter,
} from '../../services/license-authority/src/lib/rate-limit.ts';

const setupRoute = readFileSync(
  new URL('../../services/license-authority/src/app/api/auth/setup/route.ts', import.meta.url),
  'utf8',
);
const loginRoute = readFileSync(
  new URL('../../services/license-authority/src/app/api/auth/login/route.ts', import.meta.url),
  'utf8',
);
const statusRoute = readFileSync(
  new URL('../../services/license-authority/src/app/api/auth/status/route.ts', import.meta.url),
  'utf8',
);
const setupWizard = readFileSync(
  new URL('../../services/license-authority/src/components/portal/setup-wizard.tsx', import.meta.url),
  'utf8',
);

test('license-authority account lockout accumulates consecutive failures', () => {
  resetRateLimiter();
  const username = 'owner';

  for (let attempt = 1; attempt < 5; attempt += 1) {
    recordAuthFailure(username);
    assert.equal(isLockedOut(username), false, `attempt ${attempt} must not lock early`);
  }

  recordAuthFailure(username);
  assert.equal(isLockedOut(username), true, 'the fifth failure must lock the account');
});

test('an expired lock starts a fresh failure window', async () => {
  resetRateLimiter();
  const username = 'owner-expiry';
  recordAuthFailure(username, 2, 1);
  recordAuthFailure(username, 2, 1);
  assert.equal(isLockedOut(username), true);

  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(isLockedOut(username), false);
  recordAuthFailure(username, 2, 1);
  assert.equal(isLockedOut(username), false);
});

test('first-owner setup is serialized and committed atomically', () => {
  assert.match(setupRoute, /db\.transaction\(async \(tx\)/);
  assert.match(setupRoute, /pg_advisory_xact_lock/);
  assert.match(setupRoute, /tx\.insert\(users\)/);
  assert.match(setupRoute, /tx[\s\S]*\.insert\(systemConfig\)/);
  assert.match(setupRoute, /tx\.insert\(auditLogs\)/);
});

test('authentication bounds attacker-controlled credential work', () => {
  assert.match(setupRoute, /password\.length > 256/);
  assert.match(loginRoute, /MAX_PASSWORD_LENGTH = 256/);
  assert.match(loginRoute, /USERNAME_PATTERN\.test\(username\)/);
});

test('public setup status and UI never expose the JWT signing secret', () => {
  assert.doesNotMatch(statusRoute, /jwtSecret\s*:/);
  assert.doesNotMatch(setupWizard, /jwtSecret|copySecret|JWT Secret/);
  assert.match(statusRoute, /select\(\{ id: users\.id \}\)[\s\S]*\.limit\(1\)/);
  assert.match(statusRoute, /Cache-Control["']:\s*["']no-store/);
});
