import { useState } from 'react';
import { BookX, Trash2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PageShell from '../../PageShell';
import { motion, AnimatePresence } from 'motion/react';

export default function MistakeNotebookPage() {
  const [mistakes, setMistakes] = useState([
    { id: 1, type: 'Grammar', mistake: 'I have went to the store.', correction: 'I have gone to the store.', notes: 'Present perfect uses have + past participle (gone, not went).', date: '2023-10-25' },
    { id: 2, type: 'Vocabulary', mistake: 'The environment is very polluted, it is ubiquitous.', correction: 'Pollution is ubiquitous.', notes: '"Ubiquitous" means found everywhere. Using it directly to describe "polluted" is awkward phrasing.', date: '2023-10-26' },
    { id: 3, type: 'Speaking', mistake: 'Pronounced "chaos" as /tʃeɪ.ɒs/', correction: 'Pronounce "chaos" as /ˈkeɪ.ɒs/', notes: 'The "ch" in chaos is a hard "k" sound.', date: '2023-10-28' },
  ]);

  const [activeTab, setActiveTab] = useState('All');

  const removeMistake = (id: number) => {
    setMistakes(mistakes.filter(m => m.id !== id));
  };

  const filteredMistakes = activeTab === 'All' ? mistakes : mistakes.filter(m => m.type === activeTab);

  return (
    <PageShell title="Mistake Notebook" description="Track and review your recurring errors" icon={<BookX size={20} />} backTo="/app/ielts">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['All', 'Grammar', 'Vocabulary', 'Speaking', 'Writing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-error/20 text-error shadow-lg' : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Mistakes Found!</h3>
            <p className="text-dark-400">You haven't recorded any mistakes in this category. Keep up the perfect work!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMistakes.map(m => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-error" />
                  <div className="flex items-start justify-between mb-4 pl-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-1 bg-dark-800 text-dark-300 rounded-lg uppercase tracking-wider">{m.type}</span>
                      <span className="text-xs text-dark-500 ml-3">{m.date}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-lg transition-colors" title="Review Now">
                        <RotateCcw size={16} />
                      </button>
                      <button onClick={() => removeMistake(m.id)} className="p-1.5 bg-error/20 hover:bg-error text-error hover:text-white rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-2 space-y-4">
                    <div className="bg-dark-900/50 p-3 rounded-xl border border-error/20 relative">
                      <div className="absolute -left-3 -top-3 w-6 h-6 bg-error/20 text-error rounded-full flex items-center justify-center">
                        <BookX size={12} />
                      </div>
                      <p className="text-sm text-dark-300 line-through decoration-error/50">{m.mistake}</p>
                    </div>
                    
                    <div className="bg-success/5 p-3 rounded-xl border border-success/20 relative">
                      <div className="absolute -left-3 -top-3 w-6 h-6 bg-success/20 text-success rounded-full flex items-center justify-center">
                        <CheckCircle2 size={12} />
                      </div>
                      <p className="text-sm text-white font-medium">{m.correction}</p>
                    </div>

                    <div className="pt-2 border-t border-dark-700/50">
                      <p className="text-xs text-dark-400 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-warning shrink-0" />
                        {m.notes}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageShell>
  );
}
