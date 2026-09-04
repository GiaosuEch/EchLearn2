/**
 * The Situational Immersion Engine — honest edition.
 *
 * The scenario supplies ONLY narrative framing (persona, setting, stakes).
 * Every linguistic payload — the sentence the learner works on, the correct
 * answer, and the distractors — comes from authored vocabulary data passed in
 * by the caller. Nothing is fabricated from a template, and template selection
 * is a deterministic hash of the target concept so the same lesson always
 * renders identically (assessment determinism rule).
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
    context: 'He glares at the delayed production chart. The silence in the room is deafening. "We are bleeding cash," he mutters.',
  },
  {
    persona: 'A ruthless Venture Capitalist',
    setting: 'A multi-million dollar Series B pitch',
    stakes: 'High',
    context: 'She closes her notebook and sighs. "Your user retention metrics are terrible. What is your strategy?"',
  },
  {
    persona: 'Senior Principal Engineer',
    setting: 'A post-mortem incident review (Severity 1)',
    stakes: 'High',
    context: 'The production database was accidentally dropped. He looks at you, waiting for your explanation.',
  },
  {
    persona: 'A strict Border Control Officer',
    setting: 'Immigration checkpoint in a foreign country',
    stakes: 'Medium',
    context: 'He looks at your visa suspiciously, then back at you. "What is the purpose of your extended stay?"',
  },
  {
    persona: 'Your Future Mother-in-Law',
    setting: 'First family dinner at her home',
    stakes: 'Medium',
    context: 'She serves the soup and watches you carefully, waiting to see if you can keep up with the family conversation.',
  },
  {
    persona: 'A World-Class Airbnb Host in Kyoto',
    setting: 'Check-in at 9 PM after you missed your train',
    stakes: 'Medium',
    context: 'She slides the keys across the counter and asks, patiently, what happened and what you need now.',
  },
  {
    persona: 'The Head Surgeon',
    setting: 'A hospital corridor, minutes before an operation',
    stakes: 'High',
    context: 'She hands you the chart and asks you to summarize the patient status precisely — no room for vague language.',
  },
  {
    persona: 'A Live Radio Host',
    setting: 'On-air interview, two million listeners',
    stakes: 'High',
    context: 'He leans toward the microphone and fires the opening question at you without warning.',
  },
  {
    persona: 'A Veteran Defense Attorney',
    setting: 'Court recess, fifteen minutes on the clock',
    stakes: 'High',
    context: 'He flips through the case file and asks you to state the one fact that changes everything.',
  },
  {
    persona: 'A Secondary Inspection Officer',
    setting: 'Airport secondary inspection room',
    stakes: 'High',
    context: 'He challenges the timeline in your passport and waits for a precise, honest answer about your plans.',
  },
];

function stableIndex(concept: string, modulus: number): number {
  let hash = 2166136261;
  for (let i = 0; i < concept.length; i += 1) {
    hash ^= concept.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % modulus;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a situational exercise from a REAL authored example sentence.
 * Returns null when no genuine example contains the target word — the caller
 * must skip the item rather than fabricate a sentence.
 */
export function generateSituationalScenario(
  targetConcept: string,
  conceptType: 'vocabulary' | 'grammar',
  meaning: string,
  exampleSentence?: string,
): ScenarioContext | null {
  const example = (exampleSentence || '').trim();
  if (!example || !targetConcept) return null;

  const pattern = new RegExp(escapeRegExp(targetConcept), 'i');
  if (!pattern.test(example)) return null;

  const template = NARRATIVE_TEMPLATES[stableIndex(targetConcept, NARRATIVE_TEMPLATES.length)];
  const blanked = example.replace(pattern, '_____');
  const frame = conceptType === 'grammar'
    ? 'Cấu trúc đích xuất hiện trong câu thật dưới đây'
    : 'Từ vựng đích xuất hiện trong câu thật dưới đây';

  return {
    persona: template.persona,
    setting: template.setting,
    stakes: template.stakes,
    scenarioText: `${template.context} (${template.setting}.)`,
    questionText: `${frame}: "${blanked}". Chọn đáp án đúng đi vào chỗ trống (nghĩa: ${meaning}).`,
    correctOption: targetConcept,
    distractors: [],
  };
}
