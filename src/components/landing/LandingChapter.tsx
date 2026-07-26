import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { SectionEyebrow } from '../atelier/SectionEyebrow';

export type LandingChapterProps = {
  id: 'start' | 'practice' | 'evidence' | 'remember' | 'progress';
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: { label: string; to: string };
  index: number;
};

export function LandingChapter({
  id,
  eyebrow,
  title,
  children,
  action,
  index,
}: LandingChapterProps) {
  return (
    <motion.section
      id={id}
      className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_16%,transparent)] py-20 sm:py-28"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <div>
          <p className="mb-5 font-mono text-xs tracking-[0.18em] text-[var(--ech-achievement)]">
            {String(index).padStart(2, '0')}
          </p>
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.04em] text-[var(--ech-text)] sm:text-4xl">
            {title}
          </h2>
          {action && (
            <Link
              to={action.to}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_35%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--ech-text)] transition-colors hover:border-[var(--ech-action)] hover:text-[var(--ech-action)]"
            >
              {action.label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div>{children}</div>
      </div>
    </motion.section>
  );
}

export default LandingChapter;
