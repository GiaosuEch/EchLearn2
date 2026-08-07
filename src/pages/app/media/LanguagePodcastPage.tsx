import { useState, useRef } from 'react';
import { Headphones, Play, Pause, Sparkles, BookOpen, ExternalLink, Clock, Volume2, VolumeX } from 'lucide-react';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';

interface PodcastEpisode {
  id: string;
  title: string;
  host: string;
  level: string;
  duration: string;
  languageId: string;
  audioUrl: string;
  coverImage: string;
  descriptionVi: string;
  transcriptVi: string;
  transcriptTarget: string;
  youtubeUrl: string;
}

const PODCAST_DATABASE: PodcastEpisode[] = [
  {
    id: 'pod_en_6minute',
    title: '6 Minute English: The Science of Habit Building',
    host: 'BBC Learning English',
    level: 'B1-B2',
    duration: '06:15',
    languageId: 'en',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
    descriptionVi: 'Học cách xây dựng thói quen học tập bền vững mỗi ngày cùng các chuyên gia tâm lý học BBC.',
    transcriptTarget: "Welcome to 6 Minute English from BBC Learning English. Today we are discussing how small daily habits compound into massive long-term success.",
    transcriptVi: "Chào mừng bạn đến với 6 Minute English của BBC. Hôm nay chúng ta sẽ thảo luận về việc thói quen nhỏ hàng ngày giúp tạo nên thành công rực rỡ như thế nào.",
    youtubeUrl: 'https://www.youtube.com/results?search_query=6+minute+english+bbc'
  },
  {
    id: 'pod_ja_nihongo',
    title: 'Nihongo con Teppei: 日本の日常会話と文化',
    host: 'Teppei Sensei',
    level: 'N3-N2',
    duration: '08:40',
    languageId: 'ja',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    descriptionVi: 'Luyện nghe tiếng Nhật thực tế với phát âm chuẩn Tokyo về chủ đề văn hóa & đời sống.',
    transcriptTarget: "皆さん、こんにちは！日本語コンテッペイへようこそ。今日も楽しく日本語を勉強しましょう！",
    transcriptVi: "Xin chào mọi người! Chào mừng đến với Nihongo con Teppei. Hôm nay chúng ta cùng học tiếng Nhật thật vui nhé!",
    youtubeUrl: 'https://www.youtube.com/results?search_query=nihongo+con+teppei'
  },
  {
    id: 'pod_zh_growing',
    title: 'Chinesepod: 商务汉语与社交礼仪',
    host: 'Teacher Lin & David',
    level: 'HSK 4-5',
    duration: '07:20',
    languageId: 'zh',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a14b51.mp3',
    coverImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800&auto=format&fit=crop',
    descriptionVi: 'Tiếng Trung giao tiếp doanh nghiệp, đàm phán hợp đồng và ứng xử tại bữa tiệc đối tác.',
    transcriptTarget: "大家好！欢迎收听中文播客。今天我们要讨论商务宴会上的社交礼仪。",
    transcriptVi: "Chào mọi người! Chào mừng lắng nghe Podcast tiếng Trung. Hôm nay chúng ta thảo luận về quy tắc ứng xử tiệc doanh nghiệp.",
    youtubeUrl: 'https://www.youtube.com/results?search_query=chinese+pod+business'
  },
  {
    id: 'pod_th_thai101',
    title: 'Thai Pod 101: การเดินทางและอาหารไทย',
    host: 'Kru Khwan',
    level: 'Sơ - Trung Cấp',
    duration: '05:50',
    languageId: 'th',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_51745778b7.mp3',
    coverImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop',
    descriptionVi: 'Học hội thoại tiếng Thái thực tế khi du lịch Bangkok & thưởng thức ẩm thực đường phố.',
    transcriptTarget: "สวัสดีค่ะ ยินดีต้อนรับสู่ไทยพอด! วันนี้เราจะไปเที่ยวตลาดน้ำและสั่งอาหารไทยอร่อยๆ กันค่ะ",
    transcriptVi: "Xin chào! Chào mừng đến với ThaiPod! Hôm nay chúng ta cùng đi chợ nổi và gọi món ăn Thái ngon nhé.",
    youtubeUrl: 'https://www.youtube.com/results?search_query=thai+pod+101'
  }
];

