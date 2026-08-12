import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Users, Search, Plus, Filter, Trophy, ArrowRight, Target, Globe, BookOpen } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';
import { communitySupabaseService } from '../../../services/communitySupabaseService';
import { type StudyGroup } from '../../../types/community';

export default function StudyGroupsPage() {
  const user = useAuthStore((s) => s.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadGroups = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const groups = await communitySupabaseService.getStudyGroups();
      setStudyGroups(groups);
    } catch (error) {
      console.error('Could not load study groups', error);
      setLoadError('Chưa thể tải nhóm học. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filters = ['All', 'IELTS', 'Beginners', 'Advanced', 'English', 'Speaking'];

  const filteredGroups = studyGroups.filter(g => {
    if (activeFilter !== 'All' && !g.tags?.includes(activeFilter) && g.language !== activeFilter) return false;
    if (searchTerm && !g.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    setCreateError('');
    setCreating(true);
    try {
      await communitySupabaseService.createStudyGroup(newGroupName, newGroupDesc, 'en', user.id);
      await loadGroups();
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (error) {
      console.error('Could not create study group', error);
      setCreateError('Chưa thể tạo nhóm lúc này. Vui lòng thử lại sau.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageShell title="Nhóm học" description="Cùng học, luyện tập và giữ nhịp với những người có chung mục tiêu." icon={<Users size={20} />}>
      {/* Header Actions */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm nhóm học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <Plus size={18} /> Tạo nhóm
        </button>
      </div>

      {/* Filters */}
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide" aria-label="Lọc nhóm học" role="tablist">
        <Filter size={18} className="mr-2 shrink-0 text-slate-500" />
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            aria-selected={activeFilter === f}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${activeFilter === f ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'}`}
          >
            {{ All: 'Tất cả', Beginners: 'Mới bắt đầu', Advanced: 'Nâng cao', English: 'Tiếng Anh', Speaking: 'Luyện nói' }[f] || f}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      {loadError ? (
        <div role="alert" className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center text-amber-100"><p>{loadError}</p><button type="button" onClick={() => void loadGroups()} className="mt-4 min-h-11 rounded-xl bg-primary-500 px-5 py-3 font-bold text-white">Thử tải lại</button></div>
      ) : loading ? (
        <div role="status" aria-live="polite" className="rounded-2xl border border-dark-700 bg-dark-900/50 p-10 text-center text-dark-300">Đang tải danh sách nhóm học…</div>
      ) : (
      <div className={filteredGroups.length > 0 ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "w-full"}>
        {filteredGroups.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white p-12 text-center shadow-sm dark:border-emerald-400/20 dark:bg-slate-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Users size={32} />
            </div>
            <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">Chưa có nhóm phù hợp</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-slate-600 dark:text-slate-300">Thử đổi bộ lọc hoặc tạo một nhóm mới để mời những người cùng mục tiêu.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Plus size={18} /> Tạo nhóm mới
            </button>
          </div>
        ) : (
          filteredGroups.map((g) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={g.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700">
              <div className="relative h-24 bg-emerald-100 dark:bg-emerald-950/40">
                <div className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-emerald-50 shadow-sm dark:border-slate-900 dark:bg-emerald-900">
                  {g.avatarUrl ? <img src={g.avatarUrl} alt="Biểu tượng nhóm" className="w-full h-full object-cover rounded-xl" /> : <BookOpen size={24} className="text-emerald-700 dark:text-emerald-300" aria-hidden="true" />}
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-md dark:bg-slate-950/80 dark:text-emerald-300">
                  <Trophy size={12} /> {g.weeklyXP || 0} XP
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-5 pt-8">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{g.name}</h3>
                <p className="mt-1 min-h-[40px] line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{g.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Globe size={12} /> {g.language}</span>
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Target size={12} /> {g.level}</span>
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Users size={12} /> {g.members?.length || 1}/{g.maxMembers}</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-5">
                  <div className="flex items-center">
                    {/* Simplified member rendering since backend doesn't always send full profiles */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-xs font-bold text-emerald-700 dark:border-slate-900 dark:bg-emerald-900 dark:text-emerald-300">
                       {(g as any).ownerName?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <Link to={`/app/groups/${g.id}`} aria-label={`Xem nhóm ${g.name}`} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/15 dark:text-emerald-300">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm" role="presentation">
            <motion.div role="dialog" aria-modal="true" aria-labelledby="create-study-group-title" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <h2 id="create-study-group-title" className="mb-2 text-xl font-black text-slate-950 dark:text-white">Tạo nhóm học</h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">Nhóm chỉ được xác nhận sau khi lưu thành công.</p>
              {createError ? <p role="alert" className="mb-4 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{createError}</p> : null}
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-group-name">Tên nhóm</label>
                  <input id="study-group-name" type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-950 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Ví dụ: IELTS 7.5 cùng tiến" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-group-description">Mô tả</label>
                  <textarea id="study-group-description" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-slate-950 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Nhóm này sẽ cùng nhau học gì?" />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} disabled={creating} className="px-4 py-2 font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Hủy</button>
                <button onClick={handleCreateGroup} disabled={!newGroupName.trim() || creating} aria-busy={creating} className="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{creating ? 'Đang tạo...' : 'Tạo nhóm'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
