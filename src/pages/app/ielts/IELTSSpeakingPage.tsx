import { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsSpeakingCueCards } from '../../../data/ieltsData';
import { usePronunciationChallenge } from '../../../hooks/usePronunciationChallenge';
import { IELTSEvaluator } from '../../../domain/curriculum/ieltsEvaluator';
import BandScoreReveal from '../../../components/ielts/BandScoreReveal';

export default function IELTSSpeakingPage() {
  const [partIndex, setPartIndex] = useState(0);
  const [bandScore, setBandScore] = useState<number | null>(null);
  
  const cueCard = ieltsSpeakingCueCards[partIndex];

  const handleScoreEvaluated = (score: number) => {
    // Score is 0.0 - 1.0. Convert to 0 - 100 for Evaluator.
    const band = IELTSEvaluator.evaluatePronunciation(score * 100);
    setBandScore(band);
  };

  const { isRecording, startRecording, stopRecordingAndEvaluate, result } = usePronunciationChallenge(
    `speaking_${cueCard.id}`,
    cueCard.title,
    handleScoreEvaluated
  );

  return (
    <PageShell
      title="IELTS Speaking Practice Suite"
      description="Luyện nói bài thi IELTS Speaking (Deterministic PRON Band)"
      icon={<Mic size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-slate-900">
        
        {/* Cue Card Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          {ieltsSpeakingCueCards.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setPartIndex(index);
                setBandScore(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                partIndex === index
                  ? 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Prompt & Cue Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              IELTS Speaking Cue Card
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {cueCard.title}
            </h3>
          </div>

          {cueCard.cueCard && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-sm font-bold text-slate-900">{cueCard.cueCard.topic}</p>
              <ul className="list-disc list-inside text-xs font-semibold text-slate-700 space-y-1">
                {cueCard.cueCard.bulletPoints.map((bp, idx) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Gợi Ý Nói Từ Ếch Buri
            </h4>
            <div className="space-y-1.5">
              {cueCard.tips.map((tip, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recorder Box with Deterministic DTW */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
          <h4 className="text-sm font-black text-slate-900">Deterministic DTW Scoring</h4>
          
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecordingAndEvaluate}
            onMouseLeave={isRecording ? stopRecordingAndEvaluate : undefined}
            onTouchStart={startRecording}
            onTouchEnd={stopRecordingAndEvaluate}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-200 shadow-lg cursor-pointer
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200 animate-pulse' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:scale-105'}
            `}
          >
            <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-bounce' : ''}`} />
          </button>
          
          <p className="text-sm font-bold text-slate-500">
            {isRecording ? 'Đang phân tích phổ âm (Nhả để chấm điểm)...' : 'Giữ nút để Trả lời'}
          </p>

          {result?.isProcessing && (
            <BandScoreReveal
              state="computing"
              label="IELTS Pronunciation Band"
              className="w-full mt-4 text-left"
            />
          )}

          {bandScore !== null && !result?.isProcessing && (
            <BandScoreReveal
              className="w-full mt-4 text-left"
              label="IELTS Pronunciation Band"
              band={bandScore}
              evidence={[{ label: 'DTW raw', value: `${Math.round(result?.score ?? 0)}%` }]}
              limitations={[
                'Điểm phát âm suy ra từ khoảng cách DTW giữa phổ âm của bạn và mẫu tham chiếu — thuần toán học, không dùng AI.',
                'Đây là điểm cơ học hỗ trợ luyện tập, không thay thế giám khảo IELTS.',
              ]}
            />
          )}
        </div>

      </div>
    </PageShell>
  );
}
