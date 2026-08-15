import { Users, Plus } from 'lucide-react';

interface ChatSidebarProps {
  chatRooms: any[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
  onJoinRoom: () => void;
  onCreateRoom: () => void;
}

export function ChatSidebar({ chatRooms, activeChat, onSelectChat, onJoinRoom, onCreateRoom }: ChatSidebarProps) {
  return (
    <div className="glass-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Conversations</h3>
          <div className="flex gap-2">
            <button onClick={onJoinRoom} title="Join Room" className="p-1 bg-slate-200 dark:bg-dark-700 text-slate-900 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-dark-600 transition">
              <Users size={16} />
            </button>
            <button onClick={onCreateRoom} title="Tạo Phòng Trò Chuyện Mới" className="p-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition cursor-pointer">
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-semibold">All</button>
          <button className="flex-1 py-1.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors">Direct</button>
          <button className="flex-1 py-1.5 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors">Groups</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {chatRooms.map((room) => (
          <button key={room.id} onClick={() => onSelectChat(room.id)}
            className={`w-full text-left p-3 rounded-xl transition-all ${activeChat === room.id ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-slate-100 dark:bg-slate-800 border border-transparent'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm ${room.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-slate-200 dark:bg-dark-700'}`}>
                {room.type === 'group' ? <Users size={20} /> : room.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{room.name}</p>
                </div>
                <p className={`text-xs truncate ${room.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {room.unreadCount > 0 ? `${room.unreadCount} unread messages` : 'No new messages'}
                </p>
              </div>
              {room.unreadCount > 0 && <span className="w-5 h-5 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center shadow-lg shadow-primary-500/20">{room.unreadCount}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
