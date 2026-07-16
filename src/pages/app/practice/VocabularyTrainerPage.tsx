import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import SpeakerButton from '../../../components/audio/SpeakerButton';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { vocabularyService, type VocabularyItem } from '../../../services/vocabularyService';
import { displayLearningWord, getLanguageMeta, getMeaningForNativeLanguage } from '../../../utils/languageUtils';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';

type Tab = 'flashcard' | 'quiz' | 'fill' | 'match';
type Mastery = 'again' | 'hard' | 'good' | 'easy';

type MasteryRecord = { wordId: string; score: number; lastReviewed: number };

function readMastery(): Map<string, MasteryRecord> {
  try {
    const raw = localStorage.getItem('echlern_vocab_mastery');
    const items: MasteryRecord[] = raw ? JSON.parse(raw) : [];
    return new Map(items.map(item => [item.wordId, item]));
  } catch {
    return new Map();
  }
}

function saveMastery(map: Map<string, MasteryRecord>) {
  localStorage.setItem('echlern_vocab_mastery', JSON.stringify([...map.values()]));
}

function stableOptions(word: VocabularyItem, pool: VocabularyItem[], nativeLanguage: string) {
  const targetWord = displayLearningWord(word);
  const correct = getMeaningForNativeLanguage(word, nativeLanguage, targetWord);
  const others = pool
    .filter(item => item.id !== word.id)
    .map(item => getMeaningForNativeLanguage(item, nativeLanguage, targetWord))
    .filter(value => value && value !== correct)
    .slice(0, 12)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [correct, ...others].filter(Boolean).sort(() => Math.random() - 0.5);
}

