/**
 * ============================================================================
 * ECHLEARN — IN-APP WEB CRYPTO LICENSING ENGINE
 * ============================================================================
 * Client-side cryptographic validator utilizing standard Web Crypto API
 * (crypto.subtle) with ZERO Node.js dependencies.
 *
 * Supported Key Formats:
 *   [PREFIX]-[12 HEX ENTROPY]-[8 HEX HMAC CHECKSUM]
 *   e.g. ECHLEARN-9f3a1c77d2e4-8c41f9aa
 *        IELTSVIP-5b290df81e3a-4a7b9c1d
 *        RAVENHUB-69766ab3e929-ed1f4070
 * ============================================================================
 */

export interface ParsedLicenseKey {
  readonly raw: string;
  readonly prefix: string;
  readonly entropy: string;
  readonly checksum: string;
  readonly validFormat: boolean;
}

export interface LicenseValidationResult {
  readonly valid: boolean;
  readonly reason:
    | 'ok'
    | 'malformed_format'
    | 'invalid_checksum'
    | 'crypto_unavailable'
    | 'expired'
    | 'revoked';
  readonly prefix?: string;
  readonly entropy?: string;
  readonly targetPlan?: 'pro' | 'plus' | 'go';
}

/** Standard public secret salt for client-side tamper-resistance pre-check */
export const DEFAULT_LICENSE_SALT =
  'echlearn_enterprise_secure_v20_2026_authority_salt_key_99';

/**
 * Parses and normalizes a license key string from user input.
 * Strips whitespace, converts to uppercase where appropriate.
 */
export function parseLicenseKey(input: string): ParsedLicenseKey {
  const normalized = (input || '').trim().toUpperCase();
  const parts = normalized.split('-');

  if (parts.length !== 3) {
    return {
      raw: normalized,
      prefix: '',
      entropy: '',
      checksum: '',
      validFormat: false,
    };
  }

  const [prefix, entropy, checksum] = parts;
  const validFormat =
    /^[A-Z0-9_]{2,24}$/.test(prefix) &&
    /^[0-9A-F]{12}$/.test(entropy) &&
    /^[0-9A-F]{8}$/.test(checksum);

  return {
    raw: normalized,
    prefix,
    entropy,
    checksum,
    validFormat,
  };
}

/**
 * Formats user input in real-time as they type:
 * E.g. "echlearn9f3a1c77d2e48c41f9aa" -> "ECHLEARN-9F3A1C77D2E4-8C41F9AA"
 */
export function formatLicenseInput(rawInput: string, defaultPrefix = 'ECHLEARN'): string {
  const cleaned = rawInput.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.length === 0) return '';

  // Check if input starts with known prefix or has custom prefix
  let prefix = defaultPrefix;
  let remaining = cleaned;

  if (cleaned.startsWith(defaultPrefix)) {
    remaining = cleaned.slice(defaultPrefix.length);
  } else if (cleaned.startsWith('IELTSVIP')) {
    prefix = 'IELTSVIP';
    remaining = cleaned.slice(8);
  } else if (cleaned.startsWith('PROVIP')) {
    prefix = 'PROVIP';
    remaining = cleaned.slice(6);
  } else if (cleaned.startsWith('RAVENHUB')) {
    prefix = 'RAVENHUB';
    remaining = cleaned.slice(8);
  }

  let formatted = prefix;

  if (remaining.length > 0) {
    const entropyPart = remaining.slice(0, 12);
    formatted += `-${entropyPart}`;

    if (remaining.length > 12) {
      const checksumPart = remaining.slice(12, 20);
      formatted += `-${checksumPart}`;
    }
  }

  return formatted;
}

function getCrypto(): Crypto | null {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto;
  }
  return null;
}

/**
 * Computes HMAC-SHA256 in Web Crypto API and returns first 8 hex characters.
 */
