import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type CinematicChapterProps = {
  id: 'start' | 'practice' | 'evidence' | 'remember' | 'progress';
  index: number;
  eyebrow: string;
  title: string;
  tone: 'forest' | 'studio' | 'quiet' | 'luminous';
  children: ReactNode;
};

const toneClasses: Record<CinematicChapterProps['tone'], string> = {
  forest: 'bg-[color-mix(in_srgb,var(--cinematic-forest-800)_58%,var(--cinematic-ink))]',
  studio: 'bg-[color-mix(in_srgb,var(--cinematic-forest-800)_74%,var(--cinematic-ink))]',
  quiet: 'bg-[color-mix(in_srgb,var(--cinematic-ink)_86%,var(--cinematic-forest-800))]',
  luminous: 'bg-[color-mix(in_srgb,var(--cinematic-forest-800)_64%,var(--cinematic-emerald-400)_8%)]',
};

const chapterVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function CinematicChapter({
  id,
  index,
  eyebrow,
  title,
  tone,
  children,
}: CinematicChapterProps) {
  const prefersReducedMotion = useReducedMotion();
  const initialState = prefersReducedMotion ? 'visible' : 'hidden';

  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-chapter-title`}
      className={`cinematic-motion scroll-mt-24 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_17%,transparent)] py-20 sm:py-28 ${toneClasses[tone]}`}
      initial={initialState}
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      variants={chapterVariants}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const }
      }
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(12rem,0.66fr)_minmax(0,1.34fr)] lg:gap-16">
        <header className="max-w-lg">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--cinematic-gold)]" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </p>
          <p className="mt-5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--ech-text-muted)]">
            {eyebrow}
          </p>
          <h2
            id={`${id}-chapter-title`}
            className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-[-0.045em] text-[var(--ech-text)] sm:text-4xl"
          >
            {title}
          </h2>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </motion.section>
  );
}

export default CinematicChapter;
