import { useState, useEffect } from 'react';
import { BookX, Trash2, RotateCcw, AlertTriangle, Brain, X, Check, Plus } from 'lucide-react';
import PageShell from '../../PageShell';
import { motion, AnimatePresence } from 'motion/react';
import { localDb } from '../../../lib/storage/localDatabase';
import { useAuthStore } from '../../../stores/authStore';
import Mascot from '../../../components/mascot/Mascot';

export interface MistakeItem {
  id: string;
  userId: string;
  type: 'Grammar' | 'Vocabulary' | 'Speaking' | 'Writing' | 'Reading' | 'Listening';
  mistake: string;
  correction: string;
  notes: string;
  createdAt: string;
}

export default function MistakeNotebookPage() {
  const user = useAuthStore((s) => s.user);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<MistakeItem | null>(null);
  const [userAttempt, setUserAttempt] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // New mistake state
  const [newType, setNewType] = useState<'Grammar' | 'Vocabulary' | 'Speaking' | 'Writing'>('Grammar');
  const [newMistake, setNewMistake] = useState('');
  const [newCorrection, setNewCorrection] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadMistakes = () => {
    if (!user?.id) return;
    const items = localDb.findByField<MistakeItem>('mistake_notebook', 'userId', user.id);
    if (items.length > 0) {
      setMistakes(items);
    } else {
      // Seed default mistakes
      const defaults: MistakeItem[] = [
        { id: '1', userId: user.id, type: 'Grammar', mistake: 'I have went to the store yesterday.', correction: 'I went to the store yesterday.', notes: 'Dùng thì quá khứ đơn (went) vì có mốc thời gian rõ ràng "yesterday".', createdAt: new Date().toISOString() },
        { id: '2', userId: user.id, type: 'Vocabulary', mistake: 'The environment is very polluted, it is ubiquitous.', correction: 'Pollution is ubiquitous in modern cities.', notes: '"Ubiquitous" có nghĩa là phổ biến ở khắp nơi, dùng để mô tả sự hiện diện.', createdAt: new Date().toISOString() },
        { id: '3', userId: user.id, type: 'Speaking', mistake: 'Pronounced "chaos" as /tʃeɪ.ɒs/', correction: 'Pronounce "chaos" as /ˈkeɪ.ɒs/', notes: 'Âm "ch" trong chaos phát âm là âm /k/ mạnh.', createdAt: new Date().toISOString() },
      ];
      defaults.forEach(item => localDb.insert('mistake_notebook', item));
      setMistakes(defaults);
    }
  };

  useEffect(() => {
    loadMistakes();
  }, [user?.id]);

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMistake.trim() || !newCorrection.trim() || !user) return;

    const item: MistakeItem = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: newType,
      mistake: newMistake,
      correction: newCorrection,
      notes: newNotes || 'Lưu ý tự ôn tập.',
      createdAt: new Date().toISOString()
    };

    localDb.insert('mistake_notebook', item);
    setShowAddModal(false);
    setNewMistake('');
    setNewCorrection('');
    setNewNotes('');
    loadMistakes();
  };

  const removeMistake = (id: string) => {
    localDb.remove('mistake_notebook', id);
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  const handleVerifyAttempt = (item: MistakeItem) => {
    const cleanAttempt = userAttempt.trim().toLowerCase();
    const cleanCorrect = item.correction.trim().toLowerCase();
    if (cleanAttempt === cleanCorrect || cleanCorrect.includes(cleanAttempt)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const filteredMistakes = activeTab === 'All' ? mistakes : mistakes.filter(m => m.type === activeTab);

  return (
    <PageShell title="Sổ Tay Lỗi Sai" description="Lưu giữ và ôn tập ngắt quãng các lỗi sai của bạn" icon={<BookX size={20} />} backTo="/app/ielts">
      <div className="space-y-6 font-mono">
        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {['All', 'Grammar', 'Vocabulary', 'Speaking', 'Writing'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg' 
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} />
            <span>Thêm Lỗi Sai Mới</span>
          </button>
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <Mascot expression="happy" size={90} message="Tuyệt vời! Bạn chưa có lỗi sai nào ở mục này!" />
            <h3 className="text-xl font-bold text-white mt-4 mb-2">Không Có Lỗi Sai Nào!</h3>
            <p className="text-slate-400 text-xs">Hãy tiếp tục giữ vững phong độ học tập xuất sắc nhé!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMistakes.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-5 relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                  <div className="flex items-start justify-between mb-4 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg uppercase tracking-wider">
                        {m.type}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReviewingItem(m); setUserAttempt(''); setIsCorrect(null); }}
                        className="px-3 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Ôn Tập Lỗi Sai"
                      >
                        <RotateCcw size={14} />
                        <span>Ôn Tập</span>
                      </button>
                      <button
                        onClick={() => removeMistake(m.id)}
                        className="p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Xóa lỗi này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-2 space-y-3">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/20 relative">
                      <div className="text-[10px] font-bold text-rose-400 uppercase mb-1">❌ Câu Lỗi Phải Tránh:</div>
                      <p className="text-sm text-slate-300 line-through decoration-rose-500/60 font-sans">{m.mistake}</p>
                    </div>
                    
                    <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/30 relative">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">✓ Câu Đúng Chuẩn:</div>
                      <p className="text-sm text-white font-medium font-sans">{m.correction}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-amber-300/90 flex items-start gap-2 font-sans">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{m.notes}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal: Ôn Tập Lỗi Sai */}
        {reviewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-slate-950 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-emerald-400" />
                  <h3 className="font-bold text-base">ÔN TẬP LỖI SAI VỚI PEPE COACH</h3>
                </div>
                <button onClick={() => setReviewingItem(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Câu Chưa Đúng Ban Đầu:</p>
                  <p className="text-sm text-rose-300 font-sans line-through">{reviewingItem.mistake}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Gõ lại câu hoàn chỉnh đã sửa đúng:</label>
                  <input
                    type="text"
                    value={userAttempt}
                    onChange={(e) => setUserAttempt(e.target.value)}
                    placeholder="Nhập câu đúng vào đây..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                {isCorrect === true && (
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Check size={18} />
                    <span>CHÍNH XÁC KHÔNG VẾT XƯỚC! Bạn đã khắc phục hoàn toàn lỗi sai này! 🎉</span>
                  </div>
                )}

                {isCorrect === false && (
                  <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-sans space-y-1">
                    <div className="font-bold">Chưa chính xác lắm! Gợi ý đáp án chuẩn:</div>
                    <div className="text-white font-bold">{reviewingItem.correction}</div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleVerifyAttempt(reviewingItem)}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Kiểm Tra Đáp Án
                  </button>
                  <button
                    onClick={() => setReviewingItem(null)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Thêm Lỗi Sai Mới */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-bold text-base">THÊM LỖI SAI MỚI VÀO SỔ TAY</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMistake} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Loại Lỗi Sai:</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Grammar">Grammar (Ngữ Pháp)</option>
                    <option value="Vocabulary">Vocabulary (Từ Vựng)</option>
                    <option value="Speaking">Speaking (Phát Âm/Luyện Nói)</option>
                    <option value="Writing">Writing (Viết Câu/Đoạn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Câu Lỗi (Cần Sửa):</label>
                  <input
                    type="text"
                    required
                    value={newMistake}
                    onChange={(e) => setNewMistake(e.target.value)}
                    placeholder="Ví dụ: I have went..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Câu Đã Sửa Chuẩn:</label>
                  <input
                    type="text"
                    required
                    value={newCorrection}
                    onChange={(e) => setNewCorrection(e.target.value)}
                    placeholder="Ví dụ: I went..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Ghi Chú Nhắc Nhở:</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Lý do sai & mẹo nhớ..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-lg cursor-pointer"
                >
                  Lưu Vào Sổ Tay
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
