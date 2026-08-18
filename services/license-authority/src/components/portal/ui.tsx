"use client";

/**
 * RAVENHUB — SHARED AMETHYST UI PRIMITIVES
 * ------------------------------------------------------------------
 * Panel, StatCard, Badge, ToastProvider (context-based notifications),
 * copy-to-clipboard and time-format helpers.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Toast system                                                        */
/* ------------------------------------------------------------------ */
interface Toast {
  id: number;
  kind: "ok" | "err" | "info";
  text: string;
}

const ToastContext = createContext<(kind: Toast["kind"], text: string) => void>(
  () => {},
);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const notify = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++counter.current;
    setToasts((t) => [...t.slice(-4), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="panel panel-glow px-4 py-3 mono text-[11.5px] fade-up flex items-center gap-2"
            style={{
              borderColor:
                t.kind === "ok"
                  ? "var(--emerald)"
                  : t.kind === "err"
                    ? "var(--red)"
                    : "var(--violet)",
            }}
          >
            <span
              style={{
                color:
                  t.kind === "ok"
                    ? "var(--emerald)"
                    : t.kind === "err"
                      ? "var(--red)"
                      : "var(--violet-soft)",
              }}
            >
              {t.kind === "ok" ? "✓" : t.kind === "err" ? "✗" : "›"}
            </span>
            <span style={{ color: "var(--text)" }}>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                              */
/* ------------------------------------------------------------------ */
export function Panel({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`panel ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                           */
/* ------------------------------------------------------------------ */
export function StatCard({
  label,
  value,
  sub,
  accent = "var(--violet-soft)",
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
}) {
  return (
    <Panel className="p-4 fade-up" delay={delay}>
      <p className="label !mb-1">{label}</p>
      <p className="mono text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {sub && (
        <p className="mono text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>
          {sub}
        </p>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                              */
/* ------------------------------------------------------------------ */
export function Badge({ tone, children }: { tone: "ok" | "warn" | "err" | "dim" | "violet"; children: ReactNode }) {
  const colors: Record<string, [string, string]> = {
    ok: ["var(--emerald)", "color-mix(in srgb, var(--emerald) 18%, transparent)"],
    warn: ["var(--amber)", "color-mix(in srgb, var(--amber) 16%, transparent)"],
    err: ["var(--red)", "color-mix(in srgb, var(--red) 16%, transparent)"],
    dim: ["var(--text-faint)", "color-mix(in srgb, var(--text-faint) 14%, transparent)"],
    violet: ["var(--violet-soft)", "color-mix(in srgb, var(--violet) 16%, transparent)"],
  };
  const [color, bg] = colors[tone];
  return (
    <span className="badge" style={{ color, background: bg, borderColor: color }}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function fmtDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export function fmtDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function shortHash(hash: string, len = 10): string {
  return hash.length > len ? `${hash.slice(0, len)}…` : hash;
}

export function daysLeft(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

/* ------------------------------------------------------------------ */
/* Table primitives                                                   */
/* ------------------------------------------------------------------ */
export function Th({ children, right = false }: { children?: ReactNode; right?: boolean }) {
  return (
    <th
      className={`mono text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2.5 ${right ? "text-right" : "text-left"}`}
      style={{ color: "var(--text-faint)" }}
    >
      {children}
    </th>
  );
}

export function Td({ children, right = false, mono = true }: { children?: ReactNode; right?: boolean; mono?: boolean }) {
  return (
    <td
      className={`px-3 py-2.5 text-[12px] ${right ? "text-right" : "text-left"} ${mono ? "mono" : ""}`}
      style={{ color: "var(--text-dim)" }}
    >
      {children}
    </td>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center mono text-[11px]" style={{ color: "var(--text-faint)" }}>
      <span className="blink" style={{ color: "var(--violet-soft)" }}>▌</span> {text}
    </div>
  );
}
