/**
 * RAVENHUB — ADMIN LOGIN
 * ------------------------------------------------------------------
 * scrypt credential verification + optional RFC 6238 TOTP challenge,
 * hardened with per-username lockout (5 fails → 15 min) and per-IP
 * rate limiting. Sets the httpOnly HS256 session cookie on success.
 */
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  signJwt,
  totpVerify,
  verifyPassword,
} from "@/lib/crypto";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";
import {
  clearAuthFailures,
  hitRateLimit,
  isLockedOut,
  recordAuthFailure,
} from "@/lib/rate-limit";
import { audit, ensureSystem, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = extractIp(request);
  if (!hitRateLimit(`login:${ip}`, 10)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { username?: string; password?: string; totp?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const username = (body?.username ?? "").trim();
  const password = body?.password ?? "";

  if (!username || !password) {
    return Response.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }
  if (isLockedOut(username)) {
    return Response.json({ ok: false, error: "account_locked" }, { status: 429 });
  }

  // Parameterized lookup — SQL injection has no surface here.
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const user = rows[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordAuthFailure(username);
    await audit(username, "auth.login_failed", "invalid credentials", ip);
    return Response.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  // TOTP challenge when 2FA is enrolled.
  if (user.totpSecret) {
    const code = body?.totp ?? "";
    if (!totpVerify(user.totpSecret, code)) {
      recordAuthFailure(username);
      await audit(username, "auth.totp_failed", "invalid 2FA code", ip);
      return Response.json({ ok: false, error: "invalid_totp" }, { status: 401 });
    }
  }

  clearAuthFailures(username);

  const state = await ensureSystem();
  const token = signJwt(
    { sub: user.id, role: user.role, ttlSeconds: SESSION_TTL_SECONDS },
    state.jwtSecret,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  await audit(username, "auth.login_ok", "admin session established", ip);

  return Response.json({
    ok: true,
    user: { username: user.username, role: user.role, totpEnabled: Boolean(user.totpSecret) },
  });
}
