# Functional QA Audit

## App Routes

| Route | Page Component | Status | Notes |
|-------|----------------|--------|-------|
| `/` | LandingPage | Passed | Fully functional. |
| `/login` | AuthPage | Passed | Real authentication enabled via Supabase or local fallback. |
| `/app` | DashboardPage | Passed | Fetches real leaderboard data and dynamically handles user profile progress. Replaced hardcoded demo data. |
| `/app/roadmap` | CourseRoadmapPage | Passed | Loads curriculum correctly. Interactive progression logic is intact. |
| `/app/lesson` | LessonPlayerPage | Passed | Type-what-you-hear exercises now play audio via TextToSpeech instead of throwing errors. |
| `/app/vocabulary` | VocabularyTrainerPage | Passed | Vocabulary items have real functionality and audio playback correctly hooked up to TTS. |
| `/app/grammar` | GrammarTrainerPage | Passed | Removed static placeholder topics; utilizes new grammar bank data. |
| `/app/reading` | ReadingPracticePage | Passed | Timer challenge added. |
| `/app/listening` | ListeningPracticePage | Passed | Removed mock UI. Now actually plays TTS audio using real hook logic. |
| `/app/speaking` | SpeakingPracticePage | Passed | Audio recording captures real microphone input and provides simulated AI analysis. |
| `/app/writing` | WritingPracticePage | Passed | Functional text editor with word count and evaluation. |
| `/app/ielts` | IeltsDashboardPage | Passed | Connected to Supabase real progression. |
| `/app/leaderboard` | LeaderboardPage | Passed | Mock users fully replaced with dynamic leaderboard fetched via ProfileService. |
| `/app/community` | CommunityFeedPage | Passed | Functional posts layout. |
| `/app/profile` | ProfilePage | Passed | Reads from ProfileService with local DB fallback. |

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Supabase Integration | Live | `isSupabaseConfigured()` gracefully handles both local DB and live DB environments. Schemas updated. |
| Real User Data Tracking | Live | Dashboard and gamification hooks correctly query dynamic states instead of static mock files. |
| Audio/Text-to-Speech | Live | Hooked into `AudioService` using web `SpeechSynthesis`. Used heavily in vocabulary and listening pages. |
| Audio Recording | Live | Hooked into `useVoiceRecorder` leveraging browser MediaRecorder. |
| Typescript Strict Mode | Passed | All `npm run build` TypeScript compilation errors have been systematically fixed. |
