/**
 * Cognitive Domain Types
 * 
 * Defines the core interfaces for Deep Knowledge Tracing (DKT).
 */

export interface MasteryVector {
  skillId: string;          // e.g., 'vocabulary', 'grammar:present_simple'
  probabilityKnown: number; // P(L) in BKT, from 0.0 to 1.0
  consecutiveSuccess: number;
  consecutiveFailures: number;
  lastUpdated: number;      // timestamp
}

export type FocusState = 'NORMAL' | 'DEEP_FOCUS' | 'FATIGUED';

export interface CognitiveLoadState {
  currentLoad: number;      // 0.0 to 1.0
  focusLevel: FocusState;
  fatigueIndex: number;     // 0.0 to 1.0
}

export interface BKTParameters {
  pSlip: number;            // Probability of making a mistake despite knowing the skill
  pGuess: number;           // Probability of answering correctly without knowing the skill
  pTransit: number;         // Probability of learning the skill after an opportunity
  pPrior: number;           // Initial probability of knowing the skill
}
