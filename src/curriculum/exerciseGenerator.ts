import type { Exercise } from '../types/lesson';
import { vocabularyService } from '../services/vocabularyService.ts';
import { isSafeVocabularyMeaningCandidate } from './vocabularyQuality.ts';
import { getCuratedStarterVocabulary } from './curatedStarterVocabulary.ts';
import { generateStandardCourse } from './megaCurriculumGenerator.ts';
import { generateSituationalScenario } from './situationalGenerator.ts';
import { getGrammarTopicsForLanguage } from './grammarRegistry.ts';
import { getReadingPassagesForLanguage } from './readingLibrary.ts';

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
  // STRICT ONTOLOGY ENFORCEMENT
  // Any content matching these patterns is considered corrupted/placeholder data 
  // and will be instantly rejected by the generator.
  /^meaning\s*:/i,
  /^nghĩa\s*:/i,
  /^missing meaning$/i,
  /^n\/?a$/i,
  /^random option/i,
  /^placeholder/i,
  /^word\s*\d+$/i,
  /common (word|food|animal|item|action)/i,
  /thông thường/i,
  /thông dụng/i,
  /generic/i,
  /che đậy/i,
  /hành động giặt/i,
  /thực hiện hành động/i,
  /commun/i,
  /aliment/i,
  /objet/i,
  /gewöhnlich/i,
];

const EN_TO_VI: Record<string, string> = {
  dragonfly: 'con chuồn chuồn', butterfly: 'con bướm', bee: 'con ong', ant: 'con kiến', spider: 'con nhện',
  cat: 'con mèo', dog: 'con chó', lion: 'con sư tử', tiger: 'con hổ', elephant: 'con voi', bear: 'con gấu', bird: 'con chim', fish: 'con cá',
  apple: 'quả táo', banana: 'quả chuối', orange: 'quả cam', bread: 'bánh mì', water: 'nước uống', milk: 'sữa', coffee: 'cà phê', tea: 'trà',
  me: 'tôi', i: 'tôi', you: 'bạn', no: 'không', yes: 'có', and: 'và', is: 'là', am: 'là', are: 'là', have: 'có',
  fast: 'nhanh chóng', quick: 'nhanh', slow: 'chậm chạp', happy: 'vui vẻ', sad: 'buồn rầu', big: 'to lớn', small: 'nhỏ bé', good: 'tốt lành', bad: 'xấu xa',
  hello: 'xin chào', thanks: 'cảm ơn', 'thank you': 'cảm ơn', station: 'nhà ga', television: 'tivi', tv: 'tivi',
  speak: 'nói', speaks: 'nói', listen: 'nghe', read: 'đọc', write: 'viết', study: 'học tập', learn: 'học tập', music: 'âm nhạc', travel: 'du lịch',
  friend: 'bạn bè', place: 'địa điểm', time: 'thời gian', school: 'trường học', feeling: 'cảm giác', sensation: 'cảm giác', emotion: 'cảm xúc',
  drool: 'chảy nước miếng', run: 'chạy bộ', walk: 'đi bộ', fly: 'bay lượn', swim: 'bơi lội', jump: 'nhảy vọt', sleep: 'ngủ say', eat: 'ăn uống', drink: 'uống nước',
  flour: 'bột mì', 'wheat flour': 'bột mì', rice: 'gạo', noodles: 'mì', meat: 'thịt', pork: 'thịt lợn', beef: 'thịt bò', chicken: 'thịt gà',
  house: 'ngôi nhà', home: 'nhà', room: 'căn phòng', book: 'sách', pen: 'bút', car: 'xe ô tô', train: 'tàu hỏa', bus: 'xe buýt',
  cover: 'che phủ', wash: 'rửa / giặt', clean: 'dọn dẹp', open: 'mở', close: 'đóng', see: 'nhìn thấy', look: 'quan sát',
};

