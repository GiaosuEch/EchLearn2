"use client";

/**
 * RAVENHUB — AUDIT TAB
 * ------------------------------------------------------------------
 * Live administrative audit trail: forges, revocations, logins,
 * config changes, permit issuance.
 */
import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  Panel,
  Td,
  Th,
  fmtDateTime,
} from "@/components/portal/ui";

interface LogRow {
  id: string;
  actor: string;
  event: string;
  detail: string | null;
  ip: string | null;
  createdAt: string;
}

export default function AuditTab() {
  const [rows, setRows] = useState<LogRow[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/audit?limit=300", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setRows(data.logs);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15_000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <Panel className="overflow-hidden fade-up">
      <div className="flex items-center justify-between px-4 pt-4">
        <p className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--text-dim)" }}>
          audit trail
        </p>
        <button type="button" onClick={load} className="btn btn-ghost !px-2 !py-1 mono text-[10px]">
          ⟳ refresh
        </button>
      </div>
      {rows === null ? (
        <EmptyState text="loading audit feed…" />
      ) : rows.length === 0 ? (
        <EmptyState text="no audit events recorded" />
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <Th>time</Th>
                <Th>actor</Th>
                <Th>event</Th>
                <Th>detail</Th>
                <Th right>ip</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b last:border-0 hover:brightness-125 transition" style={{ borderColor: "var(--border)" }}>
                  <Td>{fmtDateTime(l.createdAt)}</Td>
                  <Td>
                    <span style={{ color: "var(--violet-soft)" }}>{l.actor}</span>
                  </Td>
                  <Td>
                    <span
                      style={{
                        color: l.event.includes("failed") ? "var(--red)" : "var(--emerald)",
                      }}
                    >
                      {l.event}
                    </span>
                  </Td>
                  <Td>{l.detail ?? "—"}</Td>
                  <Td right>{l.ip ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
