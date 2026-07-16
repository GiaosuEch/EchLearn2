import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';

function isImageAvatar(value: unknown): value is string {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image'));
}

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user);
  const [activeLeague, setActiveLeague] = useState<'Bronze' | 'Silver' | 'Gold'>('Silver');

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    import('../../../services/profileService').then(({ profileService }) => {
      profileService.getLeaderboard(20).then((data) => {
        const enriched = data.map(u => ({
          ...u,
          trend: 'same',
          isCurrent: u.id === user?.id
        }));
        
        // Ensure current user is in list if not empty
        if (enriched.length > 0 && user && !enriched.find(u => u.isCurrent)) {
          enriched.push({
            id: user.id,
            name: user.displayName || 'You',
            avatar: user.avatarUrl || '👤',
            xp: user.xp,
            streak: user.streak,
            trend: 'up',
            isCurrent: true
          });
          enriched.sort((a, b) => b.xp - a.xp);
        }
        
        setUsers(enriched);
      });
    });
  }, [user]);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 1: return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
      case 2: return 'bg-amber-700/20 text-amber-500 border-amber-700/50';
      default: return 'bg-dark-800 text-dark-400 border-dark-700';
    }
  };

  return (
    <PageShell title="Leaderboard" description="Compete with learners globally and climb the leagues." icon={<Trophy size={20} />}>
      
      {/* League Selector */}
      <div className="flex justify-center mb-8">
        <div className="glass-card p-2 flex items-center gap-2 rounded-full">
          <button onClick={() => setActiveLeague('Bronze')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeLeague === 'Bronze' ? 'bg-amber-900/40 text-amber-500 shadow-inner' : 'text-dark-400 hover:text-white'}`}>
            Bronze League
          </button>
          <button onClick={() => setActiveLeague('Silver')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeLeague === 'Silver' ? 'bg-gray-400/20 text-gray-300 shadow-inner' : 'text-dark-400 hover:text-white'}`}>
            Silver League
          </button>
          <button onClick={() => setActiveLeague('Gold')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1 ${activeLeague === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'text-dark-400 hover:text-white'}`}>
            <Crown size={16} /> Gold League
          </button>
        </div>
      </div>

      {/* Podium (Top 3) */}
      <div className="flex items-end justify-center gap-4 mb-12 h-64 mt-10">
        {[users[1], users[0], users[2]].map((u, i) => {
          if (!u) return null;
          const isFirst = i === 1;
          const isSecond = i === 0;
          
          return (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isFirst ? 0.2 : isSecond ? 0.4 : 0.6 }}
              className={`flex flex-col items-center w-28 sm:w-36`}
            >
              <div className="relative mb-2">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl font-bold bg-dark-800 border-4 ${isFirst ? 'border-yellow-400 z-10' : isSecond ? 'border-gray-400' : 'border-amber-600'} overflow-hidden`}>
                  {isImageAvatar(u.avatar) ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.avatar}
                </div>
                {isFirst && <Crown size={24} className="text-yellow-400 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-lg" />}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-dark-950 ${isFirst ? 'bg-yellow-400 text-yellow-900' : isSecond ? 'bg-gray-400 text-gray-900' : 'bg-amber-600 text-amber-950'}`}>
                  {isFirst ? '1' : isSecond ? '2' : '3'}
                </div>
              </div>
              
              <div className={`w-full flex flex-col items-center justify-start pt-4 px-2 rounded-t-xl bg-gradient-to-t ${isFirst ? 'from-yellow-500/20 to-yellow-500/5 h-40 border-t-2 border-yellow-500/50' : isSecond ? 'from-gray-400/20 to-gray-400/5 h-32 border-t-2 border-gray-400/50' : 'from-amber-600/20 to-amber-600/5 h-24 border-t-2 border-amber-600/50'}`}>
                <p className="font-bold text-white text-xs sm:text-sm truncate w-full text-center">{u.name}</p>
                <p className={`text-xs font-bold mt-1 ${isFirst ? 'text-yellow-400' : isSecond ? 'text-gray-400' : 'text-amber-500'}`}>{u.xp.toLocaleString()} XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard List */}
      <div className="glass-card overflow-hidden">
        <div className="bg-dark-800/50 p-4 border-b border-dark-700 flex text-xs font-bold text-dark-400 uppercase tracking-wider">
          <div className="w-16 text-center">Rank</div>
          <div className="flex-1">Learner</div>
          <div className="w-24 text-center hidden sm:block">Streak</div>
          <div className="w-24 text-right pr-4">Total XP</div>
        </div>
        
        <div className="divide-y divide-dark-700/50">
          {users.map((u, idx) => (
            <div key={u.id} className={`flex items-center p-4 transition-colors ${u.isCurrent ? 'bg-primary-900/20 border-l-4 border-primary-500' : 'hover:bg-dark-800/30 border-l-4 border-transparent'}`}>
              <div className="w-16 flex justify-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${getRankStyle(idx)}`}>
                  {idx + 1}
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-lg overflow-hidden border border-dark-600">
                  {isImageAvatar(u.avatar) ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.avatar}
                </div>
                <div>
                  <p className={`font-bold ${u.isCurrent ? 'text-primary-400' : 'text-white'}`}>
                    {u.name} {u.isCurrent && <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full ml-2">YOU</span>}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 sm:hidden">
                    <Flame size={12} className="text-accent-400" />
                    <span className="text-xs text-dark-300">{u.streak} days</span>
                  </div>
                </div>
              </div>
              
              <div className="w-24 hidden sm:flex items-center justify-center gap-1 text-dark-300">
                <Flame size={14} className={u.streak > 10 ? 'text-accent-400' : 'text-dark-500'} />
                <span className="font-medium text-sm">{u.streak}</span>
              </div>
              
              <div className="w-24 text-right pr-4 flex flex-col items-end">
                <span className="font-bold text-white">{u.xp.toLocaleString()}</span>
                <span className="text-xs text-dark-500 flex items-center gap-0.5 mt-0.5">
                  {u.trend === 'up' && <ChevronUp size={12} className="text-success" />}
                  {u.trend === 'down' && <ChevronDown size={12} className="text-error" />}
                  {u.trend === 'same' && <span className="w-3 text-center">-</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </PageShell>
  );
}

// Small icon helper
function Crown(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
