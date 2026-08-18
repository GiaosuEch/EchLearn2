/**
 * RAVENHUB — LICENSE ACTIONS (REVOKE / EXTEND / DELETE)
 * ------------------------------------------------------------------
 * PATCH  : { action: "revoke" | "extend", days?, maxDevices?, label? }
 * DELETE : hard-removes the license + its device bindings.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { devices, licenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { audit, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const rows = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
  const license = rows[0];
  if (!license) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  let body: {
    action?: string;
    days?: number;
    maxDevices?: number;
    label?: string;
    expiresAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (body.action === "revoke") {
    await db.update(licenses).set({ status: "revoked" }).where(eq(licenses.id, id));
    await audit(user.username, "license.revoked", license.key, extractIp(request));
    return Response.json({ ok: true });
  }

  if (body.action === "extend") {
    const days = Math.min(3650, Math.max(1, Number(body.days) || 30));
    const next = new Date(
      Math.max(Date.now(), new Date(license.expiresAt).getTime()) +
        days * 24 * 60 * 60 * 1000,
    );
    const updates: Partial<typeof licenses.$inferInsert> = { expiresAt: next };
    if (body.label !== undefined) updates.label = body.label.trim() || null;
    if (body.maxDevices !== undefined) {
      updates.maxDevices = Math.min(100, Math.max(1, Number(body.maxDevices) || 1));
    }
    await db.update(licenses).set(updates).where(eq(licenses.id, id));
    await audit(user.username, "license.extended", `${license.key} → ${next.toISOString()}`, extractIp(request));
    return Response.json({ ok: true });
  }

  if (body.action === "set-expiry") {
    const expiresAt = new Date(String(body.expiresAt ?? ""));
    if (Number.isNaN(expiresAt.getTime())) {
      return Response.json({ ok: false, error: "invalid_expiry" }, { status: 400 });
    }
    await db.update(licenses).set({ expiresAt }).where(eq(licenses.id, id));
    await audit(user.username, "license.expiry_set", `${license.key} → ${expiresAt.toISOString()}`, extractIp(request));
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const rows = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
  if (!rows[0]) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  await db.delete(devices).where(eq(devices.licenseId, id));
  await db.delete(licenses).where(eq(licenses.id, id));
  await audit(user.username, "license.deleted", rows[0].key, extractIp(request));
  return Response.json({ ok: true });
}
