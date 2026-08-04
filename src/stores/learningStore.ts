import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserStats } from '../types';
import { useAuthStore } from './authStore';
import { progressService } from '../services/progressService';
import { userService } from '../services/userService';
import { recordMissionEvent } from '../services/missionProgressService';

interface LearningState {
  stats: UserStats;
  dailyXPGoal: number;
  todayXP: number;
  addXP: (amount: number, reason: string) => Promise<void>;
  incrementStreak: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setIELTSBand: (band: number) => Promise<void>;
}

const defaultStats: UserStats = {
  totalLessonsCompleted: 0,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  listeningScore: 0,
  speakingScore: 0,
  readingScore: 0,
  writingScore: 0,
  vocabularyMastered: 0,
  grammarTopicsCompleted: 0,
  ieltsEstimatedBand: 0,
  weeklyXP: 0,
  monthlyXP: 0,
  rank: 0,
  league: 'bronze',
  level: 1,
  hearts: 5,
  coins: 100, // starting coins
  gems: 10,
};

export const useLearningStore = create<LearningState & { addCoins: (amount: number) => void; addGems: (amount: number) => void }>((set, get) => ({
  stats: defaultStats,
  dailyXPGoal: 50,
  todayXP: 0,

  addCoins: (amount: number) => {
    set((s) => ({ stats: { ...s.stats, coins: (s.stats.coins || 0) + amount } }));
  },
  
  addGems: (amount: number) => {
    set((s) => ({ stats: { ...s.stats, gems: (s.stats.gems || 0) + amount } }));
  },

  addXP: async (amount: number, reason: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await progressService.addXPEvent(user.id, amount, reason);

    // Daily XP missions ("Earn 150 XP today") are driven from here, so every
    // XP award anywhere in the app advances them without extra wiring.
    recordMissionEvent({ userId: user.id, type: 'xp', amount, source: reason });

    await get().fetchStats();
  },

  incrementStreak: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    if (isSupabaseConfigured() && supabase) {
      const newStreak = get().stats.currentStreak + 1;
      await supabase.from('streaks').upsert({ 
        user_id: user.id, 
        current_streak: newStreak,
        last_active_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id' });
    } else {
      const newStreak = get().stats.currentStreak + 1;
      userService.updateLocalUser(user.id, { streak: newStreak });
    }
    await get().fetchStats();
  },

  updateStats: async (updates) => {
    set((s) => ({
      stats: { ...s.stats, ...updates },
    }));
  },

  setIELTSBand: async (band: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // update local state
    set((s) => ({ stats: { ...s.stats, ieltsEstimatedBand: band } }));
    
    // We would use ieltsResultService here in a real app
    // e.g. ieltsResultService.savePlacementResult(...)
  },

  fetchStats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ stats: defaultStats, todayXP: 0 });
      return;
    }

    try {
      const totalXP = await progressService.getTotalXP(user.id);
      const todayXP = await progressService.getTodayXP(user.id);

      if (isSupabaseConfigured() && supabase) {
        // Fetch streaks
        const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle();
        // Fetch placement
        const { data: placementData } = await supabase.from('ielts_placement_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        
        set({
          todayXP,
          stats: {
            ...defaultStats,
            totalXP,
            currentStreak: streakData?.current_streak || 0,
            longestStreak: streakData?.longest_streak || 0,
            level: progressService.calculateLevel(totalXP),
            ieltsEstimatedBand: placementData?.estimated_band || 0,
            listeningScore: placementData?.listening_score || 0,
            readingScore: placementData?.reading_score || 0,
            writingScore: placementData?.writing_score || 0,
            speakingScore: placementData?.speaking_score || 0,
          }
        });
      } else {
        // Local fallback
        const localUser = userService.getLocalUser(user.id);
        set({
          todayXP,
          stats: {
            ...defaultStats,
            totalXP,
            currentStreak: localUser?.streak || 0,
            level: progressService.calculateLevel(totalXP),
          }
        });
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }
}));
