import {
  tokenizeJapanese,
  type JapaneseDocumentNode,
} from '../../lib/nlp/japaneseTokenizer.ts';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type AssessmentConfidence = 'low' | 'medium' | 'high';

export interface Evidence {
  id: string;
  kind: 'token-alignment' | 'particle' | 'vowel-length';
  observed: string;
  expected?: string;
  start?: number;
  end?: number;
}

export interface Limitation {
  code: string;
  message: string;
}

export interface SkillFeedback {
  skillArea: 'grammar' | 'pronunciation' | 'writing';
  observation: string;
  nextStep: string;
  evidenceIds: string[];
}

export interface RubricCriterionResult {
  criterionId: 'jlpt-particles' | 'japanese-vowel-lengths' | 'token-accuracy';
  value: number;
  maxValue: 100;
  evidenceIds: string[];
}

export interface JapaneseAssessmentExtension {
  namespace: 'japanese-jlpt';
  level: JLPTLevel;
  score: number;
  maxScore: 100;
}

/** Generic assessment shape with a namespaced Japanese Product-Pack value. */
export interface AssessmentResult {
  method: 'deterministic-japanese-rubric';
  methodVersion: '1.0.0';
  rubricId: 'japanese-jlpt-foundations';
  rubricVersion: '1.0.0';
  status: 'completed' | 'abstained';
  criteria: RubricCriterionResult[];
  evidence: Evidence[];
  confidence: {
    level: AssessmentConfidence;
    method: 'deterministic-reference-alignment';
  };
  limitations: Limitation[];
  feedback: SkillFeedback[];
  trackValue?: JapaneseAssessmentExtension;
  abstentionReason?: string;
}

export interface JapaneseEvaluationInput {
  response: string;
  reference: string;
  level: JLPTLevel;
}

const PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'や', 'か', 'ね', 'よ',
  'から', 'まで', 'より', 'だけ', 'しか', 'ので', 'のに', 'って', 'ばかり',
]);

const LONG_VOWEL_PATTERN = /ー|[おこごそぞとのぼぽもよろを]う|[えけげせぜてでねへべぺめれ]い/gu;

interface AlignedValue {
  value: string;
  tokenIndex: number;
}

function particleValues(document: JapaneseDocumentNode): AlignedValue[] {
  return document.children.flatMap((token, tokenIndex) =>
    PARTICLES.has(token.normalized) ? [{ value: token.normalized, tokenIndex }] : [],
  );
}

function longVowelValues(document: JapaneseDocumentNode): AlignedValue[] {
  return document.children.flatMap((token, tokenIndex) =>
    Array.from(token.normalized.matchAll(LONG_VOWEL_PATTERN), (match) => ({
      value: match[0],
      tokenIndex,
    })),
  );
}

