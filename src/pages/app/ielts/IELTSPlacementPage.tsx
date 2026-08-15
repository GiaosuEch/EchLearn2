import { useState } from 'react';
import { Target, CheckCircle2, RotateCcw } from 'lucide-react';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';

export default function IELTSPlacementPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const placementQuestions = [
    { id: 1, question: 'Which sentence demonstrates correct academic collocations?', options: ['Make research', 'Conduct research', 'Do research work', 'Create research'], correct: 'Conduct research' },
    { id: 2, question: 'Select the synonym for "mitigate":', options: ['Alleviate', 'Exacerbate', 'Complicate', 'Enlarge'], correct: 'Alleviate' },
    { id: 3, question: 'Choose the proper cohesive link for contrast:', options: ['Furthermore', 'In addition', 'Conversely', 'Consequently'], correct: 'Conversely' },
  ];

  const handleSelect = (qId: number, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const score = Object.keys(answers).filter(
    (key) => answers[Number(key)] === placementQuestions.find((q) => q.id === Number(key))?.correct
  ).length;

  const handleSubmit = () => {
    if (Object.keys(answers).length < placementQuestions.length) {
      toast('Vui lòng trả lời tất cả các câu hỏi.', 'error');
      return;
    }
    setSubmitted(true);
    toast(`Đã kiểm tra xong! Bạn trả lời đúng ${score}/${placementQuestions.length} câu.`, 'success');
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <PageShell
      title="Bài tự kiểm tra nhanh từ vựng học thuật"
      description="Kiểm tra một số từ vựng phổ biến"
      icon={<Target size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-slate-900">
        
        {submitted && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">Kết quả kiểm tra</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1">Đúng {score} / {placementQuestions.length} câu</h3>
                <p className="text-xs font-bold text-slate-700 mt-1 italic">Lưu ý: 3 câu hỏi này không đủ để đánh giá trình độ IELTS của bạn.</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white text-slate-800 rounded-2xl text-xs font-black border border-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} /> Làm Lại Test Đầu Vào
              </button>
            </div>
          </div>
        )}

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
            Câu Hỏi Luyện Tập
          </h3>

          <div className="space-y-6">
            {placementQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  <span className="text-emerald-600 font-black mr-1">{idx + 1}.</span> {q.question}
                </p>

                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt;
                    const isCorrect = submitted && opt === q.correct;
                    const isWrong = submitted && selected && opt !== q.correct;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(q.id, opt)}
                        disabled={submitted}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-500 text-slate-950 border-emerald-600'
                            : isWrong
                            ? 'bg-red-500/20 text-red-700 border-red-500'
                            : selected
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500/50'
                        }`}
                      >
                        <span>{opt}</span>
                        {submitted && isCorrect && <CheckCircle2 size={14} className="text-slate-950" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!submitted && (
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Hoàn Thành & Xem Kết Quả
            </button>
          )}
        </div>

      </div>
    </PageShell>
  );
}
