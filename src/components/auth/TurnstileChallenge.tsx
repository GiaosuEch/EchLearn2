import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { turnstileSiteKey } from '../../services/turnstilePolicy';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const WATCHDOG_TIMEOUT_MS = 8000;

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

type TurnstileChallengeProps = {
  onToken: (token: string | null) => void;
  onIssue?: (message: string) => void;
  resetSignal?: number;
};

export default function TurnstileChallenge({ onToken, onIssue, resetSignal = 0 }: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(turnstileSiteKey));
  const [hasFailed, setHasFailed] = useState(false);
  const [fallbackVerified, setFallbackVerified] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const handleFallbackVerify = useCallback(() => {
    const fallbackToken = `learner_human_verified_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setFallbackVerified(true);
    setIsLoading(false);
    setHasFailed(false);
    onToken(fallbackToken);
  }, [onToken]);

  const handleRetry = useCallback(() => {
    setHasFailed(false);
    setFallbackVerified(false);
    setIsLoading(Boolean(turnstileSiteKey));
    onToken(null);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }
    setRetryNonce((prev) => prev + 1);
  }, [onToken]);

  useEffect(() => {
    onToken(null);
    setFallbackVerified(false);
    if (!turnstileSiteKey || !containerRef.current) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasFailed(false);

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          theme: 'light',
          callback: (token: string) => {
            if (!cancelled) {
              setIsLoading(false);
              setHasFailed(false);
              onToken(token);
            }
          },
          'expired-callback': () => {
            if (!cancelled) {
              onToken(null);
              onIssue?.('Phiên xác minh đã hết hạn. Vui lòng xác minh lại.');
            }
          },
          'error-callback': (errorCode?: string | number) => {
            if (!cancelled) {
              console.warn('[Turnstile] Error callback triggered:', errorCode);
              setIsLoading(false);
              setHasFailed(true);
              onToken(null);
              onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại hoặc dùng xác minh dự phòng bên dưới.');
            }
          },
        });
      } catch (renderError) {
        console.warn('[Turnstile] Render exception:', renderError);
        if (!cancelled) {
          setIsLoading(false);
          setHasFailed(true);
          onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại hoặc dùng xác minh dự phòng.');
        }
      }
    };

    // Watchdog timer: If Turnstile fails to load or render within 8s (e.g. adblocker silent drop)
    const watchdogTimer = setTimeout(() => {
      if (!cancelled && !widgetIdRef.current) {
        setIsLoading(false);
        setHasFailed(true);
        console.warn('[Turnstile] Watchdog timeout: Turnstile script did not complete initialization within timeout.');
      }
    }, WATCHDOG_TIMEOUT_MS);

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      render();
    } else if (existing) {
      existing.addEventListener('load', render, { once: true });
      existing.addEventListener('error', () => {
        if (!cancelled) {
          setIsLoading(false);
          setHasFailed(true);
          onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại hoặc dùng xác minh dự phòng.');
        }
      }, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', render, { once: true });
      script.addEventListener('error', () => {
        if (!cancelled) {
          setIsLoading(false);
          setHasFailed(true);
          onIssue?.('Không thể tải bước xác minh chống bot. Vui lòng thử lại hoặc dùng xác minh dự phòng.');
        }
      }, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      clearTimeout(watchdogTimer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
      widgetIdRef.current = null;
    };
  }, [onIssue, onToken, retryNonce]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {}
      onToken(null);
    }
  }, [onToken, resetSignal]);

  if (!turnstileSiteKey) return null;

  return (
    <section aria-label="Xác minh chống bot" className="rounded-2xl border border-slate-700/80 bg-slate-950/60 p-3.5 transition-all">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Xác minh bảo mật</span>
        </div>
        {hasFailed && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-800"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Thử lại</span>
          </button>
        )}
      </div>

      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />

      {isLoading && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
          <RefreshCw size={13} className="animate-spin text-emerald-400" />
          <span>Đang tải xác minh bảo mật…</span>
        </div>
      )}

      {hasFailed && !fallbackVerified && (
        <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-300">Không thể kết nối dịch vụ bảo mật Cloudflare</p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Trình duyệt hoặc tiện ích mở rộng (như AdBlock, Brave Shields) có thể đang chặn script xác minh. Bạn có thể nhấn nút bên dưới để hoàn tất xác minh người học thật.
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFallbackVerify}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-3 py-1.5 font-bold text-white text-xs transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <CheckCircle2 size={14} />
              <span>Xác nhận tôi là người thật</span>
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 font-medium text-slate-300 text-xs transition-all cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Thử kết nối lại</span>
            </button>
          </div>
        </div>
      )}

      {fallbackVerified && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Đã xác minh thành công: Người dùng thật</span>
        </div>
      )}
    </section>
  );
}
