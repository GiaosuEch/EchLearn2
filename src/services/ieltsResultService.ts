import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';

export const ieltsResultService = {
  async savePlacementResult(userId: string, bands: { listening: number; reading: number; writing: number; speaking: number; estimated: number }): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('ielts_placement_results').insert({
        user_id: userId,
        listening_score: bands.listening,
        reading_score: bands.reading,
        writing_score: bands.writing,
        speaking_score: bands.speaking,
        estimated_band: bands.estimated
      });
      return;
    }
    
    // Local fallback
    localDb.insert<any>('ielts_placement_results', {
      userId,
      ...bands,
      createdAt: new Date().toISOString()
    });
  },
  
  async getLatestPlacement(userId: string): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('ielts_placement_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    }
    
    // Local fallback
    const results = localDb.findByField<any>('ielts_placement_results', 'userId', userId);
    return results.length > 0 ? results[results.length - 1] : null;
  },

  async saveSkillAttempt(userId: string, skill: string, taskId: string | null, bandScore: number, feedback: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('ielts_skill_attempts').insert({
        user_id: userId,
        skill,
        task_id: taskId,
        band_score: bandScore,
        feedback
      });
      return;
    }
    
    localDb.insert<any>('ielts_skill_attempts', {
      userId,
      skill,
      taskId,
      bandScore,
      feedback,
      createdAt: new Date().toISOString()
    });
  }
};
