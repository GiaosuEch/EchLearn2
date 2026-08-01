export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  nativeLanguage: string;
  interfaceLanguage?: string;
  targetLanguages: string[];
  ieltsTargetBand: number;
  xp: number;
  streak: number;
  level: number;
  hearts: number;
  badges: string[];
  joinedGroups: string[];
  friends: string[];
  isPublicProfile: boolean;
  bio: string;
  createdAt: string;
  profileTheme?: string;
  customStatus?: string;
  role?: 'user' | 'admin';
  subscriptionTier?: 'free' | 'go' | 'plus' | 'pro';
}

export interface UserStats {
  totalLessonsCompleted: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  listeningScore: number;
  speakingScore: number;
  readingScore: number;
  writingScore: number;
  vocabularyMastered: number;
  grammarTopicsCompleted: number;
  ieltsEstimatedBand: number;
  weeklyXP: number;
  monthlyXP: number;
  rank: number;
  league: LeagueTier;
  level: number;
  hearts: number;
  coins: number;
  gems: number;
}

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';

export interface Friend {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  level: number;
  isOnline: boolean;
  currentLanguage: string;
}

export interface Notification {
  id: string;
  type: 'streak' | 'achievement' | 'friend' | 'group' | 'lesson' | 'ielts' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
