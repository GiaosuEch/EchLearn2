import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Users, Video, Lock, Info, Check, CheckCheck, Plus, Smile } from 'lucide-react';
import PageShell from '../../PageShell';
import { communitySupabaseService } from '../../../services/communitySupabaseService';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from '../../../components/ui/Toast';
import { DiscadiaEmojiPicker } from '../../../components/common/DiscadiaEmojiPicker';
import { CreateChatRoomModal } from '../../../components/community/CreateChatRoomModal';

export function ChatRoomsPage() {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const user = useAuthStore(s => s.user);
  const endRef = useRef<HTMLDivElement>(null);

  const handleCreateRoom = async (name: string, password?: string): Promise<boolean> => {
    if (!user) return false;
    const roomId = await communitySupabaseService.createChatRoom(user.id, name, 'group', password);
    if (roomId) {
      const updated = await communitySupabaseService.getChatRooms(user.id);
      setChatRooms(updated);
      setActiveChat(roomId);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (user?.id) {
      communitySupabaseService.getChatRooms(user.id).then(rooms => {
        setChatRooms(rooms);
        if (rooms.length > 0 && !activeChat) {
          setActiveChat(rooms[0].id);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      communitySupabaseService.getChatMessages(activeChat).then(setMessages);
    }
  }, [activeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeChat || !user) return;
    
    const content = inputText;
    setInputText('');
    
    // Optimistic UI
    const newMsg = {
      id: Date.now().toString(),
      roomId: activeChat,
      senderId: user.id,
      senderName: user.displayName,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
    
    try {
      await communitySupabaseService.sendChatMessage(activeChat, user.id, content);
      // Reload from server to get proper ID and timestamp
      const updatedMessages = await communitySupabaseService.getChatMessages(activeChat);
      setMessages(updatedMessages);
    } catch {
      toast('Failed to send message', 'error');
    }
  };

  const handleJoinRoom = async () => {
    if (!user) return;
    const roomId = prompt("Enter Room ID to join:");
    if (!roomId) return;
    const password = prompt("Enter password (leave blank if none):");
    try {
      const success = await communitySupabaseService.joinChatRoom(roomId, user.id, password || undefined);
      if (success) {
        toast('Joined room successfully', 'success');
        const updated = await communitySupabaseService.getChatRooms(user.id);
        setChatRooms(updated);
        setActiveChat(roomId);
      } else {
        toast('Failed to join room. Check ID and password.', 'error');
      }
    } catch {
      toast('Error joining room', 'error');
    }
  };

  const currentRoom = chatRooms.find(r => r.id === activeChat);

  return (
    <PageShell title="Chat" description="Message your friends and groups" icon={<MessageCircle size={20} />}>
      <div className="grid lg:grid-cols-[1fr_2fr] gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        
        {/* Sidebar */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dark-700/50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white">Conversations</h3>
              <div className="flex gap-2">
                <button onClick={handleJoinRoom} title="Join Room" className="p-1 bg-dark-700 text-white rounded hover:bg-dark-600 transition">
                  <Users size={16} />
                </button>
                <button onClick={() => setShowCreateModal(true)} title="Tạo Phòng Trò Chuyện Mới" className="p-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-dark-800 text-white rounded-lg text-xs font-semibold">All</button>
              <button className="flex-1 py-1.5 bg-transparent text-dark-400 hover:text-white rounded-lg text-xs font-semibold transition-colors">Direct</button>
              <button className="flex-1 py-1.5 bg-transparent text-dark-400 hover:text-white rounded-lg text-xs font-semibold transition-colors">Groups</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {chatRooms.map((room) => (
              <button key={room.id} onClick={() => setActiveChat(room.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${activeChat === room.id ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-dark-800 border border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm ${room.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-dark-700'}`}>
                    {room.type === 'group' ? <Users size={20} /> : room.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-medium text-white text-sm truncate">{room.name}</p>
                    </div>
                    <p className={`text-xs truncate ${room.unreadCount > 0 ? 'text-white font-medium' : 'text-dark-400'}`}>
                      {room.unreadCount > 0 ? `${room.unreadCount} unread messages` : 'No new messages'}
                    </p>
                  </div>
                  {room.unreadCount > 0 && <span className="w-5 h-5 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center shadow-lg shadow-primary-500/20">{room.unreadCount}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Chat Area */}
        {currentRoom ? (
          <div className="glass-card flex flex-col overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-700/50 flex items-center justify-between bg-dark-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${currentRoom.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-dark-700'}`}>
                  {currentRoom.type === 'group' ? <Users size={18} /> : currentRoom.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {currentRoom.name}
                    {currentRoom.type === 'group' && <span className="px-1.5 py-0.5 bg-dark-800 rounded text-[10px] text-dark-400 border border-dark-700">Group</span>}
                  </h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-dark-800 hover:bg-primary-500 hover:text-white text-dark-300 rounded-lg transition-colors" title="Start Video Call">
                  <Video size={18} />
                </button>
                <button className="p-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-lg transition-colors" title="Room Info">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Room Info Banner (if group) */}
            {currentRoom.type === 'group' && (
              <div className="bg-dark-800/80 px-4 py-2 border-b border-dark-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-dark-300">
                  <span className="font-mono bg-dark-900 px-2 py-0.5 rounded text-primary-400">ID: {currentRoom.id}</span>
                  <span className="flex items-center gap-1"><Lock size={12} /> Encrypted</span>
                </div>
                <span className="text-yellow-400 flex items-center gap-1">WebRTC Video ready</span>
              </div>
            )}
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i, arr) => {
                const isMe = msg.senderId === user?.id;
                const showAvatar = !isMe && (i === 0 || arr[i-1].senderId !== msg.senderId);
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1 overflow-hidden">
                        {msg.senderAvatar ? <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" /> : msg.senderName.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}
                    
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {showAvatar && <span className="text-[10px] text-dark-400 mb-1 ml-1">{msg.senderName}</span>}
                      
                      <div className={`px-4 py-2.5 text-sm ${
                        isMe 
                          ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm shadow-sm' 
                          : 'bg-dark-800 text-dark-100 rounded-2xl rounded-tl-sm border border-dark-700'
                      }`}>
                        {msg.content}
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px] text-dark-500">
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
            
            {/* Input Area */}
            <div className="p-4 border-t border-dark-700/50 bg-dark-900/50 relative">
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

              <div className="flex items-end gap-2 bg-dark-800 rounded-2xl border border-dark-700 focus-within:border-primary-500 transition-colors p-2">
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
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white outline-none resize-none max-h-32 min-h-[40px] custom-scrollbar"
                  rows={1}
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className="p-2.5 hover:bg-dark-700 rounded-xl text-slate-400 hover:text-amber-400 transition-colors shrink-0 m-0.5"
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
            
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center text-dark-400 p-8 text-center">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">Your Messages</h3>
            <p className="text-sm max-w-sm">Select a conversation from the left or start a new one to begin chatting.</p>
          </div>
        )}
      </div>
      <CreateChatRoomModal
        userId={user?.id || 'guest'}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </PageShell>
  );
}
