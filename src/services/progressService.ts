import { localDb } from '../lib/storage/localDatabase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { userService } from './userService';

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
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('xp_events').insert({
        user_id: userId,
        amount,
        reason
      });
      const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', userId).maybeSingle();
      if (profile) {
        await supabase.from('profiles').update({ total_xp: (profile.total_xp || 0) + amount }).eq('id', userId);
      }
      return;
    }

    // Local fallback
    localDb.insert<XPEvent>('xp_events', {
      userId,
      amount,
      reason,
      createdAt: new Date().toISOString()
    });
  },

  async markLessonCompleted(userId: string, lessonId: string): Promise<void> {
    if (!userId || !lessonId) return;

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('lesson_attempts').insert({
        user_id: userId,
        lesson_id: lessonId,
        score: 100,
        status: 'completed',
        created_at: new Date().toISOString()
      });
    }

    // Always store locally as well for instant UI response
    const existing = localDb.findByField<LessonCompletion>('lesson_completions', 'userId', userId);
    if (!existing.some(item => item.lessonId === lessonId)) {
      localDb.insert<LessonCompletion>('lesson_completions', {
        userId,
        lessonId,
        completedAt: new Date().toISOString()
      });
    }
  },

  async getCompletedLessons(userId: string): Promise<string[]> {
    if (!userId) return [];

    let remoteLessons: string[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('lesson_attempts')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('status', 'completed');
      if (data) {
        remoteLessons = data.map(item => item.lesson_id);
      }
    }

    const localItems = localDb.findByField<LessonCompletion>('lesson_completions', 'userId', userId);
    const localLessons = localItems.map(item => item.lessonId);

    return Array.from(new Set([...remoteLessons, ...localLessons]));
  },

  async getTodayXP(userId: string): Promise<number> {
    if (isSupabaseConfigured() && supabase) {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('xp_events')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', today);
      
      if (error || !data) return 0;
      return data.reduce((sum, e) => sum + e.amount, 0);
    }

    const events = localDb.findByField<XPEvent>('xp_events', 'userId', userId);
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.createdAt?.startsWith(today))
      .reduce((sum, e) => sum + e.amount, 0);
  },

  async hasClaimedDailyChest(userId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('xp_events')
        .select('id')
        .eq('user_id', userId)
        .eq('reason', 'Daily Reward Chest')
        .gte('created_at', today)
        .limit(1);
      return Boolean(data && data.length > 0);
    }
    const events = localDb.findByField<XPEvent>('xp_events', 'userId', userId);
    const today = new Date().toISOString().split('T')[0];
    return events.some(e => e.createdAt?.startsWith(today) && e.reason === 'Daily Reward Chest');
  },

  async getTotalXP(userId: string): Promise<number> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();
      if (error || !data) return 0;
      return data.total_xp || 0;
    }

    const events = localDb.findByField<XPEvent>('xp_events', 'userId', userId);
    const eventXP = events.reduce((sum, e) => sum + (e.amount || 0), 0);
    if (eventXP > 0) return eventXP;

    const localUser = userService.getLocalUser(userId);
    return localUser?.xp ?? 0;
  },

  calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 500) + 1;
  }
};
