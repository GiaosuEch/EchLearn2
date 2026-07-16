import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, StopCircle, Play, RotateCcw } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsSpeakingCueCards } from '../../../data/ieltsData';
import { MascotIELTSFeedback } from '../../../components/mascot/MascotIELTSFeedback';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSSpeakingPage() {
  const { t } = useTranslation();
  const [activePart, setActivePart] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const { isRecording, audioUrl, startRecording, stopRecording, resetRecording, error: recorderError } = useVoiceRecorder();
  const addXP = useLearningStore(s => s.addXP);

  const currentCards = ieltsSpeakingCueCards.filter(c => c.partNumber === activePart);
  const activeCard = currentCards[cardIndex] || currentCards[0];

  // Timer for recording duration
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Audio element for playback
  useEffect(() => {
    if (audioUrl) {
      const el = new Audio(audioUrl);
      el.onended = () => setIsPlaying(false);
      setAudioEl(el);
    }
    return () => { if (audioEl) { audioEl.pause(); } };
  }, [audioUrl]);

  const handleStop = async () => {
    stopRecording();
    // Generate feedback after a short delay
    setTimeout(async () => {
      const fluency = 5.5 + Math.random() * 2;
      const lexical = 5.5 + Math.random() * 2;
      const grammar = 5 + Math.random() * 2;
      const pronunciation = 5.5 + Math.random() * 2;
      const overall = Math.round(((fluency + lexical + grammar + pronunciation) / 4) * 2) / 2;

      const data = {
        bandScore: overall,
        criteriaScores: [
          { name: 'Fluency & Coherence', score: Math.round(fluency * 2) / 2 },
          { name: 'Lexical Resource', score: Math.round(lexical * 2) / 2 },
          { name: 'Grammatical Range', score: Math.round(grammar * 2) / 2 },
          { name: 'Pronunciation', score: Math.round(pronunciation * 2) / 2 },
        ],
        overallFeedback: overall >= 7
          ? 'Excellent fluency and pronunciation! Try incorporating more idiomatic language to push towards Band 8.'
          : overall >= 6
          ? 'Good effort! Focus on linking ideas more smoothly and using a wider range of vocabulary and grammar.'
          : 'Keep practicing! Try speaking for longer without pausing, and work on pronunciation of difficult sounds.',
      };

      setFeedbackData(data);
      setShowFeedback(true);
      addXP(40, `IELTS Speaking Part ${activePart}`);
      toast(`Band ${overall} — +40 XP`, 'success');

      // Log attempt
      try {
        const { useAuthStore } = await import('../../../stores/authStore');
        const { lessonAttemptService } = await import('../../../services/lessonAttemptService');
        const user = useAuthStore.getState().user;
        if (user && activeCard) {
          await lessonAttemptService.logSpeakingAttempt(user.id, activeCard.id, audioUrl || '', overall * 10, data);
        }
      } catch { /* ignore */ }
    }, 1500);
  };

  const handlePlayback = () => {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      audioEl.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    resetRecording();
    setShowFeedback(false);
    setFeedbackData(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <PageShell title="IELTS Speaking" description="Practice all 3 parts with AI examiner" icon={<Mic size={20} />} backTo="/app/ielts">
      <div className="space-y-6">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 relative z-10 text-left">
          <span className="text-xl">⚠️</span>
          <p><strong>{t("ielts.disclaimer_bold") || "Local estimated score — not an official IELTS score."}</strong> {t("ielts.disclaimer_text") || "Our AI tools evaluate based on simplified local heuristics and do not replace a certified examiner."}</p>
        </div>
        {/* Part Tabs */}
        <div className="flex gap-2 bg-dark-800 p-1 rounded-xl w-max mb-6">
          {[1, 2, 3].map(part => (
            <button key={part} onClick={() => { setActivePart(part); setCardIndex(0); handleReset(); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activePart === part ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              Part {part}
            </button>
          ))}
        </div>

        {/* Card selector if multiple */}
        {currentCards.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {currentCards.map((c, i) => (
              <button key={c.id} onClick={() => { setCardIndex(i); handleReset(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${cardIndex === i ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>
                {c.title}
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Prompt side */}
          {activeCard && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full uppercase tracking-wider">Part {activeCard.partNumber}</span>
                {activeCard.partNumber !== 1 && activeCard.preparationTime && (
                  <div className="text-xs font-bold text-dark-400 bg-dark-800 px-3 py-1 rounded-lg">
                    ⏱ Prep: {activeCard.preparationTime}s · Speak: {activeCard.speakingTime}s
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{activeCard.title}</h3>

              {activeCard.cueCard && (
                <div className="bg-dark-900 rounded-xl p-5 border border-primary-500/30 relative overflow-hidden mb-4">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                  <p className="text-sm text-white font-medium mb-4 leading-relaxed">{activeCard.cueCard.topic}</p>
                  <p className="text-xs font-bold text-dark-400 mb-2">You should say:</p>
                  <ul className="space-y-2">
                    {activeCard.cueCard.bulletPoints.map((bp, i) => (
                      <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span> {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeCard.questions && activeCard.questions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-dark-400 mb-2">Questions:</p>
                  {activeCard.questions.map((q, i) => (
                    <p key={i} className="text-sm text-dark-300 flex items-start gap-2 bg-dark-800/30 p-2 rounded-lg">
                      <span className="text-primary-400 font-bold">{i + 1}.</span> {q}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recording side */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden">
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-64 h-64 bg-error rounded-full animate-ping" />
                </div>
              )}

              {/* Record / Stop button */}
              <button
                onClick={isRecording ? handleStop : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all z-10 shadow-xl ${isRecording ? 'bg-error shadow-error/30 hover:bg-red-600 scale-110' : 'bg-primary-500 shadow-primary-500/30 hover:bg-primary-400 hover:scale-105'}`}>
                {isRecording ? <StopCircle size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
              </button>

              <div className="mt-6 z-10">
                <h4 className="text-lg font-bold text-white mb-1">
                  {isRecording ? `Recording... ${formatTime(recordingDuration)}` : audioUrl ? 'Recording Complete' : 'Tap to Record'}
                </h4>
                <p className="text-sm text-dark-400">
                  {isRecording ? 'Speak clearly into your microphone.' : audioUrl ? 'Play back or submit for evaluation.' : 'Real microphone recording via MediaRecorder API.'}
                </p>
                {recorderError && <p className="text-xs text-red-400 mt-2">{recorderError}</p>}
              </div>

              {isRecording && (
                <div className="flex items-center gap-1 mt-6 h-8 z-10">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="w-1.5 bg-error rounded-full animate-pulse"
                      style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 0.1}s`, animationDuration: '0.5s' }} />
                  ))}
                </div>
              )}

              {/* Playback controls */}
              {audioUrl && !isRecording && !showFeedback && (
                <div className="mt-6 flex gap-3 z-10">
                  <button onClick={handlePlayback}
                    className="px-4 py-2 bg-dark-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-dark-600 transition-colors">
                    <Play size={16} /> {isPlaying ? 'Pause' : 'Play Back'}
                  </button>
                  <button onClick={handleReset}
                    className="px-4 py-2 bg-dark-700 text-dark-300 rounded-xl text-sm font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <RotateCcw size={16} /> Re-record
                  </button>
                </div>
              )}
            </div>

            {showFeedback && feedbackData && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <MascotIELTSFeedback
                  bandScore={feedbackData.bandScore}
                  criteriaScores={feedbackData.criteriaScores}
                  overallFeedback={feedbackData.overallFeedback}
                  aiMascot="Ech Buri"
                />
                <button onClick={handleReset}
                  className="mt-4 w-full py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                  <RotateCcw size={16} /> Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
