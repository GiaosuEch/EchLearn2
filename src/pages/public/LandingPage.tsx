import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight, Headphones, Mic, BookOpen, PenTool, Brain,
  Trophy, Users, Zap, Globe, Sparkles, Shield, Volume2, MessageCircle, Star
} from 'lucide-react';
import Mascot from '../../components/mascot/Mascot';
import { languages } from '../../data/languages';
import { SplitText } from '../../components/ui/SplitText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { InfiniteCarousel } from '../../components/ui/InfiniteCarousel';
import { BlobBackground } from '../../components/ui/BlobBackground';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const stats = [
  { label: 'Languages', value: '13', icon: '🌍' },
  { label: 'Skill Areas', value: '4', icon: '📚' },
  { label: 'Learning Mode', value: 'Practice', icon: '🎯' },
  { label: 'Local AI', value: 'In development', icon: '🧭' }
];

const features = [
  { icon: <Brain className="text-primary-400" size={28} />, title: 'Speaking Practice', desc: 'Automated assessment unavailable until an approved model is installed. Practice content remains available.' },
  { icon: <PenTool className="text-accent-400" size={28} />, title: 'Writing Practice', desc: 'Draft and review practice responses. Automated feedback remains unavailable without an approved model.' },
  { icon: <Trophy className="text-yellow-400" size={28} />, title: 'Gamified Learning', desc: 'XP, streaks, leagues, achievements, and daily quests keep you motivated.' },
  { icon: <Users className="text-blue-400" size={28} />, title: 'Study Groups & Voice', desc: 'Join study groups, voice rooms, and chat with learners worldwide.' },
  { icon: <Shield className="text-purple-400" size={28} />, title: 'IELTS Academic Practice', desc: 'Structured practice across four skills without official scoring claims.' },
  { icon: <Sparkles className="text-pink-400" size={28} />, title: 'Local AI Foundation', desc: 'Local AI foundation in development. No generated tutor answers are provided without an approved runtime and model.' },
];

const ieltsLevels = [
  { range: '0.0–3.0', name: 'Foundation', color: 'from-slate-500 to-slate-600' },
  { range: '3.0–4.0', name: 'Beginner', color: 'from-blue-500 to-blue-600' },
  { range: '4.0–5.0', name: 'Pre-Intermediate', color: 'from-emerald-500 to-emerald-600' },
  { range: '5.0–6.0', name: 'Intermediate', color: 'from-yellow-500 to-yellow-600' },
  { range: '6.0–7.0', name: 'Upper-Intermediate', color: 'from-orange-500 to-orange-600' },
  { range: '7.0–8.0', name: 'Advanced', color: 'from-purple-500 to-purple-600' },
  { range: '8.0–9.0', name: 'Mastery', color: 'from-rose-500 to-rose-600' },
];

