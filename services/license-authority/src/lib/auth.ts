/**
 * RAVENHUB — ADMIN SESSION GUARD
 * ------------------------------------------------------------------
 * Admin routes authenticate in two ways:
 *  1. `rh_session` httpOnly cookie containing an HS256 JWT signed
 *     with the persistent server JWT secret.
 *  2. `x-master-key` header matching the optional CYPHER_MASTER_KEY
 *     environment variable (useful for CI and automation tooling).
 */
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyJwt } from "@/lib/crypto";
import { ensureSystem } from "@/lib/system";

export const SESSION_COOKIE = "rh_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  totpEnabled: boolean;
  viaMasterKey: boolean;
}

/** Resolve the authenticated user, or null. */
export async function getSessionUser(): Promise<AuthUser | null> {
  // 1) Master key bypass (optional env-based automation credential).
  const masterKey = process.env.CYPHER_MASTER_KEY;
  const headerMaster = (await headers()).get("x-master-key");
  if (masterKey && headerMaster && headerMaster === masterKey) {
    return {
      id: "master-key",
      username: "master-key",
      role: "OWNER",
      totpEnabled: false,
      viaMasterKey: true,
    };
  }

  // 2) Signed session cookie.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const state = await ensureSystem();
  const claims = verifyJwt(token, state.jwtSecret);
  if (!claims) return null;

  const rows = await db.select().from(users).where(eq(users.id, claims.sub)).limit(1);
  const user = rows[0];
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    totpEnabled: Boolean(user.totpSecret),
    viaMasterKey: false,
  };
}

/** Guard helper returning a Response when unauthenticated. */
export async function requireAdmin(): Promise<
  { user: AuthUser; error: Response | null }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null as unknown as AuthUser,
      error: Response.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}
