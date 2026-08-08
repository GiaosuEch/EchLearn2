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

const members = [
  { initials: 'AN', color: 'bg-[#178D72]' },
  { initials: 'MI', color: 'bg-[#F77B38]' },
  { initials: 'TH', color: 'bg-[#6254A6]' },
];

export function CinematicHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const reducedMotion = useReducedMotion();
  const dashboardPath = isAuthenticated ? '/app' : '/register';

  return (
    <section className="community-hero overflow-hidden bg-[var(--ech-cream)] text-[var(--ech-ink)]">
      <div className="community-direction-bar">
        <p><strong>03 — Năng lượng cộng đồng</strong> · Trẻ trung, giàu động lực, hợp streak và thử thách</p>
        <a href="#challenge" className="community-direction-action">Chọn hướng này</a>
      </div>

      <nav aria-label="Primary navigation" className="community-public-nav">
        <Link to="/" className="shrink-0"><EchLearnLogo compact /></Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => <Link key={link.to} to={link.to} className="community-nav-link">{link.label}</Link>)}
        </div>
        <div className="hidden md:block">
          <Link to={dashboardPath} className="community-button community-button--orange">{isAuthenticated ? 'Vào học' : 'Tham gia'} <ArrowRight size={16} /></Link>
        </div>
        <button type="button" className="community-menu-button md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="community-mobile-nav" aria-label={menuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'}>{menuOpen ? <X /> : <Menu />}</button>
      </nav>
      {menuOpen && <div id="community-mobile-nav" className="community-mobile-nav">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}<Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="community-button community-button--orange">Tham gia <ArrowRight size={16} /></Link></div>}

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-9 pt-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:px-10 lg:pb-14 lg:pt-20">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
          <p className="community-kicker"><span /> Học cùng người thật, tiến bộ mỗi ngày</p>
          <h1 className="community-display mt-5">Học một mình,<br />nhưng không cô đơn.</h1>
          <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[var(--ech-ink-soft)]">Biến việc luyện ngôn ngữ thành một nhịp vui mỗi ngày: có nhóm học, thử thách và bạn đồng hành.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={dashboardPath} className="community-button community-button--orange"><Play size={16} fill="currentColor" /> Tham gia thử thách</Link>
            <Link to="/app/study-groups" className="community-button community-button--outline"><Users size={17} /> Xem nhóm học</Link>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--ech-ink-muted)]">Phù hợp nếu nền tảng mua qua cộng đồng, streak và referral là ưu tiên.</p>
        </motion.div>

        <div id="challenge" className="community-mascot-stage">
          <div className="community-mascot-halo" aria-hidden="true"><div /></div>
          <EchBuriAnimated size={286} state="welcome" className="community-hero-buri relative z-10" />
          <article className="community-challenge-card relative z-20" aria-label="Thử thách đang diễn ra">
            <h2>Thử thách 7 ngày: phản xạ tiếng Anh</h2>
            <div className="mt-4 flex items-center gap-1.5">
              {members.map((member) => <span key={member.initials} className={`community-member ${member.color}`}>{member.initials}</span>)}
              <span className="community-member bg-[#8051A4]">+28</span>
            </div>
            <p>Hôm nay · 8 phút · Cùng bắt đầu</p>
          </article>
        </div>
      </div>
      <div className="flex justify-center pb-5"><a href="#features" aria-label="Khám phá các tính năng" className="community-scroll-cue"><ArrowDown size={19} /></a></div>
    </section>
  );
}

export default CinematicHero;
