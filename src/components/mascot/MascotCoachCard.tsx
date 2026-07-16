import { motion } from 'motion/react';
import Mascot from './Mascot';

interface MascotCoachCardProps {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export function MascotCoachCard({ title, message, type = 'info', actionLabel, onAction }: MascotCoachCardProps) {
  const colors = {
    success: 'border-success/30 bg-success/5',
    warning: 'border-accent-400/30 bg-accent-400/5',
    error: 'border-error/30 bg-error/5',
    info: 'border-primary-500/30 bg-primary-500/5'
  };

  const expressions = {
    success: 'happy',
    warning: 'thinking',
    error: 'savage',
    info: 'encouraging'
  } as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 border-2 ${colors[type]} flex flex-col sm:flex-row gap-4 items-center sm:items-start`}
    >
      <div className="shrink-0">
        <Mascot expression={expressions[type]} size={70} />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-dark-300 leading-relaxed mb-4">{message}</p>
        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="px-5 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-semibold transition-colors border border-dark-600 hover:border-primary-500/50"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
