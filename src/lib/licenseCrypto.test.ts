import { describe, it, expect } from 'vitest';
import {
  parseLicenseKey,
  formatLicenseInput,
  computeWebHmac,
  validateLicenseKeyLocally,
  generateClientTestKey,
  DEFAULT_LICENSE_SALT,
} from './licenseCrypto';

describe('LicenseCrypto Web Engine', () => {
  it('correctly parses structured license keys', () => {
    const parsed = parseLicenseKey('ECHLEARN-9F3A1C77D2E4-8C41F9AA');
    expect(parsed.validFormat).toBe(true);
    expect(parsed.prefix).toBe('ECHLEARN');
    expect(parsed.entropy).toBe('9F3A1C77D2E4');
    expect(parsed.checksum).toBe('8C41F9AA');
  });

  it('rejects malformed license keys', () => {
    expect(parseLicenseKey('INVALID-KEY').validFormat).toBe(false);
    expect(parseLicenseKey('').validFormat).toBe(false);
    expect(parseLicenseKey('ECHLEARN-123-456').validFormat).toBe(false);
  });

  it('formats raw user inputs in real time', () => {
    expect(formatLicenseInput('echlearn9f3a1c77d2e48c41f9aa')).toBe('ECHLEARN-9F3A1C77D2E4-8C41F9AA');
    expect(formatLicenseInput('ieltsvip5b290df81e3a4a7b9c1d')).toBe('IELTSVIP-5B290DF81E3A-4A7B9C1D');
  });

  it('computes HMAC-SHA256 checksum and validates valid keys', async () => {
    const entropy = '9F3A1C77D2E4';
    const checksum = await computeWebHmac(entropy, DEFAULT_LICENSE_SALT);
    const fullKey = `ECHLEARN-${entropy}-${checksum}`;

    const result = await validateLicenseKeyLocally(fullKey, DEFAULT_LICENSE_SALT);
    expect(result.valid).toBe(true);
    expect(result.targetPlan).toBe('pro');
  });

  it('detects forged/tampered checksums', async () => {
    const forgedKey = 'ECHLEARN-9F3A1C77D2E4-DEADBEEF';
    const result = await validateLicenseKeyLocally(forgedKey, DEFAULT_LICENSE_SALT);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid_checksum');
  });

  it('generates valid client test keys for all tiers', async () => {
    const proKey = await generateClientTestKey('ECHLEARN');
    const proCheck = await validateLicenseKeyLocally(proKey);
    expect(proCheck.valid).toBe(true);
    expect(proCheck.targetPlan).toBe('pro');

    const plusKey = await generateClientTestKey('PLUSVIP');
    const plusCheck = await validateLicenseKeyLocally(plusKey);
    expect(plusCheck.valid).toBe(true);
    expect(plusCheck.targetPlan).toBe('plus');

    const goKey = await generateClientTestKey('GOLEARN');
    const goCheck = await validateLicenseKeyLocally(goKey);
    expect(goCheck.valid).toBe(true);
    expect(goCheck.targetPlan).toBe('go');
  });
});
