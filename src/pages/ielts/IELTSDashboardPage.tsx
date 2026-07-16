import { motion } from 'motion/react';
import { Link } from 'react-router';
import { GraduationCap, Headphones, Mic, BookOpen, PenTool, Target, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { IELTS_BAND_RANGES } from '../../types/ielts';
import { useLearningStore } from '../../stores/learningStore';
import { useAuthStore } from '../../stores/authStore';
import { mockTests } from '../../data/ieltsData';

export default function IELTSDashboardPage() {
  const stats = useLearningStore((s) => s.stats);
  const user = useAuthStore((s) => s.user);

  const skills = [
    { name: 'Listening', icon: <Headphones size={24} />, score: stats.listeningScore, band: 6.0, path: '/app/ielts/listening', color: '#38BDF8' },
    { name: 'Reading', icon: <BookOpen size={24} />, score: stats.readingScore, band: 6.5, path: '/app/ielts/reading', color: '#A78BFA' },
    { name: 'Writing', icon: <PenTool size={24} />, score: stats.writingScore, band: 5.5, path: '/app/ielts/writing', color: '#F59E0B' },
    { name: 'Speaking', icon: <Mic size={24} />, score: stats.speakingScore, band: 6.0, path: '/app/ielts/speaking', color: '#22C55E' },
  ];

  const weakSkill = skills.reduce((prev, current) => (prev.band < current.band) ? prev : current);

  const mockChartData = [
    { date: 'Week 1', band: 5.0 },
    { date: 'Week 2', band: 5.5 },
    { date: 'Week 3', band: 5.5 },
    { date: 'Week 4', band: 6.0 },
  ];

  const currentBand = stats.ieltsEstimatedBand;
  const targetBand = user?.ieltsTargetBand || 7.0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GraduationCap size={28} /> IELTS Dashboard</h1>
        <p className="text-dark-400">Track your IELTS preparation progress from 0.0 to 9.0</p>
      </motion.div>

      {/* Band overview */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-dark-400">Current Estimated Band</p>
          <p className="text-5xl font-bold text-primary-400 mt-2">{currentBand}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-primary-500/10 text-primary-400 text-sm rounded-full">
            {IELTS_BAND_RANGES.find(r => currentBand >= r.minBand && currentBand < r.maxBand)?.name || 'Intermediate'}
          </div>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-dark-400">Target Band</p>
          <p className="text-5xl font-bold text-accent-400 mt-2">{targetBand}</p>
          <div className="mt-2 text-sm text-dark-400">
            Gap: <span className="text-white font-semibold">+{(targetBand - currentBand).toFixed(1)}</span> bands to go
          </div>
        </div>
      </div>

      {/* Band scale */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={20} /> Band Progress</h2>
        <div className="flex gap-1 mb-3">
          {IELTS_BAND_RANGES.map((range) => {
            const isActive = currentBand >= range.minBand && currentBand < range.maxBand;
            const isPassed = currentBand >= range.maxBand;
            return (
              <div key={range.id} className={`flex-1 h-3 rounded-full transition-all ${isPassed ? 'bg-primary-500' : isActive ? 'bg-primary-500/50' : 'bg-dark-700'}`}
                title={`${range.name}: ${range.minBand}-${range.maxBand}`} />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-dark-500">
          <span>0.0</span><span>3.0</span><span>4.0</span><span>5.0</span><span>6.0</span><span>7.0</span><span>8.0</span><span>9.0</span>
        </div>
      </div>

      {/* 4 Skills */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skills.map((skill, i) => (
          <motion.div key={skill.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={skill.path} className="block glass-card p-5 hover:border-primary-500/20 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: skill.color + '20', color: skill.color }}>
                  {skill.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{skill.name}</p>
                  <p className="text-xs text-dark-400">Band {skill.band}</p>
                </div>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${skill.score}%`, backgroundColor: skill.color }} />
              </div>
              <p className="text-xs text-dark-500 mt-1">{skill.score}% proficiency</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={20} /> Band History</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[0, 9]} ticks={[0, 3, 4, 5, 6, 7, 8, 9]} stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="band" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 border-error/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-error" /> Weakest Skill</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: weakSkill.color + '20', color: weakSkill.color }}>
              {weakSkill.icon}
            </div>
            <div>
              <p className="font-bold text-white text-lg">{weakSkill.name}</p>
              <p className="text-sm text-error">Band {weakSkill.band}</p>
            </div>
          </div>
          <p className="text-sm text-dark-300 mb-4">Your {weakSkill.name.toLowerCase()} score is holding back your overall band. Let's focus on this.</p>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-dark-400 uppercase">Recommended Plan</h4>
            <div className="bg-dark-800/50 p-3 rounded-lg flex items-start gap-3">
              <span className="text-primary-400">1</span>
              <p className="text-xs text-dark-300">Complete AI {weakSkill.name} Coaching session daily.</p>
            </div>
            <div className="bg-dark-800/50 p-3 rounded-lg flex items-start gap-3">
              <span className="text-primary-400">2</span>
              <p className="text-xs text-dark-300">Review common mistakes in your notebook.</p>
            </div>
          </div>
          <Link to={weakSkill.path} className="mt-4 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
            Practice Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Mock tests */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Target size={20} /> Mock Tests</h2>
          <Link to="/app/mock-tests" className="text-xs text-primary-400 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {mockTests.map((test) => (
            <div key={test.id} className="flex items-center gap-3 p-3 bg-dark-800/30 rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${test.isCompleted ? 'bg-success/20 text-success' : 'bg-dark-700 text-dark-400'}`}>
                {test.isCompleted ? '✅' : '📝'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{test.title}</p>
                <p className="text-xs text-dark-400">{test.duration} min · {test.bandTarget}</p>
              </div>
              {test.isCompleted && test.score !== undefined && (
                <span className="text-sm font-semibold text-primary-400">Band {test.score}</span>
              )}
              {!test.isCompleted && (
                <Link to="/app/mock-tests" className="text-xs px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">Start</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
