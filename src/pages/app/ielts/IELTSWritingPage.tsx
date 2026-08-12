import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Info, PenTool, RotateCcw } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsWritingPrompts } from '../../../data/ieltsData';

const reviewItems = [
  'Tôi đã trả lời trực tiếp tất cả phần của đề bài.',
  'Mỗi đoạn có một ý chính và có ví dụ hoặc giải thích hỗ trợ.',
  'Tôi đã kiểm tra từ nối, đại từ tham chiếu và thứ tự ý.',
  'Tôi đã đọc lại để sửa lỗi câu, chính tả và dấu câu.',
] as const;

export default function IELTSWritingPage() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState('');
  const [reviewed, setReviewed] = useState<boolean[]>(() => reviewItems.map(() => false));
  const prompt = ieltsWritingPrompts[promptIndex];
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const meetsLength = wordCount >= prompt.wordLimit.min;

  const switchPrompt = (index: number) => {
    setPromptIndex(index);
    setText('');
    setReviewed(reviewItems.map(() => false));
  };

  return (
    <PageShell title="IELTS Writing practice" description="Soạn bài, kiểm tra yêu cầu và tự rà soát có hướng dẫn." icon={<PenTool size={20} />} backTo="/app/ielts">
      <main className="mx-auto max-w-6xl space-y-6 pb-20">
        <section role="note" className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
          <Info className="mt-0.5 shrink-0" size={20} />
          <p><strong>Chức năng hiện có:</strong> prompt, bộ đếm từ và checklist tự rà soát. EchLearn chưa chấm band hoặc phân tích ngữ pháp tự động đã được hiệu chuẩn cho bài viết này.</p>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Chọn đề viết">
          {ieltsWritingPrompts.map((item, index) => (
            <button key={item.id} type="button" onClick={() => switchPrompt(index)} aria-pressed={promptIndex === index} className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-bold ${promptIndex === index ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'}`}>
              {item.taskType === 'task2' ? `Task 2 #${index + 1}` : item.taskType === 'task1-academic' ? 'Task 1 Academic' : 'Task 1 General'}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.2fr]">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Mục tiêu</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Viết một bản nháp đáp ứng đúng yêu cầu đề.</h1>
            </div>
            <div className="rounded-xl bg-slate-100 p-4 text-sm font-semibold leading-7 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{prompt.prompt}</div>
            <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              <span className="inline-flex items-center gap-2"><Clock size={17} /> Thời gian gợi ý: {prompt.timeLimit} phút</span>
              <span className="inline-flex items-center gap-2"><PenTool size={17} /> Tối thiểu: {prompt.wordLimit.min} từ</span>
            </div>
            <div>
              <h2 className="font-black text-slate-950 dark:text-white">Trước khi viết</h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li>Gạch chân yêu cầu chính và xác định người đọc.</li>
                <li>Viết một câu trả lời trực tiếp cho mỗi phần của đề.</li>
                <li>Chọn một ví dụ cụ thể trước khi bắt đầu đoạn thân bài.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="ielts-writing-draft" className="font-black text-slate-950 dark:text-white">Bản nháp của bạn</label>
              <span role="status" aria-live="polite" className={`rounded-full px-3 py-1 text-xs font-bold ${meetsLength ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{wordCount} / {prompt.wordLimit.min} từ</span>
            </div>
            <textarea id="ielts-writing-draft" value={text} onChange={(event) => setText(event.target.value)} rows={15} placeholder="Viết bản nháp tại đây…" className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-950 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            {wordCount > 0 && !meetsLength && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><AlertTriangle className="mt-0.5 shrink-0" size={17} /> Bạn còn thiếu {prompt.wordLimit.min - wordCount} từ so với yêu cầu tối thiểu. Hãy phát triển ý thay vì lặp lại câu.</div>
            )}

            <fieldset className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <legend className="font-black text-slate-950 dark:text-white">Tự rà soát bản nháp</legend>
              {reviewItems.map((item, index) => (
                <label key={item} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 text-sm text-slate-800 has-checked:border-emerald-600 has-checked:bg-emerald-50 dark:border-slate-700 dark:text-slate-100 dark:has-checked:bg-emerald-950/30">
                  <input type="checkbox" className="mt-1" checked={reviewed[index]} onChange={(event) => setReviewed((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} />
                  {item}
                </label>
              ))}
            </fieldset>

            {meetsLength && reviewed.every(Boolean) && (
              <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /> Bản nháp đã đủ độ dài và bạn đã hoàn tất checklist. Bước tiếp theo: sửa lại một đoạn yếu nhất hoặc nhờ người có chuyên môn phản hồi.</div>
            )}
            <button type="button" onClick={() => { setText(''); setReviewed(reviewItems.map(() => false)); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-400 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"><RotateCcw size={17} /> Xóa và viết lại</button>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
