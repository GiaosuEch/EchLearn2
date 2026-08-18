/**
 * RAVENHUB — PERMIT DOWNLOAD / REVOCATION
 * ------------------------------------------------------------------
 * GET    : downloads the signed `permit.json` for the compiler.
 * DELETE : revokes the permit (compiler checks revocation status).
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { permits } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { audit, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const rows = await db.select().from(permits).where(eq(permits.id, id)).limit(1);
  const permit = rows[0];
  if (!permit) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  // The signed canonical payload MUST remain byte-identical to what the
  // ECDSA signature covers — no extra metadata keys may be appended.
  // Verification guidance lives in the README instead.
  const document = {
    ...JSON.parse(permit.payloadJson),
    signature: permit.signature,
  };

  return new Response(JSON.stringify(document, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="permit-${permit.id.slice(0, 8)}.json"`,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const rows = await db.select().from(permits).where(eq(permits.id, id)).limit(1);
  if (!rows[0]) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

  await db.update(permits).set({ revokedAt: new Date() }).where(eq(permits.id, id));
  await audit(user.username, "permit.revoked", rows[0].id, extractIp(request));
  return Response.json({ ok: true });
}
