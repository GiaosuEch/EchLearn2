import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, KeyRound, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import Mascot from '../../components/mascot/Mascot';
import { languages } from '../../data/languages';
import { toast } from '../../components/ui/Toast';
import { tx } from '../../i18n/phase129Text';
import { userService } from '../../services/userService';
import { emailService } from '../../services/emailService';
import { authService } from '../../services/authService';

const VI_EMAIL_CONFIRMATION_MESSAGE = 'Vui lòng kiểm tra email để xác nhận tài khoản.';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: OTP Verification, 3: Languages
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const [nativeLang, setNativeLang] = useState('vi');
  const [targetLang, setTargetLang] = useState<string | null>('en');
  const [error, setError] = useState('');
  
  const { register, isLoading, updateProfile } = useAuthStore();
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const setNativeLanguage = useAppStore(s => s.setNativeLanguage);
  const setInterfaceLanguage = useAppStore(s => s.setInterfaceLanguage);
  const navigate = useNavigate();

  // Resend OTP countdown timer
  useEffect(() => {
    let timerId: any;
    if (step === 2 && resendTimer > 0) {
      timerId = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [step, resendTimer]);

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

  // Generate & send 6-digit OTP code to email
  const sendOtpCode = async (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendTimer(60);

    const result = await emailService.sendOtpEmail(targetEmail, code);
    toast(result.message || `Mã OTP 6 số đã được gửi trực tiếp tới hòm thư ${targetEmail}. Vui lòng kiểm tra hộp thư (hoặc mục Spam)!`, 'success');
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    const result = provider === 'google' 
      ? await authService.signInWithGoogle() 
      : await authService.signInWithGitHub();
    if (result.error) showError(result.error);
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

    // Strictly enforce 1 account per email limit
    if (currentCount >= 1) {
      showError(`🚫 Email "${cleanEmail}" đã được đăng ký tài khoản! Mỗi email chỉ được phép đăng ký 1 tài khoản duy nhất. Vui lòng đăng nhập hoặc sử dụng email khác.`);
      return;
    }

    sendOtpCode(cleanEmail);
    setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputOtp.trim()) {
      showError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    const verifyResult = await emailService.verifyOtpEmail(email, inputOtp, generatedOtp);
    if (!verifyResult.success) {
      showError(verifyResult.message || 'Mã OTP không chính xác. Vui lòng kiểm tra lại tin nhắn thông báo.');
      return;
    }

    toast('Xác thực email thành công! Mời bạn chọn ngôn ngữ học.', 'success');
    setStep(3);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    sendOtpCode(email);
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
          <Mascot expression="encouraging" size={90} message={step === 1 ? '🐸' : step === 2 ? '🔑' : '🤖'} />
          <h1 className="mt-3 font-anton text-3xl sm:text-4xl uppercase tracking-wider text-slate-900 leading-none relative inline-block">
            {step === 1
              ? (tx(interfaceLanguage, 'createAccount') as string || 'TẠO TÀI KHOẢN')
              : step === 2
              ? 'XÁC THỰC EMAIL'
              : (tx(interfaceLanguage, 'chooseLanguages') as string || 'CHỌN NGÔN NGỮ')}
            <span className="font-condiment text-3xl sm:text-4xl text-emerald-600 normal-case block sm:inline-block sm:ml-3 -rotate-2">
              EchLearn
            </span>
          </h1>
          <div className="mx-auto mt-2 h-[3px] w-24 bg-emerald-500 rounded-full" />
          <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-wide mt-2">
            {step === 1
              ? 'Bắt đầu hành trình cùng EchLearn (Mỗi email chỉ 1 tài khoản)'
              : step === 2
              ? `Nhập mã xác thực OTP gửi tới ${email}`
              : 'Bạn muốn học ngôn ngữ nào?'}
          </p>
        </div>

        {/* Clean Light Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4">
          {/* Multi-step progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
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
                Gửi Mã OTP Xác Thực →
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

          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                  <KeyRound size={24} />
                </div>
                <p className="text-xs text-slate-600 font-mono">
                  Mã OTP 6 chữ số cho tài khoản email:
                </p>
                <p className="text-sm font-bold text-emerald-700 font-mono mt-1 break-all">
                  {email}
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Xác minh email chính chủ duy nhất</span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-700 mb-1.5 block font-mono font-semibold">
                  Mã xác thực OTP (6 chữ số)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <KeyRound size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="bg-transparent border-none outline-none text-slate-900 w-full text-lg tracking-[8px] font-bold placeholder-slate-300 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 underline"
                >
                  ← Đổi email khác
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={`flex items-center gap-1 font-semibold ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 hover:underline cursor-pointer'}`}
                >
                  <RefreshCw size={12} className={resendTimer > 0 ? '' : 'animate-spin'} />
                  {resendTimer > 0 ? `Gửi lại sau (${resendTimer}s)` : 'Gửi lại mã OTP'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-emerald-500 text-white font-anton text-lg uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={20} />
                Xác Nhận OTP & Tiếp Tục →
              </button>
            </form>
          )}

          {/* STEP 3: LANGUAGE SELECTION */}
          {step === 3 && (
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
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setTargetLang(l.code)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-slate-900 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{l.flag}</span>
                        <div>
                          <p className="text-xs font-mono font-bold leading-none">{l.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">{l.nativeName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-emerald-500 text-white font-anton text-xl uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Đang tạo tài khoản...' : '🚀 Bắt Đầu Học Ngay →'}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="text-center pt-2 font-mono text-xs text-slate-500">
            {tx(interfaceLanguage, 'alreadyAccount') as string || 'Đã có tài khoản?'}{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              {tx(interfaceLanguage, 'login') as string || 'Đăng nhập ngay'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
