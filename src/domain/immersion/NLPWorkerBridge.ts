import type { TranscriptChunk, LexicalCollocation } from '../../curriculum/contentTypes';
import type { NLPWorkerRequest, NLPWorkerResponse } from './nlp.worker';
import { useMistakeNotebookStore } from '../../stores/mistakeNotebookStore';
import { capabilityDetector } from '../platform/capabilityDetector';

class NLPWorkerBridge {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();

  constructor() {
    this.initWorker();
    
    // HMR protection: Ensure old worker is terminated if the module hot-reloads
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        this.terminate();
      });
    }
  }

  private initWorker() {
    if (typeof window !== 'undefined' && !this.worker) {
      if (capabilityDetector.shouldDegradeGracefully()) {
        console.warn('Low-end device detected: Bypassing NLP Web Worker to preserve memory.');
        return;
      }
      this.worker = new Worker(new URL('./nlp.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = this.handleMessage.bind(this);
    }
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    // Reject all pending promises to prevent hanging UI
    this.pendingRequests.forEach((req) => req.reject(new Error('Worker terminated due to HMR')));
    this.pendingRequests.clear();
  }

  private handleMessage(e: MessageEvent<NLPWorkerResponse>) {
    const res = e.data;
    const pending = this.pendingRequests.get(res.payload.reqId);
    if (!pending) return;

    this.pendingRequests.delete(res.payload.reqId);

    if (res.type === 'ALIGN_RESULT') {
      pending.resolve(res.payload.chunk);
    } else if (res.type === 'DENSITY_RESULT') {
      pending.resolve(res.payload.density);
    } else if (res.type === 'SHADOWING_RESULT') {
      // The worker computed the mistake, now the main thread bridge commits it to the Zustand store
      const store = useMistakeNotebookStore.getState();
      store.addMistake({
        userId: 'lexical_engine_bot',
        ...res.payload.mistakePayload
      });
      pending.resolve({ action: res.payload.action, collocation: res.payload.collocation, word: res.payload.word });
    } else if (res.type === 'EVALUATION_RESULT') {
      // Evaluation is complete
      pending.resolve({
        isCorrect: res.payload.isCorrect,
        feedback: res.payload.feedback,
        matchedMistake: res.payload.matchedMistake,
        usedCollocations: res.payload.usedCollocations
      });
    }
  }

  private generateId() {
    return crypto.randomUUID();
  }

  public getActiveChunk(chunks: TranscriptChunk[], currentTimeSec: number): Promise<TranscriptChunk | null> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.initWorker();
      if (!this.worker) return resolve(null);
      const reqId = this.generateId();
      this.pendingRequests.set(reqId, { resolve, reject });
      this.worker.postMessage({ type: 'ALIGN_TRANSCRIPT', payload: { chunks, currentTimeSec, reqId } } as NLPWorkerRequest);
    });
  }

  public calculateLexicalDensity(text: string, languageCode: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.initWorker();
      if (!this.worker) return resolve(0);
      const reqId = this.generateId();
      this.pendingRequests.set(reqId, { resolve, reject });
      this.worker.postMessage({ type: 'CALCULATE_DENSITY', payload: { text, languageCode, reqId } } as NLPWorkerRequest);
    });
  }

  public processShadowingGap(failedWord: string, contextSentence: string, collocations: LexicalCollocation[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.initWorker();
      if (!this.worker) return resolve({ action: 'LOGGED_WORD_GAP', word: failedWord });
      const reqId = this.generateId();
      this.pendingRequests.set(reqId, { resolve, reject });
      this.worker.postMessage({ type: 'PROCESS_SHADOWING', payload: { failedWord, contextSentence, collocations, reqId } } as NLPWorkerRequest);
    });
  }

  public evaluatePedagogicalResponse(
    userAnswer: string,
    modelAnswer: string,
    commonMistakes?: string[],
    targetCollocations?: string[],
    languageCode?: string
  ): Promise<{ isCorrect: boolean; feedback: string; matchedMistake?: string; usedCollocations?: string[] }> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.initWorker();
      if (!this.worker) {
        return resolve({
          isCorrect: userAnswer.trim().toLowerCase() === modelAnswer.trim().toLowerCase(),
          feedback: userAnswer.trim().toLowerCase() === modelAnswer.trim().toLowerCase() ? 'Correct.' : 'Incorrect.'
        });
      }
      const reqId = this.generateId();
      this.pendingRequests.set(reqId, { resolve, reject });
      this.worker.postMessage({ 
        type: 'EVALUATE_PEDAGOGICAL_RESPONSE', 
        payload: { userAnswer, modelAnswer, commonMistakes, targetCollocations, languageCode, reqId } 
      } as NLPWorkerRequest);
    });
  }
}

export const nlpBridge = new NLPWorkerBridge();
