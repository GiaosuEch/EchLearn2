/**
 * RAVENHUB — SESSION PROBE & LOGOUT
 * ------------------------------------------------------------------
 */
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ ok: true, authenticated: false }, { status: 200 });
  }
  return Response.json({
    ok: true,
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      totpEnabled: user.totpEnabled,
    },
  });
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return Response.json({ ok: true });
}
