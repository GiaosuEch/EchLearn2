/**
 * RAVENHUB — ECDH EPHEMERAL HANDSHAKE ENGINE
 * ------------------------------------------------------------------
 * Flow (cloaked under /api/v1/telemetry/*):
 *
 *  PHASE 1 — `/api/v1/telemetry/sync`
 *    client → { cpk: client ephemeral ECDH public key (SPKI b64),
 *                nonce }
 *    server → generates its OWN ephemeral ECDH keypair, derives the
 *             AES-256-GCM session key via HKDF(ECDH(clientPub, serverPriv),
 *             nonce) and returns { sid, spk, sig } where `sig` is an
 *             ECDSA signature over `spk + nonce` using the STATIC
 *             server identity key. The client verifies this signature
 *             against the embedded public key — no MITM can spoof it.
 *
 *  PHASE 2 — `/api/v1/telemetry/report`
 *    client → { sid, iv, tag, data } where `data` is AES-256-GCM
 *             ciphertext of { key, hwid, nonce, ts, action, platform }.
 *    server → decrypts, validates the license (HMAC block, expiry,
 *             revocation, device-limit/HWID binding), re-encrypts the
 *             verdict and signs it with ECDSA. Offline caching in the
 *             client uses exactly this signature for trust.
 *
 * All buffers holding plaintext/keys are scrubbed after use.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { devices, licenses, telemetry } from "@/db/schema";
import {
  AES_KEY_LEN,
  aesGcmDecrypt,
  aesGcmEncrypt,
  ecdhDeriveSecret,
  ecdsaSign,
  generateEcdhKeypair,
  hkdfSha256,
  randomHex,
  scrub,
} from "@/lib/crypto";
import { hashLicenseKey, validateKeyChecksum } from "@/lib/license";
import { ensureSystem } from "@/lib/system";

/* ================================================================== */
/* In-memory ephemeral session store                                  */
/* ================================================================== */
export interface HandshakeSession {
  sid: string;
  clientPubPem: string;
  serverPrivPem: string;
  serverPubPem: string;
  aesKey: Buffer;
  nonce: string;
  createdAt: number;
  usedNonces: Set<string>;
}

const sessions = new Map<string, HandshakeSession>();
const SESSION_TTL_MS = 90_000; // 90 seconds to complete the exchange
const MAX_SESSIONS = 5000;
const MAX_REPORTS_PER_SESSION = 8;

function gcSessions(now = Date.now()) {
  for (const [sid, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      scrub([session.aesKey]);
      sessions.delete(sid);
    }
  }
}

/* ================================================================== */
/* PHASE 1 — ECDH key exchange                                        */
/* ================================================================== */
export interface SyncResult {
  sid: string;
  spk: string; // server ephemeral public key (SPKI base64)
  sig: string; // ECDSA signature over `spk|nonce` with static key
  nonce: string;
}

export async function createHandshakeSession(
  clientPubB64: string,
  nonce: string,
  staticPrivateKeyPem: string,
): Promise<SyncResult | null> {
  gcSessions();
  if (sessions.size >= MAX_SESSIONS) return null;
  if (!nonce || !/^[0-9a-fA-F]{16,64}$/.test(nonce)) return null;

  // Parse + validate the client's ephemeral public key before trusting it.
  let clientPubPem: string;
  try {
    clientPubPem = Buffer.from(clientPubB64, "base64").toString("utf8");
    // Reject non-PEM payloads early (cheap sanity gate, crypto later).
    if (!clientPubPem.startsWith("-----BEGIN PUBLIC KEY-----")) return null;
  } catch {
    return null;
  }

  const eph = generateEcdhKeypair();
  let sharedSecret: Buffer | null = null;
  try {
    sharedSecret = ecdhDeriveSecret(eph.privateKeyPem, clientPubPem);
  } catch {
    // Invalid curve point or malformed key — refuse silently.
    return null;
  }
  const aesKey = hkdfSha256(sharedSecret, nonce, "ravenhub/v1/telemetry", AES_KEY_LEN);
  scrub([sharedSecret]);

  const sid = randomHex(8);
  const sig = ecdsaSign(`${eph.publicKeyPem}|${nonce}`, staticPrivateKeyPem);

  sessions.set(sid, {
    sid,
    clientPubPem,
    serverPrivPem: eph.privateKeyPem,
    serverPubPem: eph.publicKeyPem,
    aesKey,
    nonce,
    createdAt: Date.now(),
    usedNonces: new Set(),
  });

  // spk travels base64-encoded; the signature covers the raw PEM.
  return {
    sid,
    spk: Buffer.from(eph.publicKeyPem, "utf8").toString("base64"),
    sig,
    nonce,
  };
}

