import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';

export type UserSettingsRecord = {
  id?: string;
  userId: string;
  interfaceLanguage: string;
  nativeLanguage: string;
  targetLanguage: string;
  theme: 'dark' | 'light';
  soundEffects: boolean;
  speechSpeed: 'normal' | 'slow';
  fontSize: 'small' | 'medium' | 'large';
  dailyXpGoal: number;
  ieltsTargetBand: number;
  publicProfile: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowGroupInvites: boolean;
  accentPaletteId?: string;
  mascotSkinId?: string;
  uiSurface?: 'glass' | 'solid' | 'cozy' | 'compact';
  mascotAnimation?: boolean;
  seasonalEffects?: boolean;
};

const toDb = (settings: Partial<UserSettingsRecord>) => ({
  interface_language: settings.interfaceLanguage,
  native_language: settings.nativeLanguage,
  target_language: settings.targetLanguage,
  theme: settings.theme,
  sound_effects: settings.soundEffects,
  speech_speed: settings.speechSpeed,
  font_size: settings.fontSize,
  daily_xp_goal: settings.dailyXpGoal,
  ielts_target_band: settings.ieltsTargetBand,
  public_profile: settings.publicProfile,
  show_online_status: settings.showOnlineStatus,
  allow_friend_requests: settings.allowFriendRequests,
  allow_group_invites: settings.allowGroupInvites,
  accent_palette_id: settings.accentPaletteId,
  mascot_skin_id: settings.mascotSkinId,
  ui_surface: settings.uiSurface,
  mascot_animation: settings.mascotAnimation,
  seasonal_effects: settings.seasonalEffects,
});

const fromDb = (row: any): UserSettingsRecord => ({
  userId: row.user_id,
  interfaceLanguage: row.interface_language || 'vi',
  nativeLanguage: row.native_language || 'vi',
  targetLanguage: row.target_language || 'en',
  theme: row.theme || 'light',
  soundEffects: row.sound_effects ?? true,
  speechSpeed: row.speech_speed || 'normal',
  fontSize: row.font_size || 'medium',
  dailyXpGoal: row.daily_xp_goal || 50,
  ieltsTargetBand: Number(row.ielts_target_band || 7.0),
  publicProfile: row.public_profile ?? true,
  showOnlineStatus: row.show_online_status ?? true,
  allowFriendRequests: row.allow_friend_requests ?? true,
  allowGroupInvites: row.allow_group_invites ?? true,
  accentPaletteId: row.accent_palette_id || 'frog-default',
  mascotSkinId: row.mascot_skin_id || 'frog-starter-001',
  uiSurface: row.ui_surface || 'glass',
  mascotAnimation: row.mascot_animation ?? true,
  seasonalEffects: row.seasonal_effects ?? true,
});

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettingsRecord | null> {
    const local = localDb.findByField<UserSettingsRecord>('user_settings', 'userId', userId);
    if (local && local.length > 0) {
      return local[0];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
        if (!error && data) return fromDb(data);
      } catch {
        // Ignore Supabase connection errors in local fallback mode
      }
    }

    return null;
  },

  async saveSettings(userId: string, settings: Partial<UserSettingsRecord>): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        ...toDb(settings),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      return !error;
    }

    const table = localDb.getTable<UserSettingsRecord>('user_settings');
    const index = table.findIndex((row) => row.userId === userId);
    if (index >= 0) {
      table[index] = { ...table[index], ...settings, id: table[index].id || userId, userId };
      localDb.saveTable('user_settings', table);
    } else {
      localDb.insert<UserSettingsRecord>('user_settings', { id: userId, userId, ...settings } as UserSettingsRecord);
    }
    return true;
  },
};
