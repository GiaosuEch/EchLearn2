import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, Plus, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/userService';
import { toast } from '../ui/Toast';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSwitcherModal({ isOpen, onClose }: AccountSwitcherModalProps) {
  const { user, logout, login } = useAuthStore();
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const users = userService.getAllLocalUsers();
      setAllAccounts(users);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSwitchAccount = async (targetEmail: string) => {
    try {
      const success = await login(targetEmail, 'password123');
      if (success) {
        toast(`Đã chuyển đổi sang tài khoản ${targetEmail}! 🐸`, 'success');
        onClose();
      } else {
        toast('Không thể chuyển đổi sang tài khoản này.', 'error');
      }
    } catch (err) {
      toast('Lỗi khi chuyển đổi tài khoản.', 'error');
    }
  };

  const handleAddFastAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !newEmailInput.includes('@')) {
      toast('Vui lòng nhập Email hợp lệ', 'error');
      return;
    }
    const cleanEmail = newEmailInput.toLowerCase().trim();
    const success = await login(cleanEmail, 'password123');
    if (success) {
      toast(`Đã tạo & chuyển sang tài khoản ${cleanEmail}! 🎉`, 'success');
      setNewEmailInput('');
      setShowAddForm(false);
      onClose();
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast('Đã đăng xuất tài khoản thành công! 🚪', 'info');
    onClose();
    window.location.href = '/login';
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-6 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-emerald-500 dark:text-emerald-400 animate-spin-slow" />
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">CHUYỂN ĐỔI TÀI KHOẢN</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Current Active User Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-300">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.displayName?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate font-sans">{user.displayName || 'Học Viên Ếch'}</h3>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold border border-amber-500/30">ADMIN</span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate">@{user.username || 'learner'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase shrink-0">
              ĐANG DÙNG
            </span>
          </div>

          {/* Other Registered Accounts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TÀI KHOẢN KHÁC TRÊN MÁY:</span>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm Email</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddFastAccount} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Nhập Email tài khoản mới..."
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                >
                  Tạo / Vào
                </button>
              </form>
            )}

            <div className="max-h-44 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
              {allAccounts.filter(acc => acc.email !== user.email).map((acc) => (
                <div 
                  key={acc.id}
                  onClick={() => handleSwitchAccount(acc.email)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                      {acc.displayName?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 text-xs truncate group-hover:text-white">{acc.displayName || acc.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-300 font-bold uppercase transition-all">
                    Chuyển sang
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleSignOut}
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/25 active:scale-[0.99]"
            >
              <LogOut size={16} />
              <span>ĐĂNG XUẤT TÀI KHOẢN HIỆN TẠI</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
