import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { languages, getFlagUrl } from '../../data/languages';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages, getEntitlementPolicy } from '../../services/entitlementService';
import { toast } from '../../components/ui/Toast';
import { Tilt3DCard } from '../../components/ui/Tilt3DCard';

export default function LanguageSelectionPage() {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  // Merged profile + ledger plan, so an admin-granted PRO account sees every
  // language unlocked rather than the FREE starter three.
  const { plan: activePlan, flags: proFlags } = useProAccess();
  const activePolicy = getEntitlementPolicy(activePlan);
  const selectedLanguages = user?.targetLanguages ?? [];

  const difficultyVi: Record<string, string> = {
    easy: 'Dễ bắt đầu',
    medium: 'Vừa sức',
    hard: 'Thử thách',
    expert: 'Chuyên sâu'
  };

  const handleStartLearning = async () => {
    if (!selectedLang) return;
    const targetLanguages = [...new Set([...selectedLanguages, selectedLang])];
    if (!proFlags.unlockAllLanguages && !canUseEntitlementLanguages(activePlan, targetLanguages)) {
      toast(`Ngôn ngữ này cần mở khóa bằng gói GO, PLUS hoặc PRO. Đang chuyển hướng đến bảng giá...`, 'info');
      navigate('/pricing');
      return;
    }
    setIsSaving(true);
    
    try {
      setCurrentLanguage(selectedLang);
      if (user) {
        await updateProfile({ targetLanguages });
      }
      navigate(`/app/roadmap?lang=${selectedLang}`);
    } catch (err: any) {
      toast(`Không thể lưu ngôn ngữ: ${err.message}`, 'error');
      setIsSaving(false);
    }
  };

  const handleCardClick = (langId: string, canSelect: boolean) => {
    if (canSelect) {
      setSelectedLang(langId);
    } else {
      toast(`🔒 Gói FREE của bạn gồm 3 ngôn ngữ khởi đầu: Anh, Trung, Nhật. Nâng cấp cước để mở khóa toàn bộ!`, 'warning');
      navigate('/pricing');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-2xl shadow-sm transition-all cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Gói {activePolicy.name} ({activePolicy.durationDays === null ? 'Không giới hạn ngày' : `${activePolicy.durationDays} ngày`})
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Chọn Ngôn Ngữ Bạn Muốn Học</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">Khám phá lộ trình bài học sinh động cùng Pepe Mascot bạn nhé! 🐸</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Ngôn ngữ đang học:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black">
            {selectedLanguages.length}/{activePolicy.activeLanguageLimit ?? '∞'}
          </span>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {languages.map((lang, i) => {
            const isSelected = selectedLang === lang.id;
            const canSelectLanguage = proFlags.unlockAllLanguages
              || canUseEntitlementLanguages(activePlan, [...new Set([...selectedLanguages, lang.id])]);

            return (
              <motion.div 
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Tilt3DCard maxTiltDegrees={canSelectLanguage ? 8 : 0} depthZ={canSelectLanguage ? 10 : 0} onClick={() => handleCardClick(lang.id, canSelectLanguage)}>
                  <div 
                    aria-disabled={!canSelectLanguage}
                    className={`relative w-full text-left p-6 transition-all duration-300 rounded-3xl border flex flex-col h-full ${
                      !canSelectLanguage
                        ? 'bg-slate-100/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 opacity-70 hover:border-amber-400/50 hover:bg-slate-100 cursor-pointer shadow-sm'
                        : isSelected
                        ? 'bg-white dark:bg-slate-900 border-2 border-[#58cc02] ring-4 ring-[#58cc02]/20 shadow-xl scale-[1.02]'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    {/* Top Lock Badge for Restricted Entitlements */}
                    {!canSelectLanguage && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 text-[11px] font-black flex items-center gap-1 shadow-md border border-amber-400/30">
                        <Lock size={12} className="text-amber-400 shrink-0" /> Khóa (Cần Gói Cước)
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <img 
                        src={lang.flagUrl || getFlagUrl(lang.code)} 
                        alt={`Lá cờ ${lang.name}`} 
                        className="w-14 h-10 object-cover rounded-xl shadow-md border border-slate-200 dark:border-slate-700 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-black ${isSelected ? 'text-[#58cc02]' : 'text-slate-900 dark:text-white'} truncate`}>{lang.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate">{lang.nativeName}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 flex-1 leading-relaxed font-medium">{lang.description}</p>
                    
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <span className="font-bold">{lang.totalLessons} bài học</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        lang.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        lang.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        lang.difficulty === 'hard' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>{difficultyVi[lang.difficulty] || lang.difficulty}</span>
                    </div>

                    {!canSelectLanguage && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl px-3 py-2 border border-amber-200 dark:border-amber-800/60">
                        <Lock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Mở khóa bằng gói GO / PLUS / PRO</span>
                      </div>
                    )}
                  </div>
                </Tilt3DCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Bar - Unified Light Theme Glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 lg:ml-64 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
            {selectedLang 
              ? `Đã chọn: ${languages.find(l => l.id === selectedLang)?.name}` 
              : 'Hãy chọn 1 ngôn ngữ để bắt đầu lộ trình.'}
          </p>

          <button 
            onClick={handleStartLearning}
            disabled={!selectedLang || isSaving}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
              !selectedLang || isSaving 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed shadow-none' 
                : 'bg-[#58cc02] hover:bg-[#4eb802] text-white border-b-4 border-[#357c02] active:translate-y-1 shadow-emerald-500/20'
            }`}
          >
            {isSaving ? 'Đang lưu...' : 'Bắt Đầu Học Ngay'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
