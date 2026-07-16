
import Mascot from './Mascot';
import { Target, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface MascotIELTSFeedbackProps {
  bandScore: number;
  criteriaScores: { name: string; score: number }[];
  overallFeedback: string;
  aiMascot?: string;
  improvements?: string[];

}

export function MascotIELTSFeedback({ bandScore, criteriaScores, overallFeedback, improvements = [] }: MascotIELTSFeedbackProps) {
  const getExpression = () => {
    if (bandScore >= 8.0) return 'happy';
    if (bandScore >= 6.5) return 'encouraging';
    if (bandScore <= 5.0) return 'surprised';
    return 'cool';
  };

  const getMessage = () => {
    if (bandScore >= 8.0) return "Masterful! You're definitely ready for the real exam.";
    if (bandScore >= 6.5) return "Great job! You're consistently hitting the upper bands.";
    if (bandScore <= 5.0) return "We have some work to do, but that's what practice is for!";
    return "Solid effort. Let's look at where we can polish your skills.";
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header section */}
      <div className="bg-dark-800/50 p-6 flex items-start gap-6 border-b border-dark-700/50">
        <div className="shrink-0 relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
          <Mascot expression={getExpression()} size={80} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">Estimated Band</h3>
            <span className="px-3 py-1 bg-primary-500 text-white font-bold rounded-lg text-lg">
              {bandScore.toFixed(1)}
            </span>
          </div>
          <p className="text-dark-300 italic">"{getMessage()}"</p>
        </div>
      </div>

      {/* Content section */}
      <div className="p-6 space-y-6">
        {/* Criteria Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target size={16} /> Criteria Breakdown
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {criteriaScores.map((c) => (
              <div key={c.name} className="bg-dark-800/30 p-3 rounded-xl border border-dark-700/50">
                <p className="text-xs text-dark-400 mb-1">{c.name}</p>
                <p className="text-xl font-bold text-white">{c.score.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Feedback */}
        <div>
          <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> Examiner AI Feedback
          </h4>
          <p className="text-dark-300 text-sm leading-relaxed">{overallFeedback}</p>
        </div>

        {/* Actionable Improvements */}
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap size={16} /> Top Areas to Improve
          </h4>
          <ul className="space-y-2">
            {improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-white">
                <AlertCircle size={16} className="text-primary-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
