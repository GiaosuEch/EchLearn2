/**
 * RAVENHUB — SYSTEM BOOTSTRAP & CONFIGURATION
 * ------------------------------------------------------------------
 * On first access the server lazily provisions its persistent state:
 *  1. ECDSA prime256v1 signing keypair  → stored in `system_config`.
 *     Never regenerated: previously compiled clients keep validating.
 *  2. 32-byte crypto JWT secret          → stored, shown in the wizard.
 *  3. Branding + license defaults        → editable in the dashboard.
 *
 * Because everything lives in PostgreSQL (DATABASE_URL), free-tier
 * ephemeral hosts (Render/Railway) can restart daily with zero loss.
 */
import { db } from "@/db";
import { auditLogs, systemConfig } from "@/db/schema";
import {
  generateEcdsaKeypair,
  randomHex,
  publicKeyFingerprint,
  sha256Hex,
} from "@/lib/crypto";

/* ------------------------------------------------------------------ */
/* Configuration shape                                                */
/* ------------------------------------------------------------------ */
export const DEFAULT_PREFIX = "ECHLEARN";
export const DEFAULT_ASCII = [
  "███████╗ ██████╗██╗  ██╗██╗     ███████╗ █████╗ ██████╗ ███╗   ██╗",
  "██╔════╝██╔════╝██║  ██║██║     ██╔════╝██╔══██╗██╔══██╗████╗  ██║",
  "█████╗  ██║     ███████║██║     █████╗  ███████║██████╔╝██╔██╗ ██║",
  "██╔══╝  ██║     ██╔══██║██║     ██╔══╝  ██╔══██║██╔══██╗██║╚██╗██║",
  "███████╗╚██████╗██║  ██║███████╗███████╗██║  ██║██║  ██║██║ ╚████║",
  "╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝",
].join("\n");

export interface SystemState {
  setupLocked: boolean;
  jwtSecret: string;
  ecdsaPrivateKeyPem: string;
  ecdsaPublicKeyPem: string;
  keyFingerprint: string;
  brandPrefix: string;
  asciiArt: string;
  licenseDefaultDays: number;
  licenseDefaultDevices: number;
  createdAt: string;
}

const stateCache = new Map<string, string | null>();

async function readConfigRows() {
  const rows = await db.select().from(systemConfig);
  const map = new Map<string, string>();
  for (const row of rows) map.set(row.key, row.value);
  return map;
}

async function writeConfig(key: string, value: string) {
  await db
    .insert(systemConfig)
    .values({ key, value })
    .onConflictDoUpdate({ target: systemConfig.key, set: { value, updatedAt: new Date() } });
}

/* ------------------------------------------------------------------ */
/* ensureSystem — idempotent bootstrap (creates missing secrets).     */
/* ------------------------------------------------------------------ */
let bootstrapPromise: Promise<SystemState> | null = null;

export async function ensureSystem(): Promise<SystemState> {
  // Single-flight bootstrap to avoid parallel first-boot races.
  if (!bootstrapPromise) {
    bootstrapPromise = boot().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

async function boot(): Promise<SystemState> {
  const map = await readConfigRows();

  // If the store is completely empty, provision all secrets once.
  if (!map.has("jwt_secret")) {
    await writeConfig("jwt_secret", randomHex(32)); // 32-byte secret → 64 hex chars
  }
  if (!map.has("ecdsa_private") || !map.has("ecdsa_public")) {
    const pair = generateEcdsaKeypair();
    await writeConfig("ecdsa_private", pair.privateKeyPem);
    await writeConfig("ecdsa_public", pair.publicKeyPem);
  }
  if (!map.has("setup_locked")) await writeConfig("setup_locked", "false");
  if (!map.has("brand_prefix")) await writeConfig("brand_prefix", DEFAULT_PREFIX);
  if (!map.has("ascii_art")) await writeConfig("ascii_art", DEFAULT_ASCII);
  if (!map.has("license_default_days")) await writeConfig("license_default_days", "30");
  if (!map.has("license_default_devices")) await writeConfig("license_default_devices", "2");
  if (!map.has("created_at")) await writeConfig("created_at", new Date().toISOString());

  return buildState(await readConfigRows());
}

async function buildState(map: Map<string, string>): Promise<SystemState> {
  const publicKeyPem = map.get("ecdsa_public") ?? "";
  return {
    setupLocked: map.get("setup_locked") === "true",
    jwtSecret: map.get("jwt_secret") ?? "",
    ecdsaPrivateKeyPem: map.get("ecdsa_private") ?? "",
    ecdsaPublicKeyPem: publicKeyPem,
    keyFingerprint: publicKeyFingerprint(publicKeyPem),
    brandPrefix: map.get("brand_prefix") ?? DEFAULT_PREFIX,
    asciiArt: map.get("ascii_art") ?? DEFAULT_ASCII,
    licenseDefaultDays: parseInt(map.get("license_default_days") ?? "30", 10) || 30,
    licenseDefaultDevices: parseInt(map.get("license_default_devices") ?? "2", 10) || 2,
    createdAt: map.get("created_at") ?? new Date().toISOString(),
  };
}

/** Invalidate the cached state after admin edits. */
export function invalidateSystemCache(): void {
  stateCache.clear();
}

/* ------------------------------------------------------------------ */
/* Audit logging helper                                               */
/* ------------------------------------------------------------------ */
export async function audit(actor: string, event: string, detail: string, ip?: string) {
  await db.insert(auditLogs).values({
    actor,
    event,
    detail: detail.slice(0, 500),
    ip: ip ?? null,
  });
}

/* ------------------------------------------------------------------ */
/* IP extraction helpers (Next request → best-effort client IP)       */
/* ------------------------------------------------------------------ */
export function extractIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/* ------------------------------------------------------------------ */
/* Local config cache (fast reads for hot paths)                      */
/* ------------------------------------------------------------------ */
export async function getConfigCached(key: string): Promise<string | null> {
  const cached = stateCache.get(key);
  if (cached !== undefined) return cached;
  const state = await ensureSystem();
  const map: Record<string, string> = {
    jwt_secret: state.jwtSecret,
    ecdsa_private: state.ecdsaPrivateKeyPem,
    ecdsa_public: state.ecdsaPublicKeyPem,
    brand_prefix: state.brandPrefix,
    ascii_art: state.asciiArt,
    license_default_days: String(state.licenseDefaultDays),
    license_default_devices: String(state.licenseDefaultDevices),
    setup_locked: String(state.setupLocked),
  };
  for (const [k, v] of Object.entries(map)) stateCache.set(k, v);
  return map[key] ?? null;
}

export { sha256Hex };
