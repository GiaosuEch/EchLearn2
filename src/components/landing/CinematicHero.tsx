import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
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

const titleEntryVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const guideEntryVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const artefactEntryVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export function CinematicHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pointerEnabledRef = useRef(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const entryInitial = prefersReducedMotion ? 'visible' : 'hidden';
  const entryTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const };
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.38 });
  const softPointerX = useSpring(pointerX, { stiffness: 100, damping: 22, mass: 0.3 });
  const softPointerY = useSpring(pointerY, { stiffness: 100, damping: 22, mass: 0.3 });
  const portalY = useTransform(smoothScroll, [0, 1], [0, -96]);
  const portalScale = useTransform(smoothScroll, [0, 1], [1, 1.13]);
  const portalOpacity = useTransform(smoothScroll, [0, 0.84, 1], [1, 0.72, 0]);
  const titleY = useTransform(smoothScroll, [0, 1], [0, -64]);
  const titleOpacity = useTransform(smoothScroll, [0, 0.72, 1], [1, 0.92, 0]);
  const portalRotateX = useTransform(softPointerY, [-8, 8], [3.4, -3.4]);
  const portalRotateY = useTransform(softPointerX, [-10, 10], [-4.5, 4.5]);
  const haloRotate = useTransform(smoothScroll, [0, 1], [0, 190]);

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
    const syncNavigation = () => setHasScrolled(window.scrollY > 32);
    syncNavigation();
    window.addEventListener('scroll', syncNavigation, { passive: true });
    return () => window.removeEventListener('scroll', syncNavigation);
  }, []);

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
      ref={heroRef}
      className="cinematic-motion relative isolate min-h-[100svh] overflow-hidden bg-[var(--cinematic-ink)] text-[var(--ech-text)]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <CinematicBackdrop intensity="hero" />

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 mx-auto flex w-full items-center justify-between px-5 py-4 transition-[background-color,border-color,backdrop-filter] duration-500 sm:px-8 sm:py-5 ${
          hasScrolled
            ? 'border-b border-white/10 bg-[color-mix(in_srgb,var(--cinematic-ink)_78%,transparent)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
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
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          variants={mobileMenuVariants}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
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

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[92rem] items-center gap-9 px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32 lg:grid-cols-[minmax(20rem,.83fr)_minmax(34rem,1.17fr)] lg:gap-0 lg:pt-24">
        <motion.div
          className="relative z-20 max-w-2xl lg:translate-y-14"
          initial={entryInitial}
          animate="visible"
          variants={titleEntryVariants}
          transition={entryTransition}
          style={prefersReducedMotion ? undefined : { y: titleY, opacity: titleOpacity }}
        >
          <p className="font-mono text-[0.68rem] font-semibold tracking-[0.25em] text-[var(--cinematic-gold)]">ECHLEARN / 2026</p>
          <h1 className="mt-5 max-w-xl text-[clamp(3.5rem,7.2vw,7.4rem)] font-semibold leading-[0.84] tracking-[-0.082em] text-[var(--ech-text)]">
            Learn it.<br />
            Live in it.
          </h1>
          <p className="mt-8 max-w-sm text-base leading-7 text-[color-mix(in_srgb,var(--ech-text)_68%,transparent)] sm:text-lg">
            A living practice space for the words you want to carry into the real world.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
            className="cinematic-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--cinematic-emerald-400)] px-6 py-3 text-sm font-bold text-[var(--cinematic-ink)]"
            >
              Begin your practice
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/languages"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-[var(--ech-text)] transition-colors hover:border-[var(--cinematic-emerald-400)]"
            >
              Explore languages
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="cinematic-portal relative min-h-[29rem] sm:min-h-[34rem] lg:absolute lg:inset-0 lg:min-h-0 lg:rounded-none"
          aria-label="Echlearn study world"
          style={prefersReducedMotion ? undefined : {
            y: portalY,
            scale: portalScale,
            opacity: portalOpacity,
            rotateX: portalRotateX,
            rotateY: portalRotateY,
          }}
        >
          <div className="cinematic-portal__sun" aria-hidden="true" />
          <motion.div className="cinematic-portal__halo cinematic-portal__halo--one" aria-hidden="true" style={prefersReducedMotion ? undefined : { rotate: haloRotate }} />
          <motion.div className="cinematic-portal__halo cinematic-portal__halo--two" aria-hidden="true" style={prefersReducedMotion ? undefined : { rotate: haloRotate }} />
          <p className="cinematic-portal__language" aria-hidden="true">こんにちは</p>
          <motion.div
            className="cinematic-hero__guide cinematic-motion absolute inset-x-0 top-[47%] z-20 mx-auto w-fit -translate-y-1/2"
            initial={entryInitial}
            animate="visible"
            variants={guideEntryVariants}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            style={{ x: softPointerX, y: softPointerY }}
          >
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -12, 0], rotate: [0, -1.1, 0, 1.1, 0] }}
              transition={{ duration: 7.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <EchBuriPresence mood="focus" size={420} animate={false} />
            </motion.div>
          </motion.div>

          <motion.div
            className="cinematic-portal__caption absolute bottom-4 left-0 z-30 max-w-[15rem] sm:bottom-9 sm:left-5"
            initial={entryInitial}
            animate="visible"
            variants={artefactEntryVariants}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.62, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--cinematic-gold)]">LIVE STUDY SPACE</p>
            <p className="mt-2 text-sm font-medium leading-5 text-[var(--ech-text)]">Hear it. Write it. Make it yours.</p>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}

export default CinematicHero;
