import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Brain, CheckCircle2, Headphones, Loader2, Route, Sparkles, Target, Sprout, Puzzle, Rocket, Trophy } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import SpeakerButton from '../../../components/audio/SpeakerButton';
import { useAuthStore } from '../../../stores/authStore';
import { useAppStore } from '../../../stores/appStore';
import { languages } from '../../../data/languages';
import { tx } from '../../../i18n/phase129Text';
import { t13, skillLabel } from '../../../i18n/phase13Text';
import { vocabularyService } from '../../../services/vocabularyService';
import { generateUniquePlacementTest, scorePlacementTest, type SelfAssessedLevel } from '../../../services/aiLearningEngine';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { personalizedLearningService } from '../../../services/personalizedLearningService';

const levelIconMap: Record<SelfAssessedLevel, any> = {
  none: <Sprout className="w-6 h-6 text-emerald-400" />,
  some: <Puzzle className="w-6 h-6 text-amber-400" />,
  known: <Rocket className="w-6 h-6 text-sky-400" />,
  fluent: <Trophy className="w-6 h-6 text-purple-400" />,
};

const levels: { id: SelfAssessedLevel; titleKey: any; descKey: any }[] = [
  { id: 'none', titleKey: 'levelNone', descKey: 'levelNoneDesc' },
  { id: 'some', titleKey: 'levelSome', descKey: 'levelSomeDesc' },
  { id: 'known', titleKey: 'levelKnown', descKey: 'levelKnownDesc' },
  { id: 'fluent', titleKey: 'levelFluent', descKey: 'levelFluentDesc' },
];

