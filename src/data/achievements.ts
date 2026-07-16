import type { Achievement, DailyMission, LeaderboardEntry, StreakDay } from '../types';

export const achievements: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first lesson', icon: '👣', category: 'lessons', condition: 'Complete 1 lesson', xpReward: 50, isUnlocked: true, unlockedAt: '2024-09-15', progress: 1, maxProgress: 1, rarity: 'common' },
  { id: 'a2', title: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', condition: '3-day streak', xpReward: 100, isUnlocked: true, unlockedAt: '2024-09-18', progress: 3, maxProgress: 3, rarity: 'common' },
  { id: 'a3', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', category: 'streak', condition: '7-day streak', xpReward: 200, isUnlocked: true, unlockedAt: '2024-09-22', progress: 7, maxProgress: 7, rarity: 'common' },
  { id: 'a4', title: 'Vocabulary Builder', description: 'Learn 50 new words', icon: '📚', category: 'vocabulary', condition: 'Learn 50 words', xpReward: 150, isUnlocked: true, unlockedAt: '2024-10-05', progress: 50, maxProgress: 50, rarity: 'common' },
  { id: 'a5', title: 'Vocabulary Master', description: 'Learn 100 new words', icon: '🎓', category: 'vocabulary', condition: 'Learn 100 words', xpReward: 300, isUnlocked: true, unlockedAt: '2024-11-01', progress: 100, maxProgress: 100, rarity: 'rare' },
  { id: 'a6', title: 'Grammar Guru', description: 'Complete 5 grammar topics', icon: '📝', category: 'grammar', condition: 'Complete 5 grammar topics', xpReward: 250, isUnlocked: false, progress: 3, maxProgress: 5, rarity: 'rare' },
  { id: 'a7', title: 'Social Butterfly', description: 'Make 5 friends', icon: '🦋', category: 'social', condition: 'Add 5 friends', xpReward: 150, isUnlocked: true, unlockedAt: '2024-10-15', progress: 5, maxProgress: 5, rarity: 'common' },
  { id: 'a8', title: 'IELTS Explorer', description: 'Start your IELTS journey', icon: '🗺️', category: 'ielts', condition: 'Complete first IELTS exercise', xpReward: 200, isUnlocked: true, unlockedAt: '2024-11-10', progress: 1, maxProgress: 1, rarity: 'rare' },
  { id: 'a9', title: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '💪', category: 'streak', condition: '14-day streak', xpReward: 400, isUnlocked: true, unlockedAt: '2025-01-15', progress: 14, maxProgress: 14, rarity: 'rare' },
  { id: 'a10', title: 'Month Master', description: 'Maintain a 30-day streak', icon: '🌟', category: 'streak', condition: '30-day streak', xpReward: 800, isUnlocked: false, progress: 14, maxProgress: 30, rarity: 'epic' },
  { id: 'a11', title: 'Century Club', description: 'Maintain a 100-day streak', icon: '💯', category: 'streak', condition: '100-day streak', xpReward: 2000, isUnlocked: false, progress: 14, maxProgress: 100, rarity: 'legendary' },
  { id: 'a12', title: 'Lesson Legend', description: 'Complete 100 lessons', icon: '📖', category: 'lessons', condition: 'Complete 100 lessons', xpReward: 500, isUnlocked: true, unlockedAt: '2024-12-20', progress: 100, maxProgress: 100, rarity: 'rare' },
  { id: 'a13', title: 'Speaking Star', description: 'Complete 20 speaking exercises', icon: '🎤', category: 'speaking', condition: 'Complete 20 speaking exercises', xpReward: 300, isUnlocked: false, progress: 12, maxProgress: 20, rarity: 'rare' },
  { id: 'a14', title: 'Writing Warrior', description: 'Submit 10 writing pieces', icon: '✍️', category: 'writing', condition: 'Submit 10 writing pieces', xpReward: 350, isUnlocked: false, progress: 6, maxProgress: 10, rarity: 'rare' },
  { id: 'a15', title: 'IELTS Band 5', description: 'Reach estimated IELTS band 5.0', icon: '🎯', category: 'ielts', condition: 'IELTS estimate >= 5.0', xpReward: 500, isUnlocked: true, unlockedAt: '2024-12-15', progress: 1, maxProgress: 1, rarity: 'rare' },
  { id: 'a16', title: 'IELTS Band 6', description: 'Reach estimated IELTS band 6.0', icon: '🏅', category: 'ielts', condition: 'IELTS estimate >= 6.0', xpReward: 800, isUnlocked: true, unlockedAt: '2025-01-10', progress: 1, maxProgress: 1, rarity: 'epic' },
  { id: 'a17', title: 'IELTS Band 7', description: 'Reach estimated IELTS band 7.0', icon: '🏆', category: 'ielts', condition: 'IELTS estimate >= 7.0', xpReward: 1500, isUnlocked: false, progress: 0, maxProgress: 1, rarity: 'epic' },
  { id: 'a18', title: 'Polyglot', description: 'Study 3 different languages', icon: '🌍', category: 'special', condition: 'Start 3 languages', xpReward: 500, isUnlocked: true, unlockedAt: '2024-11-05', progress: 3, maxProgress: 3, rarity: 'epic' },
  { id: 'a19', title: 'Group Leader', description: 'Create a study group', icon: '👥', category: 'social', condition: 'Create a study group', xpReward: 200, isUnlocked: false, progress: 0, maxProgress: 1, rarity: 'common' },
  { id: 'a20', title: 'Night Owl', description: 'Complete a lesson after midnight', icon: '🦉', category: 'special', condition: 'Lesson after midnight', xpReward: 100, isUnlocked: true, unlockedAt: '2024-10-28', progress: 1, maxProgress: 1, rarity: 'common' },
  { id: 'a21', title: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: '⚡', category: 'lessons', condition: '5 lessons in 1 day', xpReward: 300, isUnlocked: false, progress: 3, maxProgress: 5, rarity: 'rare' },
  { id: 'a22', title: 'Perfect Score', description: 'Get 100% on any quiz', icon: '💎', category: 'lessons', condition: '100% quiz score', xpReward: 250, isUnlocked: true, unlockedAt: '2024-10-10', progress: 1, maxProgress: 1, rarity: 'rare' },
  { id: 'a23', title: 'Early Bird', description: 'Complete a lesson before 7 AM', icon: '🌅', category: 'special', condition: 'Lesson before 7am', xpReward: 150, isUnlocked: false, progress: 0, maxProgress: 1, rarity: 'common' },
  { id: 'a24', title: 'Weekend Warrior', description: 'Study on Saturday and Sunday', icon: '🏖️', category: 'streak', condition: 'Study both weekend days', xpReward: 200, isUnlocked: false, progress: 1, maxProgress: 2, rarity: 'rare' },
  { id: 'a25', title: 'Grammar Grandmaster', description: 'Complete all grammar topics in a course', icon: '🏛️', category: 'grammar', condition: '100% grammar completion', xpReward: 1000, isUnlocked: false, progress: 4, maxProgress: 20, rarity: 'epic' },
  { id: 'a26', title: 'Vocab Virtuoso', description: 'Learn 500 new words', icon: '🧠', category: 'vocabulary', condition: 'Learn 500 words', xpReward: 1000, isUnlocked: false, progress: 120, maxProgress: 500, rarity: 'epic' },
  { id: 'a27', title: 'IELTS Band 8', description: 'Reach estimated IELTS band 8.0', icon: '🎓', category: 'ielts', condition: 'IELTS estimate >= 8.0', xpReward: 2500, isUnlocked: false, progress: 0, maxProgress: 1, rarity: 'legendary' },
  { id: 'a28', title: 'Flawless Week', description: 'Get 100% accuracy in all lessons for a week', icon: '✨', category: 'lessons', condition: '7 days flawless lessons', xpReward: 800, isUnlocked: false, progress: 2, maxProgress: 7, rarity: 'epic' },
  { id: 'a29', title: 'Chatterbox', description: 'Spend 1 hour in Voice Rooms', icon: '🎙️', category: 'social', condition: '60 mins in voice room', xpReward: 300, isUnlocked: false, progress: 15, maxProgress: 60, rarity: 'rare' },
  { id: 'a30', title: 'Ech Lern Champion', description: 'Reach the Diamond League', icon: '💠', category: 'special', condition: 'Diamond league', xpReward: 2000, isUnlocked: false, progress: 0, maxProgress: 1, rarity: 'legendary' },
];

export const dailyMissions: DailyMission[] = [
  { id: 'dm1', title: 'Complete 2 Lessons', description: 'Finish any 2 lessons today', type: 'lesson', xpReward: 30, coinsReward: 10, progress: 1, maxProgress: 2, isCompleted: false, expiresAt: '2025-01-16T00:00:00Z', rarity: 'common' },
  { id: 'dm2', title: 'Learn 5 New Words', description: 'Master 5 vocabulary words', type: 'vocabulary', xpReward: 20, coinsReward: 5, progress: 3, maxProgress: 5, isCompleted: false, expiresAt: '2025-01-16T00:00:00Z', rarity: 'common' },
  { id: 'dm3', title: 'Practice Speaking', description: 'Complete 1 speaking exercise', type: 'speaking', xpReward: 50, coinsReward: 20, progress: 0, maxProgress: 1, isCompleted: false, expiresAt: '2025-01-16T00:00:00Z', rarity: 'rare' },
  { id: 'dm4', title: 'Write a Paragraph', description: 'Submit 1 writing piece', type: 'writing', xpReward: 80, coinsReward: 30, progress: 0, maxProgress: 1, isCompleted: false, expiresAt: '2025-01-16T00:00:00Z', rarity: 'epic' },
  { id: 'dm5', title: 'Take a Quiz', description: 'Complete any quiz', type: 'quiz', xpReward: 20, coinsReward: 10, progress: 0, maxProgress: 1, isCompleted: false, expiresAt: '2025-01-16T00:00:00Z', rarity: 'common' },
];

export const leaderboard: LeaderboardEntry[] = [];

export const streakHistory: StreakDay[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const isActive = i >= 16;
  return {
    date: date.toISOString().split('T')[0],
    xpEarned: isActive ? Math.floor(Math.random() * 100) + 30 : 0,
    lessonsCompleted: isActive ? Math.floor(Math.random() * 4) + 1 : 0,
    isActive,
  };
});

