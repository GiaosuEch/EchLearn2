import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { DiscadiaEmojiPicker } from '../../common/DiscadiaEmojiPicker';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 relative">
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <DiscadiaEmojiPicker
            onSelectEmoji={(emote) => {
              setInputText(prev => `${prev} :${emote}: `);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary-500 transition-colors p-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:text-white outline-none resize-none max-h-32 min-h-[40px] custom-scrollbar"
          rows={1}
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="p-2.5 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-xl text-slate-400 hover:text-amber-400 transition-colors shrink-0 m-0.5"
          title="Discadia Emotes"
        >
          <Smile size={18} />
        </button>
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 rounded-xl text-white transition-colors shrink-0 m-0.5"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
