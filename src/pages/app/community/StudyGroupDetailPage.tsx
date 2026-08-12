import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Globe, Info, Target, Users } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { communitySupabaseService } from '../../../services/communitySupabaseService';
import type { StudyGroup } from '../../../types/community';

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    communitySupabaseService.getStudyGroups()
      .then((groups) => {
        if (!active) return;
        const match = groups.find((item) => item.id === id) ?? null;
        setGroup(match);
        setStatus(match ? 'ready' : 'missing');
      })
      .catch((error) => {
        console.error('Could not load study group detail', error);
        if (active) setStatus('error');
      });
    return () => { active = false; };
  }, [id]);

  if (status === 'loading') {
    return <PageShell title="Đang mở nhóm học" description="Đang tải dữ liệu của nhóm." backTo="/app/groups"><div role="status" aria-live="polite" className="rounded-2xl border border-slate-300 bg-white p-10 text-center text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Đang tải nhóm học…</div></PageShell>;
  }

  if (status === 'error') {
    return <PageShell title="Chưa thể tải nhóm" description="Dữ liệu nhóm hiện không khả dụng." backTo="/app/groups"><div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><p>Kiểm tra kết nối rồi quay lại danh sách để thử lại.</p><Link to="/app/groups" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"><ArrowLeft size={17} /> Về danh sách nhóm</Link></div></PageShell>;
  }

  if (!group || status === 'missing') {
    return <PageShell title="Không tìm thấy nhóm" description="Nhóm có thể đã bị xóa hoặc đường dẫn không còn hợp lệ." backTo="/app/groups"><div className="py-12 text-center"><Mascot expression="thinking" size={80} message="Mình không tìm thấy nhóm này." /><Link to="/app/groups" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"><ArrowLeft size={17} /> Xem các nhóm hiện có</Link></div></PageShell>;
  }

  const memberCount = group.members?.length ?? 0;
  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-20">
      <Link to="/app/groups" className="inline-flex min-h-11 items-center gap-2 font-bold text-emerald-800 hover:underline dark:text-emerald-200"><ArrowLeft size={17} /> Về danh sách nhóm</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Nhóm học</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{group.name}</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{group.description || 'Nhóm chưa có mô tả. Hãy xem mục tiêu và ngôn ngữ trước khi tham gia.'}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800"><Globe size={16} /> {group.language}</span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800"><Target size={16} /> {group.level || 'Chưa đặt trình độ'}</span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800"><Users size={16} /> {memberCount}/{group.maxMembers} thành viên đã ghi nhận</span>
        </div>
      </section>
      <section role="note" className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <Info className="mt-0.5 shrink-0" size={20} />
        <div><h2 className="font-black">Tham gia nhóm chưa khả dụng trong bản này</h2><p className="mt-1">EchLearn chưa có thao tác join/leave và quyền thành viên hoàn chỉnh, nên trang không hiển thị nút giả thành công. Bạn có thể quay lại danh sách hoặc dùng kênh cộng đồng đã cấu hình.</p></div>
      </section>
      <Link to="/app/community" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700">Mở cộng đồng</Link>
    </main>
  );
}
