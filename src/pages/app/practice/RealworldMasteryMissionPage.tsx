import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Mic, Volume2, CheckCircle2, ChevronRight, Bot, Trophy, Radio } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAppStore } from '../../../stores/appStore';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { useLearningStore } from '../../../stores/learningStore';
import { toast } from '../../../components/ui/Toast';

type Step = 'chunking' | 'scenario' | 'ai_simulation' | 'completed';

export default function RealworldMasteryMissionPage() {
  const targetLanguage = useAppStore((s: any) => s.currentLanguage);
  const addXP = useLearningStore((s: any) => s.addXP);
  const { speak } = useTextToSpeech();

  const [dayNumber, setDayNumber] = useState(15);
  const [currentStep, setCurrentStep] = useState<Step>('chunking');
  const [chunkIndex, setChunkIndex] = useState(0);
  const [userSpeech, setUserSpeech] = useState('');
  const [conversationLogs, setConversationLogs] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);

  // Sample 90-Day Masterpiece Mission Data
  const currentMission = {
    day: dayNumber,
    titleVi: 'Nhiệm Vụ 15: Gọi Món & Yêu Cầu Tùy Chỉnh Tại Quán Ăn Bản Xứ',
    titleEn: 'Day 15: Ordering Food & Customizing Your Order at a Local Diner',
    situationVi: 'Bạn đang ở một quán ăn tại trung tâm thành phố. Hãy gọi món ăn chính và yêu cầu bớt cay/ít muối bằng tiếng bản ngữ.',
    chunks: [
      { phrase: 'I would like to order...', vi: 'Tôi muốn gọi món...', phonetic: '/aɪ wʊd laɪk tuː ˈɔːdər/' },
      { phrase: 'Could you make it less spicy?', vi: 'Có thể làm bớt cay giúp tôi được không?', phonetic: '/kʊd juː meɪk ɪt lɛs ˈspaɪsi/' },
      { phrase: 'Can I have the bill, please?', vi: 'Cho tôi xin hóa đơn thanh toán?', phonetic: '/kæn aɪ hæv ðə bɪl pliːz/' },
    ],
    aiPrompts: [
      'Welcome to our diner! What would you like to order today?',
      'Sure! Do you have any dietary restrictions or preferences?',
      'Got it! Your order will be ready in 10 minutes. Will that be cash or card?'
    ]
  };

  const handleNextChunk = () => {
    if (chunkIndex < currentMission.chunks.length - 1) {
      setChunkIndex(prev => prev + 1);
    } else {
      setCurrentStep('scenario');
    }
  };

  const handleStartSim = () => {
    setCurrentStep('ai_simulation');
    const firstMsg = currentMission.aiPrompts[0];
    setConversationLogs([{ sender: 'ai', text: firstMsg }]);
    speak(firstMsg, targetLanguage);
  };

  const handleUserReply = (replyText: string) => {
    if (!replyText.trim()) return;
    const newLogs = [...conversationLogs, { sender: 'user' as const, text: replyText }];
    setConversationLogs(newLogs);
    setUserSpeech('');

    // Simulate AI response
    setTimeout(() => {
      const nextAiIdx = Math.min(newLogs.filter(l => l.sender === 'user').length, currentMission.aiPrompts.length - 1);
      const nextMsg = currentMission.aiPrompts[nextAiIdx] || 'Excellent job! You successfully completed this scenario!';
      
      setConversationLogs(prev => [...prev, { sender: 'ai', text: nextMsg }]);
      speak(nextMsg, targetLanguage);

      if (nextAiIdx >= currentMission.aiPrompts.length - 1) {
        setTimeout(() => {
          setCurrentStep('completed');
          addXP(150);
          toast('🎉 HOÀN THÀNH NHIỆM VỤ SINH TỒN +150 XP!', 'success');
        }, 3000);
      }
    }, 1200);
  };

  return (
    <PageShell
      title="Đấu Trường 90 Ngày Phản Xạ Thực Chiến AI (90-Day Real-World AI Mastery)"
      description="Siêu Siêu Phẩm: Cụm Từ Bản Xứ + Nhiệm Vụ Sinh Tồn + Đóng Vai Giọng Nói AI Thời Gian Thực"
      icon={<Target size={20} className="text-emerald-400" />}
    >
      <div className="max-w-3xl mx-auto space-y-6 font-mono">
        {/* Mission Progress Bar */}
        <div className="glass-card p-5 border-2 border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-lg border border-emerald-500/40">
              #{dayNumber}
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">[ SIÊU PHẨM 90 NGÀY THÀNH THẠO ]</span>
              <h2 className="text-white font-bold text-base truncate">{currentMission.titleVi}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCurrentStep('chunking')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                currentStep === 'chunking' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              1. Cụm Từ
            </button>
            <button
              onClick={() => setCurrentStep('scenario')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                currentStep === 'scenario' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              2. Kịch Bản
            </button>
            <button
              onClick={() => handleStartSim()}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                currentStep === 'ai_simulation' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              3. AI Voice
            </button>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            Thực Chiến 5 Phút
          </span>
        </div>

        {/* STEP 1: CHUNKING LEARNING */}
        {currentStep === 'chunking' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-2 border-emerald-500/30 space-y-6 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                BƯỚC 1/3: NẮM VỮNG 3 SIÊU CỤM TỪ (CHUNK {chunkIndex + 1}/3)
              </span>
              <span className="text-xs text-slate-400">Tự động phát âm bản xứ</span>
            </div>

            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <span className="text-2xl font-black text-emerald-300 tracking-wide">{currentMission.chunks[chunkIndex]?.phrase}</span>
                <button
                  onClick={() => speak(currentMission.chunks[chunkIndex]?.phrase, targetLanguage)}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Volume2 size={20} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-300 font-sans font-medium">Bản dịch: <strong className="text-white">{currentMission.chunks[chunkIndex]?.vi}</strong></p>
                <p className="text-xs text-emerald-400 italic">Phiên âm: "{currentMission.chunks[chunkIndex]?.phonetic}"</p>
              </div>
            </div>

            <button
              onClick={handleNextChunk}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <span>{chunkIndex < currentMission.chunks.length - 1 ? 'Tiếp Tục Cụm Từ Tiếp Theo' : 'Chuyển Sang Đóng Vai Tình Huống AI →'}</span>
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: SCENARIO BRIEFING */}
        {currentStep === 'scenario' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-2 border-emerald-500/30 space-y-6 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                BƯỚC 2/3: TÌNH HUỐNG THỰC TẾ & MỤC TIÊU ĐÓNG VAI
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-white font-bold text-lg">{currentMission.titleVi}</h3>
              <p className="text-slate-300 text-sm font-sans leading-relaxed">{currentMission.situationVi}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5"><Target size={14} /> MỤC TIÊU BẠN CẦN ĐẠT ĐƯỢC TRONG 5 PHÚT ĐÓNG VAI AI:</p>
              <p>• Dùng cụm từ đã học để hoàn tất việc gọi món ăn.</p>
              <p>• Yêu cầu điều chỉnh gia vị (bớt cay / ít muối).</p>
              <p>• Xác nhận phương thức thanh toán.</p>
            </div>

            <button
              onClick={handleStartSim}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
            >
              <Mic size={20} />
              <span>BẮT ĐẦU ĐÓNG VAI VỚI AI TUTOR</span>
            </button>
          </motion.div>
        )}

        {/* STEP 3: LIVE AI VOICE SIMULATION */}
        {currentStep === 'ai_simulation' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-slate-800 space-y-4 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold"><Bot size={18} /></div>
                <span className="text-white font-bold text-sm">Éch AI Native Tutor (Giọng Nói Bản Xứ)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold animate-pulse flex items-center gap-1">
                <Radio size={12} /> AI LIVE STREAMING
              </span>
            </div>

            {/* Conversation Chatbox */}
            <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hide-scrollbar font-sans">
              {conversationLogs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {log.sender === 'ai' && <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0"><Bot size={14} /></div>}
                  <div className={`p-3 rounded-2xl max-w-md text-sm ${log.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            {/* User Input & Voice Action */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={userSpeech}
                onChange={(e) => setUserSpeech(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserReply(userSpeech)}
                placeholder="Nhập hoặc bấm Micro để nói đáp án bằng tiếng bản ngữ..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleUserReply(userSpeech || currentMission.chunks[0].phrase)}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
              >
                Gửi
              </button>
            </div>
          </motion.div>
        )}

        {/* COMPLETED CELEBRATION */}
        {currentStep === 'completed' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 border-2 border-emerald-500/50 text-center space-y-5 bg-slate-950">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl border border-emerald-500/40">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">HOÀN THÀNH NHIỆM VỤ THỰC CHIẾN #{dayNumber}!</h2>
            <p className="text-slate-300 text-sm font-sans max-w-md mx-auto">
              Bạn đã làm chủ 3 Siêu Cụm Từ Bản Xứ và hoàn tất phản xạ giọng nói trực tiếp với Éch AI Tutor!
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 inline-flex items-center gap-2 font-mono text-emerald-400 font-bold text-sm">
              <Trophy size={18} /> ĐÃ THÊM +150 XP VÀO HỒ SƠ THÀNH THẠO
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCurrentStep('chunking');
                  setChunkIndex(0);
                  setDayNumber(prev => prev + 1);
                }}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl cursor-pointer"
              >
                SANG NHIỆM VỤ NGÀY #{dayNumber + 1}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
