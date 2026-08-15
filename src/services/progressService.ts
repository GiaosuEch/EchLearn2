import { supabase } from '../lib/supabase';
import { syncQueue } from './syncQueueService';

export interface XPEvent {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt?: string;
}

export interface LessonCompletion {
  id?: string;
  userId: string;
  lessonId: string;
  completedAt: string;
}

export const progressService = {
  async addXPEvent(userId: string, amount: number, reason: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot add XP.');
      return;
    }
    
    // Top 0.1% Architecture: Queue offline events to prevent data loss
    await syncQueue.pushChange('xp_events', {
      user_id: userId,
      amount,
      reason,
      created_at: new Date().toISOString()
    });
    const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', userId).maybeSingle();
    if (profile) {
      await supabase.from('profiles').update({ total_xp: (profile.total_xp || 0) + amount }).eq('id', userId);
    }
  },

  async markLessonCompleted(userId: string, lessonId: string): Promise<void> {
    if (!userId || !lessonId || !supabase) return;

    // Top 0.1% Architecture: Queue offline events to prevent data loss
    await syncQueue.pushChange('lesson_attempts', {
      user_id: userId,
      lesson_id: lessonId,
      score: 100,
      status: 'completed',
      created_at: new Date().toISOString()
    });
  },

  async getCompletedLessons(userId: string): Promise<string[]> {
    if (!userId || !supabase) return [];

    const { data } = await supabase
      .from('lesson_attempts')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (data) {
      return data.map(item => item.lesson_id);
    }
    return [];
  },

  async getTodayXP(userId: string): Promise<number> {
    if (!supabase) return 0;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('xp_events')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', today);
    
    if (error || !data) return 0;
    return data.reduce((sum, e) => sum + e.amount, 0);
  },

  async hasClaimedDailyChest(userId: string): Promise<boolean> {
    if (!supabase) return false;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('xp_events')
      .select('id')
      .eq('user_id', userId)
      .eq('reason', 'Daily Reward Chest')
      .gte('created_at', today)
      .limit(1);
    return Boolean(data && data.length > 0);
  },

  async getTotalXP(userId: string): Promise<number> {
    if (!supabase) return 0;
    const { data, error } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return 0;
    return data.total_xp || 0;
  },

  calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 500) + 1;
  }
};
