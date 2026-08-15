// src/lib/dsp/dtw.ts

/**
 * Deterministic Dynamic Time Warping (DTW)
 * Used for comparing two temporal sequences (e.g., audio feature arrays)
 * that may vary in speed.
 */
export class DTW {
  /**
   * Calculates the DTW distance between two 1D numeric arrays.
   * Uses a Sakoe-Chiba band to limit the search space for performance optimization (optional).
   */
  public static calculateDistance(seq1: number[], seq2: number[], windowSize: number = Number.MAX_SAFE_INTEGER): number {
    const n = seq1.length;
    const m = seq2.length;
    
    // Create a 2D matrix initialized to Infinity
    const dtw: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;

    const window = Math.max(windowSize, Math.abs(n - m));

    for (let i = 1; i <= n; i++) {
      // Apply windowing constraint
      const startJ = Math.max(1, i - window);
      const endJ = Math.min(m, i + window);

      for (let j = startJ; j <= endJ; j++) {
        const cost = Math.abs(seq1[i - 1] - seq2[j - 1]);
        
        // Find the minimum cost from adjacent cells
        const minCost = Math.min(
          dtw[i - 1][j],    // Insertion
          dtw[i][j - 1],    // Deletion
          dtw[i - 1][j - 1] // Match
        );
        
        dtw[i][j] = cost + minCost;
      }
    }

    return dtw[n][m];
  }

  /**
   * Helper to evaluate pronunciation score.
   * Lower DTW distance -> Higher score (closer to 1.0).
   */
  public static evaluateScore(dtwDistance: number, maxExpectedDistance: number = 100): number {
    if (dtwDistance === 0) return 1.0;
    
    // Normalize distance to a 0.0 - 1.0 score.
    const normalized = Math.max(0, 1 - (dtwDistance / maxExpectedDistance));
    return normalized;
  }
}
