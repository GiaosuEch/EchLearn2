import type { Exercise } from '../types/lesson';
import { vocabularyService } from '../services/vocabularyService';

type TFunction = (key: string, options?: Record<string, unknown>) => string;

type VocabLike = {
  id?: string;
  language?: string;
  level?: string;
  word?: string;
  nativeScript?: string;
  romanization?: string;
  partOfSpeech?: string;
  meaning?: string;
  meaningEnglish?: string;
  meaningVietnamese?: string;
  translation?: string;
  label?: string;
  text?: string;
  example?: string;
  exampleTranslation?: string;
  topic?: string;
};

const BAD_OPTION_PATTERNS = [
  /^meaning\s*:/i,
  /^nghĩa\s*:/i,
  /^missing meaning$/i,
  /^n\/?a$/i,
  /^random option/i,
  /^placeholder/i,
  /^word\s*\d+$/i,
  /^common word:/i,
  /^robert$/i,
];

const EN_TO_VI: Record<string, string> = {
  me: 'tôi', i: 'tôi', you: 'bạn', no: 'không', yes: 'có', and: 'và', is: 'là', am: 'là', are: 'là', have: 'có',
  fast: 'nhanh', quick: 'nhanh', slow: 'chậm', happy: 'vui', sad: 'buồn', big: 'lớn', small: 'nhỏ', good: 'tốt', bad: 'xấu',
  hello: 'xin chào', thanks: 'cảm ơn', 'thank you': 'cảm ơn', coffee: 'cà phê', water: 'nước', station: 'nhà ga', television: 'tivi / truyền hình', tv: 'tivi / truyền hình',
  speak: 'nói', speaks: 'nói', listen: 'nghe', read: 'đọc', write: 'viết', study: 'học', learn: 'học', music: 'âm nhạc', travel: 'du lịch',
  feeling: 'cảm giác', sensation: 'cảm giác', emotion: 'cảm xúc', different: 'khác', other: 'khác', synonym: 'đồng nghĩa', antonym: 'trái nghĩa',
};

const FALLBACK_DISTRACTORS: Record<string, string[]> = {
  vi: ['người bạn', 'một địa điểm', 'một hành động hằng ngày', 'một đồ vật', 'cảm xúc tích cực', 'thời gian trong ngày'],
  en: ['a friend', 'a place', 'a daily action', 'an object', 'a positive feeling', 'a time of day'],
  es: ['un amigo', 'un lugar', 'una acción diaria', 'un objeto', 'una emoción positiva', 'un momento del día'],
  de: ['ein Freund', 'ein Ort', 'eine tägliche Handlung', 'ein Gegenstand', 'ein positives Gefühl', 'eine Tageszeit'],
};

const VI_LITERACY_ITEMS: VocabLike[] = [
  { id: 'vi_lit_1', word: 'nhanh', meaningVietnamese: 'có tốc độ cao', example: 'Con tàu chạy rất nhanh.', partOfSpeech: 'adjective' },
  { id: 'vi_lit_2', word: 'cảm giác', meaningVietnamese: 'điều cơ thể hoặc tâm trí nhận thấy', example: 'Tôi có cảm giác vui khi nghe bài hát này.', partOfSpeech: 'noun' },
  { id: 'vi_lit_3', word: 'khác', meaningVietnamese: 'không giống nhau', example: 'Hai câu này có nghĩa khác nhau.', partOfSpeech: 'adjective' },
  { id: 'vi_lit_4', word: 'đồng nghĩa', meaningVietnamese: 'có nghĩa gần giống nhau', example: 'Nhanh và mau là hai từ gần đồng nghĩa.', partOfSpeech: 'noun' },
  { id: 'vi_lit_5', word: 'trái nghĩa', meaningVietnamese: 'có nghĩa đối lập nhau', example: 'Nhanh và chậm là hai từ trái nghĩa.', partOfSpeech: 'noun' },
  { id: 'vi_lit_6', word: 'lắng nghe', meaningVietnamese: 'nghe một cách chú ý', example: 'Bạn cần lắng nghe câu hỏi trước khi trả lời.', partOfSpeech: 'verb' },
  { id: 'vi_lit_7', word: 'giải thích', meaningVietnamese: 'làm cho người khác hiểu rõ', example: 'Cô giáo giải thích nghĩa của từ mới.', partOfSpeech: 'verb' },
  { id: 'vi_lit_8', word: 'lộ trình', meaningVietnamese: 'kế hoạch đi theo từng bước', example: 'Ứng dụng tạo lộ trình học riêng cho bạn.', partOfSpeech: 'noun' },
  { id: 'vi_lit_9', word: 'phát âm', meaningVietnamese: 'cách đọc một âm hoặc một từ', example: 'Phát âm đúng giúp người nghe hiểu bạn hơn.', partOfSpeech: 'noun' },
  { id: 'vi_lit_10', word: 'ngữ cảnh', meaningVietnamese: 'tình huống giúp hiểu nghĩa của từ', example: 'Hãy nhìn ngữ cảnh để đoán nghĩa.', partOfSpeech: 'noun' },
];

