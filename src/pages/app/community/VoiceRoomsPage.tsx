import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Users, Mic, MicOff, PhoneOff, Info, Plus } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';
import { type VoiceRoom } from '../../../types';
import { communitySupabaseService } from '../../../services/communitySupabaseService';

export default function VoiceRoomsPage() {
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomLang, setNewRoomLang] = useState('English');

  const loadRooms = async () => {
    const fetchedRooms = await communitySupabaseService.getVoiceRooms();
    
    // Map the database structure back into the UI format
    const mappedRooms = fetchedRooms.map(r => ({
      id: r.id,
      name: r.name,
      topic: r.topic,
      language: r.language,
      maxParticipants: r.maxParticipants || r.max_participants || 10,
      hostId: r.hostId || r.host_id,
      hostName: r.host?.display_name || r.hostName || 'Host',
      isLive: r.isLive || r.is_live,
      studyTimer: r.studyTimer || r.study_timer || 0,
      createdAt: r.createdAt || r.created_at,
      participants: (r.participants || []).map((p: any) => ({
        id: p.userId || p.user_id || p.id,
        displayName: p.displayName || 'Participant',
        avatarUrl: p.avatarUrl,
        isMuted: p.isMuted || p.is_muted || true,
        isSpeaking: p.isSpeaking || p.is_speaking || false
      }))
    }));
    
    setRooms(mappedRooms);
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomTopic.trim() || !user) return;
    
    const newRoomData = {
      name: `${user.displayName}'s Room`,
      topic: newRoomTopic,
      language: newRoomLang,
      host_id: user.id,
      is_live: true,
      max_participants: 10
    };
    
    const createdRoom = await communitySupabaseService.createVoiceRoom(newRoomData);
    await communitySupabaseService.joinVoiceRoom(createdRoom?.id || newRoomData.name, user.id);
    
    setShowCreateModal(false);
    setIsMuted(false);
    setNewRoomTopic('');
    
    await loadRooms();
    const updatedRoom = rooms.find(r => r.name === newRoomData.name) || {
      id: createdRoom?.id || Date.now().toString(),
      ...newRoomData,
      hostName: user.displayName,
      maxParticipants: 10,
      isLive: true,
      studyTimer: 0,
      createdAt: new Date().toISOString(),
      participants: [{
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isMuted: false,
        isSpeaking: false
      }]
    };
    
    setActiveRoom(updatedRoom as VoiceRoom);
  };

  const handleJoinRoom = async (room: VoiceRoom) => {
    if (!user) return;
    await communitySupabaseService.joinVoiceRoom(room.id, user.id);
    setActiveRoom(room);
    setIsMuted(true);
    await loadRooms();
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom || !user) return;
    await communitySupabaseService.leaveVoiceRoom(activeRoom.id, user.id);
    setActiveRoom(null);
    await loadRooms();
  };

  // If inside a room
  if (activeRoom) {
    return (
      <PageShell title={activeRoom.name} description={activeRoom.topic} icon={<Volume2 size={20} />} backTo={handleLeaveRoom}>
        <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
          {/* WebRTC Note - Discord Style Banner */}
          <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/50 rounded-lg flex items-start gap-3">
            <Info className="text-indigo-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-indigo-100 font-bold text-sm">WebRTC Connection Established (Simulated)</p>
              <p className="text-indigo-200/80 text-xs mt-0.5">Media servers are currently syncing participant status to Supabase. In production, this UI connects to a LiveKit/Jitsi instance for real peer-to-peer audio transmission.</p>
            </div>
          </div>

          {/* Discord-style Grid Layout */}
          <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden bg-dark-900 border-dark-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Volume2 className="text-primary-400" />
                  {activeRoom.topic}
                </h2>
                <p className="text-sm text-dark-400 mt-1">{activeRoom.language} Channel</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-700">
                  <Users size={16} className="text-dark-300" />
                  <span className="text-white text-sm font-medium">{activeRoom.participants?.length || 1} / {activeRoom.maxParticipants}</span>
                </div>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activeRoom.participants?.map(p => (
                  <div key={p.id} className={`bg-dark-800 rounded-xl p-4 flex flex-col items-center justify-center relative border-2 transition-all ${p.isSpeaking ? 'border-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-transparent'}`}>
                    <div className="relative mb-3">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-dark-700 overflow-hidden`}>
                        {p.avatarUrl ? <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : p.displayName?.charAt(0) || 'U'}
                      </div>
                      <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-dark-900 flex items-center justify-center border-2 border-dark-800">
                        {p.isMuted ? <MicOff size={14} className="text-error" /> : <Mic size={14} className="text-primary-400" />}
                      </div>
                    </div>
                    <p className="font-medium text-white text-sm text-center truncate w-full">{p.displayName}</p>
                    {p.id === activeRoom.hostId && <p className="text-[10px] text-accent-400 font-bold uppercase mt-1 tracking-wider">Host</p>}
                  </div>
                ))}
                
                {/* Current User Placeholder (if not in list, add dynamically) */}
                {(!activeRoom.participants || !activeRoom.participants.some(p => p.id === user?.id)) && (
                  <div className={`bg-dark-800 rounded-xl p-4 flex flex-col items-center justify-center relative border-2 transition-all ${!isMuted ? 'border-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-transparent'}`}>
                    <div className="relative mb-3">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-dark-700 overflow-hidden`}>
                        {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (user?.displayName?.charAt(0) || 'U')}
                      </div>
                      <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-dark-900 flex items-center justify-center border-2 border-dark-800">
                        {isMuted ? <MicOff size={14} className="text-error" /> : <Mic size={14} className="text-primary-400" />}
                      </div>
                    </div>
                    <p className="font-medium text-white text-sm text-center truncate w-full">{user?.displayName || 'You'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <div className="w-px h-8 bg-dark-800 mx-2"></div>
              <button 
                onClick={handleLeaveRoom}
                className="px-6 py-3 rounded-full bg-error hover:bg-red-600 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-error/30"
              >
                <PhoneOff size={20} /> Leave Channel
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // Lobby
  return (
    <PageShell title="Voice Channels" description="Join live speaking practice rooms." icon={<Volume2 size={20} />}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Active Channels</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} /> Create Channel
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={room.id} className="glass-card p-6 flex flex-col hover:border-primary-500/30 transition-colors cursor-pointer group" onClick={() => handleJoinRoom(room)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {room.isLive && <span className="px-2 py-0.5 bg-error/20 text-error text-[10px] font-bold rounded-md animate-pulse">LIVE</span>}
                  <span className="px-2 py-0.5 bg-dark-800 text-dark-300 text-xs font-medium rounded-md">{room.language}</span>
                </div>
                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary-400 transition-colors">{room.topic}</h3>
                <p className="text-sm text-dark-400 mt-1">{room.name}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-primary-400 border border-dark-700 group-hover:bg-primary-500/20 transition-colors">
                <Volume2 size={20} />
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {(room.participants || []).slice(0, 3).map((p, i) => (
                    <div key={p.id} className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold -ml-2 border-2 border-dark-900 first:ml-0 overflow-hidden text-white" style={{ zIndex: 10 - i }}>
                      {p.avatarUrl ? <img src={p.avatarUrl} alt="avatar" /> : (p.displayName?.charAt(0) || 'U')}
                    </div>
                  ))}
                  {(room.participants || []).length > 3 && <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-[10px] font-bold -ml-2 border-2 border-dark-900 z-0 text-dark-400">+{(room.participants || []).length - 3}</div>}
                </div>
                <div className="text-xs text-dark-400 font-medium">
                  {(room.participants || []).length} / {room.maxParticipants} <span className="hidden sm:inline">connected</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {rooms.length === 0 && (
           <div className="col-span-full py-12 text-center text-dark-400 border border-dashed border-dark-700 rounded-xl">
             <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
             <p className="text-lg font-medium">No active channels right now.</p>
             <p className="text-sm">Be the first to start a conversation!</p>
           </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-2">Start a Voice Channel</h2>
              <p className="text-sm text-dark-400 mb-6">Choose a topic and practice with learners worldwide.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1">Channel Topic</label>
                  <input 
                    type="text" 
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary-500" 
                    placeholder="e.g. IELTS Speaking Part 2 Practice" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1">Language</label>
                  <select 
                    value={newRoomLang}
                    onChange={(e) => setNewRoomLang(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option>English</option>
                    <option>Japanese</option>
                    <option>Korean</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-dark-300 hover:text-white font-medium">Cancel</button>
                <button 
                  onClick={handleCreateRoom} 
                  disabled={!newRoomTopic.trim()}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
                >
                  Start Channel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
