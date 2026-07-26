import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Headphones, Mic, PenLine, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

export type StudyConstellationProps = {
  className?: string;
};

type StudyArtefact = {
  label: string;
  title: string;
  detail: string;
  to: string;
  Icon: LucideIcon;
  accent: string;
  placement: string;
};

const artefacts: StudyArtefact[] = [
  {
    label: 'Listen',
    title: 'Catch the shape of a phrase.',
    detail: 'A focused listening session with room to replay and respond.',
    to: '/app/listening',
    Icon: Headphones,
    accent: 'text-[var(--cinematic-emerald-400)]',
    placement: '[grid-area:listen] sm:-translate-y-3',
  },
  {
    label: 'Speak',
    title: 'Give the idea a voice.',
    detail: 'Practise a clear response and keep the next prompt close.',
    to: '/app/speaking',
    Icon: Mic,
    accent: 'text-[var(--cinematic-coral-400)]',
    placement: '[grid-area:speak] sm:translate-y-5 sm:-translate-x-2',
  },
  {
    label: 'Write',
    title: 'Make one useful sentence.',
    detail: 'Turn a new expression into language you can return to.',
    to: '/app/writing',
    Icon: PenLine,
    accent: 'text-[var(--cinematic-gold)]',
    placement: '[grid-area:write] sm:translate-y-2',
  },
  {
    label: 'Review',
    title: 'Leave a way back.',
    detail: 'Revisit vocabulary when your activity gives you a cue.',
    to: '/app/vocabulary',
    Icon: RotateCcw,
    accent: 'text-[var(--cinematic-emerald-400)]',
    placement: '[grid-area:review] sm:-translate-x-3 sm:-translate-y-1',
  },
];

export function StudyConstellation({ className }: StudyConstellationProps) {
  const classes = [
    'cinematic-motion relative',
    'grid min-h-[27rem] grid-cols-[1.08fr_0.92fr] grid-rows-[1fr_1fr]',
    'gap-3 [grid-template-areas:"listen_speak"_"review_write"] sm:min-h-[30rem] sm:gap-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-label="Four ways to practise">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[18%_24%_18%_20%] rounded-full border border-dashed border-[color-mix(in_srgb,var(--cinematic-emerald-400)_19%,transparent)]"
      />
      {artefacts.map(({ label, title, detail, to, Icon, accent, placement }) => (
        <Link
          key={label}
          to={to}
          className={`group relative z-10 flex min-h-40 flex-col justify-between overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_20%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-panel-bg)_92%,var(--cinematic-ink))] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--cinematic-ink)_48%,transparent)] outline-offset-4 transition-[border-color,transform,background-color] duration-300 hover:border-[color-mix(in_srgb,var(--cinematic-emerald-400)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--cinematic-forest-800)_92%,var(--cinematic-ink))] sm:min-h-48 sm:p-5 ${placement}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-full border border-current/30 bg-[color-mix(in_srgb,currentColor_12%,transparent)] ${accent}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="text-[var(--ech-text-muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
          <div>
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--ech-text-muted)]">{label}</p>
            <h3 className="mt-2 max-w-[15rem] text-base font-semibold leading-5 tracking-[-0.025em] text-[var(--ech-text)] sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 max-w-[18rem] text-xs leading-5 text-[var(--ech-text-muted)] sm:text-sm">{detail}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default StudyConstellation;
