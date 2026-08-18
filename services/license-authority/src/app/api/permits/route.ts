/**
 * RAVENHUB — COMPILER PERMITS (EXCLUSIVE PERMIT MODEL)
 * ------------------------------------------------------------------
 * A permit is an ECDSA-signed JSON document proving the operator is
 * authorized to produce watermark-free compiled binaries. `compiler.js`
 * verifies the signature against the server public key before any
 * licensed build proceeds; unpermitted builds get the watermark loader.
 */
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { permits } from "@/db/schema";
import { ecdsaSign } from "@/lib/crypto";
import { requireAdmin } from "@/lib/auth";
import { audit, ensureSystem, extractIp } from "@/lib/system";

export const dynamic = "force-dynamic";

export function buildPermitPayload(permit: {
  id: string;
  expiresAt: Date;
  createdAt: Date;
}) {
  return JSON.stringify({
    id: permit.id,
    type: "CYPHER_COMPILER_PERMIT",
    version: 15,
    issuedAt: permit.createdAt.toISOString(),
    expiresAt: permit.expiresAt.toISOString(),
    curve: "prime256v1",
    purposes: ["compile", "package", "watermark-free"],
  });
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const rows = await db.select().from(permits).orderBy(desc(permits.createdAt)).limit(50);
  return Response.json({
    ok: true,
    permits: rows.map((p) => ({
      id: p.id,
      expiresAt: p.expiresAt,
      revokedAt: p.revokedAt,
      createdAt: p.createdAt,
      active: !p.revokedAt && new Date(p.expiresAt).getTime() > Date.now(),
    })),
  });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  let body: { days?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const days = Math.min(365, Math.max(1, Number(body?.days) || 90));
  const state = await ensureSystem();

  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const provisional = { id: crypto.randomUUID(), expiresAt, createdAt };
  const payloadJson = buildPermitPayload(provisional);
  const signature = ecdsaSign(payloadJson, state.ecdsaPrivateKeyPem);

  const [row] = await db
    .insert(permits)
    .values({ id: provisional.id, payloadJson, signature, expiresAt })
    .returning();

  await audit(user.username, "permit.generated", `${days}d permit · ${row.id}`, extractIp(request));
  return Response.json({ ok: true, permit: row });
}
