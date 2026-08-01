import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import AdminGuard from './components/auth/AdminGuard';
import LanguageEntitlementGuard from './components/auth/LanguageEntitlementGuard';
import { ToastProvider } from './components/ui/Toast';

const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const LanguageSelectionPage = lazy(() => import('./pages/app/LanguageSelectionPage'));
const CourseRoadmapPage = lazy(() => import('./pages/app/CourseRoadmapPage'));
const LessonPlayerPage = lazy(() => import('./pages/app/LessonPlayerPage'));
const RealworldMasteryMissionPage = lazy(() => import('./pages/app/practice/RealworldMasteryMissionPage'));
const LanguagePodcastPage = lazy(() => import('./pages/app/media/LanguagePodcastPage'));
const BilingualNewsReaderPage = lazy(() => import('./pages/app/reading/BilingualNewsReaderPage'));
const IELTSWritingMasterPage = lazy(() => import('./pages/app/writing/IELTSWritingMasterPage'));
const CategorizedVideoListeningPage = lazy(() => import('./pages/app/listening/CategorizedVideoListeningPage'));
const ListeningPracticePage = lazy(() => import('./pages/app/practice/ListeningPracticePage'));
const SpeakingPracticePage = lazy(() => import('./pages/app/practice/SpeakingPracticePage'));
const ReadingPracticePage = lazy(() => import('./pages/app/practice/ReadingPracticePage'));
const WritingPracticePage = lazy(() => import('./pages/app/practice/WritingPracticePage'));
const VocabularyTrainerPage = lazy(() => import('./pages/app/practice/VocabularyTrainerPage'));
const GrammarTrainerPage = lazy(() => import('./pages/app/practice/GrammarTrainerPage'));
const IELTSDashboardPage = lazy(() => import('./pages/ielts/IELTSDashboardPage'));
const IELTSPlacementPage = lazy(() => import('./pages/app/ielts/IELTSPlacementPage'));
const IELTSListeningPage = lazy(() => import('./pages/app/ielts/IELTSListeningPage'));
const IELTSReadingPage = lazy(() => import('./pages/app/ielts/IELTSReadingPage'));
const IELTSWritingPage = lazy(() => import('./pages/app/ielts/IELTSWritingPage'));
const IELTSSpeakingPage = lazy(() => import('./pages/app/ielts/IELTSSpeakingPage'));
const IELTSVocabularyPage = lazy(() => import('./pages/app/ielts/IELTSVocabularyPage'));
const MockTestCenterPage = lazy(() => import('./pages/app/ielts/MockTestCenterPage'));
const PracticeHubPage = lazy(() => import('./pages/app/PracticeHubPage'));
const SpeedQuizPage = lazy(() => import('./pages/app/gamification/SpeedQuizPage'));
const Flashcards3DPage = lazy(() => import('./pages/app/practice/Flashcards3DPage'));
const WeeklyReportPage = lazy(() => import('./pages/app/analytics/WeeklyReportPage'));
const DailyMissionsPage = lazy(() => import('./pages/app/gamification/DailyMissionsPage'));
const StreakCalendarPage = lazy(() => import('./pages/app/gamification/StreakCalendarPage'));
const LeaderboardPage = lazy(() => import('./pages/app/gamification/LeaderboardPage'));
const AchievementsPage = lazy(() => import('./pages/app/gamification/AchievementsPage'));
const ProfilePage = lazy(() => import('./pages/app/profile/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/app/profile/EditProfilePage').then((module) => ({ default: module.EditProfilePage })));
const FriendsPage = lazy(() => import('./pages/app/community/FriendsPage').then((module) => ({ default: module.FriendsPage })));
const CommunityFeedPage = lazy(() => import('./pages/app/community/CommunityFeedPage'));
const StudyGroupsPage = lazy(() => import('./pages/app/community/StudyGroupsPage'));
const StudyGroupDetailPage = lazy(() => import('./pages/app/community/StudyGroupDetailPage'));
const VoiceRoomsPage = lazy(() => import('./pages/app/community/VoiceRoomsPage'));
const ChatRoomsPage = lazy(() => import('./pages/app/community/ChatRoomsPage').then((module) => ({ default: module.ChatRoomsPage })));
const DiscordCommunityPage = lazy(() => import('./pages/app/community/DiscordCommunityPage'));
const MusicPodcastLabPage = lazy(() => import('./pages/app/media/MusicPodcastLabPage'));
const CustomizationPage = lazy(() => import('./pages/app/customization/CustomizationPage'));
const AIOnboardingPage = lazy(() => import('./pages/app/onboarding/AIOnboardingPage'));
const SettingsPage = lazy(() => import('./pages/app/profile/SettingsPage'));
const PricingPage = lazy(() => import('./pages/app/PricingPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/app/admin/SubscriptionManagementPage'));
const QuizCenterPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.QuizCenterPage })));
const NotificationsPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.NotificationsPage })));
const AboutPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.AboutPage })));
const LanguagesPublicPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.LanguagesPublicPage })));
const LanguageChartsPage = lazy(() => import('./pages/app/LanguageChartsPage'));
const IELTSProgramPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.IELTSProgramPage })));
const CommunityPreviewPage = lazy(() => import('./pages/app/AllPages').then((module) => ({ default: module.CommunityPreviewPage })));

