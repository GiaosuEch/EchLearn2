import { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { callSignalingService, type CallSignal } from '../../services/callSignalingService';
import { useAuthStore } from '../../stores/authStore';
import { DirectChatModal } from './DirectChatModal';
import { toast } from '../ui/Toast';

export function IncomingCallModal() {
  const [activeOffer, setActiveOffer] = useState<CallSignal | null>(null);
  const [connectedFriend, setConnectedFriend] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const myName = user?.displayName || user?.username || 'Học Viên Ếch';
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<any>(null);

  // Play synthesized phone ring tone using Web Audio API
  const startRingtone = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      const playTone = () => {
        if (!ctx || ctx.state === 'closed') return;
        if (ctx.state === 'suspended') void ctx.resume();

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz LA
        osc2.frequency.setValueAtTime(480, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      };

      playTone();
      ringIntervalRef.current = setInterval(playTone, 2400);
    } catch {}
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try { void audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = callSignalingService.subscribe((signal) => {
      if (signal.type === 'offer') {
        // Accept call if target name matches my name OR in demo/global broadcast mode
        const isForMe =
          !signal.targetName ||
          signal.targetName.toLowerCase() === myName.toLowerCase() ||
          signal.callerName.toLowerCase() !== myName.toLowerCase();

        if (isForMe && signal.callerName !== myName) {
          setActiveOffer(signal);
          startRingtone();
        }
      } else if (signal.type === 'end' || signal.type === 'decline') {
        if (activeOffer && activeOffer.callId === signal.callId) {
          setActiveOffer(null);
          stopRingtone();
        }
      }
    });

    return () => {
      unsubscribe();
      stopRingtone();
    };
  }, [myName, activeOffer, startRingtone, stopRingtone]);

  const handleAccept = () => {
    if (!activeOffer) return;
    stopRingtone();

    // Send accept signal back to caller
    callSignalingService.sendSignal({
      callId: activeOffer.callId,
      callerName: myName,
      targetName: activeOffer.callerName,
      type: 'accept',
      timestamp: Date.now(),
    });

    setConnectedFriend(activeOffer.callerName);
    setActiveOffer(null);
    toast(`🟢 Đã chấp nhận cuộc gọi từ ${activeOffer.callerName}!`, 'success');
  };

  const handleDecline = () => {
    if (!activeOffer) return;
    stopRingtone();

    // Send decline signal back to caller
    callSignalingService.sendSignal({
      callId: activeOffer.callId,
      callerName: myName,
      targetName: activeOffer.callerName,
      type: 'decline',
      timestamp: Date.now(),
    });

    setActiveOffer(null);
    toast('Đã từ chối cuộc gọi.', 'info');
  };

  return (
    <>
      {/* 1. Incoming Call Popup Banner / Ringing Overlay */}
      {activeOffer && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border-2 border-emerald-500/50 bg-slate-900 p-6 shadow-2xl text-center space-y-6 text-white relative overflow-hidden">
            {/* Ambient Animated Glow Aura */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Pulsing Call Badge */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-emerald-400 overflow-hidden flex items-center justify-center font-bold text-2xl text-emerald-400 shadow-xl shadow-emerald-500/30">
                  {activeOffer.callerAvatar ? (
                    <img src={activeOffer.callerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    activeOffer.callerName[0]?.toUpperCase() || 'E'
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg animate-bounce">
                  <Video size={14} />
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
                📞 Cuộc Gọi Video Đến...
              </span>

              <h3 className="text-xl font-black text-white">{activeOffer.callerName}</h3>
              <p className="text-xs text-slate-300 mt-1">Đang gọi cho bạn trên EchLearn</p>
            </div>

            {/* Answer / Decline Action Buttons */}
            <div className="relative z-10 grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDecline}
                className="py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <PhoneOff size={16} />
                <span>Từ Chối</span>
              </button>

              <button
                onClick={handleAccept}
                className="py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/40 active:scale-95 animate-pulse"
              >
                <Phone size={16} />
                <span>Chấp Nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Direct Chat & Video Call Modal for the recipient once accepted */}
      {connectedFriend && (
        <DirectChatModal
          friendName={connectedFriend}
          isOpen={Boolean(connectedFriend)}
          onClose={() => setConnectedFriend(null)}
          startWithVideoCall={true}
        />
      )}
    </>
  );
}
