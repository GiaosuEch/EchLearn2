import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { EchBuriPresence } from '../atelier/EchBuriPresence';
import { SectionEyebrow } from '../atelier/SectionEyebrow';

const chapterLinks = [
  { label: 'Start', href: '#start' },
  { label: 'Practice', href: '#practice' },
  { label: 'Evidence', href: '#evidence' },
  { label: 'Remember', href: '#remember' },
  { label: 'Progress', href: '#progress' },
];

export function AtelierHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="relative overflow-hidden border-b border-[color-mix(in_srgb,var(--ech-text-muted)_16%,transparent)] bg-[var(--ech-canvas)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_78%_22%,color-mix(in_srgb,var(--ech-action)_14%,transparent),transparent_56%)]" aria-hidden="true" />
      <nav aria-label="Primary navigation" className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-3 rounded-md text-[var(--ech-text)]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[color-mix(in_srgb,var(--ech-action)_48%,transparent)] bg-[var(--ech-surface-2)]">
            <EchBuriPresence mood="welcome" size={34} />
          </span>
          <span className="text-lg font-semibold tracking-[-0.04em]">Echlearn</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {chapterLinks.map((link) => (
            <a key={link.href} href={link.href} className="min-h-11 rounded-md px-3 py-2 text-sm text-[var(--ech-text-muted)] transition-colors hover:text-[var(--ech-text)]">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="min-h-11 rounded-md px-4 py-2 text-sm text-[var(--ech-text-muted)] hover:text-[var(--ech-text)]">Log in</Link>
          <Link to="/register" className="min-h-11 rounded-md bg-[var(--ech-action)] px-4 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5">Start learning</Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          aria-controls="landing-mobile-menu"
          className="grid min-h-11 min-w-11 place-items-center rounded-md text-[var(--ech-text)] hover:bg-[var(--ech-surface-2)] lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div id="landing-mobile-menu" className="relative border-t border-[color-mix(in_srgb,var(--ech-text-muted)_16%,transparent)] bg-[var(--ech-surface-1)] px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <button type="button" onClick={closeMobileMenu} aria-label="Close navigation" className="mb-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ech-text-muted)] hover:text-[var(--ech-text)]">
              <X size={18} aria-hidden="true" />
              Close
            </button>
            {chapterLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMobileMenu} className="min-h-11 rounded-md px-3 py-3 text-[var(--ech-text)] hover:bg-[var(--ech-surface-2)]">
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_16%,transparent)] pt-4">
              <Link to="/login" onClick={closeMobileMenu} className="min-h-11 flex-1 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_35%,transparent)] px-4 py-3 text-center text-sm font-semibold text-[var(--ech-text)]">Log in</Link>
              <Link to="/register" onClick={closeMobileMenu} className="min-h-11 flex-1 rounded-md bg-[var(--ech-action)] px-4 py-3 text-center text-sm font-bold text-slate-950">Start learning</Link>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:items-end lg:py-32">
        <div>
          <SectionEyebrow>A quiet place to keep learning</SectionEyebrow>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--ech-text)] sm:text-6xl lg:text-7xl">
            Build a language habit that has room to last.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[var(--ech-text-muted)] sm:text-lg">
            Echlearn brings structured practice, useful review, and clear progress into one calm study rhythm.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--ech-action)] px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5">
              Begin your practice
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/languages" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_35%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--ech-text)] hover:border-[var(--ech-action)]">
              Explore language tracks
            </Link>
          </div>
        </div>

        <div className="atelier-surface atelier-surface--raised relative overflow-hidden p-6 sm:p-8">
          <div className="absolute right-3 top-2 opacity-90" aria-hidden="true"><EchBuriPresence mood="focus" size={118} /></div>
          <p className="font-mono text-xs tracking-[0.16em] text-[var(--ech-achievement)]">TODAY&apos;S STUDIO</p>
          <div className="mt-12 border-l-2 border-[var(--ech-action)] pl-4">
            <p className="text-sm text-[var(--ech-text-muted)]">Choose one small, repeatable next step.</p>
            <p className="mt-2 max-w-xs text-xl font-semibold tracking-[-0.03em] text-[var(--ech-text)]">Listen closely. Respond clearly. Return tomorrow.</p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 text-center text-xs text-[var(--ech-text-muted)]">
            <div className="rounded-md bg-[var(--ech-canvas)] px-2 py-3"><span className="block text-base font-semibold text-[var(--ech-text)]">01</span>focus</div>
            <div className="rounded-md bg-[var(--ech-canvas)] px-2 py-3"><span className="block text-base font-semibold text-[var(--ech-text)]">02</span>practice</div>
            <div className="rounded-md bg-[var(--ech-canvas)] px-2 py-3"><span className="block text-base font-semibold text-[var(--ech-text)]">03</span>review</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AtelierHero;
