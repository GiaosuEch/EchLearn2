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
  },

  async getWeeklyXPTrend(userId: string): Promise<{ day: string; xp: number; minutes: number; lessons: number }[]> {
    if (!supabase) return [];
    
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6); // Last 7 days including today
    const dateStr = lastWeek.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('xp_events')
      .select('amount, created_at, reason')
      .eq('user_id', userId)
      .gte('created_at', dateStr);

    if (error || !data) return [];

    // Initialize 7 days
    const daysMap: Record<string, { name: string; xp: number; minutes: number; lessons: number }> = {};
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(lastWeek);
      d.setDate(lastWeek.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const name = dayNames[d.getDay()];
      daysMap[iso] = { name, xp: 0, minutes: 0, lessons: 0 };
    }

    // Aggregate
    data.forEach((evt) => {
      const d = evt.created_at.split('T')[0];
      if (daysMap[d]) {
        daysMap[d].xp += evt.amount;
        // rough estimate: 10 XP = 1 minute, 20 XP = 1 lesson
        daysMap[d].minutes += Math.round(evt.amount / 10);
        daysMap[d].lessons += Math.round(evt.amount / 20);
      }
    });

    return Object.keys(daysMap).sort().map(k => ({
      day: daysMap[k].name,
      xp: daysMap[k].xp,
      minutes: daysMap[k].minutes,
      lessons: daysMap[k].lessons,
    }));
  }
};
