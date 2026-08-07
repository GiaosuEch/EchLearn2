import type React from 'react';
import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trophy, Brain, Zap, User, ChevronDown, ChevronRight, Sparkles, LayoutDashboard, Headphones, Mic, PenTool, BarChart3, GraduationCap, Volume2, Music2, Users, CreditCard, ShieldCheck, BookMarked } from 'lucide-react';

type NavItem = { icon: React.ReactNode; key: string; path: string; isDev?: boolean };
type NavSection = { key: string; items: NavItem[] };

const navLabelFallbacks: Record<string, string> = {
  music_lab: 'Âm Nhạc',
  podcast_hub: 'Podcast',
  customize: 'Tùy chỉnh',
  discord_channel: 'Discord',
  friends: 'Bạn bè',
  pricing: 'Gói học',
  admin_dashboard: 'Admin',
  speed_quiz: 'Thách đấu',
  flashcards_3d: 'Flashcards',
  weekly_report: 'Báo cáo tuần',
  realworld_mastery: 'Thực hành',
  bilingual_news: 'Đọc báo',
  ielts_writing_master: 'IELTS Writing',
  video_listening: 'Shadowing',
  practice_hub: 'Luyện tập',
  courses: 'Lộ trình',
  reference_charts: 'Bảng tra cứu'
};

/* All icons use currentColor — the sidebar CSS controls the color based on
   active/inactive state. No rainbow icon colors. */
const iconSize = 18;

const navSections: NavSection[] = [
  { key: 'chinh', items: [
    { icon: <LayoutDashboard size={iconSize} />, key: 'dashboard', path: '/app' },
    { icon: <BookOpen size={iconSize} />, key: 'courses', path: '/app/roadmap' },
    { icon: <Sparkles size={iconSize} />, key: 'practice_hub', path: '/app/practice' },
    { icon: <CreditCard size={iconSize} />, key: 'pricing', path: '/app/pricing' },
    { icon: <BookMarked size={iconSize} />, key: 'reference_charts', path: '/app/reference-charts' },
  ] },
  { key: 'ky_nang', items: [
    { icon: <Headphones size={iconSize} />, key: 'listening', path: '/app/listening' },
    { icon: <Mic size={iconSize} />, key: 'speaking', path: '/app/speaking' },
    { icon: <BookOpen size={iconSize} />, key: 'reading', path: '/app/reading' },
    { icon: <PenTool size={iconSize} />, key: 'writing', path: '/app/writing' },
    { icon: <Brain size={iconSize} />, key: 'vocabulary', path: '/app/vocabulary' },
    { icon: <BarChart3 size={iconSize} />, key: 'grammar', path: '/app/grammar' },
  ] },
  { key: 'luyen_thi', items: [
    { icon: <GraduationCap size={iconSize} />, key: 'ielts_dashboard', path: '/app/ielts' },
    { icon: <Zap size={iconSize} />, key: 'speed_quiz', path: '/app/speed-quiz' },
    { icon: <Brain size={iconSize} />, key: 'flashcards_3d', path: '/app/flashcards-3d' },
  ] },
  { key: 'giai_tri', items: [
    { icon: <Music2 size={iconSize} />, key: 'music_lab', path: '/app/music' },
    { icon: <Volume2 size={iconSize} />, key: 'podcast_hub', path: '/app/podcasts' },
    { icon: <Sparkles size={iconSize} />, key: 'customize', path: '/app/customize' },
  ] },
  { key: 'cong_dong', items: [
    { icon: <Zap size={iconSize} />, key: 'daily_missions', path: '/app/missions' },
    { icon: <Trophy size={iconSize} />, key: 'leaderboard', path: '/app/leaderboard' },
    { icon: <Users size={iconSize} />, key: 'friends', path: '/app/friends' },
    { icon: <Users size={iconSize} />, key: 'community', path: '/app/community' },
    { icon: <Users size={iconSize} />, key: 'discord_channel', path: '/app/community/discord' },
    { icon: <User size={iconSize} />, key: 'profile', path: '/app/profile' },
    { icon: <ShieldCheck size={iconSize} />, key: 'admin_dashboard', path: '/app/admin' },
  ] },
];

const sectionFallbackLabels: Record<string, string> = {
  chinh: 'Dẫn đường',
  ky_nang: 'Kỹ năng',
  luyen_thi: 'Luyện thi',
  giai_tri: 'Giải trí',
  cong_dong: 'Cộng đồng',
};

export interface SidebarNavProps {
  pathname: string;
  sidebarOpen: boolean;
  isAdmin: boolean;
}

export const SidebarNav = memo(function SidebarNav({ pathname, sidebarOpen, isAdmin }: SidebarNavProps) {
  const { t } = useTranslation();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((key: string) => setCollapsedSections(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }), []);

  return (
    <nav className="flex-1 overflow-y-auto py-3 hide-scrollbar font-sans">
      {navSections.map(section => {
        const visibleItems = section.items.filter(item => {
          if (item.key === 'admin_dashboard' && !isAdmin) return false;
          return true;
        });
        if (visibleItems.length === 0) return null;
        const sectionExpanded = !collapsedSections.has(section.key);
        const sectionContentId = `app-sidebar-section-${section.key}`;

        return (
        <div key={section.key} className="mb-1">
          {sidebarOpen ? (
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              aria-controls={sectionContentId}
              aria-expanded={sectionExpanded}
              className="w-full flex items-center justify-between px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ech-text-muted)] hover:text-[var(--ech-text)] transition-colors cursor-pointer"
            >
              <span>{t(`common.${section.key}`, { defaultValue: sectionFallbackLabels[section.key] || section.key })}</span>
              {collapsedSections.has(section.key)
                ? <ChevronRight size={12} />
                : <ChevronDown size={12} />
              }
            </button>
          ) : (
            <div className="flex justify-center py-1.5 mx-3 mb-1">
              <div className="w-6 h-px rounded-full bg-[var(--ech-border)]" />
            </div>
          )}
          {(!collapsedSections.has(section.key) || !sidebarOpen) && (
            <ul id={sectionContentId} className="space-y-0.5 mt-0.5">
              {visibleItems.map(item => {
                const isActive = pathname === item.path || (item.path !== '/app' && pathname.startsWith(`${item.path}/`));
                const label = navLabelFallbacks[item.key] || t(`common.${item.key}`, { defaultValue: item.key });

                return (
                  <li key={item.path} className={sidebarOpen ? 'px-3' : 'px-2'}>
                    <Link
                      to={item.path}
                      title={!sidebarOpen ? label : undefined}
                      className={`ech-nav-link flex items-center gap-3 rounded-xl transition-all duration-150 group ${sidebarOpen ? 'px-3 py-2' : 'p-2.5 justify-center'} ${
                        isActive
                          ? 'ech-nav-link--active'
                          : ''
                      }`}
                    >
                      <span className="ech-nav-icon flex items-center justify-center shrink-0">
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="flex-1 truncate text-[13px] font-medium">
                          {label}
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
