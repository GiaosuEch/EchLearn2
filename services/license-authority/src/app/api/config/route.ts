/**
 * RAVENHUB — BRANDING & CONFIGURATION
 * ------------------------------------------------------------------
 * GET : public info (public key, fingerprint, brand prefix, defaults).
 * PUT : admin-only edits — brand prefix signature, ASCII art banner,
 *       default license duration and device limits.
 */
import { db } from "@/db";
import { systemConfig } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isValidPrefix } from "@/lib/license";
import { audit, ensureSystem, extractIp, invalidateSystemCache } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const state = await ensureSystem();
  return Response.json({
    ok: true,
    brandPrefix: state.brandPrefix,
    asciiArt: state.asciiArt,
    licenseDefaultDays: state.licenseDefaultDays,
    licenseDefaultDevices: state.licenseDefaultDevices,
    publicKeyPem: state.ecdsaPublicKeyPem,
    keyFingerprint: state.keyFingerprint,
    createdAt: state.createdAt,
  });
}

export async function PUT(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  let body: {
    brandPrefix?: string;
    asciiArt?: string;
    licenseDefaultDays?: number;
    licenseDefaultDevices?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const state = await ensureSystem();
  const changes: string[] = [];

  if (body.brandPrefix !== undefined) {
    if (!isValidPrefix(body.brandPrefix)) {
      return Response.json(
        { ok: false, error: "invalid_prefix", detail: "2–24 chars: A-Z a-z 0-9 _" },
        { status: 400 },
      );
    }
    await db
      .insert(systemConfig)
      .values({ key: "brand_prefix", value: body.brandPrefix })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value: body.brandPrefix, updatedAt: new Date() },
      });
    changes.push(`prefix → ${body.brandPrefix}`);
  }

  if (body.asciiArt !== undefined) {
    const art = body.asciiArt.slice(0, 2000);
    await db
      .insert(systemConfig)
      .values({ key: "ascii_art", value: art })
      .onConflictDoUpdate({ target: systemConfig.key, set: { value: art, updatedAt: new Date() } });
    changes.push("ascii banner updated");
  }

  if (body.licenseDefaultDays !== undefined) {
    const days = Math.min(3650, Math.max(1, Number(body.licenseDefaultDays) || 30));
    await db
      .insert(systemConfig)
      .values({ key: "license_default_days", value: String(days) })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value: String(days), updatedAt: new Date() },
      });
    changes.push(`default days → ${days}`);
  }

  if (body.licenseDefaultDevices !== undefined) {
    const devs = Math.min(100, Math.max(1, Number(body.licenseDefaultDevices) || 2));
    await db
      .insert(systemConfig)
      .values({ key: "license_default_devices", value: String(devs) })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value: String(devs), updatedAt: new Date() },
      });
    changes.push(`default devices → ${devs}`);
  }

  invalidateSystemCache();
  await audit(user.username, "config.updated", changes.join(" · "), extractIp(request));
  const fresh = await ensureSystem();
  return Response.json({
    ok: true,
    brandPrefix: fresh.brandPrefix,
    asciiArt: fresh.asciiArt,
    licenseDefaultDays: fresh.licenseDefaultDays,
    licenseDefaultDevices: fresh.licenseDefaultDevices,
  });
}
