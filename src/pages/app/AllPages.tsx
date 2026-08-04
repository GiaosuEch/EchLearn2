import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Brain, Users, Bell, Target, GraduationCap } from 'lucide-react';
import PageShell from '../PageShell';
import Mascot from '../../components/mascot/Mascot';
import { CustomEmoji } from '../../components/common/CustomEmoji';
import { vocabulary } from '../../data/vocabulary';
import { mockNotifications } from '../../data/userData';
import { languages } from '../../data/languages';
import { Tilt3DCard } from '../../components/ui/Tilt3DCard';

// === EXTRACTED PAGES EXPORTS ===

// Gamification
export { default as DailyMissionsPage } from './gamification/DailyMissionsPage';
export { default as StreakCalendarPage } from './gamification/StreakCalendarPage';
export { default as LeaderboardPage } from './gamification/LeaderboardPage';
export { default as AchievementsPage } from './gamification/AchievementsPage';

// Practice
export { default as ListeningPracticePage } from './practice/ListeningPracticePage';
export { default as SpeakingPracticePage } from './practice/SpeakingPracticePage';
export { default as ReadingPracticePage } from './practice/ReadingPracticePage';
export { default as WritingPracticePage } from './practice/WritingPracticePage';
export { default as VocabularyTrainerPage } from './practice/VocabularyTrainerPage';
export { default as GrammarTrainerPage } from './practice/GrammarTrainerPage';

// IELTS
export { default as IELTSPlacementPage } from './ielts/IELTSPlacementPage';
export { default as IELTSListeningPage } from './ielts/IELTSListeningPage';
export { default as IELTSReadingPage } from './ielts/IELTSReadingPage';
export { default as IELTSWritingPage } from './ielts/IELTSWritingPage';
export { default as IELTSSpeakingPage } from './ielts/IELTSSpeakingPage';
export { default as MockTestCenterPage } from './ielts/MockTestCenterPage';
export { default as MistakeNotebookPage } from './ielts/MistakeNotebookPage';

// Profile
export { default as ProfilePage } from './profile/ProfilePage';

// Community
export { default as CommunityFeedPage } from './community/CommunityFeedPage';
export { default as StudyGroupsPage } from './community/StudyGroupsPage';
export { default as StudyGroupDetailPage } from './community/StudyGroupDetailPage';
export { default as VoiceRoomsPage } from './community/VoiceRoomsPage';
export { default as DiscordCommunityPage } from './community/DiscordCommunityPage';

// Admin
export { default as AdminContentManagerPage } from './admin/AdminContentManagerPage';

// ===== GAMIFICATION PAGES =====

