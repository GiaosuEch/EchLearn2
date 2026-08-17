import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Mic, Play, Square, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { getLanguageMeta } from '../../../utils/languageUtils';
import { getTargetSpeakingPrompts } from '../../../services/targetLanguageContent';
import { evaluateSpeakingPractice, recordPracticeAttempt, saveSpeakingFeedback, type SpeakingFeedbackResult } from '../../../services/practiceLearningIntegration';
import { audioService } from '../../../services/audioService';
import { PitchContourVisualizer } from '../../../components/audio/PitchContourVisualizer';

type View = 'list' | 'practice';

export default function SpeakingPracticePage() {
  const { t } = useTranslation();
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const targetPrompts = useMemo(() => getTargetSpeakingPrompts(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const addXP = useLearningStore(s => s.addXP);
  const recorder = useVoiceRecorder();
  
  const speechLang = targetLanguage === 'en' ? 'en-US' : targetLanguage === 'ja' ? 'ja-JP' : targetLanguage === 'ko' ? 'ko-KR' : 'en-US';
  const speech = useSpeechRecognition(speechLang);
  
  const [view, setView] = useState<View>('list');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activePrompt, setActivePrompt] = useState<any>(null);
  const [feedback, setFeedback] = useState<SpeakingFeedbackResult | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('echlern_speaking_completed') || '[]')); } catch { return new Set(); }
  });

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS Part 1', 'IELTS Part 2', 'IELTS Part 3'];
  const filtered = levelFilter === 'all' ? targetPrompts : targetPrompts.filter((prompt: any) => prompt.level === levelFilter);

  const startPractice = (prompt: any) => {
    setActivePrompt(prompt);
    setFeedback(null);
    recorder.resetRecording();
    speech.stopListening();
    setView('practice');
  };

  const handleStartRecording = () => {
    recorder.startRecording();
    speech.startListening();
  };

  const handleStopRecording = () => {
    recorder.stopRecording();
    speech.stopListening();
  };

  const submitRecording = async () => {
    if (!activePrompt || !recorder.audioUrl) return;
    const result = evaluateSpeakingPractice({ 
      duration: recorder.duration, 
      prompt: activePrompt, 
      hasRecording: Boolean(recorder.audioUrl), 
      transcript: speech.transcript,
      interfaceLanguage 
    });
    setFeedback(result);
    addXP(result.practiceXP, `Speaking: ${activePrompt.topic || activePrompt.title}`);
    const next = new Set(completed);
    next.add(activePrompt.id);
    setCompleted(next);
    localStorage.setItem('echlern_speaking_completed', JSON.stringify([...next]));
    toast(`+${result.practiceXP} XP`, 'success');
    try {
      const { useAuthStore } = await import('../../../stores/authStore');
      const user = useAuthStore.getState().user;
      await recordPracticeAttempt({
        userId: user?.id,
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        interfaceLanguage,
        skillType: 'speaking',
        activityId: activePrompt.id,
        activityTitle: activePrompt.topic || activePrompt.title,
        score: result.completionAwarded ? 1 : 0,
        total: 1,
        timeSpentSec: recorder.duration,
        answers: [{
          itemId: activePrompt.id,
          isCorrect: result.completionAwarded,
          answer: `recorded_${recorder.duration}s`,
          correctAnswer: activePrompt.prompt,
          typedClose: result.completionAwarded,
          timeSpentSec: recorder.duration,
        }],
        metadata: { source: 'speaking_practice', level: activePrompt.level, completionAwarded: result.completionAwarded, recordingDurationSec: result.duration, feedback: result },
      });
      await saveSpeakingFeedback({ userId: user?.id, targetLanguage, promptId: activePrompt.id, audioUrl: recorder.audioUrl, feedback: result });
    } catch (error) { console.warn('Speaking save failed', error); }
  };

  const playRecording = () => {
    if (recorder.audioUrl) void audioService.playUrl(recorder.audioUrl).catch(() => toast(t('lesson.errors.tts_failed'), 'error'));
  };

  if (view === 'practice' && activePrompt) {
    const goal = activePrompt.expectedDurationSeconds || activePrompt.timeLimit || 60;
    return (
      <PageShell title={t('practice.speaking_title')} description={activePrompt.topic || activePrompt.title} icon={<Mic size={20} />}>
        <button onClick={() => setView('list')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 font-bold flex items-center gap-1">← {t('practice.back_to_prompts')}</button>
        
        {/* User Instruction / Hướng dẫn làm bài */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500 text-white font-bold shrink-0 flex items-center justify-center"><Mic size={18} /></div>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {interfaceLanguage === 'vi' ? 'Hướng dẫn luyện nói:' : 'Speaking practice guide:'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              {interfaceLanguage === 'vi' 
                ? '1. Đọc kỹ chủ đề và gợi ý ý tưởng ở cột bên trái.\n2. Nhấn "Bắt đầu thu âm" và nói bằng ngôn ngữ đang học.\n3. Nhấn "Lưu bài luyện" để ghi nhận lượt luyện, XP và checklist tự so sánh.'
                : '1. Read the prompt and bullet points on the left.\n2. Click "Start recording" and speak in your target language.\n3. Click "Save practice" to record the practice, earn XP, and open a self-review checklist.'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{activePrompt.level}</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">“{activePrompt.prompt}”</h3>
            {activePrompt.bulletPoints && <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">{activePrompt.bulletPoints.map((point: string) => <li key={point}>{point}</li>)}</ul>}
            {activePrompt.mediaResources && <div className="pt-3 border-t border-slate-200 dark:border-slate-700"><p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">{interfaceLanguage === 'vi' ? 'Video ví dụ' : 'Example videos'}</p><div className="flex flex-wrap gap-2">{activePrompt.mediaResources.map((resource: any, idx: number) => <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold transition-all">{interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}</a>)}</div></div>}
            <div><p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">{t('practice.goal_duration')}</p><div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (recorder.duration / goal) * 100)}%` }} /></div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{recorder.duration}s / {goal}s</p></div>
          </section>

          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col items-center justify-center text-center space-y-5">
            {recorder.error && <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-bold">{recorder.error}</div>}
            
            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-2xl border border-slate-800 w-full">
              {!recorder.audioUrl && !feedback && (
                <div className="flex flex-col items-center gap-6 w-full max-w-md">
                  <PitchContourVisualizer
                    isRecording={recorder.isRecording}
                    stream={recorder.stream}
                    targetPhrase={activePrompt.prompt}
                    className="w-full"
                  />
                  
                  <p className="text-slate-400 text-sm font-medium">
                    {recorder.isRecording 
                      ? `Recording... ${recorder.duration}s` 
                      : 'Tap microphone to speak'}
                  </p>
                  
                  {!recorder.isRecording ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartRecording} 
                      className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                    >
                      <Mic size={32} />
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStopRecording} 
                      className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
                    >
                      <Square size={32} className="fill-current" />
                    </motion.button>
                  )}
                </div>
              )}

              {recorder.audioUrl && !feedback && (
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={playRecording} className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"><Play size={18} /> {t('practice.play')}</button>
                  <button onClick={recorder.resetRecording} className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"><RotateCcw size={18} /> {t('lesson.buttons.tryAgain')}</button>
                </div>
              )}
            </div>

            <button disabled={!recorder.audioUrl || feedback !== null} onClick={submitRecording} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white shadow-md disabled:opacity-50 transition-all">{interfaceLanguage === 'vi' ? 'Lưu bài luyện' : 'Save practice'}</button>
            
            {feedback && <div className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"><h4 className="font-bold text-slate-900 dark:text-white mb-2">{interfaceLanguage === 'vi' ? 'Bản ghi đã lưu' : 'Practice saved'}</h4><p className="text-emerald-600 dark:text-emerald-400 font-bold">{interfaceLanguage === 'vi' ? `Đã ghi âm ${feedback.duration}s · +${feedback.practiceXP} XP luyện tập` : `${feedback.duration}s recorded · +${feedback.practiceXP} practice XP`}</p><p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{feedback.disclaimer}</p><div className="mt-4 space-y-1"><p className="text-xs font-bold text-amber-500">{interfaceLanguage === 'vi' ? 'Checklist tự đánh giá' : 'Self-review checklist'}</p>{feedback.selfReviewChecklist.map((item: string) => <p key={item} className="text-xs text-slate-600 dark:text-slate-300">• {item}</p>)}</div></div>}
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t('practice.speaking_title')} description={`${getLanguageMeta(targetLanguage).flag} ${getLanguageMeta(targetLanguage).nativeName}`} icon={<Mic size={20} />}>
      <div className="flex flex-wrap gap-2 mb-6">
        {levels.map(level => <button key={level} onClick={() => setLevelFilter(level)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${levelFilter === level ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`}>{level === 'all' ? t('common.all') : level}</button>)}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 self-center font-medium">{filtered.length} {t('practice.prompts')}</span>
      </div>
      <div className="space-y-3">
        {filtered.map((prompt: any, index: number) => <motion.button key={prompt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} onClick={() => startPractice(prompt)} className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-emerald-500/40 hover:shadow-md transition-all"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed.has(prompt.id) ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>{completed.has(prompt.id) ? <CheckCircle2 size={20} /> : <Mic size={18} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{prompt.topic || prompt.title}</h3><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">{prompt.level}</span></div><p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{prompt.prompt}</p></div><ChevronRight size={16} className="text-slate-400" /></div></motion.button>)}
      </div>
    </PageShell>
  );
}
