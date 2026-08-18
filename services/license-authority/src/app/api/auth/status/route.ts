/**
 * RAVENHUB — PUBLIC SYSTEM STATUS (PRE-SETUP)
 * ------------------------------------------------------------------
 * Powers the Setup Wizard. Before the gateway is locked, the wizard
 * displays the generated 32-byte JWT secret + copy-paste environment
 * instructions. After the first ADMIN registers, the secret is never
 * exposed again.
 */
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSystem } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await ensureSystem();
  const adminCount = (await db.select().from(users)).length;
  const locked = state.setupLocked || adminCount > 0;

  return Response.json({
    ok: true,
    setupLocked: locked,
    adminExists: adminCount > 0,
    persistence: "postgresql",
    keyFingerprint: state.keyFingerprint,
    // Exposed ONLY while the gateway is unlocked (first-run wizard).
    jwtSecret: locked ? null : state.jwtSecret,
    portalPath: "/secret-amethyst-portal",
  });
}
