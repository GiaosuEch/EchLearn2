import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  timingSafeEqualHex,
  validateLicenseKeyLocally,
  generateClientTestKey,
  DEFAULT_LICENSE_SALT,
} from '../../src/lib/licenseCrypto.ts';

import {
  checkRedemptionRateLimit,
  recordRedemptionFailure,
  resetRedemptionRateLimit,
} from '../../src/lib/licenseRateLimit.ts';

describe('License Security Hardening & Rate Limiter Suite', () => {
  beforeEach(() => {
    resetRedemptionRateLimit();
  });

  describe('Constant-Time Hex Comparison (Timing-Attack Resistance)', () => {
    test('accurately returns true for identical hex digests', () => {
      const h1 = '8C41F9AA';
      const h2 = '8C41F9AA';
      assert.equal(timingSafeEqualHex(h1, h2), true);
    });

    test('returns false for length mismatches without throwing', () => {
      assert.equal(timingSafeEqualHex('8C41F9AA', '8C41F9'), false);
      assert.equal(timingSafeEqualHex('8C41', '8C41F9AA'), false);
    });

    test('returns false for single-bit or single-character differences', () => {
      assert.equal(timingSafeEqualHex('8C41F9AA', '8C41F9AB'), false);
      assert.equal(timingSafeEqualHex('00000000', '00000001'), false);
    });

    test('safely handles non-string inputs', () => {
      assert.equal(timingSafeEqualHex(null as any, 'ABC'), false);
      assert.equal(timingSafeEqualHex(undefined as any, undefined as any), false);
    });
  });

  describe('Client-Side Brute-Force & Rate Limiting Shield', () => {
    test('initial state allows redemption with 5 attempts remaining', () => {
      const status = checkRedemptionRateLimit();
      assert.equal(status.allowed, true);
      assert.equal(status.remainingAttempts, 5);
      assert.equal(status.lockRemainingSeconds, 0);
    });

    test('decrements remaining attempts on recorded failures', () => {
      const f1 = recordRedemptionFailure();
      assert.equal(f1.allowed, true);
      assert.equal(f1.remainingAttempts, 4);

      const f2 = recordRedemptionFailure();
      assert.equal(f2.allowed, true);
      assert.equal(f2.remainingAttempts, 3);
    });

    test('locks out attempts after 5 consecutive failures', () => {
      recordRedemptionFailure(); // 1
      recordRedemptionFailure(); // 2
      recordRedemptionFailure(); // 3
      recordRedemptionFailure(); // 4
      const f5 = recordRedemptionFailure(); // 5 -> Lockout triggered

      assert.equal(f5.allowed, false);
      assert.equal(f5.remainingAttempts, 0);
      assert.ok(f5.lockRemainingSeconds > 0);

      // Subsequent checks should be blocked
      const status = checkRedemptionRateLimit();
      assert.equal(status.allowed, false);
      assert.ok(status.lockRemainingSeconds > 0);
    });

    test('resets lockout cleanly on success', () => {
      recordRedemptionFailure();
      recordRedemptionFailure();
      resetRedemptionRateLimit();

      const status = checkRedemptionRateLimit();
      assert.equal(status.allowed, true);
      assert.equal(status.remainingAttempts, 5);
    });
  });

  describe('Dynamic Salt & Web Crypto Integration', () => {
    test('validates genuine keys generated with default and custom salts', async () => {
      const defaultKey = await generateClientTestKey('ECHLEARN', DEFAULT_LICENSE_SALT);
      const resDefault = await validateLicenseKeyLocally(defaultKey, DEFAULT_LICENSE_SALT);
      assert.equal(resDefault.valid, true);
      assert.equal(resDefault.targetPlan, 'pro');

      const customSalt = 'my_super_secret_custom_salt_value_2026_x';
      const customKey = await generateClientTestKey('IELTSVIP', customSalt);
      const resCustom = await validateLicenseKeyLocally(customKey, customSalt);
      assert.equal(resCustom.valid, true);

      // Verifying with wrong salt should fail
      const resWrongSalt = await validateLicenseKeyLocally(customKey, DEFAULT_LICENSE_SALT);
      assert.equal(resWrongSalt.valid, false);
      assert.equal(resWrongSalt.reason, 'invalid_checksum');
    });
  });
});
