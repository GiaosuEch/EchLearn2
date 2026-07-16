import { useState, useMemo, useCallback } from 'react';
import { Headphones, Play, Pause, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsListeningSections } from '../../../data/ieltsData';
import { audioService } from '../../../services/audioService';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSListeningPage() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const addXP = useLearningStore(s => s.addXP);

  const section = ieltsListeningSections[sectionIndex];
  const totalSections = ieltsListeningSections.length;

  const handlePlay = useCallback(async () => {
    if (playing) {
      audioService.stop();
      setPlaying(false);
      return;
    }
    if (!section.transcript) return;
    setPlaying(true);
    try {
      await audioService.readTranscript(section.transcript, 'en-US', 0.85);
    } catch {
      // ignore
    }
    setPlaying(false);
  }, [playing, section]);

  const handleAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    section.questions.forEach(q => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (typeof q.correctAnswer === 'string' ? q.correctAnswer : '').trim().toLowerCase();
      if (userAns === correctAns) correct++;
    });
    return correct;
  }, [submitted, section, answers]);

  const handleSubmit = () => {
    setSubmitted(true);
    const xp = score * 10;
    if (xp > 0) addXP(xp, `IELTS Listening Section ${section.sectionNumber}`);
    toast(`Score: ${score}/${section.questions.length} — +${xp} XP`, score === section.questions.length ? 'success' : 'warning');
  };

  const handleNext = () => {
    if (sectionIndex + 1 < totalSections) {
      setSectionIndex(i => i + 1);
      setAnswers({});
      setSubmitted(false);
      audioService.stop();
      setPlaying(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    audioService.stop();
    setPlaying(false);
  };

  return (
    <PageShell title="IELTS Listening" description="Practice IELTS Listening sections 1-4" icon={<Headphones size={20} />} backTo="/app/ielts">
      {/* Section selector */}
      <div className="flex gap-2 mb-6">
        {ieltsListeningSections.map((s, i) => (
          <button key={s.id} onClick={() => { setSectionIndex(i); setAnswers({}); setSubmitted(false); audioService.stop(); setPlaying(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sectionIndex === i ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>
            Section {s.sectionNumber}
          </button>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-1">Section {section.sectionNumber}: {section.title}</h3>

        {/* Audio player with TTS */}
        <div className="bg-dark-800 rounded-xl p-4 flex items-center gap-4 my-4">
          <button onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95">
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          <div className="flex-1">
            <p className="text-xs text-dark-400 mb-1">
              {playing ? '🔊 Playing transcript via TTS…' : 'Click play to hear the audio (browser TTS)'}
            </p>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className={`h-full bg-primary-500 rounded-full transition-all duration-1000 ${playing ? 'animate-pulse' : ''}`} style={{ width: playing ? '60%' : '0%' }} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {section.questions.map((q, i) => {
            const userAns = answers[q.id] || '';
            const isCorrect = submitted && userAns.trim().toLowerCase() === (typeof q.correctAnswer === 'string' ? q.correctAnswer : '').trim().toLowerCase();
            const isWrong = submitted && !isCorrect && userAns.trim().length > 0;

            return (
              <div key={q.id} className={`p-3 rounded-xl border transition-colors ${submitted ? (isCorrect ? 'border-green-500/30 bg-green-500/5' : isWrong ? 'border-red-500/30 bg-red-500/5' : 'border-dark-700 bg-dark-800/30') : 'border-transparent bg-dark-800/30 hover:border-primary-500/10'}`}>
                <p className="text-sm text-dark-300">
                  <span className="text-primary-400 font-semibold mr-1">Q{i + 1}.</span> {q.question}
                </p>

                {q.options ? (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt) => {
                      const selected = userAns === opt;
                      const optCorrect = submitted && opt === q.correctAnswer;
                      const optWrong = submitted && selected && opt !== q.correctAnswer;
                      return (
                        <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                          disabled={submitted}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors border flex items-center gap-2
                            ${optCorrect ? 'border-green-500 bg-green-500/10 text-green-400' :
                              optWrong ? 'border-red-500 bg-red-500/10 text-red-400' :
                              selected ? 'border-primary-500 bg-primary-500/10 text-primary-400' :
                              'border-transparent text-dark-400 hover:text-white hover:bg-dark-700'}`}>
                          {submitted && optCorrect && <CheckCircle2 size={14} className="flex-shrink-0" />}
                          {submitted && optWrong && <XCircle size={14} className="flex-shrink-0" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2">
                    <input type="text" value={userAns} onChange={e => handleAnswer(q.id, e.target.value)}
                      disabled={submitted}
                      placeholder="Your answer..."
                      className={`w-full px-3 py-2 bg-dark-800 border rounded-lg text-sm text-white outline-none transition-colors placeholder:text-dark-500
                        ${submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-dark-700 focus:border-primary-500'}`} />
                    {submitted && !isCorrect && (
                      <p className="text-xs text-green-400 mt-1">Correct: {q.correctAnswer}</p>
                    )}
                  </div>
                )}

                {submitted && q.explanation && (
                  <p className="text-xs text-dark-400 mt-2 italic">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          {submitted && (
            <button onClick={handleReset} className="px-4 py-2 bg-dark-700 text-dark-300 hover:text-white rounded-xl font-semibold flex items-center gap-2 transition-colors">
              <RotateCcw size={16} /> Try Again
            </button>
          )}
          {!submitted ? (
            <button onClick={handleSubmit} className="px-6 py-2 bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
              Submit Answers
            </button>
          ) : sectionIndex + 1 < totalSections ? (
            <button onClick={handleNext} className="px-6 py-2 bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Next Section <ChevronRight size={16} />
            </button>
          ) : (
            <div className="text-sm text-primary-400 font-semibold">All sections completed! 🎉</div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
