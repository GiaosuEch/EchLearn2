import type { AIReadinessTone } from '../../platform/ai/aiReadinessViewModel.ts';

interface AIStatusBadgeProps {
  label: string;
  tone: AIReadinessTone;
}

const toneClasses: Record<AIReadinessTone, string> = {
  positive: 'border-primary-500/40 bg-primary-500/10 text-primary-300',
  neutral: 'border-dark-600 bg-dark-800 text-dark-200',
  warning: 'border-accent-500/40 bg-accent-500/10 text-accent-400',
  unavailable: 'border-error/40 bg-error/10 text-red-200',
};

export function AIStatusBadge({ label, tone }: AIStatusBadgeProps) {
  return (
    <span
      role="status"
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
