import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Mascot from '../../components/mascot/Mascot';
import { authService } from '../../services/authService';
import { personalizedLearningService } from '../../services/personalizedLearningService';
import { useAppStore } from '../../stores/appStore';
import { tx } from '../../i18n/phase129Text';
import { toast } from '../../components/ui/Toast';

const LOGIN_BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, user } = useAuthStore();
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      const fillMsg = tx(interfaceLanguage, 'fillAll') || 'Vui lòng điền đầy đủ thông tin.';
      setError(fillMsg);
      toast(fillMsg, 'warning');
      return;
    }
    const success = await login(email, password);

    if (success) {
      const loggedUser = useAuthStore.getState().user || user;
      if (loggedUser) {
        const completed = await personalizedLearningService.hasCompleted(loggedUser.id, currentLanguage);
        navigate(completed ? '/app' : '/app/languages');
      } else {
        navigate('/app');
      }
    } else {
      const errMsg = tx(interfaceLanguage, 'invalidCredentials') || 'Email hoặc mật khẩu không chính xác.';
      setError(errMsg);
      toast(errMsg, 'error');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    const result = provider === 'google' 
      ? await authService.signInWithGoogle() 
      : await authService.signInWithGitHub();
    if (result.error) setError(result.error || tx(interfaceLanguage, 'unknownError'));
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
          <Mascot expression="happy" size={95} message="Chào mừng trở lại! 🐸" />
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
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-xl font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-[#EFF4FF]/80 mb-1.5 block font-mono font-semibold">{tx(interfaceLanguage, 'email')}</label>
            <div className="flex items-center gap-3 liquid-glass-input rounded-xl px-4 py-3 focus-within:border-[#6FFF00]">
              <Mail size={18} className="text-[#EFF4FF]/60 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="bg-transparent border-none outline-none text-[#EFF4FF] w-full text-sm placeholder-[#EFF4FF]/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#EFF4FF]/80 mb-1.5 block font-mono font-semibold">{tx(interfaceLanguage, 'password')}</label>
            <div className="flex items-center gap-3 liquid-glass-input rounded-xl px-4 py-3 focus-within:border-[#6FFF00]">
              <Lock size={18} className="text-[#EFF4FF]/60 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-[#EFF4FF] w-full text-sm placeholder-[#EFF4FF]/40 font-mono"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#EFF4FF]/60 hover:text-[#EFF4FF] shrink-0">
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
              className="py-3 liquid-glass border border-white/15 rounded-xl text-[#EFF4FF] hover:border-[#6FFF00]/60 hover:bg-white/[0.05] transition-all text-xs font-mono uppercase cursor-pointer"
            >
              🔵 Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="py-3 liquid-glass border border-white/15 rounded-xl text-[#EFF4FF] hover:border-[#6FFF00]/60 hover:bg-white/[0.05] transition-all text-xs font-mono uppercase cursor-pointer"
            >
              🐙 GitHub
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
              className="text-[#6FFF00] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>🔵 Facebook Admin Support</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
