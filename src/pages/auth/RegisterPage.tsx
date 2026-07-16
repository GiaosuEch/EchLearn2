import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import Mascot from '../../components/mascot/Mascot';
import { languages } from '../../data/languages';
import { toast } from '../../components/ui/Toast';
import { tx } from '../../i18n/phase129Text';

const VI_EMAIL_CONFIRMATION_MESSAGE = 'Vui lòng kiểm tra email để xác nhận tài khoản.';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nativeLang, setNativeLang] = useState('vi');
  const [targetLang, setTargetLang] = useState<string | null>('en');
  const [error, setError] = useState('');
  const { register, isLoading, updateProfile } = useAuthStore();
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const setNativeLanguage = useAppStore(s => s.setNativeLanguage);
  const setInterfaceLanguage = useAppStore(s => s.setInterfaceLanguage);
  const navigate = useNavigate();

  const showError = (message: string) => setError(message || tx(interfaceLanguage, 'unknownError'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) { showError(tx(interfaceLanguage, 'fillAll')); return; }
      if (password.length < 6) { showError(tx(interfaceLanguage, 'passwordShort')); return; }
      if (password !== confirmPassword) { showError(tx(interfaceLanguage, 'passwordMismatch')); return; }
      setError('');
      setStep(2);
      return;
    }

    if (!targetLang) { showError(tx(interfaceLanguage, 'selectTarget')); return; }

    setNativeLanguage(nativeLang);
    setInterfaceLanguage(nativeLang);
    setCurrentLanguage(targetLang);
    const { success, error: regError } = await register(email, password, name, nativeLang, targetLang);
    if (success) {
      if (regError) {
        toast(regError || tx(nativeLang, 'checkEmail') || VI_EMAIL_CONFIRMATION_MESSAGE, 'success');
        navigate('/login');
      } else {
        await updateProfile({ targetLanguages: [targetLang], nativeLanguage: nativeLang });
        toast(tx(nativeLang, 'welcome'), 'success');
        navigate('/app/ai-onboarding?fresh=1');
      }
    } else {
      showError(regError || tx(interfaceLanguage, 'unknownError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-mesh px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Mascot expression="encouraging" size={70} message={step === 1 ? '🐸' : '🤖'} />
          <h1 className="mt-4 text-3xl font-bold text-white">{step === 1 ? tx(interfaceLanguage, 'createAccount') : tx(interfaceLanguage, 'chooseLanguages')}</h1>
          <p className="text-dark-400 mt-1">{step === 1 ? tx(interfaceLanguage, 'startJourney') : tx(interfaceLanguage, 'chooseSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-dark-700'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-dark-700'}`} />
          </div>

          {error.trim() && <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-xl">{error}</div>}

          {step === 1 ? (
            <>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'fullName')}</label>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 focus-within:border-primary-500/50">
                  <User size={18} className="text-dark-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyen Van A" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-dark-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'email')}</label>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 focus-within:border-primary-500/50">
                  <Mail size={18} className="text-dark-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-dark-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'password')}</label>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 focus-within:border-primary-500/50">
                  <Lock size={18} className="text-dark-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tx(interfaceLanguage, 'minPassword')} className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-dark-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-dark-500 hover:text-dark-300"><Eye size={18} /></button>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'confirmPassword')}</label>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 focus-within:border-primary-500/50">
                  <Lock size={18} className="text-dark-500" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={tx(interfaceLanguage, 'confirmPassword')} className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-dark-500" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'nativeLanguage')}</label>
                <select value={nativeLang} onChange={(e) => setNativeLang(e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-primary-500/50 outline-none">
                  {languages.map(lang => <option key={lang.id} value={lang.id}>{lang.flag} {lang.name} ({lang.nativeName})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">{tx(interfaceLanguage, 'targetLanguage')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[22rem] overflow-y-auto pr-1 custom-scrollbar pb-1">
                  {languages.map((lang) => (
                    <button key={lang.id} type="button" onClick={() => setTargetLang(lang.id)} className={`p-3 rounded-xl text-left transition-all min-h-[92px] ${targetLang === lang.id ? 'bg-primary-500/20 border-2 border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-dark-800 border-2 border-dark-700 hover:border-dark-500 hover:bg-dark-700'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${targetLang === lang.id ? 'text-primary-400' : 'text-white'}`}>{lang.name}</p>
                          <p className="text-xs text-dark-400 truncate">{lang.nativeName}</p>
                          <p className="text-[11px] text-dark-500 font-medium uppercase mt-1">{lang.difficulty}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading || (step === 2 && !targetLang)} className="w-full py-3 mt-4 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? tx(interfaceLanguage, 'creating') : step === 1 ? `${tx(interfaceLanguage, 'nextStep')} →` : `${tx(interfaceLanguage, 'startLearning')} 🐸`}
          </button>

          {step === 2 && !isLoading && <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-dark-400 hover:text-white font-medium text-sm transition-colors">← {tx(interfaceLanguage, 'backToDetails')}</button>}
        </form>

        <p className="text-center text-sm text-dark-400 mt-6">
          {tx(interfaceLanguage, 'alreadyAccount')} <Link to="/login" className="text-primary-400 hover:underline font-bold">{tx(interfaceLanguage, 'login')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
