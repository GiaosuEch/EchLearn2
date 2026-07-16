import { motion } from 'motion/react';

interface BlobBackgroundProps {
  className?: string;
  colors?: string[]; // e.g. ['bg-primary-500', 'bg-blue-500', 'bg-purple-500']
}

export function BlobBackground({ 
  className = '',
  colors = ['bg-primary-500', 'bg-blue-500', 'bg-purple-500']
}: BlobBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 50, 0],
          y: [0, -30, 0],
          opacity: [0.1, 0.2, 0.1] 
        }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
        className={`absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full ${colors[0]} blur-3xl`} 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2], 
          x: [0, -40, 0],
          y: [0, 50, 0],
          opacity: [0.1, 0.15, 0.1] 
        }} 
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }} 
        className={`absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full ${colors[1] || colors[0]} blur-3xl`} 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1], 
          x: [0, 20, -20, 0],
          y: [0, 30, -10, 0],
          opacity: [0.05, 0.1, 0.05] 
        }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
        className={`absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full ${colors[2] || colors[0]} blur-3xl`} 
      />
    </div>
  );
}
