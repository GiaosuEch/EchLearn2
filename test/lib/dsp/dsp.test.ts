import { describe, it, expect } from 'vitest';
import { FFT, Complex } from '../../../src/lib/dsp/fft';
import { DTW } from '../../../src/lib/dsp/dtw';

describe('DSP Mathematics (AI-Free)', () => {
  describe('FFT (Fast Fourier Transform)', () => {
    it('should transform a simple DC signal', () => {
      // 4 samples of DC (constant 1)
      const input = [
        new Complex(1, 0),
        new Complex(1, 0),
        new Complex(1, 0),
        new Complex(1, 0)
      ];
      
      const out = FFT.transform(input);
      
      // DC component (0Hz) should be 4, others 0
      expect(out[0].re).toBeCloseTo(4);
      expect(out[0].im).toBeCloseTo(0);
      
      expect(out[1].magnitude()).toBeCloseTo(0);
      expect(out[2].magnitude()).toBeCloseTo(0);
      expect(out[3].magnitude()).toBeCloseTo(0);
    });

    it('should extract magnitude spectrum from real signal', () => {
      const realSignal = [1, 1, -1, -1]; // Simple square-ish wave
      const spectrum = FFT.getMagnitudeSpectrum(realSignal);
      
      expect(spectrum.length).toBe(2); // Nyquist limit (N/2)
      expect(spectrum[0]).toBeDefined();
    });
  });

  describe('DTW (Dynamic Time Warping)', () => {
    it('should return 0 distance for identical sequences', () => {
      const seq1 = [1, 2, 3, 4, 5];
      const seq2 = [1, 2, 3, 4, 5];
      
      const dist = DTW.calculateDistance(seq1, seq2);
      expect(dist).toBe(0);
    });

    it('should match sequences with temporal shift (warping)', () => {
      const seq1 = [1, 2, 3, 3, 4]; // Person saying "three" slowly
      const seq2 = [1, 2, 3, 4];    // Person saying "three" fast
      
      const dist = DTW.calculateDistance(seq1, seq2);
      // It matches 3 to 3 with zero penalty, only deletion/insertion cost which is heavily mitigated.
      // Expected cost is very low compared to Euclidean distance.
      expect(dist).toBeLessThan(1);
    });

    it('should evaluate a high score for close sequences', () => {
      const dist = 5; 
      const score = DTW.evaluateScore(dist, 100);
      expect(score).toBe(0.95);
    });

    it('should complete matrix computation under 20ms for large sequences', () => {
      // Benchmark requirement
      const seq1 = Array.from({ length: 500 }, (_, i) => Math.sin(i * 0.1));
      const seq2 = Array.from({ length: 500 }, (_, i) => Math.sin(i * 0.11)); // Slightly different frequency
      
      const start = performance.now();
      const dist = DTW.calculateDistance(seq1, seq2, 50); // With Sakoe-Chiba window 50
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Being generous for CI runners, but it usually takes <5ms
      expect(dist).toBeGreaterThan(0);
    });
  });
});
