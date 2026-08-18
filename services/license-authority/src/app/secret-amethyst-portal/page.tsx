/**
 * RAVENHUB — SECRET AMETHYST PORTAL (CLOAKED GATEWAY)
 * ------------------------------------------------------------------
 * The ONLY route that exposes the true application surface:
 *
 *   · unconfigured            → first-run Setup Wizard
 *   · locked, no session      → hardened admin login (TOTP-aware)
 *   · locked, valid session   → Amethyst dashboard
 *
 * Every other path on this host serves the decoy 404.
 */
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { ensureSystem } from "@/lib/system";
import SetupWizard from "@/components/portal/setup-wizard";
import LoginPanel from "@/components/portal/login";
import Dashboard from "@/components/portal/dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "internal · portal",
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  const state = await ensureSystem();
  const adminRows = await db.select().from(users);
  const locked = state.setupLocked || adminRows.length > 0;
  const session = await getSessionUser();

  if (!locked) {
    return <SetupWizard />;
  }
  if (!session) {
    return <LoginPanel />;
  }
  return (
    <Dashboard
      initialUser={{
        id: session.id,
        username: session.username,
        role: session.role,
        totpEnabled: session.totpEnabled,
      }}
    />
  );
}
