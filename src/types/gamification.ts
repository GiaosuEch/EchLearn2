export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory =
  | 'streak'
  | 'xp'
  | 'lessons'
  | 'vocabulary'
  | 'grammar'
  | 'ielts'
  | 'social'
  | 'speaking'
  | 'writing'
  | 'special';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'vocabulary' | 'speaking' | 'writing' | 'quiz' | 'social';
  xpReward: number;
  coinsReward?: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt: string;
  rarity?: 'common' | 'rare' | 'epic';
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  xp: number;
  level: number;
  streak: number;
  league: string;
  isCurrentUser: boolean;
}

export interface League {
  id: string;
  name: string;
  icon: string;
  color: string;
  minXP: number;
  description: string;
}

export const LEAGUES: League[] = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', color: '#CD7F32', minXP: 0, description: 'Just getting started' },
  { id: 'silver', name: 'Silver', icon: '🥈', color: '#C0C0C0', minXP: 1000, description: 'Building momentum' },
  { id: 'gold', name: 'Gold', icon: '🥇', color: '#FFD700', minXP: 5000, description: 'Dedicated learner' },
  { id: 'platinum', name: 'Platinum', icon: '💎', color: '#E5E4E2', minXP: 15000, description: 'Language warrior' },
  { id: 'diamond', name: 'Diamond', icon: '💠', color: '#B9F2FF', minXP: 35000, description: 'Elite student' },
  { id: 'master', name: 'Master', icon: '👑', color: '#9B59B6', minXP: 75000, description: 'Language master' },
  { id: 'legend', name: 'Legend', icon: '🏆', color: '#FF6B6B', minXP: 150000, description: 'Living legend' },
];

export interface StreakDay {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
  isActive: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  questions: QuizQuestion[];
  timeLimit: number;
  xpReward: number;
  totalAttempts: number;
  bestScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  imageUrl?: string;
  mastery: number;
  lastReviewed?: string;
  nextReview?: string;
  deck: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  language: string;
  totalCards: number;
  masteredCards: number;
  dueCards: number;
  lastStudied?: string;
}
