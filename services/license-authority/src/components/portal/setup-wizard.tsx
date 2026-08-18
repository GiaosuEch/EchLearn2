"use client";

/**
 * RAVENHUB — FIRST-RUN SETUP WIZARD
 * ------------------------------------------------------------------
 * Obsidian-violet terminal wizard. Displays the auto-generated 32-byte
 * JWT secret with copy-paste deployment instructions, then locks the
 * gateway permanently with the first OWNER registration.
 */
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

const ASCII = ` ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝
██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗
╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║
 ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

interface StatusResponse {
  setupLocked: boolean;
  jwtSecret: string | null;
  keyFingerprint: string;
  persistence: string;
}

export default function SetupWizard() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "> boot: cloaked gateway detected (route /secret-amethyst-portal)",
    "> persistence: remote PostgreSQL · keys recoverable across restarts",
  ]);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: StatusResponse) => {
        setStatus(data);
        setTerminalLines((lines) => [
          ...lines,
          `> ECDSA identity key: ${data.keyFingerprint}`,
          `> JWT secret: 32 random bytes generated (${data.jwtSecret ? data.jwtSecret.length : 0} hex chars)`,
        ]);
      })
      .catch(() => setTerminalLines((l) => [...l, "> ! status probe failed"]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("password_mismatch: confirmation does not match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(`setup_rejected: ${data.error ?? res.status}`);
        return;
      }
      setTerminalLines((l) => [
        ...l,
        "> owner registered — gateway permanently locked",
        "> redirecting to secure login…",
      ]);
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setError("network_error");
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!status?.jwtSecret) return;
    try {
      await navigator.clipboard.writeText(status.jwtSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full blur-[130px] glow-pulse pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)" }}
      />
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-14">
        <pre className="mono text-[9px] sm:text-[11px] leading-tight text-center fade-up" style={{ color: "var(--violet-soft)" }}>
          {ASCII}
        </pre>
        <p className="mono text-center text-[10px] mt-3 tracking-[0.35em] uppercase fade-up" style={{ color: "var(--text-faint)" }}>
          secure binary generator · zero-knowledge licensing shield
        </p>

        {/* Live terminal console */}
        <div className="panel scanlines relative mt-8 fade-up">
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="term-dot" style={{ background: "#f87171" }} />
            <span className="term-dot" style={{ background: "#fbbf24" }} />
            <span className="term-dot" style={{ background: "#34d399" }} />
            <span className="mono text-[11px] ml-3" style={{ color: "var(--text-faint)" }}>
              ravenhub@cloaked:~$ setup — first-run
            </span>
          </div>
          <div className="p-5 mono text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {terminalLines.map((line, i) => (
              <div key={i} className="fade-up">
                {line}
              </div>
            ))}
            <div className="mt-1">
              <span className="blink" style={{ color: "var(--violet-soft)" }}>▌</span>
            </div>
          </div>
        </div>

        {/* Secret + deployment guide */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="panel p-5 fade-up">
            <div className="flex items-center justify-between">
              <span className="label !mb-0">JWT Secret (32 bytes)</span>
              <button type="button" onClick={copySecret} className="btn btn-ghost !px-2 !py-1 text-[10px]">
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>
            <div
              className="mono text-[11px] mt-3 p-3 rounded-lg break-all border"
              style={{ background: "var(--bg-soft)", borderColor: "var(--border)" }}
            >
              {status?.jwtSecret ?? "generating…"}
            </div>
            <p className="mono text-[10px] mt-3 leading-relaxed" style={{ color: "var(--text-faint)" }}>
              paste into Render/Railway as <b>JWT_SECRET</b> (optional — already persisted
              in PostgreSQL). Keys &amp; secrets survive free-tier restarts.
            </p>
          </div>

          <div className="panel p-5 fade-up" style={{ animationDelay: "80ms" }}>
            <span className="label">Deployment Reference</span>
            <pre className="mono text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
{`DATABASE_URL  → Supabase / Neon PostgreSQL
PORT          → auto-bind (Render/Railway)
CYPHER_MASTER_KEY (optional automation)
PORTAL        → /secret-amethyst-portal
CLIENT API    → /api/v1/telemetry/sync
                /api/v1/telemetry/report
PUBLIC KEY    → /api/v1/server-public-key`}
            </pre>
          </div>
        </div>

        {/* Owner registration */}
        <form onSubmit={submit} className="panel p-6 mt-6 fade-up" style={{ animationDelay: "140ms" }}>
          <h2 className="mono text-sm tracking-[0.2em] uppercase" style={{ color: "var(--violet-soft)" }}>
            register owner account
          </h2>
          <p className="mono text-[11px] mt-2 mb-5" style={{ color: "var(--text-dim)" }}>
            The FIRST registration is granted the OWNER role. The gateway locks
            permanently immediately after — no second registration is ever possible.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="su">username</label>
              <input
                id="su"
                className="input mono"
                placeholder="e.g. raven_ops"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label" htmlFor="sp">password (min 10, letters+digits)</label>
              <input
                id="sp"
                type="password"
                className="input mono"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="sc">confirm password</label>
              <input
                id="sc"
                type="password"
                className="input mono"
                placeholder="••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />
            </div>
          </div>
          {error && (
            <p className="mono text-[11px] mt-4" style={{ color: "var(--red)" }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary w-full mt-5 mono">
            {busy ? "locking gateway…" : "⚡ register owner & lock gateway"}
          </button>
        </form>

        <p className="mono text-center text-[10px] mt-8" style={{ color: "var(--text-faint)" }}>
          restricted · source-available dual license · permit-controlled builds
        </p>
      </div>
    </main>
  );
}