const FALLBACK_DISTRACTORS: Record<string, string[]> = {
  vi: ['Khái niệm', 'Hiện tượng', 'Trạng thái', 'Hành động', 'Đặc điểm', 'Sự việc'],
  en: ['Concept', 'Phenomenon', 'State', 'Action', 'Characteristic', 'Event'],
  es: ['Concepto', 'Fenómeno', 'Estado', 'Acción', 'Característica', 'Evento'],
  de: ['Konzept', 'Phänomen', 'Zustand', 'Aktion', 'Eigenschaft', 'Ereignis'],
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
  if (!isSafeVocabularyMeaningCandidate(text)) return true;
  if (BAD_OPTION_PATTERNS.some((pattern) => pattern.test(text))) return true;
  if (targetWord && text.toLocaleLowerCase() === normalizeText(targetWord).toLocaleLowerCase()) return true;
  
  // If native language is Vietnamese or English, reject foreign scripts (CJK, Cyrillic, Thai, Arabic) in native meanings!
  const native = normalizeLanguage(nativeLanguage);
  if (native === 'vi' || native === 'en') {
    const hasForeignScript = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af\u0e00-\u0e7f\u0600-\u06ff]/.test(text);
    if (hasForeignScript) return true;
  }

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
  
  if (native === 'vi' && item.romanization) {
    const mapped = EN_TO_VI[item.romanization.toLowerCase()];
    if (mapped) return mapped;
  }

  const candidates = native === 'vi'
    ? [item.meaningVietnamese, item.translation, item.romanization ? EN_TO_VI[item.romanization.toLowerCase()] : '', item.meaningEnglish, item.meaning, item.label, item.text]
    : native === 'en'
      ? [item.meaningEnglish, item.romanization, item.meaningVietnamese, item.translation, item.meaning, item.label, item.text]
      : [item.meaningVietnamese, item.meaningEnglish, item.translation, item.meaning, item.romanization, item.label, item.text];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const text = normalizeMeaningCandidate(candidate, native, targetWord);
    if (text) return text;
  }
  return '';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/**
 * Produces a stable, non-mutating order from the authored values. Assessment
 * content must not change answers or sampling merely because a learner reloads
 * the page, so this deliberately avoids random ordering.
 */
function stableHash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function orderDeterministically<T>(items: T[]): T[] {
  const hash = (value: string) => {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  };
  return items
    .map((item, index) => ({ item, index, hash: hash(`${String(item)}:${index}`) }))
    .sort((left, right) => left.hash - right.hash || left.index - right.index)
    .map(({ item }) => item);
}

function translated(t: TFunction, key: string, fallback: string, options: Record<string, unknown> = {}): string {
  const value = t(key, { ...options, defaultValue: fallback });
  return value && value !== key ? value : fallback;
}

