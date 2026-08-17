import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Flag, MessageCircle, Play, Target } from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { useCourseRoadmap } from '../../hooks/useCourseRoadmap';
import type { ProductPack } from '../../curriculum/courseRegistry';
import type { CourseUnit, CourseLesson } from '../../curriculum/englishCourse';
import type { ReadonlyDeep } from 'type-fest';

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
        <p className="text-sm font-semibold">Đang chuẩn bị lộ trình...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 pb-24">
      <RoadmapHeader 
        productPack={productPack} 
        completedLessonsCount={completedLessonsCount} 
        totalLessonsCount={totalLessonsCount} 
        nextLessonUrl={nextLessonUrl}
        optimalCognitiveNode={optimalCognitiveNode}
      />

      {productPack.features.map(feature => (
        <section key={feature.id} className="flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-1 shrink-0 text-orange-700 dark:text-orange-300" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-800 dark:text-orange-300">Bài giao tiếp nền tảng</p>
              <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{feature.title}</h2>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{feature.description}</p>
            </div>
          </div>
          <Link to={feature.path} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700">Bắt đầu bài <ArrowRight size={16} /></Link>
        </section>
      ))}

      <RoadmapModuleList 
        modules={modules} 
        completedLessonIds={completedLessonIds} 
        nextLessonId={nextLessonId} 
      />
    </section>
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
  optimalCognitiveNode?: any; // any to avoid deep import issues here, will type properly if needed
}) {
  return (
    <header className="grid gap-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900 md:grid-cols-[1fr_180px] md:p-8">
      <div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Target size={14} /> LỘ TRÌNH HỌC TẬP
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{productPack.title || 'Lộ trình học tập'}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{productPack.description || 'Hoàn thành các bài học dưới đây để đạt được mục tiêu giao tiếp.'}</p>
        
        {optimalCognitiveNode && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-400">Elon Musk Standard: Khuyến nghị Tối ưu Kế tiếp</p>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">Hệ thống phân tích Bayesian nhận thấy bạn cần củng cố: <strong>{optimalCognitiveNode.titleVi}</strong></p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link 
            to={optimalCognitiveNode ? `/app/lesson?id=${optimalCognitiveNode.id}` : nextLessonUrl} 
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            data-testid="next-lesson-button"
          >
            <Play size={16} fill="currentColor" /> {optimalCognitiveNode ? 'Học node ưu tiên' : 'Học bài tiếp theo'}
          </Link>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Hoàn thành {completedLessonsCount}/{totalLessonsCount} bài học</span>
        </div>
      </div>
      <div className="flex items-end justify-center">
        <Mascot size={156} expression={'happy'} message="Cùng học nào!" />
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
    <div className="space-y-8">
      {modules.map((unit) => (
        <section key={unit.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">{unit.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{unit.description}</p>
          
          <ol className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {unit.lessons.map((lesson) => (
              <LessonNode 
                key={lesson.id} 
                unit={unit} 
                lesson={lesson} 
                isCompleted={completedLessonIds.includes(lesson.id)} 
                isActive={lesson.id === nextLessonId} 
              />
            ))}
          </ol>
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

  return (
    <li>
      <Link
        to={lessonUrl}
        data-testid={`lesson-node-${lesson.id}`}
        data-state={isCompleted ? 'completed' : isActive ? 'active' : 'locked'}
        className={`flex h-full flex-col justify-between rounded-xl border p-4 transition ${
          isCompleted
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-500/10'
            : isActive
            ? 'border-emerald-500 bg-white ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-slate-800'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${
              isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {lesson.type}
            </p>
            <h3 className={`mt-1 font-bold ${
              isCompleted ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-900 dark:text-white'
            }`}>
              {lesson.title}
            </h3>
          </div>
          {isCompleted && (
            <CheckCircle2 className="shrink-0 text-emerald-500" size={20} />
          )}
          {!isCompleted && isActive && (
            <Flag className="shrink-0 text-emerald-500" size={20} />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/50">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ~{lesson.metadata?.estimatedMinutes || 10} phút
          </span>
          <span className={`text-xs font-bold ${
            isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}>
            {isCompleted ? 'Học lại' : isActive ? 'Bắt đầu' : 'Chưa học'}
          </span>
        </div>
      </Link>
    </li>
  );
}
