import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sprout, Puzzle, Rocket, Trophy, Sparkles } from 'lucide-react';
import Mascot from '../../../components/mascot/Mascot';
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { languages } from '../../../data/languages';
import type { SelfAssessedLevel } from '../../../services/aiLearningEngine';

/**
 * Duolingo-style proficiency picker — replaces the old AI placement test.
 * Pure UI, no AI API calls, no test generation, no scoring engine.
 * User picks their level → we store it → redirect to dashboard.
 */

const levels: {
  id: SelfAssessedLevel;
  icon: typeof Sprout;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
  ring: string;
}[] = [
  {
    id: 'none',
    icon: Sprout,
    title: 'Mới bắt đầu',
    subtitle: 'Chưa biết gì',
    description: 'Bắt đầu từ ầm, từ sống còn và sự tự tin.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    ring: 'ring-emerald-500/30',
  },
  {
    id: 'some',
    icon: Puzzle,
    title: 'Biết một chút',
    subtitle: 'Cơ bản',
    description: 'Bạn nhận ra vài từ nhưng cần hệ thống hơn.',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    ring: 'ring-amber-500/30',
  },
  {
    id: 'known',
    icon: Rocket,
    title: 'Khá rồi',
    subtitle: 'Trung cấp',
    description: 'Bạn hiểu nền tảng và cần tăng độ chính xác.',
    color: 'text-sky-600 dark:text-sky-400',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    ring: 'ring-sky-500/30',
  },
  {
    id: 'fluent',
    icon: Trophy,
    title: 'Thành thạo',
    subtitle: 'Nâng cao',
    description: 'Bạn cần nâng tốc độ, sắc thái và phản xạ.',
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    ring: 'ring-purple-500/30',
  },
];

export default function AIOnboardingPage() {
  const navigate = useNavigate();
  const targetLanguage = useAppStore((s) => s.currentLanguage);
  const user = useAuthStore((s) => s.user);
  const language = languages.find((l) => l.id === targetLanguage);

  const [selectedLevel, setSelectedLevel] = useState<SelfAssessedLevel | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!selectedLevel || !user) return;
    setConfirmed(true);

    const estimatedLevel = selectedLevel === 'none' ? 'absolute-beginner'
      : selectedLevel === 'some' ? 'beginner'
      : selectedLevel === 'known' ? 'intermediate'
      : 'advanced';
    const weakSkills = selectedLevel === 'none' || selectedLevel === 'some'
      ? ['listening', 'vocabulary']
      : selectedLevel === 'known'
        ? ['writing', 'grammar']
        : ['speaking', 'pronunciation'];

    // Store the self-assessed level in personalizedLearningService
    try {
      const { personalizedLearningService } = await import('../../../services/personalizedLearningService');
      await personalizedLearningService.save({
        userId: user.id,
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        selfAssessedLevel: selectedLevel,
        testSeed: `self-${Date.now()}`,
        questions: [],
        answers: {},
        result: {
          score: 0,
          correct: 0,
          total: 0,
          estimatedLevel,
          confidence: 100,
          strengths: [],
          weaknesses: weakSkills,
          roadmap: [],
        },
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not save proficiency selection:', e);
    }

    // Connect the self-assessed level to the adaptive learning path so the
    // dashboard plan is built from the learner's real starting point.
    try {
      const { learningCoordinator } = await import('../../../services/learningCoordinator');
      await learningCoordinator.createInitialPathFromPlacement({
        userId: user.id,
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        placementScore: 0,
        estimatedLevel,
        weakSkills,
        strongSkills: [],
        selfRatedLevel: selectedLevel,
      });
    } catch (e) {
      console.warn('Could not create adaptive learning path:', e);
    }

    // Navigate to dashboard after a brief celebration
    setTimeout(() => {
      navigate('/app');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        <Mascot expression="happy" size={80} />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
          {language?.flag} Trình độ hiện tại của bạn?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 max-w-md mx-auto">
          Chọn mức phù hợp nhất để EchLearn tạo lộ trình học cá nhân hóa cho bạn. Bạn luôn có thể thay đổi sau.
        </p>
      </motion.div>

      {/* Level cards */}
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ delay: 0.1 }}
            className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto"
          >
            {levels.map((level, i) => {
              const Icon = level.icon;
              const isSelected = selectedLevel === level.id;
              return (
                <motion.button
                  key={level.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`
                    relative text-left p-5 rounded-2xl border-2 transition-all duration-200
                    ${isSelected
                      ? `border-emerald-500 ${level.bgLight} ${level.bgDark} ring-4 ${level.ring} shadow-lg scale-[1.02]`
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                    }
                    cursor-pointer group
                  `}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md"
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${level.bgLight} ${level.bgDark} ${level.color} mb-3 transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {level.title}
                  </h3>
                  <span className={`text-xs font-bold uppercase tracking-wider ${level.color}`}>
                    {level.subtitle}
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {level.description}
                  </p>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl mb-4 inline-block"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Tuyệt vời!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              EchLearn đang chuẩn bị lộ trình học cho bạn...
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="h-1.5 bg-emerald-500 rounded-full mt-6 max-w-xs mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm button */}
      {selectedLevel && !confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all duration-200"
          >
            <Sparkles size={18} />
            Bắt đầu hành trình
            <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
