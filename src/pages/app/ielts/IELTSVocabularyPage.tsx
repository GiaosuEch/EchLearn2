import { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ChevronDown, Layers, Tag, Volume2, Star, BookMarked } from 'lucide-react';
import PageShell from '../../PageShell';
import {
  getAllAWLWords,
  getIELTSTopicVocabulary,
  getIELTSTopics,
  getIELTSVocabStats,
  type AWLWord,
  type IELTSTopicVocab,
} from '../../../curriculum/ieltsAcademicWordList';

type VocabMode = 'awl' | 'topic';
type UnifiedWord = { id: string; word: string; ipa: string; pos: string; meaning: string; meaningVi: string; example: string; exampleVi: string; topic: string; meta: string; collocations?: readonly string[] };

function unifyAWL(w: AWLWord): UnifiedWord {
  return { id: w.id, word: w.word, ipa: w.ipa, pos: w.pos, meaning: w.meaning, meaningVi: w.meaningVi, example: w.example, exampleVi: w.exampleVi, topic: w.topic, meta: `Sublist ${w.sublist}`, collocations: w.wordFamily.slice(0, 4) };
}

function unifyTopic(w: IELTSTopicVocab): UnifiedWord {
  return { id: w.id, word: w.word, ipa: w.ipa, pos: w.pos, meaning: w.meaning, meaningVi: w.meaningVi, example: w.example, exampleVi: w.exampleVi, topic: w.topic, meta: `Band ${w.band}`, collocations: w.collocations };
}

const TOPIC_ICONS: Record<string, string> = {
  Education: '🎓', Environment: '🌿', Technology: '💡', Health: '❤️',
  Society: '🏘️', Economics: '📊', Urbanisation: '🏙️', Crime: '⚖️',
  Research: '🔬', Science: '🧪', General: '📝', Government: '🏛️',
  Business: '💼', Law: '⚖️',
};

function speak(word: string) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.85;
    speechSynthesis.speak(u);
  }
}

export default function IELTSVocabularyPage() {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<VocabMode>('awl');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSublist, setSelectedSublist] = useState<number>(0); // 0 = all
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ielts_vocab_bookmarks') || '[]')); }
    catch { return new Set(); }
  });
  const [showBookmarked, setShowBookmarked] = useState(false);

  const stats = useMemo(() => getIELTSVocabStats(), []);
  const topics = useMemo(() => getIELTSTopics(), []);

  const allWords = useMemo<UnifiedWord[]>(() => {
    if (mode === 'awl') {
      let words = getAllAWLWords();
      if (selectedSublist > 0) words = words.filter(w => w.sublist === selectedSublist);
      return words.map(unifyAWL);
    }
    let topicWords = getIELTSTopicVocabulary();
    if (selectedTopic !== 'all') topicWords = topicWords.filter(w => w.topic === selectedTopic);
    return [...topicWords].map(unifyTopic);
  }, [mode, selectedSublist, selectedTopic]);

  const filtered = useMemo(() => {
    let result = allWords;
    if (showBookmarked) result = result.filter(w => bookmarked.has(w.id));
    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q) ||
      w.meaningVi.toLowerCase().includes(q) ||
      w.topic.toLowerCase().includes(q)
    );
  }, [allWords, search, showBookmarked, bookmarked]);

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('ielts_vocab_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <PageShell
      title="IELTS Vocabulary Vault"
      description="Kho từ vựng IELTS Academic — AWL 570 từ gốc + 8 chủ đề IELTS phổ biến"
      icon={<BookOpen size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-6xl mx-auto space-y-5 pb-20 font-sans text-slate-900">

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'AWL Headwords', value: stats.awlHeadwords, icon: '📚' },
            { label: 'Topic Words', value: stats.topicWords, icon: '🎯' },
            { label: 'Sublists', value: stats.sublists, icon: '📋' },
            { label: 'Topics', value: stats.topics, icon: '🏷️' },
          ].map(s => (
            <div key={s.label} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => { setMode('awl'); setSelectedTopic('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'awl' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Layers size={14} className="inline mr-1.5 -mt-0.5" />
            Academic Word List
          </button>
          <button
            onClick={() => { setMode('topic'); setSelectedSublist(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'topic' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Tag size={14} className="inline mr-1.5 -mt-0.5" />
            IELTS Topics
          </button>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 items-stretch">
          <div className="flex-1 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm từ, nghĩa, chủ đề..."
              className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs font-black">✕</button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded-2xl border shadow-xs text-xs font-black flex items-center gap-2 transition-all ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200/80 text-slate-600 hover:border-emerald-300'}`}
          >
            <Filter size={14} />
            Lọc
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={`px-4 rounded-2xl border shadow-xs text-xs font-black flex items-center gap-2 transition-all ${showBookmarked ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200/80 text-slate-600 hover:border-amber-300'}`}
          >
            <BookMarked size={14} />
            {bookmarked.size}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {mode === 'awl' ? (
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">AWL Sublist</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSublist(0)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedSublist === 0 ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  >
                    Tất cả
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => setSelectedSublist(n)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedSublist === n ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Chủ đề IELTS</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTopic('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedTopic === 'all' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  >
                    Tất cả
                  </button>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTopic(t)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedTopic === t ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                    >
                      {TOPIC_ICONS[t] || '📝'} {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-[11px] font-bold text-slate-500">
          {filtered.length} từ {showBookmarked ? '(đã lưu)' : ''} {search ? `• Tìm: "${search}"` : ''}
        </p>

        {/* Vocabulary Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-emerald-400/60 hover:shadow-md transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-base truncate">{item.word}</h4>
                    <button
                      onClick={() => speak(item.word)}
                      className="p-1 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Phát âm ${item.word}`}
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.ipa}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200/80">
                    {item.meta}
                  </span>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className={`p-1 rounded-lg transition-colors ${bookmarked.has(item.id) ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'}`}
                    aria-label={bookmarked.has(item.id) ? 'Bỏ lưu' : 'Lưu từ'}
                  >
                    <Star size={14} fill={bookmarked.has(item.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* POS + Topic */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{item.pos}</span>
                <span className="text-[10px] text-slate-400">
                  {TOPIC_ICONS[item.topic] || '📝'} {item.topic}
                </span>
              </div>

              {/* Meanings */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">{item.meaning}</p>
                <p className="text-[11px] font-bold text-emerald-700">{item.meaningVi}</p>
              </div>

              {/* Example */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">"{item.example}"</p>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">"{item.exampleVi}"</p>
              </div>

              {/* Collocations / Word Family */}
              {item.collocations && item.collocations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    {mode === 'awl' ? 'Word Family' : 'Collocations'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collocations.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-100">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-black text-slate-500">Không tìm thấy từ nào</p>
            <p className="text-xs text-slate-400 mt-1">Thử tìm kiếm khác hoặc bỏ bộ lọc</p>
          </div>
        )}

        {/* Source Attribution */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <p className="text-[10px] font-bold text-slate-500">
            📚 Dựa trên Academic Word List (Averil Coxhead, Victoria University of Wellington)
          </p>
          <p className="text-[10px] text-slate-400">
            Nguồn mở • Dịch và ví dụ bởi EchLearn • {stats.totalWords} từ vựng
          </p>
        </div>
      </div>
    </PageShell>
  );
}
