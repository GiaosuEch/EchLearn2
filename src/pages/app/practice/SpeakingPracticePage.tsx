// @ts-nocheck
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Mic, Play, Square, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { getSpeakingForLanguage } from '../../../curriculum/contentRegistry';
import { getLanguageMeta } from '../../../utils/languageUtils';
import { getTargetSpeakingPrompts } from '../../../services/targetLanguageContent';
import { evaluateSpeakingPractice, recordPracticeAttempt, saveSpeakingFeedback } from '../../../services/practiceLearningIntegration';

type View = 'list' | 'practice';

function fallbackPrompts(lang: string) {
  const meta = getLanguageMeta(lang);
  return [
    { id: `${lang}_speak_1`, title: meta.nativeName, topic: meta.nativeName, level: 'A1', prompt: `Introduce yourself using ${meta.nativeName}.`, timeLimit: 60, expectedDurationSeconds: 45, tags: ['starter'] },
    { id: `${lang}_speak_2`, title: meta.nativeName, topic: meta.nativeName, level: 'A2', prompt: `Talk about your daily routine using ${meta.nativeName}.`, timeLimit: 90, expectedDurationSeconds: 60, tags: ['daily'] },
  ];
}

export default function SpeakingPracticePage() {
  const { t } = useTranslation();
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const targetPrompts = useMemo(() => getTargetSpeakingPrompts(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const addXP = useLearningStore(s => s.addXP);
  const recorder = useVoiceRecorder();
  const [view, setView] = useState<View>('list');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activePrompt, setActivePrompt] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('echlern_speaking_completed') || '[]')); } catch { return new Set(); }
  });

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS Part 1', 'IELTS Part 2', 'IELTS Part 3'];
  const filtered = levelFilter === 'all' ? targetPrompts : targetPrompts.filter((prompt: any) => prompt.level === levelFilter);

  const startPractice = (prompt: any) => {
    setActivePrompt(prompt);
    setFeedback(null);
    recorder.resetRecording();
    setView('practice');
  };

  const submitRecording = async () => {
    if (!activePrompt || !recorder.audioUrl) return;
    const result = evaluateSpeakingPractice({ duration: recorder.duration, prompt: activePrompt, hasRecording: Boolean(recorder.audioUrl), interfaceLanguage });
    setFeedback(result);
    addXP(Math.max(18, Math.round(result.score / 3)), `Speaking: ${activePrompt.topic || activePrompt.title}`);
    const next = new Set(completed);
    next.add(activePrompt.id);
    setCompleted(next);
    localStorage.setItem('echlern_speaking_completed', JSON.stringify([...next]));
    toast(`+${Math.max(18, Math.round(result.score / 3))} XP`, 'success');
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
        score: result.score,
        total: 100,
        timeSpentSec: recorder.duration,
        answers: [{
          itemId: activePrompt.id,
          isCorrect: result.score >= 60,
          answer: `recorded_${recorder.duration}s`,
          correctAnswer: activePrompt.prompt,
          typedClose: result.score >= 60,
          timeSpentSec: recorder.duration,
        }],
        metadata: { source: 'speaking_practice', level: activePrompt.level, feedback: result },
      });
      await saveSpeakingFeedback({ userId: user?.id, targetLanguage, promptId: activePrompt.id, audioUrl: recorder.audioUrl, feedback: result });
      if (user) {
        const { lessonAttemptService } = await import('../../../services/lessonAttemptService');
        await lessonAttemptService.logSpeakingAttempt(user.id, activePrompt.id, recorder.audioUrl, result.score, result);
      }
    } catch (error) { console.warn('Speaking save failed', error); }
  };

  const playRecording = () => {
    if (recorder.audioUrl) new Audio(recorder.audioUrl).play().catch(() => toast(t('lesson.errors.tts_failed'), 'error'));
  };

  if (view === 'practice' && activePrompt) {
    const goal = activePrompt.expectedDurationSeconds || activePrompt.timeLimit || 60;
    return (
      <PageShell title={t('practice.speaking_title')} description={activePrompt.topic || activePrompt.title} icon={<Mic size={20} />}>
        <button onClick={() => setView('list')} className="text-sm text-dark-400 hover:text-white mb-6">← {t('practice.back_to_prompts')}</button>
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="glass-card p-6 space-y-4">
            <span className="inline-flex px-2 py-1 rounded-lg text-xs font-bold bg-primary-500/20 text-primary-400">{activePrompt.level}</span>
            <h3 className="text-xl font-bold text-white">“{activePrompt.prompt}”</h3>
            {activePrompt.bulletPoints && <ul className="list-disc pl-5 text-sm text-dark-300 space-y-1">{activePrompt.bulletPoints.map((point: string) => <li key={point}>{point}</li>)}</ul>}
            {activePrompt.mediaResources && <div className="pt-3 border-t border-dark-700"><p className="text-xs uppercase text-dark-500 mb-2">{interfaceLanguage === 'vi' ? 'Video ví dụ' : 'Example videos'}</p><div className="flex flex-wrap gap-2">{activePrompt.mediaResources.map((resource: any, idx: number) => <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-primary-300 border border-dark-700">{interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}</a>)}</div></div>}
            <div><p className="text-xs uppercase text-dark-500 mb-2">{t('practice.goal_duration')}</p><div className="h-2 rounded-full bg-dark-800 overflow-hidden"><div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (recorder.duration / goal) * 100)}%` }} /></div><p className="text-xs text-dark-400 mt-1">{recorder.duration}s / {goal}s</p></div>
          </section>
          <section className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-5">
            {recorder.error && <div className="w-full p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">{recorder.error}</div>}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${recorder.isRecording ? 'bg-error/20 text-error animate-pulse' : 'bg-primary-500/20 text-primary-400'}`}><Mic size={48} /></div>
            <p className="text-3xl font-mono font-bold text-white">{recorder.duration}s</p>
            <div className="flex flex-wrap justify-center gap-3">
              {!recorder.isRecording ? <button onClick={recorder.startRecording} className="px-5 py-3 rounded-xl bg-primary-500 text-white font-bold flex items-center gap-2"><Mic size={18} /> {t('practice.start_recording')}</button> : <button onClick={recorder.stopRecording} className="px-5 py-3 rounded-xl bg-error text-white font-bold flex items-center gap-2"><Square size={18} /> {t('practice.stop_recording')}</button>}
              {recorder.audioUrl && <button onClick={playRecording} className="px-5 py-3 rounded-xl bg-dark-700 text-white font-bold flex items-center gap-2"><Play size={18} /> {t('practice.play')}</button>}
              {recorder.audioUrl && <button onClick={recorder.resetRecording} className="px-5 py-3 rounded-xl bg-dark-700 text-white font-bold flex items-center gap-2"><RotateCcw size={18} /> {t('lesson.buttons.tryAgain')}</button>}
            </div>
            <button disabled={!recorder.audioUrl} onClick={submitRecording} className="w-full py-3 bg-primary-500 rounded-xl font-bold text-white disabled:opacity-50">{t('practice.submit_evaluation')}</button>
            {feedback && <div className="w-full text-left p-4 rounded-xl bg-dark-800/70 border border-dark-700"><h4 className="font-bold text-white mb-2">{t('practice.feedback')}</h4><p className="text-primary-400 font-semibold">{feedback.isIELTS ? `${t('ielts.band')} ${feedback.band}` : `${feedback.score}/100`}</p><p className="text-sm text-dark-300 mt-2">{feedback.disclaimer}</p><div className="grid grid-cols-2 gap-2 mt-3 text-xs text-dark-300"><span>Pronunciation: {feedback.categories.pronunciation}</span><span>Fluency: {feedback.categories.fluency}</span><span>Vocabulary: {feedback.categories.vocabulary}</span><span>Grammar: {feedback.categories.grammar}</span></div><div className="mt-4 space-y-1"><p className="text-xs font-bold text-yellow-400">{interfaceLanguage === 'vi' ? 'Checklist tự đánh giá' : 'Self-review checklist'}</p>{feedback.selfReviewChecklist.map((item: string) => <p key={item} className="text-xs text-dark-300">• {item}</p>)}</div></div>}
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t('practice.speaking_title')} description={`${getLanguageMeta(targetLanguage).flag} ${getLanguageMeta(targetLanguage).nativeName}`} icon={<Mic size={20} />}>
      <div className="flex flex-wrap gap-2 mb-6">
        {levels.map(level => <button key={level} onClick={() => setLevelFilter(level)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${levelFilter === level ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>{level === 'all' ? t('common.all') : level}</button>)}
        <span className="ml-auto text-xs text-dark-500 self-center">{filtered.length} {t('practice.prompts')}</span>
      </div>
      <div className="space-y-3">
        {filtered.map((prompt: any, index: number) => <motion.button key={prompt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} onClick={() => startPractice(prompt)} className="w-full glass-card p-4 text-left hover:border-primary-500/30"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed.has(prompt.id) ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'}`}>{completed.has(prompt.id) ? <CheckCircle2 size={20} /> : <Mic size={18} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold text-white text-sm truncate">{prompt.topic || prompt.title}</h3><span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-dark-300">{prompt.level}</span></div><p className="text-xs text-dark-400 truncate mt-1">{prompt.prompt}</p></div><ChevronRight size={16} className="text-dark-500" /></div></motion.button>)}
      </div>
    </PageShell>
  );
}
