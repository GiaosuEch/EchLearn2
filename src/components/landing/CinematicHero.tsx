import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, CheckCircle2, Trophy, Flame, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import Mascot from '../mascot/Mascot';
import EchLearnLogo from '../brand/EchLearnLogo';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const primaryLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Lộ trình 365 Ngày', to: '/app/roadmap' },
  { label: 'Trung tâm Luyện tập', to: '/app/practice' },
  { label: 'IELTS Suite', to: '/app/ielts' },
];

export function CinematicHero() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="ech-hero relative isolate min-h-[100svh] w-full overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 flex flex-col justify-between select-none" style={{ color: '#0f172a' }}>
      {/* Background Soft Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Top Floating Navigation Bar */}
      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-50 mx-auto flex w-full items-center justify-between px-6 py-4 transition-all duration-300 ${
          hasScrolled
            ? 'border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            🐸
          </div>
          <div className="flex flex-col">
            <EchLearnLogo compact />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider -mt-1">AI ENGLISH PLATFORM</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex text-sm font-bold">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{ color: '#334155' }}
              className="hover:text-emerald-600 font-bold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" style={{ color: '#1e293b' }} className="font-bold">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="default" size="default" className="uppercase tracking-wider">
                ▶ BẮT ĐẦU HỌC NGAY
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden cursor-pointer"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div id="landing-mobile-menu" className="fixed inset-x-0 top-16 z-40 border-b border-slate-200 bg-white/95 p-6 backdrop-blur-2xl md:hidden shadow-2xl space-y-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation"
            className="mb-2 text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <X size={16} /> Close navigation
          </button>
          <div className="flex flex-col gap-2 font-bold">
            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/app" onClick={() => setIsMenuOpen(false)}>
              <Button variant="default" size="lg" className="w-full uppercase tracking-wider">
                ▶ BẮT ĐẦU HỌC NGAY
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Hero Container */}
      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <Badge variant="default" className="py-2 px-4 shadow-xs">
              <Sparkles size={14} className="text-emerald-500" />
              <span>NỀN TẢNG HỌC TIẾNG ANH & IELTS AI TOP 1 THẾ GIỚI</span>
            </Badge>

            {/* Main Headline */}
            <h1 style={{ color: '#0f172a' }} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Chinh Phục Tiếng Anh & IELTS Cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Trợ Lý 3D AI Thông Minh</span> 🐸⚡
            </h1>

            {/* Subtitle — Sharp dark slate charcoal */}
            <p style={{ color: '#334155' }} className="text-base sm:text-lg font-semibold leading-relaxed max-w-2xl">
              Hệ thống phân tích điểm yếu thích ứng theo thuật toán Spaced Repetition, luyện phản xạ nói giọng nói AI 24/7 và bộ đề thi IELTS chuẩn Cambridge.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/app">
                <Button size="lg" className="uppercase tracking-wider">
                  <span>🚀 Khám Phá Lộ Trình AI</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/app/roadmap">
                <Button variant="outline" size="lg" style={{ color: '#0f172a' }}>
                  📋 Xem Cây Lộ Trình 365 Ngày
                </Button>
              </Link>
            </div>

            {/* Trust Badges — Sharp high contrast */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span style={{ color: '#1e293b' }} className="text-xs font-black">100% Từ Vựng Chuẩn Việt</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-600 shrink-0" />
                <span style={{ color: '#1e293b' }} className="text-xs font-black">IELTS Band 7.5+ Target</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-rose-600 shrink-0" />
                <span style={{ color: '#1e293b' }} className="text-xs font-black">Streak Gamification</span>
              </div>
            </div>
          </motion.div>

          {/* Right Mascot & 3D Interactive Card Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center"
          >
            {/* Soft Backing Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl transform scale-90" />

            {/* Central Mascot Card Container — Pure White Light Theme */}
            <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-[0_20px_50px_rgba(16,185,129,0.08)] flex flex-col items-center text-center space-y-4 max-w-sm w-full">
              <div className="w-48 h-48 relative flex items-center justify-center">
                <Mascot expression="happy" size={180} />
              </div>
              
              <div className="space-y-1">
                <h3 style={{ color: '#0f172a' }} className="text-2xl font-black tracking-tight">Ech Buri 🐸</h3>
                <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Your Personal AI Language Coach</p>
              </div>

              {/* Floating Stat Badges */}
              <div className="w-full pt-2 space-y-2">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🔥</span>
                    <span style={{ color: '#1e293b' }} className="text-xs font-extrabold">Target Daily Streak</span>
                  </div>
                  <Badge variant="amber">14 Days</Badge>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-purple-600" />
                    <span style={{ color: '#1e293b' }} className="text-xs font-extrabold">IELTS Goal</span>
                  </div>
                  <Badge variant="purple">Band 7.5</Badge>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

export default CinematicHero;
