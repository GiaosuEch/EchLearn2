import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Menu, Mic2, Sparkles, Target, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import EchLearnLogo from '../brand/EchLearnLogo';
import Mascot from '../mascot/Mascot';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const primaryLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Lộ trình học', to: '/app/roadmap' },
  { label: 'Luyện tập', to: '/app/practice' },
  { label: 'IELTS Academic', to: '/app/ielts' },
];

const learningHighlights = [
  { icon: BookOpen, label: 'Học theo lộ trình' },
  { icon: Mic2, label: 'Luyện từng kỹ năng' },
  { icon: Target, label: 'Theo dõi mục tiêu' },
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
            <Badge variant="default" className="w-fit gap-2 px-3 py-1.5 text-xs">
              <Sparkles size={14} aria-hidden="true" />
              <span>NỀN TẢNG HỌC TIẾNG ANH</span>
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Học tiếng Anh theo nhịp của bạn
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Lộ trình rõ ràng, bài luyện theo kỹ năng và công cụ đồng hành để bạn học đều mỗi ngày.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/app"><Button size="lg" className="w-full sm:w-auto">Bắt đầu học <ArrowRight size={18} /></Button></Link>
              <Link to="/app/roadmap"><Button variant="outline" size="lg" className="w-full border-slate-300 sm:w-auto">Xem lộ trình học</Button></Link>
            </div>
            <ul className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3" aria-label="Điểm nổi bật của EchLearn">
              {learningHighlights.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 size={17} className="shrink-0 text-emerald-600" /><Icon size={16} aria-hidden="true" />{label}</li>
              ))}
            </ul>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} aria-label="Trợ giảng Ech Buri" className="mx-auto w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-7 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-emerald-50"><Mascot expression="happy" size={138} /></div>
            <div className="mt-5 space-y-2">
              <p className="text-sm font-semibold text-emerald-700">Người bạn đồng hành</p>
              <h2 className="text-2xl font-bold text-slate-950">Ech Buri</h2>
              <p className="text-sm leading-6 text-slate-600">Một người bạn đồng hành trong không gian học của bạn.</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
