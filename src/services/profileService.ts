import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<User | null> {
    if (!supabase) {
      console.error("CRITICAL: Supabase is not configured.");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error || !data) return null;
      
      return {
        id: data.id,
        email: data.email,
        role: data.role === 'admin' ? 'admin' : 'user',
        isPro: Boolean(data.is_pro) || data.role === 'admin' || data.role === 'pro',
        subscriptionTier: data.subscription_tier || (data.is_pro ? 'pro' : 'free'),
        displayName: data.display_name,
        username: data.username,
        avatarUrl: data.avatar_url,
        bannerUrl: data.banner_url,
        bio: data.bio,
        nativeLanguage: data.native_language,
        interfaceLanguage: data.interface_language,
        targetLanguages: data.target_languages,
        level: data.level,
        xp: data.total_xp,
        streak: 0, // Should be fetched from streaks table
        createdAt: data.created_at,
        hearts: data.hearts,
        ieltsTargetBand: data.metadata?.ielts_target || 6.5,
        isPublicProfile: data.is_public_profile,
        customStatus: data.custom_status,
        profileTheme: data.profile_theme,
        badges: [],
        friends: [],
        joinedGroups: []
      };
    } catch (e) {
      console.error("Error fetching profile from Supabase:", e);
      return null;
    }
  },

  async getLeaderboard(limit = 10): Promise<{ id: string; name: string; username: string; avatar: string; xp: number; streak: number }[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, total_xp, email')
        .order('total_xp', { ascending: false })
        .limit(limit);
        
      if (error || !data) return [];

      return data.map((d: any) => {
        const isAdmin = d.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';
        const shortId = d.id ? String(d.id).slice(0, 6) : 'user';
        const username = d.username || (d.email ? d.email.split('@')[0] : `learner_${shortId}`);
        let name = d.display_name;
        if (isAdmin) {
          name = 'GiaosuEch (Admin)';
        } else if (!name || name === 'GiaosuEch' || name === 'Học Viên Ếch') {
          name = d.email ? d.email.split('@')[0] : (d.username || `Học Viên #${shortId}`);
        }
        return {
          id: d.id,
          name,
          username,
          avatar: d.avatar_url || '/mascots/mascot_frog_backpack.png',
          xp: d.total_xp || 0,
          streak: 0,
        };
      });
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      return [];
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    if (!supabase) return false;

    try {
      const dbUpdates: any = {};
      if (updates.displayName) dbUpdates.display_name = updates.displayName;
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.customStatus !== undefined) dbUpdates.custom_status = updates.customStatus;
      if (updates.profileTheme !== undefined) dbUpdates.profile_theme = updates.profileTheme;
      if (updates.nativeLanguage) dbUpdates.native_language = updates.nativeLanguage;
      if (updates.interfaceLanguage) dbUpdates.interface_language = updates.interfaceLanguage;
      if (updates.targetLanguages) dbUpdates.target_languages = updates.targetLanguages;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.xp !== undefined) dbUpdates.total_xp = updates.xp;
      if (updates.hearts !== undefined) dbUpdates.hearts = updates.hearts;
      if (updates.isPublicProfile !== undefined) dbUpdates.is_public_profile = updates.isPublicProfile;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) {
        console.warn(`PROFILE_UPDATE_WARN: ${error.message}`);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Network error during profile update", e);
      return false;
    }
  }
};
