import { useState } from 'react';
import { Film, Sparkles, Volume2, Play } from 'lucide-react';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { toast } from '../../../components/ui/Toast';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useAppStore } from '../../../stores/appStore';

export interface ListeningVideoClip {
  id: string;
  titleVi: string;
  titleTarget: string;
  category: 'Daily Conversations' | 'Cartoon' | 'Movie short clip' | 'TED Talks';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  duration: string;
  thumbnailUrl: string;
  youtubeId?: string;
  videoUrl?: string;
  transcriptTarget: string;
  transcriptVi: string;
}

export const LISTENING_VIDEO_CLIPS: ListeningVideoClip[] = [
  // Daily Conversations
  {
    id: 'vid_conv_01',
    titleVi: 'Friends & Family - Bạn bè và gia đình',
    titleTarget: 'Everyday Conversation: Friends & Family Reunion',
    category: 'Daily Conversations',
    level: 'A2',
    duration: '3 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop',
    youtubeId: '1fQY1xQ_mU8',
    transcriptTarget: 'Hello! It is so wonderful to see you again after such a long time. How is your family doing in New York?',
    transcriptVi: 'Xin chào! Thật tuyệt vời được gặp lại bạn sau một thời gian dài. Gia đình bạn dạo này ở New York thế nào?'
  },
  {
    id: 'vid_conv_02',
    titleVi: 'Giving Directions - Chỉ đường thực tế cho người mới',
    titleTarget: 'Practical English: Asking and Giving Directions',
    category: 'Daily Conversations',
    level: 'A2',
    duration: '2 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524850011238-e37235872fdc?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'bgfdqVmVjfk',
    transcriptTarget: 'Excuse me, could you tell me how to get to the central subway station? Go straight for two blocks then turn right.',
    transcriptVi: 'Xin lỗi, bạn có thể chỉ giúp tôi đường đến ga tàu điện ngầm trung tâm không? Hãy đi thẳng hai ngã tư rồi rẽ phải.'
  },
  {
    id: 'vid_conv_03',
    titleVi: 'Ordering Food at a Restaurant - Gọi món nhà hàng',
    titleTarget: 'Dining Out: Ordering Meals & Asking Recommendations',
    category: 'Daily Conversations',
    level: 'B1',
    duration: '4 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'L7A-bdrY7rA',
    transcriptTarget: 'Good evening! I would like to order a medium-rare ribeye steak served with roasted garlic vegetables.',
    transcriptVi: 'Chào buổi tối! Tôi muốn gọi món bít tết sườn nướng vừa ăn kèm rau củ nướng tỏi.'
  },
  {
    id: 'vid_conv_04',
    titleVi: 'Job Interview Dialogue - Phỏng vấn xin việc công sở',
    titleTarget: 'Professional Job Interview: Strengths & Experience',
    category: 'Daily Conversations',
    level: 'B2',
    duration: '5 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    youtubeId: '1mHjMNZZvE0',
    transcriptTarget: 'My greatest strength is my meticulous attention to detail and ability to remain calm under pressure.',
    transcriptVi: 'Điểm mạnh lớn nhất của tôi là sự tỉ mỉ đến từng chi tiết và khả năng giữ bình tĩnh dưới áp lực.'
  },
  {
    id: 'vid_conv_05',
    titleVi: 'Hotel Room Booking - Đặt phòng khách sạn du lịch',
    titleTarget: 'Hotel Reception: Checking In & Special Requests',
    category: 'Daily Conversations',
    level: 'A2',
    duration: '3 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    youtubeId: '7u0j-iS45n0',
    transcriptTarget: 'Hi, I have a reservation under the name of Smith for three nights with ocean view.',
    transcriptVi: 'Xin chào, tôi có đặt phòng trước dưới tên Smith cho 3 đêm hướng nhìn ra biển.'
  },

  // Cartoon
  {
    id: 'vid_cart_01',
    titleVi: 'Funny Scene From Crayon Shin-Chan - Cảnh hài hước hoạt hình',
    titleTarget: 'Shin-Chan Funny Conversation with Mom',
    category: 'Cartoon',
    level: 'A1',
    duration: '2 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'pWw-nC27FjU',
    transcriptTarget: 'Hey Mom! Look at what I drew today! It is a giant green frog wearing a superhero mask!',
    transcriptVi: 'Này Mẹ! Xem con đã vẽ gì hôm nay này! Đó là một chú ếch xanh khổng lồ đeo mặt nạ siêu nhân!'
  },
  {
    id: 'vid_cart_02',
    titleVi: 'The Three Little Pigs - Story - Ba chú heo con',
    titleTarget: 'The Three Little Pigs Classic Fairy Tale',
    category: 'Cartoon',
    level: 'A1',
    duration: '4 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'Qn6wJd0W7zY',
    transcriptTarget: 'Once upon a time, there were three little pigs who decided to build their houses in the green forest.',
    transcriptVi: 'Ngày xửa ngày xưa, có ba chú heo con quyết định tự xây nhà cho mình trong khu rừng xanh.'
  },
  {
    id: 'vid_cart_03',
    titleVi: 'Finding Nemo Scene - Cảnh phim Đi Tìm Nemo',
    titleTarget: 'Finding Nemo: Just Keep Swimming Dialogue',
    category: 'Cartoon',
    level: 'A2',
    duration: '3 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    youtubeId: '95h6G4974O8',
    transcriptTarget: 'When life gets you down, do you know what you gotta do? Just keep swimming!',
    transcriptVi: 'Khi cuộc sống làm bạn thất vọng, bạn có biết bạn phải làm gì không? Chỉ cần tiếp tục bơi thôi!'
  },
  {
    id: 'vid_cart_04',
    titleVi: 'Zootopia Judy Hopps Speech - Trích đoạn Zootopia',
    titleTarget: 'Zootopia: Anyone Can Be Anything Inspiration',
    category: 'Cartoon',
    level: 'B1',
    duration: '3 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'jWM0ct-OLsM',
    transcriptTarget: 'No matter what kind of person you are, change starts with you. Anyone can be anything.',
    transcriptVi: 'Bất kể bạn là ai, sự thay đổi bắt đầu từ chính bạn. Bất kỳ ai cũng có thể trở thành bất kỳ điều gì.'
  },

  // Movie short clip
  {
    id: 'vid_movie_01',
    titleVi: 'The Pursuit of Happyness - Màn thoại truyền cảm hứng',
    titleTarget: 'The Pursuit of Happyness: Never Let Anyone Tell You You Can’t',
    category: 'Movie short clip',
    level: 'B2',
    duration: '3 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'd6wRkzCW5qI',
    transcriptTarget: 'Don’t ever let somebody tell you you can’t do something, not even me. You got a dream, you gotta protect it.',
    transcriptVi: 'Đừng bao giờ để ai đó nói rằng con không thể làm điều gì đó, kể cả cha. Con có một giấc mơ, con phải bảo vệ nó.'
  },
  {
    id: 'vid_movie_02',
    titleVi: 'Forrest Gump Bench Scene - Hộp kẹo sô-cô-la cuộc đời',
    titleTarget: 'Forrest Gump: Life is Like a Box of Chocolates',
    category: 'Movie short clip',
    level: 'B1',
    duration: '2 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518676599625-5d4715b94874?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'uPIEn0M8mDA',
    transcriptTarget: 'My mama always said life was like a box of chocolates. You never know what you’re gonna get.',
    transcriptVi: 'Mẹ tôi luôn nói cuộc sống giống như một hộp sô-cô-la. Bạn không bao giờ biết mình sẽ nhận được gì.'
  },
  {
    id: 'vid_movie_03',
    titleVi: 'Interstellar Docking Scene - Cảnh nghẹt thở Interstellar',
    titleTarget: 'Interstellar: Cooper Docking Speech & Dialogue',
    category: 'Movie short clip',
    level: 'C1',
    duration: '4 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'm3bvW2204w0',
    transcriptTarget: 'It’s not possible. No, it’s necessary. Initiate spin docking alignment now!',
    transcriptVi: 'Điều đó là không thể. Không, điều đó là bắt buộc. Khởi động căn chỉnh tự xoay ngay lập tức!'
  },

  // TED Talks
  {
    id: 'vid_ted_01',
    titleVi: 'Steve Jobs Stanford Speech - Diễn văn Steve Jobs',
    titleTarget: 'Steve Jobs: Stay Hungry, Stay Foolish Commencement Speech',
    category: 'TED Talks',
    level: 'C1',
    duration: '5 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'Hd_ptbiPoXM',
    transcriptTarget: 'Your time is limited, so don’t waste it living someone else’s life. Stay hungry, stay foolish.',
    transcriptVi: 'Thời gian của bạn có hạn, vì vậy đừng lãng phí nó để sống cuộc đời của người khác. Hãy luôn khao khát, hãy luôn dại khờ.'
  },
  {
    id: 'vid_ted_02',
    titleVi: 'Elon Musk Vision for Future - Tầm nhìn Elon Musk',
    titleTarget: 'Elon Musk: The Future of Renewable Energy & Mars',
    category: 'TED Talks',
    level: 'C1',
    duration: '6 phút',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop',
    youtubeId: 'H14bBuluwB8',
    transcriptTarget: 'I think it’s important to have a future that is inspiring and appealing. You want to be excited about what’s going to happen tomorrow.',
    transcriptVi: 'Tôi nghĩ điều quan trọng là phải có một tương lai truyền cảm hứng và lôi cuốn. Bạn muốn cảm thấy hào hứng về những gì sắp xảy ra vào ngày mai.'
  }
];

