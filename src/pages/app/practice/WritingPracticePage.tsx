// @ts-nocheck
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, PenTool, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { getWritingForLanguage } from '../../../curriculum/contentRegistry';
import { getLanguageMeta } from '../../../utils/languageUtils';
import { getTargetWritingPrompts } from '../../../services/targetLanguageContent';
import { evaluateWritingPractice, recordPracticeAttempt, saveWritingFeedback } from '../../../services/practiceLearningIntegration';

type View = 'list' | 'write';

function fallbackPrompts(lang: string) {
  const meta = getLanguageMeta(lang);
  return [
    { id: `${lang}_fallback_1`, topic: meta.nativeName, level: 'A1', prompt: `Write five simple sentences using ${meta.nativeName}.`, minWords: 20, tags: ['starter'] },
    { id: `${lang}_fallback_2`, topic: meta.nativeName, level: 'A2', prompt: `Describe your daily routine in ${meta.nativeName}.`, minWords: 40, tags: ['daily'] },
  ];
}

export default function WritingPracticePage() {
  const { t } = useTranslation();
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const targetPrompts = useMemo(() => getTargetWritingPrompts(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const addXP = useLearningStore(s => s.addXP);
  const [view, setView] = useState<View>('list');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activePrompt, setActivePrompt] = useState<any>(null);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('echlern_writing_completed') || '[]')); } catch { return new Set(); }
  });

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS Task 1 Academic', 'IELTS Task 1 General', 'IELTS Task 2'];
  const filtered = levelFilter === 'all' ? targetPrompts : targetPrompts.filter((prompt: any) => prompt.level === levelFilter);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const startWriting = (prompt: any) => {
    setActivePrompt(prompt);
    setText('');
    setFeedback(null);
    setView('write');
  };

  const submit = async () => {
    if (!activePrompt) return;
    const minWords = Number(activePrompt.minWords || 20);
    if (wordCount < Math.max(5, Math.floor(minWords / 3))) {
      toast(t('practice.word_count'), 'warning');
      return;
    }
    const result = evaluateWritingPractice({ text, prompt: activePrompt, targetLanguage, interfaceLanguage });
    setFeedback(result);
    addXP(Math.max(20, Math.round(result.score / 2)), `Writing: ${activePrompt.topic}`);
    const next = new Set(completed);
    next.add(activePrompt.id);
    setCompleted(next);
    localStorage.setItem('echlern_writing_completed', JSON.stringify([...next]));
    toast(`+${Math.max(20, Math.round(result.score / 2))} XP`, 'success');
    try {
      const { useAuthStore } = await import('../../../stores/authStore');
      const user = useAuthStore.getState().user;
      await recordPracticeAttempt({
        userId: user?.id,
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        interfaceLanguage,
        skillType: 'writing',
        activityId: activePrompt.id,
        activityTitle: activePrompt.topic || activePrompt.prompt,
        score: result.score,
        total: 100,
        answers: [{
          itemId: activePrompt.id,
          isCorrect: result.score >= 60,
          answer: text.slice(0, 500),
          correctAnswer: activePrompt.prompt,
          typedExact: result.score >= 80,
          typedClose: result.score >= 60 && result.score < 80,
          timeSpentSec: Math.max(30, wordCount * 4),
        }],
        metadata: { source: 'writing_practice', wordCount, level: activePrompt.level, feedback: result },
      });
      await saveWritingFeedback({ userId: user?.id, targetLanguage, promptId: activePrompt.id, text, feedback: result });
      if (user) {
        const { lessonAttemptService } = await import('../../../services/lessonAttemptService');
        await lessonAttemptService.logWritingSubmission(user.id, activePrompt.id, text, result.score, result);
      }
    } catch (error) { console.warn('Writing save failed', error); }
  };

  if (view === 'write' && activePrompt) {
    return (
      <PageShell title={t('practice.writing_title')} description={activePrompt.topic} icon={<PenTool size={20} />}>
        <button onClick={() => setView('list')} className="text-sm text-dark-400 hover:text-white mb-6">← {t('practice.back_to_prompts')}</button>
        <div className="grid lg:grid-cols-[0.9fr_1.4fr] gap-6 items-start">
          <section className="glass-card p-6 space-y-4">
            <span className="inline-flex px-2 py-1 rounded-lg text-xs font-bold bg-primary-500/20 text-primary-400">{activePrompt.level}</span>
            <h3 className="text-lg font-bold text-white whitespace-pre-line">{activePrompt.prompt}</h3>
            {activePrompt.instructions && <p className="text-sm text-dark-300 italic">{activePrompt.instructions}</p>}
            {activePrompt.mediaResources && <div className="pt-3 border-t border-dark-700"><p className="text-xs uppercase text-dark-500 mb-2">{interfaceLanguage === 'vi' ? 'Video / ví dụ tham khảo' : 'Reference videos / examples'}</p><div className="flex flex-wrap gap-2">{activePrompt.mediaResources.map((resource: any, idx: number) => <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-primary-300 border border-dark-700">{interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}</a>)}</div></div>}
            <p className="text-xs text-dark-500">{t('practice.word_count')}: {wordCount} / {activePrompt.minWords || 20}</p>
          </section>
          <section className="space-y-4">
            <textarea value={text} onChange={event => setText(event.target.value)} rows={14} className="w-full bg-dark-900 border border-dark-700 rounded-2xl p-5 text-white outline-none focus:border-primary-500 resize-y" placeholder={t('lesson.placeholders.typeAnswer')} />
            <button onClick={submit} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Wand2 size={18} /> {t('practice.submit_evaluation')}</button>
            {feedback && <div className="glass-card p-5 border-primary-500/20"><h3 className="font-bold text-white mb-2">{t('practice.feedback')}</h3><p className="text-primary-400 font-bold mb-2">{feedback.isIELTS ? `${t('ielts.band')} ${feedback.band}` : `${feedback.score}/100`}</p><p className="text-sm text-dark-300">{feedback.disclaimer}</p><div className="grid grid-cols-2 gap-2 mt-4 text-xs text-dark-300"><span>Task: {feedback.categories.taskResponse}</span><span>Coherence: {feedback.categories.coherence}</span><span>Lexical: {feedback.categories.vocabulary}</span><span>Grammar: {feedback.categories.grammar}</span></div><div className="mt-4 space-y-2"><p className="text-xs font-bold text-green-400">{interfaceLanguage === 'vi' ? 'Điểm mạnh' : 'Strengths'}</p>{feedback.strengths.map((item: string) => <p key={item} className="text-xs text-dark-300">• {item}</p>)}<p className="text-xs font-bold text-yellow-400 pt-2">{interfaceLanguage === 'vi' ? 'Cần cải thiện' : 'Improvements'}</p>{feedback.improvements.map((item: string) => <p key={item} className="text-xs text-dark-300">• {item}</p>)}<p className="text-xs text-primary-300 pt-2">{feedback.rewriteSuggestion}</p></div></div>}
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t('practice.writing_title')} description={`${getLanguageMeta(targetLanguage).flag} ${getLanguageMeta(targetLanguage).nativeName}`} icon={<PenTool size={20} />}>
      <div className="flex flex-wrap gap-2 mb-6">
        {levels.map(level => <button key={level} onClick={() => setLevelFilter(level)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${levelFilter === level ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>{level === 'all' ? t('common.all') : level}</button>)}
        <span className="ml-auto text-xs text-dark-500 self-center">{filtered.length} {t('practice.prompts')}</span>
      </div>
      <div className="space-y-3">
        {filtered.map((prompt: any, index: number) => <motion.button key={prompt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} onClick={() => startWriting(prompt)} className="w-full glass-card p-4 text-left hover:border-primary-500/30"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed.has(prompt.id) ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'}`}>{completed.has(prompt.id) ? <CheckCircle2 size={20} /> : <PenTool size={18} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold text-white text-sm truncate">{prompt.topic}</h3><span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-dark-300">{prompt.level}</span></div><p className="text-xs text-dark-400 truncate mt-1">{prompt.prompt}</p></div><ChevronRight size={16} className="text-dark-500" /></div></motion.button>)}
      </div>
    </PageShell>
  );
}
