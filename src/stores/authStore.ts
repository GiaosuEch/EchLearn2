import { create } from 'zustand';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import { useAppStore } from './appStore';


const applyUserSettings = async (userId: string) => {
  const settings = await settingsService.getSettings(userId);
  if (!settings) return;
  const app = useAppStore.getState();
  app.setInterfaceLanguage(settings.interfaceLanguage);
  app.setNativeLanguage(settings.nativeLanguage);
  app.setCurrentLanguage(settings.targetLanguage);
  app.setTheme(settings.theme);
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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, // Start with no user until initialized
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await profileService.getProfile(session.user.id);
        if (profile) {
          await applyUserSettings(profile.id);
          set({ user: profile, isAuthenticated: true });
          return;
        }
      }
    }
    
    // Attempt to load from localStorage for local mode
    const storedUserId = localStorage.getItem('echlern_current_user_id');
    if (storedUserId) {
      const localUser = userService.getLocalUser(storedUserId);
      if (localUser) {
        await applyUserSettings(localUser.id);
        set({ user: localUser, isAuthenticated: true });
        return;
      }
    }
    set({ user: null, isAuthenticated: false });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const userId = await authService.signIn(email, password);
    if (userId) {
      const profile = await profileService.getProfile(userId);
      if (profile) {
        localStorage.setItem('echlern_current_user_id', userId);
        await applyUserSettings(profile.id);
        set({ user: profile, isAuthenticated: true, isLoading: false });
        return true;
      }
    }

    set({ isLoading: false });
    return false;
  },

  register: async (email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string) => {
    set({ isLoading: true });

    try {
      const { userId, requiresEmailConfirmation } = await authService.signUp(email, password, displayName, nativeLanguage, targetLanguage);
      
      if (requiresEmailConfirmation) {
        set({ isLoading: false });
        return { success: true, error: 'Vui lòng kiểm tra email để xác nhận tài khoản.' };
      }

      if (userId) {
        // Wait for profile to be created by trigger
        let profile = null;
        for (let i = 0; i < 5; i++) {
          profile = await profileService.getProfile(userId);
          if (profile) break;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (profile) {
          localStorage.setItem('echlern_current_user_id', userId);
          await applyUserSettings(profile.id);
          set({ user: profile, isAuthenticated: true, isLoading: false });
          return { success: true };
        } else {
          set({ isLoading: false });
          return { success: false, error: 'Account created but profile creation timed out. You may be able to log in now.' };
        }
      }
      
      set({ isLoading: false });
      return { success: false, error: 'Registration failed for unknown reason.' };
    } catch (err: any) {
      console.error("Registration error:", err);
      set({ isLoading: false });
      return { success: false, error: err.message || 'An error occurred during registration.' };
    }
  },

  logout: async () => {
    await authService.signOut();
    localStorage.removeItem('echlern_current_user_id');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;
    
    const success = await profileService.updateProfile(user.id, updates);
    if (success) {
      set({ user: { ...user, ...updates } });
    }
  }
}));
