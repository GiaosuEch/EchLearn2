"use client";

/**
 * RAVENHUB — DEVICES TAB
 * ------------------------------------------------------------------
 * HWID bindings per license. Unbinding frees a device slot for the
 * license's next activation.
 */
import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  Panel,
  Td,
  Th,
  fmtDateTime,
  shortHash,
  useToast,
} from "@/components/portal/ui";

interface DeviceRow {
  id: string;
  licenseId: string;
  licenseKey: string;
  licenseLabel: string | null;
  hwidHash: string;
  platform: string | null;
  ip: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export default function DevicesTab({
  onToast,
}: {
  onToast: (kind: "ok" | "err" | "info", text: string) => void;
}) {
  const [rows, setRows] = useState<DeviceRow[] | null>(null);
  const notify = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/devices", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setRows(data.devices);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function unbind(row: DeviceRow) {
    if (!window.confirm(`Unbind device ${shortHash(row.hwidHash)} from ${row.licenseKey}?`)) return;
    const res = await fetch(`/api/devices/${row.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      notify("ok", "device unbound — slot freed");
      await load();
    } else {
      notify("err", data.error ?? "unbind failed");
    }
  }

  return (
    <Panel className="overflow-hidden fade-up">
      <p className="mono text-[11px] tracking-[0.2em] uppercase px-4 pt-4" style={{ color: "var(--text-dim)" }}>
        HWID bindings
      </p>
      {rows === null ? (
        <EmptyState text="reading device registry…" />
      ) : rows.length === 0 ? (
        <EmptyState text="no devices bound — run a client handshake to bind the first" />
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <Th>hwid hash</Th>
                <Th>license</Th>
                <Th>platform</Th>
                <Th>origin ip</Th>
                <Th>last seen</Th>
                <Th right>action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:brightness-125 transition" style={{ borderColor: "var(--border)" }}>
                  <Td>{shortHash(d.hwidHash, 18)}</Td>
                  <Td>
                    <span style={{ color: "var(--violet-soft)" }}>{d.licenseKey}</span>
                  </Td>
                  <Td>{d.platform ?? "—"}</Td>
                  <Td>{d.ip ?? "—"}</Td>
                  <Td>{fmtDateTime(d.lastSeenAt)}</Td>
                  <Td right>
                    <button type="button" onClick={() => unbind(d)} className="btn btn-danger !px-2 !py-1 text-[10px] mono">
                      unbind
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
