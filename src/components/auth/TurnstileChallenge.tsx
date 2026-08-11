import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getTurnstileSiteKey } from '../../services/turnstilePolicy';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const turnstileSiteKey = getTurnstileSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY);

type TurnstileChallengeProps = {
  onToken: (token: string | null) => void;
  onIssue?: (message: string) => void;
  resetSignal?: number;
};

export default function TurnstileChallenge({ onToken, onIssue, resetSignal = 0 }: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(turnstileSiteKey));

  useEffect(() => {
    onToken(null);
    if (!turnstileSiteKey || !containerRef.current) return;

    let cancelled = false;
    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token: string) => {
          if (!cancelled) {
            setIsLoading(false);
            onToken(token);
          }
        },
        'expired-callback': () => {
          if (!cancelled) {
            onToken(null);
            onIssue?.('Phiên xác minh đã hết hạn. Vui lòng xác minh lại.');
          }
        },
        'error-callback': () => {
          if (!cancelled) {
            setIsLoading(false);
            onToken(null);
            onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại.');
          }
        },
      });
      setIsLoading(false);
    };

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) render();
    else if (existing) existing.addEventListener('load', render, { once: true });
    else {
      const script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', render, { once: true });
      script.addEventListener('error', () => onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại.'), { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [onIssue, onToken]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onToken(null);
    }
  }, [onToken, resetSignal]);

  if (!turnstileSiteKey) return null;

  return (
    <section aria-label="Xác minh chống bot" className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><ShieldCheck size={15} className="text-emerald-600" /> Xác minh bảo mật</div>
      <div ref={containerRef} />
      {isLoading && <p className="mt-2 text-xs text-slate-500">Đang tải xác minh bảo mật…</p>}
    </section>
  );
}
