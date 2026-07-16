export type SmokeRoute = {
  path: string;
  label: string;
  ownerArea: 'public' | 'auth' | 'learning' | 'practice' | 'ielts' | 'community' | 'account';
  mustRender: string;
  mustNotShow?: string[];
};

export const phase18SmokeRoutes: SmokeRoute[] = [
  { path: '/', label: 'Landing', ownerArea: 'public', mustRender: 'LandingPage' },
  { path: '/login', label: 'Login', ownerArea: 'auth', mustRender: 'LoginPage', mustNotShow: ['empty-error-box'] },
  { path: '/register', label: 'Register', ownerArea: 'auth', mustRender: 'RegisterPage', mustNotShow: ['empty-error-box'] },
  { path: '/forgot-password', label: 'Forgot password', ownerArea: 'auth', mustRender: 'ForgotPasswordPage', mustNotShow: ['empty-error-box'] },
  { path: '/app', label: 'Dashboard index', ownerArea: 'learning', mustRender: 'DashboardPage' },
  { path: '/app/dashboard', label: 'Dashboard alias', ownerArea: 'learning', mustRender: 'DashboardPage' },
  { path: '/app/roadmap', label: 'Roadmap', ownerArea: 'learning', mustRender: 'CourseRoadmapPage' },
  { path: '/app/courses', label: 'Courses alias', ownerArea: 'learning', mustRender: 'CourseRoadmapPage' },
  { path: '/app/ai-onboarding', label: 'AI onboarding', ownerArea: 'learning', mustRender: 'AIOnboardingPage' },
  { path: '/app/lesson', label: 'Lesson player', ownerArea: 'learning', mustRender: 'LessonPlayerPage' },
  { path: '/app/practice', label: 'Practice hub', ownerArea: 'practice', mustRender: 'PracticeHubPage' },
  { path: '/app/listening', label: 'Listening', ownerArea: 'practice', mustRender: 'ListeningPracticePage' },
  { path: '/app/speaking', label: 'Speaking', ownerArea: 'practice', mustRender: 'SpeakingPracticePage' },
  { path: '/app/reading', label: 'Reading', ownerArea: 'practice', mustRender: 'ReadingPracticePage' },
  { path: '/app/writing', label: 'Writing', ownerArea: 'practice', mustRender: 'WritingPracticePage' },
  { path: '/app/vocabulary', label: 'Vocabulary', ownerArea: 'practice', mustRender: 'VocabularyTrainerPage' },
  { path: '/app/grammar', label: 'Grammar', ownerArea: 'practice', mustRender: 'GrammarTrainerPage' },
  { path: '/app/music', label: 'Music and podcast', ownerArea: 'practice', mustRender: 'MusicPodcastLabPage' },
  { path: '/app/ielts', label: 'IELTS dashboard', ownerArea: 'ielts', mustRender: 'IELTSDashboardPage' },
  { path: '/app/ielts/listening', label: 'IELTS listening', ownerArea: 'ielts', mustRender: 'IELTSListeningPage' },
  { path: '/app/ielts/reading', label: 'IELTS reading', ownerArea: 'ielts', mustRender: 'IELTSReadingPage' },
  { path: '/app/ielts/writing', label: 'IELTS writing', ownerArea: 'ielts', mustRender: 'IELTSWritingPage' },
  { path: '/app/ielts/speaking', label: 'IELTS speaking', ownerArea: 'ielts', mustRender: 'IELTSSpeakingPage' },
  { path: '/app/community', label: 'Community', ownerArea: 'community', mustRender: 'CommunityFeedPage' },
  { path: '/app/friends', label: 'Friends alias', ownerArea: 'community', mustRender: 'FriendsPage' },
  { path: '/app/chat', label: 'Chat alias', ownerArea: 'community', mustRender: 'ChatRoomsPage' },
  { path: '/app/voice-rooms', label: 'Voice rooms alias', ownerArea: 'community', mustRender: 'VoiceRoomsPage' },
  { path: '/app/community/friends', label: 'Friends nested', ownerArea: 'community', mustRender: 'FriendsPage' },
  { path: '/app/community/chat', label: 'Chat nested', ownerArea: 'community', mustRender: 'ChatRoomsPage' },
  { path: '/app/community/voice-rooms', label: 'Voice rooms nested', ownerArea: 'community', mustRender: 'VoiceRoomsPage' },
  { path: '/app/profile', label: 'Profile', ownerArea: 'account', mustRender: 'ProfilePage' },
  { path: '/app/settings', label: 'Settings', ownerArea: 'account', mustRender: 'SettingsPage' },
];

export const phase18UserFlow = [
  'open_register',
  'create_account_or_local_user',
  'select_native_language',
  'select_target_language',
  'ai_onboarding_self_rating',
  'personalized_placement_test',
  'roadmap_generated',
  'dashboard_plan_visible',
  'lesson_attempt_updates_mastery',
  'practice_attempt_updates_progress',
  'settings_persist_after_refresh',
  'profile_persist_after_refresh',
  'community_routes_render',
] as const;

export function getPhase18ManualChecklist(interfaceLanguage = 'vi') {
  return {
    interfaceLanguage,
    mustPass: phase18UserFlow,
    smokeRoutes: phase18SmokeRoutes.map(route => route.path),
    deployGate: [
      'npm run verify:all passes',
      'npm run build passes',
      'Supabase migrations 000-008 are applied in order',
      'Netlify has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY only',
      'No service role key is bundled in frontend code',
    ],
  };
}
