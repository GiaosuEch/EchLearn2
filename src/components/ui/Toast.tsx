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

export function formatToastMessage(message: any): string {
  if (!message) return 'Đã xảy ra sự cố. Vui lòng thử lại!';

  let msgStr = '';
  if (typeof message === 'string') {
    msgStr = message.trim();
  } else if (typeof message === 'object') {
    if (typeof message.message === 'string' && message.message.trim() && message.message !== '[object Object]') {
      msgStr = message.message.trim();
    } else if (typeof message.error_description === 'string' && message.error_description.trim()) {
      msgStr = message.error_description.trim();
    }
  }

  if (!msgStr || msgStr === '{}' || msgStr === '[object Object]') {
    return 'Đã xảy ra sự cố. Vui lòng kiểm tra lại kết nối hoặc thông tin!';
  }

  // Supabase & Auth error mapping to Vietnamese
  const lower = msgStr.toLowerCase();
  if (lower.includes('rate limit exceeded') || lower.includes('over_email_send_rate_limit')) {
    return 'Đã vượt quá giới hạn gửi email. Vui lòng thử lại sau ít phút!';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư (hoặc mục Spam)!';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  if (lower.includes('user already registered') || lower.includes('user_already_exists') || lower.includes('user already exists')) {
    return 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập!';
  }
  if (lower.includes('password should be at least 6 characters') || lower.includes('weak_password')) {
    return 'Mật khẩu phải có ít nhất 6 ký tự.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid_email')) {
    return 'Địa chỉ email không hợp lệ.';
  }

  return msgStr;
}

export function toast(message: any, type: ToastType = 'info', duration = 3000) {
  const formatted = formatToastMessage(message);
  if (addToastGlobal) addToastGlobal(formatted, type, duration);
}

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors: Record<ToastType, string> = {
  success: 'bg-white border-emerald-300 text-slate-900 shadow-lg shadow-emerald-500/10 font-mono',
  error: 'bg-white border-rose-300 text-slate-900 shadow-lg shadow-rose-500/10 font-mono',
  info: 'bg-white border-sky-300 text-slate-900 shadow-lg shadow-sky-500/10 font-mono',
  warning: 'bg-white border-amber-300 text-slate-900 shadow-lg shadow-amber-500/10 font-mono',
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
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl transition-all animate-slide-in ${colors[t.type]}`}
          role="alert"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">{icons[t.type]}</span>
          <p className="text-xs font-semibold text-slate-800 flex-1 leading-relaxed">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-700 text-base font-bold leading-none flex-shrink-0 cursor-pointer">&times;</button>
        </div>
      ))}
    </div>,
    document.body
  );
}
