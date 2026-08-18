/**
 * RAVENHUB — UNBIND DEVICE (frees a device slot)
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { audit, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const rows = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  if (!rows[0]) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  await db.delete(devices).where(eq(devices.id, id));
  await audit(user.username, "device.unbound", rows[0].hwidHash.slice(0, 16), extractIp(request));
  return Response.json({ ok: true });
}
