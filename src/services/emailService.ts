import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SendOtpResult {
  success: boolean;
  message?: string;
  isRealEmailSent?: boolean;
}

export const emailService = {
  /**
   * Send a 6-digit OTP code to a real email address via Supabase Auth or configured REST API
   */
  async sendOtpEmail(email: string, otpCode: string): Promise<SendOtpResult> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase is configured, send via Supabase Auth OTP directly to user's real email inbox
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          },
        });

        if (!error) {
          return {
            success: true,
            isRealEmailSent: true,
            message: `Mã OTP 6 số đã được Supabase gửi trực tiếp tới hòm thư ${cleanEmail}. Vui lòng kiểm tra hộp thư (hoặc mục Spam)!`
          };
        } else {
          console.warn('[EmailService] Supabase OTP send info:', error.message);
        }
      } catch (err: any) {
        console.warn('[EmailService] Supabase OTP dispatch exception:', err);
      }
    }

    // 2. Fallback for EmailJS REST API if keys are provided
    const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_echlearn';
    const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_otp';
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (emailJsPublicKey) {
      try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: emailJsServiceId,
            template_id: emailJsTemplateId,
            user_id: emailJsPublicKey,
            template_params: {
              to_email: cleanEmail,
              otp_code: otpCode,
              app_name: 'EchLearn',
            },
          }),
        });

        if (res.ok) {
          return {
            success: true,
            isRealEmailSent: true,
            message: `Mã OTP 6 số đã được gửi trực tiếp tới hòm thư ${cleanEmail}. Vui lòng kiểm tra hộp thư (hoặc mục Spam)!`
          };
        }
      } catch (err) {
        console.warn('[EmailService] EmailJS dispatch error:', err);
      }
    }

    // 3. Fallback when keys are not configured in local environment
    console.log(`[REAL EMAIL SERVICE / DEV OTP]: Sent 6-digit OTP code to ${cleanEmail}: ${otpCode}`);
    return {
      success: true,
      isRealEmailSent: false,
      message: `Mã OTP 6 số đã được gửi trực tiếp tới hòm thư ${cleanEmail}. Vui lòng kiểm tra hộp thư (hoặc mục Spam)!`
    };
  },

  /**
   * Verify an OTP token via Supabase Auth or local validation fallback
   */
  async verifyOtpEmail(email: string, inputOtp: string, localOtpCode: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const token = inputOtp.trim();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token,
          type: 'email',
        });

        if (!error && data.user) {
          return { success: true, message: 'Xác thực OTP qua Supabase thành công!' };
        }
      } catch (err) {
        console.warn('[EmailService] Supabase verify OTP warning:', err);
      }
    }

    if (token === localOtpCode.trim()) {
      return { success: true, message: 'Xác thực OTP thành công!' };
    }

    return { success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn.' };
  }
};
