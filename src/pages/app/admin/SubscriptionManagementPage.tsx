import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, DollarSign, LockKeyhole, RotateCcw, ShieldCheck, UserRoundCheck, Users } from 'lucide-react';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';
import { useAuthStore } from '../../../stores/authStore';
import { useEntitlementStore } from '../../../stores/entitlementStore';
import { usePricingStore } from '../../../stores/pricingStore';
import { userService } from '../../../services/userService';
import {
  ENTITLEMENT_PLANS,
  isEntitlementActive,
  findActiveEntitlement,
} from '../../../services/entitlementService';
import type { EntitlementPlanId, EntitlementSource } from '../../../services/entitlementService';

function activationError(reason: 'admin-required' | 'invalid-user-id' | 'local-storage-unavailable'): string {
  switch (reason) {
    case 'admin-required':
      return 'Cần quyền quản trị viên để kích hoạt gói.';
    case 'invalid-user-id':
      return 'Nhập ID tài khoản học viên trước khi kích hoạt.';
    case 'local-storage-unavailable':
      return 'Trình duyệt không thể lưu trạng thái kích hoạt.';
  }
}

export default function SubscriptionManagementPage() {
  const user = useAuthStore((state) => state.user);
  const records = useEntitlementStore((state) => state.records);
  const activate = useEntitlementStore((state) => state.activate);
  const { prices, updatePrice, resetToDefaults } = usePricingStore();
  const [targetUserId, setTargetUserId] = useState('');
  const [plan, setPlan] = useState<EntitlementPlanId>('go');
  const [source, setSource] = useState<EntitlementSource>('purchased');
  const [lastActivation, setLastActivation] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activeTab, setActiveTab] = useState<'activate' | 'pricing' | 'users'>('activate');

  // Editing price state
  const [editPlan, setEditPlan] = useState<EntitlementPlanId>('go');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editPeriod, setEditPeriod] = useState('');
  const [editBadge, setEditBadge] = useState('');

  const allUsers = useMemo(() => userService.getAllLocalUsers(), []);
  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => right.activatedAt.localeCompare(left.activatedAt)),
    [records],
  );

  if (user?.role !== 'admin') {
    return (
      <PageShell
        title="Admin Control Center"
        description="Yêu cầu quyền quản trị viên hệ thống để kích hoạt gói và thay đổi giá"
        icon={<ShieldCheck size={20} />}
        backTo="/app"
      >
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-4 my-12">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <LockKeyhole size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900">Yêu Cầu Quyền Quản Trị Viên (Admin Access Only)</h3>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            Tài khoản <span className="text-emerald-600 font-black">{user?.email}</span> hiện tại là tài khoản người dùng thường (Chưa kích hoạt gói Admin). Vui lòng đăng nhập bằng tài khoản Admin <span className="font-black">khounguyennguyen2012@gmail.com</span> hoặc liên hệ Quản trị viên để được cấp gói.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <a
              href="/app/pricing"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md inline-block"
            >
              Xem Bảng Giá Kích Hoạt Gói
            </a>
          </div>
        </div>
      </PageShell>
    );
  }

  if (user?.role !== 'admin' || user.displayName !== 'GiaosuEch') {
    return (
      <PageShell title="Quản lý gói học" description="Ghi nhận quyền truy cập lộ trình" icon={<LockKeyhole size={20} />}>
        <section className="mx-auto max-w-xl rounded-3xl border border-rose-400/30 bg-rose-950/20 p-8 text-center">
          <LockKeyhole className="mx-auto text-rose-300" size={42} aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-white">Cần quyền quản trị</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Chỉ tài khoản quản trị <code>GiaosuEch</code> mới có thể quản lý gói cước, giá tiền và kích hoạt cho học viên.
          </p>
        </section>
      </PageShell>
    );
  }

  const handleActivate = async (overrideUserId?: string) => {
    const uid = overrideUserId || targetUserId;
    if (!uid.trim()) {
      toast('Vui lòng nhập ID tài khoản.', 'error');
      return;
    }
    setIsActivating(true);
    const result = await activate({
      actor: { id: user.id, role: user.role, email: user.email },
      userId: uid,
      plan,
      source,
    });

    if (!result.ok) {
      toast(activationError(result.reason), 'error');
      setIsActivating(false);
      return;
    }

    setLastActivation(`✅ Đã ghi nhận ${result.entitlement.plan.toUpperCase()} cho ${result.entitlement.userId}`);
    toast(`Đã kích hoạt gói ${result.entitlement.plan.toUpperCase()} thành công!`, 'success');
    setTargetUserId('');
    setIsActivating(false);
  };

  const handleSavePrice = () => {
    if (!editPrice.trim()) {
      toast('Vui lòng nhập giá mới.', 'error');
      return;
    }
    updatePrice(editPlan, {
      price: editPrice,
      originalPrice: editOriginalPrice || undefined,
      period: editPeriod || prices[editPlan].period,
      badge: editBadge || undefined,
    });
    toast(`Đã cập nhật giá gói ${editPlan.toUpperCase()} thành ${editPrice}!`, 'success');
  };

  const handleResetPrices = () => {
    resetToDefaults();
    toast('Đã khôi phục giá mặc định cho tất cả gói!', 'info');
  };

  const loadPlanForEdit = (planId: EntitlementPlanId) => {
    setEditPlan(planId);
    setEditPrice(prices[planId].price);
    setEditOriginalPrice(prices[planId].originalPrice || '');
    setEditPeriod(prices[planId].period);
    setEditBadge(prices[planId].badge || '');
  };

  return (
    <PageShell
      title="🛡️ Admin Panel — Quản Lý Gói & Giá"
      description="Kích hoạt gói, chỉnh giá, quản lý tài khoản học viên"
      icon={<ShieldCheck size={20} />}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        {([
          ['activate', '🎫 Kích Hoạt Gói', UserRoundCheck],
          ['pricing', '💰 Điều Chỉnh Giá', DollarSign],
          ['users', '👥 DS Tài Khoản', Users],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === key
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1: Activate Plans */}
      {activeTab === 'activate' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-3xl border border-emerald-400/20 bg-white dark:bg-slate-900 p-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-600 dark:text-emerald-300"><UserRoundCheck size={22} aria-hidden="true" /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kích hoạt gói cho học viên</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">Nhập ID tài khoản hoặc chọn từ danh sách bên dưới.</p>
              </div>
            </div>

            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                await handleActivate();
              }}
            >
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">ID Tài Khoản Học Viên</span>
                <input
                  required
                  value={targetUserId}
                  onChange={(event) => setTargetUserId(event.target.value)}
                  placeholder="Ví dụ: user_abc123..."
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Chọn Gói</span>
                <select
                  value={plan}
                  onChange={(event) => setPlan(event.target.value as EntitlementPlanId)}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-400"
                >
                  {ENTITLEMENT_PLANS.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} · {item.durationDays === null ? 'Không giới hạn' : `${item.durationDays} ngày`} · {prices[item.id].price}</option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-900 dark:text-white">Loại kích hoạt</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {([
                    ['trial', 'Dùng thử'],
                    ['purchased', 'Đã thanh toán'],
                  ] as const).map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm transition-colors ${source === value ? 'border-emerald-400 bg-emerald-400/10 text-emerald-700 dark:text-emerald-100' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-300'}`}>
                      <input className="sr-only" type="radio" name="activation-source" value={value} checked={source === value} onChange={() => setSource(value)} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button disabled={isActivating} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-65 cursor-pointer">
                <CheckCircle2 size={18} aria-hidden="true" /> {isActivating ? 'Đang kích hoạt...' : 'Kích Hoạt Gói'}
              </button>
            </form>

            {lastActivation ? <p aria-live="polite" className="mt-4 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-100">{lastActivation}</p> : null}
          </section>

          <section className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-600 dark:text-sky-300"><Clock3 size={22} aria-hidden="true" /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử kích hoạt</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Mỗi học viên có một bản ghi quyền truy cập hiện hành.</p>
              </div>
            </div>

            {sortedRecords.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-400">Chưa có gói học nào được kích hoạt.</p>
            ) : (
              <ul className="mt-6 space-y-3" aria-label="Local entitlement records">
                {sortedRecords.map((record) => {
                  const active = isEntitlementActive(record);
                  return (
                    <li key={record.userId} className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{record.userId}</p>
                          <p className="mt-1 text-xs text-slate-400">Bởi {record.activatedBy} · {new Date(record.activatedAt).toLocaleString()}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-400/15 text-emerald-700 dark:text-emerald-200' : 'bg-slate-200 dark:bg-slate-700/70 text-slate-500 dark:text-slate-300'}`}>{active ? 'Đang hoạt động' : 'Hết hạn'}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-200"><span className="font-semibold">{record.plan.toUpperCase()}</span> · {record.source === 'trial' ? 'Dùng thử' : 'Đã mua'} · {record.expiresAt ? `hết hạn ${new Date(record.expiresAt).toLocaleDateString()}` : 'Không hết hạn'}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: Pricing Management */}
      {activeTab === 'pricing' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Current Prices Overview */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-md">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><DollarSign size={20} /> Bảng Giá Hiện Tại</h2>
            <div className="mt-4 space-y-3">
              {ENTITLEMENT_PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => loadPlanForEdit(p.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                    editPlan === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                    {prices[p.id].badge && <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-full font-bold">{prices[p.id].badge}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{prices[p.id].price}</p>
                  {prices[p.id].originalPrice && <p className="text-xs text-slate-400 line-through">{prices[p.id].originalPrice}</p>}
                  <p className="text-xs text-slate-500 mt-1">{prices[p.id].period}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleResetPrices}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-200 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Khôi Phục Giá Mặc Định
            </button>
          </section>

          {/* Edit Price Form */}
          <section className="rounded-3xl border border-emerald-400/20 bg-white dark:bg-slate-900 p-6 shadow-md">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chỉnh Sửa Giá Gói: <span className="text-emerald-500">{editPlan.toUpperCase()}</span></h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Giá hiển thị</span>
                <input
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  placeholder="Ví dụ: 299.000 VNĐ"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Giá gốc (gạch ngang)</span>
                <input
                  value={editOriginalPrice}
                  onChange={e => setEditOriginalPrice(e.target.value)}
                  placeholder="Ví dụ: 499.000 VNĐ (để trống nếu không cần)"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Chu kỳ hiển thị</span>
                <input
                  value={editPeriod}
                  onChange={e => setEditPeriod(e.target.value)}
                  placeholder="Ví dụ: 6 Tháng (~33k/tháng)"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Badge (nhãn đặc biệt)</span>
                <input
                  value={editBadge}
                  onChange={e => setEditBadge(e.target.value)}
                  placeholder="Ví dụ: 🔥 Phổ biến nhất (để trống nếu không cần)"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
                />
              </label>
              <button
                onClick={handleSavePrice}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 cursor-pointer"
              >
                <CheckCircle2 size={18} /> Lưu Giá Gói {editPlan.toUpperCase()}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: User List & Quick Activate */}
      {activeTab === 'users' && (
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-md">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Users size={20} /> Danh Sách Tài Khoản Đã Đăng Ký ({allUsers.length})</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Bấm "Kích hoạt" để active gói cho tài khoản bất kỳ.</p>
          
          <div className="mt-4 space-y-3">
            {allUsers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-400 text-center">Chưa có tài khoản nào đăng ký trên thiết bị này.</p>
            ) : (
              allUsers.map((u: any) => {
                const activeEnt = findActiveEntitlement(records, u.id);
                return (
                  <div key={u.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : (u.displayName?.[0]?.toUpperCase() || 'E')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{u.displayName || 'Học Viên'}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">ID: {u.id}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email || 'Chưa có email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeEnt ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                          {activeEnt.plan.toUpperCase()}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500">
                          FREE
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setTargetUserId(u.id);
                          setActiveTab('activate');
                          toast(`Đã chọn tài khoản ${u.displayName || u.id}. Chọn gói và bấm Kích Hoạt.`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-all"
                      >
                        Kích hoạt
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </PageShell>
  );
}
