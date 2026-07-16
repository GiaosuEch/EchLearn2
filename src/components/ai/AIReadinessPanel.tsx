import { useId } from 'react';

import {
  AI_READINESS_COPY,
  buildAIReadinessViewModel,
  type AIReadinessSnapshot,
} from '../../platform/ai/aiReadinessViewModel.ts';
import { AIStatusBadge } from './AIStatusBadge.tsx';

export interface AIReadinessPanelProps {
  snapshot?: AIReadinessSnapshot;
  loading?: boolean;
  error?: string;
  className?: string;
}

function LoadingState({ className }: { className: string }) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={`rounded-xl border border-dark-700 bg-dark-900 p-5 ${className}`}
    >
      <h2 className="text-lg font-semibold text-dark-50">{AI_READINESS_COPY.loadingHeading}</h2>
      <p className="mt-2 text-sm text-dark-300">{AI_READINESS_COPY.loadingDescription}</p>
    </section>
  );
}

function ErrorState({ message, className }: { message: string; className: string }) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border border-error/40 bg-error/10 p-5 ${className}`}
    >
      <h2 className="text-lg font-semibold text-dark-50">{AI_READINESS_COPY.errorHeading}</h2>
      <p className="mt-2 text-sm text-dark-200">{message || AI_READINESS_COPY.errorDescription}</p>
      <p className="mt-2 text-xs text-dark-400">{AI_READINESS_COPY.noOutputNotice}</p>
    </section>
  );
}

export function AIReadinessPanel({
  snapshot,
  loading = false,
  error,
  className = '',
}: AIReadinessPanelProps) {
  const instanceId = useId();

  if (loading) return <LoadingState className={className} />;
  if (error) return <ErrorState message={error} className={className} />;
  if (!snapshot) {
    return <ErrorState message={AI_READINESS_COPY.errorDescription} className={className} />;
  }

  const view = buildAIReadinessViewModel(snapshot);
  const headingId = `${instanceId}-heading`;
  const limitationsId = `${instanceId}-limitations`;

  return (
    <section
      aria-labelledby={headingId}
      className={`w-full rounded-xl border border-dark-700 bg-dark-900 p-5 text-dark-100 sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 border-b border-dark-700 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">{view.eyebrow}</p>
          <h2 id={headingId} className="mt-2 text-xl font-semibold text-dark-50">{view.heading}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-dark-300">{view.summary}</p>
        </div>
        <AIStatusBadge label={view.statusLabel} tone={view.tone} />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {view.items.map(item => (
          <div key={item.id} className="min-w-0 rounded-lg border border-dark-700 bg-dark-800/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-dark-400">{item.label}</dt>
            <dd className="mt-2 text-sm font-semibold text-dark-100">{item.value}</dd>
            {item.detail && <p className="mt-1 text-xs leading-5 text-dark-400">{item.detail}</p>}
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-dark-700 pt-5" aria-labelledby={limitationsId}>
        <h3 id={limitationsId} className="text-sm font-semibold text-dark-100">{view.limitationsHeading}</h3>
        {view.limitations.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-dark-300">
            {view.limitations.map(limitation => <li key={limitation}>{limitation}</li>)}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-dark-300">No current capability limitations were reported.</p>
        )}
      </div>

      <p className="mt-5 rounded-lg border border-dark-700 bg-dark-950/60 px-3 py-2 text-xs text-dark-400">
        {view.noOutputNotice}
      </p>
    </section>
  );
}
