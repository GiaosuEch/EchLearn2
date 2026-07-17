import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Brain,
  BrainCircuit,
  Mic,
  PenTool,
  ShieldCheck,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import type { AIFeatureId } from '../../platform/ai/aiFeatureRegistry.ts';
import { buildAICoachHubViewModel } from '../../platform/ai/aiFeatureRegistryViewModel.ts';

const featureIcons: Record<AIFeatureId, LucideIcon> = {
  'ai-tutor': Brain,
  'practice-generator': WandSparkles,
  'learner-memory': BrainCircuit,
  'writing-coach': PenTool,
  'speaking-coach': Mic,
};

export function AICoachHubShell() {
  const viewModel = buildAICoachHubViewModel();

  return (
    <section className="space-y-5" aria-labelledby="ai-coach-hub-heading">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-300">{viewModel.eyebrow}</p>
            <h2 id="ai-coach-hub-heading" className="mt-1 text-lg font-semibold text-dark-50">{viewModel.foundationHeading}</h2>
            <p className="mt-2 text-sm leading-6 text-dark-300">{viewModel.foundationDescription}</p>
            <p className="mt-2 text-xs text-dark-400">{viewModel.noOutputNotice}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {viewModel.features.map((feature) => {
          const Icon = featureIcons[feature.id];

          return (
            <Link
              key={feature.id}
              to={feature.route}
              data-feature-id={feature.id}
              className="group rounded-xl border border-dark-700 bg-dark-900 p-5 transition hover:border-primary-500/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-50">{feature.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-dark-300">{feature.description}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="mt-1 shrink-0 text-dark-500 transition group-hover:translate-x-0.5 group-hover:text-primary-300" aria-hidden="true" />
              </div>

              <div className="mt-4 space-y-2 border-t border-dark-800 pt-4 text-xs">
                <p className="text-dark-200"><span className="font-semibold">Availability:</span> {feature.availabilityLabel}</p>
                <p className="text-dark-400">{feature.availabilityDescription}</p>
                <p className="text-dark-300"><span className="font-semibold">Learner memory:</span> {feature.learnerMemoryLabel}</p>
                <p className="text-dark-400">{feature.safetyNote}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default AICoachHubShell;
