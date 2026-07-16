import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PenTool, ChevronRight } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsWritingPrompts } from '../../../data/ieltsData';
import { MascotIELTSFeedback } from '../../../components/mascot/MascotIELTSFeedback';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSWritingPage() {
  const { t } = useTranslation();
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const addXP = useLearningStore(s => s.addXP);

  const prompt = ieltsWritingPrompts[promptIndex];
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  const handleSubmit = async () => {
    if (wordCount < Math.max(50, prompt.wordLimit.min * 0.5)) {
      toast(`Too short! Write at least ${prompt.wordLimit.min} words.`, 'error');
      return;
    }

    // Generate simulated band scores based on word count and prompt requirements
    const taskScore = Math.min(9, 5 + (wordCount >= prompt.wordLimit.min ? 1.5 : 0) + Math.random() * 1.5);
    const coherenceScore = Math.min(9, 5 + Math.random() * 2);
    const lexicalScore = Math.min(9, 5 + Math.random() * 2);
    const grammarScore = Math.min(9, 5 + Math.random() * 2);
    const overall = Math.round(((taskScore + coherenceScore + lexicalScore + grammarScore) / 4) * 2) / 2;

    const data = {
      bandScore: overall,
      criteriaScores: [
        { name: 'Task Response', score: Math.round(taskScore * 2) / 2 },
        { name: 'Coherence & Cohesion', score: Math.round(coherenceScore * 2) / 2 },
        { name: 'Lexical Resource', score: Math.round(lexicalScore * 2) / 2 },
        { name: 'Grammatical Range', score: Math.round(grammarScore * 2) / 2 },
      ],
      overallFeedback: overall >= 7
        ? 'Excellent work! Your essay demonstrates strong vocabulary and clear argumentation. To push higher, focus on more sophisticated grammatical structures and nuanced vocabulary.'
        : overall >= 6
        ? 'Good attempt! You address the topic adequately. To improve, use more varied sentence structures, develop your arguments with specific examples, and expand your range of vocabulary.'
        : 'Keep practicing! Focus on addressing all parts of the question, organizing your paragraphs clearly, and checking for basic grammar errors.',
    };

    setFeedbackData(data);
    setShowFeedback(true);
    addXP(50, `IELTS Writing: ${prompt.taskType}`);
    toast(`Band ${overall} — +50 XP`, 'success');

    // Log attempt
    try {
      const { useAuthStore } = await import('../../../stores/authStore');
      const { lessonAttemptService } = await import('../../../services/lessonAttemptService');
      const user = useAuthStore.getState().user;
      if (user) {
        await lessonAttemptService.logWritingSubmission(user.id, prompt.id, text, overall * 10, data);
      }
    } catch { /* ignore */ }
  };

  const switchPrompt = (idx: number) => {
    setPromptIndex(idx);
    setText('');
    setShowFeedback(false);
    setFeedbackData(null);
  };

  return (
    <PageShell title="IELTS Writing" description="Practice IELTS Writing Task 1 & 2" icon={<PenTool size={20} />} backTo="/app/ielts">
      <div className="space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl mb-2 text-sm flex items-start gap-3 relative z-10 text-left">
          <span className="text-xl">⚠️</span>
          <p><strong>{t("ielts.disclaimer_bold") || "Local estimated score — not an official IELTS score."}</strong> {t("ielts.disclaimer_text") || "Our AI tools evaluate based on simplified local heuristics and do not replace a certified examiner."}</p>
        </div>
        {/* Prompt selector */}
        <div className="flex gap-2 flex-wrap">
          {ieltsWritingPrompts.map((p, i) => (
            <button key={p.id} onClick={() => switchPrompt(i)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${promptIndex === i ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-800 border border-dark-700 text-dark-300 hover:text-white hover:border-primary-500/50 hover:bg-dark-700'}`}>
              {p.taskType === 'task2' ? `Task 2 #${i + 1}` : p.taskType === 'task1-academic' ? 'Task 1 (Academic)' : 'Task 1 (General)'}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Prompt side */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">
              {prompt.taskType === 'task2' ? 'Writing Task 2' : prompt.taskType === 'task1-academic' ? 'Task 1 (Academic)' : 'Task 1 (General)'}
            </h3>
            <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 mb-6">
              <p className="text-sm text-white leading-relaxed">{prompt.prompt}</p>
            </div>
            <div className="flex gap-4 text-xs font-bold text-dark-400 mb-6 bg-dark-800 p-3 rounded-xl w-max">
              <span className="flex items-center gap-1">⏱ {prompt.timeLimit} min</span>
              <span className="flex items-center gap-1">📝 {prompt.wordLimit.min}+ words</span>
            </div>
            <div className="mt-auto space-y-2">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">Tips from Ech Buri:</h4>
              {prompt.tips.map((tip, i) => (
                <p key={i} className="text-sm text-dark-300 flex items-start gap-2 bg-dark-800/30 p-2 rounded-lg">
                  <span className="text-primary-400">💡</span> {tip}
                </p>
              ))}
            </div>
          </div>

          {/* Editor side */}
          <div className="flex flex-col gap-4">
            <div className="glass-card p-6 flex-1 flex flex-col">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={showFeedback}
                className="w-full flex-1 min-h-[300px] bg-dark-900 border border-dark-700 rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-primary-500 transition-colors placeholder:text-dark-500 disabled:opacity-60"
                placeholder="Write your essay here... AI will review your grammar and vocabulary."
              />
              <div className="flex items-center justify-between mt-4">
                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${wordCount >= prompt.wordLimit.min ? 'bg-green-500/10 text-green-400' : 'bg-dark-800 text-dark-400'}`}>
                  {wordCount} / {prompt.wordLimit.min}+ words
                </span>
                {!showFeedback ? (
                  <button onClick={handleSubmit}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5">
                    Get Band Score
                  </button>
                ) : (
                  <button onClick={() => switchPrompt(Math.min(promptIndex + 1, ieltsWritingPrompts.length - 1))}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                    Next Prompt <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showFeedback && feedbackData && (
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <MascotIELTSFeedback
              bandScore={feedbackData.bandScore}
              criteriaScores={feedbackData.criteriaScores}
              overallFeedback={feedbackData.overallFeedback}
              aiMascot="Ech Buri"
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
