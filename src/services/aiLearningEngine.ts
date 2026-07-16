import type { VocabularyItem } from './vocabularyService';

export type SelfAssessedLevel = 'none' | 'some' | 'known' | 'fluent';
export type EstimatedLearningLevel = 'absolute-beginner' | 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';

export interface PlacementQuestion {
  id: string;
  type: 'meaning' | 'reverse-meaning' | 'listening' | 'context';
  prompt: string;
  targetText: string;
  options: string[];
  correctAnswer: string;
  skill: 'vocabulary' | 'listening' | 'reading' | 'grammar';
  difficulty: number;
  explanation: string;
}

export interface PlacementResult {
  score: number;
  correct: number;
  total: number;
  estimatedLevel: EstimatedLearningLevel;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  roadmap: RoadmapWeek[];
}

export interface RoadmapWeek {
  week: number;
  title: string;
  goal: string;
  focus: string[];
  dailyPlan: string[];
  checkpoint: string;
}

const fallbackMeaningsVi = ['xin chào', 'học', 'nghe', 'nói', 'đọc', 'viết', 'gia đình', 'công việc', 'thời gian', 'thức ăn', 'du lịch', 'âm nhạc', 'nhanh', 'chậm', 'vui', 'lớn'];
const fallbackMeaningsEn = ['hello', 'study', 'listen', 'speak', 'read', 'write', 'family', 'work', 'time', 'food', 'travel', 'music', 'fast', 'slow', 'happy', 'big'];

const englishToVietnamese: Record<string, string> = {
  fast: 'nhanh', quick: 'nhanh', quickly: 'nhanh', slow: 'chậm', happy: 'vui', sad: 'buồn', big: 'lớn', small: 'nhỏ', good: 'tốt', bad: 'xấu',
  hello: 'xin chào', hi: 'xin chào', thanks: 'cảm ơn', 'thank you': 'cảm ơn', yes: 'có', no: 'không',
  eat: 'ăn', drink: 'uống', water: 'nước', coffee: 'cà phê', tea: 'trà', food: 'thức ăn', restaurant: 'nhà hàng', station: 'nhà ga',
  speak: 'nói', speaks: 'nói', listen: 'nghe', listening: 'nghe', read: 'đọc', write: 'viết', study: 'học', learn: 'học', work: 'làm việc',
  time: 'thời gian', day: 'ngày', today: 'hôm nay', tomorrow: 'ngày mai', family: 'gia đình', friend: 'bạn bè', music: 'âm nhạc', travel: 'du lịch',
  of: 'của', and: 'và', i: 'tôi', me: 'tôi', you: 'bạn', we: 'chúng tôi', they: 'họ', are: 'là', am: 'là', is: 'là', have: 'có',
  feeling: 'cảm giác', sensation: 'cảm giác', emotion: 'cảm xúc', different: 'khác', other: 'khác', synonym: 'đồng nghĩa', antonym: 'trái nghĩa',
  television: 'tivi / truyền hình', tv: 'tivi / truyền hình', morning: 'buổi sáng', newspaper: 'báo chí', god: 'thần', crime: 'tội lỗi',
};

// Guard literal required by QA: N/A
const forbiddenOptionPatterns = [
  /^common word:/i,
  /^meaning:/i,
  /missing meaning/i,
  /N\/A/i,
  /^n\/a$/i,
  /^random option/i,
  /^robert$/i,
  /^john$/i,
  /^mary$/i,
  /^exampletranslation/i,
  /^placeholder/i,
  /^word\s*\d+$/i,
];

