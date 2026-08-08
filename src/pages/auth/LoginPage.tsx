import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Mascot from '../../components/mascot/Mascot';
import { authService } from '../../services/authService';
import { personalizedLearningService } from '../../services/personalizedLearningService';
import { useAppStore } from '../../stores/appStore';
import { tx } from '../../i18n/phase129Text';
import { toast, formatToastMessage } from '../../components/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const LOGIN_BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      const fillMsg = tx(interfaceLanguage, 'fillAll') || 'Vui lòng điền đầy đủ thông tin.';
      setError(fillMsg);
      toast(fillMsg, 'warning');
      return;
    }
    const result = await login(email, password);

    if (result.success) {
      toast(`Đăng nhập thành công!`, 'success');
      const searchParams = new URLSearchParams(window.location.search);
      const redirectToParam = searchParams.get('redirectTo');
      if (redirectToParam) {
        navigate(redirectToParam);
      } else {
        const loggedUser = useAuthStore.getState().user || user;
        if (loggedUser && loggedUser.id) {
          const completed = await personalizedLearningService.hasCompleted(loggedUser.id, currentLanguage);
          navigate(completed ? '/app' : '/app/languages');
        } else {
          navigate('/app');
        }
      }
    } else {
      const formattedErr = formatToastMessage(result.error || tx(interfaceLanguage, 'invalidCredentials') || 'Email hoặc mật khẩu không chính xác.');
      setError(formattedErr);
      toast(formattedErr, 'error');
    }
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

  return (
    <div className="ech-auth min-h-screen flex items-center justify-center relative overflow-hidden bg-[#010828] font-mono selection:bg-[#6FFF00] selection:text-black">
      {/* 1. Looping video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src={LOGIN_BG_VIDEO}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        aria-hidden="true"
      />

      {/* 2. Space Navy dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010828]/80 via-[#010828]/60 to-[#010828]/90 z-[1]" />

      {/* 3. Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#6FFF00]/[0.08] rounded-full blur-[140px] pointer-events-none z-[2]" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#b724ff]/[0.06] rounded-full blur-[120px] pointer-events-none z-[2]" />

      {/* 4. Texture Grain Overlay */}
      <div className="texture-overlay z-[3]" />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 px-4 py-10"
      >
        {/* Header section */}
        <div className="text-center mb-8">
          <Mascot expression="happy" size={95} message="Chào mừng trở lại!" />
          <h1 className="mt-4 font-anton text-4xl sm:text-5xl uppercase tracking-wider text-[#EFF4FF] leading-none relative inline-block">
            {tx(interfaceLanguage, 'welcomeBack') || 'ĐĂNG NHẬP'}
            <span className="font-condiment text-3xl sm:text-4xl text-[#6FFF00] normal-case block sm:inline-block sm:ml-3 -rotate-2 drop-shadow-[0_0_12px_rgba(111,255,0,0.4)]">
              EchLearn
            </span>
          </h1>
          <div className="mx-auto mt-2.5 h-[4px] w-32 bg-[#6FFF00] rounded-full" />
          <p className="text-[#EFF4FF]/70 text-xs sm:text-sm uppercase tracking-widest mt-3">
            {tx(interfaceLanguage, 'loginSubtitle') || 'Nhập thông tin tài khoản của bạn'}
          </p>
        </div>

        {/* Glass Form Card */}
        <form onSubmit={handleSubmit} className="liquid-glass-card rounded-[32px] p-6 sm:p-8 space-y-4">
          {error.trim() && (
            <div id="login-error" role="alert" className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-xl font-mono">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="text-xs uppercase tracking-wider text-[#EFF4FF]/80 mb-1.5 block font-mono font-semibold">{tx(interfaceLanguage, 'email')}</label>
            <div className="flex items-center gap-3 liquid-glass-input rounded-xl px-4 py-3 focus-within:border-[#6FFF00]">
              <Mail size={18} className="text-[#EFF4FF]/60 shrink-0" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                aria-describedby={error.trim() ? 'login-error' : undefined}
                className="bg-transparent border-none outline-none text-[#EFF4FF] w-full text-sm placeholder-[#EFF4FF]/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="text-xs uppercase tracking-wider text-[#EFF4FF]/80 mb-1.5 block font-mono font-semibold">{tx(interfaceLanguage, 'password')}</label>
            <div className="flex items-center gap-3 liquid-glass-input rounded-xl px-4 py-3 focus-within:border-[#6FFF00]">
              <Lock size={18} className="text-[#EFF4FF]/60 shrink-0" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-describedby={error.trim() ? 'login-error' : undefined}
                className="bg-transparent border-none outline-none text-[#EFF4FF] w-full text-sm placeholder-[#EFF4FF]/40 font-mono"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} className="text-[#EFF4FF]/60 hover:text-[#EFF4FF] shrink-0">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <label className="flex items-center gap-2 text-[#EFF4FF]/70 cursor-pointer">
              <input type="checkbox" className="rounded border-white/20 bg-[#010828] text-[#6FFF00] focus:ring-[#6FFF00]" /> {tx(interfaceLanguage, 'rememberMe')}
            </label>
            <Link to="/forgot-password" className="text-[#6FFF00] hover:underline font-semibold">{tx(interfaceLanguage, 'forgotPassword')}</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#6FFF00] text-[#010828] font-anton text-lg uppercase tracking-wider rounded-xl shadow-xl shadow-[#6FFF00]/20 hover:bg-[#5fe600] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? tx(interfaceLanguage, 'loggingIn') : tx(interfaceLanguage, 'loginButton')}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-4 text-xs font-mono uppercase text-[#EFF4FF]/50 bg-[#010828]/60 backdrop-blur-sm rounded-full">{tx(interfaceLanguage, 'orContinueWith')}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="py-3 liquid-glass border border-white/15 rounded-xl text-[#EFF4FF] hover:border-[#6FFF00]/60 hover:bg-white/[0.05] transition-all text-xs font-mono uppercase cursor-pointer flex items-center justify-center gap-2"
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
              className="py-3 liquid-glass border border-white/15 rounded-xl text-[#EFF4FF] hover:border-[#6FFF00]/60 hover:bg-white/[0.05] transition-all text-xs font-mono uppercase cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </form>

        <div className="text-center text-xs uppercase tracking-wider text-[#EFF4FF]/60 mt-6 font-mono space-y-2">
          <div>
            {tx(interfaceLanguage, 'noAccount')}{' '}
            <Link to="/register" className="text-[#6FFF00] hover:underline font-bold">
              {tx(interfaceLanguage, 'signUpFree')}
            </Link>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-slate-300">
            <span>Cần hỗ trợ?</span>
            <a
              href="https://www.facebook.com/profile.php?id=61576223186362"
              target="_blank"
              rel="noreferrer"
              className="text-[#6FFF00] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook Admin Support</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