function RouteLoadingFallback() {
  return <div className="min-h-32 p-6 text-sm text-slate-500" role="status" aria-live="polite">Đang mở nội dung học…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Suspense fallback={<RouteLoadingFallback />}>
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
            <Route path="ai-onboarding" element={<AIOnboardingPage />} />
            <Route path="mastery-mission" element={<RealworldMasteryMissionPage />} />
            <Route path="languages" element={<LanguageSelectionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="roadmap" element={<CourseRoadmapPage />} />
            <Route path="courses" element={<CourseRoadmapPage />} />
            <Route path="music" element={<MusicPodcastLabPage />} />
            
            {/* Protected Learning Routes with LanguageEntitlementGuard */}
            <Route element={<LanguageEntitlementGuard />}>
              <Route path="lesson" element={<LessonPlayerPage />} />
              <Route path="practice" element={<PracticeHubPage />} />
              <Route path="listening" element={<ListeningPracticePage />} />
              <Route path="listening/videos" element={<CategorizedVideoListeningPage />} />
              <Route path="speaking" element={<SpeakingPracticePage />} />
              <Route path="reading" element={<ReadingPracticePage />} />
              <Route path="reading/news" element={<BilingualNewsReaderPage />} />
              <Route path="writing" element={<WritingPracticePage />} />
              <Route path="writing/master" element={<IELTSWritingMasterPage />} />
              <Route path="vocabulary" element={<VocabularyTrainerPage />} />
              <Route path="grammar" element={<GrammarTrainerPage />} />
            </Route>

            <Route path="reference-charts" element={<LanguageChartsPage />} />
            
            {/* IELTS */}
            <Route path="ielts" element={<IELTSDashboardPage />} />
            <Route path="ielts/placement" element={<IELTSPlacementPage />} />
            <Route path="ielts/listening" element={<IELTSListeningPage />} />
            <Route path="ielts/reading" element={<IELTSReadingPage />} />
            <Route path="ielts/writing" element={<IELTSWritingPage />} />
            <Route path="ielts/speaking" element={<IELTSSpeakingPage />} />
            <Route path="ielts/vocabulary" element={<IELTSVocabularyPage />} />
            <Route path="mock-tests" element={<MockTestCenterPage />} />
            
            <Route path="podcasts" element={<LanguagePodcastPage />} />
            
            {/* Gamification */}
            <Route path="quizzes" element={<QuizCenterPage />} />
            <Route path="speed-quiz" element={<SpeedQuizPage />} />
            <Route path="flashcards" element={<Flashcards3DPage />} />
            <Route path="flashcards-3d" element={<Flashcards3DPage />} />
            <Route path="weekly-report" element={<WeeklyReportPage />} />
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
            <Route path="pricing" element={<PricingPage />} />

            {/* Protected Admin Routes with AdminGuard */}
            <Route element={<AdminGuard />}>
              <Route path="admin" element={<SubscriptionManagementPage />} />
              <Route path="admin/subscriptions" element={<SubscriptionManagementPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
