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
        if (!data.user) {
          return { error: 'Không nhận được dữ liệu phản hồi từ Supabase Auth.' };
        }
        return { userId: data.user.id };
      } catch (err: any) {
        return { error: err?.message || REMOTE_AUTH_UNAVAILABLE };
      }
    }

    // Offline local environment fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    let user = userService.findLocalUserByEmail(cleanEmail);

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
  ): Promise<{ userId?: string; requiresEmailConfirmation?: boolean; error?: string; accountIndex?: number }> {
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

        if (error) {
          return { error: error.message };
        }

        if (!data.user) {
          return { error: 'Không thể khởi tạo tài khoản trên Supabase Auth.' };
        }

        return { userId: data.user.id, requiresEmailConfirmation: !data.session, accountIndex: 1 };
      } catch (err: any) {
        return { error: err?.message || REMOTE_AUTH_UNAVAILABLE };
      }
    }

    // Offline local environment fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingCount = userService.countLocalUsersByEmail(cleanEmail);
    if (existingCount >= 1) {
      return { error: `Email "${cleanEmail}" đã được đăng ký tài khoản! Mỗi email chỉ được phép sử dụng cho 1 tài khoản duy nhất. Vui lòng đăng nhập hoặc chọn email khác.` };
    }

    const newUser = userService.createLocalUser(cleanEmail, displayName);
    if (username) newUser.username = username.startsWith('@') ? username : `@${username}`;
    if (nativeLanguage) newUser.nativeLanguage = nativeLanguage;
    if (targetLanguage) newUser.targetLanguages = [targetLanguage];
    userService.updateLocalUser(newUser.id, newUser);
    return { userId: newUser.id, requiresEmailConfirmation: false, accountIndex: 1 };
  },

  async signInWithProvider(provider: 'google' | 'github'): Promise<{ error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/app` },
        });
        if (error) {
          return { error: error.message };
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || REMOTE_AUTH_UNAVAILABLE };
      }
    }

    return { error: 'Chưa cấu hình Supabase Auth API trên môi trường này.' };
  },

  async signInWithGoogle(): Promise<{ error?: string }> {
    return this.signInWithProvider('google');
  },

  async signInWithGitHub(): Promise<{ error?: string }> {
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
