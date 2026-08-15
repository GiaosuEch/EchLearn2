import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { resolveLearningPackAccess } from '../../domain/learning/learningPackAccess';
import { useProAccess } from '../../hooks/useProAccess';
import { toast } from '../ui/Toast';

/**
 * UI navigation policy for published language-pack lesson routes. The pack
 * language is resolved from the route itself, never from mutable UI state.
 * Server resources still need independent authorization.
 */
export default function LearningPackEntitlementGuard() {
  const location = useLocation();
  const { plan, flags, isResolving } = useProAccess();
  const access = resolveLearningPackAccess(location.pathname, plan, flags.unlockAllLanguages);

  useEffect(() => {
    if (!isResolving && !access.allowed && access.reason === 'plan-restriction') {
      toast(`Gói hiện tại chưa hỗ trợ ngôn ngữ ${access.language?.toUpperCase() ?? ''}.`, 'warning');
    }
  }, [access, isResolving]);

  if (isResolving) return <Outlet />;
  if (!access.allowed) return <Navigate to="/app/pricing" replace />;
  return <Outlet />;
}
