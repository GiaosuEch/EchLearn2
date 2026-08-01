import type { Exercise } from '../types/lesson';
import { vocabularyService } from '../services/vocabularyService.ts';
import { isSafeVocabularyMeaningCandidate } from './vocabularyQuality.ts';
import { getCuratedStarterVocabulary } from './curatedStarterVocabulary.ts';

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
  /common food/i,
  /common animal/i,
  /common item/i,
  /common word/i,
  /common action/i,
  /perform the action/i,
  /thông thường/i,
  /thông dụng/i,
  /generic/i,
  /일반적인/i,
  /동물/i,
  /음식/i,
  /che đậy/i,
  /hành động giặt/i,
  /thực hiện hành động/i,
  /động vật thông thường/i,
  /thực vật thông thường/i,
  /commun/i,
  /aliment/i,
  /objet/i,
  /gewöhnlich/i,
  /un animal/i,
  /un objet/i,
  /ein tier/i,
  /ein gegenstand/i,
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
  vi: ['Con mèo', 'Con chó', 'Xin chào', 'Cảm ơn', 'Nhà ga', 'Nước uống', 'Học tập', 'Du lịch', 'Thời gian', 'Bạn bè', 'Trái cây', 'Trường học'],
  en: ['Cat', 'Dog', 'Hello', 'Thank you', 'Station', 'Water', 'Study', 'Travel', 'Time', 'Friend', 'Fruit', 'School'],
  es: ['Gato', 'Perro', 'Hola', 'Gracias', 'Estación', 'Agua', 'Estudiar', 'Viajar', 'Tiempo', 'Amigo', 'Fruta', 'Escuela'],
  de: ['Katze', 'Hund', 'Hallo', 'Danke', 'Bahnhof', 'Wasser', 'Lernen', 'Reisen', 'Zeit', 'Freund', 'Obst', 'Schule'],
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

  return unique(shuffle(candidateMeanings)).slice(0, 3);
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

  return unique(shuffle(candidateWords));
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

  return shuffle(options);
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

  return options.includes(correctMeaning) ? shuffle(options) : shuffle([correctMeaning, ...options.slice(0, 3)]);
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
  const sampledVocab = shuffle(usableVocab.length > 0 ? usableVocab : VI_LITERACY_ITEMS).slice(0, 8);

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

  // --- 1. GRAMMAR FOCUS ---
  if (isGrammar) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const exampleText = item.example || `Je dis "${word}".`;
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

      const options = safeOptions(usableVocab, item, answerLanguage, meaning);

      addIfValid(exercises, {
        id: `ex_spk_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'multiple-choice',
        question: `[LUYỆN PHÁT ÂM & NÓI] Ngữ điệu chuẩn bản xứ của "${word}" (${item.romanization || ''}):`,
        instruction: `Nghe phát âm chuẩn và chọn nghĩa tiếng Việt (Mô phỏng ngữ điệu bản xứ)`,
        options,
        correctAnswer: meaning,
        explanation: `Phiên âm chuẩn: /${item.romanization || word}/. Nghĩa: ${meaning}`,
        audioText: word,
        targetText: word,
      } as Exercise);
    });
  }

  // --- 4. READING FOCUS ---
  else if (isReading) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const exampleText = item.example || `Le mot "${word}" est quan trọng dans đoạn văn này.`;
      const options = safeOptions(usableVocab, item, answerLanguage, meaning);

      addIfValid(exercises, {
        id: `ex_read_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'multiple-choice',
        question: `[ĐỌC HIỂU ĐOẠN VĂN] Đọc ngữ cảnh: "${exampleText}". Từ "${word}" trong ngữ cảnh trên mang nghĩa gì?`,
        instruction: 'Đọc kỹ câu và chọn nghĩa chính xác nhất',
        options,
        correctAnswer: meaning,
        explanation: `Trong ngữ cảnh: "${exampleText}", từ "${word}" nghĩa là "${meaning}".`,
        audioText: exampleText,
        targetText: word,
      } as Exercise);
    });
  }

  // --- 5. WRITING FOCUS ---
  else if (isWriting) {
    sampledVocab.forEach((item, index) => {
      const word = displayWord(item);
      const meaning = meaningForNativeLanguage(item, answerLanguage, word);
      if (!word || !meaning) return;

      const exampleText = item.example || `Je dis "${word}".`;
      const exampleBlank = blankExample(exampleText, word);

      addIfValid(exercises, {
        id: `ex_wrt_${moduleId}_${index}`,
        lessonId: moduleId,
        type: 'fill-blank',
        question: `[LUYỆN VIẾT & GHÉP CÂU] Hoàn thành câu bằng từ bản xứ đúng: "${exampleBlank}"`,
        instruction: `Gõ từ bản xứ "${word}" (Nghĩa: ${meaning}) vào ô trống`,
        correctAnswer: word,
        explanation: `Câu hoàn chỉnh: "${exampleText}" (${meaning})`,
        audioText: exampleText,
        targetText: word,
      } as Exercise);

      if (index === 0) {
        addIfValid(exercises, {
          id: `ex_trans_${moduleId}_${index}`,
          lessonId: moduleId,
          type: 'translate',
          question: `[DỊCH CÂU CHUẨN] Dịch từ bản xứ "${word}" sang tiếng Việt:`,
          instruction: 'Nhập bản dịch chuẩn xác',
          correctAnswer: meaning,
          explanation: `Bản dịch đúng: "${meaning}"`,
          audioText: word,
          targetText: word,
        } as Exercise);
      }
    });
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

  return exercises.length > 0 ? exercises : generateFallbackExercises(moduleId);
}

function generateFallbackExercises(moduleId: string): Exercise[] {
  return [
    {
      id: `ex_fb_1_${moduleId}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: 'Nghĩa của từ "猫" (Neko) là gì?',
      instruction: 'Chọn đáp án đúng nhất',
      options: ['Con mèo', 'Con chó', 'Nước uống', 'Nhà ga'],
      correctAnswer: 'Con mèo',
      explanation: '猫 (Neko) nghĩa là con mèo trong tiếng Nhật.',
      audioText: '猫',
      targetText: '猫',
    } as Exercise,
    {
      id: `ex_fb_2_${moduleId}`,
      lessonId: moduleId,
      type: 'multiple-choice',
      question: 'Nghĩa của từ "犬" (Inu) là gì?',
      instruction: 'Chọn đáp án đúng nhất',
      options: ['Con chó', 'Con mèo', 'Xin chào', 'Học tập'],
      correctAnswer: 'Con chó',
      explanation: '犬 (Inu) nghĩa là con chó trong tiếng Nhật.',
      audioText: '犬',
      targetText: '犬',
    } as Exercise,
    {
      id: `ex_fb_3_${moduleId}`,
      lessonId: moduleId,
      type: 'listen-choose',
      question: 'Nghe và chọn nghĩa của "水" (Mizu).',
      instruction: 'Lắng nghe kỹ và chọn đáp án đúng',
      options: ['Nước uống', 'Cà phê', 'Trái cây', 'Tivi'],
      correctAnswer: 'Nước uống',
      explanation: '水 (Mizu) nghĩa là nước uống.',
      audioText: '水',
      targetText: '水',
    } as Exercise,
  ];
}
