import { ArrowRight, CheckCircle2, MessageCircle, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';
import { languages } from '../../data/languages';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { type FirstWinGoal, writeFirstWinDraft } from '../../services/firstWinService';

const goals: Array<{ id: FirstWinGoal; title: string; description: string; icon: typeof Target }> = [
  { id: 'habit', title: 'Giữ nhịp học mỗi ngày', description: 'Bắt đầu bằng một bước nhỏ, rõ ràng và dễ quay lại.', icon: Target },
  { id: 'speaking', title: 'Tự tin giao tiếp hơn', description: 'Luyện phản xạ với từ và cụm từ bạn có thể dùng ngay.', icon: MessageCircle },
  { id: 'ielts', title: 'Xây nền tảng IELTS', description: 'Làm quen cách học có mục tiêu trước khi đi vào từng kỹ năng.', icon: Trophy },
];

const starterLanguages = languages.filter((language) => canUseEntitlementLanguages('free', [language.code]));

export default function FirstWinStartPage() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<FirstWinGoal>('habit');
  const [targetLanguage, setTargetLanguage] = useState('en');

  const continueToRegister = () => {
    const draft = writeFirstWinDraft({ goal, targetLanguage });
    const params = new URLSearchParams({ activation: 'first-win', goal: draft.goal, lang: draft.targetLanguage });
    navigate(`/register?${params.toString()}`);
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[var(--ech-cream)] px-5 py-10 text-[var(--ech-ink)] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <aside className="rounded-[2rem] border border-[#087A42]/15 bg-white/70 p-6 shadow-[0_20px_64px_rgba(5,60,41,0.08)] sm:p-9">
          <EchBuriAnimated size={176} state="welcome" className="mx-auto" />
          <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#178D72]">Ngày đầu tiên cùng Ech Buri</p>
          <h1 className="mt-3 text-center text-3xl font-black tracking-tight sm:text-4xl">Mục tiêu 8 phút đầu tiên</h1>
          <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-[var(--ech-ink-soft)]">
            Chỉ cần chọn điều bạn muốn cải thiện. Sau khi tạo tài khoản, Ech Buri sẽ mở bài học khởi động dành cho bạn.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#087A42]">
            <CheckCircle2 size={16} aria-hidden="true" /> Không cần thẻ tín dụng
          </div>
        </aside>

        <div className="rounded-[2rem] border border-[#087A42]/15 bg-white p-6 shadow-[0_20px_64px_rgba(5,60,41,0.08)] sm:p-9">
          <fieldset>
            <legend className="text-lg font-extrabold">Hôm nay bạn muốn tiến một bước ở đâu?</legend>
            <div className="mt-4 grid gap-3">
              {goals.map(({ id, title, description, icon: Icon }) => {
                const selected = goal === id;
                return (
                  <label key={id} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${selected ? 'border-[#087A42] bg-[#1BAD5B]/10' : 'border-slate-200 hover:border-[#1BAD5B]/50'}`}>
                    <input className="mt-1 h-4 w-4 accent-[#087A42]" type="radio" name="first-win-goal" value={id} checked={selected} onChange={() => setGoal(id)} />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087A42]/10 text-[#087A42]"><Icon size={20} aria-hidden="true" /></span>
                    <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-sm leading-relaxed text-[var(--ech-ink-soft)]">{description}</span></span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-sm font-extrabold">Chọn ngôn ngữ khởi đầu</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {starterLanguages.map((language) => {
                const selected = targetLanguage === language.code;
                return <label key={language.code} className={`cursor-pointer rounded-2xl border p-3 text-center transition-colors ${selected ? 'border-[#087A42] bg-[#1BAD5B]/10' : 'border-slate-200 hover:border-[#1BAD5B]/50'}`}>
                  <input className="sr-only" type="radio" name="first-win-language" value={language.code} checked={selected} onChange={() => setTargetLanguage(language.code)} />
                  <span className="text-xl" aria-hidden="true">{language.flag}</span>
                  <span className="mt-1 block text-xs font-bold">{language.name}</span>
                </label>;
              })}
            </div>
          </fieldset>

          <button type="button" onClick={continueToRegister} className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F77B38] px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087A42] focus-visible:ring-offset-2">
            Tiếp tục tạo tài khoản <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
