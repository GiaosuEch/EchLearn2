import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { MascotCoachCard } from '../../components/mascot/MascotCoachCard';
import { adaptiveLearningEngine, type TodayPlan } from '../../services/adaptiveLearningEngine';
import { Mascot3DParallax } from '../../components/mascot/Mascot3DParallax';
import { SVGProgressRing } from '../../components/common/SVGProgressRing';
import { useLearningStore } from '../../stores/learningStore';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Sun, Star, Flame, Shield, BarChart3, Bot, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const dailyXPGoal = useAppStore((s) => s.dailyXpGoal);
  const ieltsTargetBand = useAppStore((s) => s.ieltsTargetBand);
  const stats = useLearningStore((s) => s.stats);
  const todayXP = useLearningStore((s) => s.todayXP);
  const metrics = createDashboardMetrics(stats, todayXP, dailyXPGoal, ieltsTargetBand);
  const hasSupabase = isSupabaseConfigured();
  const [, setLeaderboard] = useState<any[]>([]);
  const [, setUserGroups] = useState<any[]>([]);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Adaptive learning plan
    setPlanLoading(true);
    adaptiveLearningEngine.getTodayPlan(user.id, currentLanguage, nativeLanguage)
      .then(setTodayPlan)
      .catch((error) => console.warn('Could not load adaptive plan', error))
      .finally(() => setPlanLoading(false));

    // Fetch Leaderboard
    if (hasSupabase) {
      import('../../services/profileService').then(({ profileService }) => {
        profileService.getLeaderboard(10).then(setLeaderboard).catch(() => {});
      });
      import('../../services/communitySupabaseService').then(({ communitySupabaseService }) => {
        communitySupabaseService.getStudyGroups().then(setUserGroups).catch(() => {});
      });
    }
  }, [user, currentLanguage, nativeLanguage, hasSupabase]);

  return (
    <div className="space-y-8 pb-16 font-sans max-w-7xl mx-auto px-4 sm:px-6">
      {!hasSupabase && (
        <MascotCoachCard
          type="info"
          title="Chế độ học trên thiết bị"
          message="Mọi tiến trình học hiện được lưu trên thiết bị của bạn. Kết nối tài khoản để đồng bộ khi bạn sẵn sàng."
          actionLabel="Tìm hiểu Supabase →"
          onAction={() => window.open('https://supabase.com/docs', '_blank')}
        />
      )}

      {/* Top Banner Row: 3D Hero Card (Left 8 Cols) + Mascot 3D Parallax Card (Right 4 Cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card */}
        <Card className="lg:col-span-8 p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white border-0 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <Badge variant="outline" className="bg-white/20 text-white border-white/20 backdrop-blur-md mb-4 flex items-center gap-1.5 w-fit">
              <Sun size={14} /> Morning Routine
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Good morning, {user?.displayName || user?.email?.split('@')[0] || 'Học Viên Ếch'}!
            </h1>
          </div>

          <div className="relative z-10 p-5 rounded-2xl bg-slate-900/30 text-white backdrop-blur-md font-medium text-sm sm:text-base leading-relaxed">
            "Ready to conquer your streak today? Let's dive into some daily skill practice!"
          </div>
        </Card>

        {/* Right Mascot 3D Parallax Card */}
        <Card className="lg:col-span-4 p-6 flex items-center justify-center relative overflow-hidden min-h-[220px]">
          <Mascot3DParallax 
            imageSrc="/mascots/ech_buri_study_companion.png" 
            size={190} 
          />
        </Card>
      </div>

      {/* 4 Stat Cards Row using Shadcn Card & Badge */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* XP Card */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
            <Star size={14} /> Daily XP
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{metrics.todayXP} <span className="text-slate-400 text-sm font-normal">/{metrics.dailyXPGoal}</span></p>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" role="progressbar" aria-label="Daily XP progress" aria-valuemin={0} aria-valuemax={metrics.dailyXPGoal} aria-valuenow={metrics.todayXP} style={{ width: `${metrics.dailyProgress}%` }} />
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-500">
            <Flame size={14} /> Streak
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{metrics.streak} <span className="text-slate-400 text-sm font-normal">Days</span></p>
          <Badge variant="amber">On Fire!</Badge>
        </Card>

        {/* Level Card */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Shield size={14} /> Level
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Lvl {metrics.level}</p>
          <Badge variant="default">Explorer</Badge>
        </Card>

        {/* Est. Band Card */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <BarChart3 size={14} /> IELTS Band
            </div>
            <TrendingUp size={14} className="text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{metrics.estimatedBand ?? '—'}</p>
          <Badge variant="purple">Target {metrics.targetBand}</Badge>
        </Card>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Adaptive Path Header Card using Shadcn Card & Button */}
          <Card className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg"><Bot size={20} /></div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Lộ trình thích ứng</span>
              </div>
              <span className="text-xs font-bold text-slate-400">Kế hoạch học hôm nay</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {todayPlan?.recommendedLesson?.title || 'Business Communication'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Thăng cấp năng lực ngôn ngữ: <span className="font-bold text-slate-800 dark:text-slate-200">{adaptiveLearningEngine.getMasteryLabel(75)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="amber" className="py-2 px-4">
                <span>🔄</span> {todayPlan ? todayPlan.reviewQueue.length : 18} Spaced Repetition Due
              </Badge>
              <Badge variant="destructive" className="py-2 px-4">
                <span>🎙️</span> Weak Skills: {todayPlan ? todayPlan.weakSkills.join(', ') : '/θ/ Pronunciation'}
              </Badge>
              <Badge variant="secondary" className="py-2 px-4">
                <span>⏱️</span> Est. 15 Mins
              </Badge>
            </div>

            {/* Shadcn Button with Duolingo 3D Styling */}
            <div className="pt-2">
              <Link to={todayPlan?.recommendedLesson?.path || '/app/lesson?id=en_mod_1&lesId=en_les_1'}>
                <Button size="lg" className="w-full sm:w-auto uppercase tracking-wider">
                  ▶ BẮT ĐẦU BÀI HỌC HÔM NAY
                </Button>
              </Link>
            </div>
          </Card>

          {/* Continue Learning & SVG Progress Skill Breakdown */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-base">📘 Continue Learning</h3>
                  <Badge variant="default">IN PROGRESS</Badge>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">UNIT 2</p>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base mt-0.5">Nuance & Idioms</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Lesson 7 of 11</p>
                </div>
              </div>
              <Link to="/app/lesson">
                <Button variant="secondary" className="w-full uppercase tracking-wider text-xs">
                  Continue →
                </Button>
              </Link>
            </Card>

            {/* SVG Progress Ring Gauge Meters */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-base">📊 Skill Breakdown</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <SVGProgressRing progress={78} size={54} color="#10B981" label="Listening" delayMs={100} />
                <SVGProgressRing progress={60} size={54} color="#8B5CF6" label="Speaking" delayMs={300} />
                <SVGProgressRing progress={88} size={54} color="#3B82F6" label="Reading" delayMs={500} />
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Unit Progress Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Unit 2: Work & Study</h3>
              <Badge variant="default">64%</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">General Training</p>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '64%' }} />
            </div>
            <Link to="/app/lesson">
              <Button variant="outline" className="w-full text-emerald-600 dark:text-emerald-400 text-xs">
                Resume Unit
              </Button>
            </Link>
          </Card>

          {/* Daily Missions Checklist */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">🎯</span>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Daily Missions</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="text-xs font-bold line-through text-slate-400">Complete 2 Speaking Sessions</p>
                  <span className="text-[10px] font-extrabold text-amber-500">⭐ +50 XP</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Score 80%+ in Listening</p>
                  <span className="text-[10px] font-extrabold text-amber-500">⭐ +75 XP</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Learn 10 New Vocab</p>
                  <span className="text-[10px] font-extrabold text-amber-500">⭐ +30 XP</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

