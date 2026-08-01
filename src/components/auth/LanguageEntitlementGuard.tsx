import { useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { useAppStore } from '../../stores/appStore';
import { canUseEntitlementLanguages, findActiveEntitlement } from '../../services/entitlementService';
import { toast } from '../ui/Toast';

export default function LanguageEntitlementGuard() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const records = useEntitlementStore((state) => state.records);
  const currentLanguage = useAppStore((state) => state.currentLanguage);

  const urlLang = searchParams?.get('lang') || searchParams?.get('targetLang') || currentLanguage || 'en';
  const activeEnt = user ? findActiveEntitlement(records, user.id) : null;
  const activePlan = activeEnt?.plan || 'free';

  const canUse = canUseEntitlementLanguages(activePlan, [urlLang]);

  useEffect(() => {
    if (!canUse) {
      toast(`Gói Free không hỗ trợ ngôn ngữ "${urlLang.toUpperCase()}". Vui lòng nâng cấp gói GO / PLUS / PRO để mở khóa!`, 'warning');
    }
  }, [canUse, urlLang]);

  if (!canUse) {
    return <Navigate to="/app/pricing" replace />;
  }

  return <Outlet />;
}
