/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Pure mathematical domain logic for estimating a learner's knowledge probability.
 * Based on Corbett and Anderson's standard BKT model.
 */

import type { BKTParameters, MasteryVector } from './cognitiveState';

/**
 * Calculates the posterior probability of knowledge given an observation (correct or incorrect).
 */
export function calculatePosterior(
  priorL: number, 
  isCorrect: boolean, 
  params: BKTParameters
): number {
  const { pSlip, pGuess, pTransit } = params;
  
  let pLGivenObs: number;

  if (isCorrect) {
    // P(L | correct) = (P(L) * (1 - P(S))) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
    const pObsCorrect = priorL * (1 - pSlip) + (1 - priorL) * pGuess;
    pLGivenObs = (priorL * (1 - pSlip)) / pObsCorrect;
  } else {
    // P(L | incorrect) = (P(L) * P(S)) / (P(L) * P(S) + (1 - P(L)) * (1 - P(G)))
    const pObsIncorrect = priorL * pSlip + (1 - priorL) * (1 - pGuess);
    pLGivenObs = (priorL * pSlip) / pObsIncorrect;
  }

  // P(L_n) = P(L | obs) + (1 - P(L | obs)) * P(T)
  const nextPrior = pLGivenObs + (1 - pLGivenObs) * pTransit;
  
  return nextPrior;
}

/**
 * Updates a MasteryVector based on an interaction.
 */
export function updateMasteryVector(
  current: MasteryVector | null,
  skillId: string,
  isCorrect: boolean,
  params: BKTParameters
): MasteryVector {
  const prior = current?.probabilityKnown ?? params.pPrior;
  const nextProb = calculatePosterior(prior, isCorrect, params);

  return {
    skillId,
    probabilityKnown: nextProb,
    consecutiveSuccess: isCorrect ? (current?.consecutiveSuccess ?? 0) + 1 : 0,
    consecutiveFailures: isCorrect ? 0 : (current?.consecutiveFailures ?? 0) + 1,
    lastUpdated: Date.now()
  };
}
