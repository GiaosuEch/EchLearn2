import { motion } from 'motion/react';
import Mascot from './Mascot';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

interface MascotEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  actionOnClick?: () => void;
  expression?: 'cool' | 'encouraging' | 'thinking' | 'surprised' | 'savage' | 'happy';
}

export function MascotEmptyState({ 
  title, 
  message, 
  actionLabel, 
  actionUrl,
  actionOnClick,
  expression = 'thinking' 
}: MascotEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
        <Mascot expression={expression} size={120} />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-dark-400 mb-6">{message}</p>
      
      {actionLabel && (actionUrl || actionOnClick) && (
        actionUrl ? (
          <Link
            to={actionUrl}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Sparkles size={18} />
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={actionOnClick}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Sparkles size={18} />
            {actionLabel}
          </button>
        )
      )}
    </motion.div>
  );
}
