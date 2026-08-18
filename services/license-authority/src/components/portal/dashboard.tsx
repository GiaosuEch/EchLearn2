"use client";

/**
 * RAVENHUB — AMETHYST ANALYTICS DASHBOARD
 * ------------------------------------------------------------------
 * Tabbed monospace admin console: Overview (canvas telemetry),
 * Keys, Devices, Permits, Settings, Audit. Native light/dark mode.
 */
import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import { HandshakeLine, OsDonut, StatusBars } from "@/components/portal/charts";
import {
  Badge,
  EmptyState,
  Panel,
  StatCard,
  Td,
  Th,
  ToastProvider,
  fmtDateTime,
  useToast,
} from "@/components/portal/ui";
import KeysTab from "@/components/portal/tabs/keys-tab";
import DevicesTab from "@/components/portal/tabs/devices-tab";
import PermitsTab from "@/components/portal/tabs/permits-tab";
import SettingsTab from "@/components/portal/tabs/settings-tab";
import AuditTab from "@/components/portal/tabs/audit-tab";

export interface DashboardUser {
  id: string;
  username: string;
  role: string;
  totpEnabled: boolean;
}

export interface StatsResponse {
  counts: {
    licenses: number;
    active: number;
    revoked: number;
    expired: number;
    expiringSoon: number;
    devices: number;
    handshakes24h: number;
    failures24h: number;
  };
  series: Array<{ bucket: string; label: string; ok: number; fail: number }>;
  osBreakdown: Array<{ os: string; count: number }>;
  keyStatus: Array<{ status: string; count: number }>;
  avgLatency: number;
  p95Latency: number;
  recentTelemetry: Array<{
    id: string;
    ok: number;
    action: string;
    latencyMs: number;
    note: string | null;
    platform: string | null;
    createdAt: string;
  }>;
}

type TabId = "overview" | "keys" | "devices" | "permits" | "settings" | "audit";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "overview" },
  { id: "keys", label: "keys" },
  { id: "devices", label: "devices" },
  { id: "permits", label: "permits" },
  { id: "settings", label: "settings" },
  { id: "audit", label: "audit" },
];