/* ================================================================== */
/* PHASE 2 — encrypted license validation                             */
/* ================================================================== */
export interface ReportInput {
  sid: string;
  iv: string;
  tag: string;
  data: string;
}

export interface ClientPayload {
  key: string;
  hwid: string;
  nonce: string;
  ts: number;
  action: string;
  platform?: string;
}

export interface Verdict {
  ok: boolean;
  reason: string;
  status: string;
  expiresAt: string | null;
  boundDevice: boolean;
  latencyMs: number;
}

export interface ReportResult {
  /** Encrypted + signed response for a successful session. */
  payload?: { iv: string; tag: string; data: string };
  /** Plain verdict used when the session itself failed. */
  error?: string;
  status: number;
  latencyMs: number;
  logKeyHash?: string | null;
  logHwidHash?: string | null;
  logPlatform?: string;
  logOk: number;
  logAction: string;
  logNote?: string;
  licenseId?: string | null;
  ip?: string;
}

export async function handleReport(
  input: ReportInput,
  ip: string,
): Promise<ReportResult> {
  const started = Date.now();
  gcSessions();

  const fail = (
    status: number,
    error: string,
    log: Partial<ReportResult> = {},
  ): ReportResult => ({
    error,
    status,
    latencyMs: Date.now() - started,
    logOk: 0,
    logAction: "verify",
    logNote: error,
    ...log,
  });

  const session = sessions.get(input.sid);
  if (!session) return fail(401, "handshake_session_not_found");

  const iv = Buffer.from(input.iv ?? "", "base64");
  const tag = Buffer.from(input.tag ?? "", "base64");
  const ciphertext = Buffer.from(input.data ?? "", "base64");
  if (iv.length === 0 || tag.length === 0 || ciphertext.length === 0) {
    return fail(401, "bad_ciphertext");
  }

  let plain: Buffer | null = null;
  try {
    plain = aesGcmDecrypt(
      session.aesKey,
      iv,
      tag,
      ciphertext,
      Buffer.from(input.sid, "utf8"), // AAD = session id
    );
  } catch {
    return fail(401, "decrypt_failed");
  }

  let clientPayload: ClientPayload;
  try {
    clientPayload = JSON.parse(plain.toString("utf8"));
  } catch {
    scrub([plain]);
    return fail(401, "bad_payload_json");
  }

  // Replay protection: each client nonce may be used exactly once.
  if (session.usedNonces.has(clientPayload.nonce)) {
    scrub([plain]);
    return fail(401, "nonce_replay_detected");
  }
  if (session.usedNonces.size >= MAX_REPORTS_PER_SESSION) {
    scrub([plain]);
    return fail(401, "session_exhausted");
  }
  session.usedNonces.add(clientPayload.nonce);

  // Clock skew guard: payload timestamps must be within ±5 minutes.
  if (
    typeof clientPayload.ts !== "number" ||
    Math.abs(Date.now() - clientPayload.ts) > 5 * 60_000
  ) {
    scrub([plain]);
    return fail(401, "timestamp_skew", { logKeyHash: null });
  }

  const state = await ensureSystem();

  // 1) Local HMAC pre-validation — identical to the compiled client.
  const local = validateKeyChecksum(clientPayload.key, state.ecdsaPublicKeyPem, state.brandPrefix);
  const parsed = local.parsed;
  const keyHash = clientPayload.key ? hashLicenseKey(clientPayload.key) : null;
  const hwidHash = clientPayload.hwid
    ? hashLicenseKey(`hwid|${clientPayload.hwid}`)
    : null;

  const action = clientPayload.action === "heartbeat" ? "heartbeat" : "verify";

  if (!local.valid) {
    scrub([plain]);
    return fail(401, local.reason, { logKeyHash: keyHash, logHwidHash: hwidHash, logAction: action });
  }

  // 2) Database lookup (by key hash — never raw key comparisons).
  const rows = await db
    .select()
    .from(licenses)
    .where(eq(licenses.keyHash, keyHash ?? ""))
    .limit(1);
  const license = rows[0];

  const verdict: Verdict = {
    ok: false,
    reason: "unknown_license",
    status: "invalid",
    expiresAt: null,
    boundDevice: false,
    latencyMs: 0,
  };

  if (!license) {
    verdict.reason = "unknown_license";
  } else if (license.status === "revoked") {
    verdict.reason = "license_revoked";
  } else if (new Date(license.expiresAt).getTime() < Date.now()) {
    verdict.reason = "license_expired";
    verdict.expiresAt = license.expiresAt.toISOString();
  } else if (!clientPayload.hwid || typeof clientPayload.hwid !== "string") {
    verdict.reason = "hwid_required";
  } else {
    // 3) Device-limit / HWID binding enforcement.
    const existing = await db
      .select()
      .from(devices)
      .where(
        and(eq(devices.licenseId, license.id), eq(devices.hwidHash, hwidHash ?? "")),
      )
      .limit(1);

    if (existing.length > 0) {
      // Known device → update last-seen.
      await db
        .update(devices)
        .set({ lastSeenAt: new Date(), ip: ip ?? null, platform: clientPayload.platform ?? null })
        .where(eq(devices.id, existing[0].id));
      verdict.ok = true;
      verdict.boundDevice = true;
      verdict.status = "active";
      verdict.expiresAt = license.expiresAt.toISOString();
    } else {
      const count = await db
        .select()
        .from(devices)
        .where(eq(devices.licenseId, license.id));
      if (count.length >= license.maxDevices) {
        verdict.reason = "device_limit_exceeded";
      } else {
        // New device → bind it.
        await db.insert(devices).values({
          licenseId: license.id,
          hwidHash: hwidHash ?? "",
          platform: clientPayload.platform ?? null,
          ip: ip ?? null,
          lastSeenAt: new Date(),
        });
        verdict.ok = true;
        verdict.boundDevice = true;
        verdict.status = "active";
        verdict.expiresAt = license.expiresAt.toISOString();
      }
    }
  }

  if (verdict.ok) {
    verdict.reason = "ok";
  }

  // 4) Re-encrypt the verdict and sign with the static ECDSA key.
  const responsePlain = JSON.stringify({
    ok: verdict.ok,
    status: verdict.status,
    reason: verdict.reason,
    expiresAt: verdict.expiresAt,
    boundDevice: verdict.boundDevice,
    serverTime: new Date().toISOString(),
    nonce: clientPayload.nonce,
  });
  const responseBuf = Buffer.from(responsePlain, "utf8");
  const signature = ecdsaSign(responsePlain, state.ecdsaPrivateKeyPem);
  const envelope = JSON.stringify({ verdict: responsePlain, signature });
  const envelopeBuf = Buffer.from(envelope, "utf8");
  const encrypted = aesGcmEncrypt(
    session.aesKey,
    envelopeBuf,
    Buffer.from(input.sid, "utf8"),
  );
  scrub([plain, responseBuf, envelopeBuf]);

  const latencyMs = Date.now() - started;
  const logNote = verdict.ok ? undefined : verdict.reason;

  // 5) Persist telemetry (also powers the dashboard charts).
  await db.insert(telemetry).values({
    licenseId: license?.id ?? null,
    keyHash,
    hwidHash,
    platform: clientPayload.platform ?? null,
    ok: verdict.ok ? 1 : 0,
    action,
    latencyMs,
    note: logNote ?? null,
    ip: ip ?? null,
  });

  return {
    payload: {
      iv: encrypted.iv.toString("base64"),
      tag: encrypted.tag.toString("base64"),
      data: encrypted.ciphertext.toString("base64"),
    },
    status: 200,
    latencyMs,
    logKeyHash: keyHash,
    logHwidHash: hwidHash,
    logPlatform: clientPayload.platform,
    logOk: verdict.ok ? 1 : 0,
    logAction: action,
    logNote,
    licenseId: license?.id ?? null,
    ip: ip ?? null,
  };
}

/* ================================================================== */
/* Persistence helpers (used by the dashboard)                        */
/* ================================================================== */
export async function purgeStaleSessions() {
  gcSessions();
  return sessions.size;
}

/** Live count of in-flight handshake sessions (admin overview). */
export function activeSessionCount(): number {
  gcSessions();
  return sessions.size;
}
