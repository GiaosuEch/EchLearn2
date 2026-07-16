import { useState } from 'react';
import { PenTool } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';

export default function AIWritingCoachPage() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<null | { 
    scores: number[], 
    overall: number, 
    comments: string,
    grammarCorrections: { original: string, fixed: string, reason: string }[],
    vocabUpgrades: { original: string, upgrade: string }[],
    rewrite: string
  }>(null);

  const analyzeWriting = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setFeedback({
        scores: [6.5, 7.0, 6.5, 6.0],
        overall: 6.5,
        comments: 'Your essay is well-structured and addresses the prompt adequately. However, there are grammatical errors and the vocabulary could be more academic.',
        grammarCorrections: [
          { original: 'People is thinking', fixed: 'People are thinking', reason: '"People" is a plural noun.' },
          { original: 'In the other hand', fixed: 'On the other hand', reason: 'Correct idiom usage.' }
        ],
        vocabUpgrades: [
          { original: 'good things', upgrade: 'benefits / advantages' },
          { original: 'very big', upgrade: 'substantial / significant' }
        ],
        rewrite: 'Many individuals believe that the advantages of this trend are substantial. On the other hand, there are certain drawbacks to consider...'
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <PageShell title="AI Writing Coach" description="Submit writing for AI-powered IELTS feedback" icon={<PenTool size={20} />} backTo="/app/ielts">
      <div className="grid xl:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col h-full">
          <h3 className="font-semibold text-white mb-4 text-lg">Your Writing</h3>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16}
            placeholder="Paste or write your essay here for AI feedback..."
            className="w-full flex-1 bg-dark-900 border border-dark-700 rounded-xl p-5 text-sm text-white outline-none resize-none focus:border-primary-500 custom-scrollbar leading-relaxed transition-colors" />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium text-dark-400 bg-dark-800 px-3 py-1 rounded-lg">{text.split(/\s+/).filter(Boolean).length} words</span>
            <button 
              onClick={analyzeWriting} 
              disabled={isAnalyzing || !text.trim()}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none">
              {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Writing ✨'}
            </button>
          </div>
        </div>
        <div className="glass-card p-6 h-[800px] overflow-y-auto custom-scrollbar relative">
          <h3 className="font-semibold text-white mb-6 text-lg sticky top-0 bg-dark-800/80 backdrop-blur-md pb-2 z-10">Examiner AI Feedback</h3>
          {!feedback ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Mascot expression="thinking" size={100} />
              <p className="text-dark-300 mt-6 max-w-xs leading-relaxed">Submit your writing and I will provide detailed band scores, grammar corrections, and vocabulary upgrades!</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Task Response', 'Coherence', 'Lexical', 'Grammar'].map((criteria, idx) => (
                  <div key={criteria} className="p-3 bg-dark-800/50 rounded-xl text-center border border-dark-700/50 hover:border-primary-500/30 transition-colors">
                    <span className="text-xs font-bold text-dark-400 block mb-1 uppercase tracking-wider">{criteria}</span>
                    <span className="text-2xl font-bold text-white">
                      {feedback.scores[idx].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="p-5 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-start gap-4">
                <div className="shrink-0 bg-primary-500/20 p-2 rounded-full">
                  <Mascot expression="happy" size={50} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-white">Overall Band Score:</span>
                    <span className="text-xl font-bold text-accent-400 bg-accent-400/10 px-2 py-0.5 rounded-lg">{feedback.overall.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-dark-300 leading-relaxed">{feedback.comments}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-2">Grammar Corrections</h4>
                {feedback.grammarCorrections.map((corr, i) => (
                  <div key={i} className="p-4 bg-dark-800/30 rounded-xl border border-error/20 hover:border-error/40 transition-colors">
                    <p className="text-sm line-through text-error mb-2 p-2 bg-error/10 rounded-lg">{corr.original}</p>
                    <p className="text-sm text-success font-medium mb-3 p-2 bg-success/10 rounded-lg">{corr.fixed}</p>
                    <p className="text-xs text-dark-400 italic flex items-start gap-2"><span className="text-primary-400 not-italic">💡</span> {corr.reason}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-2">Vocabulary Upgrades</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feedback.vocabUpgrades.map((vocab, i) => (
                    <div key={i} className="p-4 bg-dark-800/30 rounded-xl border border-dark-700/50 flex flex-col justify-center text-center group hover:border-primary-500/30 transition-colors">
                      <p className="text-xs text-dark-400 mb-2">Instead of <span className="line-through block mt-1">{vocab.original}</span></p>
                      <p className="text-sm font-bold text-primary-400 group-hover:text-primary-300 transition-colors">Use "{vocab.upgrade}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-2">AI Re-write Suggestion</h4>
                <div className="p-5 bg-dark-900 border border-primary-500/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                  <p className="text-sm text-dark-300 leading-relaxed italic">{feedback.rewrite}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
