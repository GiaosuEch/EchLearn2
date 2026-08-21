/**
 * RAVENHUB — CLOAKED HANDSHAKE ENTRYPOINT (PHASE 1)
 * ------------------------------------------------------------------
 * External observers see a benign "telemetry sync" endpoint. It is in
 * fact the first leg of the ephemeral ECDH key exchange: the client
 * publishes an ephemeral P-256 public key; the server answers with
 * its own ephemeral key signed by the static ECDSA identity key.
 */
import { createHandshakeSession } from "@/lib/handshake";
import { extractIp, ensureSystem } from "@/lib/system";
import { hitRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = extractIp(request);

  // Flood gate: 30 exchanges per minute per IP.
  if (!hitRateLimit(`sync:${ip}`, 30)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { cpk?: string; nonce?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const clientPublicKey = body?.cpk ?? "";
  const nonce = body?.nonce ?? "";
  if (clientPublicKey.length > 1_024 || nonce.length > 64) {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const state = await ensureSystem();
  const started = Date.now();

  const result = await createHandshakeSession(
    clientPublicKey,
    nonce,
    state.ecdsaPrivateKeyPem,
  );
  if (!result) {
    return Response.json({ ok: false, error: "handshake_rejected" }, { status: 401 });
  }

  const latencyMs = Date.now() - started;
  return Response.json(
    { ok: true, sid: result.sid, spk: result.spk, sig: result.sig, nonce: result.nonce, latencyMs },
    { status: 200 },
  );
}

export async function GET() {
  // Decoy: the endpoint "exists" but answers like an unconfigured probe.
  return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
