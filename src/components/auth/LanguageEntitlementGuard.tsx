import { useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useAppStore } from '../../stores/appStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { toast } from '../ui/Toast';

export default function LanguageEntitlementGuard() {
  const [searchParams] = useSearchParams();
  const currentLanguage = useAppStore((state) => state.currentLanguage);

  // The plan comes from `useProAccess`, not the local ledger alone: a PRO grant
  // made from the admin panel lives in `profiles.role` / `profiles.is_pro`, and
  // reading only the ledger locked those accounts out on every other device.
  const { plan, flags, isResolving } = useProAccess();

  const urlLang = searchParams?.get('lang') || searchParams?.get('targetLang') || currentLanguage || 'en';
  const canUse = flags.unlockAllLanguages || canUseEntitlementLanguages(plan, [urlLang]);

  useEffect(() => {
    if (!canUse && !isResolving) {
      toast(`Gói Free không hỗ trợ ngôn ngữ "${urlLang.toUpperCase()}". Vui lòng nâng cấp gói GO / PLUS / PRO để mở khóa!`, 'warning');
    }
  }, [canUse, isResolving, urlLang]);

  // Never redirect on an unresolved plan — that is what bounced a PRO learner to
  // the pricing page for the first frame after a hard reload.
  if (isResolving) return <Outlet />;

  if (!canUse) {
    return <Navigate to="/app/pricing" replace />;
  }

  return <Outlet />;
}
