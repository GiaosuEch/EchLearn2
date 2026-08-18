/**
 * RAVENHUB — DEVICE BINDINGS
 * ------------------------------------------------------------------
 * GET    : all bound devices joined with their license keys.
 * DELETE : /api/devices/[id] unbinds a device, freeing a device slot.
 */
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { devices, licenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const deviceRows = await db
    .select()
    .from(devices)
    .orderBy(desc(devices.lastSeenAt))
    .limit(500);
  const licenseRows = await db.select().from(licenses);
  const licenseById = new Map(licenseRows.map((l) => [l.id, l]));

  return Response.json({
    ok: true,
    devices: deviceRows.map((d) => ({
      id: d.id,
      licenseId: d.licenseId,
      licenseKey: licenseById.get(d.licenseId)?.key ?? "(deleted)",
      licenseLabel: licenseById.get(d.licenseId)?.label ?? null,
      hwidHash: d.hwidHash,
      platform: d.platform,
      ip: d.ip,
      lastSeenAt: d.lastSeenAt,
      createdAt: d.createdAt,
    })),
  });
}