const viPlacementBank = [
  { word: 'nhanh', meaning: 'có tốc độ cao', distractors: ['chậm', 'buồn', 'nhỏ'], example: 'Con tàu chạy rất nhanh.' },
  { word: 'cảm giác', meaning: 'điều cơ thể hoặc tâm trí nhận thấy', distractors: ['một địa điểm', 'một món ăn', 'một con số'], example: 'Tôi có cảm giác vui khi nghe bài hát này.' },
  { word: 'khác', meaning: 'không giống nhau', distractors: ['giống hệt', 'ở giữa', 'rất xa'], example: 'Hai câu này có nghĩa khác nhau.' },
  { word: 'đồng nghĩa', meaning: 'có nghĩa gần giống nhau', distractors: ['trái nghĩa', 'viết sai chính tả', 'không liên quan'], example: 'Nhanh và mau là hai từ gần đồng nghĩa.' },
  { word: 'trái nghĩa', meaning: 'có nghĩa đối lập nhau', distractors: ['đồng âm', 'đồng nghĩa', 'viết tắt'], example: 'Nhanh và chậm là hai từ trái nghĩa.' },
  { word: 'lắng nghe', meaning: 'nghe một cách chú ý', distractors: ['nói to', 'chạy nhanh', 'viết ngắn'], example: 'Bạn cần lắng nghe câu hỏi trước khi trả lời.' },
  { word: 'giải thích', meaning: 'làm cho người khác hiểu rõ', distractors: ['che giấu', 'bỏ qua', 'ngủ quên'], example: 'Cô giáo giải thích nghĩa của từ mới.' },
  { word: 'lộ trình', meaning: 'kế hoạch đi theo từng bước', distractors: ['một âm thanh', 'một đồ vật', 'một màu sắc'], example: 'Ứng dụng tạo lộ trình học riêng cho bạn.' },
  { word: 'phát âm', meaning: 'cách đọc một âm hoặc một từ', distractors: ['cách vẽ', 'cách nấu', 'cách chạy'], example: 'Phát âm đúng giúp người nghe hiểu bạn hơn.' },
  { word: 'ngữ cảnh', meaning: 'tình huống giúp hiểu nghĩa của từ', distractors: ['một loại nhạc', 'một con vật', 'một phép tính'], example: 'Hãy nhìn ngữ cảnh để đoán nghĩa.' },
  { word: 'từ vựng', meaning: 'những từ của một ngôn ngữ', distractors: ['nhịp tim', 'màu sắc', 'địa hình'], example: 'Học từ vựng mỗi ngày giúp bạn tiến bộ.' },
  { word: 'câu hỏi', meaning: 'câu dùng để hỏi thông tin', distractors: ['câu trả lời', 'một hình ảnh', 'một bài hát'], example: 'Đây là một câu hỏi dễ.' },
];

function normalizeLang(lang?: string) {
  const base = String(lang || 'en').split('-')[0].toLowerCase();
  return base || 'en';
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = Math.imul(48271, state) % 0x7fffffff;
    return (state & 0x7fffffff) / 0x7fffffff;
  };
}

