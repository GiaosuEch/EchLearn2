import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, MessageSquare, Lock, AlertCircle } from 'lucide-react';
import { toast } from '../ui/Toast';

interface CreateChatRoomModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, password?: string) => Promise<boolean>;
}

export function CreateChatRoomModal({ userId, isOpen, onClose, onCreateRoom }: CreateChatRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createdTodayCount, setCreatedTodayCount] = useState(0);

  const getTodayKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `echlern_created_chat_${userId}_${today}`;
  };

  useEffect(() => {
    if (isOpen && userId) {
      const count = parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
      setCreatedTodayCount(count);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (createdTodayCount >= 2) {
      toast('🔒 Mỗi tài khoản chỉ được tạo tối đa 2 phòng trò chuyện mỗi ngày!', 'error');
      return;
    }
    if (!roomName.trim()) {
      toast('Vui lòng nhập tên phòng trò chuyện!', 'warning');
      return;
    }

    const success = await onCreateRoom(roomName.trim(), isPrivate ? password : undefined);
    if (success) {
      const nextCount = createdTodayCount + 1;
      localStorage.setItem(getTodayKey(), nextCount.toString());
      setCreatedTodayCount(nextCount);
      toast(`🎉 Tạo phòng thành công! (Còn lại ${2 - nextCount}/2 phòng hôm nay)`, 'success');
      setRoomName('');
      setPassword('');
      setIsPrivate(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 rounded-3xl glass-card border-2 border-emerald-500/40 bg-slate-950 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <MessageSquare size={20} />
            <span>TẠO PHÒNG TRÒ CHUYỆN MỚI</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Daily Limit Badge */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-400">Hạn ngạch tạo phòng hôm nay:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${createdTodayCount >= 2 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {createdTodayCount} / 2 PHÒNG
          </span>
        </div>

        {createdTodayCount >= 2 ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={16} />
              <span>ĐÃ ĐẠT GIỚI HẠN NGHỆ THUẬT!</span>
            </div>
            <p>Mỗi tài khoản được bảo vệ giới hạn tối đa 2 phòng/ngày để giữ chất lượng cuộc trò chuyện. Hãy quay lại vào ngày mai!</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Tên Phòng Trò Chuyện *</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="VD: Cùng Luyện Tiếng Anh Giao Tiếp..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
              <label htmlFor="isPrivate" className="text-slate-300 font-bold cursor-pointer flex items-center gap-1">
                <Lock size={14} className="text-amber-400" /> Cài Đặt Mật Khẩu Phòng Bảo Mật
              </label>
            </div>

            {isPrivate && (
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Mật Khẩu Phòng *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu riêng..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            disabled={createdTodayCount >= 2}
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer"
          >
            Tạo Phòng Ngay
          </button>
        </div>
      </motion.div>
    </div>
  );
}