export default function LanguagePodcastPage() {
  const { speak } = useTextToSpeech();
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode>(PODCAST_DATABASE[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    // Speak using AI Speech Audio Engine in target podcast language
    speak(selectedEpisode.transcriptTarget, selectedEpisode.languageId, playbackSpeed);

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.warn('External MP3 constrained, speech audio active', e);
            setIsPlaying(true);
          });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    toast(`Đã chỉnh tốc độ phát: ${speed}x`, 'info');
  };

  return (
    <PageShell
      title="Trung Tâm Podcast Ngôn Ngữ Thực Chiến (Language Podcast Hub)"
      description="Luyện nghe chủ động cùng audio podcast bản xứ chuẩn giọng 100% kèm phụ đề song ngữ"
      icon={<Headphones size={20} className="text-purple-400" />}
    >
      <div className="max-w-4xl mx-auto space-y-6 font-mono">
        {/* Active Player Card */}
        <div className="glass-card p-6 border-2 border-purple-500/30 bg-white dark:bg-slate-950 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img
              src={selectedEpisode.coverImage}
              alt={selectedEpisode.title}
              className="w-36 h-36 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
            />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                  <Headphones size={14} /> PODCAST THỰC CHIẾN
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[11px] font-bold">
                  Trình độ: {selectedEpisode.level}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> {selectedEpisode.duration}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">{selectedEpisode.title}</h2>
              <p className="text-xs text-purple-400 font-bold">Tác giả: {selectedEpisode.host}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedEpisode.descriptionVi}</p>
            </div>
          </div>

          {/* Audio Player Engine */}
          <audio
            ref={audioRef}
            src={selectedEpisode.audioUrl}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center justify-center shadow-lg shadow-purple-600/40 cursor-pointer"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
              </button>
              <div>
                <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  {isPlaying ? <><Volume2 size={14} className="text-purple-400" /> Đang phát Audio...</> : <><VolumeX size={14} className="text-slate-400" /> Tạm Dừng Audio</>}
                </span>
                <span className="text-[10px] text-slate-500">Tốc độ hiện tại: {playbackSpeed}x</span>
              </div>
            </div>

            {/* Speed Selector Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Tốc độ:</span>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    playbackSpeed === speed
                      ? 'bg-purple-500 text-slate-950 font-extrabold shadow'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <a
              href={selectedEpisode.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem Youtube gốc</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Transcript Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-purple-400 font-bold flex items-center gap-2">
                <BookOpen size={16} /> PHỤ ĐỀ SONG NGỮ SẮC NÉT (BILINGUAL TRANSCRIPT)
              </span>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                {showTranscript ? 'Ẩn Phụ Đề' : 'Hiện Phụ Đề'}
              </button>
            </div>

            {showTranscript && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">BẢN TIẾNG GỐC:</span>
                  <p className="text-sm font-bold text-white leading-relaxed">{selectedEpisode.transcriptTarget}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">BẢN DỊCH TIẾNG VIỆT:</span>
                  <p className="text-xs text-slate-300 italic leading-relaxed">{selectedEpisode.transcriptVi}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Podcast Episode List Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>DANH SÁCH TẬP PODCAST BẢN XỨ HAY NHẤT</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {PODCAST_DATABASE.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  setSelectedEpisode(ep);
                  setIsPlaying(false);
                  toast(`Đã chọn Podcast: ${ep.title}`, 'success');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                  selectedEpisode.id === ep.id
                    ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <img src={ep.coverImage} alt={ep.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="flex-1 space-y-1 overflow-hidden">
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">{ep.host}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{ep.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Trình độ: {ep.level}</span>
                    <span>•</span>
                    <span>{ep.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
