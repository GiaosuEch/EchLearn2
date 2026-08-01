import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';


function renderAvatar(avatar: unknown, name: string) {
  const avatarStr = typeof avatar === 'string' ? avatar.trim() : '';
  if (avatarStr && (avatarStr.startsWith('/') || avatarStr.startsWith('http://') || avatarStr.startsWith('https://') || avatarStr.startsWith('data:image') || /\.(png|jpg|jpeg|svg|webp)$/i.test(avatarStr))) {
    return (
      <img
        src={avatarStr}
        alt={name}
        className="w-full h-full object-cover scale-[1.25] transform"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/mascots/pepe_mascot_avatar.png';
        }}
      />
    );
  }
  if (avatarStr && avatarStr.length <= 3 && !avatarStr.includes('/')) {
    return <span className="font-black text-slate-700 dark:text-slate-200">{avatarStr}</span>;
  }
  return <img src="/mascots/pepe_mascot_avatar.png" alt={name} className="w-full h-full object-cover scale-[1.25] transform" />;
}

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user);
  const stats = useLearningStore((s) => s.stats);
  const learningXP = stats?.totalXP ?? user?.xp ?? 0;
  const learningStreak = stats?.currentStreak ?? user?.streak ?? 0;
  const [activeLeague, setActiveLeague] = useState<'Bronze' | 'Silver' | 'Gold'>('Gold');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    import('../../../services/profileService').then(({ profileService }) => {
      profileService.getLeaderboard(20).then((data) => {
        const userXP = learningXP ?? user?.xp ?? 0;
        const userStreak = learningStreak ?? user?.streak ?? 0;

        let enriched = data.map(u => {
          const isMe = u.id === user?.id;
          return {
            ...u,
            name: isMe ? (user?.displayName || u.name) : u.name,
            avatar: isMe ? (user?.avatarUrl || u.avatar) : u.avatar,
            xp: isMe ? userXP : u.xp,
            streak: isMe ? userStreak : u.streak,
            trend: 'same',
            isCurrent: isMe
          };
        });

        if (user) {
          const userIdx = enriched.findIndex(u => u.id === user.id);
          const isMeAdmin = user.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';
          const currentUserEntry = {
            id: user.id,
            name: isMeAdmin ? 'GiaosuEch 👑' : (user.displayName || user.username || 'Học Viên Ếch'),
            avatar: user.avatarUrl || '/mascots/ech_buri_study_companion.png',
            xp: userXP,
            streak: userStreak,
            trend: 'same',
            isCurrent: true
          };

          if (userIdx >= 0) {
            enriched[userIdx] = currentUserEntry;
          } else {
            enriched.push(currentUserEntry);
          }
        }

        enriched.sort((a, b) => b.xp - a.xp);
        setUsers(enriched);
      });
    });
  }, [user, learningXP, learningStreak]);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 1: return 'bg-slate-200 dark:bg-gray-400/20 text-slate-700 dark:text-gray-300 border-gray-400/50';
      case 2: return 'bg-amber-700/20 text-amber-600 dark:text-amber-500 border-amber-700/50';
      default: return 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <PageShell title="Bảng Xếp Hạng Đấu Trường 🐸" description="Thi đấu cùng cộng đồng học viên toàn cầu và thăng hạng League" icon={<Trophy size={20} />}>
      
      {/* League Selector */}
      <div className="flex justify-center mb-8">
        <div className="p-2 flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <button onClick={() => setActiveLeague('Bronze')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeLeague === 'Bronze' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-inner' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
            Bronze League
          </button>
          <button onClick={() => setActiveLeague('Silver')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeLeague === 'Silver' ? 'bg-slate-200 dark:bg-slate-400/20 text-slate-800 dark:text-slate-200 shadow-inner' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
            Silver League
          </button>
          <button onClick={() => setActiveLeague('Gold')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 ${activeLeague === 'Gold' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] border border-yellow-500/40' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
            👑 Gold League
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
              className="flex flex-col items-center w-28 sm:w-36"
            >
              <div className="relative mb-2">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl font-bold bg-white dark:bg-slate-900 border-4 ${isFirst ? 'border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.5)] z-10' : isSecond ? 'border-gray-400' : 'border-amber-600'} overflow-hidden`}>
                  {renderAvatar(u.avatar, u.name)}
                </div>
                {isFirst && <span className="text-2xl absolute -top-7 left-1/2 -translate-x-1/2 drop-shadow-lg">👑</span>}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-slate-900 ${isFirst ? 'bg-yellow-400 text-yellow-950' : isSecond ? 'bg-gray-400 text-gray-950' : 'bg-amber-600 text-amber-950'}`}>
                  {isFirst ? '1' : isSecond ? '2' : '3'}
                </div>
              </div>
              
              <div className={`w-full flex flex-col items-center justify-start pt-4 px-2 rounded-t-2xl bg-gradient-to-t ${isFirst ? 'from-yellow-500/30 to-yellow-500/5 h-40 border-t-2 border-yellow-500/60' : isSecond ? 'from-gray-400/20 to-gray-400/5 h-32 border-t-2 border-gray-400/50' : 'from-amber-600/20 to-amber-600/5 h-24 border-t-2 border-amber-600/50'}`}>
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate w-full text-center">
                  {u.name} {u.isCurrent && <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">(Bạn)</span>}
                </p>
                <p className={`text-xs font-black mt-1 ${isFirst ? 'text-yellow-600 dark:text-yellow-400' : isSecond ? 'text-slate-600 dark:text-gray-300' : 'text-amber-600 dark:text-amber-400'}`}>{u.xp.toLocaleString()} XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700/50 flex text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <div className="w-16 text-center">Thứ Hạng</div>
          <div className="flex-1">Học Viên</div>
          <div className="w-24 text-center hidden sm:block">Streak 🔥</div>
          <div className="w-24 text-right pr-4">Tổng XP</div>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u, idx) => (
            <div key={u.id} className={`flex items-center p-4 transition-colors ${u.isCurrent ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-l-4 border-emerald-500 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}>
              <div className="w-16 flex justify-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${getRankStyle(idx)}`}>
                  {idx + 1}
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden text-lg">
                  {renderAvatar(u.avatar, u.name)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    {u.name}
                    {u.isCurrent && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] font-black">BẠN 🐸</span>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tích lũy kinh nghiệm học tập</div>
                </div>
              </div>

              <div className="w-24 text-center hidden sm:block text-amber-500 font-bold text-sm">
                🔥 {u.streak || 0} ngày
              </div>

              <div className="w-24 text-right pr-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {u.xp.toLocaleString()} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
