export type AssessmentSourceScope =
  | 'assessment'
  | 'evaluation'
  | 'scoring'
  | 'feedback'
  | 'cosmetic'
  | 'content-variation';

export type AssessmentRandomnessViolationKind =
  | 'random-assessment-decision'
  | 'canned-assessment-outcome';

export type AssessmentRandomnessViolation = {
  line: number;
  column: number;
  kind: AssessmentRandomnessViolationKind;
  pattern: string;
  message: string;
};

const RANDOM_PATTERNS = [
  { pattern: /\bMath\.random\s*\(/g, label: 'Math.random' },
  { pattern: /\brandomInt\s*\(/g, label: 'randomInt' },
  { pattern: /\brandomFloat\s*\(/g, label: 'randomFloat' },
  { pattern: /\bshuffle\s*\(/g, label: 'shuffle' },
] as const;

const ALLOW_MARKER = /@random-allowed\s+(?:cosmetic|content-variation)\b/i;
const OUTCOME_FIELD =
  /\b(?:assessment(?:Result)?|evaluation(?:Result)?|score|confidence|feedback|rubric|evidence)\b/i;
const LITERAL_OUTCOME_FIELD =
  /\b(?:assessment(?:Result)?|evaluation(?:Result)?|score|confidence|feedback|rubric|evidence)\s*:\s*(?:['"`]|[-+]?\d|true\b|false\b)/i;
const SIMULATION_MODE =
  /\bmode\s*:\s*['"`](?:mock|random|hardcoded|canned|simulated|fake)['"`]/i;
const SIMULATION_LABEL = /\b(?:mock|random|hardcoded|canned|simulated|fake)\b/i;

function sanitizeSource(source: string, maskStrings: boolean): string {
  let output = '';
  let inBlockComment = false;
  let inLineComment = false;
  let inString: '"' | "'" | '`' | null = null;
  let escaped = false;
  let templateExpressionDepth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      output += current === '\n' ? '\n' : ' ';
      if (current === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      output += current === '\n' ? '\n' : ' ';
      if (current === '*' && next === '/') {
        output += ' ';
        index += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (inString) {
      if (inString === '`' && maskStrings && current === '$' && next === '{') {
        output += '${';
        index += 1;
        inString = null;
        templateExpressionDepth = 1;
        continue;
      }

      output += maskStrings && current !== '\n' ? ' ' : current;
      if (escaped) {
        escaped = false;
      } else if (current === '\\') {
        escaped = true;
      } else if (current === inString) {
        inString = null;
      }
      continue;
    }

    if (maskStrings && templateExpressionDepth > 0) {
      if (current === '{') templateExpressionDepth += 1;
      if (current === '}') {
        templateExpressionDepth -= 1;
        output += current;
        if (templateExpressionDepth === 0) inString = '`';
        continue;
      }
    }

    if (current === '"' || current === "'" || current === '`') {
      inString = current;
      output += maskStrings ? ' ' : current;
      continue;
    }
    if (current === '/' && next === '/') {
      output += '  ';
      index += 1;
      inLineComment = true;
      continue;
    }
    if (current === '/' && next === '*') {
      output += '  ';
      index += 1;
      inBlockComment = true;
      continue;
    }

    output += current;
  }

  return output;
}

function lineAndColumn(source: string, offset: number): { line: number; column: number } {
  const prefix = source.slice(0, offset);
  const lineBreak = prefix.lastIndexOf('\n');
  return {
    line: prefix.split('\n').length,
    column: offset - lineBreak,
  };
}

function hasRandomAllowance(rawLines: string[], lineIndex: number): boolean {
  const currentLine = rawLines[lineIndex] ?? '';
  const previousLine = lineIndex > 0 ? (rawLines[lineIndex - 1] ?? '') : '';
  return ALLOW_MARKER.test(currentLine) || ALLOW_MARKER.test(previousLine);
}

export function findAssessmentRandomness(
  source: string,
  scope: AssessmentSourceScope,
): AssessmentRandomnessViolation[] {
  if (scope === 'cosmetic' || scope === 'content-variation') return [];

  const rawLines = source.split('\n');
  const code = sanitizeSource(source, true);
  const violations: AssessmentRandomnessViolation[] = [];
  const seen = new Set<string>();

  const addViolation = (
    offset: number,
    kind: AssessmentRandomnessViolationKind,
    pattern: string,
    message: string,
  ) => {
    const location = lineAndColumn(source, offset);
    const key = `${location.line}:${kind}:${pattern}`;
    if (seen.has(key)) return;
    const lineIndex = location.line - 1;
    if (kind === 'random-assessment-decision' && hasRandomAllowance(rawLines, lineIndex)) return;
    seen.add(key);
    violations.push({ ...location, kind, pattern, message });
  };

  for (const { pattern, label } of RANDOM_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      addViolation(
        match.index,
        'random-assessment-decision',
        label,
        `${label} can change an assessment decision; use deterministic logic or declare cosmetic/content variation.`,
      );
    }
  }

  const uncommentedSource = sanitizeSource(source, false);
  const simulationModeMatch = SIMULATION_MODE.exec(uncommentedSource);
  if (simulationModeMatch && OUTCOME_FIELD.test(uncommentedSource)) {
    addViolation(
      simulationModeMatch.index,
      'canned-assessment-outcome',
      simulationModeMatch[0],
      'A canned or hardcoded assessment outcome must not be presented as genuine AI evaluation.',
    );
  }

  const aiClaimMatch = /\bisAiGenerated\s*:\s*true\b/i.exec(uncommentedSource);
  const hasSimulationLabel =
    OUTCOME_FIELD.test(uncommentedSource) && SIMULATION_LABEL.test(uncommentedSource);
  if (aiClaimMatch && (LITERAL_OUTCOME_FIELD.test(uncommentedSource) || hasSimulationLabel)) {
    addViolation(
      aiClaimMatch.index,
      'canned-assessment-outcome',
      'isAiGenerated: true',
      'A canned or hardcoded assessment outcome must not be presented as genuine AI evaluation.',
    );
  }

  return violations.sort((left, right) => left.line - right.line || left.column - right.column);
}
