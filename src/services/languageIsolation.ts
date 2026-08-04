// `.ts` extension is required: these modules are also loaded directly by the
// node:test runner, which does not resolve extensionless ESM specifiers.
import { normalizeLanguage, type SupportedLang } from '../utils/languageUtils.ts';

/**
 * Strict per-language content isolation.
 *
 * The bug this closes: exercise builders used to top up a short pool with
 * whatever was nearest to hand — English words, Chinese characters, or a
 * hard-coded Vietnamese distractor list — so a Japanese lesson could show
 * `cat` / `猫` as an option in a Hiragana quiz. Padding across languages is
 * never acceptable: an under-filled deck must render
 * `LANGUAGE_CONTENT_UNAVAILABLE` instead.
 *
 * Two independent checks run, because neither alone is sufficient:
 *   1. the declared `language` field (cheap, but absent in some legacy rows)
 *   2. the actual script of the word (catches mislabelled rows)
 */

export const LANGUAGE_CONTENT_UNAVAILABLE = 'Đang cập nhật bài học';

export const LANGUAGE_CONTENT_UNAVAILABLE_DETAIL =
  'Bộ dữ liệu cho ngôn ngữ này đang được biên soạn. Chúng tôi không hiển thị từ vựng của ngôn ngữ khác để lấp chỗ trống.';

/** Minimum number of options a multiple-choice question must have. */
export const MIN_QUESTION_OPTIONS = 4;

/** Unicode ranges that must be PRESENT for a word to belong to a language. */
const REQUIRED_SCRIPT: Partial<Record<SupportedLang, RegExp>> = {
  ja: /[぀-ゟ゠-ヿ一-鿿ｦ-ﾟ]/, // kana or kanji
  zh: /[一-鿿㐀-䶿]/,                            // Han
  ko: /[가-힯ᄀ-ᇿ㄰-㆏]/,               // Hangul
  ru: /[Ѐ-ӿ]/,                                          // Cyrillic
  th: /[฀-๿]/,                                          // Thai
  ar: /[؀-ۿݐ-ݿ]/,                             // Arabic
};

/**
 * Ranges that must be ABSENT. Latin-script languages must not carry CJK /
 * Cyrillic / Thai / Arabic characters — that is the signature of a mixed row.
 */
const FOREIGN_SCRIPT =
  /[぀-ゟ゠-ヿ一-鿿가-힯Ѐ-ӿ฀-๿؀-ۿ]/;

const LATIN_SCRIPT_LANGUAGES: readonly SupportedLang[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'vi'];

/**
 * True when `word` is plausibly written in `language`.
 * Punctuation-only or empty strings are rejected.
 */
export function isScriptConsistent(word: string, language: string): boolean {
  const text = String(word || '').trim();
  if (!text) return false;

  const lang = normalizeLanguage(language);

  const required = REQUIRED_SCRIPT[lang];
  if (required) return required.test(text);

  if (LATIN_SCRIPT_LANGUAGES.includes(lang)) {
    if (FOREIGN_SCRIPT.test(text)) return false;
    // Must contain at least one letter, so `---` or `123` never counts.
    return /[a-zA-ZÀ-ÿĀ-žƀ-ɏ]/.test(text);
  }

  return true;
}

interface LanguageTaggedItem {
  language?: string;
  word?: string;
  nativeScript?: string;
  text?: string;
}

function primaryForm(item: LanguageTaggedItem): string {
  return String(item?.nativeScript || item?.word || item?.text || '').trim();
}

/**
 * True when `item` genuinely belongs to `language`.
 *
 * A row whose `language` disagrees with the requested code is rejected outright
 * — it is never re-tagged, because re-tagging is what let mixed data through.
 */
export function belongsToLanguage(item: LanguageTaggedItem | null | undefined, language: string): boolean {
  if (!item) return false;

  const target = normalizeLanguage(language);
  const declared = item.language ? normalizeLanguage(item.language) : null;

  if (declared && declared !== target) return false;

  return isScriptConsistent(primaryForm(item), target);
}

/**
 * Keeps only the items that belong to `language`. Nothing is substituted or
 * re-tagged; a language with no data yields an empty array so callers can show
 * `LANGUAGE_CONTENT_UNAVAILABLE`.
 */
export function filterByLanguage<T extends LanguageTaggedItem>(
  items: readonly T[] | null | undefined,
  language: string,
): T[] {
  if (!items || items.length === 0) return [];
  return items.filter((item) => belongsToLanguage(item, language));
}

export interface DistractorRequest {
  /** The correct answer that must be excluded from the distractors. */
  readonly answer: string;
  /**
   * Candidate answers drawn from the SAME language deck as the question.
   * Passing a cross-language pool here is the bug this API exists to prevent.
   */
  readonly pool: readonly string[];
  /** How many distractors are needed. Defaults to 3 (a 4-option question). */
  readonly count?: number;
}

export type DistractorResult =
  | { readonly ok: true; readonly distractors: string[] }
  | { readonly ok: false; readonly reason: 'insufficient-pool' };

function normalizeForCompare(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * Draws `count` distinct distractors from `pool`.
 *
 * Returns `ok: false` when the same-language pool cannot supply enough options.
 * Callers MUST surface `LANGUAGE_CONTENT_UNAVAILABLE` in that case instead of
 * borrowing options from another language.
 */
export function buildDistractors({ answer, pool, count = MIN_QUESTION_OPTIONS - 1 }: DistractorRequest): DistractorResult {
  const answerKey = normalizeForCompare(answer);
  const seen = new Set<string>([answerKey]);
  const candidates: string[] = [];

  for (const candidate of pool) {
    const text = String(candidate || '').trim();
    if (!text) continue;
    const key = normalizeForCompare(text);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(text);
  }

  if (candidates.length < count) return { ok: false, reason: 'insufficient-pool' };

  // Fisher-Yates on a copy: `sort(() => Math.random() - 0.5)` is biased and was
  // producing the same three options for long stretches.
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }

  return { ok: true, distractors: candidates.slice(0, count) };
}

/** Unbiased shuffle. Use instead of `[...items].sort(() => Math.random() - 0.5)`. */
export function shuffleFairly<T>(items: readonly T[]): T[] {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

export interface QuestionOptionsResult {
  readonly ok: boolean;
  readonly options: string[];
}

/** Builds a shuffled option list, or `ok: false` when the deck is too thin. */
export function buildQuestionOptions(answer: string, pool: readonly string[], optionCount = MIN_QUESTION_OPTIONS): QuestionOptionsResult {
  const result = buildDistractors({ answer, pool, count: optionCount - 1 });
  if (!result.ok) return { ok: false, options: [] };
  return { ok: true, options: shuffleFairly([answer, ...result.distractors]) };
}
