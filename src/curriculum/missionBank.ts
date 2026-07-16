export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  target: number;
  type: 'xp' | 'lessons' | 'perfect_lessons' | 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar';
  reward: number; // XP reward
  rarity: 'common' | 'rare' | 'epic';
}

export const missionTemplates: MissionTemplate[] = [
  // XP Missions (Common)
  { id: 'm1', title: 'Earn 50 XP', description: 'Earn 50 XP today across any activities', target: 50, type: 'xp', reward: 10, rarity: 'common' },
  { id: 'm2', title: 'Earn 100 XP', description: 'Earn 100 XP today across any activities', target: 100, type: 'xp', reward: 20, rarity: 'common' },
  { id: 'm3', title: 'Earn 150 XP', description: 'Earn 150 XP today across any activities', target: 150, type: 'xp', reward: 30, rarity: 'common' },
  { id: 'm4', title: 'Earn 200 XP', description: 'Earn 200 XP today across any activities', target: 200, type: 'xp', reward: 40, rarity: 'common' },
  
  // Lesson Completion Missions
  { id: 'm5', title: 'Complete 1 Lesson', description: 'Finish any lesson', target: 1, type: 'lessons', reward: 15, rarity: 'common' },
  { id: 'm6', title: 'Complete 3 Lessons', description: 'Finish 3 lessons today', target: 3, type: 'lessons', reward: 30, rarity: 'rare' },
  { id: 'm7', title: 'Complete 5 Lessons', description: 'Finish 5 lessons today', target: 5, type: 'lessons', reward: 50, rarity: 'epic' },

  // Perfect Lessons
  { id: 'm8', title: 'Perfect Score', description: 'Complete 1 lesson with 100% accuracy', target: 1, type: 'perfect_lessons', reward: 25, rarity: 'rare' },
  { id: 'm9', title: 'Flawless Learner', description: 'Complete 3 lessons with 100% accuracy', target: 3, type: 'perfect_lessons', reward: 75, rarity: 'epic' },

  // Skill specific - Vocabulary
  { id: 'm10', title: 'Vocab Novice', description: 'Learn 10 new words', target: 10, type: 'vocabulary', reward: 15, rarity: 'common' },
  { id: 'm11', title: 'Vocab Master', description: 'Learn 30 new words', target: 30, type: 'vocabulary', reward: 40, rarity: 'rare' },
  { id: 'm12', title: 'Dictionary Brain', description: 'Learn 50 new words', target: 50, type: 'vocabulary', reward: 75, rarity: 'epic' },

  // Skill specific - Grammar
  { id: 'm13', title: 'Grammar Focus', description: 'Complete 2 grammar exercises', target: 2, type: 'grammar', reward: 20, rarity: 'common' },
  { id: 'm14', title: 'Rule Follower', description: 'Complete 5 grammar exercises', target: 5, type: 'grammar', reward: 45, rarity: 'rare' },

  // Skill specific - Listening
  { id: 'm15', title: 'Good Listener', description: 'Complete 3 listening exercises', target: 3, type: 'listening', reward: 25, rarity: 'common' },
  { id: 'm16', title: 'Eagle Ears', description: 'Complete 10 listening exercises', target: 10, type: 'listening', reward: 50, rarity: 'rare' },

  // Skill specific - Speaking
  { id: 'm17', title: 'Speak Up', description: 'Complete 3 speaking exercises', target: 3, type: 'speaking', reward: 30, rarity: 'common' },
  { id: 'm18', title: 'Chatterbox', description: 'Complete 10 speaking exercises', target: 10, type: 'speaking', reward: 60, rarity: 'rare' },
  { id: 'm19', title: 'Native Tongue', description: 'Complete 20 speaking exercises', target: 20, type: 'speaking', reward: 100, rarity: 'epic' },

  // Skill specific - Reading
  { id: 'm20', title: 'Bookworm', description: 'Complete 3 reading exercises', target: 3, type: 'reading', reward: 25, rarity: 'common' },
  { id: 'm21', title: 'Avid Reader', description: 'Complete 10 reading exercises', target: 10, type: 'reading', reward: 50, rarity: 'rare' },

  // Skill specific - Writing
  { id: 'm22', title: 'Pen Pal', description: 'Complete 3 writing exercises', target: 3, type: 'writing', reward: 25, rarity: 'common' },
  { id: 'm23', title: 'Author', description: 'Complete 10 writing exercises', target: 10, type: 'writing', reward: 50, rarity: 'rare' },
];

export function generateDailyMissions(dateStr: string, seed: number) {
  // Simple deterministic generation based on date and user ID (seed)
  // Ensures same user gets same missions on same day
  const hash = dateStr.split('-').reduce((acc, part) => acc + parseInt(part), 0) + seed;
  
  const commonMissions = missionTemplates.filter(m => m.rarity === 'common');
  const rareMissions = missionTemplates.filter(m => m.rarity === 'rare');
  const epicMissions = missionTemplates.filter(m => m.rarity === 'epic');

  const m1 = commonMissions[hash % commonMissions.length];
  const m2 = rareMissions[(hash * 2) % rareMissions.length];
  const m3 = (hash % 10 > 7) ? epicMissions[hash % epicMissions.length] : commonMissions[(hash * 3) % commonMissions.length];

  return [
    { ...m1, progress: 0, completed: false },
    { ...m2, progress: 0, completed: false },
    { ...m3, progress: 0, completed: false },
  ];
}
