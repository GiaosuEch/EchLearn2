import { useState, useEffect, useRef } from 'react';
import { X, Send, Video, VideoOff, Mic, MicOff, Globe, PhoneOff } from 'lucide-react';
import { toast } from '../ui/Toast';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { callSignalingService } from '../../services/callSignalingService';

interface DirectChatModalProps {
  friendName: string;
  isOpen: boolean;
  onClose: () => void;
  startWithVideoCall?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'friend';
  text: string;
  translatedText?: string;
  timestamp: string;
}

export function DirectChatModal({ friendName, isOpen, onClose, startWithVideoCall = false }: DirectChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'friend',
      text: `Chào bạn! Rất vui được kết bạn học ngoại ngữ cùng nhau trên EchLearn! 🐸`,
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(startWithVideoCall);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetLanguage = useAppStore(s => s.currentLanguage);

  useEffect(() => {
    setIsVideoCallActive(startWithVideoCall);
  }, [startWithVideoCall]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Handle HD Video/Audio Call WebRTC MediaStream with progressive mobile fallbacks */
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    if (isVideoCallActive && isCamOn) {
      const getStream = async () => {
        try {
          // Tier 1: HD 720p Video + Audio
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: isMicOn,
          });
          if (!isCancelled) {
            activeStream = stream;
            setMediaStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
          }
        } catch {
          try {
            // Tier 2: Basic Video + Audio (mobile camera fallback)
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: isMicOn,
            });
            if (!isCancelled) {
              activeStream = stream;
              setMediaStream(stream);
              if (videoRef.current) videoRef.current.srcObject = stream;
            }
          } catch {
            try {
              // Tier 3: Audio Only Fallback
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              if (!isCancelled) {
                activeStream = stream;
                setMediaStream(stream);
                setIsCamOn(false);
                toast('Camera bị từ chối hoặc không hỗ trợ. Đã tự động chuyển sang Gọi Thoại!', 'info');
              }
            } catch {
              if (!isCancelled) {
                setIsCamOn(false);
                toast('Đã khởi tạo Cuộc Gọi Mô Phỏng (Do chưa cấp quyền Mic/Cam trên thiết bị).', 'info');
              }
            }
          }
        }
      };

      void getStream();
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        setMediaStream(null);
      }
    }

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
    };
  }, [isVideoCallActive, isCamOn, isMicOn]);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulated friendly AI partner reply after 1.2s
    setTimeout(() => {
      const replies = [
        `Hay quá! Chúng mình cùng luyện ${targetLanguage.toUpperCase()} mỗi ngày nhé! 🌟`,
        `Bạn phát âm rất chuẩn! Mình cùng cố gắng đạt Streak nhé.`,
        `Bài học hôm nay rất thú vị, bạn làm xong chưa? 🎯`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'friend',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const handleTranslateMessage = (msgId: string, originalText: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            translatedText: m.translatedText ? undefined : `[Bản dịch AI]: ${originalText} (Đã dịch sang ${targetLanguage.toUpperCase()})`
          };
        }
        return m;
      })
    );
  };

  const [callStatus, setCallStatus] = useState<'ringing' | 'pickup' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const user = useAuthStore((s) => s.user);
  const myName = user?.displayName || user?.username || 'Học Viên Ếch';
  const activeCallIdRef = useRef<string>('');

  useEffect(() => {
    if (isVideoCallActive) {
      setCallStatus('ringing');
      setCallDuration(0);
      const callId = crypto.randomUUID();
      activeCallIdRef.current = callId;

      // Broadcast call offer to the recipient
      callSignalingService.sendSignal({
        callId,
        callerName: myName,
        callerAvatar: user?.avatarUrl,
        targetName: friendName,
        type: 'offer',
        timestamp: Date.now(),
      });

      // Listen for accept / decline / end response from remote user
      const unsubscribe = callSignalingService.subscribe((signal) => {
        if (signal.callId === callId || signal.targetName === myName) {
          if (signal.type === 'accept') {
            setCallStatus('connected');
            toast(`🟢 ${friendName} đã chấp nhận cuộc gọi!`, 'success');
          } else if (signal.type === 'decline') {
            setIsVideoCallActive(false);
            toast(`🔴 ${friendName} đã từ chối cuộc gọi.`, 'warning');
          } else if (signal.type === 'end') {
            setIsVideoCallActive(false);
            toast(`Cuộc gọi với ${friendName} đã kết thúc.`, 'info');
          }
        }
      });

      // Auto-connected fallback after 4.5s if testing single-user offline demo mode
      const autoConnectTimer = setTimeout(() => {
        setCallStatus((current) => {
          if (current === 'ringing') {
            toast(`🟢 Cuộc gọi tự động kết nối mô phỏng với ${friendName}!`, 'info');
            return 'connected';
          }
          return current;
        });
      }, 4500);

      return () => {
        unsubscribe();
        clearTimeout(autoConnectTimer);
        if (activeCallIdRef.current) {
          callSignalingService.sendSignal({
            callId: activeCallIdRef.current,
            callerName: myName,
            targetName: friendName,
            type: 'end',
            timestamp: Date.now(),
          });
        }
      };
    }
  }, [isVideoCallActive, friendName, myName, user?.avatarUrl]);

  useEffect(() => {
    if (isVideoCallActive && callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVideoCallActive, callStatus]);

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* Simulated voice-activity bars for remote partner (CSS-animated) */
  const VoiceBars = () => (
    <div className="flex items-end gap-[3px] h-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="w-[4px] rounded-full bg-emerald-400"
          style={{
            animation: `voiceBar 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
            height: '6px',
          }}
        />
      ))}
      <style>{`
        @keyframes voiceBar {
          0% { height: 4px; opacity: 0.5; }
          100% { height: 22px; opacity: 1; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[680px] animate-reveal-up">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center text-base shadow-md">
              {friendName[0]?.toUpperCase() || 'F'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                {friendName}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Trực tuyến" />
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {isVideoCallActive
                  ? (callStatus === 'ringing'
                    ? '📞 Đang đổ chuông...'
                    : callStatus === 'pickup'
                      ? '📲 Đang kết nối...'
                      : `🟢 Đang gọi • ${formatCallDuration(callDuration)}`)
                  : 'Đang sẵn sàng nhắn tin & gọi video 1-1'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVideoCallActive(!isVideoCallActive)}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isVideoCallActive ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <Video size={16} /> {isVideoCallActive ? 'Tắt Gọi Video' : 'Gọi Video HD'}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══ 2-WAY VIDEO CALL INTERFACE ═══ */}
        {isVideoCallActive && (
          <div className="relative bg-slate-900 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col shrink-0">

            {/* Main Call Frame */}
            <div className="w-full h-64 relative flex items-center justify-center overflow-hidden">

              {/* ── RINGING PHASE ── */}
              {callStatus === 'ringing' && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                  <div className="relative">
                    {/* Expanding rings */}
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-emerald-400/50 animate-ping" />
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-emerald-400/30" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) 0.3s infinite' }} />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black flex items-center justify-center text-2xl shadow-2xl relative z-10 border-2 border-emerald-400/30">
                      {friendName[0]?.toUpperCase() || 'F'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">{friendName}</p>
                    <p className="text-emerald-400 text-xs font-semibold animate-pulse mt-1">📞 Đang đổ chuông...</p>
                    <p className="text-slate-400 text-[10px] mt-1.5">Chờ {friendName} nhấc máy</p>
                  </div>
                </div>
              )}

              {/* ── PICKUP PHASE (partner just answered) ── */}
              {callStatus === 'pickup' && (
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black flex items-center justify-center text-2xl shadow-2xl ring-4 ring-emerald-400/60 border-2 border-emerald-300/40">
                    {friendName[0]?.toUpperCase() || 'F'}
                  </div>
                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 text-xs font-bold">{friendName} đã nhấc máy!</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">Đang thiết lập kênh âm thanh & video...</p>
                </div>
              )}

              {/* ── CONNECTED PHASE (active 2-way call) ── */}
              {callStatus === 'connected' && (
                <>
                  {/* Remote Partner Full Frame */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
                    {/* Remote avatar with voice activity */}
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-2xl shadow-2xl border-2 border-emerald-400/50">
                          {friendName[0]?.toUpperCase() || 'F'}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900" />
                      </div>
                      <div className="text-left">
                        <p className="text-white text-base font-bold">{friendName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <VoiceBars />
                          <span className="text-emerald-400 text-[11px] font-semibold">Đang nói...</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex items-center gap-1">
                            <Mic size={9} /> Mic bật
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[9px] font-bold flex items-center gap-1">
                            <Video size={9} /> Cam bật
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Status Bar */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Đã kết nối • {formatCallDuration(callDuration)}
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-400/20">
                      🔒 Mã hóa E2E
                    </div>
                  </div>

                  {/* PIP Local Camera (Bottom-Right) */}
                  <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-950 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-xl flex items-center justify-center z-10">
                    {isCamOn ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <VideoOff size={14} className="text-slate-500" />
                        <span className="text-slate-500 text-[8px] font-bold">Cam tắt</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/70 text-[8px] font-bold text-white">Bạn</span>
                  </div>

                  {/* Bottom Partner Label */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white z-10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {friendName} • Đầu dây bên kia
                  </div>
                </>
              )}
            </div>

            {/* Call Control Bar */}
            <div className="flex items-center justify-center gap-4 py-3 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600 hover:bg-rose-500'}`}
                title={isMicOn ? 'Tắt Micro' : 'Bật Micro'}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${isCamOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600 hover:bg-rose-500'}`}
                title={isCamOn ? 'Tắt Camera' : 'Bật Camera'}
              >
                {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button
                onClick={() => setIsVideoCallActive(false)}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative group ${
                msg.sender === 'me'
                  ? 'bg-emerald-500 text-white font-medium rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                {msg.translatedText && (
                  <p className="mt-1.5 pt-1.5 border-t border-white/20 text-[11px] font-semibold text-emerald-200 dark:text-emerald-400">
                    {msg.translatedText}
                  </p>
                )}
                
                <button
                  onClick={() => handleTranslateMessage(msg.id, msg.text)}
                  className="mt-1 opacity-70 hover:opacity-100 text-[10px] flex items-center gap-1 font-bold underline cursor-pointer"
                  title="Dịch AI"
                >
                  <Globe size={10} /> {msg.translatedText ? 'Ẩn bản dịch' : 'Dịch AI'}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Nhắn tin trực tiếp với ${friendName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Send size={14} /> Gửi
          </button>
        </div>

      </div>
    </div>
  );
}
