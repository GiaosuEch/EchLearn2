import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X, Sun, Moon, ArrowUp } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useLearningStore } from '../../stores/learningStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import TopBar from './TopBar';
import { ErrorBoundary } from './ErrorBoundary';
import SidebarNav from './SidebarNav';
import SidebarDailyProgress from './SidebarDailyProgress';
import { applyCosmeticSettings } from '../../services/customizationService';
import EchLearnLogo from '../brand/EchLearnLogo';
import { IncomingCallModal } from '../community/IncomingCallModal';
import BuriLoadingState from '../mascot/BuriLoadingState';


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

  useEffect(() => { i18n.changeLanguage(interfaceLanguage); }, [interfaceLanguage, i18n]);
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.dataset.theme = theme;

    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    document.body.style.backgroundColor = isDark ? '#0a0a0a' : '#fafafa';
    document.body.style.color = isDark ? '#fafafa' : '#0a0a0a';

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

  const closeMobileSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => document.getElementById('app-sidebar-toggle')?.focus());
  }, [setSidebarOpen]);

  const isInitialized = useAuthStore(s => s.isInitialized);

  if (!isInitialized) {
    return <BuriLoadingState title="Buri đang kiểm tra hành trình của bạn" description="Đang khôi phục tiến độ học an toàn." />;
  }

  if (!isAuthenticated || !user) {
    if (import.meta.env.DEV) {
      // DEV BYPASS: Allow rendering the app without auth to test UI locally
      console.log('DEV BYPASS: Skipping auth check');
      // Mock user context if needed by children components, avoiding infinite loops
      if (!user) {
        useAuthStore.setState({
          isAuthenticated: true,
          isInitialized: true,
          user: { id: 'dev-user', email: 'dev@echlearn.test', role: 'admin', displayName: 'Dev User', username: 'dev', isPro: true, targetLanguages: ['ja', 'en'], nativeLanguage: 'vi' } as any
        });
      }
    } else {
      const targetUrl = location.pathname + location.search;
      return <Navigate to={`/register?redirectTo=${encodeURIComponent(targetUrl)}`} replace />;
    }
  }

  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 200);
  };

  const scrollToTop = () => {
    const main = document.getElementById('app-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {sidebarOpen && <SidebarDailyProgress />}
        <SidebarNav pathname={location.pathname} sidebarOpen={sidebarOpen} isAdmin={user?.role === 'admin'} />

        {/* Theme switcher */}
        {sidebarOpen && (
          <div className="ech-sidebar-footer p-3 space-y-2">
            <button
              id="theme-toggle-sidebar"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ech-theme-control w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} />
                  <span>Giao diện sáng</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span>Giao diện tối</span>
                </>
              )}
            </button>
          </div>
        )}

        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="ech-sidebar-collapse hidden lg:flex items-center justify-center h-11 transition-colors" aria-label={sidebarOpen ? t('common.collapse_navigation', { defaultValue: 'Collapse navigation' }) : t('common.expand_navigation', { defaultValue: 'Expand navigation' })}>{sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main id="app-main" tabIndex={-1} onScroll={handleScroll} className="ech-main flex-1 overflow-y-auto relative">
          <div className="p-4 pb-32 lg:p-6 lg:pb-32 max-w-6xl mx-auto">
            <ErrorBoundary><Outlet /></ErrorBoundary>
          </div>

          {/* Floating Scroll-to-Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-xl shadow-emerald-500/30 border border-emerald-300 transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer animate-fade-in"
              title="Cuộn nhanh lên đầu trang"
            >
              <ArrowUp size={18} />
              <span className="text-xs hidden sm:inline">Lên đầu trang</span>
            </button>
          )}
        </main>
      </div>

      {/* Global 2-Way Video & Audio Call Signaling Modal */}
      <IncomingCallModal />
    </div>
  );
}