function validVocabularyItems(items: VocabLike[], nativeLanguage: string): VocabLike[] {
  return items.filter((item) => {
    const word = displayWord(item);
    const meaning = meaningForNativeLanguage(item, nativeLanguage, word);
    return word && meaning;
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
    .filter((meaning) => meaning && meaning !== correctMeaning);

  return unique(orderDeterministically(candidateMeanings)).slice(0, 3);
}

function makeFallbackDistractors(nativeLanguage: string, correctMeaning: string): string[] {
  const candidates = FALLBACK_DISTRACTORS[normalizeLanguage(nativeLanguage)] || FALLBACK_DISTRACTORS.vi;
  return candidates.filter((item) => item !== correctMeaning).slice(0, 4);
}

function makeTargetWordDistractors(vocabItems: VocabLike[], currentItem: VocabLike, correctWord: string): string[] {
  const targetWord = displayWord(currentItem);
  const candidateWords = vocabItems
    .map((item) => displayWord(item))
    .filter((w) => w && w.toLowerCase() !== targetWord.toLowerCase() && w.toLowerCase() !== correctWord.toLowerCase() && !isBadText(w));

  return unique(orderDeterministically(candidateWords));
}

function safeTargetWordOptions(vocabItems: VocabLike[], item: VocabLike, correctWord: string): string[] {
  const distractors = makeTargetWordDistractors(vocabItems, item, correctWord);
  const options = unique([correctWord, ...distractors]).slice(0, 4);

  while (options.length < 4) {
    const fallbackWords = vocabItems.map(i => displayWord(i)).filter(w => w && !options.includes(w) && w.toLowerCase() !== correctWord.toLowerCase());
    if (fallbackWords.length > 0) {
      options.push(fallbackWords[0]);
    } else {
      break;
    }
  }

  return orderDeterministically(options);
}

function safeOptions(vocabItems: VocabLike[], item: VocabLike, nativeLanguage: string, correctMeaning: string): string[] {
  const targetWord = displayWord(item);
  const distractors = makeMeaningDistractors(vocabItems, item, nativeLanguage, correctMeaning)
    .filter(d => d && d.toLowerCase() !== targetWord.toLowerCase() && d.toLowerCase() !== correctMeaning.toLowerCase());
  const fallbackDistractors = makeFallbackDistractors(nativeLanguage, correctMeaning)
    .filter(f => f && f.toLowerCase() !== targetWord.toLowerCase() && f.toLowerCase() !== correctMeaning.toLowerCase());
  const options = unique([correctMeaning, ...distractors, ...fallbackDistractors])
    .filter(opt => opt && opt.toLowerCase() !== targetWord.toLowerCase() && !isBadText(opt))
    .slice(0, 4);

  while (options.length < 4) {
    const extra = FALLBACK_DISTRACTORS.vi.find((f) => !options.includes(f) && f.toLowerCase() !== correctMeaning.toLowerCase());
    if (extra) options.push(extra);
    else options.push(`Từ vựng ${options.length + 1}`);
  }

  return options.includes(correctMeaning) ? orderDeterministically(options) : orderDeterministically([correctMeaning, ...options.slice(0, 3)]);
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
  
  const rawAnswers = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer.map(a => String(a))
    : [String(exercise.correctAnswer)];
  
  if (exercise.options && exercise.options.length > 0) {
    const hasMatch = exercise.options.some(opt => 
      rawAnswers.some(ans => normalizeText(opt).toLowerCase() === normalizeText(ans).toLowerCase())
    );
    if (!hasMatch) {
      exercise.options[0] = rawAnswers[0];
    }
    exercise.options = Array.from(new Set(exercise.options)).slice(0, 4);
  }
  
  exercises.push(exercise);
}

export async function generateExercisesForModule(
  moduleId: string,
  languageId: string,
  nativeLanguage: string,
  t: TFunction,
  lesId?: string,
): Promise<Exercise[]> {
  const targetLanguage = normalizeLanguage(languageId);
  const answerLanguage = normalizeLanguage(nativeLanguage);
  const units = await generateStandardCourse(targetLanguage, 'Language');
  const curatedStarter = /_mod_1$/i.test(moduleId) ? getCuratedStarterVocabulary(targetLanguage) : [];
  let rawVocabItems: VocabLike[] = curatedStarter.length > 0
    ? curatedStarter
    : targetLanguage === 'vi' && answerLanguage === 'vi'
    ? VI_LITERACY_ITEMS
    : await vocabularyService.getVocabularyForLanguage(targetLanguage);

  const isIeltsOrAdvanced = moduleId.includes('ielts') || moduleId.includes('mod_4') || moduleId.includes('mod_5') || moduleId.includes('mod_6') || moduleId.includes('mod_7') || moduleId.includes('mod_8') || moduleId.includes('mod_9') || moduleId.includes('mod_10');
  if (isIeltsOrAdvanced && targetLanguage === 'en') {
    const academicFilter = rawVocabItems.filter(i => ['B2', 'C1', 'C2', 'mastery'].some(l => (i.level || '').includes(l)));
    if (academicFilter.length >= 4) {
      rawVocabItems = academicFilter;
    }
  }

  const usableVocab = validVocabularyItems(rawVocabItems, answerLanguage);
  const exercises: Exercise[] = [];
  const sampledVocab = orderDeterministically(usableVocab.length > 0 ? usableVocab : VI_LITERACY_ITEMS).slice(0, 8);

  // Extract daily lesson number from lesId (e.g. "fr_les_2" -> 2)
  let lessonNum = 1;
  if (lesId) {
    const match = lesId.match(/_les_(\d+)/);
    if (match) lessonNum = parseInt(match[1], 10);
  }

  // 1=Vocab, 2=Grammar, 3=Listening, 4=Speaking, 5=Reading, 6=Writing
  const skillCycle = ((lessonNum - 1) % 6) + 1;

  // Determine focus based on moduleId or lesId skill cycle
  const isGrammar = moduleId.includes('mod_2') || moduleId.includes('grammar') || (!moduleId.includes('mod_') && skillCycle === 2) || (lesId && skillCycle === 2);
  const isListening = moduleId.includes('mod_3') || moduleId.includes('listening') || (lesId && skillCycle === 3);
  const isSpeaking = moduleId.includes('mod_4') || moduleId.includes('speaking') || (lesId && skillCycle === 4);
  const isReading = moduleId.includes('mod_5') || moduleId.includes('reading') || (lesId && skillCycle === 5);
  const isWriting = moduleId.includes('mod_6') || moduleId.includes('writing') || (lesId && skillCycle === 6);

  // --- 0. ELON MUSK STANDARD: SITUATIONAL IMMERSION ---
  if (isIeltsOrAdvanced && (skillCycle === 1 || isGrammar)) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      // Honest generation: the exercise exists only when the vocabulary item
      // carries a real authored example containing the target word. Items
      // without genuine examples are skipped, never fabricated.
      const scenario = generateSituationalScenario(word, isGrammar ? 'grammar' : 'vocabulary', meaning, item.example);

      if (!scenario) return;

      const wordDistractors = safeTargetWordOptions(usableVocab, item, word)
        .filter((option) => option.toLowerCase() !== word.toLowerCase())
        .slice(0, 3);

      addIfValid(exercises, {
        id: `ex_situational_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'multiple-choice',
        question: `[SITUATIONAL IMMERSION] ${scenario.scenarioText}\n\n${scenario.questionText}`,
        instruction: `Role: ${scenario.persona} | Stakes: ${scenario.stakes}`,
        options: orderDeterministically([scenario.correctOption, ...wordDistractors]),
        correctAnswer: scenario.correctOption,
        explanation: `Câu gốc: "${item.example}" (${meaning})`,
        audioText: item.example,
        targetText: word,
      } as Exercise);
    });
    return exercises; // Early return, replacing standard generation for these cycles
  }

  // --- 1. GRAMMAR FOCUS ---
  if (isGrammar) {
    const grammarTopics = getGrammarTopicsForLanguage(targetLanguage);
    if (grammarTopics.length > 0) {
      const topicIndex = stableHash(`${moduleId}:grammar`) % grammarTopics.length;
      const topic = grammarTopics[topicIndex];

      topic.questions.forEach((gq, qIdx) => {
        addIfValid(exercises, {
          id: `ex_gram_q_${moduleId}_${qIdx}`,
          lessonId: moduleId,
          type: 'fill-blank',
          question: `[NGỮ PHÁP - ${topic.title}] ${gq.question}`,
          instruction: topic.theory ? topic.theory.slice(0, 200) : 'Chọn đáp án ngữ pháp đúng',
          options: orderDeterministically(gq.options),
          correctAnswer: Array.isArray(gq.correctAnswer) ? gq.correctAnswer[0] : gq.correctAnswer,
          explanation: gq.explanation,
        } as Exercise);
      });

      if (topic.examples && topic.examples.length > 0) {
        const ex = topic.examples[0];
        const words = ex.sentence.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 3) {
          addIfValid(exercises, {
            id: `ex_gram_arrange_${moduleId}`,
            lessonId: moduleId,
            type: 'arrange-sentence',
            question: `[SẮP XẾP CÂU] Sắp xếp các từ thành câu đúng ngữ pháp:`,
            instruction: topic.formula || `Quy tắc: ${topic.title}`,
            words: orderDeterministically(words),
            correctAnswer: ex.sentence,
            explanation: ex.explanation,
          } as Exercise);
        }
      }
    } else {
      sampledVocab.forEach((item, index) => {
        const word = displayWord(item);
        const meaning = meaningForNativeLanguage(item, answerLanguage, word);
        if (!word || !meaning) return;
        const exampleText = item.example || '';
        if (!exampleText) return;
        const blankSentence = exampleText.replace(new RegExp(word, 'gi'), '_____');
        const options = safeTargetWordOptions(usableVocab, item, word);
        addIfValid(exercises, {
          id: `ex_gram_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'multiple-choice',
          question: `[NGỮ PHÁP] Điền dạng đúng vào vị trí trống: "${blankSentence}"`,
          instruction: `Chọn đúng dạng ngữ pháp phù hợp cho câu (Nghĩa: ${meaning})`,
          options,
          correctAnswer: word,
          explanation: `Ví dụ hoàn chỉnh: "${exampleText}" (${meaning})`,
          audioText: exampleText,
          targetText: word,
        } as Exercise);
      });
    }
  }

  // --- 2. LISTENING FOCUS ---
  else if (isListening) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const options = safeOptions(usableVocab, item, answerLanguage, meaning);

      addIfValid(exercises, {
        id: `ex_lis_choose_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'listen-choose',
        question: `[LUYỆN NGHE] Nghe đoạn âm thanh bản xứ và chọn nghĩa đúng của "${word}":`,
        instruction: 'Nhấn biểu tượng loa để nghe phát âm bản xứ kỹ càng trước khi chọn',
        options,
        correctAnswer: meaning,
        explanation: `Từ bản xứ "${word}" có nghĩa là "${meaning}".`,
        audioText: word,
        targetText: word,
      } as Exercise);

      if (index < 5) {
        addIfValid(exercises, {
          id: `ex_lis_type_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'type-what-you-hear',
          question: `[NGHE VÀ GÕ] Nghe âm thanh và gõ lại chính xác từ bản xứ "${word}":`,
          instruction: 'Gõ đúng chính tả từng ký tự của từ bạn nghe được',
          correctAnswer: word,
          explanation: `Từ đúng là: "${word}" (${meaning}).`,
          audioText: word,
          targetText: word,
        } as Exercise);
      }
    });
  }

  // --- 3. SPEAKING FOCUS ---
  else if (isSpeaking) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const exampleSentence = item.example || word;
      const romanization = item.romanization || '';

      addIfValid(exercises, {
        id: `ex_spk_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'speak-compare',
        question: `[LUYỆN PHÁT ÂM] Nghe và lặp lại câu sau với phát âm chuẩn bản xứ:`,
        instruction: romanization
          ? `Phiên âm: /${romanization}/. Nghĩa: ${meaning}. Nghe kỹ rồi mô phỏng ngữ điệu.`
          : `Nghĩa: ${meaning}. Nghe kỹ rồi mô phỏng ngữ điệu bản xứ.`,
        correctAnswer: exampleSentence,
        explanation: `Phiên âm chuẩn: /${romanization || word}/. Nghĩa: ${meaning}`,
        audioText: exampleSentence,
        targetText: word,
      } as Exercise);

      if (index < 4) {
        const options = safeOptions(usableVocab, item, answerLanguage, meaning);
        addIfValid(exercises, {
          id: `ex_spk_mc_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'multiple-choice',
          question: `[KIỂM TRA PHÁT ÂM] Từ "${word}" (${romanization}) có nghĩa là gì?`,
          instruction: 'Chọn nghĩa đúng sau khi luyện phát âm',
          options,
          correctAnswer: meaning,
          explanation: `"${word}" nghĩa là "${meaning}".`,
          audioText: word,
          targetText: word,
        } as Exercise);
      }
    });
  }

  // --- 4. READING FOCUS ---
  else if (isReading) {
    const passages = getReadingPassagesForLanguage(targetLanguage);
    if (passages.length > 0) {
      const passageIndex = stableHash(`${moduleId}:reading`) % passages.length;
      const passage = passages[passageIndex];
      const excerpt = passage.content.length > 300 ? passage.content.slice(0, 300) + '...' : passage.content;

      passage.questions.forEach((pq, qIdx) => {
        addIfValid(exercises, {
          id: `ex_read_passage_${moduleId}_${qIdx}`,
          lessonId: moduleId,
          type: 'multiple-choice',
          question: `[ĐỌC HIỂU] "${passage.title}"\n\n${excerpt}\n\n${pq.question}`,
          instruction: 'Đọc kỹ đoạn văn và chọn đáp án đúng nhất',
          options: pq.options ? orderDeterministically(pq.options) : [],
          correctAnswer: pq.correctAnswer,
          explanation: pq.explanation,
        } as Exercise);
      });
    } else {
      sampledVocab.forEach((item, index) => {
        const word = displayWord(item);
        const meaning = meaningForNativeLanguage(item, answerLanguage, word);
        if (!word || !meaning) return;
        const exampleText = item.example || '';
        if (!exampleText) return;
        const options = safeOptions(usableVocab, item, answerLanguage, meaning);
        addIfValid(exercises, {
          id: `ex_read_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'multiple-choice',
          question: `[ĐỌC HIỂU] Đọc ngữ cảnh: "${exampleText}". Từ "${word}" trong ngữ cảnh trên mang nghĩa gì?`,
          instruction: 'Đọc kỹ câu và chọn nghĩa chính xác nhất',
          options,
          correctAnswer: meaning,
          explanation: `Trong ngữ cảnh: "${exampleText}", từ "${word}" nghĩa là "${meaning}".`,
          audioText: exampleText,
          targetText: word,
        } as Exercise);
      });
    }
  }

  // --- 5. WRITING FOCUS ---
  else if (isWriting) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const exampleText = item.example || '';
      if (!exampleText) return;
      const exampleBlank = blankExample(exampleText, word);

      addIfValid(exercises, {
        id: `ex_wrt_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'fill-blank',
        question: `[LUYỆN VIẾT] Hoàn thành câu bằng từ bản xứ đúng: "${exampleBlank}"`,
        instruction: `Gõ từ bản xứ "${word}" (Nghĩa: ${meaning}) vào ô trống`,
        correctAnswer: word,
        explanation: `Câu hoàn chỉnh: "${exampleText}" (${meaning})`,
        audioText: exampleText,
        targetText: word,
      } as Exercise);

      if (index === 0 && item.exampleTranslation) {
        addIfValid(exercises, {
          id: `ex_trans_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'translate',
          question: `[DỊCH CÂU] Dịch câu hoàn chỉnh sang tiếng Việt:\n"${exampleText}"`,
          instruction: 'Nhập bản dịch chuẩn xác của toàn bộ câu',
          correctAnswer: item.exampleTranslation,
          explanation: `Bản dịch đúng: "${item.exampleTranslation}"`,
          audioText: exampleText,
          targetText: word,
        } as Exercise);
      } else if (index === 0) {
        addIfValid(exercises, {
          id: `ex_trans_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'translate',
          question: `[DỊCH TỪ] Dịch từ bản xứ "${word}" sang tiếng Việt:`,
          instruction: 'Nhập bản dịch chuẩn xác',
          correctAnswer: meaning,
          explanation: `Bản dịch đúng: "${meaning}"`,
          audioText: word,
          targetText: word,
        } as Exercise);
      }
    });

    const writeModule = units.find((m: any) => m.id === moduleId);
    if (writeModule && lesId) {
      const writeLesson = writeModule.lessons?.find((l: any) => l.id === lesId);
      if (writeLesson?.metadata?.assessmentPrompt && writeLesson?.metadata?.modelAnswer) {
        addIfValid(exercises, {
          id: `ex_short_writing_${moduleId}`,
          lessonId: moduleId,
          type: 'short-writing' as any,
          question: `[LUYỆN VIẾT TỰ DO] ${writeLesson.metadata.assessmentPrompt}`,
          instruction: 'Viết câu trả lời của bạn. Hệ thống sẽ so sánh với câu trả lời mẫu.',
          correctAnswer: writeLesson.metadata.modelAnswer,
          explanation: `Câu trả lời mẫu: ${writeLesson.metadata.modelAnswer}`,
          options: [JSON.stringify({
            modelAnswer: writeLesson.metadata.modelAnswer,
            commonMistakes: writeLesson.metadata.commonMistakes,
            targetCollocations: writeLesson.metadata.targetCollocations,
          })],
        } as Exercise);
      }
    }
  }

  // --- 6. GENERAL VOCABULARY FOCUS (DEFAULT) ---
  else {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const options = safeOptions(usableVocab, item, answerLanguage, meaning);

      addIfValid(exercises, {
        id: `ex_mc_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'multiple-choice',
        question: translated(t, 'lesson.questions.whatIsMeaning', `Nghĩa của từ "${word}" là gì?`, { word }),
        instruction: translated(t, 'lesson.instructions.chooseCorrectMeaning', 'Chọn đáp án đúng nhất'),
        options,
        correctAnswer: meaning,
        explanation: item.example
          ? `Ví dụ: ${item.example} (${meaning})`
          : `Từ "${word}" có nghĩa là "${meaning}".`,
        audioText: word,
        targetText: word,
      } as Exercise);
    });

    const pairChunks = [sampledVocab.slice(0, 4), sampledVocab.slice(4, 8)].filter((chunk) => chunk.length >= 3);
    pairChunks.forEach((chunk, chunkIdx) => {
      const pairs = chunk.map((item) => ({
        left: displayWord(item),
        right: meaningForNativeLanguage(item, answerLanguage, displayWord(item)),
      })).filter((p) => p.left && p.right);

      // --- 6. ADD PEDAGOGICAL RESPONSE EXERCISE (IF DATA EXISTS) ---
  const module = units.find((m: any) => m.id === moduleId);
  if (module && lesId) {
    const lesson = module.lessons?.find((l: any) => l.id === lesId);
    if (lesson && lesson.metadata?.assessmentPrompt && lesson.metadata?.modelAnswer) {
        addIfValid(exercises, {
          id: `ex_pedagogical_${moduleId}_${lesId}`,
          lessonId: moduleId,
          type: 'pedagogical-response' as any, // Type override since we handle it dynamically
          question: `[PHẢN HỒI CÓ HƯỚNG DẪN] ${lesson.metadata.assessmentPrompt}`,
          instruction: 'Viết câu trả lời của bạn. Bộ so khớp cục bộ sẽ đối chiếu với mẫu câu, cụm từ mục tiêu và các lỗi đã biên soạn.',
          correctAnswer: lesson.metadata.modelAnswer,
          explanation: `Câu trả lời mẫu: ${lesson.metadata.modelAnswer}`,
          targetText: lesson.metadata.targetCollocations ? lesson.metadata.targetCollocations.join(', ') : '',
          // Store pedagogical metadata in 'options' as a serialized string for now to avoid changing Exercise type globally
          options: [JSON.stringify({ 
             modelAnswer: lesson.metadata.modelAnswer, 
             commonMistakes: lesson.metadata.commonMistakes,
             targetCollocations: lesson.metadata.targetCollocations
          })]
        } as Exercise);
      }
    }

      if (pairs.length >= 3) {
        addIfValid(exercises, {
          id: `ex_match_${moduleId}_${chunkIdx}`,
          lessonId: moduleId,
          type: 'match-pairs',
          question: translated(t, 'lesson.questions.matchPairs', 'Ghép từ vựng với nghĩa đúng'),
          instruction: translated(t, 'lesson.instructions.matchPairsInstruction', 'Nối mỗi từ bản xứ với nghĩa tương ứng'),
          pairs,
          correctAnswer: pairs.map((p) => `${p.left}:${p.right}`),
          explanation: translated(t, 'lesson.explanations.matchedAll', 'Xuất sắc! Bạn đã ghép thành công tất cả các cặp từ!'),
        } as Exercise);
      }
    });
  }

  return exercises.length > 0 ? exercises : generateFallbackExercises(moduleId, targetLanguage);
}

const LANGUAGE_FALLBACKS: Record<string, { word: string; meaning: string; word2: string; meaning2: string; word3: string; meaning3: string }> = {
  en: { word: 'hello', meaning: 'Xin chào', word2: 'water', meaning2: 'Nước uống', word3: 'book', meaning3: 'Sách' },
  fr: { word: 'bonjour', meaning: 'Xin chào', word2: 'eau', meaning2: 'Nước uống', word3: 'livre', meaning3: 'Sách' },
  de: { word: 'hallo', meaning: 'Xin chào', word2: 'Wasser', meaning2: 'Nước uống', word3: 'Buch', meaning3: 'Sách' },
  es: { word: 'hola', meaning: 'Xin chào', word2: 'agua', meaning2: 'Nước uống', word3: 'libro', meaning3: 'Sách' },
  it: { word: 'ciao', meaning: 'Xin chào', word2: 'acqua', meaning2: 'Nước uống', word3: 'libro', meaning3: 'Sách' },
  pt: { word: 'olá', meaning: 'Xin chào', word2: 'água', meaning2: 'Nước uống', word3: 'livro', meaning3: 'Sách' },
  ru: { word: 'привет', meaning: 'Xin chào', word2: 'вода', meaning2: 'Nước uống', word3: 'книга', meaning3: 'Sách' },
  ja: { word: '猫', meaning: 'Con mèo', word2: '犬', meaning2: 'Con chó', word3: '水', meaning3: 'Nước uống' },
  zh: { word: '你好', meaning: 'Xin chào', word2: '水', meaning2: 'Nước uống', word3: '书', meaning3: 'Sách' },
  ko: { word: '안녕하세요', meaning: 'Xin chào', word2: '물', meaning2: 'Nước uống', word3: '책', meaning3: 'Sách' },
  th: { word: 'สวัสดี', meaning: 'Xin chào', word2: 'น้ำ', meaning2: 'Nước uống', word3: 'หนังสือ', meaning3: 'Sách' },
  ar: { word: 'مرحبا', meaning: 'Xin chào', word2: 'ماء', meaning2: 'Nước uống', word3: 'كتاب', meaning3: 'Sách' },
  vi: { word: 'nhanh', meaning: 'Có tốc độ cao', word2: 'cảm giác', meaning2: 'Điều cơ thể nhận thấy', word3: 'lắng nghe', meaning3: 'Nghe một cách chú ý' },
};

function generateFallbackExercises(moduleId: string, targetLanguage: string): Exercise[] {
  const fb = LANGUAGE_FALLBACKS[targetLanguage] || LANGUAGE_FALLBACKS.en;
  if (!fb) return [];
  return [
    {
      id: `ex_fb_1_${moduleId}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: `Nghĩa của từ "${fb.word}" là gì?`,
      instruction: 'Chọn đáp án đúng nhất',
      options: [fb.meaning, fb.meaning2, fb.meaning3, 'Trạng thái'],
      correctAnswer: fb.meaning,
      explanation: `"${fb.word}" có nghĩa là "${fb.meaning}".`,
      audioText: fb.word,
      targetText: fb.word,
    } as Exercise,
    {
      id: `ex_fb_2_${moduleId}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: `Nghĩa của từ "${fb.word2}" là gì?`,
      instruction: 'Chọn đáp án đúng nhất',
      options: [fb.meaning2, fb.meaning, fb.meaning3, 'Sự việc'],
      correctAnswer: fb.meaning2,
      explanation: `"${fb.word2}" có nghĩa là "${fb.meaning2}".`,
      audioText: fb.word2,
      targetText: fb.word2,
    } as Exercise,
    {
      id: `ex_fb_3_${moduleId}`,
      lessonId: moduleId,
      type: 'listen-choose',
      question: `Nghe và chọn nghĩa của "${fb.word3}".`,
      instruction: 'Lắng nghe kỹ và chọn đáp án đúng',
      options: [fb.meaning3, fb.meaning, fb.meaning2, 'Đặc điểm'],
      correctAnswer: fb.meaning3,
      explanation: `"${fb.word3}" có nghĩa là "${fb.meaning3}".`,
      audioText: fb.word3,
      targetText: fb.word3,
    } as Exercise,
  ];
}
