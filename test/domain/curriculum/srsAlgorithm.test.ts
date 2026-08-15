import { describe, it, expect } from 'vitest';
import { SRSAlgorithm, SRSData } from '../../../src/domain/curriculum/srsAlgorithm';

describe('Differential SRS Algorithm (Math-only, No AI)', () => {
  it('should initialize SRS data with strong score', () => {
    const data = SRSAlgorithm.review(undefined, 0.9);
    expect(data.stability).toBe(2);
    expect(data.retrievability).toBe(1.0);
    expect(data.reviewCount).toBe(1);
  });

  it('should decay retrievability over time', () => {
    const data: SRSData = { stability: 2, retrievability: 1.0, lastReview: 0, reviewCount: 1 };
    
    // Simulate 1 day passing
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const r1 = SRSAlgorithm.calculateRetrievability(data.stability, 0, ONE_DAY);
    // R = e^(-1/2) = e^(-0.5) ≈ 0.606
    expect(r1).toBeCloseTo(0.6065, 3);

    // Simulate 2 days passing
    const r2 = SRSAlgorithm.calculateRetrievability(data.stability, 0, 2 * ONE_DAY);
    // R = e^(-2/2) = e^(-1) ≈ 0.367
    expect(r2).toBeCloseTo(0.3678, 3);
  });

  it('should increase stability upon successful review (Hard work pays off)', () => {
    // 1 day has passed, R is low (~0.6). A perfect score should boost stability.
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const initialData: SRSData = { stability: 2, retrievability: 1.0, lastReview: 0, reviewCount: 1 };
    
    const newData = SRSAlgorithm.review(initialData, 0.9, ONE_DAY);
    
    // increaseFactor = max(1.1, exp(1 - 0.606) * 1.5) = max(1.1, 1.48 * 1.5) = 2.22
    // newStability = 2 * 2.22 = 4.44
    expect(newData.stability).toBeGreaterThan(4);
    expect(newData.retrievability).toBe(1.0); // Resets to 1
    expect(newData.lastReview).toBe(ONE_DAY);
  });

  it('should decrease stability upon failed review', () => {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const initialData: SRSData = { stability: 2, retrievability: 1.0, lastReview: 0, reviewCount: 1 };
    
    // Score 0.2 means they completely forgot it
    const newData = SRSAlgorithm.review(initialData, 0.2, ONE_DAY);
    
    // Failed recall halves stability
    expect(newData.stability).toBeCloseTo(1.0, 3);
    expect(newData.retrievability).toBe(1.0); 
  });
});
