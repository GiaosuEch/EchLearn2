import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, PenTool, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { getLanguageMeta } from '../../../utils/languageUtils';
import { getTargetWritingPrompts } from '../../../services/targetLanguageContent';
import { evaluateWritingPractice, recordPracticeAttempt, saveWritingFeedback } from '../../../services/practiceLearningIntegration';

type View = 'list' | 'write';

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
        <button onClick={() => setView('list')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 font-bold flex items-center gap-1">← {t('practice.back_to_prompts')}</button>
        
        {/* User Instruction / Hướng dẫn làm bài */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500 text-white font-bold shrink-0 flex items-center justify-center"><PenTool size={18} /></div>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {interfaceLanguage === 'vi' ? 'Hướng dẫn luyện viết AI:' : 'AI Writing Guide:'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              {interfaceLanguage === 'vi' 
                ? '1. Đọc kỹ đề bài & số từ tối thiểu ở cột bên trái.\n2. Soạn thảo câu trả lời bằng ngôn ngữ đang học vào ô văn bản bên phải.\n3. Nhấn "Gửi chấm điểm AI" để AI chỉ ra điểm mạnh, lỗi ngữ pháp và gợi ý câu viết lại hay hơn.'
                : '1. Read the writing prompt and word count requirement on the left.\n2. Type your response in the target language in the text box on the right.\n3. Click "Submit evaluation" for instant AI feedback & rewrite suggestions.'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.4fr] gap-6 items-start">
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{activePrompt.level}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white whitespace-pre-line">{activePrompt.prompt}</h3>
            {activePrompt.instructions && <p className="text-sm text-slate-600 dark:text-slate-300 italic">{activePrompt.instructions}</p>}
            {activePrompt.mediaResources && <div className="pt-3 border-t border-slate-200 dark:border-slate-700"><p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">{interfaceLanguage === 'vi' ? 'Video / ví dụ tham khảo' : 'Reference videos / examples'}</p><div className="flex flex-wrap gap-2">{activePrompt.mediaResources.map((resource: any, idx: number) => <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold transition-all">{interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}</a>)}</div></div>}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('practice.word_count')}: <span className="font-bold text-slate-900 dark:text-white">{wordCount}</span> / {activePrompt.minWords || 20}</p>
          </section>
          <section className="space-y-4">
            <textarea value={text} onChange={event => setText(event.target.value)} rows={14} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y shadow-sm transition-all" placeholder={t('lesson.placeholders.typeAnswer')} />
            <button onClick={submit} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all"><Wand2 size={18} /> {t('practice.submit_evaluation')}</button>
            {feedback && <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-md"><h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('practice.feedback')}</h3><p className="text-emerald-600 dark:text-emerald-400 font-bold mb-2">{feedback.isIELTS ? `${t('ielts.band')} ${feedback.band}` : `${feedback.score}/100`}</p><p className="text-sm text-slate-600 dark:text-slate-300">{feedback.disclaimer}</p><div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 dark:text-slate-300 font-medium"><span>Task: {feedback.categories.taskResponse}</span><span>Coherence: {feedback.categories.coherence}</span><span>Lexical: {feedback.categories.vocabulary}</span><span>Grammar: {feedback.categories.grammar}</span></div><div className="mt-4 space-y-2"><p className="text-xs font-bold text-green-600 dark:text-green-400">{interfaceLanguage === 'vi' ? 'Điểm mạnh' : 'Strengths'}</p>{feedback.strengths.map((item: string) => <p key={item} className="text-xs text-slate-600 dark:text-slate-300">• {item}</p>)}<p className="text-xs font-bold text-amber-500 pt-2">{interfaceLanguage === 'vi' ? 'Cần cải thiện' : 'Improvements'}</p>{feedback.improvements.map((item: string) => <p key={item} className="text-xs text-slate-600 dark:text-slate-300">• {item}</p>)}<p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-2">{feedback.rewriteSuggestion}</p></div></div>}
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t('practice.writing_title')} description={`${getLanguageMeta(targetLanguage).flag} ${getLanguageMeta(targetLanguage).nativeName}`} icon={<PenTool size={20} />}>
      <div className="flex flex-wrap gap-2 mb-6">
        {levels.map(level => <button key={level} onClick={() => setLevelFilter(level)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${levelFilter === level ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`}>{level === 'all' ? t('common.all') : level}</button>)}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 self-center font-medium">{filtered.length} {t('practice.prompts')}</span>
      </div>
      <div className="space-y-3">
        {filtered.map((prompt: any, index: number) => <motion.button key={prompt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} onClick={() => startWriting(prompt)} className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-emerald-500/40 hover:shadow-md transition-all"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed.has(prompt.id) ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>{completed.has(prompt.id) ? <CheckCircle2 size={20} /> : <PenTool size={18} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{prompt.topic}</h3><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">{prompt.level}</span></div><p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{prompt.prompt}</p></div><ChevronRight size={16} className="text-slate-400" /></div></motion.button>)}
      </div>
    </PageShell>
  );
}
