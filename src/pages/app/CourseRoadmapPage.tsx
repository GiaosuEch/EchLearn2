import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Flag, MessageCircle, Play, Target, Sparkles, BrainCircuit } from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { useCourseRoadmap } from '../../hooks/useCourseRoadmap';
import type { ProductPack } from '../../curriculum/courseRegistry';
import type { CourseUnit, CourseLesson } from '../../curriculum/englishCourse';
import type { ReadonlyDeep } from 'type-fest';
import { motion } from 'motion/react';

export default function CourseRoadmapPage() {
  const {
    isLoadingPack,
    productPack,
    completedLessonIds,
    completedLessonsCount,
    totalLessonsCount,
    nextLessonUrl,
    modules,
    nextLessonId,
    optimalCognitiveNode
  } = useCourseRoadmap();

  if (isLoadingPack || !productPack) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-semibold tracking-widest uppercase">Neural Linking...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.section 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mx-auto max-w-5xl space-y-8 pb-24"
    >
      <motion.div variants={itemVariants}>
        <RoadmapHeader 
          productPack={productPack} 
          completedLessonsCount={completedLessonsCount} 
          totalLessonsCount={totalLessonsCount} 
          nextLessonUrl={nextLessonUrl}
          optimalCognitiveNode={optimalCognitiveNode}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {productPack.features.map((feature, idx) => (
          <div key={feature.id} className="h-full">
            <Link 
              to={feature.path}
              className="group relative overflow-hidden flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 h-full min-h-[180px]"
            >
              <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={150} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest rounded-full">
                    Skill Core #{idx + 1}
                  </span>
                  <MessageCircle className="text-orange-500" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{feature.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
              </div>
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold mt-4 text-sm uppercase tracking-wider">
                <span>Bắt đầu bài</span>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={18} /></motion.div>
              </div>
            </Link>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <RoadmapModuleList 
          modules={modules} 
          completedLessonIds={completedLessonIds} 
          nextLessonId={nextLessonId} 
        />
      </motion.div>
    </motion.section>
  );
}

function RoadmapHeader({
  productPack,
  completedLessonsCount,
  totalLessonsCount,
  nextLessonUrl,
  optimalCognitiveNode
}: {
  productPack: ReadonlyDeep<ProductPack>;
  completedLessonsCount: number;
  totalLessonsCount: number;
  nextLessonUrl: string;
  optimalCognitiveNode?: any;
}) {
  const progress = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0;

  return (
    <header className="relative overflow-hidden grid gap-8 rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-none dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_200px]">
      <div className="relative z-10 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-fit mb-6 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
          <Target size={14} /> Neural Pathway
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] dark:text-white">
          {productPack.title || 'Lộ trình học tập'}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          {productPack.description || 'Hoàn thành các bài học dưới đây để đạt được mục tiêu giao tiếp.'}
        </p>
        
        {optimalCognitiveNode && (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="text-amber-400" size={18} />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Hệ Thống Đề Xuất Bayesian</p>
            </div>
            <p className="text-amber-100">Cần củng cố ngay: <strong className="text-white bg-amber-500/20 px-2 py-0.5 rounded ml-1">{optimalCognitiveNode.titleVi}</strong></p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <Link 
            to={optimalCognitiveNode ? `/app/lesson?id=${optimalCognitiveNode.id}` : nextLessonUrl} 
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            data-testid="next-lesson-button"
          >
            <Play size={16} className="fill-current" /> {optimalCognitiveNode ? 'Học node ưu tiên' : 'Tiếp tục lộ trình'}
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ tổng ({Math.round(progress)}%)</span>
            <div className="h-2 w-48 rounded-full bg-slate-800 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex relative items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="relative z-10 drop-shadow-2xl">
          <Mascot size={180} expression={'happy'} message="Cùng học nào!" />
        </div>
      </div>
    </header>
  );
}

function RoadmapModuleList({
  modules,
  completedLessonIds,
  nextLessonId
}: {
  modules: ReadonlyDeep<CourseUnit[]>;
  completedLessonIds: string[];
  nextLessonId?: string;
}) {
  return (
    <div className="space-y-12 mt-12">
      {modules.map((unit, index) => (
        <section key={unit.id} className="relative pl-4 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-[#0a0a0a]" />
          <div className="mb-8">
            <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">Module {index + 1}</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{unit.title}</h2>
            <p className="mt-2 text-slate-500 max-w-2xl text-lg">{unit.description}</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unit.lessons.map((lesson) => (
              <LessonNode 
                key={lesson.id} 
                unit={unit} 
                lesson={lesson} 
                isCompleted={completedLessonIds.includes(lesson.id)} 
                isActive={lesson.id === nextLessonId} 
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonNode({
  unit,
  lesson,
  isCompleted,
  isActive
}: {
  unit: ReadonlyDeep<CourseUnit>;
  lesson: ReadonlyDeep<CourseLesson>;
  isCompleted: boolean;
  isActive: boolean;
}) {
  const isSurvival = lesson.id.includes('survival');
  const lessonUrl = isSurvival ? `/app/survival?lesson=${lesson.id}` : `/app/lesson?id=${unit.id}&lesId=${lesson.id}`;

  const stateClass = isCompleted
    ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60'
    : isActive
    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]'
    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100';

  return (
    <Link
      to={lessonUrl}
      data-testid={`lesson-node-${lesson.id}`}
      data-state={isCompleted ? 'completed' : isActive ? 'active' : 'locked'}
      className={`group flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${stateClass}`}
    >
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${
            isCompleted ? 'text-emerald-500' : isActive ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            {lesson.type}
          </p>
          <h3 className={`mt-2 font-bold leading-snug ${
            isCompleted || isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {lesson.title}
          </h3>
        </div>
        <div className="shrink-0 mt-1">
          {isCompleted && <CheckCircle2 className="text-emerald-500" size={24} />}
          {!isCompleted && isActive && (
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Flag className="text-emerald-500" size={24} />
            </motion.div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4">
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          ~{lesson.metadata?.estimatedMinutes || 10}m
        </span>
        <span className={`text-xs font-black uppercase tracking-wider ${
          isCompleted ? 'text-emerald-500' : isActive ? 'text-emerald-500' : 'text-slate-400'
        }`}>
          {isCompleted ? 'Ôn lại' : isActive ? 'Học ngay' : 'Khóa'}
        </span>
      </div>
    </Link>
  );
}
