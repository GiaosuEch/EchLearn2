import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  detectPitchAutocorrelation, 
  calculatePitchContourDTW 
} from '../../src/services/acousticPitchDetector.ts';

describe('AcousticPitchDetector - YIN/Autocorrelation & DTW Pitch Tracking', () => {
  it('detectPitchAutocorrelation: should accurately detect fundamental frequency of a synthetic sine wave', () => {
    const sampleRate = 44100;
    const targetFreq = 220; // 220 Hz (A3)
    const durationSec = 0.05; // 50ms window
    const bufferSize = Math.floor(sampleRate * durationSec);
    const buffer = new Float32Array(bufferSize);

    for (let i = 0; i < bufferSize; i++) {
      buffer[i] = Math.sin((2 * Math.PI * targetFreq * i) / sampleRate);
    }

    const result = detectPitchAutocorrelation(buffer, sampleRate);
    assert.ok(result.clarity > 0.8, `Clarity ${result.clarity} should be high for pure tone`);
    assert.ok(
      Math.abs(result.pitchHz - targetFreq) < 2.0, 
      `Detected pitch ${result.pitchHz} Hz should be close to 220 Hz`
    );
  });

  it('detectPitchAutocorrelation: should return 0 pitch for silence', () => {
    const sampleRate = 44100;
    const buffer = new Float32Array(2048); // all zeros
    const result = detectPitchAutocorrelation(buffer, sampleRate);

    assert.strictEqual(result.pitchHz, 0);
    assert.strictEqual(result.clarity, 0);
  });

  it('calculatePitchContourDTW: should give 100% similarity for identical pitch tracks', () => {
    const pitchTrack = [120, 125, 130, 135, 140, 138, 130, 120];
    const { similarityPercent, alignmentDistance } = calculatePitchContourDTW(pitchTrack, pitchTrack);

    assert.strictEqual(alignmentDistance, 0);
    assert.strictEqual(similarityPercent, 100);
  });

  it('calculatePitchContourDTW: should calculate lower similarity for opposing pitch contours (e.g. rising vs falling intonation)', () => {
    const risingIntonation = [100, 110, 125, 140, 160, 180, 200];
    const fallingIntonation = [200, 180, 160, 140, 125, 110, 100];

    const { similarityPercent } = calculatePitchContourDTW(risingIntonation, fallingIntonation);
    assert.ok(similarityPercent < 60, `Opposing intonation should yield low similarity (got ${similarityPercent}%)`);
  });
});
