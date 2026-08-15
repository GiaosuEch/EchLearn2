import { useState } from 'react';
import { MessageCircle, Video, Info, Lock, Users } from 'lucide-react';
import PageShell from '../../PageShell';
import { CreateChatRoomModal } from '../../../components/community/CreateChatRoomModal';
import { useChatRoom } from '../../../hooks/useChatRoom';
import { ChatSidebar } from '../../../components/community/chat/ChatSidebar';
import { ChatMessageList } from '../../../components/community/chat/ChatMessageList';
import { ChatInput } from '../../../components/community/chat/ChatInput';

export function ChatRoomsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { 
    chatRooms, 
    activeChat, 
    setActiveChat, 
    messages, 
    sendMessage, 
    createRoom, 
    joinRoom,
    user 
  } = useChatRoom();

  const handleJoinRoom = () => {
    const roomId = prompt("Enter Room ID to join:");
    if (!roomId) return;
    const password = prompt("Enter password (leave blank if none):");
    joinRoom(roomId, password || undefined);
  };

  const handleCreateRoom = async (name: string, password?: string) => {
    return await createRoom(name, password);
  };

  const currentRoom = chatRooms.find(r => r.id === activeChat);

  return (
    <PageShell title="Chat" description="Message your friends and groups" icon={<MessageCircle size={20} />}>
      <div className="grid lg:grid-cols-[1fr_2fr] gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        <ChatSidebar 
          chatRooms={chatRooms}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={() => setShowCreateModal(true)}
        />
        
        {currentRoom ? (
          <div className="glass-card flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${currentRoom.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-slate-200 dark:bg-dark-700'}`}>
                  {currentRoom.type === 'group' ? <Users size={18} /> : currentRoom.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {currentRoom.name}
                    {currentRoom.type === 'group' && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Group</span>}
                  </h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white text-slate-400 dark:text-slate-500 rounded-lg transition-colors" title="Start Video Call">
                  <Video size={18} />
                </button>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 dark:text-slate-500 rounded-lg transition-colors" title="Room Info">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {currentRoom.type === 'group' && (
              <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-primary-500 dark:text-primary-400">ID: {currentRoom.id}</span>
                  <span className="flex items-center gap-1"><Lock size={12} /> Encrypted</span>
                </div>
                <span className="text-yellow-500 dark:text-yellow-400 flex items-center gap-1">WebRTC Video ready</span>
              </div>
            )}
            
            <ChatMessageList messages={messages} currentUserId={user?.id} />
            <ChatInput onSendMessage={sendMessage} />
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Messages</h3>
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
