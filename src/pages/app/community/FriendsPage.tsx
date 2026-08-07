import { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, UserCheck, MessageCircle, X, Check, Clock, UserX, Video } from 'lucide-react';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { useAuthStore } from '../../../stores/authStore';
import { userService } from '../../../services/userService';
import { profileService } from '../../../services/profileService';
import { toast } from '../../../components/ui/Toast';
import { DirectChatModal } from '../../../components/community/DirectChatModal';

import { communitySupabaseService, type FriendRecord } from '../../../services/communitySupabaseService';

const FRIENDS_STORAGE_KEY = 'echlearn_friend_requests_v2';

function readAllRecords(): FriendRecord[] {
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeAllRecords(records: FriendRecord[]) {
  try { localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(records)); } catch {}
}

export function FriendsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests' | 'all'>('friends');
  const [allRegisteredUsers, setAllRegisteredUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<FriendRecord[]>([]);
  const user = useAuthStore(s => s.user);
  const userId = user?.id;
  const myId = userId || '';

  const reload = useCallback(async () => {
    if (!myId) return;
    try {
      const remote = await communitySupabaseService.getFriendRecords(myId);
      if (remote && remote.length > 0) {
        setRecords(remote);
        writeAllRecords(remote);
      } else {
        setRecords(readAllRecords());
      }
    } catch {
      setRecords(readAllRecords());
    }
  }, [myId]);

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      const localUsers = userService.getAllLocalUsers();
      try {
        const leaderboard = await profileService.getLeaderboard(50);
        const mapped = leaderboard.map(l => ({
          id: l.id,
          displayName: l.name,
          username: l.username || l.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          avatarUrl: l.avatar,
          totalXP: l.xp,
          level: Math.floor((l.xp || 0) / 100) + 1,
        }));
        const combined: any[] = [...localUsers];
        mapped.forEach((m: any) => {
          if (!combined.some((c: any) => c.id === m.id)) {
            combined.push(m);
          }
        });
        if (isMounted) setAllRegisteredUsers(combined);
      } catch {
        if (isMounted) setAllRegisteredUsers(localUsers);
      }
    }
    loadUsers();
    reload();
    const interval = setInterval(reload, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [myId, reload]);

  /* ── helpers ── */
  const getRelation = (otherId: string) => {
    return records.find(
      r => (r.fromUserId === myId && r.toUserId === otherId) ||
           (r.fromUserId === otherId && r.toUserId === myId)
    );
  };

  const incomingRequests = records.filter(r => r.toUserId === myId && r.status === 'pending');
  const outgoingRequests = records.filter(r => r.fromUserId === myId && r.status === 'pending');
  const acceptedFriends = records.filter(
    r => r.status === 'accepted' &&
         (r.fromUserId === myId || r.toUserId === myId)
  );

  /* ── actions ── */
  const handleSendRequest = async (targetUser: any) => {
    if (!user) return;
    const existing = getRelation(targetUser.id);
    if (existing) {
      toast('Đã gửi lời mời trước đó rồi!', 'warning');
      return;
    }
    const newRecord: FriendRecord = {
      id: crypto.randomUUID(),
      fromUserId: myId,
      toUserId: targetUser.id,
      status: 'pending',
      displayName: targetUser.displayName || targetUser.fullName || 'Học Viên Ếch',
      username: targetUser.username || `learner_${targetUser.id?.slice(0, 6)}`,
      avatarUrl: targetUser.avatarUrl || '/mascots/pepe_mascot_avatar.png',
      level: targetUser.level || targetUser.currentLevel || 1,
      totalXP: targetUser.totalXP || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await communitySupabaseService.sendFriendRequest(myId, targetUser.id);
    const all = [...readAllRecords(), newRecord];
    writeAllRecords(all);
    setRecords(all);
    toast(`Đã gửi lời mời kết bạn tới ${newRecord.displayName}! ⏳`, 'success');
    reload();
  };

  const handleAcceptRequest = async (recordId: string) => {
    await communitySupabaseService.updateFriendRequestStatus(recordId, 'accepted');
    const all = readAllRecords().map(r =>
      r.id === recordId ? { ...r, status: 'accepted' as const, updatedAt: new Date().toISOString() } : r
    );
    writeAllRecords(all);
    setRecords(all);
    toast('Đã chấp nhận lời mời kết bạn! 🎉', 'success');
    reload();
  };

  const handleDeclineRequest = async (recordId: string) => {
    await communitySupabaseService.updateFriendRequestStatus(recordId, 'declined');
    const all = readAllRecords().map(r =>
      r.id === recordId ? { ...r, status: 'declined' as const, updatedAt: new Date().toISOString() } : r
    );
    writeAllRecords(all);
    setRecords(all);
    toast('Đã từ chối lời mời kết bạn.', 'info');
    reload();
  };

  const handleRemoveFriend = async (recordId: string) => {
    await communitySupabaseService.removeFriendRecord(recordId);
    const all = readAllRecords().filter(r => r.id !== recordId);
    writeAllRecords(all);
    setRecords(all);
    toast('Đã hủy kết bạn.', 'info');
    reload();
  };

  const [directChatPartner, setDirectChatPartner] = useState<string | null>(null);
  const [startCallMode, setStartCallMode] = useState(false);

  const handleChatWithFriend = (friendName: string) => {
    setDirectChatPartner(friendName);
    setStartCallMode(false);
    toast(`Mở trò chuyện 1-1 với ${friendName}`, 'info');
  };

  const handleVideoCallWithFriend = (friendName: string) => {
    setDirectChatPartner(friendName);
    setStartCallMode(true);
    toast(`🎥 Đang mở cuộc gọi Video 1-1 với ${friendName}...`, 'success');
  };

  /* ── filtered lists ── */
  const filteredUsers = allRegisteredUsers.filter(u => {
    if (u.id === myId) return false;
    const q = search.toLowerCase();
    return !search ||
      u.displayName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q);
  });

  const filteredFriends = acceptedFriends.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.displayName?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q);
  });

  /* helper: get the "other" user info from a friend record */
  const friendInfo = (record: FriendRecord) => {
    const otherId = record.fromUserId === myId ? record.toUserId : record.fromUserId;
    const otherUser = allRegisteredUsers.find(u => u.id === otherId);
    return {
      id: otherId,
      displayName: otherUser?.displayName || record.displayName,
      username: otherUser?.username || record.username,
      avatarUrl: otherUser?.avatarUrl || record.avatarUrl,
      level: otherUser?.level || record.level,
      totalXP: otherUser?.totalXP || record.totalXP,
    };
  };

  const requestBadge = incomingRequests.length > 0 ? incomingRequests.length : null;

  return (
    <PageShell title="Bạn Bè & Kết Bạn" description="Gửi lời mời, chấp nhận bạn bè và trò chuyện" icon={<Users size={20} />}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tab Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <button 
              onClick={() => setTab('friends')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${tab === 'friends' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Bạn Bè ({acceptedFriends.length})
            </button>
            <button 
              onClick={() => setTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer relative ${tab === 'requests' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Lời Mời ({incomingRequests.length + outgoingRequests.length})
              {requestBadge && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">{requestBadge}</span>
              )}
            </button>
            <button 
              onClick={() => setTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${tab === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Tìm Bạn Gợi Ý ({filteredUsers.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo ID, Username hoặc Email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* ═══ TAB: TÌM BẠN ═══ */}
        {tab === 'all' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="sm:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs shadow-sm">
                Chưa tìm thấy học viên nào. Hãy thử nhập Email hoặc ID khác!
              </div>
            ) : (
              filteredUsers.map(u => {
                const relation = getRelation(u.id);
                const isPending = relation?.status === 'pending';
                const isAccepted = relation?.status === 'accepted';

                return (
                  <div key={u.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4 hover:border-emerald-500/40 transition-all shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : (u.displayName?.[0]?.toUpperCase() || 'E')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{u.displayName || u.fullName || 'Học Viên Ếch'}</h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{u.username || `learner_${u.id?.slice(0, 6)}`}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">Level: {u.currentLevel || u.level || 'Beginner'} • {u.totalXP || 0} XP</p>
                      </div>
                    </div>

                    {isAccepted ? (
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><UserCheck size={14} /> Bạn Bè</span>
                    ) : isPending ? (
                      <span className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5"><Clock size={14} /> Đang Chờ</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(u)}
                        className="px-3 py-2 rounded-xl text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <UserPlus size={14} /> Gửi Lời Mời
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ TAB: LỜI MỜI ═══ */}
        {tab === 'requests' && (
          <div className="space-y-6">
            {/* Incoming requests */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CustomEmoji name="inbox-in" size={16} /> Lời mời nhận được ({incomingRequests.length})
              </h3>
              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
                  Không có lời mời kết bạn nào đang chờ.
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map(req => {
                    const info = friendInfo(req);
                    return (
                      <div key={req.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 p-5 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            {info.avatarUrl ? <img src={info.avatarUrl} alt="" className="w-full h-full object-cover" /> : (info.displayName[0]?.toUpperCase() || 'E')}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{info.displayName}</h4>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{info.username}</p>
                            <p className="text-[10px] text-amber-500 font-semibold">Muốn kết bạn với bạn</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Check size={14} /> Chấp Nhận
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <X size={14} /> Từ Chối
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outgoing requests */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CustomEmoji name="inbox-out" size={16} /> Lời mời đã gửi ({outgoingRequests.length})
              </h3>
              {outgoingRequests.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
                  Bạn chưa gửi lời mời kết bạn nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {outgoingRequests.map(req => (
                    <div key={req.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                          {req.avatarUrl ? <img src={req.avatarUrl} alt="" className="w-full h-full object-cover" /> : (req.displayName[0]?.toUpperCase() || 'E')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{req.displayName}</h4>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{req.username}</p>
                          <p className="text-[10px] text-amber-500 flex items-center gap-1"><Clock size={10} /> Đang chờ phản hồi...</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const all = readAllRecords().filter(r => r.id !== req.id);
                          writeAllRecords(all);
                          setRecords(all);
                          toast('Đã thu hồi lời mời kết bạn.', 'info');
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <UserX size={14} /> Thu Hồi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB: BẠN BÈ (chỉ hiện accepted) ═══ */}
        {tab === 'friends' && (
          <div className="space-y-4">
            {filteredFriends.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
                <Users size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-600 dark:text-slate-300">Chưa có bạn bè nào</p>
                <p className="mt-1 text-xs text-slate-400">Chuyển sang tab "Tìm Bạn" để gửi lời mời kết bạn nhé!</p>
              </div>
            ) : (
              filteredFriends.map(record => {
                const info = friendInfo(record);
                return (
                  <div key={record.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                          {info.avatarUrl ? <img src={info.avatarUrl} alt="" className="w-full h-full object-cover" /> : (info.displayName[0]?.toUpperCase() || 'E')}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Bạn bè" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{info.displayName}</h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{info.username}</p>
                        <p className="text-[10px] text-slate-400">Level: {info.level} • {info.totalXP} XP</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVideoCallWithFriend(info.displayName)}
                        className="px-3 py-2 rounded-xl text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Video size={14} /> Gọi Video
                      </button>
                      <button
                        onClick={() => handleChatWithFriend(info.displayName)}
                        className="px-3 py-2 rounded-xl text-xs font-bold uppercase bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <MessageCircle size={14} /> Nhắn Tin
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(record.id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer transition-all"
                        title="Hủy kết bạn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <DirectChatModal
        friendName={directChatPartner || ''}
        isOpen={Boolean(directChatPartner)}
        onClose={() => setDirectChatPartner(null)}
        startWithVideoCall={startCallMode}
      />
    </PageShell>
  );
}

export default FriendsPage;
