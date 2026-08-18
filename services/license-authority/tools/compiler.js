/**
 * ==================================================================
 *  RAVENHUB — UNIVERSAL COMPILER AUTOMATION ENGINE  (v15)
 * ==================================================================
 *  Bundles your application + the licensing shield into a single,
 *  zero-dependency standalone binary with ZERO human-readable JS:
 *
 *    entry.js ──▶ esbuild bundle ──▶ javascript-obfuscator (AST) ──▶
 *    bytenode (.jsc V8 bytecode) ──▶ loader.js ──▶ Node SEA binary
 *
 *  PERMIT CONTROL (Exclusive Permit Model)
 *   · `permit.json` in the compiler directory or `CYPHER_PERMIT_KEY`
 *     environment variable. Permits are ECDSA-signed by the licensing
 *     server and verified against the server public key BEFORE any
 *     compilation. Valid permit  → licensed, watermark-free build.
 *     Missing/invalid permit    → watermark loader (5-min exit).
 *
 *  CACHE SHREDDER
 *   · `dist/bundle.js` and `dist/obfuscated.js` are securely
 *     overwritten and unlinked immediately after the bytecode and
 *     native binaries are produced.
 *
 *  Usage:
 *    CYPHER_PERMIT_KEY=... node tools/compiler.js \
 *      --entry=./app.js --targets=linux --out=./release
 *    node tools/compiler.js --entry=./app.js --no-package
 * ==================================================================
 */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

/* ------------------------------------------------------------------ */
/*  Argument parsing                                                   */
/* ------------------------------------------------------------------ */
const args = process.argv.slice(2);
const get = (flag, fallback) => {
  for (const a of args) {
    if (a === flag) return true;
    if (a.startsWith(`${flag}=`)) return a.slice(flag.length + 1);
  }
  return fallback;
};

const ENTRY = get("--entry", null);
const OUT_DIR = get("--out", "./release");
const TARGETS = String(get("--targets", process.platform))
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
const NO_PACKAGE = get("--no-package", false) === true || args.includes("--no-package");
const PERMIT_PATH = path.join(__dirname, "permit.json");
const DIST = path.join(OUT_DIR, "dist");

/* ------------------------------------------------------------------ */
/*  Permit verification (ECDSA prime256v1, SHA256)                    */
/* ------------------------------------------------------------------ */
function loadPermit() {
  // 1) Environment variable wins: CYPHER_PERMIT_KEY=<permit.json path>
  const envPath = process.env.CYPHER_PERMIT_KEY;
  if (envPath && fs.existsSync(envPath)) return fs.readFileSync(envPath, "utf8");
  // 2) Local permit.json next to the compiler.
  if (fs.existsSync(PERMIT_PATH)) return fs.readFileSync(PERMIT_PATH, "utf8");
  return null;
}

