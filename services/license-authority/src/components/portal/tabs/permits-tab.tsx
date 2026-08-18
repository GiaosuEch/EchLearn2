"use client";

/**
 * RAVENHUB — PERMITS TAB (EXCLUSIVE PERMIT MODEL)
 * ------------------------------------------------------------------
 * ECDSA-signed compiler permits. `compiler.js` verifies a permit
 * before producing watermark-free binaries; unpermitted builds are
 * compiled with the watermark loader instead.
 */
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  EmptyState,
  Panel,
  Td,
  Th,
  fmtDate,
  useToast,
} from "@/components/portal/ui";

interface PermitRow {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  active: boolean;
}

export default function PermitsTab({
  onToast,
}: {
  onToast: (kind: "ok" | "err" | "info", text: string) => void;
}) {
  const [rows, setRows] = useState<PermitRow[] | null>(null);
  const [days, setDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/permits", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setRows(data.permits);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify("err", data.error ?? "permit generation failed");
        return;
      }
      onToast("ok", "permit signed with ECDSA · ready to download");
      await load();
    } catch {
      notify("err", "network error");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(row: PermitRow) {
    if (!window.confirm("Revoke this compiler permit?")) return;
    const res = await fetch(`/api/permits/${row.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      notify("ok", "permit revoked");
      await load();
    } else {
      notify("err", data.error ?? "revocation failed");
    }
  }

  return (
    <div className="space-y-4 fade-up">
      <Panel className="p-5">
        <p className="mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--violet-soft)" }}>
          ⌬ generate compiler permit
        </p>
        <p className="mono text-[10.5px] mb-4" style={{ color: "var(--text-dim)" }}>
          A permit authorizes watermark-free builds. The compiler verifies the
          ECDSA signature against the server public key before any licensed
          compilation — tampered or forged permits are rejected locally.
        </p>
        <form onSubmit={generate} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label" htmlFor="pd">validity (days)</label>
            <input id="pd" type="number" min={1} max={365} className="input mono !w-40" value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary mono">
            {busy ? "signing…" : "⚡ sign permit"}
          </button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        <p className="mono text-[11px] tracking-[0.2em] uppercase px-4 pt-4" style={{ color: "var(--text-dim)" }}>
          issued permits
        </p>
        {rows === null ? (
          <EmptyState text="reading permit ledger…" />
        ) : rows.length === 0 ? (
          <EmptyState text="no permits issued yet" />
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <Th>permit id</Th>
                  <Th>state</Th>
                  <Th right>issued</Th>
                  <Th right>expires</Th>
                  <Th right>actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:brightness-125 transition" style={{ borderColor: "var(--border)" }}>
                    <Td>
                      <span style={{ color: "var(--violet-soft)" }}>{p.id.slice(0, 8)}…</span>
                    </Td>
                    <Td>
                      {p.revokedAt ? (
                        <Badge tone="err">revoked</Badge>
                      ) : p.active ? (
                        <Badge tone="ok">valid</Badge>
                      ) : (
                        <Badge tone="warn">expired</Badge>
                      )}
                    </Td>
                    <Td right>{fmtDate(p.createdAt)}</Td>
                    <Td right>{fmtDate(p.expiresAt)}</Td>
                    <Td right>
                      <div className="flex gap-1.5 justify-end">
                        <a
                          href={`/api/permits/${p.id}`}
                          className="btn btn-emerald !px-2 !py-1 text-[10px] mono no-underline"
                        >
                          download
                        </a>
                        {!p.revokedAt && p.active && (
                          <button type="button" onClick={() => revoke(p)} className="btn btn-danger !px-2 !py-1 text-[10px] mono">
                            revoke
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
