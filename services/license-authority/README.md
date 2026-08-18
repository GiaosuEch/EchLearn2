<div align="center">

```
 ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗     ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗██╗     ███████╗██████╗
██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗    ██╔══██╗██╔══██╗████╗ ████║██╔══██╗██║██║     ██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝    ██████╔╝██████╔╝██╔████╔██║██████╔╝██║██║     █████╗  ██████╔╝
██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗    ██╔═══╝ ██╔══██╗██║╚██╔╝██║██╔═══╝ ██║██║     ██╔══╝  ██╔══██╗
╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║    ██║     ██║  ██║██║ ╚═╝ ██║██║     ██║███████╗███████╗██║  ██║
 ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
                     [ SECURE BINARY GENERATOR & ZERO-KNOWLEDGE LICENSING SHIELD ]
</div>

---

# EchLearn Enterprise License Authority (Sovereign Fortress Edition)

A high-performance standalone compiler & cryptographic licensing engine for EchLearn.
Forge cryptographically signed license keys, bind them to machine identities (HWID),
ship them inside V8-bytecode-compiled standalone binaries, and administer the whole
licensing ecosystem behind an enterprise admin portal protected by ECDSA handshakes,
TOTP 2FA, and live telemetry tracking.

## ⚡ Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (or use any DATABASE_URL) then apply schema
npx drizzle-kit push

# 3. Run
npm run dev
```

| URL | What you get |
| --- | --- |
| `http://localhost:3000/` | Decoy **404 Not Found** (every public route is cloaked) |
| `http://localhost:3000/secret-amethyst-portal` | **True surface** — Setup Wizard → Login → Dashboard |
| `http://localhost:3000/api/v1/server-public-key` | Static ECDSA public key (embed into clients) |

## 🔐 Security Layers — How It Works

### 1. HMAC License Keys
Keys follow `[BrandPrefix]-<12 hex CSPRNG>-<8 hex HMAC>`.

```
RavenHub_-9f3a1c77d2e4-8c41f9aa
 └─prefix─┘ └─entropy─┘ └─HMAC-SHA256(entropy, SHA256(serverPubKey))[:8]─┘
```

The checksum is keyed by the **server's static ECDSA public key**, so the
compiled client pre-validates keys **locally with zero network traffic** —
dictionary/brute-force spam never reaches the licensing API. The prefix is
parsed from the key itself, so custom brand signatures (`YouName_`,
`RavenHub_`, …) are automatically adapted by the client's HMAC checker.

### 2. ECDH Ephemeral Encrypted Handshake (anti-MITM)
Even with a root CA installed and traffic intercepted (Fiddler/Charles),
inspection fails because:

1. Client generates an ephemeral **ECDH `prime256v1`** keypair → `POST /api/v1/telemetry/sync`
2. Server answers with its ephemeral public key **signed by its static ECDSA key**
3. Client verifies the signature against the **embedded public key** (a MITM cannot forge it)
4. Both sides derive an **AES-256-GCM** session key via `HKDF-SHA256`
5. All licensing payloads `[key + hwid + nonce]` travel as ciphertext

Replays (nonce reuse), ciphertext tampering, timestamp skew (±5 min window)
and session exhaustion are all rejected server-side.

### 3. Microsecond Execution Guards (anti-debugger)
Sensitive paths are wrapped in `process.hrtime.bigint()` deltas. A breakpoint
pause inflates the delta from microseconds to seconds — the client wipes its
cache and self-terminates with exit `0x52` (no readable stack traces).
Active inspectors (`--inspect`, `process._debugProcess`) are detected before
any sensitive code runs.

### 4. Clock Rollback & Offline Cache
The hidden `.license_cache` stores the server-signed expiry **and** the local
creation timestamp. `Current_Time < Creation_Time` ⇒ clock rollback attack ⇒
cache destroyed, online re-check forced. Offline launches verify the ECDSA
signature on the cached verdict; tampered caches are discarded.

### 5. Anti-VM / Anti-Sandbox Evasion
Network MAC prefixes (`08:00:27` VirtualBox, `00:0C:29`/`00:50:56` VMware,
`52:54:00` QEMU/KVM), DMI product names, hypervisor CPU flags, Windows driver
names, and sub-2-core/sub-2GB sandbox footprints are scanned synchronously —
detection triggers silent termination (configurable `evasion.mode`).

### 6. AST Destruction — V8 Bytecode Compilation
`tools/compiler.js` bundles (ESM/CJS/TS auto-detected) → obfuscates with
`javascript-obfuscator` (self-defending AST) → compiles to **V8 bytecode
(`.jsc`)** via `bytenode` → packs a **zero-dependency Node SEA binary**.
`dist/bundle.js` and `dist/obfuscated.js` are securely **shredded** the
instant bytecode exists — no residual readable JS ever hits disk.

### 7. Cloaking Decoy Engine
`/` and every standard route return a realistic **404 Not Found** decoy with
an authentic 404 status. The dashboard only exists on
`/secret-amethyst-portal`, and the client API wears benign names
(`/api/v1/telemetry/sync`, `/api/v1/telemetry/report`).

### 8. Hardened Admin Surface
scrypt credential hashing · per-username lockout (5 fails → 15 min) ·
per-IP rate limiting · RFC 6238 **TOTP 2FA** (Google Authenticator) ·
HS256 httpOnly sessions · one-shot **first-run Owner registration** that
permanently locks the setup gateway.

### 9. Persistent Zero-Knowledge Storage
Every secret (ECDSA keypair, JWT secret), license, binding and audit row
lives in **PostgreSQL** — free-tier Render/Railway restarts wipe nothing,
and previously compiled binaries keep validating forever because the signing
key is never regenerated.

