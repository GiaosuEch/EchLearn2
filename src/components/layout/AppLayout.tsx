import type React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trophy, Brain, Zap, User, ChevronLeft, ChevronRight, Sparkles, X, LayoutDashboard, Headphones, Mic, PenTool, BarChart3, GraduationCap, Volume2, Music2, Users, Sun, Moon, CreditCard, ShieldCheck, BookMarked } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useLearningStore } from '../../stores/learningStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import TopBar from './TopBar';
import { ErrorBoundary } from './ErrorBoundary';
import { applyCosmeticSettings } from '../../services/customizationService';
import { JapaneseLofiPlayer } from '../audio/JapaneseLofiPlayer';
import EchLearnLogo from '../brand/EchLearnLogo';

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

const itemIconColors: Record<string, { active: string; default: string }> = {
  dashboard: { active: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110', default: 'text-emerald-400/80 group-hover:text-emerald-300 group-hover:scale-110' },
  courses: { active: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110', default: 'text-cyan-400/80 group-hover:text-cyan-300 group-hover:scale-110' },
  lesson_player: { active: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] scale-110', default: 'text-purple-400/80 group-hover:text-purple-300 group-hover:scale-110' },
  practice_hub: { active: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110', default: 'text-amber-400/80 group-hover:text-amber-300 group-hover:scale-110' },
  listening: { active: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] scale-110', default: 'text-rose-400/80 group-hover:text-rose-300 group-hover:scale-110' },
  speaking: { active: 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-110', default: 'text-sky-400/80 group-hover:text-sky-300 group-hover:scale-110' },
  reading: { active: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110', default: 'text-emerald-400/80 group-hover:text-emerald-300 group-hover:scale-110' },
  writing: { active: 'text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)] scale-110', default: 'text-violet-400/80 group-hover:text-violet-300 group-hover:scale-110' },
  vocabulary: { active: 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] scale-110', default: 'text-pink-400/80 group-hover:text-pink-300 group-hover:scale-110' },
  grammar: { active: 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)] scale-110', default: 'text-teal-400/80 group-hover:text-teal-300 group-hover:scale-110' },
  placement_test: { active: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110', default: 'text-amber-400/80 group-hover:text-amber-300 group-hover:scale-110' },
  ielts_dashboard: { active: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110', default: 'text-yellow-400/80 group-hover:text-yellow-300 group-hover:scale-110' },
  ielts_listening: { active: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] scale-110', default: 'text-rose-400/80 group-hover:text-rose-300 group-hover:scale-110' },
  ielts_reading: { active: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110', default: 'text-emerald-400/80 group-hover:text-emerald-300 group-hover:scale-110' },
  ielts_writing: { active: 'text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)] scale-110', default: 'text-violet-400/80 group-hover:text-violet-300 group-hover:scale-110' },
  ielts_speaking: { active: 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-110', default: 'text-sky-400/80 group-hover:text-sky-300 group-hover:scale-110' },
  speed_quiz: { active: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] scale-110', default: 'text-orange-400/80 group-hover:text-orange-300 group-hover:scale-110' },
  flashcards_3d: { active: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110', default: 'text-cyan-400/80 group-hover:text-cyan-300 group-hover:scale-110' },
  weekly_report: { active: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] scale-110', default: 'text-purple-400/80 group-hover:text-purple-300 group-hover:scale-110' },
  leaderboard: { active: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110', default: 'text-yellow-400/80 group-hover:text-yellow-300 group-hover:scale-110' },
  achievements: { active: 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] scale-110', default: 'text-pink-400/80 group-hover:text-pink-300 group-hover:scale-110' },
  pricing: { active: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110', default: 'text-amber-400/80 group-hover:text-amber-300 group-hover:scale-110' },
  friends: { active: 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)] scale-110', default: 'text-lime-400/80 group-hover:text-lime-300 group-hover:scale-110' },
  chat: { active: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] scale-110', default: 'text-indigo-400/80 group-hover:text-indigo-300 group-hover:scale-110' },
  voice_rooms: { active: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110', default: 'text-amber-400/80 group-hover:text-amber-300 group-hover:scale-110' },
  profile: { active: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110', default: 'text-emerald-400/80 group-hover:text-emerald-300 group-hover:scale-110' },
  customize: { active: 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)] scale-110', default: 'text-fuchsia-400/80 group-hover:text-fuchsia-300 group-hover:scale-110' },
  admin_dashboard: { active: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110 animate-pulse', default: 'text-amber-400/90 group-hover:text-amber-300 group-hover:scale-110' },
};

void itemIconColors;

const sectionColors: Record<string, string> = {
  chinh: 'ech-nav-section',
  ky_nang: 'ech-nav-section',
  luyen_thi: 'ech-nav-section',
  giai_tri: 'ech-nav-section',
  cong_dong: 'ech-nav-section',
};

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const setSidebarOpen = useAppStore(s => s.setSidebarOpen);
  const isMobile = useAppStore(s => s.isMobile);
  const setIsMobile = useAppStore(s => s.setIsMobile);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const fontSize = useAppStore(s => s.fontSize);
  const accentPaletteId = useAppStore(s => s.accentPaletteId);
  const mascotSkinId = useAppStore(s => s.mascotSkinId);
  const uiSurface = useAppStore(s => s.uiSurface);
  const mascotAnimation = useAppStore(s => s.mascotAnimation);
  const seasonalEffects = useAppStore(s => s.seasonalEffects);
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const refreshEntitlements = useEntitlementStore(s => s.refresh);
  const stats = useLearningStore(s => s.stats);
  const todayXP = useLearningStore(s => s.todayXP);
  const dailyXPGoal = useAppStore(s => s.dailyXpGoal);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => { i18n.changeLanguage(interfaceLanguage); }, [interfaceLanguage, i18n]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
    applyCosmeticSettings({ accentPaletteId, mascotSkinId, uiSurface, mascotAnimation, seasonalEffects });
  }, [theme, fontSize, accentPaletteId, mascotSkinId, uiSurface, mascotAnimation, seasonalEffects]);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);
  useEffect(() => { if (user) useLearningStore.getState().fetchStats(); }, [user]);
  useEffect(() => { if (user?.id) void refreshEntitlements(user.id); }, [user?.id, refreshEntitlements]);
  useEffect(() => {
    if (!isMobile) return;
    const sidebar = document.getElementById('app-sidebar');
    const shouldRestoreFocus = Boolean(sidebar?.contains(document.activeElement));
    setSidebarOpen(false);
    if (shouldRestoreFocus) {
      window.requestAnimationFrame(() => document.getElementById('app-sidebar-toggle')?.focus());
    }
  }, [location.pathname, isMobile, setSidebarOpen]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        event.preventDefault();
        setSidebarOpen(false);
        window.requestAnimationFrame(() => document.getElementById('app-sidebar-toggle')?.focus());
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  const toggleSection = (key: string) => setCollapsedSections(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => document.getElementById('app-sidebar-toggle')?.focus());
  };

  const isInitialized = useAuthStore(s => s.isInitialized);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-semibold text-slate-500">Đang tải trải nghiệm EchLearn...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="ech-app flex h-screen overflow-hidden">
      {isMobile && sidebarOpen && <button type="button" className="fixed inset-0 bg-black/60 z-40" onClick={closeMobileSidebar} aria-label={t('common.close_navigation', { defaultValue: 'Close navigation' })} />}
      <aside id="app-sidebar" aria-label={t('common.study_navigation', { defaultValue: 'Study navigation' })} aria-hidden={isMobile && !sidebarOpen} inert={isMobile && !sidebarOpen} className={`ech-sidebar fixed lg:static z-50 top-0 left-0 h-full overflow-hidden transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'}`}>
        <div className={`ech-sidebar-brand flex items-center h-16 px-4 ${!sidebarOpen && 'lg:justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/app" className="flex min-h-11 items-center">
              <EchLearnLogo compact />
            </Link>
          ) : (
            <Link to="/app" className="hidden lg:block">
              <img src="/mascots/echlearn_icon.png" className="w-9 h-9 object-contain rounded-xl shadow-sm" alt="EchLearn Logo" />
            </Link>
          )}
          <button type="button" onClick={closeMobileSidebar} className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label={t('common.close_navigation', { defaultValue: 'Close navigation' })}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {sidebarOpen && user && (
          <div className="ech-daily-progress px-4 py-3">
            <div className="flex items-center justify-between text-sm mb-1"><span>{t('gamification.daily_xp', { defaultValue: 'Daily XP' })}</span><span className="font-semibold">{todayXP}/{dailyXPGoal}</span></div>
            <div className="ech-progress-track h-2 rounded-full overflow-hidden"><div className="ech-progress-fill h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todayXP / Math.max(dailyXPGoal, 1)) * 100)}%` }} /></div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400"><span>Chuỗi {stats.currentStreak} ngày</span><span>{stats.totalXP.toLocaleString()} XP</span><span>Cấp {stats.level}</span></div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-2 hide-scrollbar font-sans">
          {navSections.map(section => {
            const visibleItems = section.items.filter(item => {
              if (item.key === 'admin_dashboard' && user?.role !== 'admin') return false;
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
                  {t(`common.${section.key}`, { defaultValue: section.key === 'chinh' ? 'Dẫn đường' : section.key === 'ky_nang' ? 'Kỹ năng học' : section.key === 'luyen_thi' ? 'Luyện thi' : section.key === 'giai_tri' ? 'Giải trí' : 'Cộng đồng' })} {collapsedSections.has(section.key) ? <ChevronLeft size={14} /> : <ChevronRight size={14} className="rotate-90" />}
                </button>
              ) : <div className="flex justify-center py-2 border-b ech-nav-divider mx-2 mb-2"><div className="ech-nav-divider-mark w-4 h-0.5 rounded-full" /></div>}
              {(!collapsedSections.has(section.key) || !sidebarOpen) && (
                <ul id={sectionContentId} className="space-y-1 mt-1">
                  {visibleItems.map(item => {
                    const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(`${item.path}/`));
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

        {/* Theme switcher */}
        {sidebarOpen && (
          <div className="ech-sidebar-footer p-3 space-y-2">
            <button
              id="theme-toggle-sidebar"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ech-theme-control w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} className="text-amber-400" />
                  <span>Nền Sáng Trắng ☀️</span>
                </>
              ) : (
                <>
                  <Moon size={16} className="text-indigo-600" />
                  <span>Nền Tối 🌙</span>
                </>
              )}
            </button>
          </div>
        )}

        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="ech-sidebar-collapse hidden lg:flex items-center justify-center h-11 transition-colors" aria-label={sidebarOpen ? t('common.collapse_navigation', { defaultValue: 'Collapse navigation' }) : t('common.expand_navigation', { defaultValue: 'Expand navigation' })}>{sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main id="app-main" tabIndex={-1} className="ech-main flex-1 overflow-y-auto">
          <div className="p-4 pb-24 lg:p-6 lg:pb-6 max-w-6xl mx-auto">
            <ErrorBoundary><Outlet /></ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Persistent Japanese Lofi Music Player */}
      <JapaneseLofiPlayer />
    </div>
  );
}
