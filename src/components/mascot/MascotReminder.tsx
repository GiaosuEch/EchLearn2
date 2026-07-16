import { motion } from 'motion/react';
import Mascot from './Mascot';
import { Target, Zap } from 'lucide-react';
import { Link } from 'react-router';

interface MascotReminderProps {
  title: string;
  message: string;
  type: 'streak' | 'mission' | 'review';
  actionLabel?: string;
  actionUrl?: string;
}

export function MascotReminder({ title, message, type, actionLabel, actionUrl }: MascotReminderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-start gap-4 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
        <Mascot expression="encouraging" size={150} />
      </div>
      
      <div className="shrink-0 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
          ${type === 'streak' ? 'bg-error/20 text-error' : 
            type === 'mission' ? 'bg-yellow-500/20 text-yellow-500' : 
            'bg-primary-500/20 text-primary-400'}`}>
          {type === 'streak' ? <span className="text-2xl animate-fire">🔥</span> : 
           type === 'mission' ? <Target size={24} /> : 
           <Zap size={24} />}
        </div>
        <div className="absolute -bottom-2 -right-2">
          <Mascot expression={type === 'streak' ? 'surprised' : 'encouraging'} size={32} />
        </div>
      </div>
      
      <div className="flex-1 relative z-10">
        <h4 className="font-bold text-white text-base">{title}</h4>
        <p className="text-sm text-dark-300 mt-1">{message}</p>
        
        {actionLabel && actionUrl && (
          <Link
            to={actionUrl}
            className="inline-block mt-3 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
