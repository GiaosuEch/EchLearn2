// @ts-nocheck
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router';
import { Lock, Check, BookOpen, ArrowRight } from 'lucide-react';
import { getCourseForLanguage } from '../../curriculum/courseRegistry';
import { useAppStore } from '../../stores/appStore';
import { t13 } from '../../i18n/phase13Text';
import { useEffect } from 'react';

export default function CourseRoadmapPage() {
  const [searchParams] = useSearchParams();
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const setCurrentLanguage = useAppStore((s) => s.setCurrentLanguage);

  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && langParam !== currentLanguage) {
      setCurrentLanguage(langParam);
    }
  }, [searchParams, currentLanguage, setCurrentLanguage]);
  
  const langModules = getCourseForLanguage(currentLanguage) || [];
  const langCourses = langModules.map((m, i) => ({
    id: m.id,
    languageId: currentLanguage,
    title: m.title,
    level: m.level,
    description: m.description,
    totalLessons: m.lessons.length,
    completedLessons: 0,
    xpReward: 100,
    skills: Array.from(new Set(m.lessons.map(l => l.type))),
    isLocked: i > 0,
    order: i + 1,
  }));

  const levelColors: Record<string, string> = {
    beginner: 'from-blue-500 to-cyan-500',
    elementary: 'from-green-500 to-emerald-500',
    intermediate: 'from-yellow-500 to-amber-500',
    'upper-intermediate': 'from-orange-500 to-red-500',
    advanced: 'from-purple-500 to-violet-500',
    mastery: 'from-pink-500 to-rose-500',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{t13(interfaceLanguage, 'courseRoadmap')}</h1>
        <p className="text-dark-400">{t13(interfaceLanguage, 'courseRoadmapDesc')}</p>
      </motion.div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-700" />

        <div className="space-y-4">
          {langCourses.map((course, i) => {
            const progress = course.totalLessons > 0 ? (course.completedLessons / course.totalLessons) * 100 : 0;
            const isComplete = progress === 100;

            return (
              <motion.div key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-16"
              >
                {/* Node */}
                <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isComplete ? 'bg-primary-500 border-primary-500' : course.isLocked ? 'bg-dark-800 border-dark-600' : 'bg-dark-800 border-primary-500'}`}>
                  {isComplete ? <Check size={10} className="text-white" /> : course.isLocked ? <Lock size={8} className="text-dark-500" /> : null}
                </div>

                <Link to={course.isLocked ? '#' : `/app/lesson?id=${course.id}`}
                  className={`block glass-card p-5 transition-all duration-300 ${course.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/30 hover:-translate-y-0.5'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${levelColors[course.level] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{course.title}</h3>
                        <p className="text-xs text-dark-400">{course.level} · {course.totalLessons} {t13(interfaceLanguage, 'lessons')} · +{course.xpReward} XP</p>
                      </div>
                    </div>
                    {!course.isLocked && !isComplete && (
                      <ArrowRight size={18} className="text-primary-400" />
                    )}
                  </div>

                  <p className="text-sm text-dark-400 mt-2">{course.description}</p>

                  {!course.isLocked && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-dark-500">{course.completedLessons}/{course.totalLessons} {t13(interfaceLanguage, 'completed')}</span>
                        <span className="text-primary-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex gap-2">
                    {course.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 bg-dark-700/50 rounded-full text-dark-400">{skill}</span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
