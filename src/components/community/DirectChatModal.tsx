import { useState, useEffect, useRef } from 'react';
import { X, Send, Video, VideoOff, Mic, MicOff, Globe, PhoneOff } from 'lucide-react';
import { toast } from '../ui/Toast';
import { useAppStore } from '../../stores/appStore';

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

  /* Handle HD Video/Audio Call WebRTC MediaStream */
  useEffect(() => {
    if (isVideoCallActive && isCamOn) {
      navigator.mediaDevices?.getUserMedia?.({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: 30 },
        audio: isMicOn
      })
        .then(stream => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          toast('Không tìm thấy camera/mic hoặc bị từ chối quyền.', 'warning');
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        setMediaStream(null);
      }
    }
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

  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isVideoCallActive) {
      setCallStatus('ringing');
      setCallDuration(0);
      const timer = setTimeout(() => {
        setCallStatus('connected');
        toast(`🟢 ${friendName} đã chấp nhận cuộc gọi!`, 'success');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVideoCallActive, friendName]);

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
                  ? (callStatus === 'ringing' ? '📞 Đang đổ chuông...' : `🟢 Cuộc gọi HD: ${formatCallDuration(callDuration)}`)
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

        {/* 2-Way HD Video Call Canvas overlay when active */}
        {isVideoCallActive && (
          <div className="relative bg-slate-950 p-4 border-b border-slate-800 flex flex-col items-center justify-center shrink-0">
            {/* Main Remote Partner Frame */}
            <div className="w-full h-56 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 flex flex-col items-center justify-center shadow-inner">
              
              {callStatus === 'ringing' ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xl animate-ping absolute inset-0" />
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xl shadow-lg relative z-10">
                      {friendName[0]?.toUpperCase() || 'F'}
                    </div>
                  </div>
                  <span className="text-white text-xs font-bold animate-pulse">📞 Đang gọi cho {friendName}...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xl ring-4 ring-emerald-500/50 animate-pulse" />
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xl shadow-lg absolute inset-0">
                      {friendName[0]?.toUpperCase() || 'F'}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-white text-xs font-bold block">{friendName}</span>
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Đã tiếp nhận • 🔊 Âm thanh 1080p
                    </span>
                  </div>
                </div>
              )}

              {/* Top Status Bar */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {callStatus === 'ringing' ? 'Đang kết nối WebRTC...' : `HD 1080p Call • ${formatCallDuration(callDuration)}`}
              </div>

              {/* Picture-In-Picture Local Camera Preview (Bottom-Right) */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-950 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-xl flex items-center justify-center">
                {isCamOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-500 text-[9px] font-bold">Cam tắt</div>
                )}
                <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white">Bạn</span>
              </div>
            </div>

            {/* Video Call Controls */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-full text-white transition-all cursor-pointer ${isMicOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600'}`}
                title={isMicOn ? 'Tắt Micro' : 'Bật Micro'}
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-2.5 rounded-full text-white transition-all cursor-pointer ${isCamOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600'}`}
                title={isCamOn ? 'Tắt Camera' : 'Bật Camera'}
              >
                {isCamOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
              <button
                onClick={() => setIsVideoCallActive(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <PhoneOff size={14} /> Kết Thúc Cuộc Gọi
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
