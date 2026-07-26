import { ArrowDown, ArrowRight, Headphones, Mic, RotateCcw, Volume2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { CinematicHero } from '../../components/landing/CinematicHero';

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const sectionTransition = { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const };

function WordmarkBreak() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="meet"
      aria-label="Meet Echlearn"
      className="relative overflow-hidden border-y border-white/10 bg-[var(--cinematic-emerald-400)] px-5 py-16 text-[var(--cinematic-ink)] sm:px-8 sm:py-24"
      initial={prefersReducedMotion ? false : { opacity: 0.5, scale: 0.98 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.34 }}
      transition={prefersReducedMotion ? { duration: 0 } : sectionTransition}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,transparent_0,transparent_14px,currentColor_15px,transparent_16px)]" />
      <div className="relative mx-auto max-w-[92rem]">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.26em]">Meet Echlearn</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="max-w-4xl text-[clamp(3.25rem,11vw,11rem)] font-semibold leading-[0.76] tracking-[-0.09em]">
            Make room<br />
            for new words.
          </p>
          <ArrowDown className="mb-1 hidden shrink-0 sm:block" size={32} aria-hidden="true" />
        </div>
      </div>
    </motion.section>
  );
}

function ListeningScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="listen"
      aria-labelledby="listen-title"
      className="cinematic-motion relative overflow-hidden bg-[var(--cinematic-ink)] px-5 py-24 sm:px-8 sm:py-36"
      initial={prefersReducedMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={reveal}
      transition={prefersReducedMotion ? { duration: 0 } : sectionTransition}
    >
      <div aria-hidden="true" className="absolute -right-28 top-20 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--cinematic-gold)_24%,transparent)_0,transparent_68%)] blur-2xl" />
      <div className="relative mx-auto grid max-w-[92rem] gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-end lg:gap-24">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--cinematic-gold)]">01 / Listen in full color</p>
          <h2 id="listen-title" className="mt-7 max-w-3xl text-[clamp(3.2rem,7vw,7.8rem)] font-semibold leading-[0.84] tracking-[-0.08em] text-[var(--ech-text)]">
            Hear the feeling<br />
            before the rule.
          </h2>
          <p className="mt-8 max-w-md text-lg leading-8 text-[color-mix(in_srgb,var(--ech-text)_70%,transparent)]">
            Start with words people actually say. Replay the moment, catch its shape, then answer in your own time.
          </p>
          <Link
            to="/app/listening"
            className="mt-9 inline-flex min-h-12 items-center gap-3 border-b border-[var(--cinematic-gold)] pb-2 text-sm font-bold text-[var(--ech-text)] transition-colors hover:text-[var(--cinematic-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cinematic-gold)]"
          >
            Open a listening room <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative ml-auto w-full max-w-xl border-y border-white/15 py-7 sm:py-10">
          <div className="flex items-center justify-between text-[0.68rem] font-mono uppercase tracking-[0.18em] text-[var(--ech-text-muted)]">
            <span>Japanese / everyday</span>
            <span>00:12</span>
          </div>
          <p lang="ja" className="mt-10 text-[clamp(2.65rem,5.5vw,5.5rem)] font-medium leading-none tracking-[-0.06em] text-[var(--ech-text)]">また会える？</p>
          <p className="mt-4 text-lg text-[var(--cinematic-gold)]">Will I see you again?</p>
          <div className="mt-12 flex items-center gap-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--cinematic-gold)] text-[var(--cinematic-ink)]">
              <Volume2 size={20} aria-hidden="true" />
            </span>
            <div className="flex h-9 flex-1 items-center gap-1" aria-hidden="true">
              {[14, 26, 18, 34, 11, 23, 38, 20, 31, 13, 29, 18, 36, 16, 25, 12, 31, 19].map((height, index) => (
                <span
                  key={index}
                  className="cinematic-wave w-full origin-center rounded-full bg-[color-mix(in_srgb,var(--cinematic-gold)_70%,transparent)]"
                  data-wave-index={index}
                  style={{ height }}
                />
              ))}
            </div>
          </div>
          <p className="mt-7 max-w-sm text-sm leading-6 text-[var(--ech-text-muted)]">One phrase. A real voice. Enough space to make it stick.</p>
        </div>
      </div>
    </motion.section>
  );
}

function SpeakingScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="speak"
      aria-labelledby="speak-title"
      className="relative overflow-hidden bg-[color-mix(in_srgb,var(--cinematic-forest-800)_84%,var(--cinematic-ink))] px-5 py-24 sm:px-8 sm:py-36"
      initial={prefersReducedMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={reveal}
      transition={prefersReducedMotion ? { duration: 0 } : sectionTransition}
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--cinematic-emerald-400),transparent)]" />
      <div className="relative mx-auto max-w-[92rem]">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
          <div className="lg:pt-12">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--cinematic-emerald-400)]">02 / Say what you mean</p>
            <h2 id="speak-title" className="mt-7 text-[clamp(3rem,6vw,6.7rem)] font-semibold leading-[0.84] tracking-[-0.08em] text-[var(--ech-text)]">
              Your voice<br />
              belongs here.
            </h2>
          </div>

          <div className="border-l border-[color-mix(in_srgb,var(--cinematic-emerald-400)_48%,transparent)] pl-6 sm:pl-10 lg:pl-16">
            <p className="max-w-xl text-xl leading-8 text-[color-mix(in_srgb,var(--ech-text)_78%,transparent)] sm:text-2xl sm:leading-9">
              A good practice session should feel like a conversation you are slowly growing into—not an exam you are trying to survive.
            </p>
            <div className="mt-14 grid gap-8 border-t border-white/15 pt-7 sm:grid-cols-[auto_1fr] sm:items-end">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-[color-mix(in_srgb,var(--cinematic-emerald-400)_58%,transparent)] text-[var(--cinematic-emerald-400)]">
                <Mic size={26} aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[0.67rem] uppercase tracking-[0.2em] text-[var(--ech-text-muted)]">Today’s prompt</p>
                <p className="mt-3 max-w-2xl text-2xl font-medium leading-tight tracking-[-0.04em] text-[var(--ech-text)] sm:text-4xl">“Tell me about the place you go when you need a reset.”</p>
                <Link
                  to="/app/speaking"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--cinematic-emerald-400)] transition-transform hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cinematic-emerald-400)]"
                >
                  Try the prompt <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ReturnScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id="return"
      aria-labelledby="return-title"
      className="relative overflow-hidden bg-[var(--ech-text)] px-5 py-24 text-[var(--cinematic-ink)] sm:px-8 sm:py-36"
      initial={prefersReducedMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={reveal}
      transition={prefersReducedMotion ? { duration: 0 } : sectionTransition}
    >
      <div className="mx-auto max-w-[92rem]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--cinematic-ink)_65%,transparent)]">03 / Keep it close</p>
            <h2 id="return-title" className="mt-7 max-w-5xl text-[clamp(3.25rem,7.8vw,8.5rem)] font-semibold leading-[0.82] tracking-[-0.085em]">
              The best review<br />
              is a return, not a reset.
            </h2>
          </div>
          <div className="max-w-md border-t border-[color-mix(in_srgb,var(--cinematic-ink)_28%,transparent)] pt-7 lg:ml-auto">
            <RotateCcw size={22} aria-hidden="true" />
            <p className="mt-5 text-lg leading-8 text-[color-mix(in_srgb,var(--cinematic-ink)_70%,transparent)]">
              Echlearn brings the expressions you nearly know back at the moment they can become yours.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-6 border-t border-[color-mix(in_srgb,var(--cinematic-ink)_25%,transparent)] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em]">A practice that remembers you</p>
          <Link
            to="/app/vocabulary"
            className="inline-flex min-h-12 items-center justify-center gap-3 bg-[var(--cinematic-ink)] px-6 text-sm font-bold text-[var(--ech-text)] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cinematic-ink)]"
          >
            Return to your words <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

function Invitation() {
  return (
    <section id="begin" className="relative overflow-hidden bg-[var(--cinematic-ink)] px-5 py-24 sm:px-8 sm:py-36">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_srgb,var(--cinematic-emerald-400)_30%,transparent),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[92rem] flex-col items-start">
        <Headphones size={24} className="text-[var(--cinematic-gold)]" aria-hidden="true" />
        <p className="mt-8 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.23em] text-[var(--cinematic-gold)]">Your next scene is ready</p>
        <h2 className="mt-6 max-w-5xl text-[clamp(3.5rem,9.4vw,10rem)] font-semibold leading-[0.8] tracking-[-0.09em] text-[var(--ech-text)]">
          Start where<br />
          you are.
        </h2>
        <p className="mt-8 max-w-lg text-lg leading-8 text-[color-mix(in_srgb,var(--ech-text)_70%,transparent)]">
          Choose a language, make one useful attempt, and let tomorrow have something to come back to.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/register" className="inline-flex min-h-14 items-center justify-center gap-3 bg-[var(--cinematic-emerald-400)] px-7 text-sm font-bold text-[var(--cinematic-ink)] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cinematic-emerald-400)]">
            Begin learning <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/languages" className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 text-sm font-bold text-[var(--ech-text)] transition-colors hover:border-[var(--cinematic-gold)] hover:text-[var(--cinematic-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cinematic-gold)]">
            Find your language
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main id="main-content" className="cinematic-landing overflow-x-hidden bg-[var(--cinematic-ink)] text-[var(--ech-text)]">
      <CinematicHero />
      <WordmarkBreak />
      <ListeningScene />
      <SpeakingScene />
      <ReturnScene />
      <Invitation />
    </main>
  );
}