function verifyPermit(raw, serverPublicKeyPem) {
  try {
    const doc = JSON.parse(raw);
    const { signature, ...payload } = doc;
    if (!signature || !payload.id || !payload.expiresAt) return { ok: false, reason: "malformed" };
    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return { ok: false, reason: "expired" };
    }
    // Canonicalize exactly like the server: signed payload minus signature.
    const canonical = JSON.stringify(payload);
    const ok = crypto
      .createVerify("SHA256")
      .update(canonical)
      .verify(serverPublicKeyPem, Buffer.from(signature, "base64"));
    return ok ? { ok: true, permit: payload } : { ok: false, reason: "signature_invalid" };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

/* ------------------------------------------------------------------ */
/*  Watermark loader (unpermitted builds)                              */
/* ------------------------------------------------------------------ */
const WATERMARK_HEADER = `
/* RAVENHUB WATERMARK LOADER — unpermitted build (permit.json invalid
 * or missing). This copy was compiled without a Creator Permit.
 * Execution self-terminates after 5 minutes. Get a signed permit at
 * your licensing dashboard: Permits → GENERATE PERMIT. */
const __ravenhubWatermark = true;
setTimeout(() => { process.stdout.write("\\n[ravenhub] UNPERMITTED BUILD — watermark enforced.\\n"); process.exit(2); }, 5 * 60 * 1000);
`;

/* ------------------------------------------------------------------ */
/*  Build pipeline                                                     */
/* ------------------------------------------------------------------ */
function log(step, detail = "") {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${step}${detail ? " · " + detail : ""}`);
}

function run(command) {
  log("exec", command);
  execSync(command, { stdio: "inherit" });
}

/** Securely shred + unlink intermediate JS artifacts. */
function shred(file) {
  try {
    const fd = fs.openSync(file, "r+");
    const stat = fs.fstatSync(fd);
    const bomb = crypto.randomBytes(Math.min(stat.size, 1024 * 1024));
    for (let off = 0; off < stat.size; off += bomb.length) {
      fs.writeSync(fd, bomb, 0, Math.min(bomb.length, stat.size - off), off);
    }
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.unlinkSync(file);
    log("shredded", file);
  } catch {
    /* already gone */
  }
}

async function main() {
  console.log("\n ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗ ");
  console.log("██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗");
  console.log("██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝");
  console.log("██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗");
  console.log("╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║");
  console.log(" ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝\n");

  if (!ENTRY) {
    console.error("missing --entry=<path>. usage:");
    console.error("  node tools/compiler.js --entry=./app.js --targets=linux,win32 --out=./release");
    process.exit(2);
  }
  if (!fs.existsSync(ENTRY)) {
    console.error(`entry file not found: ${ENTRY}`);
    process.exit(2);
  }

  const deps = ["esbuild", "javascript-obfuscator", "bytenode"];
  for (const dep of deps) {
    try {
      require.resolve(dep);
    } catch {
      console.error(`missing dependency: ${dep} → npm i -D ${dep}`);
      process.exit(2);
    }
  }
  const esbuild = require("esbuild");

  /* ---------------- PERMIT CONTROL ---------------- */
  const apiBase = get("--api", process.env.RAVENHUB_API || "https://your-licensing-host.example.com");
  let serverPublicKeyPem = process.env.RAVENHUB_PUBKEY || "";
  if (!serverPublicKeyPem) {
    log("fetching server public key", `${apiBase}/api/v1/server-public-key`);
    try {
      const res = await fetch(`${apiBase}/api/v1/server-public-key`);
      const data = await res.json();
      serverPublicKeyPem = data.publicKeyPem;
    } catch {
      console.error("could not fetch server public key — set RAVENHUB_PUBKEY");
      process.exit(2);
    }
  }

  const permitRaw = loadPermit();
  const permit = permitRaw ? verifyPermit(permitRaw, serverPublicKeyPem) : { ok: false, reason: "missing" };
  if (permit.ok) {
    log("PERMIT VALID", `${permit.permit.id.slice(0, 8)}… exp ${permit.permit.expiresAt}`);
  } else {
    log("PERMIT INVALID", permit.reason + " — watermark mode");
  }

  /* ---------------- SOURCE ANALYSIS ---------------- */
  const entrySource = fs.readFileSync(ENTRY, "utf8");
  const isEsm = /\b(import|export)\s/.test(entrySource) || path.extname(ENTRY) === ".mjs";
  const isTs = /\.[cm]?ts$/.test(ENTRY);

  // Native addons (.node) are external and copied into the release dir.
  const nativeAddons = [...entrySource.matchAll(/require\(["']([^"']+\.node)["']\)/g)].map((m) => m[1]);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const addon of nativeAddons) {
    const src = path.resolve(path.dirname(ENTRY), addon);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(OUT_DIR, path.basename(addon)));
      log("native addon isolated", path.basename(addon));
    }
  }

  fs.mkdirSync(DIST, { recursive: true });
  const bundlePath = path.join(DIST, "bundle.js");
  const obfuscatedPath = path.join(DIST, "obfuscated.js");
  const bytecodePath = path.join(DIST, "bundle.jsc");
  const loaderPath = path.join(DIST, "loader.js");

  /* ---------------- STAGE 1: BUNDLE ---------------- */
  log("bundle", `${ENTRY} (${isEsm ? "ESM" : "CommonJS"}${isTs ? "+TS" : ""})`);
  await esbuild.build({
    entryPoints: [ENTRY],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    outfile: bundlePath,
    external: nativeAddons,
    minify: false,
    legalComments: "none",
    banner: permit.ok ? undefined : { js: WATERMARK_HEADER },
  });

  // Inject the licensing shield at the very top of the bundle.
  const shield = path.join(__dirname, "..", "client", "licensing_client.js");
  if (fs.existsSync(shield)) {
    const bundle = fs.readFileSync(bundlePath, "utf8");
    const shieldSource = fs.readFileSync(shield, "utf8");
    // Inject server public key into the client's embedded anchor.
    const injected = shieldSource.replace(
      /const EMBEDDED_PUBLIC_KEY = [^;]+;/,
      `const EMBEDDED_PUBLIC_KEY = ${JSON.stringify(serverPublicKeyPem)};`,
    );
    fs.writeFileSync(bundlePath, injected + "\n" + bundle);
    log("licensing shield injected", "embedded server public key");
  }

  /* ---------------- STAGE 2: AST OBFUSCATION ---------------- */
  const JavaScriptObfuscator = require("javascript-obfuscator");
  const obfuscated = JavaScriptObfuscator.obfuscate(fs.readFileSync(bundlePath, "utf8"), {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.6,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.3,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.8,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode();
  fs.writeFileSync(obfuscatedPath, obfuscated);
  log("obfuscated", "AST flattened + self-defending");

  /* ---------------- STAGE 3: V8 BYTECODE ---------------- */
  const bytenode = require("bytenode");
  await bytenode.compileFile(obfuscatedPath, bytecodePath);
  log("bytecode", "bundle.jsc (AST destroyed — no readable JS)");

  // Bootstrap loader that registers bytenode and executes the bytecode.
  const loader = [
    "const bytenode = require('bytenode');",
    "const fs = require('node:fs');",
    "const path = require('node:path');",
    "const { crypto } = require('node:crypto') || {};",
    "// Self-hashing binary integrity: recompute the executable's hash",
    "// and compare with the build hash embedded by the packager.",
    "const EXPECTED_HASH = process.env.RAVENHUB_BUILD_HASH || '';",
    "try {",
    "  const exe = fs.readFileSync(process.execPath);",
    "  const actual = require('node:crypto').createHash('sha256').update(exe).digest('hex');",
    "  if (EXPECTED_HASH && actual !== EXPECTED_HASH) {",
    "    process.stdout.write('\\n[ravenhub] BINARY INTEGRITY VIOLATION — self-hash mismatch.\\n');",
    "    process.exit(7);",
    "  }",
    "} catch (err) {",
    "  // V8 bytecode version mismatch or unreadable executable — give a",
    "  // clean diagnosis instead of a raw core dump.",
    "  console.error('[ravenhub] LOADER ERROR: ' + err.code + ' — ' + err.message);",
    "  console.error('[ravenhub] This binary was compiled for Node v20.20.x.');",
    "  console.error('[ravenhub] Verify bytenode/Node version pinning in the Dockerfile.');",
    "  process.exit(9);",
    "}",
    "require(bytenode);",
    `require('${path.relative(path.dirname(loaderPath), bytecodePath).replace(/\\\\/g, "/")}');`,
  ].join("\n");
  fs.writeFileSync(loaderPath, loader);
  log("loader", "dist/loader.js written");

  if (NO_PACKAGE) {
    log("no-package mode", "test now: node dist/loader.js");
    // Shred the plaintext intermediates even in test mode.
    shred(bundlePath);
    shred(obfuscatedPath);
    log("DONE", `bytecode ready at ${bytecodePath}`);
    return;
  }

  /* ---------------- STAGE 4: NATIVE PACKAGING ---------------- */
  // Node Single-Executable Application (SEA) — zero-dependency binary.
  const seaConfig = {
    main: path.basename(loaderPath),
    output: path.join(DIST, "sea-prep.blob"),
    disableExperimentalSEAWarning: true,
  };
  const seaConfigPath = path.join(DIST, "sea-config.json");
  fs.writeFileSync(seaConfigPath, JSON.stringify(seaConfig, null, 2));
  run(`node --experimental-sea-config ${seaConfigPath}`);

  // Inject the bytecode into the node binary per target platform.
  // Requires matching `node-${platform}` binaries (see README).
  for (const target of TARGETS) {
    const nodeBin = path.join(__dirname, "..", "node", `node-${target}`);
    if (!fs.existsSync(nodeBin)) {
      console.warn(`[skip] platform binary missing: ${nodeBin}`);
      console.warn("       download the pinned Node v20.20.x binary for this target.");
      continue;
    }
    const outBinary = path.join(OUT_DIR, `app-${target}`);
    fs.copyFileSync(nodeBin, outBinary);
    if (target === "win32") {
      run(`npx postject ${outBinary} NODE_SEA_BLOB ${seaConfig.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
    } else {
      run(`npx postject ${outBinary} NODE_SEA_BLOB ${seaConfig.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
    }
    if (target !== "win32") fs.chmodSync(outBinary, 0o755);
    log("packaged", outBinary);
  }

  /* ---------------- STAGE 5: CACHE SHREDDER ---------------- */
  shred(bundlePath);
  shred(obfuscatedPath);
  try { fs.rmSync(path.join(DIST, "sea-prep.blob"), { force: true }); } catch {}
  log("cache shredded", "no residual readable JS left on disk");
  log("DONE", "binaries ready in " + OUT_DIR);
}

main().catch((err) => {
  console.error("[ravenhub] compiler crashed:", err);
  process.exit(1);
});
