export interface LearningExerciseItem {
  question: string;
  correctAnswer: string;
  options: string[];
  example: string;
  exampleTranslation: string;
  explanation: string;
  cefr: string;
}

const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const PLACEHOLDER_RE = /(?:Example\s*\d+|English translation|Unrelated Topic|Từ vựng\s*\d+|lorem ipsum)/i;
const VIETNAMESE_MARKER_RE = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]|\b(tôi|bạn|một|và|là|đang|có|cho|với|học)\b/i;
const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export function validateLearningExerciseBatch(value: unknown): { valid: true; items: LearningExerciseItem[] } | { valid: false; errors: string[] } {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { items?: unknown }).items)) return { valid: false, errors: ['items must be an array'] };
  const items = (value as { items: unknown[] }).items;
  const errors: string[] = [];
  if (items.length !== 5) errors.push('items must contain exactly 5 exercises');
  const normalized: LearningExerciseItem[] = [];
  items.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') { errors.push(`items[${index}] must be an object`); return; }
    const item = raw as Partial<LearningExerciseItem>;
    for (const field of ['question', 'correctAnswer', 'example', 'exampleTranslation', 'explanation'] as const) {
      if (typeof item[field] !== 'string' || !item[field]?.trim()) errors.push(`items[${index}].${field} is required`);
      else if (EMOJI_RE.test(item[field])) errors.push(`items[${index}].${field} contains emoji`);
      else if (PLACEHOLDER_RE.test(item[field])) errors.push(`items[${index}].${field} contains placeholder copy`);
    }
    if (!Array.isArray(item.options) || item.options.length < 2 || !item.options.every(option => typeof option === 'string' && option.trim())) errors.push(`items[${index}].options must contain meaningful choices`);
    if (typeof item.cefr !== 'string' || !CEFR.has(item.cefr)) errors.push(`items[${index}].cefr must be a CEFR level`);
    if (typeof item.correctAnswer === 'string' && Array.isArray(item.options) && !item.options.includes(item.correctAnswer)) errors.push(`items[${index}].correctAnswer must be one of options`);
    if (typeof item.example === 'string' && typeof item.exampleTranslation === 'string' && item.exampleTranslation === item.example) errors.push(`items[${index}] needs a Vietnamese translation`);
    if (typeof item.example === 'string' && /^[\x00-\x7F]*$/.test(item.example) && typeof item.exampleTranslation === 'string' && !VIETNAMESE_MARKER_RE.test(item.exampleTranslation)) errors.push(`items[${index}].exampleTranslation must be natural Vietnamese`);
    normalized.push(item as LearningExerciseItem);
  });
  return errors.length ? { valid: false, errors } : { valid: true, items: normalized };
}

export function parseAndValidateLearningBatch(output: string) {
  try { return validateLearningExerciseBatch(JSON.parse(output)); }
  catch { return { valid: false as const, errors: ['generated output must be valid JSON'] }; }
}
