import { create } from 'zustand';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import { useAppStore } from './appStore';
import { EventBusService, SystemEvents } from '../lib/events/EventBus';

const ADMIN_EMAIL = 'khounguyennguyen2012@gmail.com';
const ADMIN_USERNAME = 'GiaosuEch';

function resolveRole(email?: string): 'admin' | 'user' {
  if (email && email.toLowerCase() === ADMIN_EMAIL) return 'admin';
  return 'user';
}

function sanitizeUser(user: User): User {
  const cleanEmail = (user.email || '').toLowerCase().trim();
  const isAdminEmail = cleanEmail === ADMIN_EMAIL;
  const role = isAdminEmail ? 'admin' : 'user';

  const isReservedAdminName = (name?: string) => {
    if (!name) return false;
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.includes('giaosuech') || clean === 'giaosu';
  };

  let displayName = user.displayName;
  let username = user.username;

  if (isAdminEmail) {
    displayName = ADMIN_USERNAME;
    username = ADMIN_USERNAME;
  } else {
    if (!displayName || isReservedAdminName(displayName)) {
      displayName = cleanEmail ? cleanEmail.split('@')[0] : 'Học Viên Ếch';
    }
    if (!username || isReservedAdminName(username)) {
      username = `user_${user.id.slice(0, 6)}`;
    }
  }

  const subscriptionTier = isAdminEmail ? 'pro' : (user.subscriptionTier || 'free');
  const isPro = isAdminEmail || user.isPro === true || subscriptionTier === 'pro' || subscriptionTier === 'plus';

  return {
    ...user,
    role,
    displayName,
    username,
    subscriptionTier,
    isPro,
    hearts: isAdminEmail ? 99 : (user.hearts || 5),
    badges: isAdminEmail
      ? ['admin', 'creator', 'pro_tier', 'master_skin', 'early_adopter']
      : isPro
      ? Array.from(new Set([...(user.badges || []), 'pro_tier']))
      : (user.badges || []),
  };
}

function resolveDefaults(email?: string): { role: 'admin' | 'user'; subscriptionTier: 'free' | 'go' | 'plus' | 'pro' } {
  const role = resolveRole(email);
  return {
    role,
    subscriptionTier: role === 'admin' ? 'pro' : 'free',
  };
}

