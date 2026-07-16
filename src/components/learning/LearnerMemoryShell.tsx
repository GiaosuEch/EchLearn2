import { useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import {
  createInMemoryStorageAdapter,
  deleteLearnerMemory,
  disableLearnerMemory,
  enableLearnerMemory,
  exportLearnerMemory,
  getSafeLocalStorageAdapter,
  readLearnerMemoryRecord,
  type LearnerMemoryStorageAdapter,
} from '../../platform/learning/learnerMemoryStore.ts';
import { createLearnerMemoryViewModel } from '../../platform/learning/learnerMemoryViewModel.ts';
import type { LearnerMemoryRecord } from '../../platform/learning/learnerMemoryTypes.ts';

export interface LearnerMemoryShellProps {
  storage?: LearnerMemoryStorageAdapter;
  initialTargetLanguage?: string;
  initialNativeLanguage?: string;
}

function fallbackStorage(): LearnerMemoryStorageAdapter {
  return getSafeLocalStorageAdapter() ?? createInMemoryStorageAdapter();
}

export function LearnerMemoryShell({
  storage = fallbackStorage(),
  initialTargetLanguage = '',
  initialNativeLanguage = '',
}: LearnerMemoryShellProps) {
  const [record, setRecord] = useState<LearnerMemoryRecord>(() => readLearnerMemoryRecord(storage));
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const view = createLearnerMemoryViewModel(record);

  function handleEnable() {
    const next = enableLearnerMemory(storage, {
      targetLanguage: initialTargetLanguage || undefined,
      nativeLanguage: initialNativeLanguage || undefined,
    });
    setRecord(next);
    setExportedJson(null);
  }

  function handleDisable() {
    setRecord(disableLearnerMemory(storage));
    setExportedJson(null);
  }

  function handleDelete() {
    setRecord(deleteLearnerMemory(storage));
    setExportedJson(null);
  }

  function handleExport() {
    const exported = exportLearnerMemory(storage);
    setExportedJson(JSON.stringify(exported, null, 2));
  }

  return (
    <section className="max-w-3xl space-y-5" aria-label="Learner Memory">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
            <BrainCircuit size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-50">{view.heading}</h2>
            <p className="mt-1 text-sm leading-6 text-dark-300">
              Learner memory is local and consent-gated. No AI personalization is generated until an approved local model is ready.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-dark-300">{view.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-dark-400">Consent</dt>
            <dd className="text-dark-100">{view.consent ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="text-dark-400">Stored snapshot</dt>
            <dd className="text-dark-100">{view.hasSnapshot ? 'Present' : 'None'}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleEnable} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-400">Enable local learner memory</button>
          <button type="button" onClick={handleDisable} className="rounded-lg border border-dark-700 px-4 py-2 text-sm font-medium text-dark-100 hover:border-dark-500">Disable learner memory</button>
          <button type="button" onClick={handleDelete} className="rounded-lg border border-dark-700 px-4 py-2 text-sm font-medium text-dark-100 hover:border-dark-500">Delete learner memory</button>
          <button type="button" onClick={handleExport} className="rounded-lg border border-dark-700 px-4 py-2 text-sm font-medium text-dark-100 hover:border-dark-500">Export learner memory</button>
        </div>

        {exportedJson && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-dark-700 bg-dark-950 p-3 text-xs text-dark-200">
            {exportedJson}
          </pre>
        )}
      </div>
    </section>
  );
}

export default LearnerMemoryShell;
