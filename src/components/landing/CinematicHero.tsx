import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import EchLearnLogo from '../brand/EchLearnLogo';
import Mascot from '../mascot/Mascot';
import { Button } from '../ui/button';

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
    <header className="relative isolate flex min-h-[560px] w-full flex-col overflow-hidden bg-slate-50 text-slate-900">

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b px-5 py-3 transition-colors sm:px-8 ${
          hasScrolled ? 'border-slate-200 bg-white shadow-sm' : 'border-transparent bg-white'
        }`}
      >
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
          <EchLearnLogo compact />
          <span className="hidden border-l border-emerald-200 pl-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 sm:inline">Học tiếng Anh</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          {primaryLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-emerald-700 focus:outline-none focus:text-emerald-700">
              {link.label}
            </Link>
          ))}
          <Link to="/login">
            <Button variant="ghost" size="sm">Đăng nhập</Button>
          </Link>
          <Link to="/app">
            <Button size="sm">Bắt đầu học</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div id="landing-mobile-menu" className="fixed inset-x-0 top-[65px] z-40 border-b border-slate-200 bg-white p-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-1 text-sm font-semibold text-slate-800">
            {primaryLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-3 hover:bg-emerald-50">
                {link.label}
              </Link>
            ))}
            <Link to="/app" onClick={() => setIsMenuOpen(false)} className="mt-2">
              <Button className="w-full">Bắt đầu học</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl items-center px-5 pb-10 pt-24 sm:px-8 lg:pb-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl space-y-7">
            <ExpressiveBadge emote="sparkles-badge" variant="emerald" size="md">
              NỀN TẢNG HỌC TIẾNG ANH & IELTS AI TOP 1
            </ExpressiveBadge>
            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Học tiếng Anh theo nhịp của bạn
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Lộ trình rõ ràng, bài luyện theo kỹ năng và trợ lý Ech Buri đồng hành để bạn phát âm chuẩn và phản xạ tự tin.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/app"><Button size="lg" className="w-full sm:w-auto">Bắt đầu học <ArrowRight size={18} /></Button></Link>
              <Link to="/app/roadmap"><Button variant="outline" size="lg" className="w-full border-slate-300 sm:w-auto">Xem lộ trình học</Button></Link>
            </div>
            <ul className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3" aria-label="Điểm nổi bật của EchLearn">
              {learningHighlights.map(({ emote, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CustomEmote type={emote} size={20} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} aria-label="Trợ giảng Ech Buri" className="mx-auto w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-7 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-emerald-50 relative">
              <Mascot expression="happy" size={138} />
              <div className="absolute -bottom-2 -right-2">
                <CustomEmote type="mascot-tutor" size={44} />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <ExpressiveBadge emote="verified-check" variant="emerald" size="sm">
                  PRO TUTOR
                </ExpressiveBadge>
              </div>
              <h2 className="text-2xl font-bold text-slate-950">Ech Buri</h2>
              <p className="text-sm leading-6 text-slate-600">Trợ lý AI phân tích điểm yếu và hướng dẫn lộ trình 365 Ngày.</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
