/**
 * RAVENHUB — CLOAKED LICENSE VERIFICATION (PHASE 2)
 * ------------------------------------------------------------------
 * The client delivers its AES-256-GCM encrypted licensing payload
 * here. The server decrypts it inside the ephemeral handshake session,
 * validates HMAC block / expiry / revocation / device limits, and
 * returns an ECDSA-signed, freshly encrypted verdict.
 */
import { handleReport } from "@/lib/handshake";
import { extractIp } from "@/lib/system";
import { hitRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = extractIp(request);

  // Flood gate: 60 reports per minute per IP.
  if (!hitRateLimit(`report:${ip}`, 60)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { sid?: string; iv?: string; tag?: string; data?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const packet = {
    sid: body?.sid ?? "",
    iv: body?.iv ?? "",
    tag: body?.tag ?? "",
    data: body?.data ?? "",
  };
  if (
    packet.sid.length > 32
    || packet.iv.length > 64
    || packet.tag.length > 64
    || packet.data.length > 16_384
  ) {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const result = await handleReport(packet, ip);

  if (result.payload) {
    return Response.json({ ok: true, packet: result.payload }, { status: 200 });
  }
  return Response.json({ ok: false, error: result.error ?? "verification_failed" }, {
    status: result.status,
  });
}

export async function GET() {
  return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
