/**
 * RAVENHUB — TOTP TWO-FACTOR AUTHENTICATION (RFC 6238)
 * ------------------------------------------------------------------
 * Enroll / confirm / disable Google-Authenticator-compatible 2FA for
 * the admin session. Pending secrets live only in server memory with
 * a short TTL and are committed to the database solely on confirm.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateTotpSecret, totpVerify } from "@/lib/crypto";
import { getSessionUser } from "@/lib/auth";
import { audit, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

const pendingSecrets = new Map<string, { secret: string; expires: number }>();
const PENDING_TTL_MS = 5 * 60_000;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return Response.json({ ok: true, enabled: user.totpEnabled });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (user.viaMasterKey) {
    return Response.json({ ok: false, error: "master_key_readonly" }, { status: 403 });
  }

  let body: { action?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (body.action === "start") {
    const { secretB32, otpauthUri } = generateTotpSecret();
    pendingSecrets.set(user.id, { secret: secretB32, expires: Date.now() + PENDING_TTL_MS });
    return Response.json({
      ok: true,
      secretB32,
      otpauthUri: otpauthUri(user.username),
      note: "Enter this secret in your authenticator, then confirm a code.",
    });
  }

  if (body.action === "confirm") {
    const pending = pendingSecrets.get(user.id);
    if (!pending || pending.expires < Date.now()) {
      pendingSecrets.delete(user.id);
      return Response.json({ ok: false, error: "enrollment_expired" }, { status: 400 });
    }
    if (!totpVerify(pending.secret, body?.code ?? "")) {
      return Response.json({ ok: false, error: "invalid_totp" }, { status: 400 });
    }
    await db.update(users).set({ totpSecret: pending.secret }).where(eq(users.id, user.id));
    pendingSecrets.delete(user.id);
    await audit(user.username, "auth.totp_enabled", "2FA enrollment confirmed", extractIp(request));
    return Response.json({ ok: true, enabled: true });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let code = "";
  try {
    const body = await request.json();
    code = body?.code ?? "";
  } catch {
    /* code stays empty */
  }

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const row = rows[0];
  if (row?.totpSecret && !totpVerify(row.totpSecret, code)) {
    return Response.json({ ok: false, error: "invalid_totp" }, { status: 400 });
  }
  await db.update(users).set({ totpSecret: null }).where(eq(users.id, user.id));
  await audit(user.username, "auth.totp_disabled", "2FA removed", extractIp(request));
  return Response.json({ ok: true, enabled: false });
}
