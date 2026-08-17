import { globalEventBus, SystemEvents } from '../lib/events/EventBus';
import type { BKTParameters, MasteryVector } from '../domain/cognitive/cognitiveState';
import { updateMasteryVector } from '../domain/cognitive/bayesianTracing';

class AdaptiveLearningEngine {
  private masteryStore = new Map<string, MasteryVector>();
  
  // Standard parameters for an average skill
  private bktParams: BKTParameters = {
    pSlip: 0.1,    // 10% chance to slip
    pGuess: 0.2,   // 20% chance to guess
    pTransit: 0.1, // 10% chance to learn
    pPrior: 0.3    // Initial assumption
  };

  constructor() {
    this.listenToEvents();
  }

  private listenToEvents() {
    globalEventBus.on(SystemEvents.USER_ANSWERED_QUESTION, (payload: any) => {
      if (!payload || !payload.skillType) return;
      this.processAnswer(payload.skillType, payload.isCorrect, payload.exercise);
    });
  }

  private processAnswer(skillType: string, isCorrect: boolean, exerciseContext: any) {
    const current = this.masteryStore.get(skillType) || null;
    const nextMastery = updateMasteryVector(current, skillType, isCorrect, this.bktParams);
    
    this.masteryStore.set(skillType, nextMastery);

    // If probability drops below a threshold (e.g. 0.4), trigger an intervention.
    // Also trigger if they fail consecutively multiple times despite high probability.
    if (nextMastery.probabilityKnown < 0.4 || nextMastery.consecutiveFailures >= 2) {
      globalEventBus.emit(SystemEvents.INTERVENTION_REQUIRED, {
        skillType,
        mastery: nextMastery,
        originalExercise: exerciseContext
      });
    }
  }

  public getMastery(skillType: string): MasteryVector | null {
    return this.masteryStore.get(skillType) || null;
  }

  public getFullMasteryStore(): Map<string, MasteryVector> {
    return this.masteryStore;
  }
}

export const adaptiveEngine = new AdaptiveLearningEngine();
