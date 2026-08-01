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
        if (error) {
          return { error: error.message };
        }
        return data.user ? { userId: data.user.id } : { error: 'Không thể xác thực thông tin tài khoản.' };
      } catch (err: any) {
        return { error: err?.message || REMOTE_AUTH_UNAVAILABLE };
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const user = userService.findLocalUserByEmail(cleanEmail);
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
          throw error || new Error(REMOTE_AUTH_UNAVAILABLE);
        }

        // Supabase Auth owns the identity. There is intentionally no local
        // mirror account to bypass a missing, rejected, or unverified session.
        return { userId: data.user.id, requiresEmailConfirmation: !data.session, accountIndex: 1 };
      } catch (error) {
        const message = error instanceof Error && error.message.trim() ? error.message : REMOTE_AUTH_UNAVAILABLE;
        throw new Error(message);
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
          options: { redirectTo: window.location.origin },
        });
        return error ? { error: error.message } : {};
      } catch {
        return { error: REMOTE_AUTH_UNAVAILABLE };
      }
    }

    // Local mode fallback for offline testing
    const demoEmail = 'demo.tester@echlearn.io';
    let localUser = userService.findLocalUserByEmail(demoEmail);
    if (!localUser) {
      localUser = userService.createLocalUser(demoEmail, 'Học Viên Demo');
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