export default function CategorizedVideoListeningPage() {
  const { speak } = useTextToSpeech();
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<ListeningVideoClip>(LISTENING_VIDEO_CLIPS[0]);
  const [showSubtitles, setShowSubtitles] = useState(true);

  const filteredVideos = LISTENING_VIDEO_CLIPS.filter(v => {
    return selectedCategory === 'all' || v.category === selectedCategory;
  });

  return (
    <PageShell
      title="Luyện Nghe Video Theo Danh Mục (Categorized Listening Video Hub)"
      description="Luyện nghe video chia theo từng chủ đề: Giao tiếp hàng ngày, Hoạt hình, Trích đoạn Phim ngắn, TED Talks"
      icon={<Film size={20} className="text-sky-400" />}
    >
      <div className="max-w-4xl mx-auto space-y-6 font-mono">
        {/* Category Selector Tabs */}
        <div className="glass-card p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-950 rounded-2xl shadow-sm">
          <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">Danh Mục Video:</span>
          {(['all', 'Daily Conversations', 'Cartoon', 'Movie short clip', 'TED Talks'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white dark:text-slate-950 shadow-md shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Tất Cả Danh Mục' : cat}
            </button>
          ))}
        </div>

        {/* Selected Video Player & Interactive Audio Controls */}
        <div className="glass-card p-6 border-2 border-sky-500/30 bg-white dark:bg-slate-950 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase"><CustomEmoji name="film-clip" size={13} /> {selectedVideo.category} • {selectedVideo.level}</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedVideo.titleVi}</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 text-xs font-bold">⏱️ {selectedVideo.duration}</span>
          </div>

          {/* Guaranteed Native Video Stream Container (Direct Open Video Stream + Audio Tutor) */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex flex-col items-center justify-center">
            <video
              key={selectedVideo.id}
              src={selectedVideo.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              poster={selectedVideo.thumbnailUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            <div className="w-full bg-slate-900 dark:bg-slate-950 p-3 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-sky-300 font-bold flex items-center gap-2">
                <Play size={14} /> Trợ Lý Phát Âm Bản Xứ AI:
              </span>
              <button
                onClick={() => speak(selectedVideo.transcriptTarget, targetLanguage)}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/30"
              >
                <Volume2 size={14} /> Nghe Giọng Đọc Phụ Đề AI
              </button>
            </div>
          </div>

          {/* Subtitles Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-400 font-bold flex items-center gap-1.5">
                <Sparkles size={14} /> Phụ Đề Luyện Nghe Song Ngữ:
              </span>
              <button onClick={() => setShowSubtitles(!showSubtitles)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
                {showSubtitles ? 'Ẩn Phụ Đề' : 'Hiện Phụ Đề'}
              </button>
            </div>

            {showSubtitles && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-sm font-bold text-white">"{selectedVideo.transcriptTarget}"</p>
                <p className="text-xs text-slate-400 italic">"{selectedVideo.transcriptVi}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Clips List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Film size={16} className="text-sky-400" />
              <span>DANH SÁCH BÀI LUYỆN NGHE VIDEO CHUẨN THỰC TẾ</span>
            </h3>
            <span className="text-xs text-sky-400 font-bold">Tổng số: {filteredVideos.length} video</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredVideos.map(vid => (
              <div
                key={vid.id}
                onClick={() => {
                  setSelectedVideo(vid);
                  toast(`🎬 Đã mở video: ${vid.titleVi}`, 'info');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                  selectedVideo.id === vid.id
                    ? 'bg-sky-500/10 border-sky-500 shadow-lg shadow-sky-500/20'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <img src={vid.thumbnailUrl} alt={vid.titleVi} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase">{vid.category} • {vid.level}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{vid.titleVi}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">⏱️ {vid.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
