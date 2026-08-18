"use client";

/**
 * RAVENHUB — SETTINGS TAB
 * ------------------------------------------------------------------
 * Brand prefix signature, ASCII art banner, license defaults, server
 * public key (embed into clients), and TOTP 2FA enrollment.
 */
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Panel,
  copyText,
  useToast,
} from "@/components/portal/ui";

interface ConfigResponse {
  brandPrefix: string;
  asciiArt: string;
  licenseDefaultDays: number;
  licenseDefaultDevices: number;
  publicKeyPem: string;
  keyFingerprint: string;
  createdAt: string;
}

export default function SettingsTab({
  onToast,
}: {
  onToast: (kind: "ok" | "err" | "info", text: string) => void;
}) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [prefix, setPrefix] = useState("");
  const [asciiArt, setAsciiArt] = useState("");
  const [days, setDays] = useState(30);
  const [devs, setDevs] = useState(2);
  const [saving, setSaving] = useState(false);

  // TOTP state
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const notify = useToast();

  const load = useCallback(async () => {
    const [cfgRes, totpRes] = await Promise.all([
      fetch("/api/config", { cache: "no-store" }),
      fetch("/api/auth/totp", { cache: "no-store" }),
    ]);
    const cfg = await cfgRes.json();
    const totp = await totpRes.json();
    if (cfg.ok) {
      setConfig(cfg);
      setPrefix(cfg.brandPrefix);
      setAsciiArt(cfg.asciiArt);
      setDays(cfg.licenseDefaultDays);
      setDevs(cfg.licenseDefaultDevices);
    }
    if (totp.ok) setTotpEnabled(totp.enabled);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandPrefix: prefix,
          asciiArt,
          licenseDefaultDays: days,
          licenseDefaultDevices: devs,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify("err", data.error ?? "config save failed");
        return;
      }
      onToast("ok", "brand configuration saved");
      await load();
    } catch {
      notify("err", "network error");
    } finally {
      setSaving(false);
    }
  }

  async function totpStart() {
    const res = await fetch("/api/auth/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
    const data = await res.json();
    if (data.ok) {
      setTotpSecret(data.secretB32);
      setTotpUri(data.otpauthUri);
      notify("info", "enter the secret in your authenticator, then confirm");
    } else {
      notify("err", data.error ?? "2FA enrollment failed");
    }
  }

  async function totpConfirm() {
    const res = await fetch("/api/auth/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", code: totpCode }),
    });
    const data = await res.json();
    if (data.ok) {
      setTotpEnabled(true);
      setTotpSecret(null);
      setTotpUri(null);
      setTotpCode("");
      onToast("ok", "2FA enabled — sessions now require TOTP");
    } else {
      notify("err", data.error ?? "invalid code");
    }
  }

  async function totpDisable() {
    const res = await fetch("/api/auth/totp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: disableCode }),
    });
    const data = await res.json();
    if (data.ok) {
      setTotpEnabled(false);
      setDisableCode("");
      onToast("ok", "2FA disabled");
    } else {
      notify("err", data.error ?? "invalid code");
    }
  }

  async function copyKey() {
    if (!config) return;
    const ok = await copyText(config.publicKeyPem);
    notify(ok ? "ok" : "err", ok ? "server public key copied" : "clipboard blocked");
  }

  function downloadKey() {
    if (!config) return;
    const blob = new Blob([config.publicKeyPem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ravenhub_server_public_key.pem";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 fade-up">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Branding */}
        <Panel className="p-5">
          <p className="mono text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: "var(--violet-soft)" }}>
            ⚙ brand configuration
          </p>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label" htmlFor="bp">license prefix signature</label>
              <input
                id="bp"
                className="input mono"
                placeholder="RavenHub_"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.replace(/[^A-Za-z0-9_]/g, "").slice(0, 24))}
                required
              />
              <p className="mono text-[10px] mt-2" style={{ color: "var(--text-faint)" }}>
                keys are forged as <b style={{ color: "var(--violet-soft)" }}>{prefix || "PREFIX"}-12hex-8hmac</b> · the compiled client auto-adapts its HMAC pre-check to this signature
              </p>
            </div>
            <div>
              <label className="label" htmlFor="aa">ascii brand banner (client loaders)</label>
              <textarea
                id="aa"
                rows={6}
                className="input mono !text-[11px] leading-relaxed"
                value={asciiArt}
                onChange={(e) => setAsciiArt(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="sd">default validity (days)</label>
                <input id="sd" type="number" min={1} max={3650} className="input mono" value={days} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="sv">default devices</label>
                <input id="sv" type="number" min={1} max={100} className="input mono" value={devs} onChange={(e) => setDevs(Number(e.target.value))} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary mono w-full">
              {saving ? "saving…" : "save configuration"}
            </button>
          </form>
        </Panel>

        {/* Security */}
        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--violet-soft)" }}>
                🔐 two-factor authentication
              </p>
              {totpEnabled !== null &&
                (totpEnabled ? <Badge tone="ok">enabled</Badge> : <Badge tone="dim">disabled</Badge>)}
            </div>

            {!totpEnabled && !totpSecret && (
              <div>
                <p className="mono text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  Enroll a Google-Authenticator-compatible RFC 6238 TOTP secret
                  to harden admin sessions against credential theft.
                </p>
                <button type="button" onClick={totpStart} className="btn btn-primary mono mt-4">
                  enroll TOTP 2FA
                </button>
              </div>
            )}

            {totpSecret && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border" style={{ background: "var(--bg-soft)", borderColor: "var(--border)" }}>
                  <p className="label !mb-1">manual secret</p>
                  <p className="mono text-[13px] break-all tracking-widest" style={{ color: "var(--text)" }}>
                    {totpSecret.match(/.{1,4}/g)?.join(" ") ?? totpSecret}
                  </p>
                  {totpUri && (
                    <a href={totpUri} className="mono text-[10px] mt-2 inline-block underline decoration-dotted" style={{ color: "var(--violet-soft)" }}>
                      open otpauth:// URI
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input mono tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  />
                  <button type="button" onClick={totpConfirm} disabled={totpCode.length !== 6} className="btn btn-emerald mono">
                    confirm
                  </button>
                </div>
              </div>
            )}

            {totpEnabled && (
              <div className="space-y-3">
                <p className="mono text-[11px]" style={{ color: "var(--text-dim)" }}>
                  Every login now challenges a 6-digit code. Disabling requires
                  a valid current code.
                </p>
                <div className="flex gap-2">
                  <input
                    className="input mono tracking-[0.5em]"
                    placeholder="current code"
                    maxLength={6}
                    inputMode="numeric"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                  />
                  <button type="button" onClick={totpDisable} disabled={disableCode.length !== 6} className="btn btn-danger mono">
                    disable
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--violet-soft)" }}>
                🗝 server identity key (ECDSA prime256v1)
              </p>
              <Badge tone="violet">{config?.keyFingerprint ?? "…"}</Badge>
            </div>
            <p className="mono text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Embed this public key in compiled clients. It verifies the
              server's signature during the ephemeral ECDH handshake — even a
              root-CA MITM proxy cannot forge it.
            </p>
            <textarea
              readOnly
              rows={5}
              className="input mono !text-[10px] mt-3"
              value={config?.publicKeyPem ?? "loading…"}
            />
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={copyKey} className="btn btn-ghost mono flex-1">
                copy PEM
              </button>
              <button type="button" onClick={downloadKey} className="btn btn-ghost mono flex-1">
                download .pem
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