export function QuizCenterPage() {
  return (
    <PageShell title="Quiz Center" description="Test your knowledge" icon={<Target size={20} />}>
      <div className="grid sm:grid-cols-2 gap-4">
        {['English Basics', 'Grammar Challenge', 'Vocabulary Master', 'IELTS Prep', 'Speed Quiz', 'Daily Quiz'].map((quiz, i) => (
          <div key={quiz} className="glass-card p-5 hover:border-primary-500/20 transition-all cursor-pointer">
            <h3 className="font-semibold text-white">{quiz}</h3>
            <p className="text-sm text-dark-400 mt-1">{10 + i * 5} questions · {5 + i * 2} min</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-dark-500">Best: {70 + i * 4}%</span>
              <button className="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30">Start</button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function FlashcardsPage() {
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const cards = vocabulary.slice(0, 10);
  return (
    <PageShell title="Flashcards" description="Review vocabulary with spaced repetition" icon={<Brain size={20} />}>
      <div className="max-w-md mx-auto">
        <motion.div className="glass-card p-8 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center"
          onClick={() => setShowAnswer(!showAnswer)} whileTap={{ scale: 0.98 }}>
          {showAnswer ? (
            <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>
              <p className="text-2xl text-primary-400 font-bold">{cards[current].translation}</p>
              <p className="text-sm text-dark-400 mt-2 italic">{cards[current].example}</p>
            </motion.div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-white">{cards[current].word}</p>
              <p className="text-sm text-dark-500 mt-1">{cards[current].pronunciation}</p>
            </div>
          )}
        </motion.div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-dark-400">{current + 1} / {cards.length}</span>
          <div className="flex gap-2">
            <button onClick={() => { setCurrent((c) => Math.max(0, c - 1)); setShowAnswer(false); }}
              className="px-4 py-2 bg-dark-700 text-dark-300 rounded-lg text-sm">← Prev</button>
            <button onClick={() => { setCurrent((c) => Math.min(cards.length - 1, c + 1)); setShowAnswer(false); }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">Next →</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}


// ===== PROFILE PAGES =====


export { EditProfilePage } from './profile/EditProfilePage';

export { FriendsPage } from './community/FriendsPage';
export { ChatRoomsPage } from './community/ChatRoomsPage';


// Media
export { default as MusicPodcastLabPage } from './media/MusicPodcastLabPage';
export { default as CustomizationPage } from './customization/CustomizationPage';

// ===== SETTINGS & MISC =====

export function NotificationsPage() {
  return (
    <PageShell title="Notifications" description="Your recent updates" icon={<Bell size={20} />}>
      <div className="space-y-2">
        {mockNotifications.map((n: any) => (
          <div key={n.id} className={`glass-card p-4 flex items-start gap-3 ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="shrink-0">
              <CustomEmoji
                size={26}
                name={n.type === 'streak' ? 'streak-fire' : n.type === 'achievement' ? 'trophy-gold' : n.type === 'friend' ? 'wave-hello' : 'note-write'}
              />
            </div>
            <div>
              <p className="font-medium text-white text-sm">{n.title}</p>
              <p className="text-xs text-dark-400">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export { default as SettingsPage } from './profile/SettingsPage';

// ===== PUBLIC PAGES =====

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <Mascot expression="happy" size={90} message="Chào bạn! Hãy để mình giới thiệu! 🐸" />
        <h1 className="text-4xl font-bold text-white mt-6">About Ech Lern</h1>
        <p className="text-dark-400 mt-3 max-w-xl mx-auto">We believe language learning should be fun, social, and accessible to everyone. That's why we built Ech Lern.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { title: 'Our Mission', desc: 'Make language learning accessible, fun, and effective for everyone, everywhere.' },
          { title: 'Our Vision', desc: 'A world where language barriers don\'t exist. Where anyone can communicate with anyone.' },
          { title: 'Our Values', desc: 'Community, innovation, accessibility, and continuous improvement drive everything we do.' },
        ].map((item) => (
          <div key={item.title} className="glass-card p-6 text-center">
            <h3 className="text-lg font-semibold text-primary-400">{item.title}</h3>
            <p className="text-sm text-dark-400 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LanguagesPublicPage() {
  const nameVi: Record<string, string> = {
    en: 'Tiếng Anh', fr: 'Tiếng Pháp', de: 'Tiếng Đức', zh: 'Tiếng Trung', ja: 'Tiếng Nhật',
    ko: 'Tiếng Hàn', es: 'Tiếng Tây Ban Nha', it: 'Tiếng Ý', pt: 'Tiếng Bồ Đào Nha',
    ru: 'Tiếng Nga', vi: 'Tiếng Việt', th: 'Tiếng Thái', ar: 'Tiếng Ả Rập',
  };
  const difficultyVi: Record<string, string> = { easy: 'dễ bắt đầu', medium: 'vừa sức', hard: 'thử thách', expert: 'chuyên sâu' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white text-center">Chọn lá cờ bạn muốn chinh phục</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {languages.map((lang) => (
          <Tilt3DCard key={lang.id} maxTiltDegrees={12} depthZ={24}>
            <div className="liquid-glass-card p-6 h-full flex flex-col justify-between rounded-2xl border border-white/15 hover:border-[#6FFF00]/50 transition-all">
              <div className="flex items-center gap-4">
                <img src={lang.flagUrl} alt={`Cờ ${nameVi[lang.id] ?? lang.name}`} className="h-10 w-14 rounded-lg object-cover shadow-md border border-white/20 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{nameVi[lang.id] ?? lang.name}</h3>
                  <p className="text-xs text-[#6FFF00] font-mono mt-0.5">{lang.nativeName} · {difficultyVi[lang.difficulty] ?? lang.difficulty}</p>
                </div>
              </div>
              <p className="text-xs text-white/75 mt-3.5 leading-relaxed">{lang.description || 'Khám phá ngôn ngữ theo nhịp học phù hợp với bạn.'}</p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                <span>{lang.totalLessons} bài học</span>
                <span>{lang.totalLearners.toLocaleString()} người học</span>
              </div>
            </div>
          </Tilt3DCard>
        ))}
      </div>
    </div>
  );
}

export function IELTSProgramPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <GraduationCap className="mx-auto text-primary-400 mb-4" size={48} />
      <h1 className="text-4xl font-bold text-white">IELTS Preparation Program</h1>
      <p className="text-dark-400 mt-3 max-w-xl mx-auto">Structured IELTS practice across four skills; automated assessment is currently unavailable</p>
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {[
          { range: '0.0–3.0', name: 'Foundation', color: 'bg-slate-600' },
          { range: '3.0–4.0', name: 'Beginner', color: 'bg-blue-600' },
          { range: '4.0–5.0', name: 'Pre-Intermediate', color: 'bg-emerald-600' },
          { range: '5.0–6.0', name: 'Intermediate', color: 'bg-yellow-600' },
          { range: '6.0–7.0', name: 'Upper-Intermediate', color: 'bg-orange-600' },
          { range: '7.0–8.0', name: 'Advanced', color: 'bg-purple-600' },
          { range: '8.0–9.0', name: 'Mastery', color: 'bg-rose-600' },
        ].map((level) => (
          <div key={level.name} className={`${level.color} text-white px-6 py-4 rounded-xl`}>
            <p className="font-bold">{level.range}</p>
            <p className="text-xs opacity-80">{level.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 grid sm:grid-cols-4 gap-4">
        {['Listening', 'Reading', 'Writing', 'Speaking'].map((skill) => (
          <div key={skill} className="glass-card p-5">
            <p className="font-semibold text-white">{skill}</p>
            <p className="text-xs text-dark-400 mt-1">IELTS {skill.toLowerCase()} practice with mock-test content and progress tracking</p>
          </div>
        ))}
      </div>
      <Link to="/register" className="inline-flex items-center gap-2 mt-12 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all">
        Start Your IELTS Journey <CustomEmoji name="ech-buri" size={22} />
      </Link>
    </div>
  );
}

export function CommunityPreviewPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <Users className="mx-auto text-primary-400 mb-4" size={48} />
      <h1 className="text-4xl font-bold text-white">Join Our Community</h1>
      <p className="text-dark-400 mt-3">Connect with language learners worldwide</p>
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <div className="glass-card p-6"><p className="text-4xl font-bold text-primary-400">10,000+</p><p className="text-dark-400 mt-1">Active Learners</p></div>
        <div className="glass-card p-6"><p className="text-4xl font-bold text-accent-400">500+</p><p className="text-dark-400 mt-1">Study Groups</p></div>
        <div className="glass-card p-6"><p className="text-4xl font-bold text-blue-400">50+</p><p className="text-dark-400 mt-1">Voice Rooms</p></div>
      </div>
      <Link to="/register" className="inline-block mt-12 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl">Join Free</Link>
    </div>
  );
}
