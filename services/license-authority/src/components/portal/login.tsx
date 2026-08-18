"use client";

/**
 * RAVENHUB — HARDENED ADMIN LOGIN
 * ------------------------------------------------------------------
 * scrypt credential check + optional TOTP challenge, backed by
 * per-username lockout and per-IP rate limiting on the API side.
 */
import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

export default function LoginPanel() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, totp: totp || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "rate_limited") {
          setError("rate_limit: too many attempts — wait 60 seconds");
        } else if (data.error === "account_locked") {
          setError("account_locked: 5 failed attempts — try again in 15 minutes");
        } else if (data.error === "invalid_totp") {
          setError("2fa_rejected: invalid authenticator code");
        } else {
          setError("auth_rejected: invalid credentials");
        }
        return;
      }
      window.location.reload();
    } catch {
      setError("network_error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <div className="grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[340px] rounded-full blur-[120px] glow-pulse pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--violet) 20%, transparent)" }}
      />
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      <div className="panel scanlines relative z-10 w-full max-w-md p-8 fade-up">
        <p className="mono text-[10px] tracking-[0.4em] uppercase text-center" style={{ color: "var(--text-faint)" }}>
          restricted access
        </p>
        <h1 className="mono text-2xl font-bold text-center mt-2" style={{ color: "var(--violet-soft)" }}>
          amethyst portal
        </h1>
        <p className="mono text-[11px] text-center mt-1" style={{ color: "var(--text-dim)" }}>
          ECDSA-protected administrative gateway
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="lu">username</label>
            <input
              id="lu"
              className="input mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lp">password</label>
            <input
              id="lp"
              type="password"
              className="input mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lt">
              authenticator code <span style={{ color: "var(--text-faint)" }}>(if 2FA enabled)</span>
            </label>
            <input
              id="lt"
              className="input mono tracking-[0.5em]"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && (
            <p className="mono text-[11px]" style={{ color: "var(--red)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full mono mt-2">
            {busy ? "verifying…" : "authenticate ▸"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t mono text-[10px] text-center" style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}>
          sessions signed with HS256 · httpOnly cookie · 12h TTL
        </div>
      </div>
    </main>
  );
}
