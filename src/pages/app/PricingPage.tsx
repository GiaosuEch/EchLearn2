import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Clock3, Languages, RefreshCw, ShieldCheck, Info } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { usePricingStore } from '../../stores/pricingStore';
import { ENTITLEMENT_PLANS } from '../../services/entitlementService';
import type { EntitlementPlan, EntitlementPlanId } from '../../services/entitlementService';
import { toast } from '../../components/ui/Toast';

function durationLabel(plan: EntitlementPlan): string {
  return plan.durationDays === null ? 'Không thời hạn' : `${plan.durationDays} ngày`;
}

function languageLabel(plan: EntitlementPlan): string {
  switch (plan.languageAccess) {
    case 'starter':
      return '3 ngôn ngữ khởi đầu: Anh, Trung, Nhật';
    case 'starter-plus-one':
      return 'Anh, Trung, Nhật + 1 ngôn ngữ tự chọn';
    case 'multiple':
      return 'Nhiều ngôn ngữ đang học';
    case 'all':
      return 'Toàn bộ 13+ ngôn ngữ';
  }
}

function planDescription(plan: EntitlementPlan): string {
  switch (plan.id) {
    case 'free':
      return '90 ngày khởi động, học Anh – Trung – Nhật theo lộ trình có cấu trúc.';
    case 'go':
      return '180 ngày: giữ 3 ngôn ngữ khởi đầu và mở thêm 1 ngôn ngữ tự chọn.';
    case 'plus':
      return '365 ngày để xây dựng thói quen học đa ngôn ngữ bền vững.';
    case 'pro':
      return 'Quyền truy cập toàn bộ ngôn ngữ, không giới hạn thời gian sử dụng.';
  }
}

function isCurrentPlan(planId: EntitlementPlanId, currentPlan: EntitlementPlanId | null): boolean {
  return planId === currentPlan;
}

const PLAN_FEATURES: Record<EntitlementPlanId, string[]> = {
  free: [
    '3 Ngôn ngữ khởi đầu: Anh, Trung, Nhật',
    'Luyện phát âm & Spaced Repetition SRS',
    'Bản đồ bài học 90 ngày chuẩn hóa',
    'LoFi Music Study Lab',
  ],
  go: [
    'Bao gồm toàn bộ quyền lợi FREE',
    'Mở thêm 1 ngôn ngữ mới tự chọn',
    'Shadowing Video bản xứ có phụ đề',
    'Luyện nói & ghi âm từ vựng 3D',
  ],
  plus: [
    'Bao gồm toàn bộ quyền lợi GO',
    'Mở khóa đa ngôn ngữ đang học',
    'IELTS Academic Test Suite & Speaking',
    'Đọc báo song ngữ AI & Sổ tay sửa lỗi',
    'Báo cáo phân tích kỹ năng theo tuần',
  ],
  pro: [
    'Bao gồm toàn bộ quyền lợi PLUS',
    'Mở khóa FULL 100% 13+ Ngôn ngữ',
    'FULL 132+ Trang phục Ếch Buri VIP',
    'Không giới hạn thời gian sử dụng',
    'Hỗ trợ ưu tiên từ Admin & Discord VIP',
  ],
};

