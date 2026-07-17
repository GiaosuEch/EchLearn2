import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  ChevronLeft,
  CircleSlash2,
  Clock3,
  Info,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import type { LocalAIReadinessStatus } from '../../platform/ai/localAiReadinessChecklist.ts';
import { buildLocalAIReadinessViewModel } from '../../platform/ai/localAiReadinessViewModel.ts';
import { buildLocalModelRuntimeDecisionViewModel } from '../../platform/ai/localModelRuntimeDecisionViewModel.ts';

const statusIcons: Record<LocalAIReadinessStatus, LucideIcon> = {
  completed: CheckCircle2,
  'pending-phase-4': Clock3,
  blocked: CircleSlash2,
  informational: Info,
};

const statusClasses: Record<LocalAIReadinessStatus, string> = {
  completed: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200',
  'pending-phase-4': 'border-amber-500/20 bg-amber-500/5 text-amber-200',
  blocked: 'border-rose-500/20 bg-rose-500/5 text-rose-200',
  informational: 'border-sky-500/20 bg-sky-500/5 text-sky-200',
};

export function LocalAIReadinessShell() {
  const viewModel = buildLocalAIReadinessViewModel();
  const runtimeDecision = buildLocalModelRuntimeDecisionViewModel();

  return (
    <section className="space-y-5" aria-labelledby="local-ai-readiness-heading">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 id="local-ai-readiness-heading" className="text-lg font-semibold text-dark-50">
              {viewModel.heading}
            </h2>
            <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.description}</p>
            <p className="mt-3 text-sm font-medium text-dark-100">{viewModel.currentStatusLabel}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{viewModel.currentStatusDescription}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.completed}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Pending Phase 4</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.pendingPhase4}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Blocked</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.blocked}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-4">
          <p className="text-xs uppercase tracking-wide text-dark-400">Informational</p>
          <p className="mt-2 text-2xl font-semibold text-dark-50">{viewModel.summary.informational}</p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sky-200">Phase 4 runtime ADR · {runtimeDecision.statusLabel}</p>
            <h3 className="mt-2 font-semibold text-dark-100">Browser-local runtime candidate research</h3>
            <p className="mt-2 text-sm leading-6 text-dark-300">{runtimeDecision.currentState}</p>
            <p className="mt-2 text-xs leading-5 text-dark-400">{runtimeDecision.candidateSummary}</p>
            <p className="mt-1 text-xs leading-5 text-dark-400">{runtimeDecision.rollbackSummary}</p>
          </div>
          <code className="rounded bg-dark-950 px-2 py-1 text-xs text-dark-300">{runtimeDecision.adrPath}</code>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
          <h3 className="font-semibold text-dark-100">Phase 3 closeout</h3>
          <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.phase3Description}</p>
        </div>
        <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
          <h3 className="font-semibold text-dark-100">Phase 4 boundary</h3>
          <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.phase4Description}</p>
          <p className="mt-2 text-xs leading-5 text-dark-400">{viewModel.preferredTierNote}</p>
        </div>
      </div>

      <div className="space-y-4">
        {viewModel.groups.map((group) => {
          const Icon = statusIcons[group.status];
          return (
            <div key={group.status} className="rounded-xl border border-dark-700 bg-dark-900 p-5">
              <div className="flex items-start gap-3">
                <Icon size={19} className="mt-0.5 text-dark-200" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-dark-100">{group.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-dark-400">{group.description}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <article key={item.id} className={`rounded-lg border p-4 ${statusClasses[item.status]}`}>
                    <h4 className="text-sm font-semibold">{item.label}</h4>
                    <p className="mt-2 text-xs leading-5 text-dark-300">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/app/ai/settings" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <Settings2 size={17} aria-hidden="true" />
          Open AI Settings and Privacy
        </Link>
        <Link to="/app/ai" className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-dark-200 hover:border-primary-500/40">
          <ChevronLeft size={17} aria-hidden="true" />
          Back to AI Coach Hub
        </Link>
      </div>
    </section>
  );
}

export default LocalAIReadinessShell;
