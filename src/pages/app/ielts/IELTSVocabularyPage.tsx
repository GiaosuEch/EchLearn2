import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import PageShell from '../../PageShell';
import { getCuratedStarterVocabulary } from '../../../curriculum/curatedStarterVocabulary';

export default function IELTSVocabularyPage() {
  const [search, setSearch] = useState('');

  const vocabList = getCuratedStarterVocabulary('en');
  const filtered = vocabList.filter((item) => 
    !search || item.word.toLowerCase().includes(search.toLowerCase()) || item.meaningVietnamese.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="IELTS Vocabulary Vault"
      description="Kho từ vựng IELTS Academic & General chọn lọc theo chủ đề và cấp độ"
      icon={<BookOpen size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans text-slate-900">
        
        {/* Search Bar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ vựng IELTS, định nghĩa..."
            className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Vocabulary Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-base">{item.word}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                  {item.romanization || 'IELTS'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700">{item.meaningVietnamese}</p>
              {item.example && (
                <p className="text-[11px] font-medium text-slate-500 italic pt-1 border-t border-slate-100">
                  "{item.example}"
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </PageShell>
  );
}
