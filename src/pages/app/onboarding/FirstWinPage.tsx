import { ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import EchBuriAnimated, { type EchBuriAnimationState } from '../../../components/mascot/EchBuriAnimated';
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';
import { recordActivityCompletion } from '../../../services/missionProgressService';
import {
  completeFirstWin,
  getFirstWinProgress,
  readFirstWinDraft,
  saveFirstWinStart,
  type FirstWinGoal,
  type FirstWinProgress,
} from '../../../services/firstWinService';
import { vocabularyService, type VocabularyItem } from '../../../services/vocabularyService';

const goalCopy: Record<FirstWinGoal, { eyebrow: string; title: string; description: string }> = {
  habit: { eyebrow: 'Giữ nhịp mỗi ngày', title: 'Một bước nhỏ, nhưng là bước của bạn.', description: 'Hoàn thành ba câu ngắn để đánh dấu chiến thắng đầu tiên hôm nay.' },
  speaking: { eyebrow: 'Tự tin giao tiếp', title: 'Nói được bắt đầu từ hiểu đúng.', description: 'Chọn đúng nghĩa của những từ nền tảng trước khi đi vào luyện phản xạ.' },
  ielts: { eyebrow: 'Xây nền IELTS', title: 'Nền vững trước, band điểm sau.', description: 'Bắt đầu bằng ba từ cốt lõi rồi tiếp tục vào lộ trình kỹ năng.' },
};

function readGoal(value: string | null, fallback: FirstWinGoal = 'habit'): FirstWinGoal {
  return value === 'habit' || value === 'speaking' || value === 'ielts' ? value : fallback;
}

function translationOf(item: VocabularyItem): string {
  return item.meaningVietnamese || item.translation || item.meaning || item.meaningEnglish;
}

function optionSet(items: VocabularyItem[], currentIndex: number): string[] {
  const correct = translationOf(items[currentIndex]);
  const choices = [correct, ...items.map(translationOf)]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
  return choices.slice(0, Math.min(4, choices.length));
}

export default function FirstWinPage() {
  const user = useAuthStore((state) => state.user);
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const setCurrentLanguage = useAppStore((state) => state.setCurrentLanguage);
  const [searchParams] = useSearchParams();
  const draft = useMemo(() => readFirstWinDraft(), []);
  const goal = readGoal(searchParams.get('goal'), draft?.goal ?? 'habit');
  const targetLanguage = draft?.targetLanguage ?? currentLanguage;
  const [progress, setProgress] = useState<FirstWinProgress | null>(null);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setCurrentLanguage(targetLanguage);
    Promise.all([
      getFirstWinProgress(user.id),
      vocabularyService.getVocabularyForLanguage(targetLanguage),
    ]).then(async ([existing, vocabulary]) => {
      if (cancelled) return;
      const nextProgress = existing ?? await saveFirstWinStart({ userId: user.id, goal, targetLanguage });
      if (cancelled) return;
      setProgress(nextProgress);
      setItems(vocabulary.filter((item) => Boolean(translationOf(item))).slice(0, 3));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setSaveError('Chưa thể chuẩn bị bài học. Hãy thử tải lại trang.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [goal, setCurrentLanguage, targetLanguage, user?.id]);

  const allAnswered = items.length === 3 && items.every((item) => answers[item.id]);
  const isComplete = Boolean(progress?.completedAt);
  const mascotState: EchBuriAnimationState = isComplete ? 'cheering' : allAnswered ? 'thinking' : 'welcome';

  const finish = async () => {
    if (!user?.id || !allAnswered || isCompleting || isComplete) return;
    const incorrectItems = items.filter((item) => answers[item.id] !== translationOf(item));
    if (incorrectItems.length > 0) {
      setChecked(true);
      setSaveError('Hãy thử lại những câu được đánh dấu trước khi hoàn thành.');
      return;
    }
    setIsCompleting(true);
    setSaveError('');
    try {
      const result = await completeFirstWin({ userId: user.id, goal, targetLanguage });
      setProgress(result.progress);
      if (result.didComplete) {
        recordActivityCompletion({
          userId: user.id,
          skillType: 'lesson',
          source: 'first-win',
        });
        void useLearningStore.getState().incrementStreak().catch(() => undefined);
      }
    } catch {
      setSaveError('Chưa thể lưu tiến độ. Hãy thử lại; câu trả lời của bạn vẫn được giữ ở đây.');
    } finally {
      setIsCompleting(false);
    }
  };

  const copy = goalCopy[goal];

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite"><Loader2 className="animate-spin text-primary-500" aria-hidden="true" /><span className="sr-only">Đang chuẩn bị bài học đầu tiên</span></div>;
  }

  if (saveError && items.length === 0) {
    return <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-800 dark:text-rose-100" role="alert">{saveError}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <section aria-labelledby="first-win-title" aria-label="Bài học 8 phút đầu tiên, có thể cuộn" tabIndex={0} className="first-win-scroll-panel rounded-3xl border border-[var(--ech-border)] bg-[var(--ech-surface)] p-5 text-[var(--ech-text)] shadow-[var(--ech-shadow-lg)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ech-green-dark)]">{copy.eyebrow}</p>
          <h1 id="first-win-title" className="mt-3 text-3xl font-black text-[var(--ech-text)] sm:text-4xl">{isComplete ? 'Bạn đã có chiến thắng đầu tiên.' : copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ech-text-muted)]">{isComplete ? 'Tiến độ đã được lưu. Ech Buri đã chuẩn bị đúng bước học tiếp theo cho bạn.' : copy.description}</p>

          {!isComplete && <div className="mt-7 space-y-4">
            {items.map((item, index) => {
              const answer = translationOf(item);
              const selectedAnswer = answers[item.id];
              const isIncorrect = checked && Boolean(selectedAnswer) && selectedAnswer !== answer;
              const isCorrect = checked && selectedAnswer === answer;
              return (
                <fieldset key={item.id} className={`rounded-2xl border bg-[var(--ech-surface-2)] p-4 ${isIncorrect ? 'border-rose-500' : isCorrect ? 'border-[var(--ech-green)]' : 'border-[var(--ech-border)]'}`}>
                  <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--ech-green-dark)]">{index + 1}/3 · Chọn nghĩa đúng</legend>
                  <p className="mt-2 text-lg font-extrabold text-[var(--ech-text)]">{item.word}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {optionSet(items, index).map((option) => {
                      const selected = selectedAnswer === option;
                      return <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors ${selected ? 'border-[var(--ech-green)] bg-emerald-500/15 text-[var(--ech-text)]' : 'border-[var(--ech-border)] text-[var(--ech-text)] hover:border-[var(--ech-green)]'}`}>
                        <input type="radio" className="accent-primary-500" name={`first-win-${item.id}`} checked={selected} onChange={() => {
                          setChecked(false);
                          setSaveError('');
                          setAnswers((current) => ({ ...current, [item.id]: option }));
                        }} value={option} />
                        {option}
                      </label>;
                    })}
                  </div>
                  {isIncorrect && <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300" role="status">Chưa đúng, hãy chọn một nghĩa khác.</p>}
                  {isCorrect && <p className="mt-3 text-sm font-semibold text-[var(--ech-green-dark)]" role="status">Đúng rồi!</p>}
                  <p className="mt-3 text-xs text-[var(--ech-text-muted)]">Sau khi hoàn tất, bạn sẽ thấy bài học tiếp theo phù hợp với {targetLanguage.toUpperCase()}.</p>
                  <span className="sr-only">Đáp án tham chiếu: {answer}</span>
                </fieldset>
              );
            })}
          </div>}

          {saveError && <p className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-100" role="alert">{saveError}</p>}

          {isComplete ? (
            <Link to="/app/dashboard" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-extrabold text-slate-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ech-surface)]">
              Xem bước học tiếp theo <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button type="button" disabled={!allAnswered || isCompleting} onClick={finish} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-extrabold text-slate-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ech-surface)]">
              {isCompleting ? <><Loader2 size={17} className="animate-spin" aria-hidden="true" /> Đang lưu chiến thắng đầu tiên</> : <><Sparkles size={17} aria-hidden="true" /> Hoàn thành 8 phút đầu tiên</>}
            </button>
          )}
        </section>

        <aside className="rounded-3xl border border-[var(--ech-border)] bg-[var(--ech-surface)] p-6 text-center shadow-[var(--ech-shadow-lg)]">
          <EchBuriAnimated size={160} state={mascotState} className="mx-auto" />
          <h2 className="mt-3 font-extrabold text-[var(--ech-text)]">{isComplete ? 'Ech Buri ăn mừng cùng bạn!' : 'Ech Buri đang đồng hành'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ech-text-muted)]">{isComplete ? 'Một bài học hoàn thành đã được ghi vào nhiệm vụ hôm nay.' : 'Chỉ ba câu ngắn. Chọn câu trả lời bạn tin là đúng.'}</p>
          {isComplete && <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500/15 px-3 py-1.5 text-xs font-bold text-[var(--ech-green-dark)]"><CheckCircle2 size={15} aria-hidden="true" /> Đã lưu tiến độ</div>}
        </aside>
      </div>
    </div>
  );
}
