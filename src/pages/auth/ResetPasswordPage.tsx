import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, LoaderCircle, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';
import { authService } from '../../services/authService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { validateNewPassword } from '../../services/passwordRecoveryPolicy';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'saving' | 'complete'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const checkRecoverySession = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (active) setStatus('invalid');
        return;
      }
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !data.session) {
        setStatus('invalid');
        return;
      }
      setStatus('ready');
    };

    const subscription = isSupabaseConfigured() && supabase
      ? supabase.auth.onAuthStateChange((event, session) => {
          if (!active) return;
          if (event === 'PASSWORD_RECOVERY' && session) {
            setStatus('ready');
          }
        })
      : null;

    void checkRecoverySession();
    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateNewPassword(password, confirmation);
    if (validationError) {
      setError(validationError);
      return;
    }
    setStatus('saving');
    setError('');
    const result = await authService.updatePassword(password);
    if (result.error) {
      setError(result.error);
      setStatus('ready');
      return;
    }
    setStatus('complete');
    window.setTimeout(() => navigate('/app/dashboard', { replace: true }), 1200);
  };

  return (
    <main className="min-h-screen bg-[#fffaf2] px-4 py-10 sm:py-16">
      <section className="mx-auto max-w-md rounded-[2rem] border border-amber-100 bg-white p-7 shadow-[0_24px_70px_rgba(100,60,18,.12)] sm:p-9">
        <EchBuriAnimated state={status === 'complete' ? 'success' : status === 'invalid' ? 'thinking' : 'welcome'} size={118} className="mx-auto" />
        <div className="mt-5 text-center">
          <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Bảo mật tài khoản</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Đặt mật khẩu mới</h1>
        </div>

        {status === 'checking' && <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600"><LoaderCircle className="animate-spin" size={18} /> Đang kiểm tra liên kết an toàn…</div>}

        {status === 'invalid' && <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center"><LockKeyhole className="mx-auto text-amber-700" size={25} /><h2 className="mt-3 font-black text-slate-950">Liên kết đã hết hạn hoặc không hợp lệ</h2><p className="mt-2 text-sm leading-6 text-slate-600">Hãy yêu cầu một liên kết đặt lại mật khẩu mới. Vì an toàn, mỗi liên kết chỉ dùng trong thời gian ngắn.</p><Link to="/forgot-password" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">Gửi lại liên kết</Link></div>}

        {(status === 'ready' || status === 'saving') && <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">Mật khẩu mới</span><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div></label>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">Nhập lại mật khẩu mới</span><input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
          <button disabled={status === 'saving'} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"><LockKeyhole size={18} /> {status === 'saving' ? 'Đang cập nhật…' : 'Lưu mật khẩu mới'}</button>
        </form>}

        {status === 'complete' && <div className="mt-8 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={42} /><h2 className="mt-3 text-xl font-black text-slate-950">Đã cập nhật mật khẩu</h2><p className="mt-2 text-sm text-slate-600">Đang đưa bạn về khu vực học tập…</p></div>}
      </section>
    </main>
  );
}
