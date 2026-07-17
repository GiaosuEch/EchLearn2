// @ts-nocheck
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Headphones, Mic, BookOpen, PenTool, Brain, Gamepad2, GraduationCap, WandSparkles, BrainCircuit } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { t13 } from '../../i18n/phase13Text';

function practiceAreas(lang: string) {
  return [
    { icon: <Headphones size={28} />, title: t13(lang, 'listening'), desc: t13(lang, 'listeningDesc'), path: '/app/listening', color: 'from-blue-500 to-cyan-500' },
    { icon: <Mic size={28} />, title: t13(lang, 'speaking'), desc: t13(lang, 'speakingDesc'), path: '/app/speaking', color: 'from-green-500 to-emerald-500' },
    { icon: <BookOpen size={28} />, title: t13(lang, 'reading'), desc: t13(lang, 'readingDesc'), path: '/app/reading', color: 'from-purple-500 to-violet-500' },
    { icon: <PenTool size={28} />, title: t13(lang, 'writing'), desc: t13(lang, 'writingDesc'), path: '/app/writing', color: 'from-orange-500 to-amber-500' },
    { icon: <Brain size={28} />, title: t13(lang, 'vocabulary'), desc: t13(lang, 'vocabularyDesc'), path: '/app/vocabulary', color: 'from-pink-500 to-rose-500' },
    { icon: <Gamepad2 size={28} />, title: t13(lang, 'grammar'), desc: t13(lang, 'grammarDesc'), path: '/app/grammar', color: 'from-yellow-500 to-orange-500' },
    { icon: <GraduationCap size={28} />, title: t13(lang, 'ielts'), desc: t13(lang, 'ieltsDesc'), path: '/app/ielts', color: 'from-red-500 to-pink-500' },
  ];
}

export default function PracticeHubPage() {
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const areas = practiceAreas(interfaceLanguage);
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{t13(interfaceLanguage, 'practiceHubTitle')}</h1>
        <p className="text-dark-400">{t13(interfaceLanguage, 'practiceHubDesc')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area, i) => (
          <motion.div key={area.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={area.path} className="block glass-card p-6 hover:border-primary-500/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {area.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{area.title}</h3>
              <p className="text-sm text-dark-400 mt-1">{area.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Coach Hub */}
      <Link to="/app/ai" className="flex items-center gap-4 rounded-xl border border-dark-700 bg-dark-900 p-5 transition-colors hover:border-primary-500/30">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h2 className="font-semibold text-white">AI Coach Hub</h2>
          <p className="mt-1 text-sm text-dark-400">Open the available AI shells and local learner-memory controls.</p>
        </div>
      </Link>

      {/* Practice Generator */}
      <Link to="/app/practice-generator" className="flex items-center gap-4 rounded-xl border border-dark-700 bg-dark-900 p-5 transition-colors hover:border-primary-500/30">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
          <WandSparkles size={22} />
        </div>
        <div>
          <h2 className="font-semibold text-white">Practice Generator</h2>
          <p className="mt-1 text-sm text-dark-400">Configure an activity and check local generation readiness.</p>
        </div>
      </Link>

      {/* Learner Memory */}
      <Link to="/app/learner-memory" className="flex items-center gap-4 rounded-xl border border-dark-700 bg-dark-900 p-5 transition-colors hover:border-primary-500/30">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h2 className="font-semibold text-white">Learner Memory</h2>
          <p className="mt-1 text-sm text-dark-400">Manage your local, consent-gated learner memory.</p>
        </div>
      </Link>
    </div>
  );
}
