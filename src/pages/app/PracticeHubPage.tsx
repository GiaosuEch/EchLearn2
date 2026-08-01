import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  Headphones, 
  Mic, 
  BookOpen, 
  PenTool, 
  Brain, 
  Gamepad2, 
  GraduationCap, 
  Sparkles, 
  Trophy, 
  Flame, 
  Clock, 
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export default function PracticeHubPage() {
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const isVi = interfaceLanguage === 'vi';
  const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'foundation' | 'exams'>('all');

  const practiceCards = [
    {
      id: 'listening',
      icon: <Headphones size={28} />,
      title: isVi ? 'Luyện Kỹ Năng Nghe (Listening)' : 'Listening Practice',
      desc: isVi ? 'Luyện nghe phản xạ với Video phân loại, Audio hội thoại thực tế & IELTS Part 1-4.' : 'Master listening with categorized audio, podcasts & authentic exams.',
      path: '/app/listening',
      category: 'skills',
      level: 'A1 - C2',
      duration: '15 - 30 phút',
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      btnColor: 'bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800',
      taskCount: '480+ Bài Nghe'
    },
    {
      id: 'speaking',
      icon: <Mic size={28} />,
      title: isVi ? 'Luyện Kỹ Năng Nói (Speaking)' : 'Speaking Practice',
      desc: isVi ? 'Nhận diện phát âm AI chuẩn IPA, phản xạ giao tiếp & luyện Part 1-2-3 Cue Cards.' : 'AI phonetic pronunciation feedback, conversation drills & Cue Cards.',
      path: '/app/speaking',
      category: 'skills',
      level: 'A1 - C2',
      duration: '10 - 20 phút',
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800',
      taskCount: '350+ Chủ Đề'
    },
    {
      id: 'reading',
      icon: <BookOpen size={28} />,
      title: isVi ? 'Luyện Kỹ Năng Đọc (Reading)' : 'Reading Practice',
      desc: isVi ? 'Đọc báo song ngữ, truyện ngắn CEFR & bài đọc Academic True/False/Not Given.' : 'Bilingual news, CEFR passages & IELTS Academic Reading tests.',
      path: '/app/reading',
      category: 'skills',
      level: 'A1 - C2',
      duration: '20 - 40 phút',
      color: 'from-purple-500 to-violet-500',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      btnColor: 'bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800',
      taskCount: '520+ Bài Đọc'
    },
    {
      id: 'writing',
      icon: <PenTool size={28} />,
      title: isVi ? 'Luyện Kỹ Năng Viết (Writing)' : 'Writing Practice',
      desc: isVi ? 'Chấm chữa bài luận AI, phân tích ngữ pháp, IELTS Task 1 Chart & Task 2 Essay.' : 'AI essay evaluation, grammar correction & IELTS Task 1-2 writing.',
      path: '/app/writing',
      category: 'skills',
      level: 'A2 - C2',
      duration: '25 - 60 phút',
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      btnColor: 'bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800',
      taskCount: '280+ Dạng Bài'
    },
    {
      id: 'vocabulary',
      icon: <Brain size={28} />,
      title: isVi ? 'Huấn Luyện Từ Vựng (Vocabulary Trainer)' : 'Vocabulary Trainer',
      desc: isVi ? 'Ghi nhớ lặp lại ngắt quãng (Spaced Repetition), Flashcard 3D & Từ vựng Band 7.0+.' : 'Spaced Repetition System, 3D Flashcards & Academic Collocations.',
      path: '/app/vocabulary',
      category: 'foundation',
      level: 'Mọi trình độ',
      duration: '10 - 15 phút',
      color: 'from-pink-500 to-rose-500',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      btnColor: 'bg-pink-600 hover:bg-pink-700 border-b-4 border-pink-800',
      taskCount: '3,500+ Từ Vựng'
    },
    {
      id: 'grammar',
      icon: <Gamepad2 size={28} />,
      title: isVi ? 'Đấu Trường Ngữ Pháp (Grammar Trainer)' : 'Grammar Trainer',
      desc: isVi ? 'Trắc nghiệm ngữ pháp phản xạ, phân tích thì, mệnh đề quan hệ & cấu trúc nâng cao.' : 'Reflexive grammar quizzes, tenses analysis & advanced sentence structures.',
      path: '/app/grammar',
      category: 'foundation',
      level: 'A1 - B2',
      duration: '10 - 20 phút',
      color: 'from-indigo-500 to-blue-600',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 border-b-4 border-indigo-800',
      taskCount: '150+ Chuyên Đề'
    },
    {
      id: 'ielts',
      icon: <GraduationCap size={28} />,
      title: isVi ? 'Hội Trường IELTS Academic Suite 👑' : 'IELTS Academic Suite',
      desc: isVi ? 'Thi thử 4 kỹ năng chuẩn Cambridge & BC, chấm Band điểm chi tiết & Lộ trình bứt phá.' : 'Full Cambridge & BC mock tests, Band score analytics & personalized strategy.',
      path: '/app/ielts',
      category: 'exams',
      level: 'Band 5.0 - 8.5+',
      duration: 'Full Mock / Skill Test',
      color: 'from-rose-600 to-red-600',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-black',
      btnColor: 'bg-rose-600 hover:bg-rose-700 border-b-4 border-rose-800',
      taskCount: 'Chuẩn Cambridge'
    },
  ];

  const filteredCards = activeTab === 'all' 
    ? practiceCards 
    : practiceCards.filter((card) => card.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner - Commercial Light Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} /> TRUNG TÂM LUYỆN TẬP ĐA KỸ NĂNG
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isVi ? 'Trung Tâm Luyện Tập Kỹ Năng & Luyện Thi 🎯' : 'Comprehensive Skill & Exam Practice Center'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              {isVi 
                ? 'Hệ thống bài tập 4 kỹ năng Nghe - Nói - Đọc - Viết, Từ vựng & Ngữ pháp được thiết kế theo Khung CEFR Châu Âu và tiêu chuẩn Cambridge IELTS.'
                : 'Comprehensive training suite for Listening, Speaking, Reading, Writing, Vocabulary & IELTS Academic exams.'}
            </p>
          </div>

          {/* Key Quick Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
              <Trophy size={20} className="mx-auto text-amber-500 mb-1" />
              <div className="text-xl font-black text-slate-900 dark:text-white">480+</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Bài Luyện</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
              <Flame size={20} className="mx-auto text-orange-500 mb-1" />
              <div className="text-xl font-black text-slate-900 dark:text-white">AI 24/7</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Chấm Bài</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
              <Award size={20} className="mx-auto text-emerald-500 mb-1" />
              <div className="text-xl font-black text-slate-900 dark:text-white">CEFR / IELTS</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Chuẩn Quốc Tế</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 custom-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Layers size={16} /> Tất Cả Kỹ Năng ({practiceCards.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Sparkles size={16} /> 4 Kỹ Năng Chính (Listening, Speaking, Reading, Writing)
        </button>
        <button
          onClick={() => setActiveTab('foundation')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'foundation'
              ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Brain size={16} /> Nền Tảng (Từ Vựng & Ngữ Pháp)
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:border-rose-400'
          }`}
        >
          <GraduationCap size={16} /> Luyện Thi IELTS Academic 👑
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300"
          >
            <div className="space-y-4">
              {/* Card Top Header */}
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${card.badgeColor}`}>
                    {card.level}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {card.duration}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                {card.taskCount}
              </span>

              <Link
                to={card.path}
                className={`px-5 py-2.5 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:translate-y-0.5 ${card.btnColor}`}
              >
                Vào Làm Bài <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
