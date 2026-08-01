import { useState } from 'react';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await authService.resetPassword(email);
      if (res.error) {
        setError(res.error);
      } else {
        setStep('sent');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

          {step === 'request' ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Quên Mật Khẩu?</h3>
                  <p className="text-xs text-slate-400">Nhập email để nhận mã/liên kết đổi mật khẩu</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email đăng ký</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nhap.email@example.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-950/50"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi Mã Đổi Mật Khẩu'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-extrabold text-white">Đã Gửi Hướng Dẫn Đổi Mật Khẩu!</h3>
              <p className="text-sm text-slate-300">
                Mã xác minh đã được gửi tới email <span className="font-bold text-emerald-400">{email}</span>. Vui lòng kiểm tra hộp thư của bạn (kể cả mục Spam).
              </p>
              <button
                type="button"
                onClick={() => { setStep('request'); onClose(); }}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                <ArrowLeft size={16} /> Quay Lại Đăng Nhập
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
