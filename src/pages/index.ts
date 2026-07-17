// All page exports — lazy-loaded in App.tsx
// Key pages are full implementations; secondary pages use PageShell with functional content

export { default as LandingPage } from './public/LandingPage';
export { default as LoginPage } from './auth/LoginPage';
export { default as RegisterPage } from './auth/RegisterPage';
export { default as ForgotPasswordPage } from './auth/ForgotPasswordPage';
export { default as DashboardPage } from './app/DashboardPage';
export { default as LanguageSelectionPage } from './app/LanguageSelectionPage';
export { default as CourseRoadmapPage } from './app/CourseRoadmapPage';
export { default as LessonPlayerPage } from './app/LessonPlayerPage';
export { default as AITutorPage } from './app/AITutorPage';
export { default as PracticeGeneratorPage } from './app/PracticeGeneratorPage';
export { default as LearnerMemoryPage } from './app/LearnerMemoryPage';

export { default as WritingCoachPage } from './app/WritingCoachPage';
export { default as SpeakingCoachPage } from './app/SpeakingCoachPage';
export { default as AICoachHubPage } from './app/AICoachHubPage';
export { default as AIRequestAuditPage } from './app/AIRequestAuditPage';
export { default as AISettingsPage } from './app/AISettingsPage';