export default function AIOnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const targetLanguage = useAppStore((s) => s.currentLanguage);
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const [selectedLevel, setSelectedLevel] = useState<SelfAssessedLevel | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);
  const [recordId, setRecordId] = useState<string | undefined>();
  const [seed, setSeed] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const language = useMemo(() => languages.find((l) => l.id === targetLanguage), [targetLanguage]);

  useEffect(() => {
    if (!user) return;
    personalizedLearningService.getLatest(user.id, targetLanguage).then((latest) => {
      if (latest?.result) {
        setSelectedLevel(latest.selfAssessedLevel);
        setQuestions(latest.questions || []);
        setAnswers(latest.answers || {});
        setResult(latest.result);
        setRecordId(latest.id);
        setSeed(latest.testSeed);
      }
    });
  }, [user, targetLanguage]);

  const generateTest = async (level: SelfAssessedLevel) => {
    if (!user) return;
    setIsGenerating(true);
    setSelectedLevel(level);
    setAnswers({});
    setResult(null);
    try {
      const vocabulary = await vocabularyService.getVocabularyForLanguage(targetLanguage);
      const test = generateUniquePlacementTest({
        userId: user.id,
        targetLanguage,
        nativeLanguage,
        selfLevel: level,
        attemptId: `${Date.now()}`,
        vocabulary,
      });
      setQuestions(test.questions);
      setSeed(test.seed);
      const saved = await personalizedLearningService.save({
        userId: user.id,
        targetLanguage,
        nativeLanguage,
        selfAssessedLevel: level,
        testSeed: test.seed,
        questions: test.questions,
      });
      setRecordId(saved.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const submit = async () => {
    if (!user || !selectedLevel || questions.length === 0) return;
    const missing = questions.some((q) => !answers[q.id]);
    if (missing) {
      alert(tx(interfaceLanguage, 'answerRequired'));
      return;
    }
    const scored = scorePlacementTest(questions, answers, selectedLevel);
    setResult(scored);
    await personalizedLearningService.save({
      id: recordId,
      userId: user.id,
      targetLanguage,
      nativeLanguage,
      selfAssessedLevel: selectedLevel,
      testSeed: seed,
      questions,
      answers,
      result: scored,
      completedAt: new Date().toISOString(),
    });
    try {
      const { adaptiveLearningEngine } = await import('../../../services/adaptiveLearningEngine');
      await adaptiveLearningEngine.createInitialPathFromPlacement({
        userId: user.id,
        targetLanguage,
        nativeLanguage,
        placementScore: scored.score,
        estimatedLevel: scored.estimatedLevel,
        weakSkills: scored.weaknesses,
        strongSkills: scored.strengths,
        selfRatedLevel: selectedLevel,
      });
    } catch (error) {
      console.warn('Could not initialize adaptive learning path', error);
    }
  };

  const skip = async () => {
    if (!selectedLevel) return;
    const scored = scorePlacementTest(questions, {}, selectedLevel);
    scored.confidence = 45;
    scored.score = 0;
    setResult(scored);
    if (user) {
      try {
        const { adaptiveLearningEngine } = await import('../../../services/adaptiveLearningEngine');
        await adaptiveLearningEngine.createInitialPathFromPlacement({
          userId: user.id,
          targetLanguage,
          nativeLanguage,
          placementScore: scored.score,
          estimatedLevel: scored.estimatedLevel,
          weakSkills: scored.weaknesses,
          strongSkills: scored.strengths,
          selfRatedLevel: selectedLevel,
        });
      } catch (error) {
        console.warn('Could not initialize skipped adaptive path', error);
      }
    }
  };

  return (
    <PageShell title={tx(interfaceLanguage, 'aiOnboardingTitle')} description={tx(interfaceLanguage, 'aiOnboardingDesc')} icon={<Brain size={20} />}>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {!questions.length && !result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <Mascot expression="thinking" size={72} message={tx(interfaceLanguage, 'aiQuestion')} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{tx(interfaceLanguage, 'aiQuestion')}</h2>
                  <p className="text-sm text-dark-400">{tx(interfaceLanguage, 'uniqueNotice')}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {levels.map((level) => (
                  <button key={level.id} type="button" onClick={() => generateTest(level.id)} className="text-left p-4 rounded-2xl border border-dark-700 bg-dark-800 hover:border-primary-500/60 hover:bg-primary-500/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-700 shadow-sm shrink-0">
                        {levelIconMap[level.id]}
                      </div>
                      <span className="font-bold text-white">{tx(interfaceLanguage, level.titleKey)}</span>
                    </div>
                    <p className="text-sm text-dark-400 mt-2">{tx(interfaceLanguage, level.descKey)}</p>
                  </button>
                ))}
              </div>
              {isGenerating && <div className="flex items-center gap-2 text-primary-400 mt-4"><Loader2 className="animate-spin" size={18} /> {tx(interfaceLanguage, 'generateTest')}</div>}
            </motion.div>
          )}

          {questions.length > 0 && !result && (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Target size={20} /> {tx(interfaceLanguage, 'diagnosticTest')}</h2>
                  <p className="text-sm text-dark-400 mt-1">{tx(interfaceLanguage, 'uniqueNotice')}</p>
                </div>
                <button onClick={() => selectedLevel && generateTest(selectedLevel)} className="px-3 py-2 rounded-xl bg-dark-800 text-dark-300 hover:text-white text-sm">{tx(interfaceLanguage, 'retake')}</button>
              </div>

              {questions.map((q, index) => (
                <div key={q.id} className="p-4 rounded-2xl bg-dark-800/60 border border-dark-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-primary-400 uppercase tracking-wide">{index + 1} / {questions.length} · {q.skill}</p>
                      <h3 className="text-white font-semibold mt-1">{q.prompt || tx(interfaceLanguage, 'noQuestion')}</h3>
                    </div>
                    {q.type === 'listening' && <SpeakerButton word={q.targetText} languageId={targetLanguage} size={18} />}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((option: string) => (
                      <button key={option} type="button" onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))} className={`p-3 rounded-xl text-left border transition-all ${answers[q.id] === option ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-dark-700 bg-dark-900 text-dark-300 hover:border-dark-500'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={submit} className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold flex items-center justify-center gap-2"><Sparkles size={18} /> {tx(interfaceLanguage, 'submitTest')}</button>
                <button onClick={skip} className="px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-300 font-semibold">{tx(interfaceLanguage, 'skipTest')}</button>
              </div>
            </div>
          )}

          {result && (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center"><CheckCircle2 size={28} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{tx(interfaceLanguage, 'roadmapTitle')}</h2>
                  <p className="text-sm text-dark-400 mt-1">{tx(interfaceLanguage, 'aiHonesty')}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-4 bg-dark-800 rounded-xl"><p className="text-xs text-dark-400">{tx(interfaceLanguage, 'estimatedLevel')}</p><p className="text-lg font-bold text-white">{result.estimatedLevel}</p></div>
                <div className="p-4 bg-dark-800 rounded-xl"><p className="text-xs text-dark-400">{t13(interfaceLanguage, 'score')}</p><p className="text-lg font-bold text-white">{result.correct}/{result.total}</p></div>
                <div className="p-4 bg-dark-800 rounded-xl"><p className="text-xs text-dark-400">{tx(interfaceLanguage, 'confidence')}</p><p className="text-lg font-bold text-white">{result.confidence}%</p></div>
              </div>
              <div className="space-y-3">
                {result.roadmap.map((week: any) => (
                  <div key={week.week} className="p-4 rounded-2xl bg-dark-800/70 border border-dark-700">
                    <p className="text-xs text-primary-400 font-bold">{tx(interfaceLanguage, 'week')} {week.week}</p>
                    <h3 className="text-white font-semibold">{week.title}</h3>
                    <p className="text-sm text-dark-300 mt-1">{week.goal}</p>
                    <div className="flex flex-wrap gap-2 mt-3">{week.focus.map((f: string) => <span key={f} className="px-2 py-1 rounded-lg bg-primary-500/10 text-primary-300 text-xs">{skillLabel(interfaceLanguage, f) !== f ? skillLabel(interfaceLanguage, f) : f}</span>)}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/app/roadmap" className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-center flex items-center justify-center gap-2"><Route size={18} /> {tx(interfaceLanguage, 'startRoadmap')}</Link>
                <Link to="/app/music" className="px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-200 font-semibold text-center flex items-center justify-center gap-2"><Headphones size={18} /> {tx(interfaceLanguage, 'musicTitle')}</Link>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-wider text-dark-500 font-bold">{tx(interfaceLanguage, 'routeRecommended')}</p>
            <h3 className="text-lg font-bold text-white mt-1">{language?.flag} {language?.name}</h3>
            <p className="text-sm text-dark-400 mt-2">{t13(interfaceLanguage, 'native')}: {nativeLanguage.toUpperCase()} · {t13(interfaceLanguage, 'target')}: {targetLanguage.toUpperCase()}</p>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-2">{t13(interfaceLanguage, 'aiQa')}</h3>
            <ul className="space-y-2 text-sm text-dark-300">
              <li className="flex items-start gap-2"><CustomEmoji name="verified-check" size={15} className="mt-0.5" /><span>{t13(interfaceLanguage, 'uniqueSeed')}: {seed ? seed.slice(0, 18) + '…' : t13(interfaceLanguage, 'pending')}</span></li>
              <li className="flex items-start gap-2"><CustomEmoji name="verified-check" size={15} className="mt-0.5" /><span>{t13(interfaceLanguage, 'perAccount')}</span></li>
              <li className="flex items-start gap-2"><CustomEmoji name="verified-check" size={15} className="mt-0.5" /><span>{t13(interfaceLanguage, 'localScoring')}</span></li>
              <li className="flex items-start gap-2"><CustomEmoji name="verified-check" size={15} className="mt-0.5" /><span>{t13(interfaceLanguage, 'roadmapUpdates')}</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