const ASCII = ` ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝
██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗
╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║
 ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

export default function Dashboard({ initialUser }: { initialUser: DashboardUser }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const notify = useToast();

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      const data = await res.json();
      if (data.ok) setStats(data);
    } catch {
      /* transient */
    }
  }, []);

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 20_000); // live refresh
    return () => clearInterval(timer);
  }, [loadStats]);

  async function refreshNow() {
    setRefreshing(true);
    await loadStats();
    setTimeout(() => setRefreshing(false), 400);
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    window.location.reload();
  }

  return (
    <ToastProvider>
      <main className="min-h-screen relative overflow-hidden">
        <div className="grid-bg fixed inset-0 pointer-events-none" />
        <div
          className="fixed -top-48 left-1/2 -translate-x-1/2 w-[820px] h-[400px] rounded-full blur-[140px] glow-pulse pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--violet) 16%, transparent)" }}
        />

        {/* Top bar */}
        <header className="relative z-10 border-b backdrop-blur-md" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 72%, transparent)" }}>
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <svg width="26" height="26" viewBox="0 0 64 64">
                <path d="M32 8 L54 20.5 V43.5 L32 56 L10 43.5 V20.5 Z" fill="none" stroke="var(--violet)" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="32" cy="34" r="4" fill="var(--magenta)" />
              </svg>
              <div>
                <p className="mono text-[13px] font-bold tracking-[0.2em]" style={{ color: "var(--violet-soft)" }}>
                  RAVENHUB
                </p>
                <p className="mono text-[9px] tracking-[0.3em] uppercase" style={{ color: "var(--text-faint)" }}>
                  license system · v15
                </p>
              </div>
            </div>

            <nav className="hidden md:flex flex-1 items-center gap-5 ml-6 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`mono text-[11.5px] tracking-[0.14em] uppercase py-2 tab-btn ${tab === t.id ? "tab-btn-active" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={refreshNow}
                className="btn btn-ghost !px-2.5 mono text-[10px]"
                title="Refresh telemetry"
              >
                <span className={refreshing ? "animate-spin inline-block" : "inline-block"}>⟳</span>
              </button>
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 ml-1 border-l pl-3" style={{ borderColor: "var(--border)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center mono text-[10px] font-bold" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "var(--violet-soft)" }}>
                  {initialUser.username[0]?.toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="mono text-[11px]" style={{ color: "var(--text)" }}>
                    {initialUser.username}
                  </p>
                  <p className="mono text-[9px]" style={{ color: "var(--text-faint)" }}>
                    {initialUser.role}
                    {initialUser.totpEnabled ? " · 2FA" : ""}
                  </p>
                </div>
                <button type="button" onClick={logout} className="btn btn-ghost !px-2 !py-1 mono text-[10px]" title="Sign out">
                  ⏻
                </button>
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex gap-4 px-5 pb-2 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`mono text-[10.5px] tracking-[0.14em] uppercase py-1 tab-btn ${tab === t.id ? "tab-btn-active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-5 py-6">
          {tab === "overview" && (
            <OverviewTab stats={stats} onToast={notify} />
          )}
          {tab === "keys" && <KeysTab onToast={notify} />}
          {tab === "devices" && <DevicesTab onToast={notify} />}
          {tab === "permits" && <PermitsTab onToast={notify} />}
          {tab === "settings" && <SettingsTab onToast={notify} />}
          {tab === "audit" && <AuditTab />}

          {tab === "overview" && (
            <pre className="mono hidden lg:block text-[8.5px] leading-[1.35] mt-10 text-center select-none" style={{ color: "var(--text-faint)" }}>
              {ASCII}
            </pre>
          )}
        </div>
      </main>
    </ToastProvider>
  );
}

/* ================================================================== */
/* OVERVIEW TAB                                                        */
/* ================================================================== */
function OverviewTab({
  stats,
  onToast,
}: {
  stats: StatsResponse | null;
  onToast: (kind: "ok" | "err" | "info", text: string) => void;
}) {
  if (!stats) {
    return (
      <Panel className="p-14 text-center">
        <p className="mono text-[12px] shimmer inline-block px-4 py-1 rounded" style={{ color: "var(--violet-soft)" }}>
          decrypting telemetry feed…
        </p>
      </Panel>
    );
  }

  const c = stats.counts;

  return (
    <div className="space-y-5 fade-up">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="total keys" value={c.licenses} sub={`${c.expiringSoon} expiring ≤ 7d`} delay={0} />
        <StatCard label="active keys" value={c.active} accent="var(--emerald)" sub={`${c.revoked} revoked · ${c.expired} expired`} delay={60} />
        <StatCard label="bound devices" value={c.devices} accent="var(--violet-soft)" sub="HWID bindings" delay={120} />
        <StatCard label="handshakes 24h" value={c.handshakes24h} accent="var(--amber)" sub={`${c.failures24h} rejected`} delay={180} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 p-4 fade-up" delay={120}>
          <div className="flex items-center justify-between mb-3">
            <p className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dim)" }}>
              verification volume · 24h
            </p>
            <div className="flex gap-3 mono text-[10px]" style={{ color: "var(--text-faint)" }}>
              <span>■ ok</span>
              <span>╌ rejected</span>
            </div>
          </div>
          <HandshakeLine series={stats.series} />
          <div className="grid grid-cols-3 gap-2 mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>avg latency</p>
              <p className="mono text-[15px] font-bold" style={{ color: "var(--emerald)" }}>
                {stats.avgLatency}ms
              </p>
            </div>
            <div>
              <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>p95 latency</p>
              <p className="mono text-[15px] font-bold" style={{ color: "var(--violet-soft)" }}>{stats.p95Latency}ms</p>
            </div>
            <div>
              <p className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>SLA target</p>
              <p className="mono text-[15px] font-bold" style={{ color: "var(--text-dim)" }}>&lt;100ms</p>
            </div>
          </div>
        </Panel>

        <Panel className="p-4 fade-up" delay={180}>
          <p className="mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--text-dim)" }}>
            platform distribution
          </p>
          <OsDonut data={stats.osBreakdown} />
          <div className="mt-1 space-y-1">
            {stats.osBreakdown.length === 0 && (
              <p className="mono text-[10px] text-center" style={{ color: "var(--text-faint)" }}>
                no devices bound yet
              </p>
            )}
            {stats.osBreakdown.map((d, i) => (
              <div key={d.os} className="flex justify-between mono text-[11px]">
                <span style={{ color: "var(--text-dim)" }}>
                  <span style={{ color: ["#8b5cf6", "#a78bfa", "#6d28d9", "#ec4899", "#10b981", "#f59e0b"][i % 6] }}>●</span>{" "}
                  {d.os}
                </span>
                <span style={{ color: "var(--text)" }}>{d.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="p-4 fade-up" delay={220}>
          <p className="mono text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-dim)" }}>
            license states
          </p>
          <StatusBars data={stats.keyStatus} />
        </Panel>

        <Panel className="lg:col-span-2 p-4 fade-up" delay={260}>
          <p className="mono text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-dim)" }}>
            live handshake feed
          </p>
          {stats.recentTelemetry.length === 0 ? (
            <EmptyState text="no handshakes recorded — awaiting client activity" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                    <Th>time</Th>
                    <Th>action</Th>
                    <Th>verdict</Th>
                    <Th right>latency</Th>
                    <Th right>platform</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTelemetry.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:brightness-125 transition" style={{ borderColor: "var(--border)" }}>
                      <Td>{fmtDateTime(t.createdAt)}</Td>
                      <Td>{t.action}</Td>
                      <Td>
                        {t.ok === 1 ? (
                          <Badge tone="ok">granted</Badge>
                        ) : (
                          <Badge tone="err">{t.note ?? "rejected"}</Badge>
                        )}
                      </Td>
                      <Td right>
                        <span style={{ color: t.latencyMs > 100 ? "var(--amber)" : "var(--emerald)" }}>
                          {t.latencyMs}ms
                        </span>
                      </Td>
                      <Td right>{t.platform ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