export default function LandingPage() {
  const [platformStats, setPlatformStats] = useState(stats);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const fetchStats = async () => {
        try {
          const { count: userCount } = await supabase!.from('profiles').select('*', { count: 'exact', head: true });
          const { count: lessonCount } = await supabase!.from('learning_progress').select('*', { count: 'exact', head: true });
          
          setPlatformStats([
            { label: 'Active Learners', value: userCount ? userCount.toLocaleString() : '0', icon: '👥' },
            { label: 'Skill Areas', value: '4', icon: '📚' },
            { label: 'Lessons Taken', value: lessonCount ? lessonCount.toLocaleString() : '0', icon: '📚' },
            { label: 'Local AI', value: 'In development', icon: '🧭' },
          ]);
        } catch (e) {
          console.error('Failed to fetch stats', e);
        }
      };
      fetchStats();
    }
  }, []);

  return (
    <div className="bg-dark-950 overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-mesh overflow-hidden">
        {/* Animated bg circles */}
        <BlobBackground />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Mascot expression="encouraging" size={100} message="Nhảy vào thế giới ngôn ngữ nào! 🌍" />
          </motion.div>

          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
            <SplitText text="Jump into " className="text-gradient" delay={0.2} />
            <SplitText text="every" className="text-white" delay={0.6} />
            <br />
            <SplitText text="language" className="text-gradient-warm" delay={1.0} />
          </h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto"
          >
            Learn 13+ languages with structured practice, progress tracking, IELTS preparation,
            and a global community. Free to start, fun to continue.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register"
              className="px-8 py-4 text-lg font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105 flex items-center gap-2"
            >
              Start Learning Free <ArrowRight size={20} />
            </Link>
            <Link to="/app"
              className="px-8 py-4 text-lg font-semibold text-dark-300 border border-dark-600 rounded-2xl hover:bg-dark-800 hover:border-dark-500 transition-all duration-300"
            >
              Explore Dashboard
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {platformStats.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-dark-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Globe className="mx-auto text-primary-400 mb-4" size={40} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Learn Every Major Language</h2>
            <p className="mt-3 text-dark-400 max-w-xl mx-auto">From English to Arabic, build a consistent practice routine with structured lessons.</p>
          </motion.div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {languages.map((lang, i) => (
              <motion.div key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 text-center hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <span className="text-4xl block mb-2">{lang.flag}</span>
                <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{lang.name}</p>
                <p className="text-xs text-dark-500 mt-1">{lang.totalLearners.toLocaleString()} learners</p>
                {lang.hasIELTS && <span className="inline-block mt-2 text-[10px] bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full">IELTS</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything You Need to Master Languages</h2>
            <p className="mt-3 text-dark-400 max-w-xl mx-auto">Practice, progress tracking, gamification, community, and structured learning — all in one place.</p>
          </motion.div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <SpotlightCard className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mb-4">{feat.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
                  <p className="mt-2 text-sm text-dark-400">{feat.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 SKILLS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Master All 4 Skills</h2>
          <p className="mt-3 text-dark-400">Comprehensive practice for Listening, Speaking, Reading, and Writing.</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Headphones size={32} />, skill: 'Listening', color: 'from-blue-500 to-cyan-500', desc: 'Audio lessons, podcasts, IELTS practice sections' },
              { icon: <Mic size={32} />, skill: 'Speaking', color: 'from-green-500 to-emerald-500', desc: 'Speaking prompts, conversation practice, cue cards' },
              { icon: <BookOpen size={32} />, skill: 'Reading', color: 'from-purple-500 to-violet-500', desc: 'Passages, comprehension, skimming & scanning' },
              { icon: <PenTool size={32} />, skill: 'Writing', color: 'from-orange-500 to-amber-500', desc: 'Essays, letters, drafting, and revision practice' },
            ].map((s, i) => (
              <motion.div key={s.skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{s.skill}</h3>
                <p className="mt-2 text-sm text-dark-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IELTS */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">IELTS Academic Practice Track</h2>
            <p className="mt-3 text-dark-400 max-w-xl mx-auto">Structured practice and mock-test content. Automated assessment remains unavailable without an approved model.</p>
          </motion.div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {ieltsLevels.map((level, i) => (
              <motion.div key={level.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`px-5 py-3 rounded-xl bg-gradient-to-r ${level.color} text-white font-semibold text-sm shadow-lg hover:scale-105 transition-transform cursor-pointer`}
              >
                <span className="font-bold">{level.range}</span>
                <br />
                <span className="text-xs opacity-80">{level.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMIFICATION PREVIEW */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Learn Like You're Playing a Game</h2>
              <p className="mt-4 text-dark-400">Earn XP, maintain streaks, climb leagues, unlock achievements, and compete with friends. Learning has never been this fun.</p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: <Zap className="text-yellow-400" size={20} />, text: 'Earn XP for every lesson and exercise' },
                  { icon: <span className="text-lg">🔥</span>, text: 'Build daily streaks — don\'t break the chain!' },
                  { icon: <Trophy className="text-purple-400" size={20} />, text: 'Climb from Bronze to Legend league' },
                  { icon: <Star className="text-accent-400" size={20} />, text: '20+ achievements to unlock' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 glass-card px-4 py-3">
                    {item.icon}
                    <span className="text-sm text-dark-200">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">🏆 Gold League</p>
                  <p className="text-sm text-dark-400">Weekly Leaderboard</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-dark-400">Your Rank</p>
                  <p className="text-2xl font-bold text-accent-400">#6</p>
                </div>
              </div>
              {[
                { rank: 1, name: 'Student A', xp: '22,100', avatar: '👩‍🎓' },
                { rank: 2, name: 'Student B', xp: '31,000', avatar: '🧑‍💼' },
                { rank: 3, name: 'Student C', xp: '18,900', avatar: '👩‍💻' },
              ].map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 py-2 border-t border-dark-700/50">
                  <span className={`w-6 text-center font-bold ${entry.rank <= 3 ? 'text-accent-400' : 'text-dark-500'}`}>{entry.rank}</span>
                  <span className="text-xl">{entry.avatar}</span>
                  <span className="flex-1 text-sm text-dark-200">{entry.name}</span>
                  <span className="text-sm text-primary-400 font-semibold">{entry.xp} XP</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Learn Together, Grow Together</h2>
          <p className="mt-3 text-dark-400 max-w-xl mx-auto">Join study groups, hop into voice rooms, and connect with language learners worldwide.</p>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Users size={32} />, title: 'Study Groups', desc: 'Join or create groups by language and level. Learn together with shared goals.' },
              { icon: <Volume2 size={32} />, title: 'Voice Rooms', desc: 'Practice speaking in live voice rooms. No pressure, just conversation.' },
              { icon: <MessageCircle size={32} />, title: 'Chat & Share', desc: 'DM friends, share progress, ask questions, and celebrate wins together.' },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">{item.icon}</div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-dark-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">Built Around Honest Learning</h2>
          
          <InfiniteCarousel
            speed={60}
            items={[
              { name: 'Practice', role: 'Core learning', text: 'Use structured lessons, skill practice, and progress tracking without fabricated AI results.', avatar: '📚' },
              { name: 'Privacy', role: 'Local first', text: 'Raw audio is not stored by default, and unavailable assessment stays visibly unavailable.', avatar: '🔒' },
              { name: 'Community', role: 'Learn together', text: 'Study groups and voice rooms support real learner-to-learner practice.', avatar: '🌍' },
              { name: 'Feedback', role: 'Evidence first', text: 'Generated feedback remains disabled until an approved runtime and model are installed.', avatar: '🧭' },
              { name: 'IELTS Academic', role: 'Product pack', text: 'Practice content is available, while automated band assessment remains uncalibrated and unavailable.', avatar: '📝' }
            ].map((t) => (
              <div key={t.name} className="glass-card p-6 text-left w-[350px] mx-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-primary-400">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-dark-300 italic">"{t.text}"</p>

              </div>
            ))}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Mascot expression="happy" size={90} message="Bạn còn chờ gì nữa? Nhảy vào thôi! 🚀" />
          <h2 className="mt-8 text-3xl sm:text-4xl font-bold text-white">Ready to Jump In?</h2>
          <p className="mt-4 text-dark-400">Build a consistent learning routine. Start free, no credit card required.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 mt-8 px-10 py-4 text-lg font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105"
          >
            Start Learning Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
