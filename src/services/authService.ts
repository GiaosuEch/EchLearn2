import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { userService } from './userService';

export const authService = {
  async signIn(email: string, password: string): Promise<string | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return null;
      return data.user.id;
    }

    await new Promise(resolve => setTimeout(resolve, 350));
    const localUser = userService.findLocalUserByEmail(email);
    return localUser ? localUser.id : null;
  },

  async signUp(email: string, password: string, displayName: string, nativeLanguage?: string, targetLanguage?: string): Promise<{userId: string, requiresEmailConfirmation: boolean}> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            native_language: nativeLanguage || 'vi',
            interface_language: nativeLanguage || 'vi',
            target_languages: targetLanguage ? [targetLanguage] : ['en'],
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from signup');
      return { userId: data.user.id, requiresEmailConfirmation: !data.session };
    }

    await new Promise(resolve => setTimeout(resolve, 350));
    const newUser = userService.createLocalUser(email, displayName);
    if (nativeLanguage) newUser.nativeLanguage = nativeLanguage;
    if (targetLanguage) newUser.targetLanguages = [targetLanguage];
    userService.updateLocalUser(newUser.id, newUser);
    return { userId: newUser.id, requiresEmailConfirmation: false };
  },

  async signInWithProvider(provider: 'google' | 'github'): Promise<{ error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Local mode does not support OAuth. Configure Supabase in production.' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/app` },
    });
    return { error: error?.message };
  },

  async resetPassword(email: string): Promise<{ error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      return { error: error?.message };
    }

    await new Promise(resolve => setTimeout(resolve, 350));
    return {};
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) await supabase.auth.signOut();
  },
};
