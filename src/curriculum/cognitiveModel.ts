/**
 * Bayesian Knowledge Tracing (BKT) & Free Spaced Repetition (FSRS v5) Cognitive Model
 * 
 * Provides mathematically grounded student knowledge state modeling and memory decay.
 */

export interface BKTParameters {
  /** Prior probability of knowing the skill before any practice (P(L0)) */
  pInit: number;
  /** Probability of transitioning from unlearned to learned state after an opportunity (P(T)) */
  pTransit: number;
  /** Probability of making a mistake despite knowing the skill (Slip - P(S)) */
  pSlip: number;
  /** Probability of guessing correctly without knowing the skill (Guess - P(G)) */
  pGuess: number;
}

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pInit: 0.15,
  pTransit: 0.20,
  pSlip: 0.08,
  pGuess: 0.20,
};

export interface CognitiveState {
  nodeId: string;
  /** Current estimated probability of mastery: P(L_t) in [0.0, 1.0] */
  probabilityKnown: number;
  /** Memory stability in days (FSRS) */
  stability: number;
  /** Intrinsic difficulty (FSRS: 1.0 to 10.0) */
  difficulty: number;
  /** Timestamp of last review (ms) */
  lastReviewedAt: number;
  /** Total review count */
  repetitions: number;
  /** Consecutive correct streak */
  streak: number;
}

/**
 * Updates the posterior mastery probability given a binary observation (Correct / Incorrect)
 * using standard Bayesian Knowledge Tracing (Corbett & Anderson).
 * 
 * 1. Posterior calculation P(L_t | obs):
 *    - If Correct:   P(L|C) = P(L) * (1 - P(S)) / [ P(L) * (1 - P(S)) + (1 - P(L)) * P(G) ]
 *    - If Incorrect: P(L|I) = P(L) * P(S)       / [ P(L) * P(S)       + (1 - P(L)) * (1 - P(G)) ]
 * 
 * 2. Learning transition to next state P(L_t+1):
 *    - P(L_t+1) = P(L|obs) + (1 - P(L|obs)) * P(T)
 */
export function updateBKT(
  priorProbability: number,
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): number {
  const { pTransit, pSlip, pGuess } = params;
  const pL = Math.max(0.001, Math.min(0.999, priorProbability));

  let pPosterior: number;
  if (isCorrect) {
    const numerator = pL * (1 - pSlip);
    const denominator = numerator + (1 - pL) * pGuess;
    pPosterior = numerator / denominator;
  } else {
    const numerator = pL * pSlip;
    const denominator = numerator + (1 - pL) * (1 - pGuess);
    pPosterior = numerator / denominator;
  }

  // Apply learning transition
  const pUpdated = pPosterior + (1 - pPosterior) * pTransit;
  return Math.max(0.001, Math.min(0.999, pUpdated));
}

/**
 * FSRS Memory Retrievability calculation.
 * R(t) = (1 + factor * (t / S))^(-1)
 * 
 * @param stability Memory stability in days
 * @param elapsedDays Number of days since last review
 * @param decayFactor Power law decay constant (default 19/81 ≈ 0.2346 for FSRS standard)
 */
export function calculateRetrievability(
  stability: number,
  elapsedDays: number,
  decayFactor: number = 0.2346
): number {
  if (stability <= 0 || elapsedDays <= 0) return 1.0;
  return Math.pow(1 + decayFactor * (elapsedDays / stability), -1);
}

/**
 * Calculates optimal next review interval (in days) to target a specific retention rate (default 90%).
 */
export function calculateOptimalInterval(
  stability: number,
  targetRetention: number = 0.90,
  decayFactor: number = 0.2346
): number {
  if (stability <= 0) return 1;
  const interval = (stability / decayFactor) * (Math.pow(targetRetention, -1) - 1);
  return Math.max(1, Math.round(interval));
}

/**
 * Updates full cognitive state after a learning event.
 */
export function stepCognitiveState(
  prevState: CognitiveState | undefined,
  nodeId: string,
  isCorrect: boolean,
  nowMs: number = Date.now(),
  bktParams: BKTParameters = DEFAULT_BKT_PARAMS
): CognitiveState {
  if (!prevState) {
    const pUpdated = updateBKT(bktParams.pInit, isCorrect, bktParams);
    return {
      nodeId,
      probabilityKnown: pUpdated,
      stability: isCorrect ? 1.5 : 0.5,
      difficulty: 5.0,
      lastReviewedAt: nowMs,
      repetitions: 1,
      streak: isCorrect ? 1 : 0
    };
  }

  const pUpdated = updateBKT(prevState.probabilityKnown, isCorrect, bktParams);
  const elapsedDays = Math.max(0, (nowMs - prevState.lastReviewedAt) / (1000 * 60 * 60 * 24));
  
  // Update Stability (FSRS-inspired)
  let newStability: number;
  if (isCorrect) {
    const currentR = calculateRetrievability(prevState.stability, elapsedDays);
    // Harder retrieval with success creates larger stability leap
    const rewardMultiplier = 1 + (1 - currentR) * 2.5;
    newStability = Math.max(1.0, prevState.stability * (1.2 + (prevState.streak * 0.3)) * rewardMultiplier);
  } else {
    // Lapse penalty
    newStability = Math.max(0.3, prevState.stability * 0.25);
  }

  return {
    nodeId,
    probabilityKnown: pUpdated,
    stability: Number(newStability.toFixed(2)),
    difficulty: Math.max(1.0, Math.min(10.0, prevState.difficulty + (isCorrect ? -0.2 : 0.4))),
    lastReviewedAt: nowMs,
    repetitions: prevState.repetitions + 1,
    streak: isCorrect ? prevState.streak + 1 : 0
  };
}
