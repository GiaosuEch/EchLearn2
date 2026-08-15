export interface RandomAssessmentFinding {
  line: number;
  column: number;
  pattern: string;
  message: string;
}

const riskPatterns: readonly Readonly<{ name: string; expression: RegExp; message: string }>[] = [
  { name: 'Math.random', expression: /Math\.random\s*\(/gu, message: 'Randomness must not determine assessment output.' },
  { name: 'randomInt', expression: /\brandomInt\s*\(/gu, message: 'Random integer generation must not determine assessment output.' },
  { name: 'randomFloat', expression: /\brandomFloat\s*\(/gu, message: 'Random float generation must not determine assessment output.' },
  { name: 'shuffle', expression: /\bshuffle\s*\(/gu, message: 'Random shuffling must not determine assessment output.' },
  { name: 'mock-mode', expression: /\b(?:isAiGenerated\s*:\s*true|mode\s*:\s*['"`](?:mock|random|hardcoded|canned|simulated|fake)['"`])/giu, message: 'Mock or canned assessment output is not allowed.' },
];

export function findAssessmentRandomness(source: string, _scope: string): RandomAssessmentFinding[] {
  const findings: RandomAssessmentFinding[] = [];
  const lines = source.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const risk of riskPatterns) {
      risk.expression.lastIndex = 0;
      const match = risk.expression.exec(line);
      if (!match) continue;
      findings.push({
        line: lineIndex + 1,
        column: (match.index ?? 0) + 1,
        pattern: risk.name,
        message: risk.message,
      });
    }
  }
  return findings;
}
