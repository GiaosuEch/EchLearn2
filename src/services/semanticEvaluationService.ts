/**
 * Semantic Evaluation Service
 * 
 * Future Integration Point: LLM-based semantic scoring and feedback for open-ended exercises.
 * Currently provides an abstraction over string-matching fallbacks to keep UI components 
 * unaware of evaluation implementation details.
 */

export interface SemanticEvaluationResult {
  score: number; // 0 to 1
  isAcceptable: boolean;
  feedback: string;
}

export const semanticEvaluationService = {
  /**
   * Evaluates the semantic meaning of user input against a target context.
   */
  async evaluateMeaning(userInput: string, targetContextId: string): Promise<SemanticEvaluationResult> {
    const inputClean = userInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    
    // Temporary fallback logic for RealworldMasteryMission
    if (targetContextId === 'order-food-less-spicy') {
      const isAcceptable = inputClean === 'polite-order';
      
      return {
        score: isAcceptable ? 1.0 : 0.0,
        isAcceptable,
        feedback: isAcceptable 
          ? "Good job! You conveyed the right intention."
          : "Your meaning wasn't quite clear. Try focusing on the polite request structure."
      };
    }

    // Default fallback
    return {
      score: 0,
      isAcceptable: false,
      feedback: "Unknown context or inability to evaluate."
    };
  }
};
