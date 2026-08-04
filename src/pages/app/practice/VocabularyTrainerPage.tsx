import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import SpeakerButton from '../../../components/audio/SpeakerButton';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { vocabularyService, type VocabularyItem } from '../../../services/vocabularyService';
import { displayLearningWord, getLanguageMeta, getMeaningForNativeLanguage } from '../../../utils/languageUtils';
import { isA1BasicWord } from '../../../services/vocabularyEngine';
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

function stableSort<T>(items: T[], seed: string): T[] {
  return [...items].sort((a, b) => {
    const strA = JSON.stringify(a) + seed;
    const strB = JSON.stringify(b) + seed;
    let hashA = 0;
    let hashB = 0;
    for (let i = 0; i < strA.length; i++) hashA += strA.charCodeAt(i);
    for (let i = 0; i < strB.length; i++) hashB += strB.charCodeAt(i);
    return (hashA % 100) - (hashB % 100);
  });
}

function stableOptions(word: VocabularyItem, pool: VocabularyItem[], nativeLanguage: string) {
  const targetWord = displayLearningWord(word);
  const correct = getMeaningForNativeLanguage(word, nativeLanguage, targetWord);
  
  const rawCandidates = pool
    .filter(item => item.id !== word.id && displayLearningWord(item) !== targetWord)
    .map(item => getMeaningForNativeLanguage(item, nativeLanguage, displayLearningWord(item)))
    .filter(value => value && value !== correct);

  const uniqueCandidates = Array.from(new Set(rawCandidates));
  const selectedDistractors = stableSort(uniqueCandidates, word.id).slice(0, 3);

  const fallbackList = ['một người bạn', 'một địa điểm', 'một hành động', 'một cảm xúc', 'một thời điểm', 'một thói quen'];
  let fallbackIdx = 0;

  while (selectedDistractors.length < 3) {
    const fb = fallbackList[fallbackIdx % fallbackList.length];
    if (fb !== correct && !selectedDistractors.includes(fb)) {
      selectedDistractors.push(fb);
    }
    fallbackIdx++;
  }

  const allOptions = Array.from(new Set([correct, ...selectedDistractors].filter(Boolean)));
  return stableSort(allOptions, word.id + '_opt');
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
      if (isA1BasicWord(word) && (levelFilter === 'C1' || levelFilter === 'C2' || levelFilter === 'C1-C2' || levelFilter === 'B1-B2')) {
        return false;
      }
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
  const shuffledMatchMeanings = useMemo(() => {
    // Reverse or shift matchPairs so right column meanings are never aligned identically with left column
    if (matchPairs.length <= 1) return matchPairs;
    return [matchPairs[matchPairs.length - 1], ...matchPairs.slice(0, matchPairs.length - 1)];
  }, [matchPairs]);
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
    return <PageShell title={t('vocabulary.title')} description={t('vocabulary.loading')} icon={<Brain size={20} />}><div className="py-20 text-center text-slate-400">{t('vocabulary.loading')}</div></PageShell>;
  }

  const safeItems = items || [];
  const safeFiltered = filtered || [];

  if (safeItems.length === 0) {
    return <PageShell title={t('vocabulary.title')} description={t('vocabulary.no_vocab')} icon={<Brain size={20} />}><div className="p-10 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">{t('vocabulary.no_vocab')}</div></PageShell>;
  }

  return (
    <PageShell title={t('vocabulary.title')} description={`${targetMeta.flag} ${targetMeta.nativeName} · ${safeFiltered.length.toLocaleString()}/${safeItems.length.toLocaleString()}+ từ vựng & cụm từ giao tiếp thực tế`} icon={<Brain size={20} />}>
      <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {(['flashcard', 'quiz', 'fill', 'match'] as Tab[]).map(key => (
          <button key={key} onClick={() => { setTab(key); setAnswerChoice(null); setFillChecked(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === key ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {key === 'flashcard' ? t('vocabulary.flashcards') : key === 'quiz' ? t('vocabulary.quiz') : key === 'fill' ? t('vocabulary.fill_blank') : t('vocabulary.match')}
          </button>
        ))}
        <button onClick={() => setWeakOnly(value => !value)} className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${weakOnly ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{t('vocabulary.review_weak')}</button>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 mb-6">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('vocabulary.search')} className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400" />
        </label>
        <select value={levelFilter} onChange={event => setLevelFilter(event.target.value)} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white font-bold cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
          {levels.map(level => <option key={level} value={level}>{level === 'all' ? t('vocabulary.all_levels') : level}</option>)}
        </select>
        <select value={topicFilter} onChange={event => setTopicFilter(event.target.value)} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-white font-bold cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
          {topics.map(topic => <option key={topic} value={topic}>{topic === 'all' ? t('common.all', { defaultValue: 'All' }) : topic}</option>)}
        </select>
      </div>

      {tab === 'flashcard' && current && (
        <div className="max-w-lg mx-auto">
          <div className="text-center text-xs text-slate-400 font-bold mb-3">{cardIndex % filtered.length + 1} / {filtered.length.toLocaleString()}</div>
          <motion.div key={current.id} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 min-h-[320px] flex flex-col cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300" onClick={() => setFlipped(value => !value)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{current.level}</span>
              <span className="text-xs text-slate-400 font-mono font-bold uppercase">{current.partOfSpeech}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mt-3">{displayLearningWord(current)}</h2>
            {current.romanization && <p className="text-sm text-slate-500 dark:text-slate-400 font-mono text-center mt-1">[{current.romanization}]</p>}
            <div className="flex justify-center mt-3"><SpeakerButton word={displayLearningWord(current)} languageId={targetLanguage} size={22} /></div>
            {flipped ? (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-0.5">Nghĩa Tiếng Việt</span>
                  <p className="text-emerald-600 dark:text-emerald-400 font-black text-center text-xl">
                    {current.meaningVietnamese || getMeaningForNativeLanguage(current, nativeLanguage, displayLearningWord(current))}
                  </p>
                </div>
                
                {current.meaningEnglish && current.meaningEnglish !== (current.meaningVietnamese || getMeaningForNativeLanguage(current, nativeLanguage, displayLearningWord(current))) && (
                  <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="font-bold text-slate-400">Định nghĩa: </span>{current.meaningEnglish}
                  </div>
                )}

                {current.collocations && current.collocations.length > 0 && (
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-left space-y-1.5">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CustomEmoji name="sparkles-badge" size={13} />
                      Cụm từ liên quan (Phrases / Collocations)
                    </span>
                    <div className="space-y-1">
                      {current.collocations.slice(0, 3).map((col, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{col.phrase}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 italic text-[11px]">{col.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {current.example && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 italic">"{current.example}"</p>
                    {current.exampleTranslation && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                        <CustomEmoji name="arrow-hint" size={13} />
                        <span>{current.exampleTranslation}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Cấp độ: {current.level}</span>
                  <span>•</span>
                  <span>Chủ đề: {current.topic}</span>
                </div>
              </div>
            ) : <p className="text-center text-slate-400 text-sm mt-auto pt-6 font-medium">{t('vocabulary.tap_to_reveal')}</p>}
          </motion.div>
          {flipped && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {(['again', 'hard', 'good', 'easy'] as Mastery[]).map(rating => (
                <button key={rating} onClick={() => updateMastery(current, rating)} className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 text-slate-600 dark:text-slate-300 hover:text-white text-sm font-bold cursor-pointer transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500">{t(`vocabulary.mastery_${rating}`)}</button>
              ))}
            </div>
          )}

        </div>
      )}

      {tab === 'quiz' && currentQuizItem && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider mb-2">{t('vocabulary.meaning_quiz')}</p>
          <div className="flex items-center gap-3 mb-6"><h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">{t('vocabulary.what_does_mean', { word: displayLearningWord(currentQuizItem) })}</h3><SpeakerButton word={displayLearningWord(currentQuizItem)} languageId={targetLanguage} /></div>
          <div className="space-y-3">
            {answerOptions.map(option => {
              const correct = getMeaningForNativeLanguage(currentQuizItem, nativeLanguage, displayLearningWord(currentQuizItem));
              const state = answerChoice ? option === correct ? 'correct' : option === answerChoice ? 'wrong' : 'dim' : 'idle';
              return <button key={option} disabled={Boolean(answerChoice)} onClick={() => checkQuiz(option)} className={`w-full p-4 rounded-xl border text-left font-medium transition-all ${state === 'correct' ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : state === 'wrong' ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' : state === 'dim' ? 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:bg-emerald-500/5'}`}>{option}</button>;
            })}
          </div>
          {answerChoice && <button onClick={() => { setQuestionIndex(v => v + 1); setAnswerChoice(null); }} className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white transition-colors">{t('vocabulary.next_question')}</button>}
        </div>
      )}

      {tab === 'fill' && currentQuizItem && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider mb-2">{t('vocabulary.fill_instruction')}</p>
          <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">{getMeaningForNativeLanguage(currentQuizItem, nativeLanguage, displayLearningWord(currentQuizItem))}</p>
          <input value={fillAnswer} onChange={event => setFillAnswer(event.target.value)} disabled={fillChecked} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400" placeholder={t('lesson.placeholders.typeAnswer')} />
          {fillChecked && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('lesson.feedback.correctAnswer')}: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{displayLearningWord(currentQuizItem)}</span></p>}
          <button onClick={fillChecked ? () => { setFillChecked(false); setFillAnswer(''); setQuestionIndex(v => v + 1); } : checkFill} className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white transition-colors">{fillChecked ? t('vocabulary.next_question') : t('vocabulary.check')}</button>
        </div>
      )}

      {tab === 'match' && (
        <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider mb-4">{t('vocabulary.match_instruction')}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">{matchPairs.map(pair => <button key={`w-${pair.id}`} disabled={matched.includes(pair.id)} onClick={() => selectMatch('word', pair.id)} className={`w-full p-3 rounded-xl border text-left font-medium transition-all ${matched.includes(pair.id) ? 'border-green-500/30 text-green-600 dark:text-green-400 opacity-60 bg-green-500/5' : matchSelectedWord === pair.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-emerald-500/50'}`}>{pair.word}</button>)}</div>
            <div className="space-y-2">{shuffledMatchMeanings.map(pair => <button key={`m-${pair.id}`} disabled={matched.includes(pair.id)} onClick={() => selectMatch('meaning', pair.id)} className={`w-full p-3 rounded-xl border text-left font-medium transition-all ${matched.includes(pair.id) ? 'border-green-500/30 text-green-600 dark:text-green-400 opacity-60 bg-green-500/5' : matchSelectedMeaning === pair.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-emerald-500/50'}`}>{pair.meaning}</button>)}</div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