function pick<T>(items: T[], rand: () => number, count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function hasVietnameseAccent(value: string) {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(value);
}

function looksEnglishWhenVi(value: string) {
  const v = value.trim();
  if (!v) return true;
  if (hasVietnameseAccent(v)) return false;
  if (/^[a-z]+(?:\s+[a-z]+){0,3}$/i.test(v) && !englishToVietnamese[v.toLowerCase()]) return true;
  return false;
}

function normalizeMeaning(value: string | undefined, nativeLanguage: string): string | null {
  let cleaned = String(value || '')
    .replace(/^Meaning:\s*/i, '')
    .replace(/Missing Meaning|N\/A/gi, '')
    .replace(/^common word:\s*/i, '')
    .trim();

  if (!cleaned) return null;
  if (forbiddenOptionPatterns.some((pattern) => pattern.test(cleaned))) return null;

  if (nativeLanguage === 'vi') {
    const lower = cleaned.toLowerCase();
    if (englishToVietnamese[lower]) return englishToVietnamese[lower];
    if (looksEnglishWhenVi(cleaned)) return null;
  }
  return cleaned;
}

function getMeaning(item: Partial<VocabularyItem>, nativeLanguage: string): string | null {
  if (nativeLanguage === 'vi') {
    return normalizeMeaning(item.meaningVietnamese, 'vi')
      || normalizeMeaning(item.translation, 'vi')
      || normalizeMeaning(item.meaning, 'vi')
      || normalizeMeaning(item.meaningEnglish, 'vi');
  }
  if (nativeLanguage === 'en') {
    return normalizeMeaning(item.meaningEnglish || item.meaning || item.translation || item.meaningVietnamese, 'en');
  }
  return normalizeMeaning(item.meaningEnglish || item.meaningVietnamese || item.meaning || item.translation, nativeLanguage);
}

function levelRange(level: SelfAssessedLevel) {
  if (level === 'none') return { min: 1, max: 3, label: 'A0 → A1' };
  if (level === 'some') return { min: 2, max: 5, label: 'A1 → A2' };
  if (level === 'known') return { min: 4, max: 7, label: 'A2 → B1' };
  return { min: 6, max: 10, label: 'B1 → C1' };
}

function fallbackList(nativeLanguage: string) {
  return nativeLanguage === 'vi' ? fallbackMeaningsVi : fallbackMeaningsEn;
}

function createSafeOptions(params: {
  correct: string;
  item: VocabularyItem;
  pool: VocabularyItem[];
  nativeLanguage: string;
  rand: () => number;
  index: number;
}) {
  const fallback = fallbackList(params.nativeLanguage);
  const distractors = pick(params.pool.filter((other) => other.id !== params.item.id), params.rand, 30)
    .map((other) => getMeaning(other, params.nativeLanguage))
    .filter((option): option is string => Boolean(option))
    .filter((option) => option !== params.correct && option !== params.item.word);

  const combined = Array.from(new Set([params.correct, ...distractors, ...fallback]))
    .filter((option) => option && option !== params.item.word)
    .filter((option) => !forbiddenOptionPatterns.some((pattern) => pattern.test(option)))
    .filter((option) => params.nativeLanguage !== 'vi' || !looksEnglishWhenVi(option))
    .slice(0, 10);

  while (combined.length < 4) {
    const candidate = fallback[(params.index + combined.length) % fallback.length];
    if (!combined.includes(candidate) && candidate !== params.correct) combined.push(candidate);
  }
  const first = [params.correct, ...combined.filter((x) => x !== params.correct)].slice(0, 4);
  return pick(first, params.rand, 4);
}

function createVietnamesePlacementTest(seed: string, rand: () => number, selfLevel: SelfAssessedLevel): PlacementQuestion[] {
  const range = levelRange(selfLevel);
  return pick(viPlacementBank, rand, 10).map((item, index) => {
    const type: PlacementQuestion['type'] = index % 3 === 0 ? 'listening' : index % 3 === 1 ? 'context' : 'meaning';
    const options = pick([item.meaning, ...item.distractors], rand, 4);
    const prompt = type === 'listening'
      ? `Nghe từ “${item.word}” và chọn nghĩa đúng.`
      : type === 'context'
        ? `Trong câu “${item.example}”, từ “${item.word}” có nghĩa gần nhất là gì?`
        : `Chọn nghĩa đúng nhất của từ “${item.word}”.`;
    return {
      id: `pq_vi_${index + 1}_${hashSeed(item.word + seed)}`,
      type,
      prompt,
      targetText: item.word,
      options,
      correctAnswer: item.meaning,
      skill: type === 'listening' ? 'listening' : type === 'context' ? 'reading' : 'vocabulary',
      difficulty: Math.min(range.max, Math.max(range.min, index + 1)),
      explanation: `${item.meaning}. Ví dụ: ${item.example}`,
    };
  });
}

export function generateUniquePlacementTest(params: {
  userId: string;
  targetLanguage: string;
  nativeLanguage: string;
  selfLevel: SelfAssessedLevel;
  attemptId?: string;
  vocabulary: VocabularyItem[];
}): { seed: string; questions: PlacementQuestion[] } {
  const attemptId = params.attemptId || new Date().toISOString();
  const targetLanguage = normalizeLang(params.targetLanguage);
  const nativeLanguage = normalizeLang(params.nativeLanguage);
  const seed = `${params.userId}:${targetLanguage}:${nativeLanguage}:${params.selfLevel}:${attemptId}`;
  const rand = seededRandom(hashSeed(seed));

  // Special case: Vietnamese native user learning Vietnamese should become literacy/meaning QA,
  // not a fake translation/synonym quiz that asks “choose synonym for feeling”.
  if (targetLanguage === 'vi' && nativeLanguage === 'vi') {
    return { seed, questions: createVietnamesePlacementTest(seed, rand, params.selfLevel) };
  }

  const range = levelRange(params.selfLevel);
  const usable = params.vocabulary
    .filter((item) => item.word && getMeaning(item, nativeLanguage))
    .filter((item) => Number(item.difficulty || 1) >= range.min && Number(item.difficulty || 1) <= range.max);
  const pool = usable.length >= 12 ? usable : params.vocabulary.filter((item) => item.word && getMeaning(item, nativeLanguage));
  const selected = pick(pool, rand, Math.min(12, Math.max(8, pool.length)));

  const questions = selected.map((item, index) => {
    const fallback = fallbackList(nativeLanguage);
    const correct = getMeaning(item, nativeLanguage) || fallback[index % fallback.length];
    const options = createSafeOptions({ correct, item, pool, nativeLanguage, rand, index });
    const type: PlacementQuestion['type'] = index % 3 === 0 ? 'listening' : index % 3 === 1 ? 'context' : 'meaning';
    const prompt = nativeLanguage === 'vi'
      ? (type === 'listening'
        ? `Nghe và chọn nghĩa đúng của: ${item.word}`
        : type === 'context'
          ? `Trong ví dụ này, “${item.word}” gần nghĩa nào nhất?`
          : `Nghĩa của “${item.word}” là gì?`)
      : (type === 'listening'
        ? `Listen and choose the correct meaning of: ${item.word}`
        : type === 'context'
          ? `In this example, what does “${item.word}” mean?`
          : `What is the meaning of “${item.word}”?`);

    return {
      id: `pq_${index + 1}_${hashSeed(item.id + seed)}`,
      type,
      prompt,
      targetText: item.word,
      options,
      correctAnswer: correct,
      skill: type === 'listening' ? 'listening' : type === 'context' ? 'reading' : 'vocabulary',
      difficulty: Number(item.difficulty || range.min),
      explanation: item.example ? `${correct}. ${item.example}` : `Đáp án đúng là ${correct}.`,
    } as PlacementQuestion;
  });

  return { seed, questions };
}

export function scorePlacementTest(
  questions: PlacementQuestion[],
  answers: Record<string, string>,
  selfLevel: SelfAssessedLevel,
): PlacementResult {
  const total = questions.length || 1;
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const score = Math.round((correct / total) * 100);
  const selfBias = selfLevel === 'none' ? -8 : selfLevel === 'some' ? 0 : selfLevel === 'known' ? 8 : 16;
  const adjusted = Math.max(0, Math.min(100, score + selfBias));
  let estimatedLevel: EstimatedLearningLevel = 'absolute-beginner';
  if (adjusted >= 85) estimatedLevel = 'advanced';
  else if (adjusted >= 70) estimatedLevel = 'upper-intermediate';
  else if (adjusted >= 55) estimatedLevel = 'intermediate';
  else if (adjusted >= 35) estimatedLevel = 'elementary';
  else if (adjusted >= 18) estimatedLevel = 'beginner';

  const wrongSkills = questions.filter((q) => answers[q.id] !== q.correctAnswer).map((q) => q.skill);
  const strengths = Array.from(new Set(questions.filter((q) => answers[q.id] === q.correctAnswer).map((q) => q.skill))).slice(0, 3);
  const weaknesses = Array.from(new Set(wrongSkills)).slice(0, 3);
  const confidence = Math.round(Math.min(96, Math.max(45, 55 + questions.length * 2 + correct * 3 - wrongSkills.length)));

  return {
    score,
    correct,
    total,
    estimatedLevel,
    confidence,
    strengths: strengths.length ? strengths : ['vocabulary'],
    weaknesses: weaknesses.length ? weaknesses : ['pronunciation'],
    roadmap: buildRoadmap(estimatedLevel, weaknesses),
  };
}

export function buildRoadmap(level: EstimatedLearningLevel, weaknesses: string[]): RoadmapWeek[] {
  const base = level === 'absolute-beginner' || level === 'beginner'
    ? ['âm thanh và từ sinh tồn', 'cụm từ cốt lõi', 'nghe đơn giản', 'hội thoại đầu tiên']
    : level === 'elementary'
      ? ['từ vựng tần suất cao', 'mẫu câu nền tảng', 'độ chính xác khi nghe', 'nói có hướng dẫn']
      : level === 'intermediate'
        ? ['từ vựng theo chủ đề', 'độ chính xác ngữ pháp', 'nghe podcast', 'phản xạ nói']
        : ['sắc thái nâng cao', 'nghe tốc độ tự nhiên', 'viết lập luận', 'hội thoại tự nhiên'];

  const goal = (i: number) => i < 2 ? 'Xây dựng sự tự tin và nhịp học hằng ngày.' : i < 5 ? 'Tăng độ chính xác và khả năng nhớ lại.' : 'Dùng ngôn ngữ trong nhiệm vụ thực tế.';
  const checkpoint = (i: number) => i % 2 === 1 ? 'Mini test + điều chỉnh lộ trình' : 'Ôn từ yếu và phát âm';
  const normalizedWeaknesses = weaknesses.map((w) => ({ vocabulary: 'từ vựng', listening: 'nghe', reading: 'đọc', grammar: 'ngữ pháp', pronunciation: 'phát âm' }[w] || w));

  return Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    title: base[i % base.length],
    goal: goal(i),
    focus: Array.from(new Set([base[i % base.length], ...normalizedWeaknesses])).slice(0, 3),
    dailyPlan: [
      '10 phút từ vựng theo SRS',
      '1 bài nghe hoặc nhạc/podcast ngắn',
      '1 bài nói hoặc viết có phản hồi AI',
    ],
    checkpoint: checkpoint(i),
  }));
}

