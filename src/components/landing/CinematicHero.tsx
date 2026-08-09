import { useState } from 'react';
import { ArrowDown, ArrowRight, Menu, Play, Users, X } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import EchLearnLogo from '../brand/EchLearnLogo';
import EchBuriAnimated from '../mascot/EchBuriAnimated';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { label: 'Thử thách', to: '/app/quizzes' },
  { label: 'Nhóm học', to: '/app/study-groups' },
  { label: 'Bảng xếp hạng', to: '/app/leaderboard' },
  { label: 'Gói học', to: '/pricing' },
];

export function CinematicHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const reducedMotion = useReducedMotion();
  const dashboardPath = isAuthenticated ? '/app' : '/register';

  return (
    <section className="community-hero overflow-hidden bg-[var(--ech-cream)] text-[var(--ech-ink)]">
      <div className="community-direction-bar">
        <p><strong>Học tiếng Anh có nhịp</strong> · Lộ trình cá nhân, 8 phút mỗi ngày</p>
        <a href="#first-day" className="community-direction-action">Xem ngày đầu tiên</a>
      </div>

      <nav aria-label="Primary navigation" className="community-public-nav">
        <Link to="/" className="shrink-0"><EchLearnLogo compact /></Link>
        <div className="community-desktop-links hidden items-center gap-7 md:flex">
          {links.map((link) => <Link key={link.to} to={link.to} className="community-nav-link">{link.label}</Link>)}
        </div>
        <div className="community-desktop-cta hidden md:block">
          <Link to={dashboardPath} className="community-button community-button--orange">{isAuthenticated ? 'Vào học' : 'Bắt đầu miễn phí'} <ArrowRight size={16} /></Link>
        </div>
        <button type="button" className="community-menu-button md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="community-mobile-nav" aria-label={menuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}>{menuOpen ? <X /> : <Menu />}</button>
      </nav>
      {menuOpen && <div id="community-mobile-nav" className="community-mobile-nav">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}<Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="community-button community-button--orange">{isAuthenticated ? 'Vào học' : 'Bắt đầu miễn phí'} <ArrowRight size={16} /></Link></div>}

      <div className="community-hero-layout mx-auto grid max-w-6xl gap-10 px-5 pb-9 pt-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:px-10 lg:pb-14 lg:pt-20">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
          <p className="community-kicker"><span /> Bắt đầu từ mục tiêu của bạn</p>
          <h1 className="community-display mt-5">Mỗi ngày 8 phút,<br />tiếng Anh tiến một bước.</h1>
          <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[var(--ech-ink-soft)]">Chọn mục tiêu, nhận bài học vừa sức và nhìn thấy tiến độ của mình mỗi ngày — có Ech Buri và nhóm học cùng giữ nhịp.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={dashboardPath} className="community-button community-button--orange"><Play size={16} fill="currentColor" /> Bắt đầu 8 phút đầu tiên</Link>
            <Link to="/app/study-groups" className="community-button community-button--outline"><Users size={17} /> Xem nhóm học</Link>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--ech-ink-muted)]">Không cần chuẩn bị lâu: ngày đầu tiên chỉ cần một mục tiêu và tám phút tập trung.</p>
        </motion.div>

        <div className="community-mascot-stage">
          <div className="community-mascot-halo" aria-hidden="true"><div /></div>
          <EchBuriAnimated size={400} state="welcome" className="community-hero-buri relative z-10" />
          <article className="community-challenge-card relative z-20" aria-label="Bài học đầu tiên">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#178D72]">Bài học đầu tiên</p>
            <h2>Phản xạ tiếng Anh trong 8 phút</h2>
            <p>Chọn mục tiêu · Luyện một vòng ngắn · Nhận bước tiếp theo</p>
          </article>
        </div>
      </div>
      <div className="flex justify-center pb-5"><a href="#features" aria-label="Khám phá các tính năng" className="community-scroll-cue"><ArrowDown size={19} /></a></div>
    </section>
  );
}

export default CinematicHero;
