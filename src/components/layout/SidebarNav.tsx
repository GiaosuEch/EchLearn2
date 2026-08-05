import type React from 'react';
import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trophy, Brain, Zap, User, ChevronLeft, ChevronRight, Sparkles, LayoutDashboard, Headphones, Mic, PenTool, BarChart3, GraduationCap, Volume2, Music2, Users, CreditCard, ShieldCheck, BookMarked } from 'lucide-react';

type NavItem = { icon: React.ReactNode; key: string; path: string; isDev?: boolean };
type NavSection = { key: string; items: NavItem[] };

const navLabelFallbacks: Record<string, string> = {
  music_lab: 'Âm Nhạc Lofi Study',
  podcast_hub: 'Podcast Ngôn Ngữ',
  customize: 'Tùy chỉnh linh vật',
  discord_channel: 'Discord',
  friends: 'Bạn bè & Kết bạn',
  pricing: 'Bảng giá lộ trình',
  admin_dashboard: 'Admin Control',
  speed_quiz: 'Thách đấu 60 giây',
  flashcards_3d: 'Flashcards 3D',
  weekly_report: 'Báo cáo tuần',
  realworld_mastery: 'Real-world Mastery',
  bilingual_news: 'Đọc Báo Song Ngữ',
  ielts_writing_master: 'IELTS Writing Suite',
  video_listening: 'Shadowing Video Bản Xứ',
  practice_hub: 'Trung Tâm Luyện Tập',
  courses: 'Trang Chủ Lộ Trình',
  reference_charts: 'Bảng Học Cơ Bản'
};

/* Icon elements are created once at module scope: rebuilding ~25 of them on
   every navigation was pure garbage for the reconciler to diff. */
const navSections: NavSection[] = [
  { key: 'chinh', items: [
    { icon: <BookOpen size={20} className="text-[#1cb0f6]" />, key: 'courses', path: '/app/roadmap' },
    { icon: <CreditCard size={20} className="text-amber-400" />, key: 'pricing', path: '/app/pricing' },
    { icon: <LayoutDashboard size={20} className="text-emerald-400" />, key: 'dashboard', path: '/app' },
    { icon: <Sparkles size={20} className="text-amber-400" />, key: 'practice_hub', path: '/app/practice' },
    { icon: <BookMarked size={20} className="text-cyan-400" />, key: 'reference_charts', path: '/app/reference-charts' },
  ] },
  { key: 'ky_nang', items: [
    { icon: <Headphones size={20} className="text-rose-400" />, key: 'listening', path: '/app/listening' },
    { icon: <Brain size={20} className="text-pink-400" />, key: 'vocabulary', path: '/app/vocabulary' },
    { icon: <Mic size={20} className="text-emerald-400" />, key: 'speaking', path: '/app/speaking' },
    { icon: <BookOpen size={20} className="text-teal-400" />, key: 'reading', path: '/app/reading' },
    { icon: <PenTool size={20} className="text-violet-400" />, key: 'writing', path: '/app/writing' },
    { icon: <BarChart3 size={20} className="text-blue-400" />, key: 'grammar', path: '/app/grammar' },
  ] },
  { key: 'luyen_thi', items: [
    { icon: <GraduationCap size={20} className="text-yellow-400" />, key: 'ielts_dashboard', path: '/app/ielts' },
    { icon: <Zap size={20} className="text-orange-400" />, key: 'speed_quiz', path: '/app/speed-quiz' },
    { icon: <Brain size={20} className="text-cyan-400" />, key: 'flashcards_3d', path: '/app/flashcards-3d' },
  ] },
  { key: 'giai_tri', items: [
    { icon: <Music2 size={20} className="text-purple-400" />, key: 'music_lab', path: '/app/music' },
    { icon: <Volume2 size={20} className="text-indigo-400" />, key: 'podcast_hub', path: '/app/podcasts' },
    { icon: <Sparkles size={20} className="text-fuchsia-400" />, key: 'customize', path: '/app/customize' },
  ] },
  { key: 'cong_dong', items: [
    { icon: <Zap size={20} className="text-[#58cc02]" />, key: 'daily_missions', path: '/app/missions' },
    { icon: <Trophy size={20} className="text-yellow-400" />, key: 'leaderboard', path: '/app/leaderboard' },
    { icon: <Users size={20} className="text-lime-400" />, key: 'friends', path: '/app/friends' },
    { icon: <Users size={20} className="text-sky-400" />, key: 'community', path: '/app/community' },
    { icon: <Users size={20} className="text-indigo-400" />, key: 'discord_channel', path: '/app/community/discord' },
    { icon: <User size={20} className="text-emerald-400" />, key: 'profile', path: '/app/profile' },
    { icon: <ShieldCheck size={20} className="text-amber-400" />, key: 'admin_dashboard', path: '/app/admin' },
  ] },
];

