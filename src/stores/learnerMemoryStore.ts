import { create } from 'zustand';
import { type IELTSFeedback, type IELTSScoringMetrics } from '../domain/ielts/ScoringEngine';
import { supabase } from '../lib/supabase';

export interface EssaySubmission {
  id: string;
  userId?: string;
  taskId: string;
  timestamp: number;
  text: string;
  metrics: IELTSScoringMetrics;
  feedback: IELTSFeedback;
  sync_status?: 'synced' | 'pending';
}

interface LearnerMemoryState {
  writingSubmissions: EssaySubmission[];
  
  // Actions
  addSubmission: (userId: string, submission: Omit<EssaySubmission, 'id' | 'timestamp' | 'sync_status' | 'userId'>) => Promise<void>;
  fetchSubmissions: (userId: string) => Promise<void>;
  syncPendingSubmissions: () => Promise<void>;
  
  // Selectors/Computed
  getAverageBandScore: () => number;
  getRecommendedLessons: () => string[];
  clearMemory: () => void;
}

const learnerMemoryStoreCore = (set: any, get: any) => ({
  writingSubmissions: [],
  
  fetchSubmissions: async (userId: string) => {
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { data, error } = await supabase
        .from('ielts_essay_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (!error && data) {
        const remoteSubmissions: EssaySubmission[] = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          taskId: row.task_id,
          timestamp: Number(row.timestamp),
          text: row.text,
          metrics: row.metrics,
          feedback: row.feedback,
          sync_status: 'synced'
        }));
        
        const pending = get().writingSubmissions.filter((s: EssaySubmission) => s.sync_status === 'pending');
        set({ writingSubmissions: [...pending, ...remoteSubmissions] });
        
        void get().syncPendingSubmissions();
      }
    } catch (error) {
      console.error("Failed to fetch essay submissions", error);
    }
  },

  syncPendingSubmissions: async () => {
    const { writingSubmissions } = get();
    const pending = writingSubmissions.filter((s: EssaySubmission) => s.sync_status === 'pending');
    
    if (pending.length === 0) return;
    if (!supabase) return;

    try {
      const payload = pending.map((sub: EssaySubmission) => ({
        id: sub.id,
        user_id: sub.userId,
        task_id: sub.taskId,
        timestamp: sub.timestamp,
        text: sub.text,
        metrics: sub.metrics,
        feedback: sub.feedback
      }));

      const { error } = await supabase
        .from('ielts_essay_submissions')
        .upsert(payload, { onConflict: 'id' });

      if (!error) {
        set((state: LearnerMemoryState) => ({
          writingSubmissions: state.writingSubmissions.map(s => s.sync_status === 'pending' ? { ...s, sync_status: 'synced' } : s)
        }));
      } else {
        console.error("Server rejected submission sync", error);
      }
    } catch (error) {
      console.error("Network error during submission sync", error);
    }
  },

  addSubmission: async (userId: string, submission: Omit<EssaySubmission, 'id' | 'timestamp' | 'sync_status' | 'userId'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const newSubmission: EssaySubmission = {
      ...submission,
      id,
      userId,
      timestamp,
      sync_status: 'pending'
    };
    
    // Optimistic Update
    set((state: LearnerMemoryState) => ({
      writingSubmissions: [newSubmission, ...state.writingSubmissions]
    }));

    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { error } = await supabase
        .from('ielts_essay_submissions')
        .insert({
          id: newSubmission.id,
          user_id: userId,
          task_id: newSubmission.taskId,
          timestamp: newSubmission.timestamp,
          text: newSubmission.text,
          metrics: newSubmission.metrics,
          feedback: newSubmission.feedback
        });

      if (!error) {
        set((state: LearnerMemoryState) => ({
          writingSubmissions: state.writingSubmissions.map(s => s.id === id ? { ...s, sync_status: 'synced' } : s)
        }));
      } else {
        console.error("Failed to sync new submission", error);
      }
    } catch (error) {
      console.error("Network error during submission sync", error);
    }
  },
  
  getAverageBandScore: () => {
    const { writingSubmissions } = get();
    if (writingSubmissions.length === 0) return 0;
    
    const total = writingSubmissions.reduce((sum: number, sub: EssaySubmission) => sum + sub.feedback.band, 0);
    return Math.round((total / writingSubmissions.length) * 2) / 2; // Round to nearest 0.5
  },
  
  getRecommendedLessons: () => {
    const { writingSubmissions } = get();
    if (writingSubmissions.length === 0) return ['IELTS Writing Task 1 Basics', 'IELTS Writing Task 2 Structures'];
    
    // Analyze the latest 3 submissions to find weaknesses
    const recent = writingSubmissions.slice(0, 3); // Since it's ordered descending by timestamp
    
    let avgTa = 0, avgCc = 0, avgLr = 0, avgGra = 0;
    recent.forEach((sub: EssaySubmission) => {
      avgTa += sub.feedback.criteria.ta.score;
      avgCc += sub.feedback.criteria.cc.score;
      avgLr += sub.feedback.criteria.lr.score;
      avgGra += sub.feedback.criteria.gra.score;
    });
    
    const count = recent.length;
    avgTa /= count;
    avgCc /= count;
    avgLr /= count;
    avgGra /= count;
    
    const recommendations: string[] = [];
    
    if (avgTa < 6.5) recommendations.push('Mastering Task Response & Word Count');
    if (avgCc < 6.5) recommendations.push('Cohesive Devices: Linking Your Ideas');
    if (avgLr < 6.5) recommendations.push('Academic Vocabulary Booster');
    if (avgGra < 6.5) recommendations.push('Complex Sentences for Band 7+');
    
    // If they are scoring high everywhere, give them advanced lessons
    if (recommendations.length === 0) {
      recommendations.push('Band 8.0+ Nuances in Opinion Essays');
      recommendations.push('Advanced Lexical Resource: Idiomatic Phrasing');
    }
    
    return recommendations;
  },
  
  clearMemory: () => {
    set({ writingSubmissions: [] });
  }
});

// We completely remove Zustand Persist (LocalStorage), enforcing Single Source of Truth
export const useLearnerMemoryStore = create<LearnerMemoryState>()(learnerMemoryStoreCore);

// Offline Sync Hook for Learner Memory
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useLearnerMemoryStore.getState().syncPendingSubmissions().catch(console.error);
  });
}
