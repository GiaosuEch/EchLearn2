import { useState } from 'react';
import { Mic } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';

export default function AISpeakingCoachPage() {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<null | { pronunciation: number, fluency: number, intonation: number, stress: number }>(null);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setAnalyzing(true);
      setTimeout(() => {
        setFeedback({
          pronunciation: 82,
          fluency: 75,
          intonation: 70,
          stress: 78
        });
        setAnalyzing(false);
      }, 2000);
    } else {
      setRecording(true);
      setFeedback(null);
    }
  };

  return (
    <PageShell title="AI Speaking Coach" description="Get pronunciation feedback from AI" icon={<Mic size={20} />} backTo="/app/ielts">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <Mascot expression={analyzing ? "thinking" : (feedback ? "happy" : "cool")} size={80} message={analyzing ? "Đang nghe kĩ nè..." : (feedback ? "Tuyệt vời!" : "Nói đi, mình chấm cho! 🎤")} />
          <p className="mt-6 text-xl text-white font-bold leading-relaxed">Say: "The weather is beautiful today"</p>
          
          <button 
            onClick={toggleRecording}
            disabled={analyzing}
            className={`mt-8 w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all shadow-xl ${recording ? 'bg-error animate-pulse shadow-error/30 scale-110 hover:bg-red-600' : 'bg-primary-500 shadow-primary-500/30 hover:bg-primary-400 hover:scale-105'} ${analyzing ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}>
            <Mic size={40} className="text-white" />
          </button>
          
          <p className="mt-4 text-sm font-bold text-dark-400">
            {recording ? '🔴 Recording...' : (analyzing ? 'Analyzing audio...' : 'Tap to speak')}
          </p>
        </div>
        
        {feedback && (
          <div className="glass-card p-6 animate-in slide-in-from-bottom-4 duration-500 text-left">
            <h3 className="font-semibold text-white mb-4 text-lg border-b border-dark-700 pb-2">Score Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Pronunciation', score: feedback.pronunciation, color: '#22C55E' },
                { label: 'Fluency', score: feedback.fluency, color: '#38BDF8' },
                { label: 'Intonation', score: feedback.intonation, color: '#A78BFA' },
                { label: 'Stress', score: feedback.stress, color: '#F59E0B' },
              ].map((m) => (
                <div key={m.label} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50 hover:border-dark-600 transition-colors">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">{m.label}</p>
                  <p className="text-3xl font-bold" style={{ color: m.color }}>{m.score}%</p>
                  <div className="h-2 bg-dark-700 rounded-full mt-3 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${m.score}%`, backgroundColor: m.color }} /></div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Pronunciation Feedback</h4>
                <div className="p-5 bg-primary-500/10 border border-primary-500/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                  <p className="text-base text-white mb-3">"The <strong>wea</strong>ther is <span className="text-error line-through px-1 bg-error/20 rounded">boo-ti-ful</span> <span className="text-success font-bold px-1 bg-success/20 rounded">byoo-tuh-fl</span> to<strong>day</strong>."</p>
                  <p className="text-sm text-dark-300 flex items-start gap-2 bg-dark-900/50 p-3 rounded-lg"><span className="text-primary-400">💡</span> Put more stress on the first syllable of 'beautiful' and ensure the vowel sound is clear.</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Better Ways to Say It</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/30 transition-colors">
                    <span className="text-xs text-primary-400 font-bold block mb-2 uppercase tracking-wider">More Natural:</span>
                    <span className="text-base text-white font-medium">"It's absolutely gorgeous out today."</span>
                  </div>
                  <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-secondary-500/30 transition-colors">
                    <span className="text-xs text-secondary-400 font-bold block mb-2 uppercase tracking-wider">Advanced / IELTS Band 7+:</span>
                    <span className="text-base text-white font-medium">"The weather couldn't be more perfect if it tried."</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
