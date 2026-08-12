import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, BookOpen, Crown, Globe, Shield, Target, Trophy, Users } from 'lucide-react';
import PageShell from '../../PageShell';
import { studyGroups } from '../../../data/communityData';
import Mascot from '../../../components/mascot/Mascot';
import { useAuthStore } from '../../../stores/authStore';
import { GroupChatTab } from '../../../components/community/GroupChatTab';

type GroupTab = 'feed' | 'chat' | 'leaderboard' | 'missions';

const TABS: Array<{ id: GroupTab; label: string }> = [
  { id: 'feed', label: 'Hoạt động' },
  { id: 'chat', label: 'Trò chuyện' },
  { id: 'leaderboard', label: 'Bảng xếp hạng' },
  { id: 'missions', label: 'Nhiệm vụ nhóm' },
];

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<GroupTab>('feed');
  const group = studyGroups.find(g => g.id === id);

  if (!group) {
    return (
      <PageShell title="Không tìm thấy nhóm" description="Nhóm này không còn tồn tại hoặc đường dẫn không đúng." backTo="/app/groups">
        <div className="py-20 text-center">
          <Mascot expression="thinking" size={80} message="Không tìm thấy nhóm này!" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Hãy kiểm tra lại đường dẫn hoặc quay về danh sách nhóm học.</p>
        </div>
      </PageShell>
    );
  }

  const isMember = group.members.some(m => m.id === user?.id) || user?.id === group.ownerId;

  return (
    <div className="space-y-6">
      <Link to="/app/groups" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300">
        <ArrowLeft size={16} /> Quay lại nhóm học
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-40 bg-emerald-100 dark:bg-emerald-950/40">
          <div className="absolute -bottom-10 left-6 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-emerald-50 shadow-sm dark:border-slate-900 dark:bg-emerald-900">
            {group.avatarUrl ? <img src={group.avatarUrl} alt={`Biểu tượng ${group.name}`} className="h-full w-full rounded-2xl object-cover" /> : <BookOpen size={42} className="text-emerald-700 dark:text-emerald-300" aria-hidden="true" />}
          </div>
        </div>

        <div className="p-6 pb-8 pt-14 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-black text-slate-950 dark:text-white">{group.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{group.description}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Globe size={15} /> {group.language}</span>
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Target size={15} /> {group.level}</span>
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Users size={15} /> {group.members.length}/{group.maxMembers}</span>
                <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><Trophy size={15} /> {group.weeklyXP} XP tuần</span>
              </div>
            </div>

            <div className="w-full shrink-0 md:w-auto">
              <button className={`w-full rounded-xl px-6 py-3 font-bold transition-colors md:w-48 ${isMember ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800' : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'}`}>
                {isMember ? 'Rời nhóm' : 'Tham gia nhóm'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto border-t border-slate-200 px-3 dark:border-slate-700" role="tablist" aria-label="Nội dung nhóm học">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-4 text-sm font-bold transition-colors sm:px-6 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700 dark:text-emerald-300' : 'border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'feed' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:col-span-2">
            <p>Chưa có hoạt động mới trong {group.name}. Hãy là người đầu tiên chia sẻ tiến độ học.</p>
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 font-black text-slate-950 dark:text-white">Thành viên ({group.members.length})</h2>
            <div className="space-y-3">
              {group.members.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {m.avatarUrl ? <img src={m.avatarUrl} alt="" /> : m.displayName.charAt(0)}
                  </div>
                  <p className="flex min-w-0 flex-1 items-center gap-1 truncate text-sm font-medium text-slate-900 dark:text-white">
                    {m.displayName}
                    {m.role === 'owner' && <Crown size={13} className="shrink-0 text-amber-500" aria-label="Trưởng nhóm" />}
                    {m.role === 'admin' && <Shield size={13} className="shrink-0 text-sky-500" aria-label="Quản trị viên" />}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{m.xp} XP</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'chat' && <GroupChatTab group={group} isMember={isMember} user={user} />}

      {activeTab === 'leaderboard' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Trophy className="text-amber-500" /> Bảng xếp hạng nhóm</h2>
          <div className="space-y-2">
            {group.members.slice().sort((a, b) => b.xp - a.xp).map((m, idx) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 sm:gap-4">
                <div className="w-8 text-center text-lg font-black text-slate-500 dark:text-slate-400">#{idx + 1}</div>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  {m.avatarUrl ? <img src={m.avatarUrl} alt="" /> : m.displayName.charAt(0)}
                </div>
                <p className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{m.displayName}</p>
                <div className="font-bold text-emerald-700 dark:text-emerald-300">{m.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'missions' && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: 'Mục tiêu XP tuần', target: 5000, current: group.weeklyXP, reward: 500 },
            { title: 'Thành viên hoạt động', target: group.maxMembers, current: group.members.length, reward: 200 },
            { title: 'Buổi học cùng nhau', target: 3, current: 1, reward: 300 },
          ].map(m => (
            <article key={m.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Target size={22} /></div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">{m.title}</h3>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Thưởng: +{m.reward} XP nhóm</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">Tiến độ</span><span className="font-medium text-slate-900 dark:text-white">{m.current}/{m.target}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} /></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
