/**
 * The Situational Immersion Engine
 * 
 * Replaces static flashcard translation with dynamic, micro-scenarios.
 * Elon Musk Standard: Learning through high-stakes simulated context.
 */

export interface ScenarioContext {
  persona: string;
  setting: string;
  stakes: string;
  scenarioText: string;
  questionText: string;
  correctOption: string;
  distractors: string[];
}

const NARRATIVE_TEMPLATES = [
  {
    persona: 'Elon Musk (CEO of Tesla/SpaceX)',
    setting: 'A high-stakes boardroom meeting at 3:00 AM',
    stakes: 'High',
    vocabContext: 'He glares at the delayed production chart. The silence in the room is deafening. "We are bleeding cash," he mutters.',
    grammarContext: 'He points at the whiteboard where the engineering schematics are fundamentally flawed.',
  },
  {
    persona: 'A ruthless Venture Capitalist',
    setting: 'A multi-million dollar Series B pitch',
    stakes: 'High',
    vocabContext: 'She closes her notebook and sighs. "Your user retention metrics are terrible. What is your strategy?"',
    grammarContext: 'She questions the scalability of your entire backend architecture under heavy load.',
  },
  {
    persona: 'Senior Principal Engineer',
    setting: 'A post-mortem incident review (Severity 1)',
    stakes: 'High',
    vocabContext: 'The production database was accidentally dropped. He looks at you, waiting for your explanation.',
    grammarContext: 'He demands to know exactly what steps you will take to prevent this from ever happening again.',
  },
  {
    persona: 'A strict Border Control Officer',
    setting: 'Immigration checkpoint in a foreign country',
    stakes: 'Medium',
    vocabContext: 'He looks at your visa suspiciously, then back at you. "What is the purpose of your extended stay?"',
    grammarContext: 'He challenges the timeline of your travel history and asks you to clarify your future intentions.',
  }
];

/**
 * Generates a dynamic situational scenario for a target vocabulary word or grammar concept.
 */
export function generateSituationalScenario(
  targetConcept: string, 
  conceptType: 'vocabulary' | 'grammar',
  meaning: string
): ScenarioContext {
  const template = NARRATIVE_TEMPLATES[Math.floor(Math.random() * NARRATIVE_TEMPLATES.length)];
  
  const scenarioText = conceptType === 'vocabulary' ? template.vocabContext : template.grammarContext;
  
  let questionText = '';
  let correctOption = '';
  let distractors: string[] = [];

  if (conceptType === 'vocabulary') {
    questionText = `You need to communicate "${meaning}" using the core concept of "${targetConcept}". Which response is politically and semantically optimal?`;
    correctOption = `We must prioritize and ${targetConcept} the core issues immediately.`;
    distractors = [
      `I think we should probably try to ${targetConcept} if we have time.`, // Too passive
      `We should ignore the problem and not ${targetConcept}.`, // Opposite meaning
      `Let's panic and ${targetConcept} without a concrete plan.` // Unprofessional
    ];
  } else {
    // Grammar
    questionText = `You need to express a complex condition (${meaning}) using "${targetConcept}". Which structure maintains absolute professional authority?`;
    correctOption = `If we execute ${targetConcept} efficiently, the system will scale.`;
    distractors = [
      `If we executed ${targetConcept} efficiently, the system will scaling.`, // Tense mismatch
      `If we are execute ${targetConcept}, it is scale.`, // Grammar error
      `If we will execute ${targetConcept}, it scales.` // Modal error
    ];
  }

  // Shuffle distractors slightly to avoid predictable patterns
  distractors = distractors.sort(() => Math.random() - 0.5);

  return {
    persona: template.persona,
    setting: template.setting,
    stakes: template.stakes,
    scenarioText,
    questionText,
    correctOption,
    distractors
  };
}
