const GENERATED_DEFINITION_PATTERNS = [
  /^to perform the action of\b/i,
  /^the quality of being\b/i,
  /\bcommon (animal|food|item|word|action)\b/i,
  /^(i|you|he|she|we|they)\s+\w+.*\.$/i,
];

export function isSafeVocabularyMeaningCandidate(value: string): boolean {
  const text = value.trim();
  return Boolean(text) && !GENERATED_DEFINITION_PATTERNS.some((pattern) => pattern.test(text));
}
