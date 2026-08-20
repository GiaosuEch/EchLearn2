/**
 * RAVENHUB — PUBLIC SYSTEM STATUS (PRE-SETUP)
 * ------------------------------------------------------------------
 * Powers the Setup Wizard without exposing server signing material. The JWT
 * secret is generated and persisted exclusively on the server.
 */
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSystem } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await ensureSystem();
  const [admin] = await db.select({ id: users.id }).from(users).limit(1);
  const adminExists = Boolean(admin);
  const locked = state.setupLocked || adminExists;

  return Response.json({
    ok: true,
    setupLocked: locked,
    adminExists,
    persistence: "postgresql",
    keyFingerprint: state.keyFingerprint,
    portalPath: "/secret-amethyst-portal",
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
