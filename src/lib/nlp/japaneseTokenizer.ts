import TinySegmenter from 'tiny-segmenter';

export type JapaneseScript =
  | 'kanji'
  | 'hiragana'
  | 'katakana'
  | 'latin'
  | 'number'
  | 'punctuation'
  | 'mixed';

export interface JapaneseTokenNode {
  type: 'Token';
  value: string;
  normalized: string;
  script: JapaneseScript;
  start: number;
  end: number;
}

export interface JapaneseDocumentNode {
  type: 'Document';
  source: string;
  children: JapaneseTokenNode[];
}

const segmenter = new TinySegmenter();
const punctuationPattern = /^[\p{P}\p{S}]+$/u;

function classifyScript(value: string): JapaneseScript {
  if (/^\p{Script=Han}+$/u.test(value)) return 'kanji';
  if (/^\p{Script=Hiragana}+$/u.test(value)) return 'hiragana';
  if (/^[\p{Script=Katakana}ー]+$/u.test(value)) return 'katakana';
  if (/^[\p{Script=Latin}]+$/u.test(value)) return 'latin';
  if (/^[\p{Number}]+$/u.test(value)) return 'number';
  if (punctuationPattern.test(value)) return 'punctuation';
  return 'mixed';
}

function splitWhitespaceAndPunctuation(segment: string): string[] {
  return segment
    .split(/([\s\p{P}\p{S}]+)/u)
    .flatMap((part) =>
      part && punctuationPattern.test(part) ? Array.from(part) : [part],
    )
    .filter((part) => part.length > 0 && !/^\s+$/u.test(part));
}

/**
 * Deterministically tokenizes Japanese text into an offset-bearing AST.
 * TinySegmenter performs local statistical segmentation only; no network,
 * model API, clock, or random input participates in the result.
 */
export function tokenizeJapanese(source: string): JapaneseDocumentNode {
  const children: JapaneseTokenNode[] = [];
  let cursor = 0;

  for (const value of segmenter.segment(source).flatMap(splitWhitespaceAndPunctuation)) {
    const start = source.indexOf(value, cursor);
    if (start < 0) {
      throw new Error('Japanese tokenizer lost source offset alignment.');
    }

    const end = start + value.length;
    children.push({
      type: 'Token',
      value,
      normalized: value.normalize('NFKC'),
      script: classifyScript(value),
      start,
      end,
    });
    cursor = end;
  }

  return { type: 'Document', source, children };
}

export const JapaneseTokenizer = Object.freeze({ tokenize: tokenizeJapanese });
