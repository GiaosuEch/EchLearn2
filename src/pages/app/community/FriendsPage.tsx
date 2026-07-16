import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Users, Search, UserPlus, MessageCircle, MoreVertical, Flame } from 'lucide-react';
import PageShell from '../../PageShell';
import { communitySupabaseService } from '../../../services/communitySupabaseService';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from '../../../components/ui/Toast';

export function FriendsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'online' | 'requests'>('all');
  const [friends, setFriends] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      communitySupabaseService.getFriends(user.id).then(setFriends);
    }
  }, [user]);

  useEffect(() => {
    if (search.length > 2 && user?.id) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        communitySupabaseService.searchUsers(search, user.id).then(res => {
          setSearchResults(res);
          setIsSearching(false);
        });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [search, user]);

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    try {
      await communitySupabaseService.addFriend(user.id, friendId);
      toast('Friend request sent!', 'success');
      // Refresh friends
      const updated = await communitySupabaseService.getFriends(user.id);
      setFriends(updated);
    } catch (e) {
      toast('Could not send friend request', 'error');
    }
  };

  const displayList = search.length > 2 ? searchResults : friends.filter(f => 
    (tab === 'all' || (tab === 'online' && f.isOnline))
  );

  return (
    <PageShell title="Friends" description="Your study buddies and community connections" icon={<Users size={20} />}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            {['all', 'online', 'requests'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'}`}
              >
                {t}
                {t === 'requests' && <span className="ml-2 px-1.5 py-0.5 bg-error text-white text-[10px] rounded-full">0</span>}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Friends/Search List */}
        <div className="grid md:grid-cols-2 gap-4">
          {isSearching ? (
            <div className="col-span-full py-8 text-center text-dark-400">Searching...</div>
          ) : displayList.length > 0 ? displayList.map((f) => (
            <div key={f.id} className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:border-primary-500/30 transition-colors">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center font-bold text-lg overflow-hidden">
                  {f.avatar_url || f.avatarUrl ? (
                    <img src={f.avatar_url || f.avatarUrl} alt={f.display_name || f.displayName} className="w-full h-full object-cover" />
                  ) : (
                    (f.display_name || f.displayName || '?').charAt(0)
                  )}
                </div>
                {f.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-dark-900" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{f.display_name || f.displayName}</p>
                <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                  <span>{t("vocabulary.level")} {f.level || 1}</span>
                  {f.streak && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-orange-400 font-semibold"><Flame size={12} /> {f.streak}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 transition-opacity">
                {search.length > 2 ? (
                  <button onClick={() => handleAddFriend(f.id)} className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                    <UserPlus size={16} />
                  </button>
                ) : (
                  <>
                    <button className="p-2 bg-dark-800 hover:bg-primary-500 hover:text-white text-dark-300 rounded-lg transition-colors">
                      <MessageCircle size={16} />
                    </button>
                    <button className="p-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-dark-400 glass-card">
              <Users size={48} className="mb-4 opacity-50" />
              <p>{search.length > 0 ? 'No users found.' : 'No friends found.'}</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
