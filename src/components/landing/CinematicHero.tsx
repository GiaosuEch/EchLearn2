import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, useMotionValue } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { CinematicBackdrop } from './CinematicBackdrop';
import { EchBuriPresence } from '../atelier/EchBuriPresence';

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'Languages', to: '/languages' },
  { label: 'Log in', to: '/login' },
];

export function CinematicHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pointerEnabledRef = useRef(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const location = useLocation();

  const closeMenu = (restoreFocus: boolean) => {
    setIsMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuTriggerRef.current?.focus());
  };

  useEffect(() => {
    closeMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const updatePointerMode = () => {
      pointerEnabledRef.current = !reducedMotion.matches && !coarsePointer.matches;
      if (!pointerEnabledRef.current) {
        pointerX.set(0);
        pointerY.set(0);
      }
    };
    updatePointerMode();
    reducedMotion.addEventListener?.('change', updatePointerMode);
    coarsePointer.addEventListener?.('change', updatePointerMode);
    return () => {
      reducedMotion.removeEventListener?.('change', updatePointerMode);
      coarsePointer.removeEventListener?.('change', updatePointerMode);
    };
  }, [pointerX, pointerY]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!pointerEnabledRef.current || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1, -1, 1);
    const y = clamp(((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1, -1, 1);
    pointerX.set(x * 10);
    pointerY.set(y * 8);
  };

  const handlePointerLeave = () => {
    if (!pointerEnabledRef.current) return;
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <header
      className="cinematic-motion relative isolate min-h-[100svh] overflow-hidden bg-[var(--cinematic-ink)] text-[var(--ech-text)]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <CinematicBackdrop intensity="hero" />

      <nav
        aria-label="Primary navigation"
        className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-3 rounded-md text-[var(--cinematic-emerald-400)] outline-offset-4"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[color-mix(in_srgb,var(--cinematic-emerald-400)_42%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-forest-800)_78%,transparent)]">
            <EchBuriPresence mood="welcome" size={32} />
          </span>
          <span className="text-lg font-semibold tracking-[-0.04em] text-[var(--ech-text)]">Echlearn</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="min-h-11 rounded-md px-3 py-2 text-sm text-[var(--ech-text-muted)] transition-colors hover:text-[var(--ech-text)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/register"
            className="ml-3 inline-flex min-h-11 items-center rounded-md bg-[var(--cinematic-emerald-400)] px-4 py-2 text-sm font-bold text-[var(--cinematic-ink)] transition-transform hover:-translate-y-0.5"
          >
            Start learning
          </Link>
        </div>

        <button
          ref={menuTriggerRef}
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="cinematic-mobile-menu"
          className="grid min-h-11 min-w-11 place-items-center rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_30%,transparent)] text-[var(--ech-text)] transition-colors hover:border-[var(--cinematic-emerald-400)] md:hidden"
        >
          {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen && (
        <motion.div
          id="cinematic-mobile-menu"
          role="dialog"
          aria-label="Primary navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-40 border-y border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-forest-800)_92%,transparent)] px-5 py-5 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <button
              type="button"
              onClick={() => closeMenu(true)}
              aria-label="Close navigation"
              className="mb-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ech-text-muted)] hover:text-[var(--ech-text)]"
            >
              <X size={18} aria-hidden="true" />
              Close
            </button>
            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => closeMenu(true)}
                className="min-h-11 rounded-md px-3 py-3 text-[var(--ech-text)] hover:bg-[color-mix(in_srgb,var(--cinematic-emerald-400)_10%,transparent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/register"
              onClick={() => closeMenu(true)}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--cinematic-emerald-400)] px-4 py-3 text-sm font-bold text-[var(--cinematic-ink)]"
            >
              Start learning
            </Link>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-12 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-6 lg:pt-0">
        <motion.div
          className="relative z-20 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--cinematic-gold)]">A QUIET PLACE TO BEGIN</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--ech-text)] sm:text-6xl lg:text-7xl">
            Make language learning feel like somewhere you want to return to.
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[var(--ech-text-muted)] sm:text-lg">
            Structured practice, useful review, and a clear next step for the days you have time to study.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--cinematic-emerald-400)] px-5 py-3 text-sm font-bold text-[var(--cinematic-ink)] transition-transform hover:-translate-y-0.5"
            >
              Begin your practice
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/languages"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_34%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--ech-text)] transition-colors hover:border-[var(--cinematic-emerald-400)]"
            >
              Explore languages
            </Link>
          </div>
        </motion.div>

        <div className="relative min-h-[23rem]" aria-label="Study space preview">
          <motion.div
            className="cinematic-hero__guide cinematic-motion absolute inset-x-0 top-1/2 z-20 mx-auto w-fit -translate-y-1/2"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            style={{ x: pointerX, y: pointerY }}
          >
            <EchBuriPresence mood="focus" size={240} />
          </motion.div>

          <motion.div
            className="absolute right-0 top-3 z-10 w-44 rounded-lg border border-[color-mix(in_srgb,var(--cinematic-gold)_34%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-forest-800)_82%,transparent)] p-4 shadow-2xl sm:right-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--cinematic-gold)]">TODAY&apos;S CUE</p>
            <p className="mt-3 text-sm font-semibold leading-5 text-[var(--ech-text)]">Listen closely. Respond clearly.</p>
          </motion.div>

          <motion.div
            className="absolute bottom-2 left-0 z-10 w-48 rounded-lg border border-[color-mix(in_srgb,var(--cinematic-emerald-400)_30%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-forest-800)_82%,transparent)] p-4 shadow-2xl sm:left-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--cinematic-emerald-400)]">A WAY BACK</p>
            <p className="mt-3 text-sm leading-5 text-[var(--ech-text-muted)]">Keep a review cue for your next session.</p>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
