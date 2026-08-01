import { useEffect } from 'react';
import { Check, Clock3, Languages, ShieldCheck, Info } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { usePricingStore } from '../../stores/pricingStore';
import {
  ENTITLEMENT_PLANS,
} from '../../services/entitlementService';
import type { EntitlementPlan, EntitlementPlanId } from '../../services/entitlementService';

function durationLabel(plan: EntitlementPlan): string {
  return plan.durationDays === null ? 'Không thời hạn' : `${plan.durationDays} ngày`;
}

function languageLabel(plan: EntitlementPlan): string {
  switch (plan.languageAccess) {
    case 'starter':
      return '3 ngôn ngữ khởi đầu: Anh, Trung, Nhật';
    case 'starter-plus-one':
      return 'Anh, Trung, Nhật và thêm 1 ngôn ngữ mới';
    case 'multiple':
      return 'Nhiều ngôn ngữ đang học';
    case 'all':
      return 'Toàn bộ ngôn ngữ';
  }
}

function planDescription(plan: EntitlementPlan): string {
  switch (plan.id) {
    case 'free':
      return '90 ngày khởi động, học Anh – Trung – Nhật theo lộ trình kết quả.';
    case 'go':
      return '180 ngày: giữ 3 ngôn ngữ khởi đầu và mở thêm 1 ngôn ngữ.';
    case 'plus':
      return '365 ngày để xây thói quen học đa ngôn ngữ bền vững.';
    case 'pro':
      return 'Quyền truy cập toàn bộ ngôn ngữ, không giới hạn ngày tại thiết bị này.';
  }
}

function isCurrentPlan(planId: EntitlementPlanId, currentPlan: EntitlementPlanId | null): boolean {
  return planId === currentPlan;
}

// Prices are now read from pricingStore (admin-configurable)

const PLAN_FEATURES: Record<EntitlementPlanId, string[]> = {
  free: [
    '3 Ngôn ngữ khởi đầu: Anh, Trung, Nhật',
    'Luyện phát âm & Spaced Repetition SRS',
    'Bản đồ bài học 90 ngày chuẩn hóa',
    'LoFi Lofi Music Study Lab',
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
  const user = useAuthStore((state) => state.user);
  const getActiveForUser = useEntitlementStore((state) => state.getActiveForUser);
  const refreshEntitlements = useEntitlementStore((state) => state.refresh);
  const PLAN_PRICES = usePricingStore((state) => state.prices);
  const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('echlern_current_user_id') : null);
  const currentPlan = currentUserId ? getActiveForUser(currentUserId)?.plan ?? null : null;

  useEffect(() => {
    if (currentUserId) {
      refreshEntitlements(currentUserId);
    }
  }, [currentUserId, refreshEntitlements]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 sm:py-14 font-sans">
      <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={16} aria-hidden="true" /> Bảng Giá Lộ Trình EchLearn
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Chọn Gói Học Phù Hợp Với Lộ Trình Của Bạn
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300 font-medium">
          Giá hợp lý dựa trên quy mô tính năng, số lượng ngôn ngữ mở khóa và dữ liệu học tập thực tế.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Available plans">
        {ENTITLEMENT_PLANS.map((plan) => {
          const active = isCurrentPlan(plan.id, currentPlan);
          const pricing = PLAN_PRICES[plan.id];
          const features = PLAN_FEATURES[plan.id];
          const isHighlighted = plan.id === 'plus' || plan.id === 'pro';

          return (
            <article
              key={plan.id}
              className={`relative flex min-h-[30rem] flex-col rounded-3xl border p-6 transition-all ${
                active
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50 shadow-xl'
                  : isHighlighted
                  ? 'border-emerald-500/60 dark:border-emerald-500/40 bg-white dark:bg-slate-900/90 shadow-xl scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-md'
              }`}
            >
              {pricing.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                  {pricing.badge}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{plan.name}</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {planDescription(plan)}
                  </p>
                </div>
                {active && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                    Đang dùng
                  </span>
                )}
              </div>

              {/* Price Tag Box */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{pricing.price}</span>
                  {pricing.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-bold">{pricing.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 font-mono">
                  {pricing.period}
                </p>
              </div>

              <dl className="mt-5 space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock3 className="shrink-0 text-emerald-500" size={16} />
                  <span><strong>Thời hạn:</strong> {durationLabel(plan)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="shrink-0 text-emerald-500" size={16} />
                  <span><strong>Ngôn ngữ:</strong> {languageLabel(plan)}</span>
                </div>
              </dl>

              {/* Features List */}
              <ul className="mt-5 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500 font-bold" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  disabled={active}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : isHighlighted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 active:scale-95'
                  }`}
                >
                  {active ? 'Gói Hiện Tại' : `Chọn Gói ${plan.name}`}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="mx-auto mt-10 max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center text-xs font-medium leading-6 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2">
        <Info size={16} className="shrink-0" />
        <span><strong>Ghi chú kích hoạt:</strong> Trang này hiển thị minh bạch quyền lợi các gói học. Đối với tài khoản thử nghiệm hoặc đã thanh toán, quản trị viên server sẽ cấp quyền và kích hoạt tài khoản chính thức.</span>
      </aside>
    </main>
  );
}
