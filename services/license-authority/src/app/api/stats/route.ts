/**
 * RAVENHUB — REAL-TIME TELEMETRY / DASHBOARD STATS
 * ------------------------------------------------------------------
 * Aggregates licenses, device bindings, handshake success/failure
 * series (24h), OS platform distribution and average latency — the
 * feed for the Canvas-based Amethyst analytics.
 */
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { devices, licenses, telemetry } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [licenseRows, deviceRows, telemetryRows] = await Promise.all([
    db.select().from(licenses),
    db.select().from(devices),
    db
      .select()
      .from(telemetry)
      .orderBy(desc(telemetry.createdAt))
      .limit(1500),
  ]);

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

  const counts = {
    licenses: licenseRows.length,
    active: licenseRows.filter(
      (l) => l.status === "active" && new Date(l.expiresAt).getTime() > now,
    ).length,
    revoked: licenseRows.filter((l) => l.status === "revoked").length,
    expired: licenseRows.filter(
      (l) => l.status === "active" && new Date(l.expiresAt).getTime() <= now,
    ).length,
    expiringSoon: licenseRows.filter((l) => {
      const exp = new Date(l.expiresAt).getTime();
      return l.status === "active" && exp > now && exp <= weekAhead;
    }).length,
    devices: deviceRows.length,
    handshakes24h: telemetryRows.filter((t) => t.createdAt.getTime() >= dayAgo).length,
    failures24h: telemetryRows.filter(
      (t) => t.createdAt.getTime() >= dayAgo && t.ok === 0,
    ).length,
  };

  /* Hourly series for the last 24 hours. */
  const series: { bucket: string; label: string; ok: number; fail: number }[] = [];
  for (let h = 23; h >= 0; h -= 1) {
    const start = new Date(now - h * 3600_000);
    start.setMinutes(0, 0, 0);
    const end = start.getTime() + 3600_000;
    let ok = 0;
    let fail = 0;
    for (const t of telemetryRows) {
      const ts = t.createdAt.getTime();
      if (ts >= start.getTime() && ts < end) {
        if (t.ok === 1) ok += 1;
        else fail += 1;
      }
    }
    series.push({
      bucket: start.toISOString(),
      label: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      ok,
      fail,
    });
  }

  /* OS platform distribution from device bindings. */
  const osMap = new Map<string, number>();
  for (const d of deviceRows) {
    const os = (d.platform || "unknown").trim().toLowerCase() || "unknown";
    osMap.set(os, (osMap.get(os) ?? 0) + 1);
  }
  const osBreakdown = [...osMap.entries()]
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count);

  /* Key status distribution. */
  const keyStatus = [
    { status: "active", count: counts.active },
    { status: "revoked", count: counts.revoked },
    { status: "expired", count: counts.expired },
  ];

  /* Latency metrics from successful handshakes (last 24h). */
  const recentOk = telemetryRows.filter(
    (t) => t.createdAt.getTime() >= dayAgo && t.ok === 1,
  );
  const avgLatency = recentOk.length
    ? Math.round(recentOk.reduce((sum, t) => sum + t.latencyMs, 0) / recentOk.length)
    : 0;
  const p95Latency =
    recentOk.length > 0
      ? [...recentOk.map((t) => t.latencyMs)].sort((a, b) => a - b)[
          Math.min(recentOk.length - 1, Math.floor(recentOk.length * 0.95))
        ]
      : 0;

  return Response.json({
    ok: true,
    counts,
    series,
    osBreakdown,
    keyStatus,
    avgLatency,
    p95Latency,
    recentTelemetry: telemetryRows.slice(0, 8).map((t) => ({
      id: t.id,
      ok: t.ok,
      action: t.action,
      latencyMs: t.latencyMs,
      note: t.note,
      platform: t.platform,
      createdAt: t.createdAt,
    })),
  });
}
