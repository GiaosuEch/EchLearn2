import { useEffect, useState } from 'react';
import { Mic, Play, RotateCcw, StopCircle } from 'lucide-react';

import PageShell from '../../PageShell';
import { ieltsSpeakingCueCards } from '../../../data/ieltsData';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';

const RECORDING_BAR_HEIGHTS = [32, 56, 80, 48, 72, 40, 64] as const;

export default function IELTSSpeakingPage() {
  const [activePart, setActivePart] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const currentCards = ieltsSpeakingCueCards.filter((card) => card.partNumber === activePart);
  const activeCard = currentCards[cardIndex] || currentCards[0];

  useEffect(() => {
    let interval: number | undefined;
    if (isRecording) {
      interval = window.setInterval(
        () => setRecordingDuration((duration) => duration + 1),
        1000,
      );
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    if (!audioUrl) {
      setAudioEl(null);
      return;
    }

    const element = new Audio(audioUrl);
    element.onended = () => setIsPlaying(false);
    setAudioEl(element);
    return () => {
      element.pause();
      element.onended = null;
    };
  }, [audioUrl]);

  const handlePlayback = () => {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      void audioEl.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    audioEl?.pause();
    setAudioEl(null);
    setIsPlaying(false);
    resetRecording();
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <PageShell
      title="IELTS Speaking"
      description="Record and review responses for all three speaking parts"
      icon={<Mic size={20} />}
      backTo="/app/ielts"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-left text-sm text-orange-300">
          <p className="font-semibold">Automated assessment is unavailable.</p>
          <p className="mt-1 text-orange-200/80">
            Recording and playback remain available. No pronunciation score, band, or AI feedback
            will be generated until an approved local model and benchmark are available.
          </p>
        </div>

        <div className="mb-6 flex w-max gap-2 rounded-xl bg-dark-800 p-1">
          {[1, 2, 3].map((part) => (
            <button
              key={part}
              onClick={() => {
                setActivePart(part);
                setCardIndex(0);
                handleReset();
              }}
              className={`rounded-lg px-6 py-2 text-sm font-bold transition-all ${
                activePart === part
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              Part {part}
            </button>
          ))}
        </div>

        {currentCards.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {currentCards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => {
                  setCardIndex(index);
                  handleReset();
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  cardIndex === index
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white'
                }`}
              >
                {card.title}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {activeCard && (
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-400">
                  Part {activeCard.partNumber}
                </span>
                {activeCard.partNumber !== 1 && activeCard.preparationTime && (
                  <div className="rounded-lg bg-dark-800 px-3 py-1 text-xs font-bold text-dark-400">
                    Prep: {activeCard.preparationTime}s | Speak: {activeCard.speakingTime}s
                  </div>
                )}
              </div>
              <h3 className="mb-4 text-lg font-bold text-white">{activeCard.title}</h3>

              {activeCard.cueCard && (
                <div className="relative mb-4 overflow-hidden rounded-xl border border-primary-500/30 bg-dark-900 p-5">
                  <div className="absolute top-0 left-0 h-full w-1 bg-primary-500" />
                  <p className="mb-4 text-sm leading-relaxed font-medium text-white">
                    {activeCard.cueCard.topic}
                  </p>
                  <p className="mb-2 text-xs font-bold text-dark-400">You should say:</p>
                  <ul className="space-y-2">
                    {activeCard.cueCard.bulletPoints.map((bulletPoint, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-dark-300">
                        <span className="mt-0.5 text-primary-400">-</span> {bulletPoint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeCard.questions && activeCard.questions.length > 0 && (
                <div className="space-y-2">
                  <p className="mb-2 text-xs font-bold text-dark-400">Questions:</p>
                  {activeCard.questions.map((question, index) => (
                    <p
                      key={index}
                      className="flex items-start gap-2 rounded-lg bg-dark-800/30 p-2 text-sm text-dark-300"
                    >
                      <span className="font-bold text-primary-400">{index + 1}.</span> {question}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="glass-card relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden p-8 text-center">
              {isRecording && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="h-64 w-64 animate-ping rounded-full bg-error" />
                </div>
              )}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-all ${
                  isRecording
                    ? 'scale-110 bg-error shadow-error/30 hover:bg-red-600'
                    : 'bg-primary-500 shadow-primary-500/30 hover:scale-105 hover:bg-primary-400'
                }`}
              >
                {isRecording ? (
                  <StopCircle size={40} className="text-white" />
                ) : (
                  <Mic size={40} className="text-white" />
                )}
              </button>

              <div className="z-10 mt-6">
                <h4 className="mb-1 text-lg font-bold text-white">
                  {isRecording
                    ? `Recording... ${formatTime(recordingDuration)}`
                    : audioUrl
                      ? 'Recording complete'
                      : 'Tap to record'}
                </h4>
                <p className="text-sm text-dark-400">
                  {isRecording
                    ? 'Speak clearly into your microphone.'
                    : audioUrl
                      ? 'Play back your recording. Automated assessment is unavailable.'
                      : 'Recording uses the browser MediaRecorder API.'}
                </p>
                {recorderError && <p className="mt-2 text-xs text-red-400">{recorderError}</p>}
              </div>

              {isRecording && (
                <div className="z-10 mt-6 flex h-8 items-center gap-1">
                  {RECORDING_BAR_HEIGHTS.map((height, index) => (
                    <div
                      key={`${height}-${index}`}
                      className="w-1.5 animate-pulse rounded-full bg-error"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${(index + 1) * 0.1}s`,
                        animationDuration: '0.5s',
                      }}
                    />
                  ))}
                </div>
              )}

              {audioUrl && !isRecording && (
                <div className="z-10 mt-6 flex gap-3">
                  <button
                    onClick={handlePlayback}
                    className="flex items-center gap-2 rounded-xl bg-dark-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dark-600"
                  >
                    <Play size={16} /> {isPlaying ? 'Pause' : 'Play back'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl bg-dark-700 px-4 py-2 text-sm font-semibold text-dark-300 transition-colors hover:text-white"
                  >
                    <RotateCcw size={16} /> Re-record
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
