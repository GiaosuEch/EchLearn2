import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import { ToastProvider } from './components/ui/Toast';

// Lazy loading all pages from the index
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  DashboardPage,
  LanguageSelectionPage,
  CourseRoadmapPage,
  LessonPlayerPage,
  AITutorPage,
  PracticeGeneratorPage,
  LearnerMemoryPage,
  WritingCoachPage,
  SpeakingCoachPage,
  AICoachHubPage,
  AIRequestAuditPage,
  AISettingsPage,
  LocalAIReadinessPage
} from './pages';

// Import the compact pages
import {
  ListeningPracticePage,
  SpeakingPracticePage,
  ReadingPracticePage,
  WritingPracticePage,
  VocabularyTrainerPage,
  GrammarTrainerPage,
  IELTSListeningPage,
  IELTSReadingPage,
  IELTSWritingPage,
  IELTSSpeakingPage,
  MockTestCenterPage,
  QuizCenterPage,
  FlashcardsPage,
  DailyMissionsPage,
  StreakCalendarPage,
  LeaderboardPage,
  AchievementsPage,
  ProfilePage,
  EditProfilePage,
  FriendsPage,
  CommunityFeedPage,
  StudyGroupsPage,
  StudyGroupDetailPage,
  VoiceRoomsPage,
  ChatRoomsPage,
  NotificationsPage,
  SettingsPage,
  AboutPage,
  PricingPage,
  LanguagesPublicPage,
  IELTSProgramPage,
  CommunityPreviewPage,
  AdminContentManagerPage,
  IELTSPlacementPage,
  AIOnboardingPage,
  MusicPodcastLabPage,
  CustomizationPage,
  DiscordCommunityPage
} from './pages/app/AllPages';

import IELTSDashboardPage from './pages/ielts/IELTSDashboardPage';
import IELTSVocabularyPage from './pages/app/ielts/IELTSVocabularyPage';
import PracticeHubPage from './pages/app/PracticeHubPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/languages" element={<LanguagesPublicPage />} />
          <Route path="/ielts-program" element={<IELTSProgramPage />} />
          <Route path="/community-preview" element={<CommunityPreviewPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* App Routes */}
        <Route path="/app" element={<AppLayout />}>
          {/* Main Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Core Learning */}
          <Route path="languages" element={<LanguageSelectionPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="roadmap" element={<CourseRoadmapPage />} />
          <Route path="courses" element={<CourseRoadmapPage />} />
          <Route path="lesson" element={<LessonPlayerPage />} />
          <Route path="ai-onboarding" element={<AIOnboardingPage />} />
          <Route path="music" element={<MusicPodcastLabPage />} />
          
          {/* Practice Hub */}
          <Route path="practice" element={<PracticeHubPage />} />
          <Route path="practice-generator" element={<PracticeGeneratorPage />} />
          <Route path="learner-memory" element={<LearnerMemoryPage />} />
          <Route path="listening" element={<ListeningPracticePage />} />
          <Route path="speaking" element={<SpeakingPracticePage />} />
          <Route path="reading" element={<ReadingPracticePage />} />
          <Route path="writing" element={<WritingPracticePage />} />
          <Route path="vocabulary" element={<VocabularyTrainerPage />} />
          <Route path="grammar" element={<GrammarTrainerPage />} />
          
          {/* IELTS */}
          <Route path="ielts" element={<IELTSDashboardPage />} />
          <Route path="ielts/placement" element={<IELTSPlacementPage />} />
          <Route path="ielts/listening" element={<IELTSListeningPage />} />
          <Route path="ielts/reading" element={<IELTSReadingPage />} />
          <Route path="ielts/writing" element={<IELTSWritingPage />} />
          <Route path="ielts/speaking" element={<IELTSSpeakingPage />} />
          <Route path="ielts/vocabulary" element={<IELTSVocabularyPage />} />
          <Route path="mock-tests" element={<MockTestCenterPage />} />
          
          {/* AI Tools */}
          <Route path="ai" element={<AICoachHubPage />} />
          <Route path="ai/audit" element={<AIRequestAuditPage />} />
          <Route path="ai/settings" element={<AISettingsPage />} />
          <Route path="ai/readiness" element={<LocalAIReadinessPage />} />
          <Route path="ai-tutor" element={<AITutorPage />} />
          <Route path="ai-speaking" element={<SpeakingCoachPage />} />
          <Route path="ai-writing" element={<WritingCoachPage />} />
          
          {/* Gamification */}
          <Route path="quizzes" element={<QuizCenterPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="missions" element={<DailyMissionsPage />} />
          <Route path="calendar" element={<StreakCalendarPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          
          {/* Community */}
          <Route path="community" element={<CommunityFeedPage />} />
          <Route path="groups" element={<StudyGroupsPage />} />
          <Route path="groups/:id" element={<StudyGroupDetailPage />} />
          <Route path="voice-rooms" element={<VoiceRoomsPage />} />
          <Route path="chat" element={<ChatRoomsPage />} />
          <Route path="community/friends" element={<FriendsPage />} />
          <Route path="community/chat" element={<ChatRoomsPage />} />
          <Route path="community/voice-rooms" element={<VoiceRoomsPage />} />
          <Route path="community/discord" element={<DiscordCommunityPage />} />
          <Route path="discord" element={<DiscordCommunityPage />} />
          
          {/* User & Settings */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="edit-profile" element={<EditProfilePage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="customize" element={<CustomizationPage />} />

          {/* Admin */}
          <Route path="admin" element={<AdminContentManagerPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
