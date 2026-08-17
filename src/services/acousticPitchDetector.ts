/**
 * Acoustic Phonetics & Fundamental Frequency (F0) Pitch Tracking Engine
 * 
 * Implements real-time pitch detection using the YIN / Autocorrelation method
 * and Dynamic Time Warping (DTW) for pitch contour and intonation alignment.
 */

export interface PitchFrame {
  timestampMs: number;
  pitchHz: number;
  clarity: number; // 0.0 to 1.0 (confidence of periodicity)
}

export interface PitchAnalysisResult {
  frames: PitchFrame[];
  averagePitchHz: number;
  minPitchHz: number;
  maxPitchHz: number;
  voicedFrameRatio: number;
}

/**
 * Computes fundamental frequency (F0 in Hz) from a PCM audio buffer using Normalized Autocorrelation.
 * 
 * @param buffer Raw audio samples (Float32Array)
 * @param sampleRate Audio sampling rate (e.g. 44100 or 48000 Hz)
 * @param minPitch Minimum detectable pitch in Hz (default 65 Hz - human low pitch)
 * @param maxPitch Maximum detectable pitch in Hz (default 500 Hz - human high pitch)
 * @param threshold Voicing clarity threshold (default 0.2)
 */
export function detectPitchAutocorrelation(
  buffer: Float32Array,
  sampleRate: number,
  minPitch: number = 65,
  maxPitch: number = 500,
  threshold: number = 0.2
): { pitchHz: number; clarity: number } {
  const size = buffer.length;
  const maxShift = Math.floor(sampleRate / minPitch);
  const minShift = Math.floor(sampleRate / maxPitch);

  if (size < maxShift * 2) {
    return { pitchHz: 0, clarity: 0 };
  }

  // Calculate RMS energy to ensure frame is not pure silence
  let sumSq = 0;
  for (let i = 0; i < size; i++) {
    sumSq += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSq / size);
  if (rms < 0.01) {
    return { pitchHz: 0, clarity: 0 }; // Silence / unvoiced
  }

  // Normalized Cross-Correlation Difference
  const diffs = new Float32Array(maxShift + 1);
  for (let shift = minShift; shift <= maxShift; shift++) {
    let diff = 0;
    for (let i = 0; i < size - shift; i++) {
      const delta = buffer[i] - buffer[i + shift];
      diff += delta * delta;
    }
    diffs[shift] = diff / (size - shift);
  }

  // Cumulative Mean Normalized Difference (YIN step)
  let runningSum = 0;
  diffs[0] = 1;
  const cmndf = new Float32Array(maxShift + 1);
  cmndf[0] = 1;

  for (let shift = 1; shift <= maxShift; shift++) {
    runningSum += diffs[shift];
    cmndf[shift] = runningSum > 0 ? (diffs[shift] * shift) / runningSum : 1;
  }

  // Find absolute minimum below threshold
  let bestShift = -1;
  for (let shift = minShift; shift <= maxShift; shift++) {
    if (cmndf[shift] < threshold) {
      while (shift + 1 <= maxShift && cmndf[shift + 1] < cmndf[shift]) {
        shift++;
      }
      bestShift = shift;
      break;
    }
  }

  // If no dip below threshold, fallback to global minimum
  if (bestShift === -1) {
    let minVal = 1.0;
    for (let shift = minShift; shift <= maxShift; shift++) {
      if (cmndf[shift] < minVal) {
        minVal = cmndf[shift];
        bestShift = shift;
      }
    }
    if (minVal > 0.4) {
      return { pitchHz: 0, clarity: 0 }; // Unvoiced sound
    }
  }

  // Parabolic interpolation for fine sub-sample resolution
  let refinedShift = bestShift;
  if (bestShift > minShift && bestShift < maxShift) {
    const s0 = cmndf[bestShift - 1];
    const s1 = cmndf[bestShift];
    const s2 = cmndf[bestShift + 1];
    const delta = (s0 - s2) / (2 * (s0 - 2 * s1 + s2));
    if (Math.abs(delta) < 1) {
      refinedShift += delta;
    }
  }

  const pitchHz = sampleRate / refinedShift;
  const clarity = Math.max(0, Math.min(1.0, 1.0 - cmndf[bestShift]));

  return {
    pitchHz: pitchHz >= minPitch && pitchHz <= maxPitch ? Math.round(pitchHz * 10) / 10 : 0,
    clarity: Math.round(clarity * 100) / 100
  };
}

/**
 * Calculates Dynamic Time Warping (DTW) distance between two pitch sequences.
 * Normalizes pitch trajectories and computes intonation contour match score (0 to 100%).
 */
export function calculatePitchContourDTW(
  targetPitchTrack: number[],
  learnerPitchTrack: number[]
): { alignmentDistance: number; similarityPercent: number } {
  // Filter out unvoiced frames for core intonation comparison
  const seqA = targetPitchTrack.filter(p => p > 40);
  const seqB = learnerPitchTrack.filter(p => p > 40);

  if (seqA.length === 0 || seqB.length === 0) {
    return { alignmentDistance: 100, similarityPercent: 0 };
  }

  // Normalize sequences to semitone deviations from their respective median pitches
  const medianA = getMedian(seqA);
  const medianB = getMedian(seqB);

  const normA = seqA.map(p => 12 * Math.log2(p / medianA));
  const normB = seqB.map(p => 12 * Math.log2(p / medianB));

  const n = normA.length;
  const m = normB.length;

  // Initialize DTW cost matrix
  const dtw: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.abs(normA[i - 1] - normB[j - 1]);
      dtw[i][j] = cost + Math.min(
        dtw[i - 1][j],     // Insertion
        dtw[i][j - 1],     // Deletion
        dtw[i - 1][j - 1]  // Match
      );
    }
  }

  const totalDistance = dtw[n][m];
  const normalizedDistance = totalDistance / (n + m);

  // Convert distance in semitones to a similarity score (0 to 100%)
  // A difference of 1.5 semitones is natural variation; > 6 semitones is poor intonation
  const similarityPercent = Math.max(0, Math.min(100, Math.round((1 - (normalizedDistance / 6)) * 100)));

  return {
    alignmentDistance: Math.round(normalizedDistance * 100) / 100,
    similarityPercent
  };
}

function getMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
