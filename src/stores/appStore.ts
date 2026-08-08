import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_ACCENT_PALETTE_ID, DEFAULT_MASCOT_SKIN_ID } from '../data/customization';
import { useAuthStore } from './authStore';
import { useEntitlementStore } from './entitlementStore';
import { canUseEntitlementLanguages, findActiveEntitlement } from '../services/entitlementService';
import { readLocalProFlags, highestPlan, planUnlocksPro } from '../services/proAccessService';
import { settingsService } from '../services/settingsService';

interface AppState {
  currentLanguage: string; // Target learning language
  interfaceLanguage: string; // UI language
  nativeLanguage: string;
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  isMobile: boolean;
  soundEffects: boolean;
  speechSpeed: 'normal' | 'slow';
  fontSize: 'small' | 'medium' | 'large';
  dailyXpGoal: number;
  ieltsTargetBand: number;
  privacyMode: boolean;
  accentPaletteId: string;
  mascotSkinId: string;
  uiSurface: 'glass' | 'solid' | 'cozy' | 'compact';
  mascotAnimation: boolean;
  seasonalEffects: boolean;
  
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentLanguage: (lang: string) => void;
  setInterfaceLanguage: (lang: string) => void;
  setNativeLanguage: (lang: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsMobile: (mobile: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setSpeechSpeed: (speed: 'normal' | 'slow') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setDailyXpGoal: (goal: number) => void;
  setIeltsTargetBand: (band: number) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setAccentPaletteId: (id: string) => void;
  setMascotSkinId: (id: string) => void;
  setUiSurface: (surface: 'glass' | 'solid' | 'cozy' | 'compact') => void;
  setMascotAnimation: (enabled: boolean) => void;
  setSeasonalEffects: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      interfaceLanguage: 'vi',
      nativeLanguage: 'vi',
      sidebarOpen: true,
      theme: 'light',
      isMobile: false,
      soundEffects: true,
      speechSpeed: 'normal',
      fontSize: 'medium',
      dailyXpGoal: 50,
      ieltsTargetBand: 7.0,
      privacyMode: false,
      accentPaletteId: DEFAULT_ACCENT_PALETTE_ID,
      mascotSkinId: DEFAULT_MASCOT_SKIN_ID,
      uiSurface: 'solid',
      mascotAnimation: true,
      seasonalEffects: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentLanguage: (lang) => {
        const user = useAuthStore.getState().user;
        const records = useEntitlementStore.getState().records;
        const activeEnt = user ? findActiveEntitlement(records, user.id) : null;
        const ledgerPlan = activeEnt?.plan || 'free';
        const localFlags = user ? readLocalProFlags(user.id) : null;
        const effectivePlan = highestPlan(localFlags?.plan, ledgerPlan);
        const isAdminOrPro = user?.role === 'admin' || localFlags?.role === 'admin' || Boolean(localFlags?.isPro) || planUnlocksPro(effectivePlan);

        const canUse = isAdminOrPro || canUseEntitlementLanguages(effectivePlan, [lang]);
        if (!canUse) {
          set({ currentLanguage: 'en' });
          return;
        }
        set({ currentLanguage: lang });
      },
      setInterfaceLanguage: (lang) => {
        set({ interfaceLanguage: lang });
        import('i18next').then(i18n => i18n.default.changeLanguage(lang));
      },
      setNativeLanguage: (lang) => set({ nativeLanguage: lang }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          document.documentElement.classList.toggle('light', theme === 'light');
          document.documentElement.dataset.theme = theme;
        }
        const user = useAuthStore.getState().user;
        if (user?.id) {
          void settingsService.saveSettings(user.id, { theme });
        }
      },
      setIsMobile: (mobile) => set({ isMobile: mobile }),
      setSoundEffects: (enabled) => set({ soundEffects: enabled }),
      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
      setFontSize: (size) => {
        set({ fontSize: size });
        if (size === 'small') document.documentElement.style.fontSize = '14px';
        else if (size === 'large') document.documentElement.style.fontSize = '18px';
        else document.documentElement.style.fontSize = '16px';
      },
      setDailyXpGoal: (goal) => set({ dailyXpGoal: goal }),
      setIeltsTargetBand: (band) => set({ ieltsTargetBand: band }),
      setPrivacyMode: (enabled) => set({ privacyMode: enabled }),
      setAccentPaletteId: (id) => set({ accentPaletteId: id }),
      setMascotSkinId: (id) => set({ mascotSkinId: id }),
      setUiSurface: (surface) => set({ uiSurface: surface }),
      setMascotAnimation: (enabled) => set({ mascotAnimation: enabled }),
      setSeasonalEffects: (enabled) => set({ seasonalEffects: enabled }),
    }),
    {
      name: 'echlern-app-storage',
      version: 2,
      migrate: (persisted: any, version: number) => {
        if (version < 2) {
          return { ...persisted, theme: 'light' };
        }
        return persisted;
      },
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        interfaceLanguage: state.interfaceLanguage,
        nativeLanguage: state.nativeLanguage,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        soundEffects: state.soundEffects,
        speechSpeed: state.speechSpeed,
        fontSize: state.fontSize,
        dailyXpGoal: state.dailyXpGoal,
        ieltsTargetBand: state.ieltsTargetBand,
        privacyMode: state.privacyMode,
        accentPaletteId: state.accentPaletteId,
        mascotSkinId: state.mascotSkinId,
        uiSurface: state.uiSurface,
        mascotAnimation: state.mascotAnimation,
        seasonalEffects: state.seasonalEffects,
      }),
    }
  )
);
