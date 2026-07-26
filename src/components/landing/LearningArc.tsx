import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Check, Compass, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

export type LearningArcProps = {
  className?: string;
};

type ArcStop = {
  label: string;
  title: string;
  detail: string;
  to: string;
  Icon: LucideIcon;
};

const stops: ArcStop[] = [
  {
    label: 'Choose a session',
    title: 'Name what feels possible today.',
    detail: 'Pick a language or a practice room that matches the time you have.',
    to: '/languages',
    Icon: Compass,
  },
  {
    label: 'Complete practice',
    title: 'Stay with one small exchange.',
    detail: 'Listen, speak, read, or write with a clear next prompt in reach.',
    to: '/app/practice',
    Icon: Check,
  },
  {
    label: 'Return for review',
    title: 'Let your activity point the way back.',
    detail: 'Revisit vocabulary and practice cues when you are ready to continue.',
    to: '/app/vocabulary',
    Icon: RotateCcw,
  },
];

export function LearningArc({ className }: LearningArcProps) {
  const classes = ['cinematic-motion relative', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-6 bottom-6 w-px bg-[color-mix(in_srgb,var(--cinematic-gold)_34%,transparent)] sm:left-[16%] sm:right-[16%] sm:top-6 sm:bottom-auto sm:h-px sm:w-auto"
      />
      <ol className="relative grid gap-8 sm:grid-cols-3 sm:gap-0" aria-label="Your learning path">
        {stops.map(({ label, title, detail, to, Icon }) => (
          <li key={label} className="relative flex gap-4 sm:block sm:px-3 first:sm:pl-0 last:sm:pr-0">
            <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--cinematic-gold)_54%,transparent)] bg-[var(--cinematic-ink)] text-[var(--cinematic-gold)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--cinematic-ink)_86%,transparent)] sm:mb-6">
              <Icon size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0 pb-1">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--cinematic-gold)]">{label}</p>
              <h3 className="mt-2 max-w-[16rem] text-lg font-semibold leading-6 tracking-[-0.03em] text-[var(--ech-text)]">
                {title}
              </h3>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--ech-text-muted)]">{detail}</p>
              <Link
                to={to}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_30%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--ech-text)] outline-offset-4 transition-colors hover:border-[var(--cinematic-emerald-400)] hover:text-[var(--cinematic-emerald-400)]"
              >
                Open this step
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default LearningArc;
