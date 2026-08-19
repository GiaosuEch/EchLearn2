import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { LEARNING_PACKS } from '../../../packs/learningPacks';
import { LessonRouteRecovery } from '../../../components/learning/LessonRouteRecovery';

const languageLabels: Readonly<Record<string, string>> = {
  japanese: 'Tiếng Nhật',
  chinese: 'Tiếng Trung',
  korean: 'Tiếng Hàn',
};

export function LanguagePackDashboardPage() {
  const { lang = '' } = useParams();

  const pack = useMemo(() => LEARNING_PACKS.find((candidate) => candidate.manifest.language === lang), [lang]);

  if (!pack) {
    return <LessonRouteRecovery reason="unknown-route" dashboardTo="/app/languages" />;
  }

  const skills = [...new Set(pack.routes.map((route) => route.skill))];
  const label = languageLabels[lang] ?? lang.toUpperCase();

  return (
    <section aria-labelledby="language-pack-dashboard-heading" className="mx-auto max-w-3xl px-4 py-10">
      <h1 id="language-pack-dashboard-heading" className="text-3xl font-black text-slate-950 dark:text-white">
        Lộ trình {label}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{pack.manifest.title}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {skills.map((skill) => (
          <li key={skill}>
            <Link
              to={`/app/${lang}/${skill}`}
              className="flex min-h-24 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
            >
              <BookOpen size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>
                <span className="block text-sm font-black capitalize text-slate-950 dark:text-white">{skill}</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Mở các bài học kỹ năng này</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/app/languages"
        className="mt-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-white dark:text-slate-950"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Chọn ngôn ngữ khác
      </Link>
    </section>
  );
}

export default LanguagePackDashboardPage;