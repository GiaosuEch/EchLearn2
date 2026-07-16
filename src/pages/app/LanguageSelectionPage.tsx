import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { languages } from '../../data/languages';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { toast } from '../../components/ui/Toast';

export default function LanguageSelectionPage() {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const setCurrentLanguage = useAppStore(s => s.setCurrentLanguage);
  const user = useAuthStore(s => s.user);

  const handleStartLearning = async () => {
    if (!selectedLang) return;
    setIsSaving(true);
    
    try {
      // 1. Save to App Store (Local State)
      setCurrentLanguage(selectedLang);
      
      // 2. Save to User Profile / Supabase if logged in
      if (user) {
        if (isSupabaseConfigured() && supabase) {
          const { error } = await supabase
            .from('profiles')
            .update({ target_languages: [selectedLang] })
            .eq('id', user.id);
            
          if (error) throw error;
        } else {
          // Local fallback
          const localUsers = JSON.parse(localStorage.getItem('ech_lern_users') || '[]');
          const updatedUsers = localUsers.map((u: any) => 
            u.id === user.id ? { ...u, targetLanguages: [selectedLang] } : u
          );
          localStorage.setItem('ech_lern_users', JSON.stringify(updatedUsers));
        }
      }
      
      // Navigate to roadmap or dashboard
      navigate(`/app/roadmap?lang=${selectedLang}`);
    } catch (err: any) {
      toast(`Failed to save language: ${err.message}`, 'error');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Choose Your Language</h1>
          <p className="text-dark-400 mt-1">Select a language to start learning or continue your journey.</p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang, i) => {
            const isSelected = selectedLang === lang.id;
            return (
              <motion.div key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button 
                  onClick={() => setSelectedLang(lang.id)}
                  className={`w-full text-left p-5 transition-all duration-300 rounded-2xl border-2 flex flex-col h-full
                    ${isSelected ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20 scale-[1.02]' : 'bg-dark-800/50 border-dark-700 hover:border-dark-500 hover:bg-dark-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{lang.flag}</span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isSelected ? 'text-primary-400' : 'text-white'}`}>{lang.name}</h3>
                      <p className="text-sm text-dark-500 font-medium">{lang.nativeName}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-dark-400 mt-3 flex-1">{lang.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between text-xs text-dark-500 border-t border-dark-700/50 pt-3">
                    <span>{lang.totalLessons} lessons</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      lang.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      lang.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      lang.difficulty === 'hard' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{lang.difficulty}</span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-t from-dark-950 via-dark-950/90 to-transparent z-40 lg:ml-64">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button 
            onClick={handleStartLearning}
            disabled={!selectedLang || isSaving}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
              ${!selectedLang || isSaving ? 'bg-dark-700 text-dark-500 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-1 shadow-primary-500/25'}`}
          >
            {isSaving ? 'Saving...' : 'Start Learning'}
            {!isSaving && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
