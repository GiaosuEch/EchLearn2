import { useState } from 'react';
import { Keyboard, X, Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  language: string; // 'ja' | 'zh' | 'ko' | 'ru' | 'ar' | 'en'
  value: string;
  onChange: (val: string) => void;
  onClose?: () => void;
}

export function VirtualLanguageKeyboard({ language, value, onChange, onClose }: VirtualKeyboardProps) {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana' | 'syllables'>('hiragana');

  // Japanese Hiragana & Katakana Layouts
  const hiraganaKeys = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', 'ゆ', 'よ', 'ん', 'ー'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', 'を', 'が', 'ぎ', 'ぐ'],
  ];

  const katakanaKeys = [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', 'ユ', 'ヨ', 'ン', 'ー'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', 'ヲ', 'ガ', 'ギ', 'グ'],
  ];

  // Korean Hangul Basic Keys
  const hangulKeys = [
    ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ'],
    ['ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
    ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ'],
    ['ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅖ', 'ㅘ'],
  ];

  // Russian Cyrillic Keys
  const cyrillicKeys = [
    ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж'],
    ['з', 'и', 'й', 'к', 'л', 'м', 'н', 'о'],
    ['п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц'],
    ['ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
  ];

  // Chinese Pinyin Tones & Characters
  const pinyinKeys = [
    ['ā', 'á', 'ǎ', 'à'],
    ['ē', 'é', 'ě', 'è'],
    ['ī', 'í', 'ǐ', 'ì'],
    ['ō', 'ó', 'ǒ', 'ò'],
    ['ū', 'ú', 'ǔ', 'ù'],
    ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  ];

  const handleKeyPress = (char: string) => {
    onChange(value + char);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  const getLayout = () => {
    if (language.startsWith('ja')) {
      return activeTab === 'hiragana' ? hiraganaKeys : katakanaKeys;
    }
    if (language.startsWith('ko')) return hangulKeys;
    if (language.startsWith('ru')) return cyrillicKeys;
    if (language.startsWith('zh')) return pinyinKeys;
    return hiraganaKeys;
  };

  const currentLayout = getLayout();

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 shadow-2xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Keyboard size={16} />
          <span>BÀN PHÍM ẢO NGÔN NGỮ ({language.toUpperCase()})</span>
        </div>

        {language.startsWith('ja') && (
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('hiragana')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTab === 'hiragana' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setActiveTab('katakana')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTab === 'katakana' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Katakana
            </button>
          </div>
        )}

        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Keys Grid */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
        {currentLayout.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => handleKeyPress(char)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-500/30 text-white font-bold text-sm border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer min-w-9 text-center active:scale-95 shadow-sm"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleSpace}
          className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase cursor-pointer border border-slate-800"
        >
          Khoảng Trắng [Space]
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase cursor-pointer border border-rose-500/40 flex items-center gap-1"
        >
          <Delete size={14} />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}
