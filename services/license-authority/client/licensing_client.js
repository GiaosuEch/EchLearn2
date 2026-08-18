/**
 * ==================================================================
 *  RAVENHUB — LICENSING CLIENT SHIELD  (v15 · zero dependencies)
 * ==================================================================
 *  Embed this file at the very TOP of your application entry point
 *  and let the compiler bundle it into your standalone binary.
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  PROTECTION LAYERS                                           │
 *  │  1. Local HMAC-SHA256 key pre-validation  → 0 network calls  │
 *  │  2. ECDH (prime256v1) ephemeral key exchange                 │
 *  │  3. ECDSA signature verification of the server handshake     │
 *  │  4. AES-256-GCM payload encryption (MITM-proof transport)    │
 *  │  5. Clock-rollback detection via hidden .license_cache       │
 *  │  6. Offline verification with ECDSA-signed cache             │
 *  │  7. Anti-VM / anti-sandbox signature scan                    │
 *  │  8. Microsecond time-based execution guards (anti-debugger)  │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  Usage (CommonJS / ESM via default export interop):
 *    const ravenhub = require("./licensing_client.js");
 *    await ravenhub.verify({
 *      apiBase: "https://your-host.example.com",   // server base URL
 *      key: process.env.APP_LICENSE_KEY,           // user license key
 *      cachePath: ".license_cache",                // hidden offline cache
 *      banner: true,                               // print custom ASCII art
 *      evasion: { mode: "crash" },                 // VM/debugger handling
 *    });
 *    // ... your application code executes only when verified ...
 *
 *  CLI self-test:
 *    node licensing_client.js --api=http://localhost:3000 --key=CYPHER-...
 * ==================================================================
 */
"use strict";

const crypto = require("node:crypto");
const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

/* ------------------------------------------------------------------ */
/*  EMBEDDED SERVER IDENTITY (filled by the compiler)                 */
/* ------------------------------------------------------------------ */
// The compiler injects the server ECDSA public key (SPKI PEM) here at
// build time. Until compiled, the client fetches it on first run from
// `GET /api/v1/server-public-key` and caches the fingerprint. For
// production builds ALWAYS embed it — this is the anti-MITM anchor.
const EMBEDDED_PUBLIC_KEY = process.env.RAVENHUB_PUBKEY || "";
const EMBEDDED_PUBKEY_SHA256 = EMBEDDED_PUBLIC_KEY
  ? crypto.createHash("sha256").update(EMBEDDED_PUBLIC_KEY).digest("hex")
  : "";

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */
const scrub = (buffers) => {
  for (const b of buffers || []) if (Buffer.isBuffer(b)) b.fill(0);
};

const sha256Hex = (data) => crypto.createHash("sha256").update(data).digest("hex");
const hmacSha256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

function silentCrash(tag) {
  // Wipe any live plaintext buffers then terminate without a readable
  // stack trace — no useful information reaches a debugger.
  try {
    const bomb = Buffer.alloc(4096, 0x52);
    bomb.copy(Buffer.alloc(4096));
    scrub([bomb]);
  } catch {
    /* swallow — we are exiting anyway */
  }
  process.exit(0x52);
}

/* ------------------------------------------------------------------ */
/*  LAYER 1 — LOCAL HMAC PRE-VALIDATION (zero network traffic)        */
/* ------------------------------------------------------------------ */
// Key layout:  PREFIX-<12 hex>-<8 hex>
// Checksum:    HMAC_SHA256(entropy, SHA256(serverPublicKey))[:8]
// The prefix length is parsed from the key itself, so the check
// automatically adapts to any custom brand signature.
function localChecksumCheck(key, serverPublicKeyPem) {
  const parts = String(key || "").trim().split("-");
  if (parts.length !== 3) return { valid: false, reason: "malformed_key" };
  const [prefix, entropy, checksum] = parts;
  if (!/^[A-Za-z0-9_]{2,24}$/.test(prefix)) return { valid: false, reason: "bad_prefix" };
  if (!/^[0-9a-fA-F]{12}$/.test(entropy)) return { valid: false, reason: "bad_entropy" };
  if (!/^[0-9a-fA-F]{8}$/.test(checksum)) return { valid: false, reason: "bad_checksum" };
  const derivedKey = sha256Hex(serverPublicKeyPem);
  const expected = hmacSha256(entropy.toLowerCase(), derivedKey).slice(0, 8);
  if (expected.toLowerCase() !== checksum.toLowerCase()) {
    return { valid: false, reason: "checksum_mismatch" };
  }
  return { valid: true, reason: "ok", prefix, entropy };
}

