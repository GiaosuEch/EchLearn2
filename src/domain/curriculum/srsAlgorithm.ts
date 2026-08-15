// src/domain/curriculum/srsAlgorithm.ts

export interface SRSData {
  stability: number;       // S: Memory stability (in days)
  retrievability: number;  // R: Probability of recall [0, 1]
  lastReview: number;      // Epoch timestamp of last review (ms)
  reviewCount: number;
}

/**
 * Deterministic Differential Spaced Repetition System
 * Based on the mathematical models of memory decay (Ebbinghaus curve).
 * Does not use AI, purely equation-driven.
 */
export class SRSAlgorithm {
  // R = e^(-t/S) -> standard exponential forgetting curve
  // t: time elapsed in days
  public static calculateRetrievability(stability: number, lastReviewMs: number, currentTimeMs: number = Date.now()): number {
    if (stability <= 0) return 0;
    
    const elapsedDays = (currentTimeMs - lastReviewMs) / (1000 * 60 * 60 * 24);
    if (elapsedDays < 0) return 1; // Future timestamp safeguard

    return Math.exp(-elapsedDays / stability);
  }

  /**
   * Updates the SRS data based on user performance.
   * @param currentData Current SRS state
   * @param score Score from 0.0 to 1.0 (from deterministicEvaluator)
   * @param currentTimeMs Current time in milliseconds
   */
  public static review(currentData: SRSData | undefined, score: number, currentTimeMs: number = Date.now()): SRSData {
    if (!currentData) {
      // First review
      const initialStability = score >= 0.8 ? 2 : (score >= 0.5 ? 1 : 0.1);
      return {
        stability: initialStability,
        retrievability: 1.0,
        lastReview: currentTimeMs,
        reviewCount: 1
      };
    }

    const R = this.calculateRetrievability(currentData.stability, currentData.lastReview, currentTimeMs);
    
    // Calculate new stability mathematically based on review quality and current R
    // A successful review when R is low increases S significantly (hard work pays off).
    // A failed review decreases S.
    let newStability = currentData.stability;

    if (score >= 0.8) {
      // Good recall
      // Stability increases exponentially depending on how close R is to forgetting
      const increaseFactor = Math.max(1.1, Math.exp(1 - R) * 1.5);
      newStability *= increaseFactor;
    } else if (score >= 0.5) {
      // Hard recall
      newStability *= 1.2;
    } else {
      // Failed recall
      // Stability drops, but never below 0.1 to avoid div by zero
      newStability = Math.max(0.1, newStability * 0.5);
    }

    return {
      stability: newStability,
      retrievability: 1.0, // Instantly resets to 1 after review
      lastReview: currentTimeMs,
      reviewCount: currentData.reviewCount + 1
    };
  }

  /**
   * Checks if a node needs review based on a threshold.
   * Typically, if R < 0.85, it's time to review.
   */
  public static needsReview(data: SRSData, threshold: number = 0.85, currentTimeMs: number = Date.now()): boolean {
    return this.calculateRetrievability(data.stability, data.lastReview, currentTimeMs) < threshold;
  }
}
