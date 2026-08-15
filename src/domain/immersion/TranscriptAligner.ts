import type { TranscriptChunk } from '../../curriculum/contentTypes';
import { nlpBridge } from './NLPWorkerBridge';

export class TranscriptAligner {
  /**
   * (ASYNC) Finds the currently active transcript chunk based on the audio player's current time.
   * Execution is offloaded to a Web Worker to prevent UI thread blocking.
   */
  static async getActiveChunk(
    chunks: TranscriptChunk[],
    currentTimeSec: number
  ): Promise<TranscriptChunk | null> {
    return nlpBridge.getActiveChunk(chunks, currentTimeSec);
  }

  /**
   * Calculates the percentage completion of the current chunk for smooth visual progress bars.
   * This is lightweight enough to stay synchronous.
   */
  static getChunkProgress(chunk: TranscriptChunk, currentTimeSec: number): number {
    if (currentTimeSec < chunk.startTimeSec) return 0;
    if (currentTimeSec > chunk.endTimeSec) return 100;
    
    const duration = chunk.endTimeSec - chunk.startTimeSec;
    if (duration <= 0) return 100;

    return ((currentTimeSec - chunk.startTimeSec) / duration) * 100;
  }
}
