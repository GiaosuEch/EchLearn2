/**
 * RAVENHUB — CRYPTOGRAPHIC CORE
 * ------------------------------------------------------------------
 * Zero-dependency cryptography built exclusively on `node:crypto`:
 *
 *  - ECDSA      : prime256v1 (NIST P-256) static signing keypair.
 *                 Licenses, permits and handshake responses are signed
 *                 so compiled clients can verify authenticity offline.
 *  - ECDH       : prime256v1 ephemeral key exchange defeating MITM.
 *  - HKDF-SHA256: shared-secret → AES-256 symmetric key derivation.
 *  - AES-256-GCM: authenticated encryption of all licensing payloads.
 *  - HMAC-SHA256: license checksum blocks + JWT (HS256) sessions.
 *  - scrypt     : memory-hard admin password hashing.
 *  - TOTP       : RFC 6238 6-digit 2FA codes (Google Authenticator).
 *
 * Every secret produced or consumed here lives in a `Buffer` and is
 * scrubbed (zero-filled) as soon as it is no longer needed.
 */
import crypto from "node:crypto";

export const CURVE = "prime256v1"; // NIST P-256
export const AES_KEY_LEN = 32; // 256-bit AES keys
export const GCM_IV_LEN = 12; // 96-bit GCM nonces
export const GCM_TAG_LEN = 16; // 128-bit authentication tags
export const HKDF_INFO = "ravenhub/v1/telemetry"; // HKDF context binding

/* ================================================================== */
/* Generic hashing / entropy helpers                                  */
/* ================================================================== */
export function sha256Hex(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function hmacSha256Hex(data: string | Buffer, key: string | Buffer): string {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export function randomHex(bytes: number): string {
  const buf = crypto.randomBytes(bytes);
  const out = buf.toString("hex");
  buf.fill(0); // scrub the raw entropy buffer
  return out;
}

export function randomBase64(bytes: number): string {
  const buf = crypto.randomBytes(bytes);
  const out = buf.toString("base64");
  buf.fill(0);
  return out;
}

/* ================================================================== */
/* ECDSA — static server identity keypair (P-256)                     */
/* ================================================================== */
export interface KeyPair {
  privateKeyPem: string;
  publicKeyPem: string;
}

export function generateEcdsaKeypair(): KeyPair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: CURVE,
  });
  return {
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
  };
}

/** Sign a payload, returning a base64 DER signature. */
export function ecdsaSign(data: string | Buffer, privateKeyPem: string): string {
  const signer = crypto.createSign("SHA256");
  signer.update(data);
  signer.end();
  const sig = signer.sign(privateKeyPem);
  return sig.toString("base64");
}

/** Verify a base64 DER signature against the static public key. */
export function ecdsaVerify(
  data: string | Buffer,
  signatureB64: string,
  publicKeyPem: string,
): boolean {
  try {
    const verifier = crypto.createVerify("SHA256");
    verifier.update(data);
    verifier.end();
    return verifier.verify(publicKeyPem, Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}

/** Short fingerprint of a public key (used for key rotation display). */
export function publicKeyFingerprint(publicKeyPem: string): string {
  return sha256Hex(publicKeyPem).slice(0, 16).toUpperCase();
}

/* ================================================================== */
/* ECDH — ephemeral handshake key exchange                            */
/* ================================================================== */
export interface EcdhSessionKeys {
  privateKeyPem: string;
  publicKeyPem: string;
}

export function generateEcdhKeypair(): EcdhSessionKeys {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: CURVE,
  });
  return {
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
  };
}

/**
 * Derive the shared secret from our private key + peer public key.
 * Both sides converge on the same 32-byte secret on the P-256 curve.
 */
export function ecdhDeriveSecret(
  privateKeyPem: string,
  peerPublicKeyPem: string,
): Buffer {
  const shared = crypto.diffieHellman({
    privateKey: crypto.createPrivateKey(privateKeyPem),
    publicKey: crypto.createPublicKey(peerPublicKeyPem),
  });
  return shared;
}

/** HKDF-SHA256: shared secret + salt → 32-byte AES-256 session key. */
export function hkdfSha256(
  inputKeyMaterial: Buffer,
  salt: string,
  info = HKDF_INFO,
  length = AES_KEY_LEN,
): Buffer {
  const extracted = crypto
    .createHmac("sha256", salt)
    .update(inputKeyMaterial)
    .digest();
  return Buffer.from(crypto.hkdfSync("sha256", extracted, Buffer.alloc(0), info, length));
}