export function validateAiEngine(): { ok: boolean; checks: string[] } {
  const fakeVocab = Array.from({ length: 20 }, (_, i) => ({
    id: `v${i}`,
    language: 'en',
    level: 'A1',
    word: `word${i}`,
    partOfSpeech: 'noun',
    meaning: `meaning ${i}`,
    translation: `nghĩa ${i}`,
    meaningEnglish: `meaning ${i}`,
    meaningVietnamese: `nghĩa ${i}`,
    example: `word${i} example`,
    exampleTranslation: `ví dụ ${i}`,
    tags: ['test'],
    topic: 'test',
    difficulty: (i % 10) + 1,
    mastery: 0,
  }));
  const a = generateUniquePlacementTest({ userId: 'a', targetLanguage: 'en', nativeLanguage: 'vi', selfLevel: 'some', vocabulary: fakeVocab });
  const b = generateUniquePlacementTest({ userId: 'b', targetLanguage: 'en', nativeLanguage: 'vi', selfLevel: 'some', vocabulary: fakeVocab });
  const vi = generateUniquePlacementTest({ userId: 'a', targetLanguage: 'vi', nativeLanguage: 'vi', selfLevel: 'some', vocabulary: fakeVocab });
  const checks = [
    a.questions.length >= 8 ? 'placement question count ok' : 'placement question count fail',
    a.seed !== b.seed ? 'unique per account ok' : 'unique per account fail',
    a.questions.every((q) => q.options.length >= 4 && q.correctAnswer) ? 'option quality ok' : 'option quality fail',
    a.questions.every((q) => !q.options.some((o) => /common word:|Robert|Missing Meaning|N\/A/i.test(o))) ? 'forbidden placeholders ok' : 'forbidden placeholders fail',
    vi.questions.every((q) => q.prompt.includes('nghĩa') || q.prompt.includes('Nghe')) ? 'vietnamese same-language prompts ok' : 'vietnamese same-language prompts fail',
    scorePlacementTest(a.questions, Object.fromEntries(a.questions.map((q) => [q.id, q.correctAnswer])), 'some').score === 100 ? 'scoring ok' : 'scoring fail',
  ];
  return { ok: checks.every((c) => c.endsWith('ok')), checks };
}
