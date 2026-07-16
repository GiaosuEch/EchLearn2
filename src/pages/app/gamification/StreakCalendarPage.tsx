import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Flame, ShieldAlert, Award, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';
import Mascot from '../../../components/mascot/Mascot';

export default function StreakCalendarPage() {
  const user = useAuthStore((s) => s.user);
  const [showRepairModal, setShowRepairModal] = useState(false);
  
  // Mock calendar logic
  const daysInMonth = 31;
  const currentDay = new Date().getDate();
  const streak = user?.streak || 5;
  const missingDays = [currentDay - 2]; // Example missed day
  
  const handleRepairStreak = () => {
    setShowRepairModal(false);
    // Real logic: DEDUCT gems, restore streak in Supabase
  };

  return (
    <PageShell title="Streak Calendar" description="Build your daily habit and don't break the chain!" icon={<Calendar size={20} />}>
      
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2"><Calendar size={20} className="text-primary-400" /> July 2026</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-dark-800 rounded-lg text-dark-300 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                <button className="p-1.5 bg-dark-800 rounded-lg text-dark-300 hover:text-white transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-xs font-bold text-dark-500 uppercase">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty days offset */}
              {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
              
              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isPast = day <= currentDay;
                const isToday = day === currentDay;
                const isMissed = missingDays.includes(day);
                const isStreak = isPast && !isMissed && day >= currentDay - streak;
                
                let dayClass = "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative group";
                if (isToday) dayClass += " bg-primary-500/20 text-primary-400 border-2 border-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                else if (isStreak) dayClass += " bg-accent-500/20 text-accent-400 border border-accent-500/50";
                else if (isMissed) dayClass += " bg-error/10 text-error border border-error/50 cursor-pointer hover:bg-error/20";
                else if (isPast) dayClass += " bg-dark-800 text-dark-400";
                else dayClass += " bg-dark-800/30 text-dark-600";

                return (
                  <div key={day} className={dayClass} onClick={() => isMissed && setShowRepairModal(true)}>
                    {day}
                    {isStreak && !isToday && <Flame size={12} className="absolute -bottom-1 -right-1 text-accent-400" />}
                    {isMissed && <ShieldAlert size={12} className="absolute -bottom-1 -right-1 text-error animate-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 bg-gradient-to-br from-accent-900/20 to-dark-900 border-accent-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-sm text-dark-300">Current Streak</p>
                <p className="text-2xl font-bold text-white">{streak} <span className="text-sm text-dark-400 font-normal">days</span></p>
              </div>
            </div>
            
            <div className="glass-card p-5 bg-gradient-to-br from-yellow-900/20 to-dark-900 border-yellow-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Award size={24} />
              </div>
              <div>
                <p className="text-sm text-dark-300">Longest Streak</p>
                <p className="text-2xl font-bold text-white">14 <span className="text-sm text-dark-400 font-normal">days</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Streak Repair & Buri */}
        <div className="space-y-6">
          {missingDays.length > 0 && (
            <div className="glass-card p-6 border-error/30 bg-error/5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-all" />
              <ShieldAlert className="text-error mb-4" size={32} />
              <h3 className="text-lg font-bold text-white">Streak at Risk!</h3>
              <p className="text-sm text-dark-300 mt-2 mb-6">You missed a day. Repair your streak now to keep your multiplier active.</p>
              <button 
                onClick={() => setShowRepairModal(true)}
                className="w-full py-3 bg-error hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-error/20 transition-all"
              >
                Repair for 500 Gems
              </button>
            </div>
          )}

          <div className="glass-card p-6 flex flex-col items-center text-center">
            <Mascot expression="encouraging" size={120} />
            <h3 className="font-bold text-white mt-4">Keep it going!</h3>
            <p className="text-sm text-dark-300 mt-2">Study for 7 consecutive days to earn the "Unstoppable" badge and double XP.</p>
          </div>
        </div>

      </div>

      {/* Repair Modal */}
      <AnimatePresence>
        {showRepairModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-error/20 flex items-center justify-center text-error mb-4">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Repair Streak?</h2>
              <p className="text-sm text-dark-300 mb-6">Use 500 gems to fix your missing day and restore your {streak + 1} day streak.</p>
              
              <div className="flex flex-col gap-3">
                <button onClick={handleRepairStreak} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Repair Now
                </button>
                <button onClick={() => setShowRepairModal(false)} className="w-full py-3 bg-dark-800 hover:bg-dark-700 text-dark-300 font-medium rounded-xl transition-colors">
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageShell>
  );
}
