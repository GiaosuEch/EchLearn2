import { useState, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { communitySupabaseService } from '../../services/communitySupabaseService';

export function GroupChatTab({ group, isMember, user }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const loadMessages = async () => {
    if (!group) return;
    const msgs = await communitySupabaseService.getGroupMessages(group.id);
    if (msgs.length > 0) {
      setMessages(msgs);
    } else {
      const defaultMsg = {
        id: 'msg-1',
        senderId: group.ownerId,
        senderName: group.ownerName,
        content: `Welcome to ${group.name}!`,
        timestamp: new Date().toISOString()
      };
      setMessages([defaultMsg]);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [group]);

  const handleSend = async () => {
    if (!input.trim() || !user || !group) return;
    const content = input;
    setInput('');
    await communitySupabaseService.sendGroupMessage(group.id, user.id, content, user.displayName || 'You', user.avatarUrl || '');
    loadMessages();
  };

  if (!isMember) {
    return (
      <div className="glass-card h-[500px] flex flex-col items-center justify-center text-dark-400 p-8">
        <MessageCircle size={48} className="mb-4 opacity-50" />
        <p>You must join the group to participate in chat.</p>
      </div>
    );
  }

  return (
    <div className="glass-card h-[500px] flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isMe = msg.senderId === user?.id || msg.userId === user?.id; // handling old storage mapping
          const senderName = msg.senderName || msg.userName || 'User';
          const content = msg.content || msg.text || '';
          
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold shrink-0">
                {senderName.charAt(0)}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3 ${isMe ? 'bg-primary-500 rounded-tr-sm text-white' : 'bg-dark-800 rounded-tl-sm text-white'}`}>
                {!isMe && <p className="text-xs text-primary-400 font-medium mb-1">{senderName}</p>}
                <p className="text-sm break-words">{content}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-dark-800 border border-dark-700 rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" 
            placeholder="Type a message..." 
          />
          <button onClick={handleSend} className="p-2.5 bg-primary-500 hover:bg-primary-600 rounded-full text-white transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
