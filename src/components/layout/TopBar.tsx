import { Bell, Lock, Menu, Moon, Search, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { ProBadge } from '../common/ProBadge';
import { supportedLanguages } from '../../utils/languageUtils';
import { AccountSwitcherModal } from '../auth/AccountSwitcherModal';
import TopBarStats from './TopBarStats';
import { findGlobalSearchResults } from '../../viewmodels/globalSearch';
import { toast } from '../ui/Toast';
import { flushOfflineQueue } from '../../services/offlineSyncService';

export default function TopBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const displayName = useAuthStore(s => s.user?.displayName);
  // Merged profile + ledger plan: the language switcher must not show padlocks
  // to an account the admin has already granted PRO.
  const { plan: activePlan, flags: proFlags } = useProAccess();
  const canUseLanguage = useCallback(
    (langId: string) => proFlags.unlockAllLanguages || canUseEntitlementLanguages(activePlan, [langId]),
    [proFlags.unlockAllLanguages, activePlan],
  );
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // The index scan normalizes every label and keyword, so it stays keyed to the
  // query instead of re-running on theme toggles and dropdown state flips.
  const searchResults = useMemo(() => findGlobalSearchResults(searchQuery), [searchQuery]);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const currentLang = supportedLanguages.find(language => language.id === currentLanguage) || supportedLanguages[0];

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void flushOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast('⚡ Chuyển sang Chế Độ Học Ngoại Tuyến (Offline Mode)! Tiến độ sẽ được tự động lưu.', 'info');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setShowLangDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (showLangDropdown) {
        setShowLangDropdown(false);
        languageTriggerRef.current?.focus();
      }
      if (showNotifications) {
        setShowNotifications(false);
        notificationsTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLangDropdown, showNotifications]);

  const handleSelectLanguage = useCallback((langId: string) => {
    if (!canUseLanguage(langId)) {
      toast('Gói hiện tại chưa hỗ trợ ngôn ngữ này. Hãy nâng cấp để mở khóa.', 'warning');
      setShowLangDropdown(false);
      navigate('/app/pricing');
      return;
    }
    useAppStore.getState().setCurrentLanguage(langId);
    setShowLangDropdown(false);
    toast(`Đã chuyển sang ngôn ngữ: ${supportedLanguages.find(l => l.id === langId)?.name}`, 'success');
  }, [canUseLanguage, navigate]);

  const closeAccountSwitcher = useCallback(() => setShowAccountSwitcher(false), []);

  return (
    <header className="ech-topbar h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative z-[70] border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4 min-w-0">
        <button id="app-sidebar-toggle" type="button" onClick={toggleSidebar} aria-expanded={sidebarOpen} aria-controls="app-sidebar" className="lg:hidden min-h-11 min-w-11 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center" aria-label={t('common.menu')}><Menu size={20} aria-hidden="true" /></button>
        <form className="hidden sm:flex relative items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg px-3 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-emerald-500/30" onSubmit={event => { event.preventDefault(); if (searchResults[0]) { navigate(searchResults[0].to); setSearchQuery(''); } }}>
          <Search size={16} className="text-slate-400 shrink-0" />
          <input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Tìm bài học, từ vựng..." aria-label="Tìm kiếm" className="bg-transparent border-none outline-none text-sm font-medium w-full" />
          {searchQuery.trim() && <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">{searchResults.length ? searchResults.map(result => <button key={result.to} type="button" className="w-full rounded-lg px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-slate-800" onClick={() => { navigate(result.to); setSearchQuery(''); }}><span className="block text-sm font-semibold">{result.label}</span><span className="block text-xs text-slate-500 mt-0.5">{result.description}</span></button>) : <p className="px-3 py-2 text-xs text-slate-500">Không tìm thấy khu vực phù hợp.</p>}</div>}
        </form>
      </div>

      <div className="flex items-center gap-2">
        {!isOnline && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
            ⚡ Offline Mode
          </span>
        )}
        <TopBarStats />
        <button id="theme-toggle-topbar" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200" title="Chuyển giao diện sáng/tối">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        <div className="relative" ref={notifRef}>
          <button id="notifications-menu-button" ref={notificationsTriggerRef} type="button" onClick={() => setShowNotifications(value => !value)} aria-expanded={showNotifications} aria-controls="notifications-popover" className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200" aria-label="Thông báo"><Bell size={18} /></button>
          {showNotifications && <div id="notifications-popover" className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-3 z-50 text-xs"><p className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Thông báo</p><p className="text-slate-600 dark:text-slate-400 py-2">Hệ thống EchLearn đang hoạt động bình thường.</p></div>}
        </div>
        <div className="relative" ref={langRef}>
          <button id="language-menu-button" ref={languageTriggerRef} type="button" onClick={() => setShowLangDropdown(value => !value)} aria-expanded={showLangDropdown} aria-controls="language-popover" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs" aria-label="Ngôn ngữ học"><span className="text-slate-500">{currentLang.id.toUpperCase()}</span></button>
          {showLangDropdown && <div id="language-popover" className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-1.5 z-50"><p className="px-3 py-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">Ngôn ngữ học</p>{supportedLanguages.map(lang => { const canUse = canUseLanguage(lang.id); return <button key={lang.id} type="button" className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${currentLanguage === lang.id ? 'bg-emerald-100 text-emerald-800' : canUse ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-400'}`} onClick={() => handleSelectLanguage(lang.id)}><span>{lang.name}</span>{currentLanguage === lang.id ? <span className="w-2 h-2 rounded-full bg-emerald-600" /> : !canUse ? <Lock size={12} /> : null}</button>; })}</div>}
        </div>
        <button type="button" onClick={() => setShowAccountSwitcher(true)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">{displayName?.[0] || 'U'}</div><span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">{displayName || 'Bạn'}</span><ProBadge className="hidden sm:inline-flex" /></button>
        {showAccountSwitcher && <AccountSwitcherModal isOpen={showAccountSwitcher} onClose={closeAccountSwitcher} />}
      </div>
    </header>
  );
}
