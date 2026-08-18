/**
 * RAVENHUB — FIRST-RUN SETUP / OWNER REGISTRATION
 * ------------------------------------------------------------------
 * The very first registration becomes the OWNER and permanently locks
 * the gateway — after success this endpoint always answers 403.
 */
import { db } from "@/db";
import { systemConfig, users } from "@/db/schema";
import { hashPassword } from "@/lib/crypto";
import { hitRateLimit } from "@/lib/rate-limit";
import { audit, ensureSystem, extractIp, invalidateSystemCache } from "@/lib/system";

export const dynamic = "force-dynamic";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;

export async function POST(request: Request) {
  const ip = extractIp(request);
  if (!hitRateLimit(`setup:${ip}`, 5)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const state = await ensureSystem();

  // 1) Gateway hijack lock — one shot, first registration wins.
  const existing = await db.select().from(users);
  if (state.setupLocked || existing.length > 0) {
    return Response.json({ ok: false, error: "setup_locked" }, { status: 403 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const username = (body?.username ?? "").trim();
  const password = body?.password ?? "";

  if (!USERNAME_PATTERN.test(username)) {
    return Response.json({ ok: false, error: "invalid_username" }, { status: 400 });
  }
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return Response.json(
      { ok: false, error: "weak_password", detail: "Minimum 10 characters including letters and numbers." },
      { status: 400 },
    );
  }

  // 2) Create the OWNER account and lock the gateway permanently.
  await db.insert(users).values({
    username,
    passwordHash: hashPassword(password),
    role: "OWNER",
  });

  await db
    .insert(systemConfig)
    .values({ key: "setup_locked", value: "true" })
    .onConflictDoUpdate({
      target: systemConfig.key,
      set: { value: "true", updatedAt: new Date() },
    });
  invalidateSystemCache();

  await audit(username, "setup.completed", "Owner account registered — gateway locked", ip);

  return Response.json({ ok: true, message: "Owner registered. Gateway locked permanently." });
}
