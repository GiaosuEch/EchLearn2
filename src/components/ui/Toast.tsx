import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

let addToastGlobal: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export function toast(message: string, type: ToastType = 'info', duration = 3000) {
  if (addToastGlobal) addToastGlobal(message, type, duration);
}

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]);
    const timer = window.setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);
  }, [removeToast]);

  addToastGlobal = addToast;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in ${colors[t.type]}`}
          role="alert"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">{icons[t.type]}</span>
          <p className="text-sm text-white flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-dark-400 hover:text-white text-lg leading-none flex-shrink-0">&times;</button>
        </div>
      ))}
    </div>,
    document.body
  );
}
