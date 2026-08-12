import { ArrowRight, BookOpen, Headphones, Info, Mic, PenTool, Target } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../../PageShell';

const availablePractice = [
  { title: 'Listening practice', path: '/app/ielts/listening', icon: Headphones, description: 'Nghe nội dung hiện có và kiểm tra đáp án trong từng section.' },
  { title: 'Reading practice', path: '/app/ielts/reading', icon: BookOpen, description: 'Đọc passage và kiểm tra số câu đúng của riêng passage đó.' },
  { title: 'Writing practice', path: '/app/ielts/writing', icon: PenTool, description: 'Soạn bản nháp, theo dõi số từ và dùng checklist tự rà soát.' },
  { title: 'Speaking practice', path: '/app/ielts/speaking', icon: Mic, description: 'Chuẩn bị và luyện câu trả lời; không có chấm phát âm tự động.' },
] as const;

export default function MockTestCenterPage() {
  return (
    <PageShell title="IELTS practice library" description="Chọn đúng kỹ năng đang có thay vì bắt đầu một full mock chưa được triển khai." icon={<Target size={20} />} backTo="/app/ielts">
      <main className="mx-auto max-w-5xl space-y-6 pb-20">
        <section role="status" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <Info className="mt-0.5 shrink-0" size={21} />
          <div>
            <h1 className="font-black">Full mock test chưa sẵn sàng</h1>
            <p className="mt-1 text-sm leading-6">App chưa có session 4 kỹ năng, giới hạn thời gian và quy đổi điểm đã được kiểm chứng. Vì vậy EchLearn không mở một bài Listening riêng rồi gọi đó là full mock.</p>
          </div>
        </section>

        <section aria-labelledby="available-practice-title">
          <h2 id="available-practice-title" className="text-xl font-black text-slate-950 dark:text-white">Nội dung có thể luyện ngay</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {availablePractice.map(({ title, path, icon: Icon, description }) => (
              <article key={title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="text-emerald-700 dark:text-emerald-300" size={25} />
                <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                <Link to={path} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">Mở bài luyện <ArrowRight size={17} /></Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
