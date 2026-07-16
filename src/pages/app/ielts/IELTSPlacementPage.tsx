import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, ArrowRight, Brain, Clock } from 'lucide-react';
import PageShell from '../../PageShell';
import { MascotIELTSFeedback } from '../../../components/mascot/MascotIELTSFeedback';
import { motion, AnimatePresence } from 'motion/react';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSPlacementPage() {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'intro' | 'section_intro' | 'test' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  const questions = [
    // Grammar
    { skill: 'Grammar', text: 'If I ___ known you were coming, I would have baked a cake.', options: ['have', 'had', 'has', 'having'], correct: 1 },
    { skill: 'Grammar', text: 'By this time next year, she ___ her degree.', options: ['will finish', 'has finished', 'will have finished', 'is finishing'], correct: 2 },
    { skill: 'Grammar', text: 'Hardly ___ the station when the train departed.', options: ['did I reach', 'I had reached', 'had I reached', 'I reached'], correct: 2 },
    { skill: 'Grammar', text: 'The project ___ by a team of experts next month.', options: ['will evaluate', 'evaluates', 'will be evaluated', 'is evaluated'], correct: 2 },
    { skill: 'Grammar', text: 'Not only ___ late, but she also forgot her presentation.', options: ['she was', 'was she', 'is she', 'did she'], correct: 1 },
    
    // Vocabulary
    { skill: 'Vocabulary', text: 'Which word is a synonym for "Ubiquitous"?', options: ['Rare', 'Everywhere', 'Costly', 'Hidden'], correct: 1 },
    { skill: 'Vocabulary', text: 'Select the most formal alternative to "look into":', options: ['Check out', 'Investigate', 'Find out', 'See about'], correct: 1 },
    { skill: 'Vocabulary', text: 'What is the antonym of "Mitigate"?', options: ['Alleviate', 'Aggravate', 'Appease', 'Diminish'], correct: 1 },
    { skill: 'Vocabulary', text: 'The new policy aims to ___ the negative impact on the environment.', options: ['exacerbate', 'mitigate', 'proliferate', 'instigate'], correct: 1 },
    { skill: 'Vocabulary', text: 'She has a ___ for languages and learns them quickly.', options: ['knack', 'drawback', 'hindrance', 'scarcity'], correct: 0 },
    
    // Reading
    { skill: 'Reading', text: 'Read the sentence: "The proliferation of smartphones has drastically altered social dynamics." What does "proliferation" mean here?', options: ['Decrease', 'Rapid increase', 'Cost', 'Design'], correct: 1 },
    { skill: 'Reading', text: 'Read: "Despite his initial reluctance, he eventually acquiesced to the proposal." What did he do?', options: ['Refused', 'Agreed', 'Argued', 'Ignored'], correct: 1 },
    { skill: 'Reading', text: 'Read: "The CEO\'s speech was largely empirical, relying on data rather than theory." "Empirical" means:', options: ['Theoretical', 'Emotional', 'Based on observation/data', 'Confusing'], correct: 2 },
    { skill: 'Reading', text: 'Read: "The city implemented stringent measures to curb pollution." "Stringent" means:', options: ['Lenient', 'Strict', 'Expensive', 'Ineffective'], correct: 1 },
    { skill: 'Reading', text: 'Read: "The argument was rendered moot by the recent discovery." "Moot" implies the argument is:', options: ['Important', 'Irrelevant', 'Fascinating', 'Controversial'], correct: 1 },
    
    // Listening (Simulated)
    { skill: 'Listening', text: '(Audio simulation) The speaker says: "I would have attended the meeting if I hadn\'t been stuck in traffic." Did the speaker attend?', options: ['Yes', 'No', 'Maybe', 'He is still in traffic'], correct: 1 },
    { skill: 'Listening', text: '(Audio simulation) The announcement says: "Flight 204 to London is delayed due to inclement weather." What is the reason?', options: ['Bad weather', 'Mechanical issue', 'Lost luggage', 'Crew strike'], correct: 0 },
    { skill: 'Listening', text: '(Audio simulation) The lecturer says: "The primary catalyst for the industrial revolution was the steam engine." What does "catalyst" mean here?', options: ['Result', 'Hindrance', 'Driving force', 'Opponent'], correct: 2 },
    { skill: 'Listening', text: '(Audio simulation) The guide says: "Please refrain from taking flash photography." What should you do?', options: ['Take photos with flash', 'Not use the flash', 'Buy a camera', 'Leave the museum'], correct: 1 },
    { skill: 'Listening', text: '(Audio simulation) The manager says: "We need to streamline our production process to cut costs." What does "streamline" mean?', options: ['Make more complex', 'Make more efficient', 'Stop entirely', 'Increase workers'], correct: 1 },
  ];

  const handleAnswer = async (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      const nextSkill = questions[currentQuestion + 1].skill;
      if (nextSkill !== questions[currentQuestion].skill) {
        setStage('section_intro');
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('results');
      const band = calculateBand(newAnswers);
      useLearningStore.getState().setIELTSBand(band);

      // Log placement result to Supabase
      const { useAuthStore } = await import('../../../stores/authStore');
      const { ieltsResultService } = await import('../../../services/ieltsResultService');
      const user = useAuthStore.getState().user;
      if (user) {
        await ieltsResultService.savePlacementResult(user.id, {
          listening: band - 0.5,
          reading: band,
          writing: band - 1.0,
          speaking: band + 0.5,
          estimated: band
        });
      }
    }
  };

  const calculateBand = (ans = answers) => {
    const correctCount = ans.filter((a, i) => a === questions[i].correct).length;
    // Map 0-20 to 0.0 - 9.0
    // Rough estimation:
    // 19-20 -> 8.5-9.0
    // 17-18 -> 8.0
    // 15-16 -> 7.5
    // 13-14 -> 7.0
    // 11-12 -> 6.5
    // 9-10 -> 6.0
    // 7-8 -> 5.5
    // 5-6 -> 5.0
    // < 5 -> 4.5
    if (correctCount >= 19) return 9.0;
    if (correctCount >= 17) return 8.0;
    if (correctCount >= 15) return 7.5;
    if (correctCount >= 13) return 7.0;
    if (correctCount >= 11) return 6.5;
    if (correctCount >= 9) return 6.0;
    if (correctCount >= 7) return 5.5;
    if (correctCount >= 5) return 5.0;
    return 4.5;
  };

  return (
    <PageShell title="IELTS Placement Test" description="Get an uncalibrated beta estimate from a local diagnostic quiz" icon={<Target size={20} />} backTo="/app/ielts">
      <div className="max-w-2xl mx-auto mt-4">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
              
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl mb-8 text-sm flex items-start gap-3 relative z-10 text-left">
                <span className="text-xl">⚠️</span>
                <p><strong>{t('ielts.disclaimer_bold') || 'Uncalibrated beta estimate — not an official IELTS score.'}</strong> {t('ielts.disclaimer_text') || 'This estimate uses simplified local heuristics and does not replace a certified examiner.'}</p>
              </div>
              
              <div className="flex justify-center mb-8 relative z-10">
                <div className="p-6 bg-dark-800 rounded-full border-4 border-dark-700 shadow-xl shadow-primary-500/10">
                  <Brain size={48} className="text-primary-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Local Diagnostic Quiz</h2>
              <p className="text-dark-300 mb-8 max-w-lg mx-auto relative z-10 leading-relaxed">
                Answer 20 fixed questions to receive an uncalibrated beta estimate for practice planning. This quiz does not use an AI model and is not an official IELTS assessment.
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-sm text-dark-400 font-bold relative z-10">
                <span className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-xl"><Clock size={16} className="text-primary-400" /> ~40 Mins</span>
                <span className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-xl"><Target size={16} className="text-secondary-400" /> 20 Questions</span>
              </div>

              <button 
                onClick={() => setStage('test')} 
                className="px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-1 relative z-10 flex items-center gap-2 mx-auto"
              >
                Start Placement Test <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {stage === 'section_intro' && (
            <motion.div 
              key="section_intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="glass-card p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="flex justify-center mb-6 relative z-10">
                <div className="p-5 bg-dark-800 rounded-full border-4 border-dark-700">
                  <Target size={40} className="text-secondary-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Next Section: {questions[currentQuestion].skill}</h2>
              <p className="text-dark-400 mb-8 max-w-sm mx-auto relative z-10">
                Get ready for questions testing your {questions[currentQuestion].skill.toLowerCase()}.
              </p>
              <button 
                onClick={() => setStage('test')} 
                className="px-8 py-3 bg-secondary-500 hover:bg-secondary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-secondary-500/20 relative z-10"
              >
                Continue <ArrowRight size={18} className="inline ml-1" />
              </button>
            </motion.div>
          )}

          {stage === 'test' && (
            <motion.div 
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold px-3 py-1 bg-dark-800 text-primary-400 rounded-full uppercase tracking-wider">{questions[currentQuestion].skill}</span>
                <span className="text-sm font-bold text-dark-300 bg-dark-800 px-3 py-1 rounded-lg">Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              <div className="w-full h-2.5 bg-dark-800 rounded-full mb-10 overflow-hidden border border-dark-700/50">
                <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}></div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-10 leading-relaxed">
                {questions[currentQuestion].text}
              </h3>
              <div className="space-y-4">
                {questions[currentQuestion].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-5 text-left bg-dark-800/50 border border-dark-700/50 rounded-2xl hover:bg-dark-700 hover:border-primary-500 transition-all text-dark-100 group flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-dark-900 text-dark-400 font-bold group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-lg">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MascotIELTSFeedback
                bandScore={calculateBand()}
                criteriaScores={[
                  { name: 'Listening', score: calculateBand() - 0.5 },
                  { name: 'Reading', score: calculateBand() },
                  { name: 'Writing', score: calculateBand() - 1.0 },
                  { name: 'Speaking', score: calculateBand() + 0.5 }
                ]}
                overallFeedback={`Based on your performance in the diagnostic test, you demonstrate a solid foundation. You handled the ${questions[1].skill} and ${questions[3].skill} questions well, showing good comprehension of formal academic structures.`}
                aiMascot="Ech Buri"
              />
              <div className="mt-8 text-center">
                <button 
                  onClick={async () => {
                    // navigate to IELTS dashboard
                    window.location.href = '/app/ielts';
                  }}
                  className="px-8 py-4 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-xl transition-all">
                  Generate My Study Plan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
