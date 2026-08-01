import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
const FACEBOOK_SUPPORT_URL = 'https://www.facebook.com/profile.php?id=61576223186362';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: Languages
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nativeLang, setNativeLang] = useState('vi');
  const [targetLang, setTargetLang] = useState<string | null>('en');
  const [error, setError] = useState('');

  const { register, isLoading, updateProfile, user, isAuthenticated } = useAuthStore();
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const setCurrentLanguage = useAppStore((s) => s.setCurrentLanguage);
  const setNativeLanguage = useAppStore((s) => s.setNativeLanguage);
  const setInterfaceLanguage = useAppStore((s) => s.setInterfaceLanguage);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const formatErrorMessage = (err: any): string => {
    if (!err) return '';
    if (typeof err === 'string') {
      const trimmed = err.trim();
      if (trimmed === '{}' || trimmed === '[object Object]' || trimmed === '') return '';
      return trimmed;
    }
    if (typeof err === 'object') {
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') return err.message;
      if (typeof err.error_description === 'string' && err.error_description.trim()) return err.error_description;
    }
    return '';
  };

  const showError = (message: any) => {
    const formatted = formatErrorMessage(message);
    setError(formatted || 'Không thể khởi tạo tài khoản. Vui lòng kiểm tra lại thông tin.');
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
        const formattedErr = formatToastMessage(error.message);
        setError(formattedErr);
        toast(formattedErr, 'error');
      }
    } else {
      const result = await authService.signInWithProvider(provider);
      if (result.error) {
        const formattedErr = formatToastMessage(result.error);
        setError(formattedErr);
        toast(formattedErr, 'error');
      }
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showError(tx(interfaceLanguage, 'fillAll') || 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password.length < 6) {
      showError(tx(interfaceLanguage, 'passwordShort') || 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      showError(tx(interfaceLanguage, 'passwordMismatch') || 'Mật khẩu xác nhận không khớp.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const currentCount = userService.countLocalUsersByEmail(cleanEmail);

    if (currentCount >= 1) {
      showError(`🚫 Email "${cleanEmail}" đã được đăng ký tài khoản! Mỗi email chỉ được phép đăng ký 1 tài khoản duy nhất. Vui lòng đăng nhập hoặc sử dụng email khác.`);
      return;
    }

    setStep(2);
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!targetLang) {
      showError(tx(interfaceLanguage, 'selectTarget') || 'Vui lòng chọn ngôn ngữ bạn muốn học.');
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
          toast(formatErrorMessage(result.error) || (tx(nativeLang, 'checkEmail') as string) || VI_EMAIL_CONFIRMATION_MESSAGE, 'success');
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
          toast(`🎉 Đăng ký tài khoản thành công cho ${email}!`, 'success');
          navigate('/app/ai-onboarding?fresh=1');
        }
      } else {
        showError(result?.error || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('handleFinalRegister error:', err);
      showError(err?.message || 'Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.');
    }
  };

  return (
    <div className="ech-auth min-h-screen flex items-center justify-center bg-slate-50 font-mono selection:bg-emerald-500 selection:text-white py-12 px-4 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header section */}
        <div className="text-center mb-6">
          <Mascot expression="encouraging" size={90} message={step === 1 ? '🐸' : '🤖'} />
          <h1 className="mt-3 font-anton text-3xl sm:text-4xl uppercase tracking-wider text-slate-900 leading-none relative inline-block">
            {step === 1
              ? (tx(interfaceLanguage, 'createAccount') as string || 'TẠO TÀI KHOẢN')
              : (tx(interfaceLanguage, 'chooseLanguages') as string || 'CHỌN NGÔN NGỮ')}
            <span className="font-condiment text-3xl sm:text-4xl text-emerald-600 normal-case block sm:inline-block sm:ml-3 -rotate-2">
              EchLearn
            </span>
          </h1>
          <div className="mx-auto mt-2 h-[3px] w-24 bg-emerald-500 rounded-full" />
          <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-wide mt-2">
            {step === 1
              ? 'Bắt đầu hành trình cùng EchLearn (Mỗi email chỉ 1 tài khoản)'
              : 'Bạn muốn học ngôn ngữ nào?'}
          </p>
        </div>

        {/* Clean Light Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4">
          {/* Multi-step progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          </div>

          {/* Error notification banner */}
          <AnimatePresence>
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-mono leading-relaxed"
              >
                ⚠️ {error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* STEP 1: ACCOUNT INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1.5 block font-mono font-semibold">
                  {tx(interfaceLanguage, 'fullName') as string || 'Họ và tên'}
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <User size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyen Van A"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1.5 block font-mono font-semibold">
                  Mã ID / Username (Tùy chọn)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <span className="text-emerald-600 font-bold text-sm shrink-0">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="pepe_master"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-slate-700 font-mono font-semibold">
                    {tx(interfaceLanguage, 'email') as string || 'Địa chỉ Email'}
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    1 Email = 1 Tài khoản
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1.5 block font-mono font-semibold">
                  {tx(interfaceLanguage, 'password') as string || 'Mật khẩu'}
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <Lock size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tx(interfaceLanguage, 'minPassword') as string || 'Tối thiểu 6 ký tự'}
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-700 shrink-0">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1.5 block font-mono font-semibold">
                  {tx(interfaceLanguage, 'confirmPassword') as string || 'Xác nhận mật khẩu'}
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <Lock size={18} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tx(interfaceLanguage, 'confirmPassword') as string || 'Nhập lại mật khẩu'}
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-emerald-500 text-white font-anton text-lg uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Tiếp Theo: Chọn Ngôn Ngữ →
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="px-3 text-xs font-mono uppercase text-slate-400 bg-white">{tx(interfaceLanguage, 'orContinueWith') as string || 'Hoặc đăng ký nhanh bằng'}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-mono font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  🔵 Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  className="py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-mono font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  🐙 GitHub
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LANGUAGE SELECTION */}
          {step === 2 && (
            <form onSubmit={handleFinalRegister} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-2 block font-mono font-semibold">
                  Mẹ đẻ / Ngôn ngữ giao tiếp:
                </label>
                <select
                  value={nativeLang}
                  onChange={(e) => setNativeLang(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none text-sm font-mono cursor-pointer focus:border-emerald-500"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="text-slate-900">
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

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
                            toast(`🔒 Ngôn ngữ "${l.name}" thuộc gói cước GO / PLUS / PRO. Gói Free bao gồm 3 ngôn ngữ khởi đầu: Tiếng Anh, Tiếng Trung, Tiếng Nhật.`, 'warning');
                          }
                        }}
                        className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          !isAvailableOnFree
                            ? 'bg-slate-100/90 border-slate-200 text-slate-500 opacity-70 hover:border-amber-400/60'
                            : isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-slate-900 font-bold shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{l.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-mono font-bold truncate">{l.name}</p>
                            {!isAvailableOnFree ? (
                              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">🔒 Cước</span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">🆓 Free</span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{l.nativeName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 px-4 bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-emerald-500 text-white font-anton text-lg uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Đang tạo tài khoản...' : '🚀 Bắt Đầu Học Ngay →'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="text-center pt-2 font-mono text-xs text-slate-500 space-y-2">
            <div>
              {tx(interfaceLanguage, 'alreadyAccount') as string || 'Đã có tài khoản?'}{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                {tx(interfaceLanguage, 'login') as string || 'Đăng nhập ngay'}
              </Link>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600">
              <span>Cần hỗ trợ?</span>
              <a
                href={FACEBOOK_SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>🔵 Facebook Admin Support</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
