import type React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Mic, PenTool, Users, Trophy, MessageCircle, Settings, BarChart3, Brain, Gamepad2, GraduationCap, Headphones, Target, Zap, User, ChevronLeft, ChevronRight, Volume2, Music2, Sparkles, Palette, Hash, Shield, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useLearningStore } from '../../stores/learningStore';
import TopBar from './TopBar';
import { ErrorBoundary } from './ErrorBoundary';
import { applyCosmeticSettings } from '../../services/customizationService';

type NavItem = { icon: React.ReactNode; key: string; path: string };
type NavSection = { key: string; items: NavItem[] };

const navLabelFallbacks: Record<string, string> = {
  ai_tutor: 'AI Tutor',
  ai_onboarding: 'AI Placement',
  music_lab: 'Music & Podcast Lab',
  customize: 'Tùy chỉnh',
  discord_channel: 'Discord',
  pricing: 'Bảng giá AI Tier',
  admin_dashboard: 'Admin Control Center'
};

const navSections: NavSection[] = [
  { key: 'learn', items: [
    { icon: <Home size={20} />, key: 'dashboard', path: '/app' },
    { icon: <BookOpen size={20} />, key: 'courses', path: '/app/roadmap' },
    { icon: <Gamepad2 size={20} />, key: 'lesson_player', path: '/app/lesson' },
    { icon: <Target size={20} />, key: 'practice_hub', path: '/app/practice' },
  ] },
  { key: 'skills', items: [
    { icon: <Headphones size={20} />, key: 'listening', path: '/app/listening' },
    { icon: <Mic size={20} />, key: 'speaking', path: '/app/speaking' },
    { icon: <BookOpen size={20} />, key: 'reading', path: '/app/reading' },
    { icon: <PenTool size={20} />, key: 'writing', path: '/app/writing' },
    { icon: <Brain size={20} />, key: 'vocabulary', path: '/app/vocabulary' },
    { icon: <BarChart3 size={20} />, key: 'grammar', path: '/app/grammar' },
  ] },
  { key: 'ielts', items: [
    { icon: <Target size={20} />, key: 'placement_test', path: '/app/ielts/placement' },
    { icon: <GraduationCap size={20} />, key: 'ielts_dashboard', path: '/app/ielts' },
    { icon: <Volume2 size={20} />, key: 'ielts_listening', path: '/app/ielts/listening' },
    { icon: <BookOpen size={20} />, key: 'ielts_reading', path: '/app/ielts/reading' },
    { icon: <PenTool size={20} />, key: 'ielts_writing', path: '/app/ielts/writing' },
    { icon: <Mic size={20} />, key: 'ielts_speaking', path: '/app/ielts/speaking' },
  ] },
  { key: 'ai_tools', items: [
    { icon: <Brain size={20} />, key: 'ai_tutor', path: '/app/ai-tutor' },
    { icon: <Mic size={20} />, key: 'ai_speaking_coach', path: '/app/ai-speaking' },
    { icon: <PenTool size={20} />, key: 'ai_writing_coach', path: '/app/ai-writing' },
    { icon: <Sparkles size={20} />, key: 'ai_onboarding', path: '/app/ai-onboarding' },
    { icon: <Music2 size={20} />, key: 'music_lab', path: '/app/music' },
    { icon: <Zap size={20} className="text-amber-400" />, key: 'pricing', path: '/pricing' },
  ] },
  { key: 'gamification', items: [
    { icon: <Zap size={20} />, key: 'daily_missions', path: '/app/missions' },
    { icon: <Trophy size={20} />, key: 'leaderboard', path: '/app/leaderboard' },
    { icon: <Target size={20} />, key: 'achievements', path: '/app/achievements' },
  ] },
  { key: 'community', items: [
    { icon: <Users size={20} />, key: 'community', path: '/app/community' },
    { icon: <Users size={20} />, key: 'friends', path: '/app/friends' },
    { icon: <Users size={20} />, key: 'study_groups', path: '/app/groups' },
    { icon: <MessageCircle size={20} />, key: 'chat', path: '/app/chat' },
    { icon: <Volume2 size={20} />, key: 'voice_rooms', path: '/app/voice-rooms' },
    { icon: <Hash size={20} />, key: 'discord_channel', path: '/app/community/discord' },
  ] },
  { key: 'account', items: [
    { icon: <User size={20} />, key: 'profile', path: '/app/profile' },
    { icon: <Settings size={20} />, key: 'settings', path: '/app/settings' },
    { icon: <Palette size={20} />, key: 'customize', path: '/app/customize' },
    { icon: <Shield size={20} className="text-emerald-400" />, key: 'admin_dashboard', path: '/app/admin' },
  ] },
];

