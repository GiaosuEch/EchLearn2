import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Users, Trophy, ArrowLeft, Target, Globe, Crown, Shield } from 'lucide-react';
import PageShell from '../../PageShell';
import { studyGroups } from '../../../data/communityData';
import Mascot from '../../../components/mascot/Mascot';
import { useAuthStore } from '../../../stores/authStore';
import { GroupChatTab } from '../../../components/community/GroupChatTab';

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'leaderboard' | 'missions'>('feed');

  const group = studyGroups.find(g => g.id === id);

  if (!group) {
    return (
      <PageShell title="Group Not Found" description="This group does not exist." backTo="/app/groups">
        <div className="py-20 text-center">
          <Mascot expression="thinking" size={80} message="Không tìm thấy nhóm này!" />
          <p className="mt-4 text-dark-400">Please check the URL or return to groups.</p>
        </div>
      </PageShell>
    );
  }

  const isMember = group.members.some(m => m.id === user?.id) || user?.id === group.ownerId;

  return (
    <div className="space-y-6">
      <Link to="/app/groups" className="inline-flex items-center gap-1 text-sm text-dark-400 hover:text-primary-400 transition-colors">
        <ArrowLeft size={16} /> Back to Groups
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary-900/40 to-dark-800 relative">
          <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-2xl bg-dark-700 border-4 border-dark-900 flex items-center justify-center text-4xl shadow-xl">
            {group.avatarUrl ? <img src={group.avatarUrl} alt="icon" className="w-full h-full object-cover rounded-2xl" /> : '📚'}
          </div>
        </div>
        
        <div className="pt-14 p-6 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{group.name}</h1>
              <p className="text-dark-300 mt-2 max-w-2xl">{group.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-4 text-sm font-medium">
                <span className="flex items-center gap-1 px-3 py-1 bg-dark-800 rounded-lg text-primary-400"><Globe size={16} /> {group.language}</span>
                <span className="flex items-center gap-1 px-3 py-1 bg-dark-800 rounded-lg text-accent-400"><Target size={16} /> {group.level}</span>
                <span className="flex items-center gap-1 px-3 py-1 bg-dark-800 rounded-lg text-blue-400"><Users size={16} /> {group.members.length}/{group.maxMembers}</span>
                <span className="flex items-center gap-1 px-3 py-1 bg-dark-800 rounded-lg text-yellow-400"><Trophy size={16} /> {group.weeklyXP} Weekly XP</span>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col items-center justify-center w-full md:w-auto">
              {!isMember ? (
                <button className="w-full md:w-48 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25">
                  Join Group
                </button>
              ) : (
                <button className="w-full md:w-48 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-dark-300 font-medium rounded-xl transition-all">
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-t border-dark-700/50">
          {[
            { id: 'feed', label: 'Activity Feed' },
            { id: 'chat', label: 'Group Chat' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'missions', label: 'Group Missions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'feed' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-10 text-center text-dark-400">
                <p>Welcome to {group.name}! Share your progress with the group.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Members ({group.members.length})</h3>
                <div className="space-y-3">
                  {group.members.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                        {m.avatarUrl ? <img src={m.avatarUrl} alt="avatar" /> : m.displayName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium flex items-center gap-1">
                          {m.displayName}
                          {m.role === 'owner' && <Crown size={12} className="text-yellow-400" />}
                          {m.role === 'admin' && <Shield size={12} className="text-blue-400" />}
                        </p>
                      </div>
                      <span className="text-xs text-dark-400">{m.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <GroupChatTab group={group} isMember={isMember} user={user} />
        )}

        {activeTab === 'leaderboard' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Trophy className="text-yellow-400" /> Group Leaderboard</h3>
            <div className="space-y-2">
              {group.members.slice().sort((a, b) => b.xp - a.xp).map((m, idx) => (
                <div key={m.id} className="flex items-center gap-4 p-3 bg-dark-800/50 hover:bg-dark-800 rounded-xl transition-colors">
                  <div className="w-8 text-center font-bold text-lg text-dark-400">#{idx + 1}</div>
                  <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center font-bold overflow-hidden">
                    {m.avatarUrl ? <img src={m.avatarUrl} alt="avatar" /> : m.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{m.displayName}</p>
                  </div>
                  <div className="text-primary-400 font-bold">{m.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Weekly XP Goal', target: 5000, current: group.weeklyXP, reward: 500 },
              { title: 'Active Members', target: group.maxMembers, current: group.members.length, reward: 200 },
              { title: 'Voice Room Sessions', target: 3, current: 1, reward: 300 },
            ].map(m => (
              <div key={m.title} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{m.title}</h4>
                    <p className="text-xs text-accent-400 font-medium">Reward: +{m.reward} Group XP</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Progress</span>
                    <span className="text-white font-medium">{m.current}/{m.target}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
