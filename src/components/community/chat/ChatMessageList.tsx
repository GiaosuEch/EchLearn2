import { Check, CheckCheck } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatMessageListProps {
  messages: any[];
  currentUserId?: string;
}

export function ChatMessageList({ messages, currentUserId }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.map((msg, i, arr) => {
        const isMe = msg.senderId === currentUserId;
        const showAvatar = !isMe && (i === 0 || arr[i - 1].senderId !== msg.senderId);

        return (
          <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
            {showAvatar ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1 overflow-hidden">
                {msg.senderAvatar ? <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" /> : msg.senderName.charAt(0)}
              </div>
            ) : (
              <div className="w-8 shrink-0" />
            )}

            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
              {showAvatar && <span className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 ml-1">{msg.senderName}</span>}

              <div className={`px-4 py-2.5 text-sm ${isMe
                  ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700'
                }`}>
                {msg.content}
              </div>

              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && (
                  <span className="text-primary-500">
                    {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
