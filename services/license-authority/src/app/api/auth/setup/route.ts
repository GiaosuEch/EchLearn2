/**
 * RAVENHUB — FIRST-RUN SETUP / OWNER REGISTRATION
 * ------------------------------------------------------------------
 * The very first registration becomes the OWNER and permanently locks
 * the gateway — after success this endpoint always answers 403.
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, systemConfig, users } from "@/db/schema";
import { hashPassword } from "@/lib/crypto";
import { hitRateLimit } from "@/lib/rate-limit";
import { ensureSystem, extractIp, invalidateSystemCache } from "@/lib/system";

export const dynamic = "force-dynamic";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
const SETUP_LOCK_ID = 1_769_103_210;

export async function POST(request: Request) {
  const ip = extractIp(request);
  if (!hitRateLimit(`setup:${ip}`, 5)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // Ensure bootstrap keys/config exist before entering the short owner-creation
  // transaction. No secret from this state is returned to the caller.
  await ensureSystem();

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
  if (password.length < 10 || password.length > 256 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return Response.json(
      { ok: false, error: "weak_password", detail: "Use 10 to 256 characters including letters and numbers." },
      { status: 400 },
    );
  }

  const passwordHash = hashPassword(password);
  const created = await db.transaction(async (tx) => {
    // Serialize all first-run attempts across processes and instances. Without
    // this database lock, two concurrent requests could both observe zero users
    // and create separate OWNER accounts.
    await tx.execute(sql`select pg_advisory_xact_lock(${SETUP_LOCK_ID})`);

    const [existingUser] = await tx.select({ id: users.id }).from(users).limit(1);
    const [lockRow] = await tx
      .select({ value: systemConfig.value })
      .from(systemConfig)
      .where(eq(systemConfig.key, "setup_locked"))
      .limit(1);

    if (existingUser || lockRow?.value === "true") return false;

    await tx.insert(users).values({
      username,
      passwordHash,
      role: "OWNER",
    });

    await tx
      .insert(systemConfig)
      .values({ key: "setup_locked", value: "true" })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value: "true", updatedAt: new Date() },
      });

    await tx.insert(auditLogs).values({
      actor: username,
      event: "setup.completed",
      detail: "Owner account registered — gateway locked",
      ip,
    });

    return true;
  });

  if (!created) {
    return Response.json({ ok: false, error: "setup_locked" }, { status: 403 });
  }

  invalidateSystemCache();
  return Response.json({ ok: true, message: "Owner registered. Gateway locked permanently." });
}
