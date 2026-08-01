import { useState } from 'react';
import { Search, Smile, Sparkles, Flame } from 'lucide-react';
import { CustomEmote, type EmoteType } from './CustomEmote';

interface DiscadiaEmojiPickerProps {
  onSelectEmoji: (emote: EmoteType) => void;
  onClose?: () => void;
  className?: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: typeof Smile;
  emotes: Array<{ id: EmoteType; label: string }>;
}

const CATEGORIES: EmojiCategory[] = [
  {
    id: 'mascots',
    name: 'Peepo & Mascot',
    icon: Smile,
    emotes: [
      { id: 'peepo-happy', label: 'Peepo Happy' },
      { id: 'peepo-smart', label: 'Peepo Smart' },
      { id: 'peepo-dance', label: 'Peepo Dance' },
      { id: 'peepo-pat', label: 'Peepo Pat' },
      { id: 'ech-buri-think', label: 'Ech Buri Think' },
      { id: 'mascot-celebrate', label: 'Celebrate' },
      { id: 'mascot-vangogh', label: 'Van Gogh Buri' },
      { id: 'mascot-backpack', label: 'Backpack Frog' },
    ],
  },
  {
    id: 'blobs',
    name: 'Blobs & Reactions',
    icon: Sparkles,
    emotes: [
      { id: 'blob-cheer', label: 'Blob Cheer' },
      { id: 'blob-heart', label: 'Blob Heart' },
      { id: 'blob-fire', label: 'Blob Fire' },
      { id: 'cat-jam', label: 'Cat Jam' },
    ],
  },
  {
    id: 'gamification',
    name: 'Streak & Badges',
    icon: Flame,
    emotes: [
      { id: 'streak-fire', label: 'Streak Fire' },
      { id: 'xp-star', label: 'XP Star' },
      { id: 'league-crown', label: 'League Crown' },
      { id: 'trophy-gold', label: 'Gold Trophy' },
      { id: 'ielts-target', label: 'IELTS Target' },
      { id: 'verified-check', label: 'Verified Badge' },
      { id: 'sparkles-badge', label: 'Sparkles' },
    ],
  },
];

export function DiscadiaEmojiPicker({ onSelectEmoji, onClose, className = '' }: DiscadiaEmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('mascots');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  const filteredEmotes = searchQuery.trim()
    ? CATEGORIES.flatMap(c => c.emotes).filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentCategoryObj.emotes;

  return (
    <div className={`w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 flex flex-col gap-3 isolate z-50 ${className}`}>
      {/* Header & Search */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Sparkles size={14} className="text-emerald-500" />
          <span>Discadia Emotes</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
          >
            Đóng
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm emote Discadia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={12} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emotes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
        {filteredEmotes.length > 0 ? (
          filteredEmotes.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onSelectEmoji(id)}
              title={label}
              className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-500/10 hover:scale-110 active:scale-95 transition-all group border border-transparent hover:border-emerald-500/20"
            >
              <CustomEmote type={id} size={28} />
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center mt-1 group-hover:text-emerald-600">
                {label.split(' ')[0]}
              </span>
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-6 text-xs text-slate-400">
            Không tìm thấy emote nào.
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscadiaEmojiPicker;
