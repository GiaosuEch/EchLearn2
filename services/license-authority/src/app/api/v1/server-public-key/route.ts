/**
 * RAVENHUB — STATIC SERVER PUBLIC KEY (EMBED IN COMPILED CLIENTS)
 * ------------------------------------------------------------------
 * The compiled licensing client embeds this public key to verify the
 * server's ECDSA signature during the ECDH handshake. MITM proxies —
 * even with a root CA installed — cannot forge that signature.
 */
import { ensureSystem } from "@/lib/system";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await ensureSystem();
  return Response.json({
    curve: "prime256v1",
    fingerprint: state.keyFingerprint,
    publicKeyPem: state.ecdsaPublicKeyPem,
  });
}
