import { useState, useMemo } from 'react';
import { 
  BookMarked, 
  Volume2, 
  Globe, 
  Grid, 
  Hash, 
  Calendar, 
  Clock, 
  MessageSquare,
  Search,
  X,
  ListFilter
} from 'lucide-react';
import PageShell from '../PageShell';
import { languages } from '../../data/languages';
import { MULTILINGUAL_CHARTS_DATA, type TableRowItem } from '../../data/multilingualChartsData';
import { getCuratedStarterVocabulary } from '../../curriculum/curatedStarterVocabulary';

const TTS_LANG_MAP: Record<string, string> = {
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-BR',
  ru: 'ru-RU',
  vi: 'vi-VN',
  th: 'th-TH',
  ar: 'ar-SA',
};

function playTTS(text: string, langCode: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/\([^)]*\)/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = TTS_LANG_MAP[langCode] || 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function LanguageChartsPage() {
  const [selectedLang, setSelectedLang] = useState<string>('ja');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const langInfo = useMemo(() => {
    return languages.find((l) => l.code === selectedLang) || languages[0];
  }, [selectedLang]);

  const chartData = useMemo(() => {
    return MULTILINGUAL_CHARTS_DATA[selectedLang] || MULTILINGUAL_CHARTS_DATA['ja'];
  }, [selectedLang]);

  // Curriculum starter vocabulary integration
  const starterVocab = useMemo(() => {
    return getCuratedStarterVocabulary(selectedLang);
  }, [selectedLang]);

  // Combine curriculum starter vocabulary into phrases & verbs
  const combinedPhrases = useMemo(() => {
    const basePhrases = [...chartData.phrases];
    if (starterVocab && starterVocab.length > 0) {
      starterVocab.forEach((item) => {
        if (!basePhrases.some((p) => p.original.toLowerCase().includes(item.word.toLowerCase()))) {
          basePhrases.push({
            original: `${item.word} (${item.nativeScript})`,
            phonetic: `[${item.partOfSpeech}]`,
            reading: item.romanization,
            meaningVi: item.meaningVietnamese,
          });
        }
      });
    }
    return basePhrases;
  }, [chartData.phrases, starterVocab]);

  // Search & Filter Logic
  const query = searchQuery.trim().toLowerCase();

  const filteredAlphabet = useMemo(() => {
    if (!query) return chartData.alphabetItems;
    return chartData.alphabetItems.filter(
      (item) =>
        item.char.toLowerCase().includes(query) ||
        item.phonetic.toLowerCase().includes(query) ||
        item.romaji.toLowerCase().includes(query) ||
        item.meaningVi.toLowerCase().includes(query)
    );
  }, [chartData.alphabetItems, query]);

  const filterRows = (rows: TableRowItem[]) => {
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.original.toLowerCase().includes(query) ||
        row.phonetic.toLowerCase().includes(query) ||
        row.reading.toLowerCase().includes(query) ||
        row.meaningVi.toLowerCase().includes(query)
    );
  };

  const filteredNumbers = useMemo(() => filterRows(chartData.numbers), [chartData.numbers, query]);
  const filteredMonths = useMemo(() => filterRows(chartData.months), [chartData.months, query]);
  const filteredDays = useMemo(() => filterRows(chartData.days), [chartData.days, query]);
  const filteredPhrases = useMemo(() => filterRows(combinedPhrases), [combinedPhrases, query]);

  const totalResultsCount = 
    filteredAlphabet.length + 
    filteredNumbers.length + 
    filteredMonths.length + 
    filteredDays.length + 
    filteredPhrases.length;

  return (
    <PageShell
      title="Trung Tâm Bảng Học Cơ Bản (Multilingual Reference Charts)"
      description="Hệ thống Tra Cứu Từ Vựng & Bảng Chữ Cái Real-Time Cho 13+ Ngôn Ngữ (Connected to EchLearn Curriculum)"
      icon={<BookMarked size={20} />}
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
        
        {/* Top Controls Card: Language Switcher + Real-time Search Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Globe size={15} /> EchLearn Multilingual Core Engine
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Tra Cứu Bảng Từ Vựng {langInfo.flag} {langInfo.name}
              </h2>
            </div>

            {/* Real-Time Search Bar */}
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${langInfo.name} hoặc Tiếng Việt (vd: "Tháng 1", "Bonjour")...`}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 13 Supported Languages Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Chọn Ngôn Ngữ Tra Cứu (13 Languages):</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {totalResultsCount} kết quả hiển thị
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setSearchQuery('');
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-600 text-slate-950 shadow-md scale-105 ring-2 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <ListFilter size={14} /> Bộ Lọc:
            </span>
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'alphabet', label: 'Chữ Cái & Âm Tiết' },
              { id: 'numbers', label: 'Số Đếm' },
              { id: 'months', label: 'Tháng Trong Năm' },
              { id: 'days', label: 'Ngày & Thời Gian' },
              { id: 'phrases', label: 'Động Từ & Giao Tiếp' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  activeCategory === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Alphabet & Phonetic Block */}
        {(activeCategory === 'all' || activeCategory === 'alphabet') && filteredAlphabet.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid size={20} className="text-emerald-500" /> {chartData.alphabetTitle}
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {chartData.alphabetDescription}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                {filteredAlphabet.length} ký tự
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredAlphabet.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center justify-between hover:border-emerald-500/50 transition-all text-center group"
                >
                  <span className="text-xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                    {item.char}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {item.phonetic}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    {item.romaji}
                  </span>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">
                    {item.meaningVi}
                  </p>

                  <button
                    onClick={() => playTTS(item.char.split('/')[0].split('(')[0], selectedLang)}
                    className="mt-2.5 w-full py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-emerald-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Volume2 size={12} /> Phát Âm
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: 4-Column Core Reference Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Table 1: Numbers (Số Đếm) */}
          {(activeCategory === 'all' || activeCategory === 'numbers') && filteredNumbers.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Hash size={18} className="text-blue-500" /> Bảng Số Đếm (Numbers)
                </h3>
                <span className="text-xs font-bold text-slate-400">{filteredNumbers.length} số</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">
                      <th className="pb-2">Chữ Gốc</th>
                      <th className="pb-2">Phiên Âm</th>
                      <th className="pb-2">Đọc Mẫu</th>
                      <th className="pb-2 text-right">Nghĩa & Âm Thanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredNumbers.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-black text-slate-900 dark:text-white text-sm">{row.original}</td>
                        <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{row.phonetic}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.reading}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{row.meaningVi}</span>
                            <button
                              onClick={() => playTTS(row.original.split('(')[0], selectedLang)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500 text-slate-600 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Phát âm"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table 2: Months (Tháng Trong Năm) */}
          {(activeCategory === 'all' || activeCategory === 'months') && filteredMonths.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar size={18} className="text-purple-500" /> Bảng Tháng Trong Năm (12 Months)
                </h3>
                <span className="text-xs font-bold text-slate-400">{filteredMonths.length} tháng</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">
                      <th className="pb-2">Chữ Gốc</th>
                      <th className="pb-2">Phiên Âm</th>
                      <th className="pb-2">Đọc Mẫu</th>
                      <th className="pb-2 text-right">Nghĩa & Âm Thanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredMonths.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-black text-slate-900 dark:text-white text-sm">{row.original}</td>
                        <td className="py-2.5 text-purple-600 dark:text-purple-400 font-mono font-bold">{row.phonetic}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.reading}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{row.meaningVi}</span>
                            <button
                              onClick={() => playTTS(row.original.split('(')[0], selectedLang)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500 text-slate-600 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Phát âm"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table 3: Days & Time (Ngày Trong Tuần) */}
          {(activeCategory === 'all' || activeCategory === 'days') && filteredDays.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" /> Bảng Ngày Trong Tuần & Thời Gian
                </h3>
                <span className="text-xs font-bold text-slate-400">{filteredDays.length} mốc thời gian</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">
                      <th className="pb-2">Chữ Gốc</th>
                      <th className="pb-2">Phiên Âm</th>
                      <th className="pb-2">Đọc Mẫu</th>
                      <th className="pb-2 text-right">Nghĩa & Âm Thanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredDays.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-black text-slate-900 dark:text-white text-sm">{row.original}</td>
                        <td className="py-2.5 text-amber-600 dark:text-amber-400 font-mono font-bold">{row.phonetic}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.reading}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{row.meaningVi}</span>
                            <button
                              onClick={() => playTTS(row.original.split('(')[0], selectedLang)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500 text-slate-600 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Phát âm"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table 4: Essential Phrases & Verbs (Động Từ & Giao Tiếp) */}
          {(activeCategory === 'all' || activeCategory === 'phrases') && filteredPhrases.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-emerald-500" /> Bảng Câu & Động Từ Cốt Lõi (Curriculum Connected)
                </h3>
                <span className="text-xs font-bold text-slate-400">{filteredPhrases.length} từ & mẫu câu</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px]">
                      <th className="pb-2">Chữ Gốc</th>
                      <th className="pb-2">Phiên Âm</th>
                      <th className="pb-2">Đọc Mẫu</th>
                      <th className="pb-2 text-right">Nghĩa & Âm Thanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredPhrases.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-black text-slate-900 dark:text-white text-sm">{row.original}</td>
                        <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{row.phonetic}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.reading}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{row.meaningVi}</span>
                            <button
                              onClick={() => playTTS(row.original.split('(')[0], selectedLang)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500 text-slate-600 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Phát âm"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Empty State when Search Query returns 0 results */}
        {totalResultsCount === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Search size={36} className="mx-auto text-slate-300" />
            <h3 className="text-base font-black text-slate-800 dark:text-white">Không tìm thấy từ vựng khớp với từ khóa "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thử tìm kiếm bằng nghĩa Tiếng Việt (ví dụ: "Tháng 1", "Xin chào") hoặc từ tiếng gốc trong ngôn ngữ {langInfo.name}.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Xóa Từ Khóa Tìm Kiếm
            </button>
          </div>
        )}

      </div>
    </PageShell>
  );
}
