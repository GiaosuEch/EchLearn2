import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  parseLicenseKey,
  formatLicenseInput,
  computeWebHmac,
  validateLicenseKeyLocally,
  generateClientTestKey,
  DEFAULT_LICENSE_SALT,
} from '../../src/lib/licenseCrypto.ts';

describe('Web Crypto Licensing Engine', () => {
  test('parses structured license keys correctly', () => {
    const parsed = parseLicenseKey('ECHLEARN-9F3A1C77D2E4-8C41F9AA');
    assert.equal(parsed.validFormat, true);
    assert.equal(parsed.prefix, 'ECHLEARN');
    assert.equal(parsed.entropy, '9F3A1C77D2E4');
    assert.equal(parsed.checksum, '8C41F9AA');
  });

  test('rejects malformed license key inputs', () => {
    assert.equal(parseLicenseKey('INVALID').validFormat, false);
    assert.equal(parseLicenseKey('').validFormat, false);
    assert.equal(parseLicenseKey('ECHLEARN-1234').validFormat, false);
  });

  test('formats user input with auto-capitalization and hyphens', () => {
    assert.equal(
      formatLicenseInput('echlearn9f3a1c77d2e48c41f9aa'),
      'ECHLEARN-9F3A1C77D2E4-8C41F9AA'
    );
    assert.equal(
      formatLicenseInput('ieltsvip5b290df81e3a4a7b9c1d'),
      'IELTSVIP-5B290DF81E3A-4A7B9C1D'
    );
  });

  test('computes HMAC-SHA256 and validates genuine license keys', async () => {
    const entropy = '9F3A1C77D2E4';
    const checksum = await computeWebHmac(entropy, DEFAULT_LICENSE_SALT);
    const key = `ECHLEARN-${entropy}-${checksum}`;

    const check = await validateLicenseKeyLocally(key, DEFAULT_LICENSE_SALT);
    assert.equal(check.valid, true);
    assert.equal(check.targetPlan, 'pro');
  });

  test('rejects tampered or forged checksums instantly', async () => {
    const forgedKey = 'ECHLEARN-9F3A1C77D2E4-DEADBEEF';
    const check = await validateLicenseKeyLocally(forgedKey, DEFAULT_LICENSE_SALT);
    assert.equal(check.valid, false);
    assert.equal(check.reason, 'invalid_checksum');
  });

  test('generates valid client test keys for all tiers (PRO, PLUS, GO)', async () => {
    const proKey = await generateClientTestKey('ECHLEARN');
    const proCheck = await validateLicenseKeyLocally(proKey);
    assert.equal(proCheck.valid, true);
    assert.equal(proCheck.targetPlan, 'pro');

    const plusKey = await generateClientTestKey('PLUSVIP');
    const plusCheck = await validateLicenseKeyLocally(plusKey);
    assert.equal(plusCheck.valid, true);
    assert.equal(plusCheck.targetPlan, 'plus');

    const goKey = await generateClientTestKey('GOLEARN');
    const goCheck = await validateLicenseKeyLocally(goKey);
    assert.equal(goCheck.valid, true);
    assert.equal(goCheck.targetPlan, 'go');
  });
});
