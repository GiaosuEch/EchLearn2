import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  ListChecks,
  Volume2,
  Plus,
} from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { toast } from '../../components/ui/Toast';
import { getRealworldSurvivalLesson, getAllRealworldLessonsForLanguage } from '../../curriculum/realworldSurvivalData.ts';
import { completeRealworldSurvivalLesson } from '../../services/realworldSurvivalProgressService.ts';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useMistakeNotebookStore } from '../../stores/mistakeNotebookStore';
import { type SimulationFeedback } from '../../domain/realworld/SimulationEngine.ts';
import { supabase } from '../../lib/supabase.ts';
import { BlobBackground } from '../../components/ui/BlobBackground';

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
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Bước {stage + 1}/6 · {stages[stage]}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
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
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
    >
      {children} <ArrowRight size={17} aria-hidden="true" />
    </button>
  );
}

export default function RealworldLessonPage() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lesson') || '';
  const lang = lessonId.split('-')[0] || 'en';
  const lesson = getRealworldSurvivalLesson(lang, lessonId);
  const user = useAuthStore((state) => state.user);
  
  const { addMistake } = useMistakeNotebookStore();
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);
  const interfaceLanguage = useAppStore((state) => state.interfaceLanguage);
  const [stage, setStage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [comprehensionFeedback, setComprehensionFeedback] = useState<string | null>(null);
  const [productionResponse, setProductionResponse] = useState('');
  const [productionFeedback, setProductionFeedback] = useState<SimulationFeedback | null>(null);
  const [retrievalResponse, setRetrievalResponse] = useState('');
  const [selfReview, setSelfReview] = useState<Record<string, boolean>>({});
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completionErrorCode, setCompletionErrorCode] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const nextLesson = useMemo(() => lesson
    ? getAllRealworldLessonsForLanguage(lang).find((candidate) => candidate.order === lesson.order + 1)
    : undefined, [lesson, lang]);

  const speakWithBrowser = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError('Trình duyệt này chưa hỗ trợ đọc câu mẫu bằng giọng nói. Bạn vẫn có thể tự đọc theo văn bản.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Rough language mapping for speech synthesis
    const speechLangMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', es: 'es-ES', it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU', vi: 'vi-VN', th: 'th-TH', ar: 'ar-SA' };
    utterance.lang = speechLangMap[lang] || 'en-US';
    utterance.rate = 0.82;
    utterance.onstart = () => {
      setSpeechError(null);
      setIsSpeaking(true);
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechError('Không thể đọc câu mẫu trên trình duyệt này. Bạn vẫn có thể tự đọc theo văn bản.');
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const checkComprehension = useCallback(() => {
    if (!lesson) return;
    if (selectedAnswer === lesson.comprehension.correctAnswer) {
      setComprehensionFeedback(null);
      setStage(2);
    } else {
      setComprehensionFeedback(lesson.comprehension.explanationVi);
    }
  }, [lesson, selectedAnswer]);

  const checkProduction = useCallback(async () => {
    if (!lesson) return;
    setIsCompleting(true);
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { data, error } = await supabase.functions.invoke<SimulationFeedback>('evaluate-simulation', {
        body: { response: productionResponse, lessonId, language: lang }
      });

      if (error) throw error;
      if (!data) throw new Error('No feedback data returned');
      
      const feedback = data;
      setProductionFeedback(feedback);
      
      if (!feedback.isValid && user) {
        addMistake({
          userId: user.id,
          type: 'Speaking',
          mistake: productionResponse,
          correction: lesson.production.exemplar,
          notes: `Context: ${lesson.production.promptVi}`,
          languageId: lang,
          lessonId: lesson.id
        });
      }
    } catch (err) {
      console.error('Failed to evaluate production:', err);
      toast('Lỗi hệ thống khi đánh giá câu. Vui lòng thử lại.', 'error');
    } finally {
      setIsCompleting(false);
    }
  }, [lesson, lessonId, lang, productionResponse, user, addMistake]);

  if (!lesson) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12 relative">
        <BlobBackground />
        <section className="w-full relative z-10 rounded-3xl border border-white/40 bg-white/60 p-6 text-center shadow-xl shadow-amber-900/5 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
          <Mascot size={112} expression="thinking" action="thinking" message="Buri chưa tìm thấy bài này." />
          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">Bài học không khả dụng</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Hãy quay lại lộ trình và chọn một bài Realworld Mastery đang có.</p>
          <Link to="/app/roadmap" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-indigo-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><ArrowLeft size={17} /> Về lộ trình</Link>
        </section>
      </main>
    );
  }

  const completeLesson = async () => {
    setIsCompleting(true);
    setCompletionError(null);
    setCompletionErrorCode(null);
    try {
      const result = await completeRealworldSurvivalLesson({
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
        setCompletionErrorCode(result.code);
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
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10 relative overflow-hidden">
        <BlobBackground />
        <motion.section 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          role="status" 
          aria-live="polite" 
          className="w-full relative z-10 rounded-3xl border border-white/40 bg-white/60 p-6 text-center shadow-xl shadow-indigo-900/10 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60 sm:p-10"
        >
          <Mascot size={150} expression="encouraging" action="celebrating" message="Bạn vừa tạo được một câu của riêng mình!" />
          <CheckCircle2 className="mx-auto mt-6 text-indigo-500" size={36} aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">Hoàn thành: {lesson.titleVi}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">Tiến độ đã được lưu từ phần tự tạo câu, ôn nhanh và tự rà soát của bạn.</p>
          
          <div className="mt-6 mx-auto max-w-md rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-5 text-left backdrop-blur-sm dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-100 mb-3">Các cụm từ vừa học:</h2>
            <ul className="space-y-2">
              {lesson.chunks.map((chunk, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{chunk.text}</span>
                    <span className="text-slate-600 dark:text-slate-300 ml-2">— {chunk.vi}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {nextLesson && <Link to={`/app/survival?lesson=${nextLesson.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-indigo-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition hover:bg-indigo-700 hover:shadow-indigo-600/30">Bài tiếp theo <ArrowRight size={17} /></Link>}
            <Link to="/app/roadmap" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3 text-sm font-black text-slate-800 hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white dark:hover:bg-slate-700"><ListChecks size={17} /> Về lộ trình</Link>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-24 sm:py-8 relative min-h-screen">
      <BlobBackground />
      <div className="relative z-10">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/app/roadmap" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100/50 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800/50"><ArrowLeft size={17} /> Lộ trình</Link>
          <p className="rounded-full bg-indigo-50/80 backdrop-blur-sm border border-indigo-200/50 px-3 py-2 text-xs font-black text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 shadow-sm shadow-indigo-900/5">Realworld Mastery · Bài {lesson.order}/30</p>
        </header>

        <div className="mb-8" aria-label={`Tiến độ bài học: bước ${stage + 1} trên 6`}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300"><span>{stages[stage]}</span><span>{stage + 1}/6</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm"><div className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-xl shadow-indigo-900/5 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60 sm:p-8"
            >
              {stage === 0 && <>
                <StageHeading stage={stage} title={lesson.titleVi} description={lesson.canDoVi} />
                <div className="mt-8 rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-5 backdrop-blur-sm dark:border-indigo-500/20 dark:bg-indigo-500/10">
                  <p className="text-sm font-black text-indigo-900 dark:text-indigo-200">Bối cảnh: {lesson.scenario.settingVi}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{lesson.scenario.roles.join(' · ')}</p>
                </div>
                <div className="mt-6 space-y-3">
                  {lesson.dialogue.map((line) => (
                    <article key={`${line.speaker}-${line.text}`} className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-md shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40">
                      <p className="font-black text-slate-950 dark:text-white">{line.speaker}: {line.text}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{line.vi}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-8"><StepButton onClick={() => setStage(1)}>Sang phần hiểu ý</StepButton></div>
              </>}

              {stage === 1 && <>
                <StageHeading stage={stage} title="Hiểu ý trước khi nhại" description={lesson.comprehension.promptVi} />
                <fieldset className="mt-8 space-y-3">
                  <legend className="sr-only">Chọn câu trả lời</legend>
                  {lesson.comprehension.options.map((option) => (
                    <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold backdrop-blur-md transition-all ${selectedAnswer === option ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 shadow-sm shadow-indigo-600/10 dark:bg-indigo-500/20 dark:text-indigo-100' : 'border-white/60 bg-white/40 hover:border-indigo-300/50 hover:bg-white/60 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-slate-600'}`}>
                      <input type="radio" name="comprehension" value={option} checked={selectedAnswer === option} onChange={() => { setSelectedAnswer(option); setComprehensionFeedback(null); }} className="size-4 accent-indigo-600" />
                      {option}
                    </label>
                  ))}
                </fieldset>
                <AnimatePresence>
                  {comprehensionFeedback && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div role="alert" aria-live="assertive" className="mt-4 flex gap-3 rounded-xl border border-amber-200/50 bg-amber-50/80 p-4 text-sm text-amber-950 backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                        <CircleAlert className="mt-0.5 shrink-0 text-amber-600" size={18} />{comprehensionFeedback}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-8"><StepButton disabled={!selectedAnswer} onClick={checkComprehension}>Kiểm tra ý</StepButton></div>
              </>}

              {stage === 2 && <>
                <StageHeading stage={stage} title="Nghe & nhại từng nhịp ngắn" description="Nghe từng cụm, đọc thành tiếng và tự so sánh nhịp nói của mình với câu mẫu." />
                <div className="mt-6 rounded-xl border border-sky-200/50 bg-sky-50/80 p-4 text-sm text-sky-950 backdrop-blur-md dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100"><p className="font-black">Trình đọc giọng nói của trình duyệt</p><p className="mt-1 leading-6">EchLearn chỉ gọi SpeechSynthesis có sẵn trong trình duyệt để đọc câu mẫu; trang này không tải hay phát audio từ nguồn ngoài.</p></div>
                <div className="mt-6 space-y-4">
                  {lesson.chunks.map((chunk, index) => (
                    <article key={chunk.text} className="rounded-2xl border border-white/60 bg-white/40 p-5 backdrop-blur-md shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Cụm {index + 1}</p>
                          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{chunk.text}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{chunk.vi}</p>
                        </div>
                        <button type="button" onClick={() => speakWithBrowser(chunk.text)} disabled={isSpeaking} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
                          <Volume2 size={17} /> Nghe cụm
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {speechError && <p role="alert" aria-live="assertive" className="mt-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{speechError}</p>}
                <div className="mt-8"><StepButton onClick={() => setStage(3)}>Tôi đã đọc thành tiếng</StepButton></div>
              </>}

              {stage === 3 && <>
                <StageHeading stage={stage} title="Bóc tách ngữ cảnh" description={lesson.contextCue.bodyVi} />
                <div className="mt-8 rounded-2xl border border-amber-200/50 bg-amber-50/80 p-5 backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-500/10">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      <Lightbulb size={20} />
                    </div>
                    <div>
                      <h2 className="font-black text-amber-950 dark:text-amber-100">{lesson.contextCue.titleVi}</h2>
                      <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-100">{lesson.contextCue.bodyVi}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {lesson.chunks.map((chunk) => (
                    <article key={chunk.text} className="rounded-2xl border border-white/60 bg-white/40 p-5 backdrop-blur-md shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40">
                      <p className="font-black text-slate-950 dark:text-white text-lg">{chunk.text}</p>
                      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200"><span className="font-bold text-indigo-700 dark:text-indigo-400">Dùng khi:</span> {chunk.useWhenVi}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400"><span className="font-bold">Gợi ý cho người Việt:</span> {chunk.vietnameseLearnerCueVi}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-8"><StepButton onClick={() => setStage(4)}>Tự tạo câu của tôi</StepButton></div>
              </>}

              {stage === 4 && <>
                <StageHeading stage={stage} title="Tự tạo một câu trong tình huống" description={lesson.production.promptVi} />
                <div className="mt-8 rounded-2xl border border-white/60 bg-white/40 p-5 text-sm backdrop-blur-md shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40">
                  <p className="font-bold text-slate-950 dark:text-white text-base">Thêm chi tiết thật của bạn:</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700 dark:text-slate-300">
                    {lesson.production.requiredSlots.map((slot) => <li key={slot}>{slot}</li>)}
                  </ul>
                  <p className="mt-4 rounded-lg bg-indigo-50/50 p-3 text-xs leading-5 text-indigo-900/80 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <span className="font-bold">Câu mẫu để tham khảo:</span> “{lesson.production.exemplar}” — chép nguyên câu mẫu sẽ không hoàn thành bài.
                  </p>
                </div>
                <label className="mt-8 block text-sm font-bold text-slate-900 dark:text-white" htmlFor="production-response">Câu của bạn</label>
                <textarea id="production-response" value={productionResponse} onChange={(event) => { setProductionResponse(event.target.value); setProductionFeedback(null); }} rows={4} placeholder="Viết một câu mới bằng chi tiết của bạn…" className="mt-2 w-full rounded-2xl border border-slate-300/50 bg-white/70 p-4 text-base text-slate-950 backdrop-blur-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20" />
                
                <AnimatePresence>
                  {productionFeedback && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div role="alert" aria-live="assertive" className={`mt-5 rounded-2xl border p-5 text-sm backdrop-blur-md ${productionFeedback.isValid ? 'border-emerald-200/50 bg-emerald-50/80 text-emerald-950 shadow-sm shadow-emerald-600/5 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100' : 'border-amber-200/50 bg-amber-50/80 text-amber-950 shadow-sm shadow-amber-600/5 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'}`}>
                        <div className="flex gap-4">
                          <div className={`mt-0.5 shrink-0 rounded-full p-1 ${productionFeedback.isValid ? 'bg-emerald-200/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-200/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                            {productionFeedback.isValid ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
                          </div>
                          <div>
                            <p className="font-black text-base">{productionFeedback.overallMessage}</p>
                            <div className="mt-3 space-y-2 opacity-90">
                              <p><strong className="opacity-70 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">Thông tin</strong> {productionFeedback.criteria.completeness.message}</p>
                              <p><strong className="opacity-70 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">Lịch sự</strong> {productionFeedback.criteria.politeness.message}</p>
                              <p><strong className="opacity-70 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">Ngữ pháp</strong> {productionFeedback.criteria.grammar.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="mt-8">
                  {!productionFeedback?.isValid ? (
                    <StepButton disabled={!productionResponse.trim() || isCompleting} onClick={() => void checkProduction()}>{isCompleting ? 'Đang phân tích...' : 'Kiểm tra câu'}</StepButton>
                  ) : (
                    <StepButton onClick={() => setStage(5)}>Sang phần ôn nhanh</StepButton>
                  )}
                </div>
              </>}

              {stage === 5 && <>
                {/* === Part 1: Retrieval === */}
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Bước 6/6 · Ôn nhanh &amp; tự rà soát</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">Ôn nhanh: gõ lại một cụm vừa học</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{lesson.retrieval.promptVi}</p>
                </div>

                <div className="mt-6 rounded-2xl border border-sky-200/50 bg-sky-50/80 p-5 text-sm backdrop-blur-md dark:border-sky-500/30 dark:bg-sky-500/10">
                  <p className="font-black text-sky-900 dark:text-sky-100 text-base">Cụm mục tiêu: <span className="font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded ml-1">{lesson.retrieval.cueVi}</span></p>
                </div>

                <label className="mt-8 block text-sm font-bold text-slate-900 dark:text-white" htmlFor="retrieval-response">Câu/cụm bạn nhớ được</label>
                <input id="retrieval-response" value={retrievalResponse} onChange={(event) => setRetrievalResponse(event.target.value)} placeholder="Gõ lại cụm mục tiêu từ trí nhớ…" className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300/50 bg-white/70 px-4 py-3 text-base text-slate-950 backdrop-blur-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20" />
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{lesson.retrieval.answerHintVi}</p>

                <AnimatePresence>
                  {completionError && (completionErrorCode === 'retrieval_incorrect' || completionErrorCode === 'retrieval_has_exemplar_name') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div role="alert" aria-live="assertive" className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-200/50 bg-rose-50/80 p-5 text-sm font-semibold text-rose-900 backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                        <div className="flex gap-3">
                          <CircleAlert className="mt-0.5 shrink-0 text-rose-600" size={18} />
                          {completionError}
                        </div>
                        <button
                          onClick={() => {
                            if (!user) {
                              toast('Vui lòng đăng nhập để dùng Sổ Tay', 'error');
                              return;
                            }
                            addMistake({
                              userId: user.id,
                              type: 'Speaking',
                              mistake: `Nhớ sai cụm từ mục tiêu: "${retrievalResponse}"`,
                              correction: `Cụm đúng là: "${lesson.retrieval.cueVi}"`,
                              notes: 'Ghi chú tự động từ lỗi Retrieval trong Realworld Mastery. Cần luyện tập lại.'
                            });
                            toast('Đã lưu lỗi vào Sổ Tay Lỗi Sai!', 'success');
                          }}
                          className="mt-2 w-fit inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 transition-all hover:bg-rose-500/20 dark:text-rose-300"
                        >
                          <Plus size={14} /> Ghi lỗi này vào Sổ Tay
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* === Part 2: Self-review === */}
                <hr className="mt-10 border-slate-200/50 dark:border-slate-700/50" />
                <fieldset className="mt-8 space-y-3">
                  <legend className="text-sm font-black text-slate-950 dark:text-white mb-4">Tự rà soát trước khi lưu</legend>
                  {lesson.selfReview.map((prompt) => (
                    <label key={prompt} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm font-semibold transition-all backdrop-blur-sm ${selfReview[prompt] ? 'border-indigo-300/50 bg-indigo-50/50 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100 shadow-sm shadow-indigo-600/5' : 'border-white/60 bg-white/40 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'}`}>
                      <input type="checkbox" checked={Boolean(selfReview[prompt])} onChange={(event) => setSelfReview((current) => ({ ...current, [prompt]: event.target.checked }))} className="mt-0.5 size-4 accent-indigo-600" />
                      <span className="leading-5">{prompt}</span>
                    </label>
                  ))}
                </fieldset>

                <AnimatePresence>
                  {completionError && completionError.includes('bốn mục tự rà soát') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div role="alert" aria-live="assertive" className="mt-5 flex gap-3 rounded-2xl border border-rose-200/50 bg-rose-50/80 p-5 text-sm font-semibold text-rose-900 backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                        <CircleAlert className="mt-0.5 shrink-0 text-rose-600" size={18} />{completionError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {completionError && completionErrorCode !== 'retrieval_incorrect' && completionErrorCode !== 'retrieval_has_exemplar_name' && completionErrorCode !== 'self_review_incomplete' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div role="alert" aria-live="assertive" className="mt-5 flex gap-3 rounded-2xl border border-rose-200/50 bg-rose-50/80 p-5 text-sm font-semibold text-rose-900 backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                        <CircleAlert className="mt-0.5 shrink-0 text-rose-600" size={18} />{completionError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8"><StepButton disabled={isCompleting || Object.values(selfReview).filter(Boolean).length === 0} onClick={() => void completeLesson()}>{isCompleting ? 'Đang lưu tiến độ' : <>Hoàn thành bài <Check size={17} /></>}</StepButton></div>
              </>}
            </motion.div>
          </AnimatePresence>

          <aside className="rounded-3xl border border-indigo-100/50 bg-indigo-50/50 p-6 text-center backdrop-blur-xl shadow-xl shadow-indigo-900/5 dark:border-indigo-500/20 dark:bg-indigo-500/10 lg:sticky lg:top-5 lg:h-fit">
            <Mascot size={128} expression={stage === 1 ? 'thinking' : stage === 2 ? 'happy' : stage >= 5 ? 'encouraging' : 'happy'} action={stage === 2 ? 'listening' : stage === 1 ? 'thinking' : undefined} message={stage === 2 ? 'Nghe một cụm, rồi nhại lại.' : stage >= 5 ? 'Bạn sắp hoàn thành rồi.' : 'Đi từng bước, không cần vội.'} />
            <p className="mt-6 text-xs font-bold leading-5 text-indigo-900 dark:text-indigo-200">{lesson.canDoVi}</p>
          </aside>
        </section>
      </div>
    </main>
  );
}
