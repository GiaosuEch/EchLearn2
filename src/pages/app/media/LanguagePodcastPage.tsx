import { useMemo, useState } from 'react';
import { BookOpen, Headphones, Info, Pause, Play } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAppStore } from '../../../stores/appStore';

const LISTENING_CLIPS = [
  {
    id: 'en-order', languageId: 'en', title: 'Ordering lunch',
    target: 'Hi. I would like vegetable noodles, please. Could you make them less spicy?',
    vi: 'Xin chào. Tôi muốn gọi mì rau củ. Bạn có thể làm món bớt cay không?',
    task: 'Nghe và tìm hai việc người nói yêu cầu.',
  },
  {
    id: 'ja-repeat', languageId: 'ja', title: 'Asking someone to repeat',
    target: 'すみません。もう一度、ゆっくり言ってください。',
    vi: 'Xin lỗi. Vui lòng nói lại một lần nữa, chậm hơn.',
    task: 'Nghe và xác định người nói cần đối phương làm gì.',
  },
  {
    id: 'zh-direction', languageId: 'zh', title: 'Asking for directions',
    target: '请问，地铁站怎么走？可以再说一遍吗？',
    vi: 'Xin hỏi, đi đến ga tàu điện ngầm thế nào? Bạn có thể nói lại không?',
    task: 'Nghe và tìm địa điểm người nói đang hỏi.',
  },
  {
    id: 'th-help', languageId: 'th', title: 'Asking for help',
    target: 'ขอโทษค่ะ ช่วยฉันหน่อยได้ไหมคะ',
    vi: 'Xin lỗi, bạn có thể giúp tôi một chút được không?',
    task: 'Nghe và xác định đây là lời xin lỗi hay lời nhờ giúp đỡ.',
  },
] as const;

export default function LanguagePodcastPage() {
  const currentLanguage = useAppStore((state) => state.currentLanguage).split('-')[0];
  const clips = useMemo(() => LISTENING_CLIPS.filter((clip) => clip.languageId === currentLanguage), [currentLanguage]);
  const availableClips = clips.length > 0 ? clips : LISTENING_CLIPS.filter((clip) => clip.languageId === 'en');
  const [selectedId, setSelectedId] = useState(availableClips[0].id);
  const [playing, setPlaying] = useState(false);
  const [speechNote, setSpeechNote] = useState('');
  const selected = availableClips.find((clip) => clip.id === selectedId) ?? availableClips[0];

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setSpeechNote('Trình duyệt này không hỗ trợ giọng đọc. Bạn vẫn có thể đọc transcript và làm nhiệm vụ.');
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(selected.target);
    utterance.lang = selected.languageId;
    utterance.rate = 0.85;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setSpeechNote('Không phát được giọng đọc. Hãy đọc transcript và tiếp tục; bài học vẫn dùng được.');
    };
    window.speechSynthesis.speak(utterance);
    setSpeechNote('Đang dùng giọng tổng hợp có sẵn của trình duyệt, không phải audio người bản ngữ.');
    setPlaying(true);
  };

  return (
    <PageShell title="Luyện nghe câu ngắn" description="Nghe bằng công cụ trình duyệt, hiểu ý rồi đối chiếu transcript." icon={<Headphones size={20} />}>
      <main className="mx-auto max-w-4xl space-y-5 pb-20">
        <section role="note" className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
          <Info className="mt-0.5 shrink-0" size={20} />
          <p>Nội dung dưới đây do EchLearn biên soạn. Giọng đọc, nếu hoạt động, do trình duyệt tổng hợp. Không gắn tên podcast, host hoặc nguồn ghi âm bên ngoài khi chưa có quyền sử dụng.</p>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Chọn bài nghe">
          {availableClips.map((clip) => (
            <button key={clip.id} type="button" aria-pressed={selected.id === clip.id} onClick={() => { window.speechSynthesis?.cancel(); setPlaying(false); setSelectedId(clip.id); setSpeechNote(''); }} className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-bold ${selected.id === clip.id ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}>{clip.title}</button>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Mục tiêu nghe</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{selected.task}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Nghe một hoặc hai lần trước khi mở phần đối chiếu.</p>
          <button type="button" onClick={toggleSpeech} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">{playing ? <Pause size={19} /> : <Play size={19} />} {playing ? 'Dừng giọng đọc' : 'Nghe bằng trình duyệt'}</button>
          {speechNote && <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{speechNote}</p>}
        </section>

        <details className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <summary className="min-h-11 cursor-pointer font-bold text-slate-950 dark:text-white">Mở transcript để đối chiếu</summary>
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <div><p className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300"><BookOpen size={15} /> Câu mục tiêu</p><p className="mt-2 text-lg font-bold leading-7 text-slate-950 dark:text-white">{selected.target}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Nghĩa tiếng Việt</p><p className="mt-2 leading-7 text-slate-700 dark:text-slate-300">{selected.vi}</p></div>
            <p className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">Bước tiếp theo: đóng transcript, nghe lại và nói hoặc viết một câu tương tự theo tình huống của bạn.</p>
          </div>
        </details>
      </main>
    </PageShell>
  );
}