function longestCommonSubsequence<T>(left: readonly T[], right: readonly T[]): number {
  const previous = new Array<number>(right.length + 1).fill(0);

  for (const leftValue of left) {
    const current = new Array<number>(right.length + 1).fill(0);
    for (let index = 1; index <= right.length; index += 1) {
      current[index] = Object.is(leftValue, right[index - 1])
        ? previous[index - 1] + 1
        : Math.max(previous[index], current[index - 1]);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function sequenceScore(actual: readonly string[], expected: readonly string[]): number {
  if (actual.length === 0 && expected.length === 0) return 100;
  const denominator = Math.max(actual.length, expected.length);
  return Math.round((longestCommonSubsequence(actual, expected) / denominator) * 100);
}

function tokenAccuracy(actual: JapaneseDocumentNode, expected: JapaneseDocumentNode): number {
  return sequenceScore(
    actual.children.map((token) => token.normalized),
    expected.children.map((token) => token.normalized),
  );
}

function evidenceForSequence(
  kind: Evidence['kind'],
  actual: readonly AlignedValue[],
  expected: readonly AlignedValue[],
  document: JapaneseDocumentNode,
): Evidence[] {
  const length = Math.max(actual.length, expected.length);
  return Array.from({ length }, (_, index) => {
    const observed = actual[index];
    const target = expected[index];
    const token = observed ? document.children[observed.tokenIndex] : undefined;
    return {
      id: `${kind}-${index + 1}`,
      kind,
      observed: observed?.value ?? '∅',
      expected: target?.value ?? '∅',
      start: token?.start,
      end: token?.end,
    };
  });
}

function abstain(reason: string): AssessmentResult {
  return {
    method: 'deterministic-japanese-rubric',
    methodVersion: '1.0.0',
    rubricId: 'japanese-jlpt-foundations',
    rubricVersion: '1.0.0',
    status: 'abstained',
    criteria: [],
    evidence: [],
    confidence: { level: 'low', method: 'deterministic-reference-alignment' },
    limitations: [{
      code: 'reference-required',
      message: 'This rubric requires both a learner response and a reference answer.',
    }],
    feedback: [],
    abstentionReason: reason,
  };
}

/**
 * Evaluates a Japanese response against an authored reference answer.
 * The rubric is deterministic and product-pack-specific. It does not infer
 * intent, meaning, pitch accent, or spoken pronunciation from text.
 */
export function evaluateJapanese(input: JapaneseEvaluationInput): AssessmentResult {
  if (!input.response.trim()) return abstain('Learner response is empty.');
  if (!input.reference.trim()) return abstain('Reference answer is empty.');

  const actual = tokenizeJapanese(input.response);
  const expected = tokenizeJapanese(input.reference);
  const actualParticles = particleValues(actual);
  const expectedParticles = particleValues(expected);
  const actualLengths = longVowelValues(actual);
  const expectedLengths = longVowelValues(expected);

  const particleScore = sequenceScore(
    actualParticles.map(({ value }) => value),
    expectedParticles.map(({ value }) => value),
  );
  const vowelLengthScore = sequenceScore(
    actualLengths.map(({ value }) => value),
    expectedLengths.map(({ value }) => value),
  );
  const tokensScore = tokenAccuracy(actual, expected);
  const score = Math.round(particleScore * 0.4 + vowelLengthScore * 0.25 + tokensScore * 0.35);

  const particleEvidence = evidenceForSequence(
    'particle', actualParticles, expectedParticles, actual,
  );
  const vowelEvidence = evidenceForSequence(
    'vowel-length', actualLengths, expectedLengths, actual,
  );
  const tokenEvidence: Evidence = {
    id: 'token-alignment-1',
    kind: 'token-alignment',
    observed: actual.children.map(({ value }) => value).join(' | '),
    expected: expected.children.map(({ value }) => value).join(' | '),
  };
  const evidence = [...particleEvidence, ...vowelEvidence, tokenEvidence];

  const feedback: SkillFeedback[] = [];
  if (particleScore < 100) {
    feedback.push({
      skillArea: 'grammar',
      observation: 'The particle sequence differs from the authored reference.',
      nextStep: 'Review the role and ordering of the highlighted particles.',
      evidenceIds: particleEvidence.map(({ id }) => id),
    });
  }
  if (vowelLengthScore < 100) {
    feedback.push({
      skillArea: 'pronunciation',
      observation: 'Textual long-vowel markers differ from the authored reference.',
      nextStep: 'Compare ー and common おう/えい long-vowel spellings with the reference.',
      evidenceIds: vowelEvidence.map(({ id }) => id),
    });
  }

  return {
    method: 'deterministic-japanese-rubric',
    methodVersion: '1.0.0',
    rubricId: 'japanese-jlpt-foundations',
    rubricVersion: '1.0.0',
    status: 'completed',
    criteria: [
      { criterionId: 'jlpt-particles', value: particleScore, maxValue: 100, evidenceIds: particleEvidence.map(({ id }) => id) },
      { criterionId: 'japanese-vowel-lengths', value: vowelLengthScore, maxValue: 100, evidenceIds: vowelEvidence.map(({ id }) => id) },
      { criterionId: 'token-accuracy', value: tokensScore, maxValue: 100, evidenceIds: [tokenEvidence.id] },
    ],
    evidence,
    confidence: {
      level: actual.children.length >= 3 ? 'high' : 'medium',
      method: 'deterministic-reference-alignment',
    },
    limitations: [
      {
        code: 'text-only',
        message: 'Text comparison cannot measure acoustic vowel duration or pitch accent.',
      },
      {
        code: 'reference-bound',
        message: 'Equivalent valid Japanese phrasing may score lower when it differs from the authored reference.',
      },
    ],
    feedback,
    trackValue: {
      namespace: 'japanese-jlpt',
      level: input.level,
      score,
      maxScore: 100,
    },
  };
}

export const JapaneseEvaluator = Object.freeze({ evaluate: evaluateJapanese });
