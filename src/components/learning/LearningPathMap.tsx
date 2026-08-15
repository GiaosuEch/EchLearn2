import { useMemo } from 'react';
import { Check, Lock, Star, Flag, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomEmoji } from '../common/CustomEmoji';

export interface PathNode {
  id: string;
  level: string; // e.g. N5, N4
  title: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'kana' | 'hangul' | 'pronunciation' | 'checkpoint' | 'mastery-gate';
  status: 'locked' | 'active' | 'completed';
  progress: number; // 0 to 100
  x?: number;
  y?: number;
}

interface LearningPathMapProps {
  nodes: PathNode[];
  onNodeClick: (node: PathNode) => void;
}

export function LearningPathMap({ nodes, onNodeClick }: LearningPathMapProps) {
  // Generate positions for a winding path (sine wave or zig-zag)
  const positionedNodes = useMemo(() => {
    return nodes.map((node, index) => {
      // Create a winding path using sine wave logic
      const isRight = Math.sin(index * 0.8) > 0;
      const xOffset = Math.sin(index * 0.8) * 80;
      return {
        ...node,
        x: xOffset,
        y: index * 120,
        isRight
      };
    });
  }, [nodes]);

  return (
    <div className="relative py-12 flex flex-col items-center w-full max-w-md mx-auto">
      {/* SVG Path connecting nodes */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10" style={{ minHeight: positionedNodes.length * 120 + 100 }}>
        {positionedNodes.map((node, i) => {
          if (i === positionedNodes.length - 1) return null;
          const nextNode = positionedNodes[i + 1];
          const startX = 200 + (node.x || 0); // Assuming center is 200
          const startY = node.y! + 40; // 40 is half node height approx
          const endX = 200 + (nextNode.x || 0);
          const endY = nextNode.y!;
          
          // Draw a curved path
          const pathD = `M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`;
          
          const isCompleted = node.status === 'completed';
          const isNextActive = nextNode.status === 'active' || nextNode.status === 'completed';
          const strokeColor = (isCompleted && isNextActive) ? '#10b981' : '#e2e8f0'; // emerald-500 or slate-200
          
          return (
            <path
              key={`path-${node.id}`}
              d={pathD}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="16"
              strokeLinecap="round"
              className={isCompleted && isNextActive ? 'opacity-100' : 'opacity-40 dark:opacity-20'}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {positionedNodes.map((node) => {
        const isLocked = node.status === 'locked';
        const isActive = node.status === 'active';
        const isCompleted = node.status === 'completed';

        let bgColor = 'bg-slate-200 dark:bg-slate-800 text-slate-400';
        let ringColor = '';
        let Icon = Lock;

        if (isActive) {
          bgColor = 'bg-emerald-500 text-white';
          ringColor = 'ring-4 ring-emerald-500/30';
          Icon = Star;
        } else if (isCompleted) {
          bgColor = 'bg-amber-400 text-white';
          ringColor = 'ring-4 ring-amber-400/30';
          Icon = Check;
        }

        if (node.type === 'checkpoint') {
          Icon = Flag;
        } else if (node.type === 'mastery-gate') {
          Icon = Shield;
        }

        return (
          <div
            key={node.id}
            className="relative flex items-center justify-center mb-[40px]"
            style={{ transform: `translateX(${node.x}px)` }}
          >
            {/* Crown for active node */}
            {isActive && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: -45, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="absolute text-3xl z-20"
              >
                <CustomEmoji name="sparkles-badge" size={32} />
              </motion.div>
            )}

            <button
              aria-label={node.title}
              onClick={() => !isLocked && onNodeClick(node)}
              disabled={isLocked}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-105 active:scale-95'} ${bgColor} ${ringColor}`}
            >
              <Icon size={32} className={isLocked ? 'opacity-50' : ''} />
            </button>

            {/* Tooltip / Label */}
            <div className={`absolute top-1/2 -translate-y-1/2 ${node.isRight ? 'left-full ml-4' : 'right-full mr-4'} w-32`}>
              <div className={`p-2 rounded-xl text-center shadow-sm font-bold text-xs ${isActive ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/20' : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                {node.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
