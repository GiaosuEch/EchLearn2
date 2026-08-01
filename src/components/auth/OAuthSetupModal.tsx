import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Key, Shield, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../ui/Toast';

interface OAuthSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OAuthSetupModal({ isOpen, onClose }: OAuthSetupModalProps) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast('Vui lòng nhập User ID / Tên đăng nhập mong muốn', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      updateProfile({
        username: username.toLowerCase().trim(),
        displayName: user.displayName || username,
      });
      toast('Đã thiết lập ID & Mật khẩu tài khoản thành công! 🐸', 'success');
      onClose();
    } catch (err) {
      toast('Đã xảy ra lỗi khi lưu thông tin.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-3xl border border-emerald-500/40 bg-slate-950 p-6 sm:p-8 shadow-2xl text-white font-mono"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Shield size={18} />
              </span>
              <div>
                <h3 className="font-bold text-base text-white">THIẾT LẬP ID & MẬT KHẨU TÀI KHOẢN</h3>
                <p className="text-[11px] text-emerald-400">Yêu cầu bảo mật đăng nhập độc lập</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
            Tài khoản Google/Social của bạn chưa có <b>User ID</b> và <b>Mật khẩu đăng nhập trực tiếp</b>. Vui lòng thiết lập thông tin bên dưới để sử dụng trên mọi thiết bị:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                <UserCheck size={14} className="text-emerald-400" />
                User ID / Tên đăng nhập mong muốn
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: giaosuech_2026"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white focus:border-emerald-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Key size={14} className="text-emerald-400" />
                Mật khẩu mới (ít nhất 6 ký tự)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white focus:border-emerald-400 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-white focus:border-emerald-400 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Đang Lưu Thông Tin...' : 'Hoàn Tất Thiết Lập'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default OAuthSetupModal;