function hasVietnameseAccent(value: string) {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(value);
}

function looksEnglishWhenVi(value: string) {
  const v = value.trim();
  if (!v) return true;
  if (hasVietnameseAccent(v)) return false;
  if (/^[a-z]+(?:\s+[a-z]+){0,3}$/i.test(v) && !EN_TO_VI[v.toLowerCase()]) return true;
  return false;
}

function stripBadPrefixes(value: string): string {
  return value
    .replace(/^meaning\s*:\s*/i, '')
    .replace(/^nghĩa\s*:\s*/i, '')
    .replace(/^common word\s*:\s*/i, '')
    .trim();
}

function normalizeLanguage(lang?: string): string {
  return (lang || 'vi').split('-')[0].toLowerCase();
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return stripBadPrefixes(value.replace(/Missing Meaning|N\/A/gi, '').replace(/\s+/g, ' ').trim());
}

function isBadText(value: string, targetWord?: string, nativeLanguage?: string): boolean {
  const text = normalizeText(value);
  if (!text) return true;
  if (BAD_OPTION_PATTERNS.some((pattern) => pattern.test(text))) return true;
  if (targetWord && text.toLocaleLowerCase() === normalizeText(targetWord).toLocaleLowerCase()) return true;
  if (normalizeLanguage(nativeLanguage) === 'vi' && looksEnglishWhenVi(text)) return true;
  return false;
}

function displayWord(item: VocabLike): string {
  return normalizeText(item.nativeScript) || normalizeText(item.word) || normalizeText(item.text) || normalizeText(item.label);
}

function normalizeMeaningCandidate(candidate: unknown, nativeLanguage: string, targetWord?: string): string {
  let text = normalizeText(candidate);
  if (!text) return '';
  if (normalizeLanguage(nativeLanguage) === 'vi') {
    const mapped = EN_TO_VI[text.toLowerCase()];
    if (mapped) text = mapped;
  }
  return isBadText(text, targetWord, nativeLanguage) ? '' : text;
}

