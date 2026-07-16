import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';

export const adminAnalyticsService = {
  async getDashboardMetrics(): Promise<any> {
    if (!isSupabaseConfigured() || !supabase) {
      return null; // Not supported in local mode
    }

    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active learners (e.g. users active today from streaks)
      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('streaks')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_date', today);

      // Fetch total posts
      const { count: postCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: userCount || 0,
        activeLearners: activeCount || 0,
        totalPosts: postCount || 0,
      };
    } catch (e) {
      console.error('Error fetching admin metrics', e);
      return null;
    }
  },

  async logAdminAction(adminId: string, action: string, targetId: string | null = null, metadata: any = null): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('admin_activity_logs').insert({
        admin_id: adminId,
        action,
        target_id: targetId,
        metadata
      });
      return;
    }
    
    localDb.insert<any>('admin_activity_logs', {
      adminId,
      action,
      targetId,
      metadata,
      createdAt: new Date().toISOString()
    });
  }
};
