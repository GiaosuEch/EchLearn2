import { normalizeLanguage } from '../utils/languageUtils.ts';
import { grammarBank, type GrammarTopic } from './grammarBank.ts';

/**
 * Per-language grammar lookup with a placeholder guard.
 *
 * `GrammarTrainerPage` used to import `grammarBank` directly and render it no
 * matter which language the learner had selected — so a Japanese learner was
 * drilled on English "Verb To Be" with English answer options. That is the
 * language-mixing bug for the grammar surface.
 *
 * The per-language files under `curriculum/languages/<lang>/grammar.ts` are
 * auto-generated stubs whose bodies read "Rule 1: Always do this." Serving those
 * would swap one wrong answer for another, so they are rejected by
 * `isRealGrammarTopic` and the caller shows `LANGUAGE_CONTENT_UNAVAILABLE`.
 */

/** Signatures of the auto-generated stub content that must never reach a learner. */
const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /Grammar Topic \d+/i,
  /Rule \d+:\s*(Always do this|Never do that)/i,
  /Learn how to use structure \d+/i,
  /^Example \d+ [AB]$/i,
  /English translation [AB]/i,
];

function looksLikePlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * A topic is real when it has a human-written title and theory, and at least one
 * answerable question. Stub topics carry no `questions` array at all.
 */
export function isRealGrammarTopic(topic: unknown): topic is GrammarTopic {
  if (!topic || typeof topic !== 'object') return false;
  const candidate = topic as Partial<GrammarTopic> & { rules?: unknown };

  if (typeof candidate.id !== 'string' || !candidate.id) return false;
  if (typeof candidate.title !== 'string' || !candidate.title.trim()) return false;
  if (looksLikePlaceholder(candidate.title)) return false;
  if (looksLikePlaceholder(candidate.description)) return false;
  if (looksLikePlaceholder(candidate.theory)) return false;

  if (Array.isArray(candidate.rules) && candidate.rules.some(looksLikePlaceholder)) return false;

  if (!Array.isArray(candidate.questions) || candidate.questions.length === 0) return false;

  return candidate.questions.every((question) =>
    Boolean(question)
    && typeof question.question === 'string'
    && question.question.trim().length > 0
    && Array.isArray(question.options)
    && question.options.length >= 2
    && typeof question.correctAnswer === 'string'
    && question.options.includes(question.correctAnswer),
  );
}

/**
 * Grammar decks keyed by base language code.
 *
 * Only English currently has a hand-written bank. Adding a language here is a
 * content task: drop a real deck in and it becomes available with no UI change.
 */
const GRAMMAR_BY_LANGUAGE: Record<string, readonly unknown[]> = {
  en: grammarBank,
};

/**
 * Returns the verified grammar deck for `language`, or an empty array when the
 * language has no authored content. Never falls back to another language.
 */
export function getGrammarTopicsForLanguage(language: string): GrammarTopic[] {
  const code = normalizeLanguage(language);
  const deck = GRAMMAR_BY_LANGUAGE[code];
  if (!deck) return [];
  return deck.filter(isRealGrammarTopic);
}

/** True when the language has at least one authored, answerable grammar topic. */
export function hasGrammarContent(language: string): boolean {
  return getGrammarTopicsForLanguage(language).length > 0;
}

/** Language codes that currently ship a real grammar deck. */
export function languagesWithGrammarContent(): string[] {
  return Object.keys(GRAMMAR_BY_LANGUAGE).filter(hasGrammarContent);
}
