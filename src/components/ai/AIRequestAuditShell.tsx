import { useMemo, useState } from 'react';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import {
  createAIRequestAuditStore,
  type AIRequestAuditStore,
} from '../../platform/ai/aiRequestAuditStore.ts';
import { buildAIRequestAuditViewModel } from '../../platform/ai/aiRequestAuditViewModel.ts';

export interface AIRequestAuditShellProps {
  store?: AIRequestAuditStore;
}

export function AIRequestAuditShell({ store }: AIRequestAuditShellProps) {
  const auditStore = useMemo(
    () => store ?? createAIRequestAuditStore({ storage: window.localStorage }),
    [store],
  );
  const [entries, setEntries] = useState(() => auditStore.read());
  const viewModel = buildAIRequestAuditViewModel(entries);

  const clearHistory = () => {
    auditStore.clear();
    setEntries([]);
  };

  const exportMetadata = () => {
    const blob = new Blob([auditStore.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ai-request-audit.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5" aria-labelledby="ai-request-audit-heading">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="ai-request-audit-heading" className="text-lg font-semibold text-dark-50">{viewModel.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.description}</p>
            <p className="mt-2 text-xs text-dark-400">{viewModel.privacyNotice}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={exportMetadata} className="inline-flex items-center gap-2 rounded-lg border border-dark-600 px-3 py-2 text-sm font-medium text-dark-100 hover:border-primary-500/50">
            <Download size={16} aria-hidden="true" />
            Export metadata
          </button>
          <button type="button" onClick={clearHistory} disabled={entries.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-dark-600 px-3 py-2 text-sm font-medium text-dark-100 hover:border-red-400/50 disabled:cursor-not-allowed disabled:opacity-50">
            <Trash2 size={16} aria-hidden="true" />
            Clear history
          </button>
        </div>
      </div>

      {viewModel.entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dark-700 bg-dark-900/60 p-6 text-sm text-dark-400">
          {viewModel.emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {viewModel.entries.map((entry) => (
            <article key={entry.id} className="rounded-xl border border-dark-700 bg-dark-900 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-dark-50">{entry.featureLabel}</h3>
                  <p className="mt-1 text-xs text-dark-400">{entry.actionLabel} · {entry.source}</p>
                </div>
                <span className="rounded-full border border-dark-600 px-2.5 py-1 text-xs text-dark-200">{entry.statusLabel}</span>
              </div>

              <dl className="mt-4 grid gap-2 text-xs text-dark-300 sm:grid-cols-2">
                <div><dt className="font-semibold text-dark-200">Started</dt><dd>{entry.startedAt}</dd></div>
                <div><dt className="font-semibold text-dark-200">Duration</dt><dd>{entry.durationLabel}</dd></div>
                <div><dt className="font-semibold text-dark-200">Model</dt><dd>{entry.modelRequirementLabel}</dd></div>
                <div><dt className="font-semibold text-dark-200">Learner memory</dt><dd>{entry.learnerMemoryLabel}</dd></div>
                {entry.errorCode ? <div><dt className="font-semibold text-dark-200">Error code</dt><dd>{entry.errorCode}</dd></div> : null}
                <div><dt className="font-semibold text-dark-200">Safety flags</dt><dd>{entry.safetyFlags.join(', ')}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIRequestAuditShell;
