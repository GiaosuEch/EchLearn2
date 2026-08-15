export interface SimulationCriteriaFeedback {
  score: number; // 0 to 1
  message: string;
}

export interface SimulationFeedback {
  isValid: boolean;
  overallScore: number; // 0 to 100
  criteria: {
    politeness: SimulationCriteriaFeedback;
    completeness: SimulationCriteriaFeedback;
    grammar: SimulationCriteriaFeedback;
  };
  overallMessage: string;
}