import { JapaneseLofiPlayer } from '../audio/JapaneseLofiPlayer';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const setSidebarOpen = useAppStore(s => s.setSidebarOpen);
  const isMobile = useAppStore(s => s.isMobile);
  const setIsMobile = useAppStore(s => s.setIsMobile);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const theme = useAppStore(s => s.theme);
  const fontSize = useAppStore(s => s.fontSize);
  const accentPaletteId = useAppStore(s => s.accentPaletteId);
  const mascotSkinId = useAppStore(s => s.mascotSkinId);
  const uiSurface = useAppStore(s => s.uiSurface);
  const mascotAnimation = useAppStore(s => s.mascotAnimation);
  const seasonalEffects = useAppStore(s => s.seasonalEffects);
  const user = useAuthStore(s => s.user);
  const stats = useLearningStore(s => s.stats);
  const todayXP = useLearningStore(s => s.todayXP);
  const dailyXPGoal = useLearningStore(s => s.dailyXPGoal);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => { i18n.changeLanguage(interfaceLanguage); }, [interfaceLanguage, i18n]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname, isMobile, setSidebarOpen]);
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

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--ech-canvas)]">
      {isMobile && sidebarOpen && <button type="button" className="fixed inset-0 bg-black/60 z-40" onClick={closeMobileSidebar} aria-label={t('common.close_navigation', { defaultValue: 'Close navigation' })} />}
      <aside id="app-sidebar" aria-label={t('common.study_navigation', { defaultValue: 'Study navigation' })} aria-hidden={isMobile && !sidebarOpen} className={`atelier-surface atelier-surface--surface fixed lg:static z-50 top-0 left-0 h-full transition-all duration-300 ease-in-out flex flex-col rounded-none border-y-0 border-l-0 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} bg-dark-900 border-r border-dark-700/50`}>
        <div className={`flex items-center h-16 px-4 border-b border-dark-700/50 ${!sidebarOpen && 'lg:justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/app" className="flex items-center gap-2.5">
              <img src="/mascots/pepe_mascot_avatar.png" className="w-8 h-8 object-contain filter drop-shadow" alt="Pepe Logo" />
              <span className="text-xl font-extrabold text-gradient tracking-tight">EchLearn</span>
            </Link>
          ) : (
            <Link to="/app" className="hidden lg:block">
              <img src="/mascots/pepe_mascot_avatar.png" className="w-8 h-8 object-contain filter drop-shadow" alt="Pepe Logo" />
            </Link>
          )}
          <button type="button" onClick={closeMobileSidebar} className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-dark-300 hover:bg-dark-800 lg:hidden" aria-label={t('common.close_navigation', { defaultValue: 'Close navigation' })}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {sidebarOpen && user && (
          <div className="px-4 py-3 border-b border-dark-700/50">
            <div className="flex items-center justify-between text-sm mb-1"><span className="text-dark-400">{t('gamification.daily_xp', { defaultValue: 'Daily XP' })}</span><span className="text-primary-400 font-semibold">{todayXP}/{dailyXPGoal}</span></div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todayXP / Math.max(dailyXPGoal, 1)) * 100)}%` }} /></div>
            <div className="flex items-center gap-3 mt-2 text-xs text-dark-400"><span>🔥 {stats.currentStreak}</span><span>⚡ {stats.totalXP.toLocaleString()} XP</span><span>🏅 Lv.{user.level || 1}</span></div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-2 hide-scrollbar">
          {navSections.map(section => {
            // Filter items: hide admin_dashboard for non-admin users
            const visibleItems = section.items.filter(item => {
              if (item.key === 'admin_dashboard' && user?.role !== 'admin') return false;
              return true;
            });
            if (visibleItems.length === 0) return null;
            return (
            <div key={section.key} className="mb-4">
              {sidebarOpen ? (
                <button onClick={() => toggleSection(section.key)} className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-dark-500 uppercase tracking-wider hover:text-dark-300 transition-colors">
                  {t(`common.${section.key}`)} {collapsedSections.has(section.key) ? <ChevronLeft size={14} /> : <ChevronRight size={14} className="rotate-90" />}
                </button>
              ) : <div className="flex justify-center py-2 border-b border-dark-800 mx-2 mb-2"><div className="w-4 h-0.5 bg-dark-700 rounded-full" /></div>}
              {(!collapsedSections.has(section.key) || !sidebarOpen) && (
                <ul className="space-y-1">
                  {visibleItems.map(item => {
                    const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(`${item.path}/`));
                    const label = t(`common.${item.key}`, { defaultValue: navLabelFallbacks[item.key] || item.key });
                    return <li key={item.path} className={sidebarOpen ? 'px-3' : 'px-2'}><Link to={item.path} title={!sidebarOpen ? label : undefined} className={`flex items-center gap-3 rounded-xl transition-all group ${sidebarOpen ? 'px-3 py-2.5' : 'p-3 justify-center'} ${isActive ? 'bg-primary-500/10 text-primary-400 font-semibold' : 'text-dark-300 hover:bg-dark-800 hover:text-white'}`}><span className={isActive ? 'text-primary-500' : 'text-dark-400 group-hover:text-dark-300'}>{item.icon}</span>{sidebarOpen && <span className="flex-1 truncate text-sm">{label}</span>}</Link></li>;
                  })}
                </ul>
              )}
            </div>
          )})}
        </nav>
        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex items-center justify-center h-11 border-t border-dark-700/50 text-dark-500 hover:text-dark-300 transition-colors" aria-label={sidebarOpen ? t('common.collapse_navigation', { defaultValue: 'Collapse navigation' }) : t('common.expand_navigation', { defaultValue: 'Expand navigation' })}>{sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main id="app-main" tabIndex={-1} className="atelier-surface atelier-surface--canvas flex-1 overflow-y-auto rounded-none border-0 bg-mesh"><div className="p-4 lg:p-6 max-w-7xl mx-auto"><ErrorBoundary><Outlet /></ErrorBoundary></div></main>
      </div>

      {/* Persistent Japanese Lofi Music Player */}
      <JapaneseLofiPlayer />
    </div>
  );
}
