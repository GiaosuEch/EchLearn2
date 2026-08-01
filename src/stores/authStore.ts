import { create } from 'zustand';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import { useAppStore } from './appStore';

// === ADMIN WHITELIST: Only Khounguyennguyen2012@gmail.com is admin ===
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

  return {
    ...user,
    role,
    displayName,
    username,
    subscriptionTier: isAdminEmail ? 'pro' : (user.subscriptionTier || 'free'),
    hearts: isAdminEmail ? 99 : (user.hearts || 5),
    badges: isAdminEmail ? ['admin', 'creator', 'pro_tier', 'master_skin', 'early_adopter'] : (user.badges || []),
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string, username?: string) => Promise<{success: boolean, error?: string, accountIndex?: number}>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setRole: (role: 'user' | 'admin') => void;
  setSubscriptionTier: (tier: 'free' | 'go' | 'plus' | 'pro') => void;
  resetAllAccounts: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      // 1. When Supabase Auth is configured, session is the ONLY authority
      if (isSupabaseConfigured() && supabase) {
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

            const savedAvatar = localStorage.getItem(`echlern_profile_avatar_${userId}`);
            const savedBanner = localStorage.getItem(`echlern_profile_banner_${userId}`);
            const savedBio = localStorage.getItem(`echlern_profile_bio_${userId}`);
            const savedStatus = localStorage.getItem(`echlern_profile_status_${userId}`);

            const activeProfile = {
              ...profile!,
              avatarUrl: profile?.avatarUrl || savedAvatar || undefined,
              bannerUrl: profile?.bannerUrl || savedBanner || undefined,
              bio: profile?.bio || savedBio || undefined,
              customStatus: profile?.customStatus || savedStatus || undefined,
            };

            localStorage.setItem('echlern_current_user_id', userId);
            await applyUserSettings(activeProfile.id);
            const fullProfile = sanitizeUser({
              ...resolveDefaults(sessionEmail),
              ...activeProfile,
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

          const savedAvatar = localStorage.getItem(`echlern_profile_avatar_${userId}`);
          const savedBanner = localStorage.getItem(`echlern_profile_banner_${userId}`);
          const savedBio = localStorage.getItem(`echlern_profile_bio_${userId}`);
          const savedStatus = localStorage.getItem(`echlern_profile_status_${userId}`);

          const activeProfile = {
            ...profile!,
            avatarUrl: profile?.avatarUrl || savedAvatar || undefined,
            bannerUrl: profile?.bannerUrl || savedBanner || undefined,
            bio: profile?.bio || savedBio || undefined,
            customStatus: profile?.customStatus || savedStatus || undefined,
          };

          localStorage.setItem('echlern_current_user_id', userId);
          await applyUserSettings(activeProfile.id);
          const fullProfile = sanitizeUser({
            ...resolveDefaults(sessionEmail),
            ...activeProfile,
            id: userId,
            email: sessionEmail,
          });
          set({ user: fullProfile, isAuthenticated: true, isLoading: false, isInitialized: true });
          return;
        } else {
          const hasOAuthCallbackInUrl =
            window.location.hash.includes('access_token=') ||
            window.location.search.includes('code=') ||
            window.location.hash.includes('type=recovery') ||
            window.location.href.includes('grant_type=');

          if (!hasOAuthCallbackInUrl) {
            localStorage.removeItem('echlern_current_user_id');
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          } else {
            set({ isLoading: true, isInitialized: false });
          }
          return;
        }
      }

      // 2. Offline dev mode fallback only when Supabase is not configured
      const storedUserId = localStorage.getItem('echlern_current_user_id');
      if (storedUserId) {
        const localUser = userService.getLocalUser(storedUserId);
        if (localUser) {
          await applyUserSettings(localUser.id);
          const fullLocalUser = sanitizeUser({
            ...resolveDefaults(localUser.email),
            ...localUser,
          });
          set({ user: fullLocalUser, isAuthenticated: true, isLoading: false, isInitialized: true });
          return;
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    } catch (err) {
      console.warn('Auth initialization error:', err);
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const { userId, error } = await authService.signIn(email, password);
    if (error) {
      set({ isLoading: false });
      return { success: false, error };
    }

    if (userId) {
      let profile = await profileService.getProfile(userId);
      if (!profile) {
        profile = userService.getLocalUser(userId);
      }
      if (profile) {
        localStorage.setItem('echlern_current_user_id', userId);
        await applyUserSettings(profile.id);
        const defaults = resolveDefaults(profile.email || email);
        const sanitized = sanitizeUser({ ...defaults, ...profile });
        set({ user: sanitized, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    }

    set({ isLoading: false });
    return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
  },

  register: async (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string, username?: string) => {
    set({ isLoading: true });

    try {
      const { userId, requiresEmailConfirmation, accountIndex, error } = await authService.signUp(email, password, displayName, nativeLanguage, targetLanguage, username);
      
      if (error) {
        set({ isLoading: false });
        return { success: false, error };
      }

      if (requiresEmailConfirmation) {
        set({ isLoading: false });
        return { success: true, error: 'Vui lòng kiểm tra email để xác nhận tài khoản.', accountIndex };
      }

      if (userId) {
        if (isSupabaseConfigured() && supabase) {
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
            await applyUserSettings(profile.id);
            const defaults = resolveDefaults(email);
            const sanitized = sanitizeUser({ ...defaults, ...profile });
            set({ user: sanitized, isAuthenticated: true, isLoading: false });
            return { success: true, accountIndex };
          }
        }
        
        // Fallback to local user
        const localUser = userService.getLocalUser(userId);
        if (localUser) {
          localStorage.setItem('echlern_current_user_id', userId);
          await applyUserSettings(localUser.id);
          const defaults = resolveDefaults(email);
          const sanitized = sanitizeUser({ ...defaults, ...localUser });
          set({ user: sanitized, isAuthenticated: true, isLoading: false });
          return { success: true, accountIndex };
        }
      }
      
      set({ isLoading: false });
      return { success: false, error: 'Đăng ký không thành công. Vui lòng thử lại.' };
    } catch (err: any) {
      console.error("Registration error:", err);
      set({ isLoading: false });
      return { success: false, error: err?.message || err?.toString() || 'Đã xảy ra lỗi trong quá trình đăng ký.' };
    }
  },

  logout: async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    localStorage.removeItem('echlern_current_user_id');
    sessionStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;
    
    // Save to local storage for instant persistence
    if (updates.bio !== undefined) localStorage.setItem(`echlern_profile_bio_${user.id}`, updates.bio);
    if (updates.customStatus !== undefined) localStorage.setItem(`echlern_profile_status_${user.id}`, updates.customStatus);
    if (updates.avatarUrl !== undefined) localStorage.setItem(`echlern_profile_avatar_${user.id}`, updates.avatarUrl);
    if (updates.bannerUrl !== undefined) localStorage.setItem(`echlern_profile_banner_${user.id}`, updates.bannerUrl);

    // 1. Update local user database
    userService.updateLocalUser(user.id, updates);

    // 2. Immediately update active store state
    const updatedUser = sanitizeUser({ ...user, ...updates });
    set({ user: updatedUser });

    // 3. Try updating remote Supabase profile
    try {
      await profileService.updateProfile(user.id, updates);
    } catch (e) {
      console.warn("Supabase profile update warning:", e);
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
    const adminUser = userService.resetAllAccounts();
    const sanitized = sanitizeUser(adminUser);
    set({ user: sanitized, isAuthenticated: true });
  }
}));
