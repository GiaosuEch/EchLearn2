import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  GraduationCap,
  Headphones,
  MessageCircle,
  Mic,
  PenTool,
  Shapes,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

type PracticeCategory = 'all' | 'communication' | 'skills' | 'foundation' | 'exams';
type PracticeCard = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  outcome: string;
  path: string;
  category: Exclude<PracticeCategory, 'all'>;
  duration: string;
};

export default function PracticeHubPage() {
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const isVi = interfaceLanguage === 'vi';
  const supportsEnglishSurvival = currentLanguage === 'en' || currentLanguage === 'en-US';
  const [activeTab, setActiveTab] = useState<PracticeCategory>('all');

  const cards: PracticeCard[] = [
    ...(supportsEnglishSurvival ? [{
      id: 'english-survival',
      icon: <MessageCircle size={26} />,
      title: isVi ? 'English Survival: Giao tiếp hằng ngày' : 'English Survival: Everyday Communication',
      description: isVi ? 'Lộ trình 30 bài: hiểu tình huống, nhại có hướng dẫn, tự tạo câu và ôn nhanh.' : 'A 30-lesson path: understand the situation, guided shadowing, personal production, and retrieval.',
      outcome: isVi ? 'Sau bài này bạn có thể gọi món và yêu cầu món bớt cay.' : 'After this lesson you can order food and request less spice.',
      path: '/app/english-survival?lesson=en-survival-1',
      category: 'communication' as const,
      duration: '6 bước',
    }] : []),
    {
      id: 'listening', icon: <Headphones size={26} />, title: isVi ? 'Luyện nghe' : 'Listening practice',
      description: isVi ? 'Nghe nội dung có sẵn, xác định ý chính và kiểm tra điều bạn nghe được.' : 'Listen to available material, identify the main idea, and check what you heard.',
      outcome: isVi ? 'Mục tiêu: hiểu thông tin chính trước khi nghe chi tiết.' : 'Goal: understand the main information before details.',
      path: '/app/listening', category: 'skills', duration: '10–20 phút',
    },
    {
      id: 'speaking', icon: <Mic size={26} />, title: isVi ? 'Luyện nói' : 'Speaking practice',
      description: isVi ? 'Ghi âm để tự nghe lại, luyện câu theo ngữ cảnh và tiếp tục dù microphone không khả dụng.' : 'Record and review yourself, practise in context, and continue without a microphone.',
      outcome: isVi ? 'Mục tiêu: tạo một câu nói rõ ý trong tình huống.' : 'Goal: produce one clear sentence for the situation.',
      path: '/app/speaking', category: 'skills', duration: '10–15 phút',
    },
    {
      id: 'reading', icon: <BookOpen size={26} />, title: isVi ? 'Luyện đọc' : 'Reading practice',
      description: isVi ? 'Đọc để tìm ý chính, bằng chứng và từ khóa thay vì đoán đáp án.' : 'Read for the main idea, evidence, and keywords instead of guessing.',
      outcome: isVi ? 'Mục tiêu: chỉ ra câu hoặc đoạn hỗ trợ đáp án.' : 'Goal: point to the sentence or passage that supports your answer.',
      path: '/app/reading', category: 'skills', duration: '15–25 phút',
    },
    {
      id: 'writing', icon: <PenTool size={26} />, title: isVi ? 'Luyện viết' : 'Writing practice',
      description: isVi ? 'Viết một đoạn ngắn theo yêu cầu rồi dùng kiểm tra hình thức để tự sửa.' : 'Write a short response and use form checks to revise it yourself.',
      outcome: isVi ? 'Mục tiêu: viết rõ ý, đủ câu và tự rà soát trước khi kết thúc.' : 'Goal: write clearly and self-review before finishing.',
      path: '/app/writing', category: 'skills', duration: '15–30 phút',
    },
    {
      id: 'vocabulary', icon: <Brain size={26} />, title: isVi ? 'Từ vựng theo ngữ cảnh' : 'Vocabulary in context',
      description: isVi ? 'Học nghĩa, xem cách dùng, nhớ lại và tạo câu thay vì chỉ lật thẻ.' : 'Learn meaning, see usage, retrieve it, and create a sentence.',
      outcome: isVi ? 'Mục tiêu: dùng được từ trong một câu có ý nghĩa.' : 'Goal: use the word in a meaningful sentence.',
      path: '/app/vocabulary', category: 'foundation', duration: '10–15 phút',
    },
    {
      id: 'grammar', icon: <Shapes size={26} />, title: isVi ? 'Ngữ pháp để tạo câu' : 'Grammar for sentences',
      description: isVi ? 'Nhận diện cấu trúc, sửa lỗi có gợi ý rồi dùng cấu trúc trong câu của bạn.' : 'Identify a pattern, revise with a hint, then use it in your own sentence.',
      outcome: isVi ? 'Mục tiêu: giải thích và áp dụng một cấu trúc.' : 'Goal: explain and apply one grammar pattern.',
      path: '/app/grammar', category: 'foundation', duration: '10–20 phút',
    },
    {
      id: 'ielts', icon: <GraduationCap size={26} />, title: 'IELTS Academic',
      description: isVi ? 'Mở khu luyện thi riêng với bài tập theo kỹ năng. Kết quả trong app không phải điểm thi chính thức.' : 'Open the dedicated exam-practice area. In-app results are not official test scores.',
      outcome: isVi ? 'Mục tiêu: chọn đúng kỹ năng và đọc giới hạn trước khi bắt đầu.' : 'Goal: choose one skill and read its limitations before starting.',
      path: '/app/ielts', category: 'exams', duration: 'Theo bài',
    },
  ];

  const visibleCards = activeTab === 'all' ? cards : cards.filter((card) => card.category === activeTab);
  const tabs: { id: PracticeCategory; label: string }[] = [
    { id: 'all', label: `Tất cả (${cards.length})` },
    ...(supportsEnglishSurvival ? [{ id: 'communication' as const, label: 'Giao tiếp thực tế' }] : []),
    { id: 'skills', label: 'Nghe · Nói · Đọc · Viết' },
    { id: 'foundation', label: 'Từ vựng · Ngữ pháp' },
    { id: 'exams', label: 'Luyện thi' },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-7 pb-20">
      <header className="rounded-2xl border border-emerald-200 bg-amber-50 p-6 dark:border-emerald-900 dark:bg-slate-900 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Trung tâm luyện tập</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Chọn một việc bạn muốn làm tốt hơn</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-700 dark:text-slate-300">Mỗi mục bên dưới nói rõ bạn sẽ học gì, hành động chính và kết quả cần đạt. Bắt đầu với một mục tiêu duy nhất.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-800" role="tablist" aria-label="Lọc nội dung luyện tập">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${activeTab === tab.id ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {visibleCards.length === 0 ? (
        <section role="status" className="rounded-2xl border border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-black text-slate-950 dark:text-white">Chưa có bài phù hợp với bộ lọc này</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Chọn “Tất cả” để xem các bài đang sẵn sàng.</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <article key={card.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{card.icon}</div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><Clock size={14} /> {card.duration}</span>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
              <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{card.outcome}</p>
              <Link to={card.path} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                Bắt đầu <ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
