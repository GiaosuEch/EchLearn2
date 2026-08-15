import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Headphones,
  Lightbulb,
  MessageCircle,
  ShoppingBag,
  Target,
} from 'lucide-react';
import PageShell from '../../PageShell';
import {
  evaluateSurvivalProduction,
  evaluateSurvivalRetrieval,
  survivalSelfReviewPrompts,
  type SurvivalFeedback,
} from '../../../viewmodels/englishSurvival';
import { semanticEvaluationService } from '../../../services/semanticEvaluationService';

const steps = [
  'Bối cảnh',
  'Hiểu ý',
  'Tạo câu',
  'Nhớ lại',
  'Tự rà soát',
  'Hoàn thành',
] as const;

function Feedback({ feedback }: { feedback: SurvivalFeedback | null }) {
  if (!feedback) return null;
  const success = feedback.kind === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border p-4 text-sm leading-6 ${success ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100' : 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'}`}
    >
      <div className="flex items-start gap-2">
        {success ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : <Lightbulb className="mt-0.5 shrink-0" size={18} />}
        <p>{feedback.message}</p>
      </div>
    </div>
  );
}

export default function RealworldMasteryMissionPage() {
  const [step, setStep] = useState(0);
  const [meaning, setMeaning] = useState('');
  const [production, setProduction] = useState('');
  const [productionFeedback, setProductionFeedback] = useState<SurvivalFeedback | null>(null);
  const [retrieval, setRetrieval] = useState('');
  const [retrievalFeedback, setRetrievalFeedback] = useState<SurvivalFeedback | null>(null);
  const [reviews, setReviews] = useState<boolean[]>(() => survivalSelfReviewPrompts.map(() => false));
  const [speechNote, setSpeechNote] = useState('');

  const [meaningFeedback, setMeaningFeedback] = useState<string | null>(null);
  const [isMeaningAcceptable, setIsMeaningAcceptable] = useState(false);

  const canContinue =
    step === 0
    || (step === 1 && isMeaningAcceptable)
    || (step === 2 && productionFeedback?.kind === 'success')
    || (step === 3 && retrievalFeedback?.kind === 'success')
    || (step === 4 && reviews.every(Boolean));

  const handleMeaningCheck = async (value: string) => {
    setMeaning(value);
    if (!value.trim()) {
      setIsMeaningAcceptable(false);
      setMeaningFeedback(null);
      return;
    }
    const result = await semanticEvaluationService.evaluateMeaning(value, 'order-food-less-spicy');
    setIsMeaningAcceptable(result.isAcceptable);
    setMeaningFeedback(result.feedback);
  };

  const playBrowserSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setSpeechNote('Thiết bị này không hỗ trợ đọc câu. Bạn vẫn có thể tiếp tục bằng cách đọc mẫu trên màn hình.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onerror = () => setSpeechNote('Không phát được giọng đọc lúc này. Hãy tự đọc câu và tiếp tục bài học.');
    window.speechSynthesis.speak(utterance);
    setSpeechNote('Đang dùng giọng đọc có sẵn của trình duyệt; đây không phải bản ghi âm người thật.');
  };

  return (
    <PageShell
      title="Realworld Mastery: Gọi món và yêu cầu bớt cay"
      description="Một bài thực hành 6 bước để bạn dùng được câu trong tình huống thật."
      icon={<ShoppingBag size={20} className="text-emerald-600" />}
    >
      <main className="mx-auto max-w-3xl space-y-5 pb-24">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Sau bài này bạn có thể</p>
              <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Gọi một món mình chọn và lịch sự yêu cầu món bớt cay.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">Dùng khi gọi món tại quán, quầy đồ ăn hoặc khi cần điều chỉnh món theo nhu cầu.</p>
            </div>
          </div>
        </section>

        <section aria-label="Tiến độ bài học" className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
            <span>Bước {step + 1}/6 · {steps[step]}</span>
            <span>{Math.round(((step + 1) / 6) * 100)}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step + 1} aria-label={`Bước ${step + 1} trên 6`}>
            <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${((step + 1) / 6) * 100}%` }} />
          </div>
          <ol className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-6">
            {steps.map((label, index) => <li key={label} aria-current={index === step ? 'step' : undefined} className={index === step ? 'font-bold text-emerald-700 dark:text-emerald-300' : ''}>{index + 1}. {label}</li>)}
          </ol>
        </section>

        <section className="min-h-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">Ngữ cảnh thực tế</p>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Bạn đang gọi bữa trưa tại một quán ăn.</h2>
              <p className="leading-7 text-slate-700 dark:text-slate-300">Nhân viên đã sẵn sàng nhận món. Bạn muốn gọi một món mình thích và món đó cần bớt cay.</p>
              <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <p className="font-bold text-slate-950 dark:text-white">Việc cần làm</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Trước tiên hiểu câu mẫu, sau đó tự tạo câu gọi món và cuối cùng nhớ lại câu yêu cầu bớt cay.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <fieldset className="space-y-4">
              <legend className="text-2xl font-black text-slate-950 dark:text-white">“I would like vegetable noodles, please.” có ý gì?</legend>
              <p className="text-sm text-slate-600 dark:text-slate-300">Chọn một đáp án rồi xem phản hồi ngay.</p>
              {[
                ['polite-order', 'Tôi muốn gọi mì rau củ một cách lịch sự.'],
                ['direction', 'Tôi đang hỏi đường đến một quán ăn.'],
                ['complaint', 'Tôi đang phàn nàn rằng món ăn bị nguội.'],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:border-slate-700 dark:text-slate-100 dark:has-[:checked]:bg-emerald-950/30">
                  <input type="radio" name="meaning" value={value} checked={meaning === value} onChange={(event) => handleMeaningCheck(event.target.value)} />
                  {label}
                </label>
              ))}
              {meaningFeedback && <Feedback feedback={{ kind: isMeaningAcceptable ? 'success' : 'retry', message: meaningFeedback }} />}
              <button type="button" onClick={() => playBrowserSpeech('I would like vegetable noodles, please.')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-950/30"><Headphones size={18} /> Nghe bằng trình duyệt</button>
              {speechNote && <p role="status" aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">{speechNote}</p>}
            </fieldset>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Tự tạo câu gọi món của bạn</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Không cần dùng “vegetable noodles”. Hãy chọn món bạn thực sự muốn và viết một câu đầy đủ.</p>
              <label htmlFor="survival-production" className="block text-sm font-bold text-slate-900 dark:text-white">Câu của bạn</label>
              <textarea id="survival-production" value={production} onChange={(event) => { setProduction(event.target.value); setProductionFeedback(null); }} rows={4} placeholder="Ví dụ cấu trúc: I would like…, please." className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-950 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <button type="button" onClick={async () => setProductionFeedback(await evaluateSurvivalProduction(production))} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><MessageCircle size={18} /> Kiểm tra câu</button>
              <Feedback feedback={productionFeedback} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Nhớ lại câu yêu cầu bớt cay</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Đây là nhiệm vụ nhớ lại, khác với câu gọi món ở bước trước. Hãy viết một lời nhờ lịch sự có ý “bớt cay”.</p>
              <label htmlFor="survival-retrieval" className="block text-sm font-bold text-slate-900 dark:text-white">Bạn sẽ nói gì?</label>
              <input id="survival-retrieval" value={retrieval} onChange={(event) => { setRetrieval(event.target.value); setRetrievalFeedback(null); }} placeholder="Could you…" className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <button type="button" onClick={async () => setRetrievalFeedback(await evaluateSurvivalRetrieval(retrieval))} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><CircleHelp size={18} /> Kiểm tra phần cần nhớ</button>
              <Feedback feedback={retrievalFeedback} />
            </div>
          )}

          {step === 4 && (
            <fieldset className="space-y-4">
              <legend className="text-2xl font-black text-slate-950 dark:text-white">Tự rà soát trước khi kết thúc</legend>
              <p className="text-sm text-slate-600 dark:text-slate-300">Đánh dấu khi bạn thật sự làm được. Nếu mục nào chưa chắc, quay lại bước tương ứng để thử lại.</p>
              {survivalSelfReviewPrompts.map((prompt, index) => (
                <label key={prompt} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-900 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:border-slate-700 dark:text-slate-100 dark:has-[:checked]:bg-emerald-950/30">
                  <input type="checkbox" className="mt-1" checked={reviews[index]} onChange={(event) => setReviews((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} />
                  {prompt}
                </label>
              ))}
              {!reviews.every(Boolean) && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Hoàn thành cả 4 kiểm tra để xác nhận bạn đã sẵn sàng dùng câu trong tình huống thật.</p>}
            </fieldset>
          )}

          {step === 5 && (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto text-emerald-700 dark:text-emerald-300" size={52} />
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">Bạn đã hoàn thành bài gọi món.</h2>
              <p className="mx-auto max-w-xl leading-7 text-slate-700 dark:text-slate-300">Bạn đã hiểu câu mẫu, tự gọi món, nhớ lại lời yêu cầu bớt cay và tự rà soát khả năng dùng câu.</p>
              <div className="rounded-xl bg-slate-100 p-4 text-left dark:bg-slate-800">
                <p className="font-bold text-slate-950 dark:text-white">Bước tiếp theo</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Học bài tiếp theo trong lộ trình, hoặc luyện lại bài này với một món khác để câu trở thành của bạn.</p>
              </div>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/app/roadmap" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">Xem bài tiếp theo <ArrowRight size={18} /></Link>
                <button type="button" onClick={() => { setStep(2); setProduction(''); setProductionFeedback(null); setRetrieval(''); setRetrievalFeedback(null); setReviews(survivalSelfReviewPrompts.map(() => false)); }} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-400 px-5 py-3 font-bold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">Luyện với món khác</button>
              </div>
            </div>
          )}
        </section>

        {step < 5 && (
          <nav aria-label="Điều hướng bài học" className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-400 px-4 py-3 font-bold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={18} /> Quay lại</button>
            <button type="button" onClick={() => setStep((current) => Math.min(5, current + 1))} disabled={!canContinue} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400">{step === 4 ? 'Xem tổng kết' : 'Tiếp tục'} <ArrowRight size={18} /></button>
          </nav>
        )}
      </main>
    </PageShell>
  );
}
