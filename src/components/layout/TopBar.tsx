import { Bell, Menu, Search } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { supportedLanguages } from '../../utils/languageUtils';

export default function TopBar() {
  const { t } = useTranslation();
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const user = useAuthStore(s => s.user);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const tierColors: Record<string, string> = {
    free: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
    go: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20',
    plus: 'text-amber-400 bg-amber-950/30 border-amber-500/20',
    pro: 'text-purple-400 bg-purple-950/30 border-purple-500/20',
  };
  const tierLabel = (user?.subscriptionTier || 'free').toUpperCase();
  const tierStyle = tierColors[user?.subscriptionTier || 'free'] || tierColors.free;

  return (
    <header className="atelier-surface atelier-surface--surface h-16 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 lg:px-6 border-b border-dark-700/30 bg-dark-900/70 relative z-[70]">
      <div className="flex items-center gap-3 min-w-0">
        <button id="app-sidebar-toggle" type="button" onClick={toggleSidebar} className="lg:hidden min-h-11 min-w-11 rounded-lg hover:bg-dark-800 text-dark-400 transition-colors" aria-label={t('common.menu')} aria-controls="app-sidebar" aria-expanded={sidebarOpen}><Menu size={20} aria-hidden="true" /></button>
        <div className="hidden sm:flex items-center gap-2 bg-dark-800/40 rounded-xl px-4 py-2 w-64 lg:w-80 border border-dark-700/30 focus-within:border-emerald-500/40 focus-within:bg-dark-800/60 transition-all duration-300">
          <Search size={16} className="text-dark-500" />
          <input type="text" placeholder={t('common.search')} aria-label={t('common.search', { defaultValue: 'Search' })} className="bg-transparent border-none outline-none text-sm text-dark-200 placeholder-dark-500 w-full" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isSupabaseConfigured() ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' : 'bg-dark-800/50 text-dark-400 border-dark-700/30'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'}`} />
          {isSupabaseConfigured() ? t('common.supabase_live', { defaultValue: 'Supabase Live' }) : t('common.local_mode', { defaultValue: 'Local Mode' })}
        </div>

        {/* Tier badge */}
        <div className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${tierStyle}`}>
          {tierLabel}
        </div>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button ref={languageTriggerRef} id="language-menu-button" type="button" onClick={() => setShowLangDropdown(value => !value)} className="flex min-h-11 items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-dark-800/60 transition-all duration-200 border border-transparent hover:border-dark-700/30" aria-label={t('settings.learning_language')} aria-controls="language-menu" aria-expanded={showLangDropdown} aria-haspopup="dialog">
            <span className="text-xl">{currentLang.flag}</span>
            <span className="text-sm font-bold text-white hidden sm:block uppercase">{currentLang.id}</span>
          </button>
          {showLangDropdown && (
            <div id="language-menu" role="dialog" aria-labelledby="language-menu-heading" className="fixed right-4 top-16 mt-2 w-72 max-h-[70vh] overflow-y-auto bg-dark-800/95 border border-dark-700/50 rounded-xl shadow-2xl z-[9999] p-2">
              <h2 id="language-menu-heading" className="px-3 py-2 text-xs uppercase tracking-wide text-dark-500 font-bold">{t('settings.learning_language')}</h2>
              {supportedLanguages.map(language => (
                <button key={language.id} onClick={() => { setCurrentLanguage(language.id); setShowLangDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700/60 transition-colors text-left ${currentLanguage === language.id ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-white'}`}>
                  <span className="text-xl">{language.flag}</span>
                  <span className="text-sm flex-1">{language.nativeName}</span>
                  <span className="text-xs text-dark-500 uppercase">{language.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button ref={notificationsTriggerRef} id="notifications-menu-button" type="button" onClick={() => setShowNotifications(value => !value)} className="relative min-h-11 min-w-11 rounded-xl hover:bg-dark-800/60 text-dark-400 hover:text-dark-200 transition-all duration-200" aria-label={t('common.notifications')} aria-controls="notifications-menu" aria-expanded={showNotifications} aria-haspopup="dialog"><Bell size={20} aria-hidden="true" /></button>
          {showNotifications && (
            <div id="notifications-menu" role="dialog" aria-labelledby="notifications-menu-heading" className="fixed right-4 top-16 mt-2 bg-dark-800/95 border border-dark-700/50 rounded-xl shadow-2xl z-[9999] py-2 w-80 max-h-[70vh] overflow-y-auto">
              <h2 id="notifications-menu-heading" className="px-4 py-2 border-b border-dark-700/50 font-semibold text-sm text-white">{t('common.notifications', { defaultValue: 'Notifications' })}</h2>
              <div className="px-4 py-8 text-center text-dark-400 text-sm">{t('empty.no_notifications', { defaultValue: 'No notifications yet.' })}</div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <Link to="/app/profile" aria-label={t('profile.username', { defaultValue: 'Profile' })} className="flex min-h-11 items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-dark-800/60 transition-all duration-200 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500/60 transition-colors">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Avatar" /> : <img src="/mascots/pepe_mascot_avatar.png" className="w-full h-full object-cover" alt="Pepe Avatar" />}
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{user?.displayName?.split(' ')[0] || t('profile.username')}</span>
            {user?.role === 'admin' && (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">ADMIN</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
