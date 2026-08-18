/**
 * RAVENHUB LICENSE SYSTEM — DATABASE SCHEMA
 * ------------------------------------------------------------------
 * Persistent zero-knowledge storage layer. Every table lives in the
 * remote PostgreSQL instance (DATABASE_URL) so that restarts, free-tier
 * ephemeral filesystems and daily wipes never destroy licenses, devices,
 * cryptographic keys or audit trails.
 *
 * Tables:
 *  - systemConfig : key/value store (ECDSA keypair, JWT secret, branding, defaults)
 *  - users        : admin accounts (scrypt-hashed credentials, optional TOTP)
 *  - licenses     : forged HMAC-protected license keys
 *  - devices      : HWID bindings per license (device-limit enforcement)
 *  - permits      : ECDSA-signed compiler permits (watermark-free builds)
 *  - telemetry    : every handshake/heartbeat attempt with latency (charts feed)
 *  - auditLogs    : administrative audit trail (who did what, from where)
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* system_config — singleton key/value store for server secrets.      */
/* ------------------------------------------------------------------ */
export const systemConfig = pgTable("system_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/* users — administrator accounts.                                    */
/* ------------------------------------------------------------------ */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  totpSecret: text("totp_secret"), // base32 RFC-6238 secret, null = 2FA off
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/* licenses — cryptographically forged keys: PREFIX-12hex-8hmac       */
/* ------------------------------------------------------------------ */
export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(), // full plaintext key (display only)
    keyHash: text("key_hash").notNull().unique(), // sha256 for indexed lookups
    prefix: text("prefix").notNull(), // brand prefix at forge time
    entropy: text("entropy").notNull(), // 12 hex chars of CSPRNG entropy
    checksum: text("checksum").notNull(), // 8 hex HMAC-SHA256 checksum block
    status: text("status").notNull().default("active"), // active | revoked
    label: text("label"),
    maxDevices: integer("max_devices").notNull().default(2),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("licenses_status_idx").on(t.status)],
);

/* ------------------------------------------------------------------ */
/* devices — HWID bindings enforcing the device-limit policy.         */
/* ------------------------------------------------------------------ */
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    hwidHash: text("hwid_hash").notNull(), // sha256(hwid) — zero raw HWID at rest
    platform: text("platform"),
    ip: text("ip"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("devices_license_idx").on(t.licenseId)],
);

/* ------------------------------------------------------------------ */
/* permits — ECDSA-signed compiler permits (permit.json downloads).   */
/* ------------------------------------------------------------------ */
export const permits = pgTable("permits", {
  id: uuid("id").defaultRandom().primaryKey(),
  payloadJson: text("payload_json").notNull(), // canonical permit payload
  signature: text("signature").notNull(), // base64 DER ECDSA signature
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/* telemetry — every client handshake / heartbeat with timings.       */
/* ------------------------------------------------------------------ */
export const telemetry = pgTable("telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  licenseId: uuid("license_id").references(() => licenses.id, {
    onDelete: "set null",
  }),
  keyHash: text("key_hash"),
  hwidHash: text("hwid_hash"),
  platform: text("platform"),
  ok: integer("ok").notNull().default(0), // 1 = success, 0 = failure
  action: text("action").notNull().default("verify"), // verify | heartbeat
  latencyMs: integer("latency_ms").notNull().default(0),
  note: text("note"), // rejection reason (bad_hmac, expired, device_limit, ...)
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/* auditLogs — administrative action trail.                           */
/* ------------------------------------------------------------------ */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actor: text("actor").notNull(),
  event: text("event").notNull(),
  detail: text("detail"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/* Type exports                                                       */
/* ------------------------------------------------------------------ */
export type User = typeof users.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type Permit = typeof permits.$inferSelect;
export type TelemetryRow = typeof telemetry.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

/* Helper used by telemetry queries for hourly aggregation. */
export const hourBucket = sql<number>`extract(hour from ${telemetry.createdAt})::int`;
