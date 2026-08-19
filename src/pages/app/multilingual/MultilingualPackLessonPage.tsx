import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { useSRSStore, type SRSItem, type LessonProgress } from '../../../stores/srsStore';
import { learningPackRegistry } from '../../../packs/learningPacks';
import { resolveJapaneseJlptN5PackPath } from '../../../packs/japaneseJlptN5Pack';
import { resolveChineseHsk1PackPath } from '../../../packs/chineseHsk1Pack';
import { resolveKoreanTopik1PackPath } from '../../../packs/koreanTopik1Pack';
import { LessonRouteRecovery } from '../../../components/learning/LessonRouteRecovery';
import type { LearningPathNode } from '../../../domain/learning/learningPackRegistry';

type PackPathResolver = (items: Readonly<Record<string, SRSItem>>, progress: Readonly<Record<string, LessonProgress>>) => LearningPathNode[];

const packPathResolvers: Readonly<Record<string, PackPathResolver>> = {
  japanese: resolveJapaneseJlptN5PackPath,
  chinese: resolveChineseHsk1PackPath,
  korean: resolveKoreanTopik1PackPath,
};

export function MultilingualPackLessonPage() {
  const { lang = '', skill = '' } = useParams();
  const [searchParams] = useSearchParams();
  const requestedLessonId = searchParams.get('lesson');
  const items = useSRSStore((state) => state.items);
  const lessonProgress = useSRSStore((state) => state.lessonProgress);

  const nodes = useMemo(() => {
    const resolve = packPathResolvers[lang];
    if (!resolve) return [];
    return resolve(items, lessonProgress);
  }, [lang, items, lessonProgress]);

  const resolution = useMemo(() => learningPackRegistry.resolveLessonRoute(`/app/${lang}/${skill}`, requestedLessonId, nodes), [lang, skill, requestedLessonId, nodes]);

  const dashboardTo = `/app/${lang}`;

  if (resolution.kind === 'invalid') {
    return <LessonRouteRecovery reason={resolution.reason} dashboardTo={dashboardTo} />;
  }

  const { lesson } = resolution;
  const mastered = lesson.masteryThreshold >= 90;
  const prerequisites = lesson.prerequisites.length > 0
    ? lesson.prerequisites.map((prerequisite) => prerequisite.lessonId).join(', ')
    : null;

  return (
    <section aria-labelledby="multilingual-lesson-heading" className="mx-auto max-w-3xl px-4 py-10">
      <h1 id="multilingual-lesson-heading" className="text-3xl font-black text-slate-950 dark:text-white">{lesson.title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{lesson.objective}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Kỹ năng</dt>
          <dd className="mt-1 text-sm font-bold capitalize text-slate-950 dark:text-white">{lesson.skill}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ngưỡng thuần thục</dt>
          <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
            <BookOpenCheck size={15} className="mr-1 inline text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {mastered ? 'Thành thạo (bài tập chủ động)' : `${lesson.masteryThreshold}%`}
          </dd>
        </div>
      </dl>
      {prerequisites && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Yêu cầu trước: <span className="font-semibold">{prerequisites}</span>
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={dashboardTo} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-white dark:text-slate-950">
          <ArrowLeft size={16} aria-hidden="true" /> Quay về lộ trình
        </Link>
      </div>
    </section>
  );
}

export default MultilingualPackLessonPage;