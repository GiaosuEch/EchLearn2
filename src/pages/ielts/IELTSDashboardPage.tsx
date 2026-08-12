import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Headphones,
  Info,
  Mic,
  PenTool,
} from 'lucide-react';

const skills = [
  {
    name: 'Listening',
    description: 'Luyện nghe và kiểm tra đáp án trên bộ nội dung đang có. Giọng đọc có thể do trình duyệt tổng hợp.',
    action: 'Mở bài luyện nghe',
    path: '/app/ielts/listening',
    icon: Headphones,
  },
  {
    name: 'Reading',
    description: 'Đọc passage, chọn đáp án và xem câu đúng. Kết quả chỉ áp dụng cho số câu trong bài này.',
    action: 'Mở bài luyện đọc',
    path: '/app/ielts/reading',
    icon: BookOpen,
  },
  {
    name: 'Writing',
    description: 'Soạn bài theo prompt, theo dõi số từ và dùng checklist để tự rà soát trước khi viết lại.',
    action: 'Mở bài luyện viết',
    path: '/app/ielts/writing',
    icon: PenTool,
  },
  {
    name: 'Speaking',
    description: 'Xem câu hỏi theo phần thi và chuẩn bị câu trả lời. Không có chấm phát âm hoặc band tự động.',
    action: 'Mở bài luyện nói',
    path: '/app/ielts/speaking',
    icon: Mic,
  },
] as const;

export default function IELTSDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-7 pb-20">
      <header className="rounded-2xl border border-rose-200 bg-amber-50 p-6 dark:border-rose-900 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-1 shrink-0 text-rose-700 dark:text-rose-300" size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-rose-800 dark:text-rose-300">Product pack · IELTS Academic</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Chọn một kỹ năng để luyện</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-700 dark:text-slate-300">Các bài hiện có giúp bạn làm quen với câu hỏi và tự kiểm tra đáp án. EchLearn chưa cung cấp band score, chấm phát âm hay đánh giá Writing tự động đã được hiệu chuẩn.</p>
          </div>
        </div>
      </header>

      <section role="note" className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <Info className="mt-0.5 shrink-0" size={20} />
        <p><strong>Giới hạn kết quả:</strong> số câu đúng chỉ phản ánh bài đang làm, không được quy đổi thành band IELTS chính thức. Với Writing và Speaking, hãy dùng hướng dẫn tự rà soát hoặc nhờ người có chuyên môn phản hồi.</p>
      </section>

      <section aria-labelledby="ielts-skills-title" className="space-y-4">
        <h2 id="ielts-skills-title" className="text-xl font-black text-slate-950 dark:text-white">Bốn kỹ năng</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map(({ name, description, action, path, icon: Icon }) => (
            <article key={name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"><Icon size={24} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">IELTS {name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              <Link to={path} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">{action} <ArrowRight size={17} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <FileText className="text-emerald-700 dark:text-emerald-300" size={24} />
          <h2 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Bộ bài theo kỹ năng</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Chọn Listening, Reading, Writing hoặc Speaking. Full mock test chưa sẵn sàng nên app không dẫn bạn vào một bài nghe riêng rồi gọi đó là full test.</p>
          <Link to="/app/mock-tests" className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-emerald-800 hover:underline dark:text-emerald-200">Xem nội dung đang có <ArrowRight size={16} /></Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="text-orange-700 dark:text-orange-300" size={24} />
          <h2 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Từ vựng học thuật</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Ôn từ theo chủ đề và đặt câu. Không gắn nhãn band cho một từ riêng lẻ khi chưa có bằng chứng hiệu chuẩn.</p>
          <Link to="/app/ielts/vocabulary" className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-orange-800 hover:underline dark:text-orange-200">Mở từ vựng <ArrowRight size={16} /></Link>
        </article>
      </section>
    </main>
  );
}
