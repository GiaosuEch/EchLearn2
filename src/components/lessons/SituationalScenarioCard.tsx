import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, User, Activity } from 'lucide-react';
import type { Exercise } from '../../stores/lessonStore';
import clsx from 'clsx';

interface SituationalScenarioCardProps {
  exercise: Exercise;
  selectedOption: string;
  onSelectOption: (option: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

export const SituationalScenarioCard: React.FC<SituationalScenarioCardProps> = ({
  exercise,
  selectedOption,
  onSelectOption,
  showResult,
  isCorrect
}) => {
  // Parse the data encoded by situationalGenerator
  const rawQuestion = exercise.question.replace('[SITUATIONAL IMMERSION] ', '');
  const parts = rawQuestion.split('\n\n');
  const scenarioText = parts[0] || '';
  const questionText = parts[1] || '';

  const instructionParts = exercise.instruction?.split(' | ') || [];
  const personaText = instructionParts[0]?.replace('Role: ', '') || 'Unknown Persona';
  const stakesText = instructionParts[1]?.replace('Stakes: ', '') || 'Unknown Stakes';

  const isHighStakes = stakesText.toLowerCase() === 'high';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10"
      >
        <div className="flex items-center gap-3 text-gray-200">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Speaking to</p>
            <p className="font-medium text-sm md:text-base">{personaText}</p>
          </div>
        </div>
        
        <div className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-inner",
          isHighStakes ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
        )}>
          {isHighStakes ? <AlertCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          {stakesText} Stakes
        </div>
      </motion.div>

      {/* Narrative Body */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50"
      >
        {/* Glassmorphism reflection */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
        
        <p className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
          {scenarioText}
        </p>
        
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-base md:text-lg">
            {questionText}
          </p>
        </div>
      </motion.div>

      {/* High-Stakes Options */}
      <div className="grid gap-3 mt-2">
        <AnimatePresence>
          {exercise.options?.map((opt, index) => {
            const option = String(opt);
            const isSelected = selectedOption === option;
            let statusClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md";
            
            if (showResult) {
              const isCorrectAnswer = exercise.correctAnswer === option || 
                (Array.isArray(exercise.correctAnswer) && exercise.correctAnswer.includes(option));
                
              if (isSelected && isCorrect) {
                statusClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
              } else if (isSelected && !isCorrect) {
                statusClass = "bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-900 dark:text-rose-100";
              } else if (isCorrectAnswer) {
                statusClass = "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-400 border-dashed text-emerald-800 dark:text-emerald-200";
              } else {
                statusClass = "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50";
              }
            } else if (isSelected) {
              statusClass = "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20 shadow-lg scale-[1.01]";
            }

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => !showResult && onSelectOption(option)}
                disabled={showResult}
                className={clsx(
                  "w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 font-medium",
                  "focus:outline-none flex items-center justify-between group",
                  statusClass
                )}
              >
                <span className="text-base md:text-lg">{option}</span>
                {!showResult && (
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-indigo-500" : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                  )}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
