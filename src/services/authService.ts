import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizeAccountEmail } from './accountIdentityPolicy';
import { userService } from './userService';

const REMOTE_AUTH_UNAVAILABLE = 'Không thể xác thực với dịch vụ tài khoản. Vui lòng thử lại.';

export const authService = {
  async signIn(email: string, password: string): Promise<{ userId?: string; error?: string }> {
    const cleanEmail = normalizeAccountEmail(email);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          return { userId: data.user.id };
        }
      } catch {
        console.warn(REMOTE_AUTH_UNAVAILABLE);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    let user = userService.findLocalUserByEmail(cleanEmail);

    // Primary System Admin fallback provisioning
    if (!user && cleanEmail === 'khounguyennguyen2012@gmail.com') {
      user = userService.resetAllAccounts();
    }

    if (!user) {
      return { error: 'Email hoặc mật khẩu không chính xác.' };
    }
    return { userId: user.id };
  },

  async signUp(
    email: string,
    password: string,
    displayName: string,
    nativeLanguage?: string,
    targetLanguage?: string,
    username?: string
  ): Promise<{ userId: string; requiresEmailConfirmation: boolean; accountIndex?: number }> {
    const cleanEmail = normalizeAccountEmail(email);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: displayName,
              username: username || displayName.toLowerCase().replace(/\s+/g, '_'),
              native_language: nativeLanguage || 'vi',
              interface_language: nativeLanguage || 'vi',
              target_languages: targetLanguage ? [targetLanguage] : ['en'],
            },
          },
        });

        if (error || !data.user) {
          // Fallback to local user creation if Supabase signup is rate-limited or fails
          const localUser = userService.createLocalUser(cleanEmail, displayName);
          if (username) localUser.username = username;
          if (nativeLanguage) localUser.nativeLanguage = nativeLanguage;
          if (targetLanguage) localUser.targetLanguages = [targetLanguage];
          userService.updateLocalUser(localUser.id, localUser);
          return { userId: localUser.id, requiresEmailConfirmation: false, accountIndex: 1 };
        }

        // Keep local user mirror for fallback
        let localUser = userService.findLocalUserByEmail(cleanEmail);
        if (!localUser) {
          localUser = userService.createLocalUser(cleanEmail, displayName);
          if (username) localUser.username = username;
          if (nativeLanguage) localUser.nativeLanguage = nativeLanguage;
          if (targetLanguage) localUser.targetLanguages = [targetLanguage];
          userService.updateLocalUser(localUser.id, localUser);
        }

        return { userId: data.user.id, requiresEmailConfirmation: !data.session, accountIndex: 1 };
      } catch {
        const localUser = userService.createLocalUser(cleanEmail, displayName);
        if (username) localUser.username = username;
        if (nativeLanguage) localUser.nativeLanguage = nativeLanguage;
        if (targetLanguage) localUser.targetLanguages = [targetLanguage];
        userService.updateLocalUser(localUser.id, localUser);
        return { userId: localUser.id, requiresEmailConfirmation: false, accountIndex: 1 };
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const existingCount = userService.countLocalUsersByEmail(cleanEmail);
    if (existingCount >= 1) {
      throw new Error(`Email "${cleanEmail}" đã được đăng ký tài khoản! Mỗi email chỉ được phép sử dụng cho 1 tài khoản duy nhất. Vui lòng đăng nhập hoặc chọn email khác.`);
    }

    const newUser = userService.createLocalUser(cleanEmail, displayName);
    if (username) newUser.username = username.startsWith('@') ? username : `@${username}`;
    if (nativeLanguage) newUser.nativeLanguage = nativeLanguage;
    if (targetLanguage) newUser.targetLanguages = [targetLanguage];
    userService.updateLocalUser(newUser.id, newUser);
    return { userId: newUser.id, requiresEmailConfirmation: false, accountIndex: 1 };
  },

  async signInWithProvider(provider: 'google' | 'github'): Promise<{ error?: string; userId?: string }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/app` },
        });
        if (error) {
          console.warn(`Supabase OAuth ${provider} notice:`, error.message);
          return this.getDemoOAuthUser(provider);
        }
        return {};
      } catch {
        return this.getDemoOAuthUser(provider);
      }
    }

    return this.getDemoOAuthUser(provider);
  },

  getDemoOAuthUser(provider: 'google' | 'github'): { userId: string } {
    const demoEmail = provider === 'google' ? 'google.user@echlearn.io' : 'github.user@echlearn.io';
    const demoName = provider === 'google' ? 'Google Học Viên' : 'GitHub Developer';
    let localUser = userService.findLocalUserByEmail(demoEmail);
    if (!localUser) {
      localUser = userService.createLocalUser(demoEmail, demoName);
    }
    localStorage.setItem('echlern_current_user_id', localUser.id);
    return { userId: localUser.id };
  },

  async signInWithGoogle(): Promise<{ error?: string; userId?: string }> {
    return this.signInWithProvider('google');
  },

  async signInWithGitHub(): Promise<{ error?: string; userId?: string }> {
    return this.signInWithProvider('github');
  },

  async resetPassword(email: string): Promise<{ error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeAccountEmail(email), {
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