export default function VocabularyTrainerPage() {
  const { t } = useTranslation();
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const addXP = useLearningStore(s => s.addXP);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('flashcard');
  const [levelFilter, setLevelFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [weakOnly, setWeakOnly] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerChoice, setAnswerChoice] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [fillChecked, setFillChecked] = useState(false);
  const [matchSelectedWord, setMatchSelectedWord] = useState<string | null>(null);
  const [matchSelectedMeaning, setMatchSelectedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mastery, setMastery] = useState(readMastery);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    vocabularyService.getVocabularyForLanguage(targetLanguage).then(data => {
      if (cancelled) return;
      setItems(data.filter(item => displayLearningWord(item) && getMeaningForNativeLanguage(item, nativeLanguage, displayLearningWord(item))));
      setLoading(false);
      setCardIndex(0);
      setQuestionIndex(0);
    }).catch(error => {
      console.error('Vocabulary load failed', error);
      if (!cancelled) {
        setItems([]);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [targetLanguage, nativeLanguage]);

  const topics = useMemo(() => ['all', ...Array.from(new Set(items.map(item => item.topic).filter(Boolean))).slice(0, 32)], [items]);
  const levels = ['all', 'A1-A2', 'B1-B2', 'C1-C2', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    let pool = items.filter(item => {
      const word = displayLearningWord(item).toLocaleLowerCase();
      const meaning = getMeaningForNativeLanguage(item, nativeLanguage, displayLearningWord(item)).toLocaleLowerCase();
      const matchesSearch = !query || word.includes(query) || meaning.includes(query);
      const matchesLevel = levelFilter === 'all' || item.level === levelFilter || String(item.level).includes(levelFilter);
      const matchesTopic = topicFilter === 'all' || item.topic === topicFilter;
      return matchesSearch && matchesLevel && matchesTopic;
    });
    if (weakOnly) {
      pool = pool.sort((a, b) => (mastery.get(a.id)?.score ?? 0) - (mastery.get(b.id)?.score ?? 0));
    }
    return pool;
  }, [items, nativeLanguage, search, levelFilter, topicFilter, weakOnly, mastery]);

  const current = filtered[cardIndex % Math.max(filtered.length, 1)];
  const currentQuizItem = filtered[questionIndex % Math.max(filtered.length, 1)];
  const answerOptions = useMemo(() => currentQuizItem ? stableOptions(currentQuizItem, filtered.length > 10 ? filtered : items, nativeLanguage) : [], [currentQuizItem, filtered, items, nativeLanguage]);
  const matchPairs = useMemo(() => filtered.slice(0, 5).map(item => ({ id: item.id, word: displayLearningWord(item), meaning: getMeaningForNativeLanguage(item, nativeLanguage, displayLearningWord(item)) })).filter(item => item.word && item.meaning), [filtered, nativeLanguage]);
  const targetMeta = getLanguageMeta(targetLanguage);

  const updateMastery = useCallback((item: VocabularyItem, rating: Mastery) => {
    const scores: Record<Mastery, number> = { again: 10, hard: 40, good: 70, easy: 100 };
    const next = new Map(mastery);
    next.set(item.id, { wordId: item.id, score: scores[rating], lastReviewed: Date.now() });
    setMastery(next);
    saveMastery(next);
    if (rating !== 'again') addXP(5, `Vocabulary: ${displayLearningWord(item)}`);
    toast(rating === 'again' ? t('vocabulary.review_weak') : `+5 XP`, rating === 'again' ? 'warning' : 'success');
    recordPracticeAttempt({ targetLanguage, nativeLanguage, skillType: 'vocabulary', activityId: item.id, activityTitle: displayLearningWord(item), score: rating === 'again' ? 0 : 1, total: 1, answers: [{ itemId: item.id, isCorrect: rating !== 'again', answer: rating, correctAnswer: 'good/easy' }], metadata: { source: 'vocabulary_flashcard', rating } }).catch(error => console.warn('Adaptive vocabulary save failed', error));
    setFlipped(false);
    setCardIndex(value => value + 1);
  }, [mastery, addXP, t]);

  const checkQuiz = (answer: string) => {
    if (!currentQuizItem) return;
    setAnswerChoice(answer);
    const correct = getMeaningForNativeLanguage(currentQuizItem, nativeLanguage, displayLearningWord(currentQuizItem));
    const isCorrect = answer === correct;
    if (isCorrect) {
      addXP(10, `Vocabulary quiz: ${displayLearningWord(currentQuizItem)}`);
      toast(t('vocabulary.correct_word_is', { word: displayLearningWord(currentQuizItem) }), 'success');
    } else {
      toast(t('vocabulary.incorrect_correct_is', { word: correct }), 'error');
    }
    recordPracticeAttempt({ targetLanguage, nativeLanguage, skillType: 'vocabulary', activityId: currentQuizItem.id, activityTitle: displayLearningWord(currentQuizItem), score: isCorrect ? 1 : 0, total: 1, answers: [{ itemId: currentQuizItem.id, isCorrect, answer, correctAnswer: correct }], metadata: { source: 'vocabulary_quiz' } }).catch(error => console.warn('Adaptive vocabulary quiz save failed', error));
  };

  const checkFill = () => {
    if (!currentQuizItem) return;
    setFillChecked(true);
    const correct = displayLearningWord(currentQuizItem).toLocaleLowerCase();
    const isCorrect = fillAnswer.trim().toLocaleLowerCase() === correct;
    if (isCorrect) {
      addXP(15, `Vocabulary spelling: ${correct}`);
      toast(t('vocabulary.correct_word_is', { word: displayLearningWord(currentQuizItem) }), 'success');
    } else {
      toast(t('vocabulary.incorrect_correct_is', { word: displayLearningWord(currentQuizItem) }), 'error');
    }
    recordPracticeAttempt({ targetLanguage, nativeLanguage, skillType: 'vocabulary', activityId: currentQuizItem.id, activityTitle: displayLearningWord(currentQuizItem), score: isCorrect ? 1 : 0, total: 1, answers: [{ itemId: currentQuizItem.id, isCorrect, answer: fillAnswer, correctAnswer: correct, typedExact: isCorrect }], metadata: { source: 'vocabulary_fill' } }).catch(error => console.warn('Adaptive vocabulary fill save failed', error));
  };

  const selectMatch = (side: 'word' | 'meaning', id: string) => {
    if (side === 'word') {
      if (matchSelectedMeaning) {
        if (matchSelectedMeaning === id) {
          setMatched(prev => Array.from(new Set([...prev, id])));
          recordPracticeAttempt({ targetLanguage, nativeLanguage, skillType: 'vocabulary', activityId: id, score: 1, total: 1, answers: [{ itemId: id, isCorrect: true, answer: 'match', correctAnswer: 'match' }], metadata: { source: 'vocabulary_match' } }).catch(error => console.warn('Adaptive vocabulary match save failed', error));
        }
        setMatchSelectedWord(null);
        setMatchSelectedMeaning(null);
      } else setMatchSelectedWord(id);
    } else {
      if (matchSelectedWord) {
        if (matchSelectedWord === id) {
          setMatched(prev => Array.from(new Set([...prev, id])));
          recordPracticeAttempt({ targetLanguage, nativeLanguage, skillType: 'vocabulary', activityId: id, score: 1, total: 1, answers: [{ itemId: id, isCorrect: true, answer: 'match', correctAnswer: 'match' }], metadata: { source: 'vocabulary_match' } }).catch(error => console.warn('Adaptive vocabulary match save failed', error));
        }
        setMatchSelectedWord(null);
        setMatchSelectedMeaning(null);
      } else setMatchSelectedMeaning(id);
    }
  };

  if (loading) {
    return <PageShell title={t('vocabulary.title')} description={t('vocabulary.loading')} icon={<Brain size={20} />}><div className="py-20 text-center text-dark-400">{t('vocabulary.loading')}</div></PageShell>;
  }

  if (items.length === 0) {
    return <PageShell title={t('vocabulary.title')} description={t('vocabulary.no_vocab')} icon={<Brain size={20} />}><div className="glass-card p-10 text-center text-dark-300">{t('vocabulary.no_vocab')}</div></PageShell>;
  }

  return (
    <PageShell title={t('vocabulary.title')} description={`${targetMeta.flag} ${targetMeta.nativeName} · ${filtered.length}/${items.length}`} icon={<Brain size={20} />}>
      <div className="flex flex-wrap gap-2 mb-4 border-b border-dark-700/50 pb-4">
        {(['flashcard', 'quiz', 'fill', 'match'] as Tab[]).map(key => (
          <button key={key} onClick={() => { setTab(key); setAnswerChoice(null); setFillChecked(false); }} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === key ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}>
            {key === 'flashcard' ? t('vocabulary.flashcards') : key === 'quiz' ? t('vocabulary.quiz') : key === 'fill' ? t('vocabulary.fill_blank') : t('vocabulary.match')}
          </button>
        ))}
        <button onClick={() => setWeakOnly(value => !value)} className={`px-3 py-2 rounded-xl text-sm ${weakOnly ? 'bg-red-500/20 text-red-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}>{t('vocabulary.review_weak')}</button>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 mb-6">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('vocabulary.search')} className="w-full rounded-xl bg-dark-900 border border-dark-700 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-primary-500" />
        </label>
        <select value={levelFilter} onChange={event => setLevelFilter(event.target.value)} className="rounded-xl bg-dark-900 border border-dark-700 px-3 py-2 text-sm text-white">
          {levels.map(level => <option key={level} value={level}>{level === 'all' ? t('vocabulary.all_levels') : level}</option>)}
        </select>
        <select value={topicFilter} onChange={event => setTopicFilter(event.target.value)} className="rounded-xl bg-dark-900 border border-dark-700 px-3 py-2 text-sm text-white">
          {topics.map(topic => <option key={topic} value={topic}>{topic === 'all' ? t('common.all', { defaultValue: 'All' }) : topic}</option>)}
        </select>
      </div>

      {tab === 'flashcard' && current && (
        <div className="max-w-lg mx-auto">
          <div className="text-center text-xs text-dark-500 mb-3">{cardIndex % filtered.length + 1} / {filtered.length}</div>
          <motion.div key={current.id} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-6 min-h-[300px] flex flex-col cursor-pointer" onClick={() => setFlipped(value => !value)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary-500/20 text-primary-400">{current.level}</span>
              <span className="text-xs text-dark-500">{current.partOfSpeech}</span>
            </div>
            <h2 className="text-3xl font-bold text-white text-center mt-4">{displayLearningWord(current)}</h2>
            {current.romanization && <p className="text-sm text-dark-500 text-center mt-1">{current.romanization}</p>}
            <div className="flex justify-center mt-3"><SpeakerButton word={displayLearningWord(current)} languageId={targetLanguage} size={22} /></div>
            {flipped ? (
              <div className="mt-5 pt-5 border-t border-dark-700 space-y-2">
                <p className="text-primary-400 font-semibold text-center">{getMeaningForNativeLanguage(current, nativeLanguage, displayLearningWord(current))}</p>
                <p className="text-sm text-dark-300 italic">“{current.example}”</p>
                <p className="text-xs text-dark-500">{current.exampleTranslation}</p>
                <p className="text-xs text-dark-500">{t('vocabulary.level')} {current.level} · {current.topic}</p>
              </div>
            ) : <p className="text-center text-dark-500 text-sm mt-auto pt-6">{t('vocabulary.tap_to_reveal')}</p>}
          </motion.div>
          {flipped && <div className="grid grid-cols-4 gap-2 mt-4">
            {(['again', 'hard', 'good', 'easy'] as Mastery[]).map(rating => <button key={rating} onClick={() => updateMastery(current, rating)} className="py-2 rounded-xl bg-dark-800 hover:bg-primary-500 text-dark-300 hover:text-white text-sm">{t(`vocabulary.mastery_${rating}`)}</button>)}
          </div>}
        </div>
      )}

      {tab === 'quiz' && currentQuizItem && (
        <div className="max-w-2xl mx-auto glass-card p-6">
          <p className="text-xs text-primary-400 uppercase font-semibold mb-2">{t('vocabulary.meaning_quiz')}</p>
          <div className="flex items-center gap-3 mb-6"><h3 className="text-xl font-bold text-white flex-1">{t('vocabulary.what_does_mean', { word: displayLearningWord(currentQuizItem) })}</h3><SpeakerButton word={displayLearningWord(currentQuizItem)} languageId={targetLanguage} /></div>
          <div className="space-y-3">
            {answerOptions.map(option => {
              const correct = getMeaningForNativeLanguage(currentQuizItem, nativeLanguage, displayLearningWord(currentQuizItem));
              const state = answerChoice ? option === correct ? 'correct' : option === answerChoice ? 'wrong' : 'dim' : 'idle';
              return <button key={option} disabled={Boolean(answerChoice)} onClick={() => checkQuiz(option)} className={`w-full p-4 rounded-xl border text-left ${state === 'correct' ? 'border-green-500 bg-green-500/10 text-green-400' : state === 'wrong' ? 'border-red-500 bg-red-500/10 text-red-400' : state === 'dim' ? 'border-dark-700 text-dark-500 opacity-60' : 'border-dark-700 text-dark-300 hover:border-primary-500'}`}>{option}</button>;
            })}
          </div>
          {answerChoice && <button onClick={() => { setQuestionIndex(v => v + 1); setAnswerChoice(null); }} className="mt-4 w-full py-3 bg-primary-500 rounded-xl font-bold text-white">{t('vocabulary.next_question')}</button>}
        </div>
      )}

      {tab === 'fill' && currentQuizItem && (
        <div className="max-w-xl mx-auto glass-card p-6">
          <p className="text-xs text-primary-400 uppercase font-semibold mb-2">{t('vocabulary.fill_instruction')}</p>
          <p className="text-dark-300 mb-4">{getMeaningForNativeLanguage(currentQuizItem, nativeLanguage, displayLearningWord(currentQuizItem))}</p>
          <input value={fillAnswer} onChange={event => setFillAnswer(event.target.value)} disabled={fillChecked} className="w-full rounded-xl bg-dark-900 border border-dark-700 px-4 py-3 text-white outline-none focus:border-primary-500" placeholder={t('lesson.placeholders.typeAnswer')} />
          {fillChecked && <p className="mt-3 text-sm text-dark-300">{t('lesson.feedback.correctAnswer')}: <span className="text-primary-400 font-semibold">{displayLearningWord(currentQuizItem)}</span></p>}
          <button onClick={fillChecked ? () => { setFillChecked(false); setFillAnswer(''); setQuestionIndex(v => v + 1); } : checkFill} className="mt-4 w-full py-3 bg-primary-500 rounded-xl font-bold text-white">{fillChecked ? t('vocabulary.next_question') : t('vocabulary.check')}</button>
        </div>
      )}

      {tab === 'match' && (
        <div className="max-w-4xl mx-auto glass-card p-6">
          <p className="text-xs text-primary-400 uppercase font-semibold mb-4">{t('vocabulary.match_instruction')}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">{matchPairs.map(pair => <button key={`w-${pair.id}`} disabled={matched.includes(pair.id)} onClick={() => selectMatch('word', pair.id)} className={`w-full p-3 rounded-xl border text-left ${matched.includes(pair.id) ? 'border-green-500/30 text-green-400 opacity-60' : matchSelectedWord === pair.id ? 'border-primary-500 text-primary-400' : 'border-dark-700 text-white'}`}>{pair.word}</button>)}</div>
            <div className="space-y-2">{matchPairs.map(pair => <button key={`m-${pair.id}`} disabled={matched.includes(pair.id)} onClick={() => selectMatch('meaning', pair.id)} className={`w-full p-3 rounded-xl border text-left ${matched.includes(pair.id) ? 'border-green-500/30 text-green-400 opacity-60' : matchSelectedMeaning === pair.id ? 'border-primary-500 text-primary-400' : 'border-dark-700 text-white'}`}>{pair.meaning}</button>)}</div>
          </div>
          {matched.length === matchPairs.length && matchPairs.length > 0 && <div className="mt-4 p-4 rounded-xl bg-green-500/10 text-green-400 text-center font-semibold">{t('vocabulary.great_job')}</div>}
        </div>
      )}
    </PageShell>
  );
}