export default function PricingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getActiveForUser = useEntitlementStore((state) => state.getActiveForUser);
  const refreshEntitlements = useEntitlementStore((state) => state.refresh);
  const PLAN_PRICES = usePricingStore((state) => state.prices);
  const hydratePrices = usePricingStore((state) => state.hydrate);
  const connectPricingRealtime = usePricingStore((state) => state.connectRealtime);
  const lastPriceSyncAt = usePricingStore((state) => state.lastSyncedAt);
  const priceSource = usePricingStore((state) => state.priceSource);
  const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('echlern_current_user_id') : null);
  const currentPlan = currentUserId ? getActiveForUser(currentUserId)?.plan ?? null : null;

  useEffect(() => {
    if (currentUserId) {
      refreshEntitlements(currentUserId);
    }
  }, [currentUserId, refreshEntitlements]);

  useEffect(() => {
    void hydratePrices();
    return connectPricingRealtime();
  }, [hydratePrices, connectPricingRealtime]);

  const [justSynced, setJustSynced] = useState(false);
  const initialSyncRef = useRef(true);

  useEffect(() => {
    if (!lastPriceSyncAt) return;
    if (initialSyncRef.current) {
      initialSyncRef.current = false;
      return;
    }
    setJustSynced(true);
    const timer = window.setTimeout(() => setJustSynced(false), 3200);
    return () => window.clearTimeout(timer);
  }, [lastPriceSyncAt]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      {/* Section Header */}
      <section className="mx-auto max-w-2xl text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 inline-flex items-center gap-1.5">
          <ShieldCheck size={15} /> Bảng giá EchLearn
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ech-text)]">
          Chọn gói học phù hợp với bạn
        </h1>
        <p className="text-sm leading-relaxed text-[var(--ech-text-muted)]">
          Minh bạch, linh hoạt theo nhu cầu mở khóa ngôn ngữ và tính năng nâng cao.
        </p>

        {priceSource === 'fallback' && (
          <p className="mx-auto mt-4 inline-flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            <Info size={14} aria-hidden="true" />
            Đang hiển thị bảng giá tiêu chuẩn của EchLearn.
          </p>
        )}

        {justSynced && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
            <RefreshCw size={13} className="animate-spin" />
            Bảng giá vừa được cập nhật theo thời gian thực.
          </p>
        )}
      </section>

      {/* Pricing Cards Grid */}
      <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Available plans">
        {ENTITLEMENT_PLANS.map((plan) => {
          const active = isCurrentPlan(plan.id, currentPlan);
          const pricing = PLAN_PRICES[plan.id];
          const features = PLAN_FEATURES[plan.id];
          const isHighlighted = plan.id === 'plus' || plan.id === 'pro';

          return (
            <article
              key={plan.id}
              className={`relative flex min-h-[28rem] flex-col rounded-2xl border p-6 transition-all duration-200 ${
                active
                  ? 'border-emerald-500 bg-[var(--ech-surface)] ring-2 ring-emerald-500/20 shadow-[var(--ech-shadow-md)]'
                  : isHighlighted
                  ? 'border-emerald-500/40 bg-[var(--ech-surface)] shadow-[var(--ech-shadow-md)]'
                  : 'border-[var(--ech-border)] bg-[var(--ech-surface)] shadow-[var(--ech-shadow-xs)] hover:shadow-[var(--ech-shadow-md)]'
              }`}
            >
              {pricing.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-[10px] uppercase tracking-wider shadow-sm">
                  {pricing.badge}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className="mt-1 text-xs text-[var(--ech-text-muted)] leading-relaxed">
                    {planDescription(plan)}
                  </p>
                </div>
                {active && (
                  <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Đang dùng
                  </span>
                )}
              </div>

              {/* Price Tag Box */}
              <div className="mt-5 p-4 rounded-xl bg-[var(--ech-surface-2)]">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">{pricing.price}</span>
                  {pricing.originalPrice && (
                    <span className="text-xs text-[var(--ech-text-muted)] line-through">{pricing.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {pricing.period}
                </p>
              </div>

              <dl className="mt-4 space-y-2 text-xs text-[var(--ech-text-muted)]">
                <div className="flex items-center gap-2">
                  <Clock3 className="shrink-0 text-emerald-600" size={14} />
                  <span><strong>Thời hạn:</strong> {durationLabel(plan)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="shrink-0 text-emerald-600" size={14} />
                  <span><strong>Ngôn ngữ:</strong> {languageLabel(plan)}</span>
                </div>
              </dl>

              {/* Features List */}
              <ul className="mt-4 space-y-2 border-t border-[var(--ech-border)] pt-4 text-xs text-[var(--ech-text-muted)]">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  disabled={active}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast(`Vui lòng đăng ký hoặc đăng nhập tài khoản để chọn gói ${plan.name}!`, 'info');
                      navigate('/register');
                    } else {
                      toast(`Bạn đã chọn gói ${plan.name}. Đang kết nối tới cổng thanh toán...`, 'success');
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--ech-surface-2)] text-[var(--ech-text-muted)] border border-[var(--ech-border)] cursor-not-allowed'
                      : isHighlighted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:-translate-y-px active:translate-y-0'
                      : 'bg-[var(--ech-surface-2)] hover:bg-[var(--ech-border)] text-[var(--ech-text)]'
                  }`}
                >
                  {active ? 'Gói Hiện Tại' : !isAuthenticated ? `Đăng Ký Gói ${plan.name}` : `Chọn Gói ${plan.name}`}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="mx-auto mt-10 max-w-2xl rounded-xl border border-[var(--ech-border)] bg-[var(--ech-surface-2)] p-4 text-center text-xs text-[var(--ech-text-muted)] flex items-center justify-center gap-2">
        <Info size={15} className="shrink-0 text-emerald-600" />
        <span>Gói học kích hoạt trực tiếp theo tài khoản. Bạn có thể thay đổi hoặc nâng cấp gói bất kỳ lúc nào.</span>
      </aside>
    </main>
  );
}