/* ================================================================== */
/* AES-256-GCM — authenticated symmetric encryption                   */
/* ================================================================== */
export function aesGcmEncrypt(
  key: Buffer,
  plaintext: Buffer,
  aad: Buffer = Buffer.alloc(0),
): { iv: Buffer; tag: Buffer; ciphertext: Buffer } {
  const iv = crypto.randomBytes(GCM_IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, tag, ciphertext };
}

export function aesGcmDecrypt(
  key: Buffer,
  iv: Buffer,
  tag: Buffer,
  ciphertext: Buffer,
  aad: Buffer = Buffer.alloc(0),
): Buffer {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/* ================================================================== */
/* scrypt — memory-hard admin password hashing                        */
/* ================================================================== */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  const out = `${salt.toString("hex")}:${hash.toString("hex")}`;
  salt.fill(0);
  hash.fill(0);
  return out;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const candidate = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  const equal = candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  candidate.fill(0);
  return equal;
}

/* ================================================================== */
/* TOTP — RFC 6238 time-based one-time passwords                      */
/* ================================================================== */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): {
  secretB32: string;
  otpauthUri: (account: string) => string;
} {
  const secretB32 = crypto
    .randomBytes(20)
    .toString("base64")
    .replace(/[^A-Za-z2-7]/g, "")
    .slice(0, 32);
  return {
    secretB32,
    otpauthUri: (account: string) =>
      `otpauth://totp/RavenHub%3A${encodeURIComponent(
        account,
      )}?secret=${secretB32}&issuer=RavenHub-License-System&algorithm=SHA1&digits=6&period=30`,
  };
}

/** Compute the RFC 6238 6-digit code for a given time counter. */
export function totpCode(secretB32: string, timeMs = Date.now()): string {
  const counter = Math.floor(timeMs / 30000);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const key = base32Decode(secretB32);
  const hash = crypto.createHmac("sha1", key).update(msg).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  const code = (binary % 1000000).toString().padStart(6, "0");
  key.fill(0);
  msg.fill(0);
  hash.fill(0);
  return code;
}

/** Verify a TOTP code allowing ±1 time-window drift (30s). */
export function totpVerify(secretB32: string, code: string, window = 1): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  for (let w = -window; w <= window; w += 1) {
    if (totpCode(secretB32, Date.now() + w * 30000) === code) return true;
  }
  return false;
}

/* ================================================================== */
/* JWT — HS256 session tokens (signed with the server JWT secret)     */
/* ================================================================== */
function b64url(data: Buffer | string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export interface JwtClaims {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti?: string;
}

export function signJwt(
  claims: Omit<JwtClaims, "iat" | "exp"> & { ttlSeconds?: number },
  secret: string,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (claims.ttlSeconds ?? 60 * 60 * 12);
  const payload: JwtClaims = {
    sub: claims.sub,
    role: claims.role,
    iat,
    exp,
    ...(claims.jti ? { jti: claims.jti } : {}),
  };
  const head = b64url(JSON.stringify(header));
  const body = b64url(JSON.stringify(payload));
  const signature = hmacSha256Hex(`${head}.${body}`, secret);
  return `${head}.${body}.${signature}`;
}

/** Verify structure, algorithm, signature and expiry. Returns claims or null. */
export function verifyJwt(token: string, secret: string): JwtClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headB64, bodyB64, sig] = parts;
    const header = JSON.parse(Buffer.from(headB64, "base64url").toString());
    if (header.alg !== "HS256") return null; // reject alg-confusion attacks
    const expected = hmacSha256Hex(`${headB64}.${bodyB64}`, secret);
    if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))) {
      return null;
    }
    const claims = JSON.parse(Buffer.from(bodyB64, "base64url").toString()) as JwtClaims;
    if (typeof claims.exp !== "number" || claims.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

/* ================================================================== */
/* Buffer scrubbing utility                                           */
/* ================================================================== */
export function scrub(buffers: Array<Buffer | undefined | null>): void {
  for (const buf of buffers) {
    if (buf && Buffer.isBuffer(buf)) buf.fill(0);
  }
}
