import { useState, useMemo } from 'react';
import { Headphones, Play, Pause, CheckCircle2, XCircle, RotateCcw, Volume2 } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsListeningSections } from '../../../data/ieltsData';
import { audioService } from '../../../services/audioService';
import { toast } from '../../../components/ui/Toast';

export default function IELTSListeningPage() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const section = ieltsListeningSections[sectionIndex];

  const handleAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    section.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (typeof q.correctAnswer === 'string' ? q.correctAnswer : '').trim().toLowerCase();
      if (userAns === correctAns) correct++;
    });
    return correct;
  }, [submitted, section, answers]);

  const toggleAudio = () => {
    if (playing) {
      audioService.stop();
      setPlaying(false);
    } else {
      audioService.speak(section.transcript, 'en-US');
      setPlaying(true);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    audioService.stop();
    setPlaying(false);
    toast(`Nộp bài thành công! Score: ${score}/${section.questions.length}`, score === section.questions.length ? 'success' : 'info');
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    audioService.stop();
    setPlaying(false);
  };

  return (
    <PageShell
      title="IELTS Listening Suite"
      description="Luyện nghe bài thi IELTS Audio thực tế với transcript và câu hỏi tự động chấm điểm"
      icon={<Headphones size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-slate-900">
        
        {/* Section Navigation Tabs */}
        <div className="flex gap-2">
          {ieltsListeningSections.map((sec, i) => (
            <button
              key={sec.id}
              onClick={() => {
                setSectionIndex(i);
                handleReset();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                sectionIndex === i
                  ? 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Audio Player Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Volume2 size={20} className="text-emerald-600" /> {section.title}
            </h3>
            <button
              onClick={toggleAudio}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Tạm Dừng Nghe' : 'Phát Audio Bài Nghe'}
            </button>
          </div>
        </div>

        {/* Submitted Result Banner */}
        {submitted && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" /> Kết Quả Bài Nghe: {score} / {section.questions.length} Câu Đúng
              </h3>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white text-slate-800 rounded-2xl text-xs font-black border border-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} /> Làm Lại Bài Thi
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
            Danh Sách Câu Hỏi ({section.questions.length} câu)
          </h3>

          <div className="space-y-4">
            {section.questions.map((q, i) => {
              const userAns = answers[q.id] || '';
              const correctAns = typeof q.correctAnswer === 'string' ? q.correctAnswer : '';
              const isCorrect = submitted && userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
              const isWrong = submitted && !isCorrect && userAns.trim().length > 0;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    submitted
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50'
                        : isWrong
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 bg-slate-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 mb-3">
                    <span className="text-emerald-600 font-black mr-1.5">{i + 1}.</span>
                    {q.question}
                  </p>

                  {q.options ? (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const selected = userAns === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(q.id, opt)}
                            disabled={submitted}
                            className={`w-full text-left px-3.5 py-2 text-xs rounded-xl border font-bold transition-all flex items-center justify-between cursor-pointer ${
                              selected
                                ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500/50'
                            }`}
                          >
                            <span>{opt}</span>
                            {submitted && selected && isCorrect && <CheckCircle2 size={14} className="text-slate-950" />}
                            {submitted && selected && isWrong && <XCircle size={14} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={userAns}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      disabled={submitted}
                      placeholder="Nhập từ..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  )}

                  {submitted && !isCorrect && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-2">
                      Đáp án đúng: {correctAns}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md cursor-pointer mt-4"
            >
              Nộp Bài Thi IELTS Listening
            </button>
          )}
        </div>

      </div>
    </PageShell>
  );
}
