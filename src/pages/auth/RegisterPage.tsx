import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AtSign, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import Mascot from '../../components/mascot/Mascot';
import { languages } from '../../data/languages';
import { toast, formatToastMessage } from '../../components/ui/Toast';
import { tx } from '../../i18n/phase129Text';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const VI_EMAIL_CONFIRMATION_MESSAGE = 'Vui lòng kiểm tra email để xác nhận tài khoản.';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: Languages
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nativeLang] = useState('vi');
  const [targetLang, setTargetLang] = useState<string | null>('en');
  const [error, setError] = useState('');

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const setCurrentLanguage = useAppStore((s) => s.setCurrentLanguage);
  const setNativeLanguage = useAppStore((s) => s.setNativeLanguage);
  const setInterfaceLanguage = useAppStore((s) => s.setInterfaceLanguage);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      navigate('/app');
    }
  }, [isAuthenticated, user, navigate]);

  const showError = (msg: string) => {
    const formatted = formatToastMessage(msg);
    setError(formatted);
    toast(formatted, 'error');
  };

  const formatErrorMessage = (msg: string) => {
    return formatToastMessage(msg);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        showError(error.message);
      }
    } else {
      const result = await authService.signInWithProvider(provider);
      if (result.error) {
        showError(result.error);
      }
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      showError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password.length < 6) {
      showError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const currentCount = userService.countLocalUsersByEmail(cleanEmail);

    if (currentCount >= 1) {
      showError(`Email "${cleanEmail}" đã được đăng ký tài khoản!`);
      return;
    }

    setStep(2);
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!targetLang) {
      showError('Vui lòng chọn ngôn ngữ bạn muốn học.');
      return;
    }

    try {
      setNativeLanguage(nativeLang);
      setInterfaceLanguage(nativeLang);
      setCurrentLanguage(targetLang);

      const result = await register(
        email,
        password,
        name,
        nativeLang,
        targetLang,
        username
      );

      if (result?.success) {
        if (result.error) {
          toast(formatErrorMessage(result.error) || VI_EMAIL_CONFIRMATION_MESSAGE, 'success');
          navigate('/login');
        } else {
          try {
            await updateProfile({
              targetLanguages: [targetLang],
              nativeLanguage: nativeLang,
              username: username || `@${name.toLowerCase().replace(/\s+/g, '_')}`
            });
          } catch (e) {
            console.warn('Profile update warning during signup:', e);
          }
          toast(`Đăng ký tài khoản thành công cho ${email}!`, 'success');
          const searchParams = new URLSearchParams(window.location.search);
          const redirectToParam = searchParams.get('redirectTo');
          navigate(redirectToParam || '/app/ai-onboarding?fresh=1');
        }
      } else {
        const formattedErr = formatErrorMessage(result?.error || 'Đăng ký không thành công.');
        showError(formattedErr);
      }
    } catch (err: any) {
      console.error('Registration submit error:', err);
      const formattedErr = formatErrorMessage(err?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      showError(formattedErr);
    }
  };

  return (
    <div className="ech-auth min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/40 z-0" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10 px-4 py-8"
      >
        {/* Header section */}
        <div className="text-center mb-6">
          <Mascot expression="encouraging" size={90} message="" />
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white font-mono">
            {step === 1 ? (tx(interfaceLanguage, 'createAccount') || 'TẠO TÀI KHOẢN') : 'THIẾT LẬP HỌC TẬP'}
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            {step === 1 ? 'Bước 1/2: Thông tin cá nhân' : 'Bước 2/2: Chọn ngôn ngữ mục tiêu'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100">
          {error.trim() && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono flex items-center gap-2">
              <span className="font-bold">Lỗi:</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1 block font-mono font-semibold">
                  Họ và tên
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                  <UserIcon size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1 block font-mono font-semibold">
                  Username (Biệt danh)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                  <AtSign size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="nguyenvana"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1 block font-mono font-semibold">
                  Email
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1 block font-mono font-semibold">
                  Mật khẩu
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                  <Lock size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 shrink-0">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tiếp Theo: Chọn Ngôn Ngữ</span>
                <ArrowRight size={16} />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="px-3 text-[11px] font-mono text-slate-400 bg-white">Hoặc đăng ký bằng</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-mono font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  className="py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-mono font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LANGUAGE SELECTION */}
          {step === 2 && (
            <form onSubmit={handleFinalRegister} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-2 block font-mono font-semibold">
                  Ngôn ngữ mục tiêu bạn muốn học:
                </label>
                <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {languages.map((l) => {
                    const isSelected = targetLang === l.code;
                    const isAvailableOnFree = canUseEntitlementLanguages('free', [l.code]);

                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          if (isAvailableOnFree) {
                            setTargetLang(l.code);
                          } else {
                            toast(`Ngôn ngữ "${l.name}" thuộc gói cước GO / PLUS / PRO. Gói Free bao gồm 3 ngôn ngữ khởi đầu: Tiếng Anh, Tiếng Trung, Tiếng Nhật.`, 'warning');
                          }
                        }}
                        className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xl">{l.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate flex items-center gap-1">
                            <span>{l.name}</span>
                            {!isAvailableOnFree && (
                              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">Cước</span>
                            )}
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {l.nativeName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 bg-slate-100 text-slate-600 font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Bắt Đầu Học Ngay →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
