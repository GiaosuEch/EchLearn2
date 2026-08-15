import type { ASTNode } from '../../lib/nlp/parser';

export class IELTSEvaluator {
  /**
   * Evaluate Pronunciation Band (0-9) based on DTW similarity score (0-100).
   * Pure mathematical thresholds based on a deterministic curve.
   */
  public static evaluatePronunciation(dtwScorePercent: number): number {
    if (dtwScorePercent >= 95) return 9.0;
    if (dtwScorePercent >= 88) return 8.5;
    if (dtwScorePercent >= 80) return 8.0;
    if (dtwScorePercent >= 70) return 7.5;
    if (dtwScorePercent >= 60) return 7.0;
    if (dtwScorePercent >= 50) return 6.5;
    if (dtwScorePercent >= 40) return 6.0;
    if (dtwScorePercent >= 30) return 5.5;
    if (dtwScorePercent >= 20) return 5.0;
    if (dtwScorePercent >= 10) return 4.5;
    return 4.0;
  }

  /**
   * Evaluate Grammar Range & Accuracy (GRA) Band based on AST complexity.
   * Calculates maximum tree depth and checks for specific node types.
   */
  public static evaluateGrammar(ast: ASTNode): number {
    if (ast.type === 'ERROR') return 5.0; // Broken syntax defaults to 5.0 max

    const { depth, hasComplexClause, errorCount } = this.analyzeAST(ast);

    let band = 5.0;

    // Range criteria
    if (depth >= 5 && hasComplexClause) {
      band = 8.0; // Uses a wide range of structures with full flexibility
    } else if (depth >= 4 && hasComplexClause) {
      band = 7.0; // Uses a variety of complex structures
    } else if (depth >= 3) {
      band = 6.0; // Uses a mix of simple and complex sentence forms
    } else {
      band = 5.0; // Uses a limited range of structures
    }

    // Accuracy criteria (Penalty)
    if (errorCount > 0) {
      band -= (errorCount * 0.5); // Punish band for errors
    }

    // Floor and Ceiling
    return Math.max(4.0, Math.min(9.0, band));
  }

  private static analyzeAST(node: ASTNode, currentDepth: number = 1): { depth: number, hasComplexClause: boolean, errorCount: number } {
    let maxDepth = currentDepth;
    let hasComplexClause = node.type === 'SBAR' || node.type === 'CONJ';
    let errorCount = node.type === 'ERROR' ? 1 : 0;

    if (node.children) {
      for (const child of node.children) {
        const childStats = this.analyzeAST(child, currentDepth + 1);
        if (childStats.depth > maxDepth) maxDepth = childStats.depth;
        if (childStats.hasComplexClause) hasComplexClause = true;
        errorCount += childStats.errorCount;
      }
    }

    return { depth: maxDepth, hasComplexClause, errorCount };
  }
}
