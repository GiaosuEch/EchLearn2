#!/usr/bin/env node
const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const failures = [];
const required = [
  ['/', 'LandingPage'], ['/login', 'LoginPage'], ['/register', 'RegisterPage'], ['/forgot-password', 'ForgotPasswordPage'],
  ['dashboard', 'DashboardPage'], ['roadmap', 'CourseRoadmapPage'], ['courses', 'CourseRoadmapPage'], ['ai-onboarding', 'AIOnboardingPage'], ['lesson', 'LessonPlayerPage'],
  ['practice', 'PracticeHubPage'], ['listening', 'ListeningPracticePage'], ['speaking', 'SpeakingPracticePage'], ['reading', 'ReadingPracticePage'], ['writing', 'WritingPracticePage'], ['vocabulary', 'VocabularyTrainerPage'], ['grammar', 'GrammarTrainerPage'], ['music', 'MusicPodcastLabPage'],
  ['ielts', 'IELTSDashboardPage'], ['ielts/listening', 'IELTSListeningPage'], ['ielts/reading', 'IELTSReadingPage'], ['ielts/writing', 'IELTSWritingPage'], ['ielts/speaking', 'IELTSSpeakingPage'],
  ['community', 'CommunityFeedPage'], ['friends', 'FriendsPage'], ['chat', 'ChatRoomsPage'], ['voice-rooms', 'VoiceRoomsPage'], ['community/friends', 'FriendsPage'], ['community/chat', 'ChatRoomsPage'], ['community/voice-rooms', 'VoiceRoomsPage'], ['profile', 'ProfilePage'], ['settings', 'SettingsPage']
];
for (const [path, component] of required) {
  const routeNeedle = path === '/' ? 'path="/"' : `path="${path}"`;
  const idx = app.indexOf(routeNeedle);
  if (idx < 0) failures.push(`Missing route ${path}`);
  else if (!app.slice(idx, idx + 260).includes(`<${component} />`)) failures.push(`Route ${path} does not render ${component}`);
}
const service = fs.existsSync('src/services/productionReadinessService.ts') ? fs.readFileSync('src/services/productionReadinessService.ts', 'utf8') : '';
for (const [path] of required) {
  const routePath = path === '/' ? '/' : path.startsWith('/') ? path : `/app/${path}`;
  if (!service.includes(routePath) && !['/login','/register','/forgot-password'].includes(routePath)) failures.push(`Production readiness registry missing ${routePath}`);
}
if (failures.length) { console.error('FAIL verify_route_smoke'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log(`PASS: ${required.length} route smoke checks passed.`);
