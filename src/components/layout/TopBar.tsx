import { Menu, Search, Sun, Moon, Lock, Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { canUseEntitlementLanguages, findActiveEntitlement } from '../../services/entitlementService';
import { supportedLanguages } from '../../utils/languageUtils';
import { AccountSwitcherModal } from '../auth/AccountSwitcherModal';
import { useLearningStore } from '../../stores/learningStore';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import { findGlobalSearchResults } from '../../viewmodels/globalSearch';
import { toast } from '../ui/Toast';

export default function TopBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const user = useAuthStore(s => s.user);
  const records = useEntitlementStore(s => s.records);
  const activeEntitlement = user ? findActiveEntitlement(records, user.id) : null;
  const activePlan = activeEntitlement?.plan || 'free';

  const stats = useLearningStore(s => s.stats);
  const todayXP = useLearningStore(s => s.todayXP);
  const dailyXPGoal = useAppStore(s => s.dailyXpGoal);
  const ieltsTargetBand = useAppStore(s => s.ieltsTargetBand);
  const metrics = createDashboardMetrics(stats, todayXP, dailyXPGoal, ieltsTargetBand);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = findGlobalSearchResults(searchQuery);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const currentLang = supportedLanguages.find(language => language.id === currentLanguage) || supportedLanguages[0];

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setShowLangDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (showLangDropdown) {
        event.preventDefault();
        setShowLangDropdown(false);
        window.requestAnimationFrame(() => languageTriggerRef.current?.focus());
      } else if (showNotifications) {
        event.preventDefault();
        setShowNotifications(false);
        window.requestAnimationFrame(() => notificationsTriggerRef.current?.focus());
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showLangDropdown, showNotifications]);

  const handleSelectLanguage = (langId: string) => {
    const canUse = canUseEntitlementLanguages(activePlan, [langId]);
    if (!canUse) {
      toast(`Gói Free hiện tại chưa hỗ trợ ngôn ngữ này. Hãy nâng cấp gói GO / PLUS / PRO để mở khóa!`, 'warning');
      setShowLangDropdown(false);
      navigate('/app/pricing');
      return;
    }
    useAppStore.getState().setCurrentLanguage(langId);
    setShowLangDropdown(false);
    toast(`Đã chuyển sang ngôn ngữ: ${supportedLanguages.find(l => l.id === langId)?.name}`, 'success');
  };

  return (
    <header className="ech-topbar h-16 flex items-center justify-between px-4 lg:px-8 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white relative z-[70] backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      {/* Left Search Section */}
      <div className="flex items-center gap-4 min-w-0">
        <button id="app-sidebar-toggle" type="button" onClick={toggleSidebar} className="lg:hidden min-h-11 min-w-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors flex items-center justify-center" aria-label={t('common.menu')} aria-controls="app-sidebar" aria-expanded={sidebarOpen}><Menu size={20} aria-hidden="true" /></button>
        
        <form className="hidden sm:flex relative items-center gap-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl px-4 py-2 w-64 lg:w-80 transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:bg-white dark:focus-within:bg-slate-800" onSubmit={(event) => { event.preventDefault(); if (searchResults[0]) { navigate(searchResults[0].to); setSearchQuery(''); } }}>
          <Search size={16} className="text-slate-400 shrink-0" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('common.search', { defaultValue: 'Tìm bài học, từ vựng...' })} aria-label={t('common.search', { defaultValue: 'Search' })} aria-controls="global-search-results" aria-expanded={searchQuery.trim().length > 0} className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full" />
          {searchQuery.trim() && <div id="global-search-results" role="listbox" className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">{searchResults.length ? searchResults.map((result) => <button key={result.to} type="button" role="option" className="w-full rounded-xl px-3.5 py-2.5 text-left hover:bg-emerald-50/80 dark:hover:bg-slate-800 transition-colors" onClick={() => { navigate(result.to); setSearchQuery(''); }}><span className="block text-sm font-bold text-slate-900 dark:text-white">{result.label}</span><span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.description}</span></button>) : <p className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">Không tìm thấy khu vực phù hợp.</p>}</div>}
        </form>
      </div>

      {/* Right Controls Section */}
      <div className="flex items-center gap-3">
        {/* Streamlined Stats Widget */}
        <div className="hidden sm:flex items-center gap-2 p-1 rounded-full bg-slate-100 dark:bg-slate-800/60 font-sans text-xs">
          {/* XP */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 text-amber-500 font-black shadow-xs">
            <span>★</span>
            <span className="text-slate-900 dark:text-slate-100">{metrics.totalXP.toLocaleString()} XP</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 text-orange-500 font-black shadow-xs">
            <span>🔥</span>
            <span className="text-slate-900 dark:text-slate-100">{metrics.streak} ngày</span>
          </div>
        </div>

        {/* Theme Switcher Button */}
        <button
          id="theme-toggle-topbar"
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          title="Chuyển Nền Sáng / Nền Tối"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
        </button>

        {/* Notifications Control */}
        <div className="relative" ref={notifRef}>
          <button
            ref={notificationsTriggerRef}
            id="notifications-menu-button"
            type="button"
            onClick={() => setShowNotifications(value => !value)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Thông báo hệ thống"
            aria-controls="notifications-menu"
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
          >
            <Bell size={18} className="text-slate-700 dark:text-slate-200" />
          </button>

          {showNotifications && (
            <div
              id="notifications-menu"
              role="dialog"
              aria-modal="false"
              aria-labelledby="notifications-menu-button"
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2 font-bold text-slate-900 dark:text-slate-100">
                <span>Thông báo</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">Mới</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] py-1">
                🐸 Hệ thống EchLearn đang hoạt động bình thường với Supabase Auth Cloud.
              </p>
            </div>
          )}
        </div>

        {/* Language selector with Entitlement Lock check */}
        <div className="relative" ref={langRef}>
          <button ref={languageTriggerRef} id="language-menu-button" type="button" onClick={() => setShowLangDropdown(value => !value)} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all cursor-pointer" aria-label={t('settings.learning_language')} aria-controls="language-menu" aria-expanded={showLangDropdown} aria-haspopup="dialog">
            <span className="text-base">{currentLang.flag}</span>
            <span className="text-xs font-extrabold uppercase tracking-wider">{currentLang.id}</span>
          </button>

          {showLangDropdown && (
            <div id="language-menu" role="dialog" aria-modal="false" aria-labelledby="language-menu-button" className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gói hiện tại</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  {activePlan}
                </span>
              </div>
              {supportedLanguages.map(lang => {
                const canUse = canUseEntitlementLanguages(activePlan, [lang.id]);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      currentLanguage === lang.id
                        ? 'bg-emerald-500 text-slate-950'
                        : canUse
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'text-slate-400 dark:text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                    }`}
                    onClick={() => handleSelectLanguage(lang.id)}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {currentLanguage === lang.id ? (
                      <span className="w-2 h-2 rounded-full bg-slate-950" />
                    ) : !canUse ? (
                      <Lock size={12} className="text-amber-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          type="button"
          onClick={() => setShowAccountSwitcher(true)}
          className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            {user?.displayName?.[0] || 'U'}
          </div>
          <span className="hidden md:inline text-xs font-black text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
            {user?.displayName || 'User'}
          </span>
        </button>

        {showAccountSwitcher && (
          <AccountSwitcherModal isOpen={showAccountSwitcher} onClose={() => setShowAccountSwitcher(false)} />
        )}
      </div>
    </header>
  );
}
