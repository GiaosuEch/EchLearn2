"use client";

/**
 * RAVENHUB — KEYS TAB
 * ------------------------------------------------------------------
 * Forge HMAC-protected license keys (`PREFIX-12hex-8hmac`), revoke,
 * extend, copy, and delete. The full key is shown exactly once at
 * forge time (and available while the row exists).
 */
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  EmptyState,
  Panel,
  Td,
  Th,
  copyText,
  daysLeft,
  fmtDate,
  useToast,
} from "@/components/portal/ui";

interface LicenseRow {
  id: string;
  key: string;
  prefix: string;
  status: string;
  effectiveStatus: "active" | "revoked" | "expired";
  label: string | null;
  maxDevices: number;
  devices: number;
  expiresAt: string;
  createdAt: string;
}

export default function KeysTab({
  onToast,
}: {
  onToast: (kind: "ok" | "err" | "info", text: string) => void;
}) {
  const [rows, setRows] = useState<LicenseRow[] | null>(null);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(30);
  const [maxDevices, setMaxDevices] = useState(2);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const notify = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/licenses", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setRows(data.licenses);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function forge(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, days, maxDevices }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify("err", data.error ?? "forge failed");
        return;
      }
      onToast("ok", `key forged · ${data.license.key}`);
      setLabel("");
      await load();
    } catch {
      notify("err", "network error");
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, action: "revoke" | "extend" | "delete") {
    if (action === "delete" && !window.confirm("Permanently delete this license and its device bindings?")) {
      return;
    }
    const res = await fetch(`/api/licenses/${id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.ok) {
      notify("ok", `license ${action === "delete" ? "deleted" : action === "revoke" ? "revoked" : "extended +30d"}`);
      await load();
    } else {
      notify("err", data.error ?? "action failed");
    }
  }

  async function copy(row: LicenseRow) {
    const ok = await copyText(row.key);
    notify(ok ? "ok" : "err", ok ? "license key copied" : "clipboard blocked");
  }

  const filtered = (rows ?? []).filter(
    (r) =>
      !filter ||
      r.key.toLowerCase().includes(filter.toLowerCase()) ||
      (r.label ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-4 fade-up">
      {/* Forge panel */}
      <Panel className="p-5">
        <p className="mono text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "var(--violet-soft)" }}>
          ⌬ forge license key
        </p>
        <form onSubmit={forge} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="fl">customer label (optional)</label>
            <input id="fl" className="input mono" placeholder="e.g. acme-corp-production" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="fd">validity (days)</label>
            <input id="fd" type="number" min={1} max={3650} className="input mono" value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="fm">max devices</label>
            <input id="fm" type="number" min={1} max={100} className="input mono" value={maxDevices} onChange={(e) => setMaxDevices(Number(e.target.value))} />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary mono w-full">
            {busy ? "forging…" : "forge ▸"}
          </button>
        </form>
        <p className="mono text-[10px] mt-3" style={{ color: "var(--text-faint)" }}>
          format: <b>[prefix]</b>-12hex-8hmac · checksum HMAC-SHA256 keyed by server identity · full key shown once
        </p>
      </Panel>

      {/* Table */}
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dim)" }}>
            issued licenses
          </p>
          <input
            className="input !w-56 mono !text-[11px] !py-1.5"
            placeholder="filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {rows === null ? (
          <EmptyState text="loading license vault…" />
        ) : filtered.length === 0 ? (
          <EmptyState text="no licenses forged yet — create your first key above" />
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <Th>license key</Th>
                  <Th>state</Th>
                  <Th>label</Th>
                  <Th right>devices</Th>
                  <Th right>expiry</Th>
                  <Th right>actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const d = daysLeft(r.expiresAt);
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:brightness-125 transition" style={{ borderColor: "var(--border)" }}>
                      <Td>
                        <button
                          type="button"
                          onClick={() => copy(r)}
                          title="Copy key"
                          className="hover:underline decoration-dotted"
                          style={{ color: "var(--violet-soft)" }}
                        >
                          {r.key}
                        </button>
                      </Td>
                      <Td>
                        {r.effectiveStatus === "active" && <Badge tone="ok">active</Badge>}
                        {r.effectiveStatus === "revoked" && <Badge tone="err">revoked</Badge>}
                        {r.effectiveStatus === "expired" && <Badge tone="warn">expired</Badge>}
                        {r.effectiveStatus === "active" && d <= 7 && (
                          <span className="ml-2 mono text-[9px]" style={{ color: "var(--amber)" }}>
                            {d}d left
                          </span>
                        )}
                      </Td>
                      <Td>{r.label ?? "—"}</Td>
                      <Td right>
                        <span style={{ color: r.devices >= r.maxDevices ? "var(--amber)" : "var(--text)" }}>
                          {r.devices}/{r.maxDevices}
                        </span>
                      </Td>
                      <Td right>{fmtDate(r.expiresAt)}</Td>
                      <Td right>
                        <div className="flex gap-1.5 justify-end">
                          {r.effectiveStatus !== "revoked" && (
                            <button type="button" onClick={() => act(r.id, "extend")} className="btn btn-ghost !px-2 !py-1 text-[10px] mono" title="Extend 30 days">
                              +30d
                            </button>
                          )}
                          {r.effectiveStatus === "active" && (
                            <button type="button" onClick={() => act(r.id, "revoke")} className="btn btn-danger !px-2 !py-1 text-[10px] mono">
                              revoke
                            </button>
                          )}
                          <button type="button" onClick={() => act(r.id, "delete")} className="btn btn-ghost !px-2 !py-1 text-[10px] mono" title="Delete">
                            ✕
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
