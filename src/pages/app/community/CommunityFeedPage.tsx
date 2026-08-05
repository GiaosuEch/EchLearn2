import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Heart, MessageCircle, Share2, Bookmark, Image as ImageIcon, Send, Filter, Hash, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { communityPosts } from '../../../data/communityData';
import { useAuthStore } from '../../../stores/authStore';
import { getDiscordCommunityUrl, getDiscordSetupHint, isDiscordInviteConfigured } from '../../../data/communityLinks';

export default function CommunityFeedPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language?.startsWith('vi');
  const user = useAuthStore((s) => s.user);
  const discordUrl = getDiscordCommunityUrl();
  const discordConfigured = isDiscordInviteConfigured();
  const [posts, setPosts] = useState(communityPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = isVi ? ['Tất cả', 'IELTS', 'Câu hỏi', 'Tiến bộ', 'Tiếng Anh', 'Tiếng Nhật'] : ['All', 'IELTS', 'Questions', 'Progress', 'English', 'Japanese'];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPostImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!newPostContent.trim() && !postImage) return;
    
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: user?.id || `anon-${Date.now()}`,
      authorName: user?.displayName || 'Anonymous Learner',
      authorAvatar: user?.avatarUrl || '',
      authorLevel: user?.level || 1,
      content: newPostContent,
      imageUrl: postImage,
      language: 'English',
      tags: ['Discussion'],
      likes: 0,
      comments: [],
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setPostImage(null);
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  return (
    <PageShell title={isVi ? 'Cộng đồng' : 'Community Feed'} description={isVi ? 'Kết nối, chia sẻ tiến độ, tìm bạn học và mở kênh Discord.' : 'Connect, share progress, find study buddies, and open the Discord channel.'} icon={<Users size={20} />}>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Post Composer */}
          <div className="glass-card p-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400 shrink-0 overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : (user?.displayName?.charAt(0) || 'U')}
              </div>
              <div className="flex-1">
                <textarea 
                  className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 min-h-[100px] resize-none"
                  placeholder={isVi ? 'Chia sẻ tiến độ, đặt câu hỏi hoặc đăng mẹo học...' : 'Share your progress, ask a question, or post a tip...'}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                {postImage && (
                  <div className="relative mt-2 max-w-xs">
                    <img src={postImage} alt="Upload preview" className="rounded-xl max-h-48 object-cover border border-dark-700" />
                    <button
                      onClick={() => setPostImage(null)}
                      className="absolute top-2 right-2 bg-slate-950/80 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <label className="p-2 text-dark-300 hover:text-emerald-400 hover:bg-dark-800 rounded-lg transition-colors cursor-pointer" title="Đăng ảnh">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                    <button className="p-2 text-dark-300 hover:text-primary-400 hover:bg-dark-800 rounded-lg transition-colors" title="Add Tags">
                      <Hash size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={handlePost}
                    disabled={!newPostContent.trim() && !postImage}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isVi ? 'Đăng' : 'Post'} <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={18} className="text-dark-400 shrink-0 mr-2" />
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === f ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-dark-700 bg-dark-900/50">
                <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4 text-dark-400">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{isVi ? 'Còn yên ắng quá...' : "It's quiet in here..."}</h3>
                <p className="text-dark-400 text-sm max-w-sm mx-auto">{isVi ? 'Hãy là người đầu tiên chia sẻ tiến độ, đặt câu hỏi hoặc giới thiệu bản thân!' : 'Be the first to share your progress, ask a question, or introduce yourself to the community!'}</p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={post.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                        {post.authorAvatar ? <img src={post.authorAvatar} alt="avatar" /> : post.authorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{post.authorName}</p>
                        <p className="text-xs text-dark-400">Lv.{post.authorLevel} • {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="p-1 text-dark-400 hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-dark-200 whitespace-pre-line leading-relaxed mb-3">
                    {post.content}
                  </p>
                  
                  {post.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-dark-700 max-h-80">
                      <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-dark-800 rounded-md text-primary-400 font-medium">{post.language}</span>
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-dark-800 rounded-md text-dark-300">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 mt-2 pt-3 border-t border-dark-700/50 text-sm text-dark-400">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-error' : 'hover:text-error'}`}
                    >
                      <Heart size={18} className={post.isLiked ? 'fill-error' : ''} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
                      <MessageCircle size={18} /> {post.comments?.length || 0}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Share2 size={18} /> {isVi ? 'Chia sẻ' : 'Share'}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-accent-400 ml-auto transition-colors">
                      <Bookmark size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-4">{isVi ? 'Chủ đề nổi bật' : 'Trending Topics'}</h3>
            <div className="space-y-3">
              {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 5).map(topic => (
                <div key={topic} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm text-dark-300 group-hover:text-primary-400 transition-colors">#{topic}</span>
                  <span className="text-xs text-dark-500">
                    {posts.filter(p => p.tags?.includes(topic)).length} posts
                  </span>
                </div>
              ))}
              {posts.flatMap(p => p.tags || []).length === 0 && (
                <div className="text-sm text-dark-400 text-center py-4">{isVi ? 'Chưa có chủ đề nổi bật' : 'No trending topics yet'}</div>
              )}
            </div>
          </div>
          
          <div className="glass-card p-5 bg-gradient-to-br from-primary-900/40 to-dark-900 border-primary-500/20">
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm font-bold text-indigo-100 hover:bg-indigo-500/20">
              <span>{isVi ? 'Mở kênh Discord' : 'Open Discord channel'}</span>
              <ExternalLink size={16} />
            </a>
            {!discordConfigured && <p className="mb-4 text-[11px] leading-relaxed text-dark-500">{getDiscordSetupHint(isVi)}</p>}
            <div className="flex items-start gap-3">
              <CustomEmoji name="ech-buri" size={34} label="Ếch Buri" />
              <div>
                <h3 className="font-bold text-white text-sm">{isVi ? 'Mẹo hôm nay của Buri' : "Buri's Tip of the Day"}</h3>
                <p className="text-xs text-dark-300 mt-1 leading-relaxed">{isVi ? 'Tương tác với 3 bài viết hôm nay để mở huy hiệu cộng đồng. Học ngoại ngữ vui hơn khi học cùng nhau.' : 'Engage with 3 posts today to earn the community badge. Language learning is better together.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
