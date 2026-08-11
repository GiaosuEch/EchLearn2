import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTurnstileSiteKey, turnstileSubmissionError } from '../../src/services/turnstilePolicy.ts';

test('Turnstile remains inactive until a public site key is configured', () => {
  assert.equal(getTurnstileSiteKey(undefined), null);
  assert.equal(getTurnstileSiteKey('   '), null);
  assert.equal(getTurnstileSiteKey('0x4AAAAAABCD'), '0x4AAAAAABCD');
});

test('a configured Turnstile challenge blocks auth submission until it has a token', () => {
  assert.equal(turnstileSubmissionError({ siteKey: null, token: null }), null);
  assert.match(turnstileSubmissionError({ siteKey: '0x4AAAAAABCD', token: null }) ?? '', /xác minh/i);
  assert.equal(turnstileSubmissionError({ siteKey: '0x4AAAAAABCD', token: 'token-from-turnstile' }), null);
});
