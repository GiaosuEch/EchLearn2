export interface KanaCell { id: string; kana: string; romaji: string; group: string; }
export interface KanaCheck { id: string; kana: string; options: readonly string[]; correctAnswer: string; explanation: string; }

const rows: readonly [string, readonly [string, string][]][] = [
  ['Vowels', [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']]],
  ['K', [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']]],
  ['S', [['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']]],
  ['T', [['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to']]],
  ['N', [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']]],
  ['H', [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho']]],
  ['M', [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']]],
  ['Y', [['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo']]],
  ['R', [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']]],
  ['W/N', [['わ', 'wa'], ['を', 'wo'], ['ん', 'n']]],
];

export const HIRAGANA_CHART: readonly KanaCell[] = rows.flatMap(([group, cells]) => cells.map(([kana, romaji]) => ({ id: `h-${romaji}`, kana, romaji, group })));

const katakana: readonly string[] = [
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン',
];

export const KATAKANA_CHART: readonly KanaCell[] = HIRAGANA_CHART.map((cell, index) => ({ ...cell, id: `k-${cell.romaji}`, kana: katakana[index] }));

export const KANA_CHECKS: readonly KanaCheck[] = [
  { id: 'q1', kana: 'あ', options: ['a', 'i', 'u', 'e'], correctAnswer: 'a', explanation: 'あ là âm a.' },
  { id: 'q2', kana: 'き', options: ['ki', 'ke', 'ka', 'ko'], correctAnswer: 'ki', explanation: 'き đọc là ki.' },
  { id: 'q3', kana: 'し', options: ['shi', 'sa', 'su', 'chi'], correctAnswer: 'shi', explanation: 'し là shi, không phải si.' },
  { id: 'q4', kana: 'つ', options: ['tsu', 'su', 'chi', 'to'], correctAnswer: 'tsu', explanation: 'つ đọc là tsu.' },
  { id: 'q5', kana: 'ぬ', options: ['nu', 'no', 'ne', 'na'], correctAnswer: 'nu', explanation: 'ぬ đọc là nu.' },
  { id: 'q6', kana: 'ふ', options: ['fu', 'hu', 'ho', 'he'], correctAnswer: 'fu', explanation: 'ふ theo Hepburn romanization là fu.' },
  { id: 'q7', kana: 'む', options: ['mu', 'ma', 'me', 'mo'], correctAnswer: 'mu', explanation: 'む đọc là mu.' },
  { id: 'q8', kana: 'ゆ', options: ['yu', 'yo', 'ya', 'u'], correctAnswer: 'yu', explanation: 'ゆ đọc là yu.' },
  { id: 'q9', kana: 'れ', options: ['re', 'ri', 'ra', 'ro'], correctAnswer: 're', explanation: 'れ đọc là re.' },
  { id: 'q10', kana: 'ん', options: ['n', 'm', 'nu', 'no'], correctAnswer: 'n', explanation: 'ん là âm mũi n.' },
];

export function validateJLPTN5Kana(): string[] {
  const issues: string[] = [];
  if (new Set(HIRAGANA_CHART.map((cell) => cell.kana)).size !== HIRAGANA_CHART.length) issues.push('duplicate kana');
  if (KATAKANA_CHART.length !== HIRAGANA_CHART.length || new Set(KATAKANA_CHART.map((cell) => cell.kana)).size !== KATAKANA_CHART.length) issues.push('invalid katakana chart');
  for (const check of KANA_CHECKS) {
    if (!check.options.includes(check.correctAnswer)) issues.push(`missing answer: ${check.id}`);
    if (!check.explanation.trim()) issues.push(`missing explanation: ${check.id}`);
  }
  return issues;
}
