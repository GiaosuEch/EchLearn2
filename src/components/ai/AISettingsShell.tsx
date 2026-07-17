import { useMemo, useState } from 'react';
import {
  BrainCircuit,
  ChevronLeft,
  Gauge,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  createAISettingsStore,
  createInMemoryAISettingsStorageAdapter,
  getSafeAISettingsLocalStorageAdapter,
  type AISettingsStorageAdapter,
} from '../../platform/ai/aiSettingsStore.ts';
import type { PreferredLocalAITier } from '../../platform/ai/aiSettingsTypes.ts';
import { buildAISettingsViewModel } from '../../platform/ai/aiSettingsViewModel.ts';
import {
  createInMemoryStorageAdapter,
  getSafeLocalStorageAdapter,
  readLearnerMemoryRecord,
  type LearnerMemoryStorageAdapter,
} from '../../platform/learning/learnerMemoryStore.ts';

export interface AISettingsShellProps {
  storage?: AISettingsStorageAdapter;
  learnerMemoryStorage?: LearnerMemoryStorageAdapter;
}

function fallbackSettingsStorage(): AISettingsStorageAdapter {
  return getSafeAISettingsLocalStorageAdapter() ?? createInMemoryAISettingsStorageAdapter();
}

function fallbackLearnerMemoryStorage(): LearnerMemoryStorageAdapter {
  return getSafeLocalStorageAdapter() ?? createInMemoryStorageAdapter();
}

export function AISettingsShell({
  storage,
  learnerMemoryStorage,
}: AISettingsShellProps) {
  const settingsStore = useMemo(
    () => createAISettingsStore({ storage: storage ?? fallbackSettingsStorage() }),
    [storage],
  );
  const memoryStorage = useMemo(
    () => learnerMemoryStorage ?? fallbackLearnerMemoryStorage(),
    [learnerMemoryStorage],
  );
  const [settings, setSettings] = useState(() => settingsStore.read());
  const learnerMemory = readLearnerMemoryRecord(memoryStorage);
  const viewModel = buildAISettingsViewModel(settings, learnerMemory);

  function updateTier(preferredLocalAiTier: PreferredLocalAITier) {
    setSettings(settingsStore.update({ preferredLocalAiTier }));
  }

  function updateShowUnavailable(showUnavailableAiFeatures: boolean) {
    setSettings(settingsStore.update({ showUnavailableAiFeatures }));
  }

  function updateAuditPreference(allowMetadataAuditLog: boolean) {
    setSettings(settingsStore.update({ allowMetadataAuditLog }));
  }

  return (
    <section className="space-y-5" aria-labelledby="ai-settings-heading">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="ai-settings-heading" className="text-lg font-semibold text-dark-50">{viewModel.heading}</h2>
            <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.description}</p>
            <p className="mt-2 text-sm font-medium text-dark-100">{viewModel.localAIStatusLabel}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{viewModel.localAIStatusDescription}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Registered features</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.totalFeatures}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Require local model</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.modelRequiredFeatures}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Support learner memory</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.learnerMemorySupportedFeatures}</p>
        </div>
      </div>

      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-center gap-2 text-dark-100">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <h3 className="font-semibold">Local preferences</h3>
        </div>

        <label className="mt-4 block text-sm text-dark-200" htmlFor="preferred-local-ai-tier">
          Preferred local AI tier
        </label>
        <select
          id="preferred-local-ai-tier"
          value={settings.preferredLocalAiTier}
          onChange={(event) => updateTier(event.target.value as PreferredLocalAITier)}
          className="mt-2 w-full rounded-lg border border-dark-600 bg-dark-950 px-3 py-2 text-sm text-dark-100"
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
        </select>
        <p className="mt-2 text-xs text-dark-400">{viewModel.preferredTierLabel}. {viewModel.preferredTierDescription}</p>

        <label className="mt-5 flex items-start gap-3 text-sm text-dark-200">
          <input
            type="checkbox"
            checked={settings.showUnavailableAiFeatures}
            onChange={(event) => updateShowUnavailable(event.target.checked)}
            className="mt-1"
          />
          <span>Show unavailable-safe AI features in platform navigation.</span>
        </label>

        <label className="mt-4 flex items-start gap-3 text-sm text-dark-200">
          <input
            type="checkbox"
            checked={settings.allowMetadataAuditLog}
            onChange={(event) => updateAuditPreference(event.target.checked)}
            className="mt-1"
          />
          <span>Allow local metadata audit logging when request instrumentation is connected.</span>
        </label>
        <p className="mt-2 text-xs text-dark-400">{viewModel.auditPreferenceLabel}. {viewModel.auditPreferenceDescription}</p>
      </div>

      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-center gap-2 text-dark-100">
          <BrainCircuit size={18} aria-hidden="true" />
          <h3 className="font-semibold">Learner Memory consent</h3>
        </div>
        <p className="mt-3 text-sm text-dark-200">Current state: {viewModel.learnerMemoryConsentLabel}</p>
        <p className="mt-1 text-xs leading-5 text-dark-400">{viewModel.learnerMemoryConsentDescription}</p>
        <Link to="/app/learner-memory" className="mt-4 inline-flex text-sm font-medium text-primary-300 hover:text-primary-200">
          Manage Learner Memory
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/app/ai/readiness" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <Gauge size={17} aria-hidden="true" />
          Local AI Readiness
        </Link>
        <Link to="/app/ai/audit" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <ScrollText size={17} aria-hidden="true" />
          Open metadata audit log
        </Link>
        <Link to="/app/ai" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <ChevronLeft size={17} aria-hidden="true" />
          Back to AI Coach Hub
        </Link>
      </div>
    </section>
  );
}

export default AISettingsShell;