## 🚀 Free-Tier Production Deployment (no credit card)

### 1. Database — Supabase or Neon.tech (free)
1. Create a project → copy the **Postgres connection string**.
2. `DATABASE_URL=postgresql://…` — that's all the persistence this system needs.

### 2. Host — Render or Railway (free web service)
| Variable | Value |
| --- | --- |
| `DATABASE_URL` | your Postgres connection string |
| `PORT` | auto-bound by the platform |
| `CYPHER_MASTER_KEY` | *(optional)* automation bypass for CI tooling |

Build command `npm run build`, start command `npm run start`. The included
`Dockerfile` is a multi-stage build pinned to `node:20.20.2-alpine`
(&lt;100 MB image) matching the `bytenode` compilation environment.

### 3. First Run
1. Open `https://<host>/` → confirm the decoy 404 (that's the cloak working).
2. Open `https://<host>/secret-amethyst-portal` → the Setup Wizard boots.
3. Copy the displayed 32-byte JWT secret (optional env backup), register the
   **Owner** account — the gateway locks forever.

## 🔨 Compiling Watermark-Free Binaries (Exclusive Permit Model)

```bash
# 1. In the dashboard: Permits → GENERATE PERMIT → download permit.json
#    (or export CYPHER_PERMIT_KEY=/path/to/permit.json)

# 2. Install the compiler dependencies
npm i -D esbuild javascript-obfuscator bytenode

# 3. Integrate the shield at the very TOP of your entry file
#    const ravenhub = require("./licensing_client.js");
#    await ravenhub.verify({ apiBase: "https://<host>", key: process.env.APP_LICENSE_KEY });

# 4. Compile (bundle → obfuscate → V8 bytecode → native binary → shred caches)
CYPHER_PERMIT_KEY=./permit.json node tools/compiler.js \
  --entry=./app.js --targets=linux,win32 --out=./release \
  --api=https://<host>

# 5. Instant bytecode smoke test without packaging:
node tools/compiler.js --entry=./app.js --no-package

# 6. Execute the standalone binary — zero Node.js installation required
./release/app-linux
```

- **Valid permit** → licensed, watermark-free production binary.
- **Missing/invalid permit** → the watermark loader prints a warning and the
  process self-terminates after 5 minutes.
- The compiler embeds your server's ECDSA public key into the client shield,
  verifies self-hashing binary integrity at launch, and scrubs all
  intermediate build caches.

## 🛡 Penetration Testing Suite (35 checks)

```bash
# 35 automated attack checkpoints across 5 categories, self-purging on pass:
node tools/penetration_test.js \
  --api=http://localhost:3000 \
  --admin=raven_ops --pass=<password> [--totp=<code>]
```

| Category | Tests |
| --- | --- |
| A · Handshake & Network | 1–8 — invalid-curve ECDH, forged ECDSA sigs, nonce replay, MITM tampering, clock skew, session exhaustion, decoy scans, polymorphic traffic |
| B · Auth & Session | 9–16 — JWT `alg:none`, blank sigs, wrong keys, login floods, setup hijacking, CSRF, SQL/NoSQL injection |
| C · Key Validation | 17–24 — local HMAC mutation (0 network), expired/revoked/unknown keys, device-limit overflow, HWID stability, permit forgery, prefix adaptation |
| D · Memory & Local Client | 25–30 — cache tampering, cache expiry edits, breakpoint guards, inspector detection, clock rollback, HWID integrity |
| E · Performance & Cleanliness | 31–35 — &lt;100 ms roundtrips, key persistence, &lt;10 MB heap drift, ESM/TS interop, artifact self-purging |

## 📡 API Reference

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/telemetry/sync` | ECDH ephemeral key exchange (phase 1) |
| `POST /api/v1/telemetry/report` | AES-256-GCM license verification (phase 2) |
| `GET /api/v1/server-public-key` | Static ECDSA public key for client embedding |
| `POST /api/auth/setup` | First-run Owner registration (locks permanently) |
| `POST /api/auth/login` | Admin login (+TOTP challenge) |
| `POST /api/auth/totp` · `DELETE /api/auth/totp` | TOTP 2FA enrollment/removal |
| `GET/POST /api/licenses` | List / forge license keys |
| `PATCH/DELETE /api/licenses/:id` | Revoke / extend / set-expiry / delete |
| `GET /api/devices` · `DELETE /api/devices/:id` | HWID bindings |
| `POST /api/permits` · `GET/DELETE /api/permits/:id` | Sign / download / revoke compiler permits |
| `GET/PUT /api/config` | Brand prefix, ASCII art, defaults |
| `GET /api/stats` · `GET /api/audit` | Canvas telemetry + audit trail |

## 🧭 Canonical Workflow Checklist

1. Start the server (`npm run dev` or Docker).
2. Open `/` → confirm the **decoy 404**.
3. Open `/secret-amethyst-portal` → complete the **Setup Wizard**.
4. Generate a **permit** (Permits tab) and download `permit.json`.
5. Customize the **brand prefix** (Settings tab).
6. **Forge a license key** (Keys tab) with expiry + device limit.
7. Run the **35-point penetration suite** → `35 passed`, artifacts purged.
8. Embed `client/licensing_client.js` at the top of your app entry.
9. Compile with `tools/compiler.js` → watermark-free standalone binary.
10. Execute the binary → custom ASCII banner, silent anti-VM guards,
    encrypted handshake, zero readable JavaScript inside.

---

**License:** Source-Available Dual License — the repository is public, but
compiling watermark-free binaries requires an official, ECDSA-signed
**Creator Permit Key** from your licensing server.
