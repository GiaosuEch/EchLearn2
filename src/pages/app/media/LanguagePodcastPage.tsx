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
      title="Podcast ngôn ngữ"
      description="Luyện nghe chủ động với podcast bản xứ và phụ đề song ngữ."
      icon={<Headphones size={20} className="text-emerald-600" />}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Active Player Card */}
        <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img
              src={selectedEpisode.coverImage}
              alt={selectedEpisode.title}
              className="h-28 w-28 rounded-2xl border-2 border-emerald-200 object-cover shadow-sm sm:h-36 sm:w-36 dark:border-emerald-800"
            />
            <div className="min-w-0 flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Headphones size={14} /> PODCAST THỰC CHIẾN
                </span>
                <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                  Trình độ: {selectedEpisode.level}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Clock size={12} /> {selectedEpisode.duration}</span>
              </div>
              <h2 className="min-w-0 break-words text-xl font-black text-slate-950 dark:text-white md:text-2xl">{selectedEpisode.title}</h2>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Tác giả: {selectedEpisode.host}</p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selectedEpisode.descriptionVi}</p>
            </div>
          </div>

          {/* Audio Player Engine */}
          <audio
            ref={audioRef}
            src={selectedEpisode.audioUrl}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-500"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
              </button>
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isPlaying ? <><Volume2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Đang phát Audio...</> : <><VolumeX size={14} className="text-slate-500" /> Tạm Dừng Audio</>}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Tốc độ hiện tại: {playbackSpeed}x</span>
              </div>
            </div>

            {/* Speed Selector Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">Tốc độ:</span>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    playbackSpeed === speed
                      ? 'bg-emerald-600 text-white font-extrabold shadow'
                      : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <span>Xem Youtube gốc</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Transcript Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <BookOpen size={16} /> PHỤ ĐỀ SONG NGỮ SẮC NÉT (BILINGUAL TRANSCRIPT)
              </span>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300"
              >
                {showTranscript ? 'Ẩn Phụ Đề' : 'Hiện Phụ Đề'}
              </button>
            </div>

            {showTranscript && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">BẢN TIẾNG GỐC:</span>
                  <p className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">{selectedEpisode.transcriptTarget}</p>
                </div>
                <div className="space-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">BẢN DỊCH TIẾNG VIỆT:</span>
                  <p className="text-xs italic leading-relaxed text-slate-700 dark:text-slate-300">{selectedEpisode.transcriptVi}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Podcast Episode List Grid */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
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
                    ? 'border-emerald-400 bg-emerald-50 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <img src={ep.coverImage} alt={ep.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="flex-1 space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">{ep.host}</span>
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
