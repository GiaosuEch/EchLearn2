/**
 * RAVENHUB — LICENSE MANAGEMENT (LIST / FORGE)
 * ------------------------------------------------------------------
 * GET  : every license with live device counts.
 * POST : forges a new `PREFIX-12hex-8hmac` key with expiry + device
 *        limits. The full key is returned exactly once — store it now.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { devices, licenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { forgeLicenseKey, hashLicenseKey } from "@/lib/license";
import { audit, ensureSystem, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const licenseRows = await db.select().from(licenses);
  const deviceRows = await db.select().from(devices);

  const deviceCount = new Map<string, number>();
  for (const d of deviceRows) {
    deviceCount.set(d.licenseId, (deviceCount.get(d.licenseId) ?? 0) + 1);
  }

  const now = Date.now();
  return Response.json({
    ok: true,
    licenses: licenseRows.map((l) => ({
      id: l.id,
      key: l.key,
      prefix: l.prefix,
      status: l.status,
      effectiveStatus:
        l.status === "revoked"
          ? "revoked"
          : new Date(l.expiresAt).getTime() < now
            ? "expired"
            : "active",
      label: l.label,
      maxDevices: l.maxDevices,
      devices: deviceCount.get(l.id) ?? 0,
      expiresAt: l.expiresAt,
      createdAt: l.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  let body: { label?: string; days?: number; maxDevices?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const state = await ensureSystem();
  const days = Math.min(3650, Math.max(1, Number(body?.days) || state.licenseDefaultDays));
  const maxDevices = Math.min(100, Math.max(1, Number(body?.maxDevices) || state.licenseDefaultDevices));

  const { key, entropyHex, checksum } = forgeLicenseKey(state.brandPrefix, state.ecdsaPublicKeyPem);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const [inserted] = await db
    .insert(licenses)
    .values({
      key,
      keyHash: hashLicenseKey(key),
      prefix: state.brandPrefix,
      entropy: entropyHex,
      checksum,
      status: "active",
      label: body?.label?.trim() || null,
      maxDevices,
      expiresAt,
    })
    .returning();

  await audit(
    user.username,
    "license.forged",
    `${key} · ${days}d · ${maxDevices} device(s)`,
    extractIp(request),
  );

  return Response.json({ ok: true, license: inserted });
}
