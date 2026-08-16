import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserStats } from '../types';
import { useAuthStore } from './authStore';
import { progressService } from '../services/progressService';
import { recordMissionEvent } from '../services/missionProgressService';
import { calculateStudyStreak } from '../services/streakProgressService';

interface LearningState {
  stats: UserStats;
  dailyXPGoal: number;
  todayXP: number;
  weeklyTrend: { day: string; xp: number; minutes: number; lessons: number }[];
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
  weeklyTrend: [],

  addCoins: async (amount: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((s) => ({ stats: { ...s.stats, coins: (s.stats.coins || 0) + amount } }));
    if (isSupabaseConfigured() && supabase) {
      await supabase.rpc('increment_profile_coins', { amount_to_add: amount });
    }
  },
  
  addGems: async (amount: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((s) => ({ stats: { ...s.stats, gems: (s.stats.gems || 0) + amount } }));
    if (isSupabaseConfigured() && supabase) {
      await supabase.rpc('increment_profile_gems', { amount_to_add: amount });
    }
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
      const { error } = await supabase.rpc('record_study_day');
      if (error) throw new Error(error.message);
    } else {
      const key = `echlearn_local_streak_date_${user.id}`;
      const today = new Date().toISOString().slice(0, 10);
      const next = calculateStudyStreak({
        currentStreak: get().stats.currentStreak,
        longestStreak: get().stats.longestStreak,
        lastActiveDate: localStorage.getItem(key),
        studyDate: today,
      });
      if (next.didAdvance) {
        // Local mode doesn't save to a user database anymore, it just saves to localStorage
      }
      localStorage.setItem(key, next.lastActiveDate);
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
      const weeklyTrend = await progressService.getWeeklyXPTrend(user.id);

      if (isSupabaseConfigured() && supabase) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        // Fetch streaks
        const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle();
        // Fetch placement
        const { data: placementData } = await supabase.from('ielts_placement_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        
        set({
          todayXP,
          weeklyTrend,
          stats: {
            ...defaultStats,
            totalXP,
            coins: profileData?.coins ?? 100,
            gems: profileData?.gems ?? 10,
            hearts: profileData?.hearts ?? 5,
            currentStreak: streakData?.current_streak || 0,
            longestStreak: streakData?.longest_streak || 0,
            lastActiveDate: streakData?.last_active_date || undefined,
            level: progressService.calculateLevel(totalXP),
            ieltsEstimatedBand: placementData?.estimated_band || 0,
            listeningScore: placementData?.listening_score || 0,
            readingScore: placementData?.reading_score || 0,
            writingScore: placementData?.writing_score || 0,
            speakingScore: placementData?.speaking_score || 0,
          }
        });
      } else {
        // Local fallback (streaks are stored in localStorage now, we'll just set it to 0 initially if not tracking correctly)
        set({
          todayXP,
          weeklyTrend,
          stats: {
            ...defaultStats,
            totalXP,
            currentStreak: 0,
            lastActiveDate: localStorage.getItem(`echlearn_local_streak_date_${user.id}`) || undefined,
            level: progressService.calculateLevel(totalXP),
          }
        });
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }
}));
