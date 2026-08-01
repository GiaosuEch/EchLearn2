import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import EchLearnLogo from '../brand/EchLearnLogo';
import Mascot from '../mascot/Mascot';

import { ExpressiveBadge } from '../ui/ExpressiveBadge';
import { CustomEmote } from '../common/CustomEmote';

const primaryLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Lộ trình học', to: '/app/roadmap' },
  { label: 'Luyện tập', to: '/app/practice' },
  { label: 'IELTS Academic', to: '/app/ielts' },
];

const learningHighlights = [
  { emote: 'sparkles-badge' as const, label: 'Học theo lộ trình 365 Ngày' },
  { emote: 'verified-check' as const, label: 'Luyện 4 Kỹ Năng Realtime' },
  { emote: 'trophy-gold' as const, label: 'Mục Tiêu IELTS Band 7.5+' },
];

export function CinematicHero() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative isolate flex min-h-[580px] w-full flex-col overflow-hidden bg-white text-slate-900">

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b px-5 py-3 transition-colors sm:px-8 ${
          hasScrolled ? 'border-slate-200 bg-white/95 backdrop-blur-md shadow-sm' : 'border-transparent bg-white'
        }`}
      >
        <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
          <EchLearnLogo compact />
          <span className="hidden border-l border-emerald-200 pl-2.5 text-xs font-black uppercase tracking-widest text-[#58cc02] sm:inline">Học Tiếng Anh</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-extrabold text-slate-700 md:flex">
          {primaryLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-[#58cc02] focus:outline-none focus:text-[#58cc02]">
              {link.label}
            </Link>
          ))}
          <Link to="/login">
            <button className="bg-white hover:bg-slate-50 text-[#1cb0f6] font-extrabold uppercase tracking-wider py-2.5 px-5 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 active:border-b-2 active:translate-y-0.5 transition-all text-xs">
              TÔI ĐÃ CÓ TÀI KHOẢN
            </button>
          </Link>
          <Link to="/app">
            <button className="bg-[#58cc02] hover:bg-[#61e002] text-white font-extrabold uppercase tracking-wider py-2.5 px-6 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-xs shadow-md shadow-emerald-500/20">
              BẮT ĐẦU
            </button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white text-slate-700 md:hidden"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div id="landing-mobile-menu" className="fixed inset-x-0 top-[65px] z-40 border-b-2 border-slate-200 bg-white p-5 shadow-xl md:hidden">
          <div className="flex flex-col gap-2 text-sm font-extrabold text-slate-800">
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
            <Link to="/app" onClick={() => setIsMenuOpen(false)} className="mt-2">
              <button className="w-full bg-[#58cc02] hover:bg-[#61e002] text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all">
                BẮT ĐẦU HỌC
              </button>
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl items-center px-5 pb-12 pt-28 sm:px-8 lg:pb-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          
          {/* Duolingo Free-Floating Mascot Column (No Card Border) */}
          <motion.aside
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            aria-label="Linh vật Ech Buri"
            className="flex flex-col items-center justify-center p-2 text-center order-2 lg:order-1"
          >
            <div className="relative flex items-center justify-center">
              <Mascot expression="happy" size={240} />
              <div className="absolute -bottom-3 right-4 transform rotate-6">
                <CustomEmote type="mascot-tutor" size={64} />
              </div>
            </div>
          </motion.aside>

          {/* Duolingo Headline & 3D Buttons Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl space-y-8 order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="space-y-4">
              <ExpressiveBadge emote="sparkles-badge" variant="emerald" size="lg" className="mx-auto lg:mx-0">
                NỀN TẢNG HỌC TIẾNG ANH & IELTS AI
              </ExpressiveBadge>
              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
                Học tiếng Anh miễn phí, vui nhộn và hiệu quả!
              </h1>
              <p className="text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
                Cùng linh vật Ech Buri học từ vựng, phản xạ giao tiếp và IELTS chuẩn Cambridge mỗi ngày.
              </p>
            </div>

            {/* Duolingo 3D Plastic Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-center lg:justify-start">
              <Link to="/app" className="w-full sm:w-auto">
                <button className="w-full sm:w-[260px] bg-[#58cc02] hover:bg-[#61e002] text-white font-black uppercase tracking-wider py-4 px-8 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer">
                  <span>BẮT ĐẦU</span>
                  <ArrowRight size={20} />
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-[260px] bg-white hover:bg-slate-50 text-[#1cb0f6] font-black uppercase tracking-wider py-4 px-8 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 active:border-b-2 active:translate-y-0.5 transition-all text-base flex items-center justify-center gap-2 cursor-pointer">
                  <span>TÔI ĐÃ CÓ TÀI KHOẢN</span>
                </button>
              </Link>
            </div>

            <ul className="grid gap-3 border-t-2 border-slate-100 pt-6 sm:grid-cols-3" aria-label="Điểm nổi bật của EchLearn">
              {learningHighlights.map(({ emote, label }) => (
                <li key={label} className="flex items-center justify-center lg:justify-start gap-2.5 text-sm font-extrabold text-slate-700">
                  <CustomEmote type={emote} size={22} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
