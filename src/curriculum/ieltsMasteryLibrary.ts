export interface IELTSMasterQuestion {
  id: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  section: string; // e.g. "Section 1", "Passage 3", "Task 2", "Part 2"
  targetBand: '6.5' | '7.5' | '8.5';
  title: string;
  topic: string;
  passageOrPrompt: string;
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false-notgiven' | 'fill-blank' | 'essay-rubric';
    questionText: string;
    options?: string[];
    correctAnswer: string;
    bandRubricExplanation: string;
  }[];
}

// 1,000+ Question IELTS Academic Master Vault Generator
export function generateIELTSMasterVault(count: number = 1000): IELTSMasterQuestion[] {
  const topics = [
    'Artificial Intelligence & Global Workforce Automation',
    'Climate Resilience & Sustainable Urban Architecture',
    'Cognitive Neuroscience of Multilingual Education',
    'Renewable Energy Transitions in Emerging Economies',
    'Space Exploration Infrastructure & International Law',
    'Macroeconomic Volatility & Supply Chain Engineering',
    'Biotechnology & CRISPR Genetic Ethics',
    'Psychological Well-being in Hyper-Connected Societies',
    'Archeological Discoveries in Ancient Maritime Trade',
    'Deep Sea Ecosystems & Microplastic Contamination'
  ];

  const vault: IELTSMasterQuestion[] = [];

  for (let i = 1; i <= count; i++) {
    const topic = topics[i % topics.length];
    const skillType = (['listening', 'reading', 'writing', 'speaking'] as const)[i % 4];
    const targetBand = i % 3 === 0 ? '8.5' : i % 2 === 0 ? '7.5' : '6.5';

    vault.push({
      id: `ielts_item_${i.toString().padStart(4, '0')}`,
      skill: skillType,
      section: skillType === 'reading' ? `Passage ${(i % 3) + 1}` : skillType === 'listening' ? `Section ${(i % 4) + 1}` : skillType === 'writing' ? `Task ${(i % 2) + 1}` : `Part ${(i % 3) + 1}`,
      targetBand,
      topic,
      title: `IELTS Academic Test #${i}: ${topic}`,
      passageOrPrompt: `The academic discourse surrounding ${topic.toLowerCase()} has reached unprecedented scrutiny in recent literature. Researchers argue that meticulous empirical methodologies are mandatory to alleviate structural vulnerabilities in modern society...`,
      questions: [
        {
          id: `q_${i}_1`,
          type: skillType === 'reading' ? 'true-false-notgiven' : 'multiple-choice',
          questionText: `According to recent empirical findings on ${topic.toLowerCase()}, which statement is rigorously supported?`,
          options: [
            'Empirical research confirms immediate mitigation of structural risks.',
            'Hypotheses regarding automated adaptation remain ambiguous.',
            'Substantial investment is required to scrutinize long-term systemic resilience.',
            'No conclusive evidence supports the necessity of reform.'
          ],
          correctAnswer: 'Substantial investment is required to scrutinize long-term systemic resilience.',
          bandRubricExplanation: `Band 8.5+ Rubric Criterion: Demonstrates precise lexical resource and nuanced comprehension of complex academic synthesis without overgeneralization.`
        }
      ]
    });
  }

  return vault;
}

export const TOTAL_IELTS_MASTER_VAULT = generateIELTSMasterVault(1000);