function meaningForNativeLanguage(item: VocabLike, nativeLanguage: string, targetWord?: string): string {
  const native = normalizeLanguage(nativeLanguage);
  const candidates = native === 'vi'
    ? [item.meaningVietnamese, item.translation, item.meaning, item.meaningEnglish, item.label, item.text]
    : native === 'en'
      ? [item.meaningEnglish, item.meaningVietnamese, item.translation, item.meaning, item.label, item.text]
      : [item.meaningVietnamese, item.meaningEnglish, item.translation, item.meaning, item.label, item.text];

  for (const candidate of candidates) {
    const text = normalizeMeaningCandidate(candidate, native, targetWord);
    if (text) return text;
  }
  return '';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function translated(t: TFunction, key: string, fallback: string, options: Record<string, unknown> = {}): string {
  const value = t(key, { ...options, defaultValue: fallback });
  return value && value !== key ? value : fallback;
}

function validVocabularyItems(items: VocabLike[], nativeLanguage: string): VocabLike[] {
  return items.filter((item) => {
    const word = displayWord(item);
    const meaning = meaningForNativeLanguage(item, nativeLanguage, word);
    return word && meaning && !isBadText(word) && !isBadText(meaning, word, nativeLanguage);
  });
}

function makeMeaningDistractors(
  vocabItems: VocabLike[],
  currentItem: VocabLike,
  nativeLanguage: string,
  correctMeaning: string,
): string[] {
  const targetWord = displayWord(currentItem);
  const candidateMeanings = vocabItems
    .filter((item) => displayWord(item) !== targetWord)
    .map((item) => meaningForNativeLanguage(item, nativeLanguage, targetWord))
    .filter((meaning) => meaning && meaning !== correctMeaning && !isBadText(meaning, targetWord, nativeLanguage));

  return unique(shuffle(candidateMeanings)).slice(0, 3);
}

function makeFallbackDistractors(nativeLanguage: string, correctMeaning: string, targetWord: string): string[] {
  const candidates = FALLBACK_DISTRACTORS[normalizeLanguage(nativeLanguage)] || FALLBACK_DISTRACTORS.vi;
  return candidates.filter((item) => item !== correctMeaning && !isBadText(item, targetWord, nativeLanguage)).slice(0, 3);
}

function safeOptions(vocabItems: VocabLike[], item: VocabLike, nativeLanguage: string, correctMeaning: string): string[] {
  const word = displayWord(item);
  const distractors = makeMeaningDistractors(vocabItems, item, nativeLanguage, correctMeaning);
  const fallbackDistractors = makeFallbackDistractors(nativeLanguage, correctMeaning, word);
  const options = unique([correctMeaning, ...distractors, ...fallbackDistractors])
    .filter((option) => !isBadText(option, word, nativeLanguage))
    .slice(0, 4);
  return options.includes(correctMeaning) ? shuffle(options) : shuffle([correctMeaning, ...options].slice(0, 4));
}

function blankExample(example: string, word: string) {
  const clean = normalizeText(example);
  if (!clean || !word) return '';
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const replaced = clean.replace(new RegExp(escaped, 'i'), '_____');
  return replaced !== clean ? replaced : `${clean} (${word} → _____)`;
}

function addIfValid(exercises: Exercise[], exercise: Exercise) {
  if (!exercise.question || !exercise.correctAnswer) return;
  if (exercise.options && exercise.options.length > 0 && !exercise.options.includes(String(exercise.correctAnswer))) return;
  exercises.push(exercise);
}

export async function generateExercisesForModule(
  moduleId: string,
  languageId: string,
  nativeLanguage: string,
  t: TFunction,
): Promise<Exercise[]> {
  const targetLanguage = normalizeLanguage(languageId);
  const answerLanguage = normalizeLanguage(nativeLanguage);
  const rawVocabItems = targetLanguage === 'vi' && answerLanguage === 'vi'
    ? VI_LITERACY_ITEMS
    : await vocabularyService.getVocabularyForLanguage(targetLanguage);
  const usableVocab = validVocabularyItems(rawVocabItems, answerLanguage);
  const exercises: Exercise[] = [];
  const sampledVocab = shuffle(usableVocab).slice(0, 8);

  sampledVocab.forEach((item, index) => {
    const word = displayWord(item);
    const correctMeaning = meaningForNativeLanguage(item, answerLanguage, word);
    if (!word || !correctMeaning) return;

    const options = safeOptions(usableVocab, item, answerLanguage, correctMeaning);
    if (options.length < 4 || !options.includes(correctMeaning)) return;

    addIfValid(exercises, {
      id: `ex_mc_${moduleId}_${index}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: translated(t, 'lesson.questions.whatIsMeaning', `What is the meaning of "${word}"?`, { word }),
      instruction: translated(t, 'lesson.instructions.chooseCorrectMeaning', 'Choose the correct meaning'),
      options,
      correctAnswer: correctMeaning,
      explanation: item.example
        ? translated(t, 'lesson.explanations.example', `Example: ${item.example}`, { example: item.example })
        : translated(t, 'lesson.explanations.correctMeaning', `The correct meaning is ${correctMeaning}`, { meaning: correctMeaning }),
      audioText: word,
      targetText: word,
    } as Exercise & { audioText: string; targetText: string });

    if (index < 6) {
      addIfValid(exercises, {
        id: `ex_listen_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'listen-choose',
        question: translated(t, 'lesson.questions.listenChooseMeaning', `Listen and choose the meaning of "${word}".`, { word }),
        instruction: translated(t, 'lesson.instructions.listenAndChoose', 'Listen carefully and choose the correct meaning'),
        options,
        correctAnswer: correctMeaning,
        explanation: translated(t, 'lesson.explanations.correctMeaning', `The correct meaning is ${correctMeaning}`, { meaning: correctMeaning }),
        audioText: word,
        targetText: word,
      } as Exercise & { audioText: string; targetText: string });
    }

    if (index < 5) {
      addIfValid(exercises, {
        id: `ex_ty_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'type-what-you-hear',
        question: translated(t, 'lesson.questions.typeWhatYouHear', 'Type what you hear'),
        instruction: translated(t, 'lesson.instructions.listenAndType', 'Listen carefully and type the word'),
        correctAnswer: word,
        explanation: translated(t, 'lesson.explanations.correctWordWas', `The correct word was "${word}".`, { word }),
        audioText: word,
        targetText: word,
      } as Exercise & { audioText: string; targetText: string });
    }

    const exampleBlank = blankExample(item.example || '', word);
    if (exampleBlank) {
      addIfValid(exercises, {
        id: `ex_blank_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'fill-blank',
        question: exampleBlank,
        instruction: translated(t, 'lesson.instructions.fillBlank', 'Fill in the missing word'),
        correctAnswer: word,
        explanation: translated(t, 'lesson.explanations.correctWordWas', `The correct word was "${word}".`, { word }),
        audioText: item.example || word,
        targetText: word,
      } as Exercise & { audioText: string; targetText: string });
    }
  });

  const pairChunks = [sampledVocab.slice(0, 4), sampledVocab.slice(4, 8)].filter((chunk) => chunk.length >= 3);
  pairChunks.forEach((chunk, chunkIndex) => {
    const pairs = chunk.map((item) => ({ left: displayWord(item), right: meaningForNativeLanguage(item, answerLanguage, displayWord(item)) }))
      .filter((pair) => pair.left && pair.right && !isBadText(pair.right, pair.left, answerLanguage));
    if (pairs.length >= 3) {
      exercises.push({
        id: `ex_match_${moduleId}_${chunkIndex}`,
        lessonId: moduleId,
        type: 'match-pairs',
        question: translated(t, 'lesson.questions.matchWords', 'Match each word with its meaning'),
        instruction: translated(t, 'lesson.instructions.selectPair', 'Select matching pairs'),
        pairs,
        correctAnswer: pairs.map((pair) => pair.left),
        explanation: translated(t, 'lesson.explanations.matchPairs', 'Each word is paired with its correct meaning.'),
      });
    }
  });

  sampledVocab.slice(0, 3).forEach((item, index) => {
    const word = displayWord(item);
    const meaning = meaningForNativeLanguage(item, answerLanguage, word);
    if (!word || !meaning) return;
    exercises.push({
      id: `ex_translate_${moduleId}_${index}`,
      lessonId: moduleId,
      type: 'translate',
      question: translated(t, 'lesson.questions.translateFromMeaning', `Write the target-language word for: ${meaning}`, { meaning }),
      instruction: translated(t, 'lesson.instructions.translateFromMeaning', 'Type the word in the language you are learning'),
      correctAnswer: word,
      explanation: translated(t, 'lesson.explanations.correctWordWas', `The correct word was "${word}".`, { word }),
      audioText: word,
      targetText: word,
    } as Exercise & { audioText: string; targetText: string });
  });

  if (targetLanguage === 'en') {
    try {
      const advancedData = await fetch('/data/english_advanced.json').then((response) => response.json());

      if (Array.isArray(advancedData?.grammarRules) && advancedData.grammarRules.length > 0) {
        const rule = advancedData.grammarRules[Math.floor(Math.random() * advancedData.grammarRules.length)];
        const correct = normalizeText(rule.example);
        const wrongOptions = [
          correct.replace('have', 'has').replace('was', 'were'),
          correct.replace('visited', 'visit').replace('written', 'wrote'),
          correct.replace('won', 'win'),
        ].filter((option) => option && option !== correct);

        exercises.push({
          id: `ex_gram_${moduleId}`,
          lessonId: moduleId,
          type: 'multiple-choice',
          question: translated(t, 'lesson.questions.grammarFocus', `Grammar focus: ${rule.topic}. Which sentence is correct?`, { topic: rule.topic }),
          instruction: normalizeText(rule.rule) || translated(t, 'lesson.instructions.chooseCorrectMeaning', 'Choose the correct meaning'),
          options: shuffle(unique([correct, ...wrongOptions]).slice(0, 4)),
          correctAnswer: correct,
          explanation: normalizeText(rule.structure) || correct,
        });
      }
    } catch (error) {
      console.warn('Could not load advanced English lesson content', error);
    }
  }

  if (exercises.length > 0) return exercises;

  return [
    {
      id: `fallback_${moduleId}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: translated(t, 'lesson.missing_data', 'This lesson is missing data.'),
      instruction: translated(t, 'lesson.choose_another', 'Please choose another lesson.'),
      options: [translated(t, 'common.back', 'Back')],
      correctAnswer: translated(t, 'common.back', 'Back'),
      explanation: translated(t, 'lesson.choose_another', 'Please choose another lesson.'),
    },
  ];
}
