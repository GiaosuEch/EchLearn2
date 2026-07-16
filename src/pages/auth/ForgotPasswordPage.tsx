import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, ArrowLeft } from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { authService } from '../../services/authService';
import { useAppStore } from '../../stores/appStore';
import { tx } from '../../i18n/phase129Text';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(tx(interfaceLanguage, 'fillAll')); return; }
    setError('');
    setLoading(true);
    const result = await authService.resetPassword(email);
    setLoading(false);
    if (result.error) setError(result.error || tx(interfaceLanguage, 'unknownError'));
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 bg-mesh px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mascot expression={sent ? 'happy' : 'thinking'} size={70} message={sent ? '📧' : '🐸'} />
          <h1 className="mt-4 text-3xl font-bold text-white">{sent ? tx(interfaceLanguage, 'resetPasswordSentTitle') : tx(interfaceLanguage, 'resetPasswordTitle')}</h1>
        </div>

        {sent ? (
          <div className="glass-card p-6 text-center">
            <p className="text-dark-300">{tx(interfaceLanguage, 'resetEmailSent')} <span className="text-primary-400 font-medium">{email}</span>.</p>
            <Link to="/login" className="inline-block mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors">
              {tx(interfaceLanguage, 'backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            {error.trim() ? <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-xl">{error}</div> : null}
            <p className="text-sm text-dark-400">{tx(interfaceLanguage, 'resetPasswordHint')}</p>
            <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 focus-within:border-primary-500/50">
              <Mail size={18} className="text-dark-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-dark-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
              {loading ? tx(interfaceLanguage, 'sending') : tx(interfaceLanguage, 'sendResetLink')}
            </button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 text-dark-400 hover:text-dark-200 text-sm mt-6">
          <ArrowLeft size={16} /> {tx(interfaceLanguage, 'backToLogin')}
        </Link>
      </motion.div>
    </div>
  );
}