export async function computeWebHmac(
  message: string,
  secret: string = DEFAULT_LICENSE_SALT
): Promise<string> {
  const cryptoInstance = getCrypto();
  if (!cryptoInstance?.subtle) {
    throw new Error('Web Crypto subtle is unavailable');
  }

  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message.toLowerCase());

  const cryptoKey = await cryptoInstance.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await cryptoInstance.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hex.slice(0, 8).toUpperCase();
}

/**
 * Generates an anonymous device/browser fingerprint without collecting PII.
 */
export async function getAnonymousDeviceFingerprint(): Promise<string> {
  try {
    const cryptoInstance = getCrypto();
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const scr = typeof screen !== 'undefined' ? screen : null;

    const components = [
      nav?.userAgent || 'default-agent',
      nav?.language || 'vi-VN',
      scr ? `${scr.width}x${scr.height}` : '1920x1080',
      scr?.colorDepth || 24,
      typeof Date !== 'undefined' ? new Date().getTimezoneOffset() : 0,
      nav ? (nav as unknown as { hardwareConcurrency?: number }).hardwareConcurrency || 4 : 4,
    ].join('###');

    if (cryptoInstance?.subtle) {
      const enc = new TextEncoder();
      const data = enc.encode(components);
      const hashBuffer = await cryptoInstance.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    }
    return 'anon-fp-' + Math.random().toString(36).slice(2, 18);
  } catch {
    return 'browser-fp-' + Math.random().toString(36).slice(2, 18);
  }
}

/**
 * Constant-time equality comparison for hex strings to prevent timing side-channel attacks.
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Resolves active secret salt from environment variable or falls back to system default.
 */
export function getLicenseSecretSalt(): string {
  try {
    const envSalt = (import.meta as any)?.env?.VITE_LICENSE_SALT;
    if (typeof envSalt === 'string' && envSalt.trim().length >= 16) {
      return envSalt.trim();
    }
  } catch {
    // Environment not accessible
  }
  return DEFAULT_LICENSE_SALT;
}

/**
 * Validates a license key locally using Web Crypto HMAC in < 1ms with timing-safe comparison.
 */
export async function validateLicenseKeyLocally(
  keyString: string,
  secret: string = getLicenseSecretSalt()
): Promise<LicenseValidationResult> {
  const cryptoInstance = getCrypto();
  if (!cryptoInstance?.subtle) {
    return { valid: false, reason: 'crypto_unavailable' };
  }

  const parsed = parseLicenseKey(keyString);
  if (!parsed.validFormat) {
    return { valid: false, reason: 'malformed_format' };
  }

  try {
    const expectedChecksum = await computeWebHmac(parsed.entropy, secret);

    if (!timingSafeEqualHex(expectedChecksum.toUpperCase(), parsed.checksum.toUpperCase())) {
      return { valid: false, reason: 'invalid_checksum' };
    }

    // Determine target plan by prefix
    let targetPlan: 'pro' | 'plus' | 'go' = 'pro';
    if (parsed.prefix.includes('PLUS')) {
      targetPlan = 'plus';
    } else if (parsed.prefix.includes('GO')) {
      targetPlan = 'go';
    }

    return {
      valid: true,
      reason: 'ok',
      prefix: parsed.prefix,
      entropy: parsed.entropy,
      targetPlan,
    };
  } catch (err) {
    console.error('[LicenseCrypto] local verification error:', err);
    return { valid: false, reason: 'crypto_unavailable' };
  }
}

/**
 * Helper to generate a valid testing/development license key.
 */
export async function generateClientTestKey(
  prefix = 'ECHLEARN',
  secret: string = DEFAULT_LICENSE_SALT
): Promise<string> {
  const cryptoInstance = getCrypto();
  const bytes = new Uint8Array(6);
  if (cryptoInstance) {
    cryptoInstance.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const entropy = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  const checksum = await computeWebHmac(entropy, secret);
  return `${prefix.toUpperCase()}-${entropy}-${checksum}`;
}
