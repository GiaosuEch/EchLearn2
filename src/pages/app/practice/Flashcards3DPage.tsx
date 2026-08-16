import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Brain, Sparkles, Filter } from 'lucide-react';
import PageShell from '../../PageShell';
import SpeakerButton from '../../../components/audio/SpeakerButton';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { useAppStore } from '../../../stores/appStore';
import { vocabularyService, type VocabularyItem } from '../../../services/vocabularyService';
import { displayLearningWord, getLanguageMeta, getMeaningForNativeLanguage } from '../../../utils/languageUtils';
import { localDb } from '../../../lib/storage/localDatabase';
import { toast } from '../../../components/ui/Toast';
import { isA1BasicWord } from '../../../services/vocabularyEngine';
// import removed
import { calculateMasteryScore, calculateNewDifficulty, scheduleNextReview } from '../../../services/fsrsCalculator';

const LEVELS = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function Flashcards3DPage() {
  const [searchParams] = useSearchParams();
  const urlLang = searchParams?.get('lang') || searchParams?.get('targetLang');
  const appLanguage = useAppStore((s) => s.currentLanguage);
  const currentLanguage = urlLang || appLanguage || 'en';
  
  const nativeLanguage = useAppStore((s) => s.nativeLanguage) || 'vi';
  
  const [cards, setCards] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [fsrsData, setFsrsData] = useState<Record<string, any>>({});

  const langMeta = getLanguageMeta(currentLanguage);

  // Subscribe & Sync with TopBar currentLanguage & URL param changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsRevealed(false);

    vocabularyService.getVocabularyForLanguage(currentLanguage).then((items) => {
      if (isMounted) {
        setCards(items || []);
        const fsrsRecords = localDb.getTable<{ id: string; masteryScore: number; difficulty: number; consecutiveCorrect: number; nextReviewDate: string }>('fsrs_cards');
        const fsrsMap = fsrsRecords.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
        setFsrsData(fsrsMap);
        setMasteredCount(fsrsRecords.filter(r => r.masteryScore >= 80).length);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to load 3D flashcards for language:', currentLanguage, err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  // Extract unique topics from dataset
  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    cards.forEach((c) => {
      if (c.topic) topics.add(c.topic);
    });
    return Array.from(topics);
  }, [cards]);

  // Filter cards by selectedLevel & selectedTopic & FSRS schedule
  const filteredCards = useMemo(() => {
    const now = new Date();
    const result = cards.filter((c) => {
      const word = displayLearningWord(c);
      if (isA1BasicWord(word) && (selectedLevel === 'C1' || selectedLevel === 'C2' || selectedLevel === 'B2')) {
        return false;
      }
      const matchLevel = selectedLevel === 'ALL' || (c.level && c.level.toUpperCase() === selectedLevel);
      const matchTopic = selectedTopic === 'ALL' || c.topic === selectedTopic;
      return matchLevel && matchTopic;
    });

    // Sort: Due reviews first, then unlearned, then future reviews (for browsing)
    return result.sort((a, b) => {
      const idA = displayLearningWord(a);
      const idB = displayLearningWord(b);
      const fsrsA = fsrsData[idA];
      const fsrsB = fsrsData[idB];

      const isDueA = fsrsA && new Date(fsrsA.nextReviewDate) <= now;
      const isDueB = fsrsB && new Date(fsrsB.nextReviewDate) <= now;

      if (isDueA && !isDueB) return -1;
      if (!isDueA && isDueB) return 1;

      // Unlearned vs learned
      if (!fsrsA && fsrsB) return -1;
      if (fsrsA && !fsrsB) return 1;

      return 0;
    });
  }, [cards, selectedLevel, selectedTopic, fsrsData]);

  const currentCard = filteredCards[currentIndex % Math.max(filteredCards.length, 1)];

  const handleNextCard = (status: 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    const wordText = displayLearningWord(currentCard);
    const meaningText = currentCard.meaningVietnamese || getMeaningForNativeLanguage(currentCard, nativeLanguage, wordText);

    const prevData = fsrsData[wordText] || { masteryScore: 0, difficulty: 2.5, consecutiveCorrect: 0 };
    
    let isCorrect = status !== 'hard';
    let typedExact = status === 'easy';
    
    const newScore = calculateMasteryScore({
      currentScore: prevData.masteryScore,
      isCorrect,
      typedExact
    });
    
    const newDifficulty = calculateNewDifficulty(prevData.difficulty, isCorrect);
    const newConsecutive = isCorrect ? prevData.consecutiveCorrect + 1 : 0;
    
    const nextReviewDate = scheduleNextReview(newScore, !isCorrect, newDifficulty, newConsecutive, new Date());
    
    const newData = {
      id: wordText,
      masteryScore: newScore,
      difficulty: newDifficulty,
      consecutiveCorrect: newConsecutive,
      nextReviewDate
    };

    if (localDb.findById('fsrs_cards', wordText)) {
      localDb.update('fsrs_cards', wordText, newData);
    } else {
      localDb.insert('fsrs_cards', newData);
    }
    
    setFsrsData(prev => ({ ...prev, [wordText]: newData }));
    
    // Update mastered count locally for UI feedback
    if (newScore >= 80 && prevData.masteryScore < 80) {
      setMasteredCount(prev => prev + 1);
    }

    if (status === 'easy') {
      toast(`Nhớ tốt! Hẹn gặp lại "${wordText}" vào lần ôn tiếp theo. 🎉`, 'success');
    } else if (status === 'hard') {
      localDb.insert('mistake_notebook', {
        id: crypto.randomUUID(),
        userId: 'local_user',
        type: 'Vocabulary',
        mistake: wordText,
        correction: meaningText,
        notes: currentCard.example || 'Từ vựng cần luyện thêm.',
        createdAt: new Date().toISOString()
      });
      toast(`Đã lưu "${wordText}" vào Sổ Tay Lỗi Sai để ôn sát sao hơn!`, 'info');
    }

    setIsFlipped(false);
    setIsRevealed(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 200);
  };

  if (loading) {
    return (
      <PageShell title="Đấu Trường Flashcards 3D (Smart Flashcards Deck)" description="Hệ thống thẻ từ vựng 3D kết hợp lặp lại ngắt quãng & âm thanh bản ngữ" icon={<Brain size={20} />}>
        <div className="max-w-2xl mx-auto py-20 text-center text-slate-400 font-mono">
          <Sparkles className="animate-spin text-emerald-500 mx-auto mb-3" size={28} />
          <p>Đang tải bộ thẻ 3D cho {langMeta.flag} {langMeta.nativeName}...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Đấu Trường Flashcards 3D (Smart Flashcards Deck)" description={`${langMeta.flag} ${langMeta.nativeName} · ${filteredCards.length.toLocaleString()}/${cards.length.toLocaleString()}+ thẻ từ vựng & cụm từ`} icon={<Brain size={20} />}>
      <div className="max-w-2xl mx-auto space-y-6 font-mono">
        
        {/* Level & Topic Filter Controls */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-emerald-500" />
              <span>BỘ LỌC CẤP ĐỘ (CEFR):</span>
            </div>
            {availableTopics.length > 0 && (
              <select
                value={selectedTopic}
                onChange={(e) => { setSelectedTopic(e.target.value); setCurrentIndex(0); }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1 rounded-xl text-xs outline-none border border-slate-200 dark:border-slate-700"
              >
                <option value="ALL">Tất cả chủ đề ({availableTopics.length})</option>
                {availableTopics.map((top) => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => { setSelectedLevel(lvl); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl === 'ALL' ? 'TẤT CẢ' : lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            <span>NGÔN NGỮ: <strong className="text-emerald-600 dark:text-emerald-400 font-black mr-2">{langMeta.flag} {langMeta.nativeName}</strong></span>
            <span>THẺ: <strong className="text-slate-900 dark:text-white font-extrabold">{filteredCards.length > 0 ? currentIndex + 1 : 0} / {filteredCards.length}</strong></span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-black flex gap-3">
            <span>CẦN ÔN TẬP: {filteredCards.filter(c => {
              const f = fsrsData[displayLearningWord(c)];
              return !f || new Date(f.nextReviewDate) <= new Date();
            }).length}</span>
            <span>THÀNH THẠO: {masteredCount}</span>
          </span>
        </div>

        {(!currentCard || filteredCards.length === 0) ? (
          <div className="p-10 text-center text-slate-400 font-mono glass-card rounded-2xl">
            Không có thẻ từ vựng nào thuộc cấp độ <strong>{selectedLevel}</strong> / chủ đề <strong>{selectedTopic}</strong>.
          </div>
        ) : (
          <>
            {/* 3D Flip Card Container */}
            <div className="[perspective:1200px]">
              <motion.div
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-[320px] sm:h-[360px] cursor-pointer [transform-style:preserve-3d]"
              >
                {/* FRONT OF CARD */}
                <div className="absolute inset-0 w-full h-full rounded-3xl border-2 border-emerald-500/40 p-8 flex flex-col items-center justify-between text-center [backface-visibility:hidden] shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  <div className="w-full flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                      {currentCard.level || currentCard.partOfSpeech || 'VOCABULARY'}
                    </span>
                    <SpeakerButton word={displayLearningWord(currentCard)} languageId={currentLanguage} size={20} />
                  </div>

                  <div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans mb-3">
                      {displayLearningWord(currentCard)}
                    </h2>
                    {currentCard.romanization && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-500/20">
                        <CustomEmoji name="speaker-audio" size={14} />
                        <span>PHIÊN ÂM:</span>
                        <span className="italic">{currentCard.romanization}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-between w-full">
                    {fsrsData[displayLearningWord(currentCard)] ? (
                      <span className="text-slate-400 text-[10px]">
                        Điểm nhớ: {Math.round(fsrsData[displayLearningWord(currentCard)].masteryScore)}/100
                      </span>
                    ) : <span />}
                    <span className="animate-pulse">[ NHẤP VÀO ĐỂ XEM ĐÁP ÁN ]</span>
                  </div>
                </div>

                {/* BACK OF CARD */}
                <div className="absolute inset-0 w-full h-full rounded-3xl border-2 border-amber-500/40 p-8 flex flex-col items-center justify-between text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  <div className="w-full flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                      NGHĨA TIẾNG VIỆT & VÍ DỤ
                    </span>
                    <SpeakerButton word={currentCard.meaningVietnamese || getMeaningForNativeLanguage(currentCard, nativeLanguage, displayLearningWord(currentCard))} languageId="vi" size={20} />
                  </div>

                  <div className="space-y-2 relative">
                    {!isRevealed && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl p-4">
                        <span className="text-amber-600 dark:text-amber-400 font-black text-sm mb-2 flex items-center gap-1.5"><Brain size={16}/> Socratic Barrier</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 font-semibold px-4">Đừng học vẹt! Hãy bắt ép não bộ nhớ lại nghĩa của từ này trước khi xem.</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                        >
                          Chạm để mở khóa Đáp án
                        </button>
                      </div>
                    )}
                    <div className={`transition-all duration-500 ${!isRevealed ? 'opacity-20 blur-sm pointer-events-none select-none' : ''}`}>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                        {currentCard.meaningVietnamese || getMeaningForNativeLanguage(currentCard, nativeLanguage, displayLearningWord(currentCard))}
                      </h3>
                      {currentCard.example && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-sans bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed max-w-md mt-2">
                          <p className="italic font-semibold text-slate-800 dark:text-slate-200">"{currentCard.example}"</p>
                          {currentCard.exampleTranslation && (
                            <p className="text-emerald-600 dark:text-emerald-400 text-[11px] mt-1 flex items-start gap-1.5">
                              <CustomEmoji name="arrow-hint" size={13} className="mt-0.5" />
                              <span>{currentCard.exampleTranslation}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    [ NHẤP ĐỂ LẬT LẠI MẶT TRƯỚC ]
                  </span>
                </div>
              </motion.div>
            </div>

            {/* SRS Rating Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleNextCard('hard')}
                className="py-3 px-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" /> CẦN ÔN LẠI</span>
                <span className="text-[9px] opacity-75 font-normal">Lưu Sổ Tay Lỗi Sai</span>
              </button>

              <button
                onClick={() => handleNextCard('good')}
                className="py-3 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" /> TỐT</span>
                <span className="text-[9px] opacity-75 font-normal">Ôn Nhắc Nhở Trôi Chảy</span>
              </button>

              <button
                onClick={() => handleNextCard('easy')}
                className="py-3 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> THÀNH THẠO</span>
                <span className="text-[9px] opacity-75 font-normal">+1 Từ vựng Mastered</span>
              </button>
            </div>
          </>
        )}

      </div>
    </PageShell>
  );
}
