import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types';
import { userService } from './userService';

export const profileService = {
  async getProfile(userId: string): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error || !data) return null;
      
      return {
        id: data.id,
        email: data.email,
        // PRO gating reads these. Before they were dropped here, a granted PRO
        // account came back from Supabase looking like a free user.
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
    }
    
    // Local fallback
    return userService.getLocalUser(userId) || null;
  },

  async getLeaderboard(limit = 10): Promise<{ id: string; name: string; username: string; avatar: string; xp: number; streak: number }[]> {
    const list: { id: string; name: string; username: string; avatar: string; xp: number; streak: number }[] = [];

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, total_xp, email')
        .order('total_xp', { ascending: false })
        .limit(limit);
        
      if (!error && data && data.length > 0) {
        data.forEach((d: any) => {
          const isAdmin = d.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';
          const shortId = d.id ? String(d.id).slice(0, 6) : 'user';
          const username = d.username || (d.email ? d.email.split('@')[0] : `learner_${shortId}`);
          let name = d.display_name;
          if (isAdmin) {
            name = 'GiaosuEch (Admin)';
          } else if (!name || name === 'GiaosuEch' || name === 'Học Viên Ếch') {
            name = d.email ? d.email.split('@')[0] : (d.username || `Học Viên #${shortId}`);
          }
          list.push({
            id: d.id,
            name,
            username,
            avatar: d.avatar_url || '/mascots/mascot_frog_backpack.png',
            xp: d.total_xp || 0,
            streak: 0,
          });
        });
      }
    }
    
    // Merge Local database users
    const localUsers = userService.getAllLocalUsers();
    localUsers.forEach((u: any) => {
      const isAdmin = u.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';
      const shortId = u.id ? String(u.id).slice(0, 6) : 'user';
      const username = u.username || (u.email ? u.email.split('@')[0] : `learner_${shortId}`);
      let name = u.displayName;
      if (isAdmin) {
        name = 'GiaosuEch (Admin)';
      } else if (!name || name === 'GiaosuEch' || name === 'Học Viên Ếch') {
        name = u.email ? u.email.split('@')[0] : (u.username || `Học Viên #${shortId}`);
      }
      if (!list.some(existing => existing.id === u.id)) {
        list.push({
          id: u.id,
          name,
          username,
          avatar: u.avatarUrl || '/mascots/pepe_mascot_avatar.png',
          xp: typeof u.xp === 'number' ? u.xp : 0,
          streak: typeof u.streak === 'number' ? u.streak : 0,
        });
      }
    });

    // Default community learners to ensure Leaderboard is vibrant & full
    const defaultCommunity = [
      { id: 'bot_001', name: 'Hoàng Yến (IELTS 8.5)', avatar: '/mascots/pepe_mascot_tutor.png', xp: 3250, streak: 45 },
      { id: 'bot_002', name: 'Minh Anh (IELTS 8.0)', avatar: '/mascots/pepe_mascot_celebrate.png', xp: 2890, streak: 32 },
      { id: 'bot_003', name: 'Kenji Neko (N2)', avatar: '/mascots/pepe_mascot_avatar.png', xp: 2100, streak: 19 },
      { id: 'bot_004', name: 'Alex Speaking Coach', avatar: '/mascots/pepe_mascot_thinking.png', xp: 1850, streak: 14 },
    ];

    defaultCommunity.forEach(bot => {
      if (!list.some(existing => existing.id === bot.id)) {
        list.push(bot);
      }
    });

    return list.sort((a, b) => b.xp - a.xp).slice(0, limit);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
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
        .upsert({ id: userId, ...dbUpdates }, { onConflict: 'id' })
        .select('id')
        .maybeSingle();

      if (error) {
        console.warn(`PROFILE_UPDATE_WARN: ${error.message}`);
      }

      return true;
    }

    // Local fallback
    const user = userService.getLocalUser(userId);
    if (user) {
      userService.updateLocalUser(userId, updates);
      return true;
    }
    return false;
  }
};
