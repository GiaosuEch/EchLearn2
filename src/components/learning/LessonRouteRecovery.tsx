import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

type RecoveryReason = 'unknown-route' | 'invalid-lesson' | 'locked-lesson';

const messageByReason: Record<RecoveryReason, string> = {
  'unknown-route': 'Đường dẫn này không thuộc một bài học đã xuất bản.',
  'invalid-lesson': 'Bài học không tồn tại hoặc không khớp với kỹ năng bạn đang mở.',
  'locked-lesson': 'Bài học này chưa mở trong lộ trình hiện tại của bạn.',
};

export function LessonRouteRecovery({ reason, dashboardTo }: Readonly<{ reason: RecoveryReason; dashboardTo: string }>) {
  return (
    <section aria-labelledby="invalid-lesson-heading" className="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 text-center shadow-xl shadow-rose-950/5 dark:border-rose-900 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/15">
      <AlertTriangle className="mx-auto text-rose-600 dark:text-rose-300" size={30} aria-hidden="true" />
      <h2 id="invalid-lesson-heading" className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Bài học không hợp lệ</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">{messageByReason[reason]}</p>
      <Link to={dashboardTo} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:bg-white dark:text-slate-950">
        <ArrowLeft size={16} aria-hidden="true" /> Quay về lộ trình
      </Link>
    </section>
  );
}
