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
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : (user?.displayName?.charAt(0) || 'U')}
              </div>
              <div className="flex-1">
                <textarea 
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-950 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder={isVi ? 'Chia sẻ tiến độ, đặt câu hỏi hoặc đăng mẹo học...' : 'Share your progress, ask a question, or post a tip...'}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                {postImage && (
                  <div className="relative mt-2 max-w-xs">
                    <img src={postImage} alt="Upload preview" className="max-h-48 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
                    <button
                      onClick={() => setPostImage(null)}
                      className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-1 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300" title="Đăng ảnh">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                    <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300" title="Add Tags">
                      <Hash size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={handlePost}
                    disabled={!newPostContent.trim() && !postImage}
                    className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVi ? 'Đăng' : 'Post'} <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={18} className="mr-2 shrink-0 text-slate-500" />
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${activeFilter === f ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white p-10 text-center shadow-sm dark:border-emerald-400/20 dark:bg-slate-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <MessageCircle size={32} />
                </div>
                <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-white">{isVi ? 'Còn yên ắng quá...' : "It's quiet in here..."}</h3>
                <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">{isVi ? 'Hãy là người đầu tiên chia sẻ tiến độ, đặt câu hỏi hoặc giới thiệu bản thân!' : 'Be the first to share your progress, ask a question, or introduce yourself to the community!'}</p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={post.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {post.authorAvatar ? <img src={post.authorAvatar} alt="avatar" /> : post.authorName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{post.authorName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Lv.{post.authorLevel} • {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {post.content}
                  </p>
                  
                  {post.imageUrl && (
                    <div className="mb-4 max-h-80 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{post.language}</span>
                      {post.tags.map(tag => (
                        <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center gap-6 border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-error' : 'hover:text-error'}`}
                    >
                      <Heart size={18} className={post.isLiked ? 'fill-error' : ''} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300">
                      <MessageCircle size={18} /> {post.comments?.length || 0}
                    </button>
                    <button className="flex items-center gap-1.5 transition-colors hover:text-slate-950 dark:hover:text-white">
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
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-black text-slate-950 dark:text-white">{isVi ? 'Chủ đề nổi bật' : 'Trending Topics'}</h3>
            <div className="space-y-3">
              {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 5).map(topic => (
                <div key={topic} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm text-slate-600 transition-colors group-hover:text-emerald-700 dark:text-slate-300 dark:group-hover:text-emerald-300">#{topic}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {posts.filter(p => p.tags?.includes(topic)).length} posts
                  </span>
                </div>
              ))}
              {posts.flatMap(p => p.tags || []).length === 0 && (
                <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">{isVi ? 'Chưa có chủ đề nổi bật' : 'No trending topics yet'}</div>
              )}
            </div>
          </div>
          
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center justify-between rounded-2xl border border-indigo-200 bg-white p-4 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-400/30 dark:bg-slate-900 dark:text-indigo-200 dark:hover:bg-indigo-500/10">
              <span>{isVi ? 'Mở kênh Discord' : 'Open Discord channel'}</span>
              <ExternalLink size={16} />
            </a>
            {!discordConfigured && <p className="mb-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{getDiscordSetupHint(isVi)}</p>}
            <div className="flex items-start gap-3">
              <CustomEmoji name="ech-buri" size={34} label="Ếch Buri" />
              <div>
                <h3 className="text-sm font-black text-slate-950 dark:text-white">{isVi ? 'Mẹo hôm nay của Buri' : "Buri's Tip of the Day"}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{isVi ? 'Tương tác với 3 bài viết hôm nay để mở huy hiệu cộng đồng. Học ngoại ngữ vui hơn khi học cùng nhau.' : 'Engage with 3 posts today to earn the community badge. Language learning is better together.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
