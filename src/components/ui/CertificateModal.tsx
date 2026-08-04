import { motion, AnimatePresence } from 'motion/react';
import { Award, Download, Share2, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from './Toast';
import { CustomEmoji } from '../common/CustomEmoji';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  level?: string;
}

export function CertificateModal({ isOpen, onClose, courseTitle = 'IELTS Academic Master Track', level = 'Band 8.0+' }: CertificateModalProps) {
  const user = useAuthStore((s) => s.user);

  if (!isOpen || !user) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    toast('Đã sao chép liên kết Chứng nhận xuất sắc của bạn! 🎓', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl rounded-3xl border-4 border-amber-400/60 bg-gradient-to-b from-slate-950 via-[#071710] to-slate-950 p-8 sm:p-12 shadow-[0_25px_60px_rgba(245,158,11,0.25)] text-white text-center select-none print:m-0 print:border-none print:shadow-none"
        >
          {/* Top Decorative Border */}
          <div className="absolute top-4 inset-x-8 flex items-center justify-between text-[10px] text-amber-400/70 font-mono tracking-widest uppercase">
            <span>OFFICIAL ECHLEARN PLATFORM CERTIFICATE</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 print:hidden cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Certificate Gold Seal Header */}
          <div className="mt-4 mb-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-500/10 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 mb-3 animate-pulse">
              <Award size={44} />
            </div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.3em]">BẰNG CHỨNG NHẬN XUẤT SẮC</p>
            <h1 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight mt-1">
              CERTIFICATE OF ACHIEVEMENT
            </h1>
          </div>

          {/* Certificate Body Content */}
          <div className="space-y-4 max-w-xl mx-auto my-6 font-sans">
            <p className="text-sm text-slate-400 italic">Chứng nhận trao tặng cho Học Viên:</p>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-serif border-b border-amber-400/30 pb-3">
              {user.displayName || 'Học Viên EchLearn'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              Đã hoàn thành xuất sắc chương trình đào tạo & luyện thi chuyên sâu:
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-400/40 text-amber-300 font-bold text-lg font-mono">
              {courseTitle} — {level}
            </div>
          </div>

          {/* Verification Badge & Signatures */}
          <div className="grid grid-cols-2 items-end pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 max-w-2xl mx-auto">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ShieldCheck size={16} />
                <span>XÁC THỰC MÃ QR HỢP LỆ</span>
              </div>
              <p className="text-[10px]">Mã Hash: ECH-2026-X99281</p>
              <p className="text-[10px]">Ngày Cấp: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-1.5 font-serif italic text-lg text-amber-400 font-bold">GiaosuEch <CustomEmoji name="ech-buri" size={20} /></div>
              <p className="text-[11px] font-bold text-white uppercase">Hội Đồng Đào Tạo EchLearn AI</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mt-8 flex justify-center gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <Download size={16} />
              <span>Tải / In Bằng Cấp</span>
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <Share2 size={16} />
              <span>Chia Sẻ Lên MXH</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