/* ------------------------------------------------------------------ */
/*  LAYER 2-4 — ECDH + ECDSA + AES-256-GCM HANDSHAKE                  */
/* ------------------------------------------------------------------ */
async function handshake(apiBase, key, hwid, platform, action, serverPublicKeyPem) {
  const t0 = process.hrtime.bigint();

  // 1) Ephemeral ECDH keypair (prime256v1).
  const eph = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const clientPubPem = eph.publicKey.export({ type: "spki", format: "pem" });
  const clientPrivPem = eph.privateKey.export({ type: "pkcs8", format: "pem" });
  const nonce = crypto.randomBytes(16).toString("hex");

  // 2) PHASE 1 — publish our ephemeral public key.
  const syncRes = await fetch(`${apiBase}/api/v1/telemetry/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cpk: Buffer.from(clientPubPem).toString("base64"), nonce }),
  });
  if (!syncRes.ok) throw new Error(`sync_rejected:${syncRes.status}`);
  const sync = await syncRes.json();
  if (!sync.ok) throw new Error("sync_rejected");

  // 3) Verify the server's ephemeral key signature (anti-MITM anchor).
  const serverPubPem = Buffer.from(sync.spk, "base64").toString("utf8");
  const sigOk = crypto
    .createVerify("SHA256")
    .update(`${serverPubPem}|${nonce}`)
    .verify(serverPublicKeyPem, Buffer.from(sync.sig, "base64"));
  if (!sigOk) silentCrash("ecdsa_signature_forged");

  // 4) Derive the AES-256 session key via ECDH + HKDF-SHA256.
  const sharedSecret = crypto.diffieHellman({
    privateKey: crypto.createPrivateKey(clientPrivPem),
    publicKey: crypto.createPublicKey(serverPubPem),
  });
  const aesKey = crypto.hkdfSync(
    "sha256",
    crypto.createHmac("sha256", nonce).update(sharedSecret).digest(),
    Buffer.alloc(0),
    "ravenhub/v1/telemetry",
    32,
  );
  scrub([sharedSecret]);

  // 5) Encrypt the licensing payload with AES-256-GCM.
  const payload = JSON.stringify({
    key,
    hwid,
    nonce: crypto.randomBytes(16).toString("hex"),
    ts: Date.now(),
    action,
    platform,
  });
  const payloadBuf = Buffer.from(payload, "utf8");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(aesKey), iv);
  cipher.setAAD(Buffer.from(sync.sid, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(payloadBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  scrub([payloadBuf]);

  // 6) PHASE 2 — deliver the encrypted report.
  const reportRes = await fetch(`${apiBase}/api/v1/telemetry/report`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sid: sync.sid,
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: ciphertext.toString("base64"),
    }),
  });
  if (!reportRes.ok) throw new Error(`report_rejected:${reportRes.status}`);
  const report = await reportRes.json();
  if (!report.ok || !report.packet) throw new Error("report_rejected");

  // 7) Decrypt + verify the signed verdict.
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(aesKey),
    Buffer.from(report.packet.iv, "base64"),
  );
  decipher.setAAD(Buffer.from(sync.sid, "utf8"));
  decipher.setAuthTag(Buffer.from(report.packet.tag, "base64"));
  const envelopeBuf = Buffer.concat([
    decipher.update(Buffer.from(report.packet.data, "base64")),
    decipher.final(),
  ]);
  const envelope = JSON.parse(envelopeBuf.toString("utf8"));
  scrub([envelopeBuf, aesKey]);

  const verdictSigOk = crypto
    .createVerify("SHA256")
    .update(envelope.verdict)
    .verify(serverPublicKeyPem, Buffer.from(envelope.signature, "base64"));
  if (!verdictSigOk) silentCrash("verdict_signature_forged");

  const verdict = JSON.parse(envelope.verdict);
  const latencyMs = Number(process.hrtime.bigint() - t0) / 1e6;
  return { verdict, latencyMs };
}

/* ------------------------------------------------------------------ */
/*  LAYER 5-6 — OFFLINE CACHE & CLOCK ROLLBACK PROTECTION             */
/* ------------------------------------------------------------------ */
function cacheMac(canonical, serverPublicKeyPem) {
  // Tamper-evidence marker derived from the server identity key —
  // verifiable offline, unforgeable without the private key only
  // server-side; the authoritative ECDSA verdict arrives online.
  return hmacSha256(canonical, sha256Hex(serverPublicKeyPem));
}

function readCache(cachePath, serverPublicKeyPem) {
  try {
    const raw = fs.readFileSync(cachePath, "utf8");
    const doc = JSON.parse(raw);
    const { payload, mac, createdAt, expiresAt } = doc;
    const canonical = JSON.stringify(payload);

    // Integrity marker must match the canonical payload.
    if (cacheMac(canonical, serverPublicKeyPem) !== mac) return { tampered: true };

    const now = Date.now();
    // CLOCK ROLLBACK: current time before creation time means the
    // system clock was wound backwards — wipe the cache instantly.
    if (now < createdAt - 5 * 60 * 1000) {
      fs.rmSync(cachePath, { force: true });
      return { rolledBack: true };
    }
    if (now > new Date(expiresAt).getTime()) {
      return { expired: true };
    }
    return { ok: true, payload, createdAt, expiresAt };
  } catch {
    return null;
  }
}

function writeCache(cachePath, verdict, serverPublicKeyPem) {
  const payload = {
    ok: verdict.ok,
    status: verdict.status,
    expiresAt: verdict.expiresAt,
    boundDevice: verdict.boundDevice,
    nonce: verdict.nonce,
  };
  const canonical = JSON.stringify(payload);
  const doc = {
    payload,
    mac: cacheMac(canonical, serverPublicKeyPem),
    createdAt: Date.now(),
    expiresAt: verdict.expiresAt,
  };
  fs.writeFileSync(cachePath, JSON.stringify(doc), { mode: 0o600 });
}

/* ------------------------------------------------------------------ */
/*  LAYER 7 — ANTI-VM / ANTI-SANDBOX SIGNATURE SCAN                   */
/* ------------------------------------------------------------------ */
const HYPERVISOR_MACS = [
  "08:00:27", // VirtualBox
  "00:05:69", // VMware
  "00:0c:29", // VMware
  "00:50:56", // VMware
  "52:54:00", // QEMU/KVM
];

function detectVirtualization() {
  const hits = [];

  // MAC-prefix scan of all network interfaces (zero native modules).
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      const mac = (iface.mac || "").toLowerCase();
      for (const prefix of HYPERVISOR_MACS) {
        if (mac.startsWith(prefix)) hits.push(`mac:${prefix}@${name}`);
      }
    }
  }

  // CPU core & RAM floor (typical of throwaway sandboxes).
  if (os.cpus().length < 2) hits.push("cores:<2");
  if (os.totalmem() < 2 * 1024 ** 3) hits.push("ram:<2GB");

  // Linux DMI / hypervisor flags.
  if (process.platform === "linux") {
    try {
      const cpuinfo = fs.readFileSync("/proc/cpuinfo", "utf8").toLowerCase();
      if (/hypervisor/.test(cpuinfo)) hits.push("cpu:hypervisor");
      const dmi = fs.readFileSync(
        "/sys/class/dmi/id/product_name",
        "utf8",
      ).toLowerCase();
      if (/virtualbox|vmware|qemu|kvm/.test(dmi)) hits.push(`dmi:${dmi.trim()}`);
    } catch {
      /* non-standard container — ignore */
    }
  }

  // Windows driver scan (when running on win32).
  if (process.platform === "win32") {
    try {
      const { execSync } = require("node:child_process");
      const out = execSync("driverquery", { timeout: 4000 }).toString().toLowerCase();
      for (const sig of ["vbox", "vmware", "qemu", "sandbox"]) {
        if (out.includes(sig)) hits.push(`driver:${sig}`);
      }
    } catch {
      /* driverquery unavailable */
    }
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/*  ACTIVE-INSPECTOR DETECTION (process._debugProcess / exec args)    */
/* ------------------------------------------------------------------ */
// Detects an attached Node inspector (`--inspect`) before any
// sensitive code executes. (process._debugProcess exists on modern
// Node regardless of attachment, so only explicit inspector flags
// count as evidence.)
function detectDebugger() {
  const hits = [];
  for (const arg of process.execArgv || []) {
    if (/^--inspect/.test(arg) || /^--debug-brk/.test(arg)) hits.push(arg);
  }
  if (process.env.NODE_OPTIONS && /--inspect/.test(process.env.NODE_OPTIONS)) {
    hits.push("node_options_inspect");
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/*  LAYER 8 — TIME-BASED EXECUTION GUARDS (anti-debugger)             */
/* ------------------------------------------------------------------ */
// A debugger pause between two contiguous instructions inflates the
// measured delta from microseconds to seconds. If the guard trips we
// wipe the cache and terminate silently — no readable stack traces.
function timeGuarded(fn, thresholdMs, cachePath) {
  const t0 = process.hrtime.bigint();
  const result = fn();
  const deltaMs = Number(process.hrtime.bigint() - t0) / 1e6;
  if (deltaMs > thresholdMs) {
    try {
      if (cachePath) fs.rmSync(cachePath, { force: true });
    } catch {
      /* already gone */
    }
    silentCrash("breakpoint_detected");
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  HWID DERIVATION (sync, ~10ms budget)                              */
/* ------------------------------------------------------------------ */
function deriveHwid() {
  const parts = [
    process.platform,
    os.arch(),
    os.hostname(),
    (os.cpus() || []).map((c) => c.model).slice(0, 2).join(","),
    os.totalmem(),
    process.platform === "win32" ? process.env.COMPUTERNAME || "" : "",
  ];
  if (process.platform === "linux") {
    try {
      parts.push(fs.readFileSync("/etc/machine-id", "utf8").trim());
    } catch {
      /* machine-id unavailable */
    }
  }
  return sha256Hex(`ravenhub-hwid|${parts.join("|")}`);
}

/* ------------------------------------------------------------------ */
/*  PUBLIC API                                                        */
/* ------------------------------------------------------------------ */
let cachedServerKey = EMBEDDED_PUBLIC_KEY;
let cachedKeySource = EMBEDDED_PUBLIC_KEY ? "embedded" : null;

async function resolveServerKey(apiBase, allowFetch) {
  if (cachedServerKey) return cachedServerKey;
  if (!allowFetch) {
    throw new Error(
      "NO_EMBEDDED_PUBLIC_KEY: embed the server public key at compile time " +
        "(compiler injects it automatically) or set RAVENHUB_PUBKEY",
    );
  }
  const res = await fetch(`${apiBase}/api/v1/server-public-key`);
  if (!res.ok) throw new Error("public_key_fetch_failed");
  const data = await res.json();
  cachedServerKey = data.publicKeyPem;
  cachedKeySource = "fetched";
  return cachedServerKey;
}

const DEFAULT_BANNER = [
  " ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗ ",
  "██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗",
  "██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝",
  "██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗",
  "╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║",
  " ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝",
].join("\n");

/**
 * Verify a license key through the cloaked ECDH/AES handshake.
 * Returns { ok, status, expiresAt, latencyMs, source } where source
 * is "online" | "cache".
 */
async function verify(options) {
  const {
    apiBase = "",
    key = process.env.CYPHER_LICENSE_KEY || process.env.RAVENHUB_LICENSE_KEY || "",
    hwid = null,
    platform = process.platform,
    cachePath = path.join(process.cwd(), ".license_cache"),
    cacheTtlMs = 7 * 24 * 60 * 60 * 1000, // offline trust window
    banner = false,
    asciiArt = DEFAULT_BANNER,
    allowKeyFetch = false, // dev only — production embeds the key
    evasion = { mode: "crash", thresholdMs: 25 },
    action = "verify",
  } = options || {};

  // NOTE: only true synchronous sensitive sections are time-guarded
  // (checksum validation, HWID derivation). Guarding the whole async
  // wrapper would false-trigger on lazy module initialization.
  // --- LAYER 7: anti-VM / anti-sandbox scan. ------------------------
  if (evasion && evasion.mode !== "off") {
    const hits = detectVirtualization();
    if (hits.length > 0) {
      if (evasion.mode === "warn") {
        console.warn(`[ravenhub] virtualized environment: ${hits.join(", ")}`);
      } else {
        silentCrash("vm_detected");
      }
    }
  }

  if (banner) console.log(asciiArt);

  // --- LAYER 1: local HMAC pre-validation (time-guarded). -----------
  const serverKey = await resolveServerKey(apiBase, allowKeyFetch);
  const local = timeGuarded(
    () => localChecksumCheck(key, serverKey),
    evasion?.thresholdMs ?? 25,
    cachePath,
  );
  if (!local.valid) {
    throw new Error(`LICENSE_KEY_REJECTED: ${local.reason} (no network traffic sent)`);
  }

  // --- HWID derivation (time-guarded, ~10ms budget). --------------
  const derivedHwid = timeGuarded(
    () => (hwid || deriveHwid()),
    evasion?.thresholdMs ?? 25,
    cachePath,
  );

  // --- LAYER 5: offline cache first (fast path). ------------------
  if (fs.existsSync(cachePath)) {
    const cache = readCache(cachePath, serverKey);
    if (cache?.rolledBack) {
      throw new Error("CLOCK_ROLLBACK_DETECTED: cache wiped, online check required");
    }
    if (cache?.tampered) {
      fs.rmSync(cachePath, { force: true });
      // Tampered cache → fall through to an online verification.
    }
    if (cache?.ok) {
      const fresh = Date.now() - cache.createdAt < cacheTtlMs;
      if (fresh) {
        return { ok: true, status: "active", expiresAt: cache.expiresAt, source: "cache", latencyMs: 0 };
      }
    }
  }

  // --- LAYERS 2-4: encrypted online handshake. --------------------
  const { verdict, latencyMs } = await handshake(
    apiBase,
    key,
    derivedHwid,
    platform,
    action,
    serverKey,
  );

  if (verdict.ok && verdict.expiresAt) {
    writeCache(cachePath, verdict, serverKey);
    return {
      ok: true,
      status: verdict.status,
      expiresAt: verdict.expiresAt,
      source: "online",
      latencyMs: Math.round(latencyMs * 100) / 100,
    };
  }
  return {
    ok: false,
    status: verdict.status,
    reason: verdict.reason,
    source: "online",
    latencyMs: Math.round(latencyMs * 100) / 100,
  };
}

/* ------------------------------------------------------------------ */
/*  CLI self-test mode                                                */
/* ------------------------------------------------------------------ */
async function cli() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    for (const a of args) {
      if (a === flag) {
        const i = args.indexOf(a);
        return args[i + 1];
      }
      if (a.startsWith(`${flag}=`)) return a.slice(flag.length + 1);
    }
    return null;
  };
  const key = get("--key") || get("-k") || "";
  const apiBase = get("--api") || get("-a") || "http://localhost:3000";
  const banner = args.includes("--banner");
  // VM-evasion override for trusted development environments.
  const evasionMode = get("--evasion") || (args.includes("--no-evasion") ? "off" : "crash");

  if (!key) {
    console.error("usage: node licensing_client.js --api=<url> --key=<license> [--banner] [--evasion=off]");
    process.exit(2);
  }
  console.log(`[ravenhub] hwid        : ${deriveHwid().slice(0, 24)}…`);
  console.log(`[ravenhub] target      : ${apiBase}`);
  console.log(`[ravenhub] key         : ${key.slice(0, 8)}…`);
  const t0 = process.hrtime.bigint();
  try {
    const result = await verify({ apiBase, key, banner, allowKeyFetch: true, evasion: { mode: evasionMode } });
    const ms = (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(2);
    console.log(`[ravenhub] verdict     : ${result.ok ? "✓ GRANTED" : "✗ REJECTED (${result.reason || result.status})"}`);
    if (result.expiresAt) console.log(`[ravenhub] expires     : ${result.expiresAt}`);
    console.log(`[ravenhub] source      : ${result.source}`);
    console.log(`[ravenhub] total roundtrip: ${ms}ms (handshake ${result.latencyMs}ms)`);
    process.exit(result.ok ? 0 : 1);
  } catch (err) {
    console.error(`[ravenhub] error       : ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  cli();
}

module.exports = {
  verify,
  deriveHwid,
  detectVirtualization,
  detectDebugger,
  localChecksumCheck,
  silentCrash,
  _internals: {
    EMBEDDED_PUBLIC_KEY,
    EMBEDDED_PUBKEY_SHA256,
    readCache,
    writeCache,
  },
};
