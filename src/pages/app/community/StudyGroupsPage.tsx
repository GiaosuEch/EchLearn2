import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Users, Search, Plus, Filter, Trophy, ArrowRight, Target, Globe } from 'lucide-react';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
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

  const loadGroups = async () => {
    const groups = await communitySupabaseService.getStudyGroups();
    setStudyGroups(groups);
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input 
            type="text" 
            placeholder="Tìm nhóm học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} /> Tạo nhóm
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <Filter size={18} className="text-dark-400 shrink-0 mr-2" />
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === f ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'}`}
          >
            {{ All: 'Tất cả', Beginners: 'Mới bắt đầu', Advanced: 'Nâng cao', English: 'Tiếng Anh', Speaking: 'Luyện nói' }[f] || f}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      <div className={filteredGroups.length > 0 ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "w-full"}>
        {filteredGroups.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-dark-700 bg-dark-900/50 mt-4">
            <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4 text-dark-400">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có nhóm phù hợp</h3>
            <p className="text-dark-400 text-sm max-w-md mx-auto mb-6">Thử đổi bộ lọc hoặc tạo một nhóm mới để mời những người cùng mục tiêu.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-500/20 mx-auto"
            >
              <Plus size={18} /> Tạo nhóm mới
            </button>
          </div>
        ) : (
          filteredGroups.map((g) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={g.id} className="glass-card flex flex-col hover:border-primary-500/30 transition-colors overflow-hidden group">
              <div className="h-24 bg-gradient-to-br from-primary-900/40 to-dark-800 relative">
                <div className="absolute -bottom-6 left-5 w-12 h-12 rounded-xl bg-dark-700 border-2 border-dark-900 flex items-center justify-center shadow-lg">
                  {g.avatarUrl ? <img src={g.avatarUrl} alt="Biểu tượng nhóm" className="w-full h-full object-cover rounded-xl" /> : <CustomEmoji name="skill-book" size={24} />}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-dark-900/80 rounded-md text-xs font-semibold text-primary-400 flex items-center gap-1 backdrop-blur-md">
                  <Trophy size={12} /> {g.weeklyXP || 0} XP
                </div>
              </div>
              
              <div className="pt-8 p-5 flex flex-col flex-1">
                <h3 className="font-bold text-white text-lg">{g.name}</h3>
                <p className="text-sm text-dark-300 mt-1 line-clamp-2 min-h-[40px]">{g.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-dark-800 rounded-md text-dark-200"><Globe size={12} /> {g.language}</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-dark-800 rounded-md text-dark-200"><Target size={12} /> {g.level}</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-dark-800 rounded-md text-dark-200"><Users size={12} /> {g.members?.length || 1}/{g.maxMembers}</span>
                </div>
                
                <div className="mt-auto pt-5 flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Simplified member rendering since backend doesn't always send full profiles */}
                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold border-2 border-dark-900 text-white">
                       {(g as any).ownerName?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <Link to={`/app/groups/${g.id}`} className="p-2 bg-dark-800 hover:bg-primary-500 rounded-lg text-dark-200 hover:text-white transition-all group-hover:bg-primary-500 group-hover:text-white">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-2">Tạo nhóm học</h2>
              <p className="text-sm text-dark-400 mb-6">Nhóm chỉ được xác nhận sau khi lưu thành công.</p>
              {createError ? <p role="alert" className="mb-4 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{createError}</p> : null}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1" htmlFor="study-group-name">Tên nhóm</label>
                  <input id="study-group-name" type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary-500" placeholder="Ví dụ: IELTS 7.5 cùng tiến" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1" htmlFor="study-group-description">Mô tả</label>
                  <textarea id="study-group-description" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary-500 min-h-[100px] resize-none" placeholder="Nhóm này sẽ cùng nhau học gì?" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button onClick={() => setShowCreateModal(false)} disabled={creating} className="px-4 py-2 text-dark-300 hover:text-white font-medium">Hủy</button>
                <button onClick={handleCreateGroup} disabled={!newGroupName.trim() || creating} aria-busy={creating} className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">{creating ? 'Đang tạo...' : 'Tạo nhóm'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
