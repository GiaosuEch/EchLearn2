import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizeAccountEmail } from './accountIdentityPolicy';
import { userService } from './userService';
import { ok, fail, type PlatformResult } from '../types/result';
import { withRetry } from './resilience';
import { platformEventBus } from './platformEventBus';

const REMOTE_AUTH_UNAVAILABLE = 'Không thể xác thực với dịch vụ tài khoản. Vui lòng thử lại.';

interface SignInResult {
  userId: string;
}

interface SignUpResult {
  userId: string;
  requiresEmailConfirmation: boolean;
  accountIndex: number;
}

export const authService = {
  async signIn(email: string, password: string, captchaToken?: string): Promise<PlatformResult<SignInResult>> {
    const cleanEmail = normalizeAccountEmail(email);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await withRetry(
          () => supabase!.auth.signInWithPassword({ email: cleanEmail, password, options: { captchaToken } }),
          { maxAttempts: 2, label: 'auth:sign-in' },
        );
        if (error) {
          platformEventBus.emit('auth:error', { action: 'sign-in', errorCode: error.status?.toString() ?? 'unknown' });
          return fail('auth', error.message);
        }
        if (!data?.user) {
          return fail('auth', 'Không nhận được dữ liệu phản hồi từ Supabase Auth.');
        }
        platformEventBus.emit('auth:sign-in', { method: 'password' });
        return ok({ userId: data.user.id });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : REMOTE_AUTH_UNAVAILABLE;
        platformEventBus.emit('auth:error', { action: 'sign-in', errorCode: 'exception' });
        return fail('network', message, { cause: err, retryable: true });
      }
    }

    // Offline local environment fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    let user = userService.findLocalUserByEmail(cleanEmail);

    if (!user && cleanEmail === 'khounguyennguyen2012@gmail.com') {
      user = userService.resetAllAccounts();
    }

    if (!user) {
      return fail('auth', 'Email hoặc mật khẩu không chính xác.');
    }
    platformEventBus.emit('auth:sign-in', { method: 'local' });
    return ok({ userId: user.id });
  },

  async signUp(
    email: string,
    password: string,
    displayName: string,
    nativeLanguage?: string,
    targetLanguage?: string,
    username?: string,
    captchaToken?: string,
  ): Promise<PlatformResult<SignUpResult>> {
    const cleanEmail = normalizeAccountEmail(email);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await withRetry(
          () => supabase!.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              captchaToken,
              data: {
                display_name: displayName,
                username: username || displayName.toLowerCase().replace(/\s+/g, '_'),
                native_language: nativeLanguage || 'vi',
                interface_language: nativeLanguage || 'vi',
                target_languages: targetLanguage ? [targetLanguage] : ['en'],
              },
            },
          }),
          { maxAttempts: 2, label: 'auth:sign-up' },
        );

        if (error) {
          platformEventBus.emit('auth:error', { action: 'sign-up', errorCode: error.status?.toString() ?? 'unknown' });
          return fail('auth', error.message);
        }

        if (!data?.user) {
          return fail('auth', 'Không thể khởi tạo tài khoản trên Supabase Auth.');
        }

        platformEventBus.emit('auth:sign-up', { method: 'password' });
        return ok({
          userId: data.user.id,
          requiresEmailConfirmation: !data?.session,
          accountIndex: 1,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : REMOTE_AUTH_UNAVAILABLE;
        platformEventBus.emit('auth:error', { action: 'sign-up', errorCode: 'exception' });
        return fail('network', message, { cause: err, retryable: true });
      }
    }

    // Offline local environment fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingCount = userService.countLocalUsersByEmail(cleanEmail);
    if (existingCount >= 1) {
      return fail('conflict', `Email "${cleanEmail}" đã được đăng ký tài khoản! Mỗi email chỉ được phép sử dụng cho 1 tài khoản duy nhất. Vui lòng đăng nhập hoặc chọn email khác.`);
    }

    const newUser = userService.createLocalUser(cleanEmail, displayName);
    if (username) newUser.username = username.startsWith('@') ? username : `@${username}`;
    if (nativeLanguage) newUser.nativeLanguage = nativeLanguage;
    if (targetLanguage) newUser.targetLanguages = [targetLanguage];
    userService.updateLocalUser(newUser.id, newUser);
    platformEventBus.emit('auth:sign-up', { method: 'local' });
    return ok({ userId: newUser.id, requiresEmailConfirmation: false, accountIndex: 1 });
  },

  async signInWithProvider(provider: 'google' | 'github'): Promise<PlatformResult<void>> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/app` },
        });
        if (error) {
          platformEventBus.emit('auth:error', { action: 'oauth', provider });
          return fail('auth', error.message);
        }
        platformEventBus.emit('auth:sign-in', { method: provider });
        return ok(undefined);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : REMOTE_AUTH_UNAVAILABLE;
        return fail('network', message, { cause: err });
      }
    }

    return fail('capability-unavailable', 'Chưa cấu hình Supabase Auth API trên môi trường này.');
  },

  async signInWithGoogle(): Promise<PlatformResult<void>> {
    return this.signInWithProvider('google');
  },

  async signInWithGitHub(): Promise<PlatformResult<void>> {
    return this.signInWithProvider('github');
  },

  async resetPassword(email: string, captchaToken?: string): Promise<PlatformResult<void>> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeAccountEmail(email), {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });
      if (error) return fail('auth', error.message);
      return ok(undefined);
    }

    await new Promise(resolve => setTimeout(resolve, 350));
    return ok(undefined);
  },

  async updatePassword(password: string): Promise<PlatformResult<void>> {
    if (!isSupabaseConfigured() || !supabase) {
      return fail('capability-unavailable', 'Chức năng đặt lại mật khẩu chỉ hoạt động khi máy chủ tài khoản được kết nối.');
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return fail('auth', error.message);
    return ok(undefined);
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) await supabase.auth.signOut();
    platformEventBus.emit('auth:sign-out', {});
  },
};

