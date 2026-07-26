import { Outlet, Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Languages', path: '/languages' },
  { label: 'IELTS', path: '/ielts-program' },
  { label: 'Community', path: '/community-preview' },
  { label: 'Pricing', path: '/pricing' },
];

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--ech-canvas)] text-[var(--ech-text)]">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[70] -translate-y-20 rounded-md bg-[var(--ech-action)] px-4 py-3 text-sm font-bold text-slate-950 transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* The landing owns its chapter navigation; secondary public pages use this fixed shell. */}
      {!isHomePage && (
        <nav
          aria-label="Public navigation"
          className="fixed inset-x-0 top-0 z-50 border-b border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-canvas)]/95 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-sm"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex min-h-11 items-center gap-2.5 rounded-md text-[var(--ech-text)]">
                <img src="/mascots/pepe_mascot_avatar.png" className="h-8 w-8 object-contain" alt="" aria-hidden="true" />
                <span className="font-instrument text-2xl font-normal italic">EchLearn</span>
              </Link>

              <div className="hidden items-center gap-1 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className={`min-h-11 rounded-md px-4 py-2 text-sm transition-colors duration-200 ${
                      location.pathname === link.path
                        ? 'bg-[color-mix(in_srgb,var(--ech-action)_16%,transparent)] font-semibold text-[var(--ech-text)]'
                        : 'text-[var(--ech-text-muted)] hover:bg-[color-mix(in_srgb,var(--ech-surface-2)_72%,transparent)] hover:text-[var(--ech-text)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <Link to="/login" className="min-h-11 rounded-md px-4 py-2 text-sm text-[var(--ech-text-muted)] transition-colors hover:text-[var(--ech-text)]">
                  Log in
                </Link>
                <Link to="/register" className="min-h-11 rounded-md bg-[var(--ech-action)] px-5 py-2 text-sm font-bold text-slate-950 transition-colors hover:brightness-110">
                  Start Free
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileMenu}
                aria-controls="public-mobile-menu"
                className="min-h-11 min-w-11 rounded-md p-2 text-[var(--ech-text)] transition-colors hover:bg-[var(--ech-surface-2)] md:hidden"
              >
                {mobileMenu ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileMenu && (
            <div id="public-mobile-menu" className="border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-surface-1)] md:hidden">
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenu(false)}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className="block min-h-11 rounded-md px-4 py-3 text-[var(--ech-text-muted)] hover:bg-[var(--ech-surface-2)] hover:text-[var(--ech-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] pt-4">
                  <Link to="/login" onClick={() => setMobileMenu(false)} className="min-h-11 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_35%,transparent)] px-4 py-3 text-center text-[var(--ech-text)] hover:bg-[var(--ech-surface-2)]">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenu(false)} className="min-h-11 rounded-md bg-[var(--ech-action)] px-4 py-3 text-center font-bold text-slate-950 hover:brightness-110">
                    Start Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}

      <main id="main-content" tabIndex={-1} className={isHomePage ? '' : 'pt-16'}>
        <Outlet />
      </main>

      <footer className="border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-surface-1)] py-12 text-[var(--ech-text-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <img src="/mascots/pepe_mascot_avatar.png" className="h-8 w-8 object-contain" alt="" aria-hidden="true" />
                <span className="text-xl font-bold tracking-tight text-[var(--ech-text)]">EchLearn</span>
              </div>
              <p className="text-sm">Jump into every language with structured practice, progress tracking, and a global community.</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Product</h4>
              <div className="space-y-2 text-sm">
                <Link to="/languages" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Languages</Link>
                <Link to="/ielts-program" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">IELTS Program</Link>
                <Link to="/pricing" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Pricing</Link>
                <Link to="/about" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">About Us</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Features</h4>
              <div className="space-y-2 text-sm">
                <p>Speaking Practice</p>
                <p>Writing Practice</p>
                <p>Study Groups</p>
                <p>Voice Rooms</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Legal</h4>
              <div className="space-y-2 text-sm">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Cookie Policy</p>
                <p>Contact Us</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] pt-8 sm:flex-row">
            <div className="space-y-1 text-left">
              <p className="text-sm">© 2025 Ech Lern. All rights reserved.</p>
              <p className="text-xs">Local AI foundation in development. Automated assessment unavailable until an approved model is installed.</p>
            </div>
            <p className="text-sm">Made with care for language learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
