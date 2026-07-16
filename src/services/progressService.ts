import { localDb } from '../lib/storage/localDatabase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface XPEvent {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt?: string;
}

export const progressService = {
  async addXPEvent(userId: string, amount: number, reason: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('xp_events').insert({
        user_id: userId,
        amount,
        reason
      });
      // Update profile XP directly or trigger an RPC in a real prod app
      const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', userId).single();
      if (profile) {
        await supabase.from('profiles').update({ total_xp: profile.total_xp + amount }).eq('id', userId);
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

    // Local fallback
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
        .single();
      if (error || !data) return 0;
      return data.total_xp || 0;
    }

    // Local fallback
    const events = localDb.findByField<XPEvent>('xp_events', 'userId', userId);
    return events.reduce((sum, e) => sum + e.amount, 0);
  },

  calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 500) + 1;
  }
};
