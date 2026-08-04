import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEntitlementStore } from '../stores/entitlementStore';
import {
  fetchProAccess,
  highestPlan,
  readLocalProFlags,
  type ProAccessSnapshot,
} from '../services/proAccessService';
import { resolveProFeatureFlags, type ProFeatureFlags } from '../services/proFeatureFlags';
import type { EntitlementPlanId } from '../services/entitlementService';

export interface UseProAccessResult {
  readonly isPro: boolean;
  readonly plan: EntitlementPlanId;
  readonly role: 'admin' | 'pro' | 'user';
  readonly flags: ProFeatureFlags;
  /** True until the authoritative profile row has been read at least once. */
  readonly isResolving: boolean;
}

/**
 * Single source of truth for PRO gating in the UI.
 *
 * It reconciles two inputs so a freshly-granted account lights up immediately
 * instead of waiting for a re-login:
 *   - `profiles.role` / `profiles.is_pro` (authoritative, fetched once per user)
 *   - the local entitlement ledger (instant, survives an offline backend)
 *
 * The remote snapshot is seeded synchronously from its localStorage mirror, so a
 * redirecting gate never sees a phantom "free" frame on the first render and
 * bounces a PRO learner to the pricing page.
 */
export function useProAccess(): UseProAccessResult {
  const user = useAuthStore((state) => state.user);
  const records = useEntitlementStore((state) => state.records);
  const getActiveForUser = useEntitlementStore((state) => state.getActiveForUser);
  const refreshEntitlements = useEntitlementStore((state) => state.refresh);

  const userId = user?.id ?? null;

  const [remote, setRemote] = useState<ProAccessSnapshot | null>(() =>
    userId ? readLocalProFlags(userId) : null,
  );
  const [isResolving, setIsResolving] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setRemote(null);
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    // Re-seed from the mirror first: switching accounts must not carry the
    // previous learner's flags into the gap before the fetch resolves.
    setRemote(readLocalProFlags(userId));
    setIsResolving(true);

    void Promise.all([fetchProAccess(userId), refreshEntitlements(userId)])
      .then(([snapshot]) => {
        if (cancelled || !snapshot) return;
        setRemote(snapshot);
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, refreshEntitlements]);

  return useMemo(() => {
    const ledgerPlan = userId ? getActiveForUser(userId)?.plan ?? null : null;
    // Whichever source claims the higher tier wins, so neither a stale profile
    // row nor a stale ledger row can lock a paying learner out.
    const plan = highestPlan(remote?.plan, ledgerPlan);
    const role = user?.role === 'admin' ? 'admin' : remote?.role ?? 'user';

    const flags = resolveProFeatureFlags({ role, isPro: remote?.isPro, plan });

    return {
      isPro: flags.showProBadge,
      plan,
      role,
      flags,
      isResolving,
    };
    // `records` participates so a fresh activation in this tab re-derives the plan.
  }, [userId, user?.role, remote, records, getActiveForUser, isResolving]);
}
