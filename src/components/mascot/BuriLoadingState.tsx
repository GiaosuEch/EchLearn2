import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import EchBuriAnimated from './EchBuriAnimated';

interface BuriLoadingStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  slowAfterMs?: number;
  className?: string;
}

/** A calm, recoverable loading state used while a learning screen is prepared. */
export function BuriLoadingState({
  title = 'Buri đang chuẩn bị bài học',
  description = 'Chỉ mất một chút thôi.',
  retryLabel = 'Tải lại trang',
  onRetry,
  slowAfterMs = 8_000,
  className = '',
}: BuriLoadingStateProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSlow(true), slowAfterMs);
    return () => window.clearTimeout(timer);
  }, [slowAfterMs]);

  const retry = onRetry ?? (() => window.location.reload());

  return (
    <section className={`grid min-h-dvh place-items-center bg-[var(--ech-bg)] px-5 py-10 text-center ${className}`} role="status" aria-live="polite" aria-busy="true">
      <div className="w-full max-w-sm rounded-[2rem] border border-emerald-100 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:bg-slate-900 sm:px-8">
        <div className="mx-auto grid h-36 w-36 place-items-center rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10">
          <EchBuriAnimated size={128} state="loading" />
        </div>
        <p className="mt-6 text-lg font-black tracking-tight text-slate-950 dark:text-white">{isSlow ? 'Kết nối đang chậm hơn thường lệ' : title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{isSlow ? 'Buri vẫn ở đây. Bạn có thể tải lại để lấy phiên bản mới nhất.' : description}</p>
        {isSlow ? (
          <button type="button" onClick={retry} className="mx-auto mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
            <RefreshCcw size={16} aria-hidden="true" /> {retryLabel}
          </button>
        ) : (
          <div className="mx-auto mt-6 flex w-16 justify-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </section>
  );
}

export default BuriLoadingState;