const sectionColors: Record<string, string> = {
  chinh: 'ech-nav-section',
  ky_nang: 'ech-nav-section',
  luyen_thi: 'ech-nav-section',
  giai_tri: 'ech-nav-section',
  cong_dong: 'ech-nav-section',
};

const sectionFallbackLabels: Record<string, string> = {
  chinh: 'Dẫn đường',
  ky_nang: 'Kỹ năng học',
  luyen_thi: 'Luyện thi',
  giai_tri: 'Giải trí',
  cong_dong: 'Cộng đồng',
};

export interface SidebarNavProps {
  pathname: string;
  sidebarOpen: boolean;
  isAdmin: boolean;
}

/**
 * The 25-link sidebar used to re-render on every XP tick and stat refresh
 * because it lived inside AppLayout. It now only depends on the route, the
 * collapse state and the admin flag, and its own collapse state is local.
 */
export const SidebarNav = memo(function SidebarNav({ pathname, sidebarOpen, isAdmin }: SidebarNavProps) {
  const { t } = useTranslation();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((key: string) => setCollapsedSections(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }), []);

  return (
    <nav className="flex-1 overflow-y-auto py-2 hide-scrollbar font-sans">
      {navSections.map(section => {
        const visibleItems = section.items.filter(item => {
          if (item.key === 'admin_dashboard' && !isAdmin) return false;
          return true;
        });
        if (visibleItems.length === 0) return null;
        const sectionExpanded = !collapsedSections.has(section.key);
        const sectionContentId = `app-sidebar-section-${section.key}`;
        const headerColorClass = sectionColors[section.key] || 'text-slate-400';

        return (
        <div key={section.key} className="mb-4">
          {sidebarOpen ? (
            <button type="button" onClick={() => toggleSection(section.key)} aria-controls={sectionContentId} aria-expanded={sectionExpanded} className={`w-full flex items-center justify-between px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ${headerColorClass} hover:brightness-125 transition-all cursor-pointer`}>
              {t(`common.${section.key}`, { defaultValue: sectionFallbackLabels[section.key] || section.key })} {collapsedSections.has(section.key) ? <ChevronLeft size={14} /> : <ChevronRight size={14} className="rotate-90" />}
            </button>
          ) : <div className="flex justify-center py-2 border-b ech-nav-divider mx-2 mb-2"><div className="ech-nav-divider-mark w-4 h-0.5 rounded-full" /></div>}
          {(!collapsedSections.has(section.key) || !sidebarOpen) && (
            <ul id={sectionContentId} className="space-y-1 mt-1">
              {visibleItems.map(item => {
                const isActive = pathname === item.path || (item.path !== '/app' && pathname.startsWith(`${item.path}/`));
                const label = navLabelFallbacks[item.key] || t(`common.${item.key}`, { defaultValue: item.key });
                const iconStyle = isActive ? 'text-emerald-700' : 'text-slate-500';

                return (
                  <li key={item.path} className={sidebarOpen ? 'px-3' : 'px-2'}>
                    <Link
                      to={item.path}
                      title={!sidebarOpen ? label : undefined}
                      className={`ech-nav-link flex items-center gap-3 rounded-lg transition-colors duration-150 group ${sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'} ${
                        isActive
                          ? 'ech-nav-link--active font-bold'
                          : 'font-semibold'
                      }`}
                    >
                      <span className={`ech-nav-icon flex items-center justify-center ${isActive ? 'text-emerald-700' : iconStyle}`}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="flex-1 truncate text-xs font-bold flex items-center justify-between">
                          <span>{label}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )})}
    </nav>
  );
});

export default SidebarNav;
