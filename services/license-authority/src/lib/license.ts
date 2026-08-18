/**
 * RAVENHUB — LICENSE KEY FORGE & VALIDATION
 * ------------------------------------------------------------------
 * Key format:  `<BrandPrefix>-<12 hex CSPRNG>-<8 hex HMAC block>`
 *
 *  entropy  : 12 hex chars (48 bits) from a cryptographically secure
 *             PRNG — unguessable, un-brute-forceable locally.
 *  checksum : HMAC-SHA256(entropy, sha256(serverPublicKey))[:8]
 *
 * Because the checksum is keyed by a constant derived from the server
 * public key, the CLIENT can pre-validate keys locally (zero network
 * traffic) while forged/mutated keys are rejected before a handshake
 * is ever attempted.
 */
import {
  hmacSha256Hex,
  randomHex,
  sha256Hex,
} from "@/lib/crypto";

/* The HMAC key is derived from the static ECDSA public key so both
 * server and compiled clients can compute it identically. */
export function checksumKeyFor(publicKeyPem: string): string {
  return sha256Hex(publicKeyPem);
}

export function licenseChecksum(entropyHex: string, publicKeyPem: string): string {
  return hmacSha256Hex(entropyHex, checksumKeyFor(publicKeyPem)).slice(0, 8);
}

/* ------------------------------------------------------------------ */
/* Brand prefix validation                                            */
/* ------------------------------------------------------------------ */
export const PREFIX_PATTERN = /^[A-Za-z0-9_]{2,24}$/;

export function isValidPrefix(prefix: string): boolean {
  return PREFIX_PATTERN.test(prefix);
}

/* ------------------------------------------------------------------ */
/* Key forge                                                          */
/* ------------------------------------------------------------------ */
export function forgeLicenseKey(prefix: string, publicKeyPem: string): {
  key: string;
  entropyHex: string;
  checksum: string;
} {
  const entropyHex = randomHex(6); // 6 bytes → 12 hex chars
  const checksum = licenseChecksum(entropyHex, publicKeyPem);
  const key = `${prefix}-${entropyHex}-${checksum}`;
  return { key, entropyHex, checksum };
}

/* ------------------------------------------------------------------ */
/* Structural + HMAC validation (also used by the compiled client).   */
/* ------------------------------------------------------------------ */
export interface ParsedKey {
  prefix: string;
  entropy: string;
  checksum: string;
}

export function parseLicenseKey(key: string): ParsedKey | null {
  if (typeof key !== "string") return null;
  const parts = key.trim().split("-");
  if (parts.length !== 3) return null;
  const [prefix, entropy, checksum] = parts;
  if (!PREFIX_PATTERN.test(prefix)) return null;
  if (!/^[0-9a-fA-F]{12}$/.test(entropy)) return null;
  if (!/^[0-9a-fA-F]{8}$/.test(checksum)) return null;
  return { prefix, entropy, checksum };
}

/** Full local pre-validation (HMAC block) — zero network traffic. */
export function validateKeyChecksum(
  key: string,
  publicKeyPem: string,
  expectedPrefix?: string,
): { valid: boolean; reason: string; parsed: ParsedKey | null } {
  const parsed = parseLicenseKey(key);
  if (!parsed) {
    return { valid: false, reason: "malformed_key", parsed: null };
  }
  if (expectedPrefix && parsed.prefix !== expectedPrefix) {
    return { valid: false, reason: "prefix_mismatch", parsed };
  }
  const expected = licenseChecksum(parsed.entropy.toLowerCase(), publicKeyPem);
  if (expected.toLowerCase() !== parsed.checksum.toLowerCase()) {
    return { valid: false, reason: "bad_checksum", parsed };
  }
  return { valid: true, reason: "ok", parsed };
}

export function hashLicenseKey(key: string): string {
  return sha256Hex(key);
}