const applyUserSettings = async (userId: string) => {
  const settings = await settingsService.getSettings(userId);
  if (!settings) return;
  const app = useAppStore.getState();
  app.setInterfaceLanguage(settings.interfaceLanguage);
  app.setNativeLanguage(settings.nativeLanguage);
  app.setCurrentLanguage(settings.targetLanguage);
  app.setTheme(settings.theme || 'light');
  app.setSoundEffects(settings.soundEffects);
  app.setSpeechSpeed(settings.speechSpeed);
  app.setFontSize(settings.fontSize);
  app.setDailyXpGoal(settings.dailyXpGoal);
  app.setIeltsTargetBand(settings.ieltsTargetBand);
  app.setPrivacyMode(!settings.publicProfile);
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string, username?: string, captchaToken?: string) => Promise<{success: boolean, error?: string, accountIndex?: number}>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  setRole: (role: 'user' | 'admin') => void;
  setSubscriptionTier: (tier: 'free' | 'go' | 'plus' | 'pro') => void;
  resetAllAccounts: () => void;
  eventBus: EventBusService | null;
  initialize: (eventBus: EventBusService) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state
  isInitialized: false,
  eventBus: null,

  initialize: async (eventBus: EventBusService) => {
    set({ eventBus });
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing or invalid.');
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session && session.user && session.user.id) {
          const userId = session.user.id;
          const sessionEmail = session.user.email?.toLowerCase() || '';
          const userMetadata = session.user.user_metadata || {};
          
          let profile = await profileService.getProfile(userId);
          
          if (!profile) {
            const name = userMetadata.full_name || userMetadata.name || (sessionEmail ? sessionEmail.split('@')[0] : 'Học Viên Ếch');
            profile = {
              id: userId,
              email: sessionEmail,
              displayName: name,
              username: userMetadata.username || `user_${userId.slice(0, 6)}`,
              nativeLanguage: 'vi',
              targetLanguages: ['en'],
              role: resolveRole(sessionEmail),
              subscriptionTier: resolveDefaults(sessionEmail).subscriptionTier,
              hearts: resolveRole(sessionEmail) === 'admin' ? 99 : 5,
              xp: 0,
              level: 1,
              streakDays: 1,
            } as any;
          }

          localStorage.setItem('echlern_current_user_id', userId);
          get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_IN, userId);
          await applyUserSettings(profile!.id);
          const fullProfile = sanitizeUser({
            ...resolveDefaults(sessionEmail),
            ...profile!,
            id: userId,
            email: sessionEmail,
          });
          set({ user: fullProfile, isAuthenticated: true, isLoading: false, isInitialized: true });
        } else {
          const hasOAuthCallbackInUrl =
            window.location.hash.includes('access_token=') ||
            window.location.search.includes('code=') ||
            window.location.hash.includes('type=recovery') ||
            window.location.href.includes('grant_type=');

          if (!hasOAuthCallbackInUrl) {
            localStorage.removeItem('echlern_current_user_id');
            get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_OUT);
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          }
        }
      });

      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes?.data?.session;
      
      if (session && session.user && session.user.id) {
        const userId = session.user.id;
        const sessionEmail = session.user.email?.toLowerCase() || '';
        const userMetadata = session.user.user_metadata || {};
        
        let profile = await profileService.getProfile(userId);
        
        if (!profile) {
          const name = userMetadata.full_name || userMetadata.name || (sessionEmail ? sessionEmail.split('@')[0] : 'Học Viên Ếch');
          profile = {
            id: userId,
            email: sessionEmail,
            displayName: name,
            username: userMetadata.username || `user_${userId.slice(0, 6)}`,
            nativeLanguage: 'vi',
            targetLanguages: ['en'],
            role: resolveRole(sessionEmail),
            subscriptionTier: resolveDefaults(sessionEmail).subscriptionTier,
            hearts: resolveRole(sessionEmail) === 'admin' ? 99 : 5,
            xp: 0,
            level: 1,
            streakDays: 1,
          } as any;
        }

        localStorage.setItem('echlern_current_user_id', userId);
        get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_IN, userId);
        await applyUserSettings(profile!.id);
        const fullProfile = sanitizeUser({
          ...resolveDefaults(sessionEmail),
          ...profile!,
          id: userId,
          email: sessionEmail,
        });
        set({ user: fullProfile, isAuthenticated: true, isLoading: false, isInitialized: true });
      } else {
        const hasOAuthCallbackInUrl =
          window.location.hash.includes('access_token=') ||
          window.location.search.includes('code=') ||
          window.location.hash.includes('type=recovery') ||
          window.location.href.includes('grant_type=');

        if (!hasOAuthCallbackInUrl) {
          localStorage.removeItem('echlern_current_user_id');
          get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_OUT);
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        } else {
          set({ isLoading: true, isInitialized: false });
        }
      }
    } catch (err) {
      console.warn('CRITICAL: Auth initialization failed - Database unreachable:', err);
      // Fallback for E2E Tests when Supabase is not available
      const localId = localStorage.getItem('echlern_current_user_id');
      if (localId) {
        let profile = null;
        try {
          const dbUsers = JSON.parse(localStorage.getItem('echlern_db_users') || '[]');
          profile = dbUsers.find((u: any) => u.id === localId) || null;
        } catch (e) {}
        
        if (profile) {
          get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_IN, localId);
          await applyUserSettings(profile.id);
          const defaults = resolveDefaults(profile.email);
          const sanitized = sanitizeUser({ ...defaults, ...profile });
          set({ user: sanitized, isAuthenticated: true, isLoading: false, isInitialized: true });
          return;
        }
      }
      // Strictly set to logged out if Supabase fails and no mock profile exists
      localStorage.removeItem('echlern_current_user_id');
      get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_OUT);
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  login: async (email: string, password: string, captchaToken?: string) => {
    set({ isLoading: true });
    
    if (!isSupabaseConfigured() || !supabase) {
      set({ isLoading: false });
      return { success: false, error: 'Hệ thống đang bảo trì, vui lòng thử lại sau.' };
    }

    try {
      const result = await authService.signIn(email, password, captchaToken);
      if (!result.ok) {
        set({ isLoading: false });
        return { success: false, error: result.error.message };
      }

      const { userId } = result.value;
      const profile = await profileService.getProfile(userId);
      
      if (profile) {
        localStorage.setItem('echlern_current_user_id', userId);
        get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_IN, userId);
        await applyUserSettings(profile.id);
        const defaults = resolveDefaults(profile.email || email);
        const sanitized = sanitizeUser({ ...defaults, ...profile });
        set({ user: sanitized, isAuthenticated: true, isLoading: false });
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Không thể tải thông tin hồ sơ từ máy chủ.' };
    } catch (error) {
      console.error("Login exception:", error);
      set({ isLoading: false });
      return { success: false, error: 'Lỗi kết nối máy chủ.' };
    }
  },

  register: async (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string, username?: string, captchaToken?: string) => {
    set({ isLoading: true });

    if (!isSupabaseConfigured() || !supabase) {
      set({ isLoading: false });
      return { success: false, error: 'Hệ thống đang bảo trì, vui lòng thử lại sau.' };
    }

    try {
      const result = await authService.signUp(email, password, displayName, nativeLanguage, targetLanguage, username, captchaToken);
      
      if (!result.ok) {
        set({ isLoading: false });
        return { success: false, error: result.error.message };
      }

      const { userId, requiresEmailConfirmation, accountIndex } = result.value;

      if (requiresEmailConfirmation) {
        set({ isLoading: false });
        return { success: true, error: 'Vui lòng kiểm tra email để xác nhận tài khoản.', accountIndex };
      }

      let profile = null;
      for (let i = 0; i < 3; i++) {
        profile = await profileService.getProfile(userId);
        if (profile) break;
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!profile) {
        const cleanEmail = email.toLowerCase().trim();
        profile = {
          id: userId,
          email: cleanEmail,
          displayName,
          username: username || displayName.toLowerCase().replace(/\s+/g, '_'),
          nativeLanguage: nativeLanguage || 'vi',
          targetLanguages: targetLanguage ? [targetLanguage] : ['en'],
          role: resolveRole(cleanEmail),
          subscriptionTier: resolveDefaults(cleanEmail).subscriptionTier,
          hearts: resolveRole(cleanEmail) === 'admin' ? 99 : 5,
          xp: 0,
          level: 1,
          streakDays: 1,
        } as any;
      }
      
      if (profile) {
        localStorage.setItem('echlern_current_user_id', userId);
        get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_IN, userId);
        await applyUserSettings(profile.id);
        const defaults = resolveDefaults(email);
        const sanitized = sanitizeUser({ ...defaults, ...profile });
        set({ user: sanitized, isAuthenticated: true, isLoading: false });
        return { success: true, accountIndex };
      }
      
      set({ isLoading: false });
      return { success: false, error: 'Đăng ký không thành công do lỗi khởi tạo hồ sơ.' };
    } catch (err: any) {
      console.error("Registration error:", err);
      set({ isLoading: false });
      return { success: false, error: err?.message || err?.toString() || 'Đã xảy ra lỗi kết nối.' };
    }
  },

  logout: async () => {
    try {
      if (supabase) {
        await authService.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    localStorage.removeItem('echlern_current_user_id');
    get().eventBus?.emit(SystemEvents.AUTH_USER_LOGGED_OUT);
    sessionStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user || !supabase) return false;
    
    // Optimistic Update to UI
    const updatedUser = sanitizeUser({ ...user, ...updates });
    set({ user: updatedUser });

    // Sync to Supabase Postgres (Single Source of Truth)
    try {
      const success = await profileService.updateProfile(user.id, updates);
      if (!success) {
        // Rollback on failure
        set({ user });
      }
      return success;
    } catch (e) {
      console.warn("Supabase profile update warning:", e);
      // Rollback on network failure
      set({ user });
      return false;
    }
  },

  setRole: (role: 'user' | 'admin') => {
    const { user } = get();
    // Only Khounguyennguyen2012@gmail.com can be admin
    if (user && user.email.toLowerCase() === ADMIN_EMAIL) {
      set({ user: { ...user, role } });
    }
  },

  setSubscriptionTier: (tier: 'free' | 'go' | 'plus' | 'pro') => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, subscriptionTier: tier } });
    }
  },

  resetAllAccounts: () => {
    console.error('SECURITY ALERT: Local resetAllAccounts called. This action is disabled in production.');
    throw new Error('Action strictly prohibited.');
  }
}));
