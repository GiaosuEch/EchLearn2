import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Menu, X, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import EchLearnLogo from '../brand/EchLearnLogo';
import EchBuriAnimated from '../mascot/EchBuriAnimated';
import { getFlagUrl } from '../../data/languages';
import { useAuthStore } from '../../stores/authStore';

const primaryLinks = [
  { label: 'Lộ trình', to: '/app/roadmap' },
  { label: 'Luyện tập', to: '/app/practice' },
  { label: 'IELTS', to: '/app/ielts' },
  { label: 'Gói học', to: '/pricing' },
];

const flagLanguages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ko', label: 'Korean' },
  { code: 'es', label: 'Spanish' },
];

const skillReadout = [
  { name: 'Nghe', full: 'Listening', val: 88 },
  { name: 'Nói', full: 'Speaking', val: 76 },
  { name: 'Đọc', full: 'Reading', val: 92 },
  { name: 'Viết', full: 'Writing', val: 80 },
];

const EASE_ENTER = [0.16, 1, 0.3, 1] as const;

export function CinematicHero() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMenuOpen]);

  const container = shouldReduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: {
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
        },
      };

  const item = shouldReduceMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.62, ease: EASE_ENTER },
          },
        },
      };

  return (
    <header className="cinematic-motion relative isolate flex w-full flex-col overflow-hidden bg-white dark:bg-slate-950">

      {/* Navigation */}
      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 transition-all duration-300 sm:px-8 ${
          hasScrolled
            ? 'h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm'
            : 'h-20 border-b border-transparent bg-transparent'
        }`}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <EchLearnLogo compact />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative rounded-lg px-4 py-2 font-medium text-slate-600 dark:text-slate-300 transition-colors duration-200 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-1 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-emerald-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
            </Link>
          ))}
        </div>

        {/* Right CTA group */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link
              to="/app"
              className="group inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-950"
            >
              <span>Vào học (Dashboard)</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors duration-200 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-950"
              >
                <span>Bắt đầu miễn phí</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white backdrop-blur-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
        >
          {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div
          id="landing-mobile-menu"
          className="fixed inset-x-0 top-16 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 p-5 backdrop-blur-2xl md:hidden"
        >
          <div className="flex flex-col gap-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation"
              className="mb-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X size={16} aria-hidden="true" />
              <span>Đóng</span>
            </button>

            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              {isAuthenticated ? (
                <Link
                  to="/app"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950"
                >
                  <span>Vào học (Dashboard)</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-center text-sm font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950"
                  >
                    <span>Bắt đầu miễn phí</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Split hero */}
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-32 sm:px-8 lg:pb-28 lg:pt-40">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

          {/* Left column */}
          <motion.div {...container} className="flex flex-col text-center lg:text-left">
            {/* Eyebrow */}
            <motion.div
              {...item}
              className="mb-7 inline-flex items-center gap-2 self-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 lg:self-start"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Nền tảng học ngôn ngữ &amp; IELTS</span>
            </motion.div>

            {/* Headline */}
            <motion.div {...item} className="self-center lg:self-start">
              <h1 className="max-w-[16ch] text-balance text-[clamp(2.5rem,5.2vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-slate-900 dark:text-white">
                Học ngôn ngữ theo cách của bạn
              </h1>
            </motion.div>

            <motion.p
              {...item}
              className="mt-6 max-w-[54ch] self-center text-pretty text-base leading-[1.7] text-slate-600 dark:text-slate-300 sm:text-lg lg:self-start"
            >
              Lộ trình cá nhân hóa 365 ngày, rèn phản xạ bốn kỹ năng và theo dõi tiến độ học mỗi ngày cùng Ech Buri.
            </motion.p>

            {/* Actions */}
            <motion.div
              {...item}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                to={isAuthenticated ? '/app' : '/register'}
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-slate-950 sm:w-auto"
              >
                <Play size={15} className="fill-current" aria-hidden="true" />
                <span>{isAuthenticated ? 'Tiếp tục bài học' : 'Bắt đầu học miễn phí'}</span>
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to={isAuthenticated ? '/app/roadmap' : '/register'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-4 text-sm font-medium text-slate-900 dark:text-white transition-all duration-200 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:w-auto"
              >
                <span>Khám phá lộ trình</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              {...item}
              className="mt-10 flex flex-col items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 sm:flex-row sm:justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {flagLanguages.map(({ code, label }) => (
                  <img
                    key={code}
                    src={getFlagUrl(code)}
                    alt={`Cờ ${label}`}
                    className="inline-block h-9 w-9 rounded-full border-2 border-white dark:border-slate-900 object-cover transition-transform duration-200 hover:z-10 hover:scale-110"
                    loading="lazy"
                    width={36}
                    height={36}
                  />
                ))}
              </div>
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 sm:text-left">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-900 dark:text-white sm:justify-start">
                  <ShieldCheck size={14} className="text-emerald-500" aria-hidden="true" />
                  <span>13 ngôn ngữ trong cùng một ứng dụng</span>
                </div>
                <p className="mt-1">Lộ trình 90 ngày · Ôn luyện IELTS Academic</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column — asymmetrical bento */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.18, ease: EASE_ENTER }}
            className="grid grid-flow-dense grid-cols-2 gap-4"
          >
            {/* Mascot stage */}
            <div className="group relative col-span-2 overflow-hidden p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <div className="relative flex flex-col items-center py-2 text-center">
                <div className="relative motion-safe:animate-float">
                  <EchBuriAnimated size={200} />
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={12} className="text-emerald-500" aria-hidden="true" />
                  <span>Linh vật Ech Buri đồng hành</span>
                </div>

                <div className="mt-4 max-w-sm">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">
                    Luyện phản xạ mỗi ngày
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Luyện đều mỗi ngày với lộ trình rõ ràng và các mục tiêu dễ theo dõi.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 skills progress card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                4 Kỹ năng · bảng tiến độ mẫu
              </p>
              <div className="space-y-2.5">
                {skillReadout.map(({ name, full, val }) => (
                  <div key={full}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                      <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                        {val}%
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      role="img"
                      aria-label={`${full} ${val} phần trăm`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-emerald-500"
                        initial={shouldReduceMotion ? false : { width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 0.9, delay: 0.5, ease: EASE_ENTER }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IELTS Academic card */}
            <div className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="inline-flex w-fit rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">
                IELTS Academic
              </span>
              <div className="mt-4">
                <p className="text-3xl font-bold tracking-[-0.03em] tabular-nums text-slate-900 dark:text-white">
                  4 phần thi
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Listening, Reading, Writing và Speaking đều có khu luyện riêng
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
