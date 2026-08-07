import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CallSignal {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  targetName: string;
  type: 'offer' | 'accept' | 'decline' | 'end';
  timestamp: number;
}

type CallSignalListener = (signal: CallSignal) => void;

const listeners = new Set<CallSignalListener>();
let globalChannel: any = null;

function ensureChannel() {
  if (!globalChannel && isSupabaseConfigured() && supabase) {
    globalChannel = supabase.channel('echlearn_video_calls_channel', {
      config: { broadcast: { self: true } },
    });
    globalChannel
      .on('broadcast', { event: 'call_event' }, (payload: { payload: CallSignal }) => {
        if (payload?.payload) {
          listeners.forEach((l) => l(payload.payload));
        }
      })
      .subscribe();
  }
}

export const callSignalingService = {
  subscribe(listener: CallSignalListener) {
    listeners.add(listener);
    ensureChannel();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'echlearn_call_signal_event' && e.newValue) {
        try {
          const signal = JSON.parse(e.newValue) as CallSignal;
          listeners.forEach((l) => l(signal));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorage);
    };
  },

  sendSignal(signal: CallSignal) {
    ensureChannel();

    // 1. Broadcast via Supabase Realtime channel
    if (globalChannel) {
      globalChannel.send({
        type: 'broadcast',
        event: 'call_event',
        payload: signal,
      });
    }

    // 2. Broadcast via LocalStorage event for multi-tab testing on the same computer
    try {
      localStorage.setItem('echlearn_call_signal_event', JSON.stringify({ ...signal, _rnd: Math.random() }));
    } catch {}
  },
};
