import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Lock, Check } from 'lucide-react';
import { languages, getFlagUrl } from '../../data/languages';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages, getEntitlementPolicy } from '../../services/entitlementService';
import { toast } from '../../components/ui/Toast';

export default function LanguageSelectionPage() {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const { plan: activePlan, flags: proFlags } = useProAccess();
  const activePolicy = getEntitlementPolicy(activePlan);
  const selectedLanguages = user?.targetLanguages ?? [];

  const difficultyVi: Record<string, string> = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
    expert: 'Chuyên sâu'
  };

  const difficultyColor: Record<string, string> = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    hard: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
    expert: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  };

  const handleStartLearning = async () => {
    if (!selectedLang) return;
    const targetLanguages = [...new Set([...selectedLanguages, selectedLang])];
    if (!proFlags.unlockAllLanguages && !canUseEntitlementLanguages(activePlan, targetLanguages)) {
      toast(`Ngôn ngữ này cần mở khóa bằng gói GO, PLUS hoặc PRO.`, 'info');
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
      toast(`Nâng cấp gói cước để mở khóa ngôn ngữ này.`, 'warning');
      navigate('/pricing');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--ech-border)] pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl border border-[var(--ech-border)] bg-[var(--ech-surface)] text-[var(--ech-text-muted)] hover:bg-[var(--ech-surface-2)] hover:text-[var(--ech-text)] transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
              Gói {activePolicy.name}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chọn ngôn ngữ bạn muốn học</h1>
            <p className="text-sm text-[var(--ech-text-muted)] mt-1">Khám phá lộ trình bài học sinh động cùng Ech Buri</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--ech-surface)] px-4 py-2.5 rounded-xl border border-[var(--ech-border)] shadow-[var(--ech-shadow-xs)] text-xs font-medium text-[var(--ech-text-muted)]">
          <span>Đang học:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold">
            {selectedLanguages.length}/{activePolicy.activeLanguageLimit ?? '∞'}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang, i) => {
            const isSelected = selectedLang === lang.id;
            const canSelectLanguage = proFlags.unlockAllLanguages
              || canUseEntitlementLanguages(activePlan, [...new Set([...selectedLanguages, lang.id])]);

            return (
              <motion.div
                key={lang.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  type="button"
                  aria-disabled={!canSelectLanguage}
                  onClick={() => handleCardClick(lang.id, canSelectLanguage)}
                  className={`relative w-full text-left p-5 transition-all duration-200 rounded-2xl border flex flex-col h-full cursor-pointer ${
                    !canSelectLanguage
                      ? 'bg-[var(--ech-surface-2)] border-[var(--ech-border)] opacity-60'
                      : isSelected
                      ? 'bg-[var(--ech-surface)] border-emerald-500 ring-2 ring-emerald-500/20 shadow-[var(--ech-shadow-md)]'
                      : 'bg-[var(--ech-surface)] border-[var(--ech-border)] hover:border-emerald-300 hover:shadow-[var(--ech-shadow-md)] hover:-translate-y-0.5'
                  }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}

                  {/* Lock badge */}
                  {!canSelectLanguage && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      <Lock size={12} />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <img
                      src={lang.flagUrl || getFlagUrl(lang.code)}
                      alt={`${lang.name} flag`}
                      className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-[var(--ech-border)] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-bold truncate ${isSelected ? 'text-emerald-600' : ''}`}>{lang.name}</h3>
                      <p className="text-xs text-[var(--ech-text-muted)] truncate">{lang.nativeName}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--ech-text-muted)] mt-3 flex-1 leading-relaxed">{lang.description}</p>

                  <div className="mt-4 flex items-center justify-between text-xs border-t border-[var(--ech-border)] pt-3">
                    <span className="font-medium text-[var(--ech-text-muted)]">{lang.totalLessons} bài</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColor[lang.difficulty] || ''}`}>
                      {difficultyVi[lang.difficulty] || lang.difficulty}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-5 bg-[var(--ech-surface)]/95 backdrop-blur-md border-t border-[var(--ech-border)] z-40 lg:ml-64 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-[var(--ech-text-muted)]">
            {selectedLang
              ? `Đã chọn: ${languages.find(l => l.id === selectedLang)?.name}`
              : 'Chọn một ngôn ngữ để bắt đầu.'}
          </p>

          <button
            onClick={handleStartLearning}
            disabled={!selectedLang || isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              !selectedLang || isSaving
                ? 'bg-[var(--ech-surface-2)] text-[var(--ech-text-muted)] border border-[var(--ech-border)] cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-px active:translate-y-0 shadow-sm'
            }`}
          >
            {isSaving ? 'Đang lưu...' : 'Bắt đầu học'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
