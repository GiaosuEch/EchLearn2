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
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const user = useAuthStore(s => s.user);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const currentLang = supportedLanguages.find(language => language.id === currentLanguage) || supportedLanguages[0];

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setShowLangDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md relative z-[70]">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-400" aria-label={t('common.menu', { defaultValue: 'Menu' })}><Menu size={20} /></button>
        <div className="hidden sm:flex items-center gap-2 bg-dark-800/60 rounded-xl px-4 py-2 w-64 lg:w-80 border border-dark-700/50 focus-within:border-primary-500/50 transition-colors">
          <Search size={16} className="text-dark-500" />
          <input type="text" placeholder={t('common.search')} className="bg-transparent border-none outline-none text-sm text-dark-200 placeholder-dark-500 w-full" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isSupabaseConfigured() ? 'bg-success/10 text-success border-success/20' : 'bg-dark-800 text-dark-400 border-dark-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-success animate-pulse' : 'bg-dark-500'}`} />
          {isSupabaseConfigured() ? t('common.supabase_live', { defaultValue: 'Supabase Live' }) : t('common.local_mode', { defaultValue: 'Local Mode' })}
        </div>

        <div className="relative" ref={langRef}>
          <button onClick={() => setShowLangDropdown(value => !value)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-700" aria-expanded={showLangDropdown}>
            <span className="text-xl">{currentLang.flag}</span>
            <span className="text-sm font-bold text-white hidden sm:block uppercase">{currentLang.id}</span>
          </button>
          {showLangDropdown && (
            <div className="fixed right-4 top-16 mt-2 w-72 max-h-[70vh] overflow-y-auto bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-[9999] p-2">
              <div className="px-3 py-2 text-xs uppercase tracking-wide text-dark-500 font-bold">{t('settings.learning_language')}</div>
              {supportedLanguages.map(language => (
                <button key={language.id} onClick={() => { setCurrentLanguage(language.id); setShowLangDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 transition-colors text-left ${currentLanguage === language.id ? 'bg-primary-500/10 text-primary-400 font-bold' : 'text-white'}`}>
                  <span className="text-xl">{language.flag}</span>
                  <span className="text-sm flex-1">{language.nativeName}</span>
                  <span className="text-xs text-dark-500 uppercase">{language.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(value => !value)} className="relative p-2 rounded-xl hover:bg-dark-800 text-dark-400 transition-colors" aria-label={t('common.notifications')}><Bell size={20} /></button>
          {showNotifications && (
            <div className="fixed right-4 top-16 mt-2 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-[9999] py-2 w-80 max-h-[70vh] overflow-y-auto">
              <div className="px-4 py-2 border-b border-dark-700 font-semibold text-sm text-white">{t('common.notifications')}</div>
              <div className="px-4 py-8 text-center text-dark-400 text-sm">{t('empty.no_notifications', { defaultValue: 'No notifications yet.' })}</div>
            </div>
          )}
        </div>

        <Link to="/app/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-dark-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : (user?.displayName?.charAt(0) || 'U')}
          </div>
          <span className="hidden md:inline text-sm text-dark-300">{user?.displayName?.split(' ')[0] || t('profile.username')}</span>
        </Link>
      </div>
    </header>
  );
}
