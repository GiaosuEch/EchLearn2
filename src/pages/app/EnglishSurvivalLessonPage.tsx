import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  ListChecks,
  Volume2,
} from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { englishSurvival30, getEnglishSurvivalLesson } from '../../curriculum/englishSurvival30.ts';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { completeEnglishSurvivalLesson } from '../../services/englishSurvivalProgressService.ts';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

const stages = [
  'Tình huống',
  'Hiểu ý',
  'Nghe & nhại',
  'Bóc tách ngữ cảnh',
  'Tự tạo câu',
  'Ôn nhanh & tự rà soát',
] as const;

function StageHeading({ stage, title, description }: { stage: number; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Bước {stage + 1}/6 · {stages[stage]}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function StepButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
    >
      {children} <ArrowRight size={17} aria-hidden="true" />
    </button>
  );
}

export default function EnglishSurvivalLessonPage() {
  const [searchParams] = useSearchParams();
  const lesson = getEnglishSurvivalLesson(searchParams.get('lesson') || '');
  const user = useAuthStore((state) => state.user);
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);
  const { speak, isSpeaking, error: speechError } = useTextToSpeech();
  const [stage, setStage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [comprehensionFeedback, setComprehensionFeedback] = useState<string | null>(null);
  const [productionResponse, setProductionResponse] = useState('');
  const [retrievalResponse, setRetrievalResponse] = useState('');
  const [selfReview, setSelfReview] = useState<Record<string, boolean>>({});
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const nextLesson = useMemo(() => lesson
    ? englishSurvival30.find((candidate) => candidate.order === lesson.order + 1)
    : undefined, [lesson]);

  if (!lesson) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
        <section className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <Mascot size={112} expression="thinking" action="thinking" message="Buri chưa tìm thấy bài này." />
          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">Bài học không khả dụng</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Hãy quay lại lộ trình và chọn một bài English Survival đang có.</p>
          <Link to="/app/roadmap" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><ArrowLeft size={17} /> Về lộ trình</Link>
        </section>
      </main>
    );
  }

  const checkComprehension = () => {
    if (selectedAnswer !== lesson.comprehension.correctAnswer) {
      setComprehensionFeedback(lesson.comprehension.explanationVi);
      return;
    }
    setComprehensionFeedback(null);
    setStage(2);
  };

  const completeLesson = async () => {
    setIsCompleting(true);
    setCompletionError(null);
    try {
      const result = await completeEnglishSurvivalLesson({
        lesson,
        userId: user?.id,
        nativeLanguage,
        interfaceLanguage,
        productionResponse,
        retrievalResponse,
        selfReview,
      });
      if (!result.ok) {
        setCompletionError(result.messageVi);
        return;
      }
      setCompleted(true);
    } catch {
      setCompletionError('Chưa thể lưu tiến độ ngay lúc này. Hãy thử lại sau ít phút.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (completed) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm dark:border-emerald-500/30 dark:bg-slate-900 sm:p-10">
          <Mascot size={150} expression="encouraging" action="celebrating" message="Bạn vừa tạo được một câu của riêng mình!" />
          <CheckCircle2 className="mx-auto mt-6 text-emerald-600" size={36} aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">Hoàn thành: {lesson.titleVi}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">Tiến độ đã được lưu từ phần tự tạo câu, ôn nhanh và tự rà soát của bạn.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {nextLesson && <Link to={`/app/english-survival?lesson=${nextLesson.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Bài tiếp theo <ArrowRight size={17} /></Link>}
            <Link to="/app/roadmap" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"><ListChecks size={17} /> Về lộ trình</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-24 sm:py-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/roadmap" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeft size={17} /> Lộ trình</Link>
        <p className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">English Survival · Bài {lesson.order}/30</p>
      </header>

      <div className="mb-6" aria-label={`Tiến độ bài học: bước ${stage + 1} trên 6`}>
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300"><span>{stages[stage]}</span><span>{stage + 1}/6</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_190px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {stage === 0 && <>
            <StageHeading stage={stage} title={lesson.titleVi} description={lesson.canDoVi} />
            <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">Bối cảnh: {lesson.scenario.settingVi}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{lesson.scenario.roles.join(' · ')}</p>
            </div>
            <div className="mt-5 space-y-3">
              {lesson.dialogue.map((line) => <article key={`${line.speaker}-${line.text}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><p className="font-black text-slate-950 dark:text-white">{line.speaker}: {line.text}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{line.vi}</p></article>)}
            </div>
            <div className="mt-7"><StepButton onClick={() => setStage(1)}>Sang phần hiểu ý</StepButton></div>
          </>}

          {stage === 1 && <>
            <StageHeading stage={stage} title="Hiểu ý trước khi nhại" description={lesson.comprehension.promptVi} />
            <fieldset className="mt-7 space-y-3">
              <legend className="sr-only">Chọn câu trả lời</legend>
              {lesson.comprehension.options.map((option) => <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold transition ${selectedAnswer === option ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}`}><input type="radio" name="comprehension" value={option} checked={selectedAnswer === option} onChange={() => { setSelectedAnswer(option); setComprehensionFeedback(null); }} className="size-4 accent-emerald-600" />{option}</label>)}
            </fieldset>
            {comprehensionFeedback && <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"><CircleAlert className="mt-0.5 shrink-0" size={18} />{comprehensionFeedback}</div>}
            <div className="mt-7"><StepButton disabled={!selectedAnswer} onClick={checkComprehension}>Kiểm tra ý</StepButton></div>
          </>}

          {stage === 2 && <>
            <StageHeading stage={stage} title="Nghe & nhại từng nhịp ngắn" description="Nghe từng cụm, đọc thành tiếng và tự so sánh nhịp nói của mình với câu mẫu." />
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100"><p className="font-black">Âm thanh tổng hợp từ thiết bị</p><p className="mt-1 leading-6">Buri dùng giọng có sẵn trên thiết bị của bạn để phát câu mẫu; đây không phải bản ghi người thật.</p></div>
            <div className="mt-5 space-y-3">
              {lesson.chunks.map((chunk, index) => <article key={chunk.text} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Cụm {index + 1}</p><p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{chunk.text}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{chunk.vi}</p></div><button type="button" onClick={() => void speak(chunk.text, 'en-US', 0.82)} disabled={isSpeaking} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"><Volume2 size={17} /> Nghe cụm</button></div></article>)}
            </div>
            {speechError && <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300">{speechError}</p>}
            <div className="mt-7"><StepButton onClick={() => setStage(3)}>Tôi đã đọc thành tiếng</StepButton></div>
          </>}

          {stage === 3 && <>
            <StageHeading stage={stage} title="Bóc tách ngữ cảnh" description={lesson.contextCue.bodyVi} />
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10"><div className="flex gap-3"><Lightbulb className="shrink-0 text-amber-700 dark:text-amber-300" size={20} /><div><h2 className="font-black text-amber-950 dark:text-amber-100">{lesson.contextCue.titleVi}</h2><p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-100">{lesson.contextCue.bodyVi}</p></div></div></div>
            <div className="mt-5 space-y-3">{lesson.chunks.map((chunk) => <article key={chunk.text} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><p className="font-black text-slate-950 dark:text-white">{chunk.text}</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-200"><span className="font-bold text-emerald-700 dark:text-emerald-300">Dùng khi:</span> {chunk.useWhenVi}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300"><span className="font-bold">Gợi ý cho người Việt:</span> {chunk.vietnameseLearnerCueVi}</p></article>)}</div>
            <div className="mt-7"><StepButton onClick={() => setStage(4)}>Tự tạo câu của tôi</StepButton></div>
          </>}

          {stage === 4 && <>
            <StageHeading stage={stage} title="Tự tạo một câu trong tình huống" description={lesson.production.promptVi} />
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-950"><p className="font-bold text-slate-950 dark:text-white">Thêm chi tiết thật của bạn:</p><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">{lesson.production.requiredSlots.map((slot) => <li key={slot}>{slot}</li>)}</ul><p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Câu mẫu để tham khảo: “{lesson.production.exemplar}” — chép nguyên câu mẫu sẽ không hoàn thành bài.</p></div>
            <label className="mt-5 block text-sm font-bold text-slate-900 dark:text-white" htmlFor="production-response">Câu của bạn</label>
            <textarea id="production-response" value={productionResponse} onChange={(event) => setProductionResponse(event.target.value)} rows={4} placeholder="Viết một câu mới bằng chi tiết của bạn…" className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-900" />
            <div className="mt-7"><StepButton disabled={!productionResponse.trim()} onClick={() => setStage(5)}>Sang phần ôn nhanh</StepButton></div>
          </>}

          {stage === 5 && <>
            <StageHeading stage={stage} title="Ôn nhanh & tự rà soát" description={lesson.retrieval.promptVi} />
            <label className="mt-6 block text-sm font-bold text-slate-900 dark:text-white" htmlFor="retrieval-response">Viết câu bạn nhớ được</label>
            <input id="retrieval-response" value={retrievalResponse} onChange={(event) => setRetrievalResponse(event.target.value)} placeholder="Không nhìn lại câu mẫu…" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-900" />
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{lesson.retrieval.answerHintVi}</p>
            <fieldset className="mt-6 space-y-3"><legend className="text-sm font-black text-slate-950 dark:text-white">Tự rà soát trước khi lưu</legend>{lesson.selfReview.map((prompt) => <label key={prompt} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><input type="checkbox" checked={Boolean(selfReview[prompt])} onChange={(event) => setSelfReview((current) => ({ ...current, [prompt]: event.target.checked }))} className="mt-0.5 size-4 accent-emerald-600" />{prompt}</label>)}</fieldset>
            {completionError && <div className="mt-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100"><CircleAlert className="mt-0.5 shrink-0" size={18} />{completionError}</div>}
            <div className="mt-7"><StepButton disabled={isCompleting} onClick={() => void completeLesson()}>{isCompleting ? 'Đang lưu tiến độ' : <>Hoàn thành bài <Check size={17} /></>}</StepButton></div>
          </>}
        </div>

        <aside className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10 lg:sticky lg:top-5 lg:h-fit">
          <Mascot size={128} expression={stage === 1 ? 'thinking' : stage === 2 ? 'happy' : stage >= 5 ? 'encouraging' : 'happy'} action={stage === 2 ? 'listening' : stage === 1 ? 'thinking' : undefined} message={stage === 2 ? 'Nghe một cụm, rồi nhại lại.' : stage >= 5 ? 'Bạn sắp hoàn thành rồi.' : 'Đi từng bước, không cần vội.'} />
          <p className="mt-4 text-xs font-bold leading-5 text-emerald-900 dark:text-emerald-100">{lesson.canDoVi}</p>
        </aside>
      </section>
    </main>
  );
}
