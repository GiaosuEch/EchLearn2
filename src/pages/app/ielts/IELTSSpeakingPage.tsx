import { useState } from 'react';
import { Mic, Square, RotateCcw, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsSpeakingCueCards } from '../../../data/ieltsData';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';

export default function IELTSSpeakingPage() {
  const [partIndex, setPartIndex] = useState(0);
  const recorder = useVoiceRecorder();

  const cueCard = ieltsSpeakingCueCards[partIndex];

  return (
    <PageShell
      title="IELTS Speaking Practice Suite"
      description="Luyện nói bài thi IELTS Speaking Part 1, Part 2 (Cue Card) & Part 3"
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
                recorder.resetRecording();
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

        {/* Recorder Box */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <h4 className="text-sm font-black text-slate-900">Khu Vực Ghi Âm Bài Nói</h4>
          
          <div className="flex items-center gap-3">
            {!recorder.isRecording ? (
              <button
                onClick={recorder.startRecording}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Mic size={16} /> Bắt Đầu Ghi Âm
              </button>
            ) : (
              <button
                onClick={recorder.stopRecording}
                className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Square size={16} /> Dừng Ghi Âm ({recorder.duration}s)
              </button>
            )}

            {recorder.audioUrl && (
              <button
                onClick={recorder.resetRecording}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
              >
                <RotateCcw size={16} /> Ghi Âm Lại
              </button>
            )}
          </div>

          {recorder.audioUrl && (
            <div className="pt-2 w-full max-w-md">
              <audio src={recorder.audioUrl} controls className="w-full" />
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
}
