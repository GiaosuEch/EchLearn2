import type { EntitlementPlanId } from './entitlementService.ts';

/**
 * PRO access is a *profile* flag, not a UI guess.
 *
 * Before this service the admin panel only appended a row to the entitlement
 * ledger, so `profiles.role` / `profiles.is_pro` stayed at their signup values
 * and every RLS policy and feature gate that read the profile saw a free user.
 * `applyProAccess` is called right after an entitlement activation so the two
 * never drift.
 */

/** Plans that unlock the full PRO feature set. */
const PRO_PLANS: readonly EntitlementPlanId[] = ['plus', 'pro'];

export function planUnlocksPro(plan: EntitlementPlanId | null | undefined): boolean {
  return Boolean(plan && (PRO_PLANS as readonly string[]).includes(plan));
}

/** Ordering used whenever two sources disagree about the plan. */
const PLAN_RANK: Record<EntitlementPlanId, number> = { free: 0, go: 1, plus: 2, pro: 3 };

/**
 * Returns the more generous of two plans.
 *
 * The profile row and the local ledger can legitimately disagree — a grant made
 * on another device has not reached this browser's ledger yet, and an offline
 * activation has not reached the profile yet. Taking the maximum means neither
 * stale source can lock a paying learner out.
 */
export function highestPlan(
  a: EntitlementPlanId | null | undefined,
  b: EntitlementPlanId | null | undefined,
): EntitlementPlanId {
  const left = a && a in PLAN_RANK ? a : 'free';
  const right = b && b in PLAN_RANK ? b : 'free';
  return PLAN_RANK[left] >= PLAN_RANK[right] ? left : right;
}

export interface ProAccessSnapshot {
  readonly plan: EntitlementPlanId;
  readonly isPro: boolean;
  /** 'admin' outranks 'pro' and is never downgraded by a plan change. */
  readonly role: 'admin' | 'pro' | 'user';
}

export function resolveProAccess(
  plan: EntitlementPlanId,
  currentRole: string | undefined,
): ProAccessSnapshot {
  const isPro = planUnlocksPro(plan);
  const role = currentRole === 'admin' ? 'admin' : isPro ? 'pro' : 'user';
  return { plan, isPro, role };
}

const PRO_FLAG_STORAGE_PREFIX = 'echlearn_pro_flags_';

function proFlagKey(userId: string): string {
  return `${PRO_FLAG_STORAGE_PREFIX}${userId}`;
}

/** Local mirror so PRO gates work in the offline/localStorage backend mode too. */
export function readLocalProFlags(userId: string): ProAccessSnapshot | null {
  try {
    const raw = globalThis.localStorage?.getItem(proFlagKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProAccessSnapshot>;
    if (typeof parsed?.isPro !== 'boolean' || typeof parsed?.plan !== 'string') return null;
    return {
      plan: parsed.plan as EntitlementPlanId,
      isPro: parsed.isPro,
      role: parsed.role === 'admin' ? 'admin' : parsed.role === 'pro' ? 'pro' : 'user',
    };
  } catch {
    return null;
  }
}

export function writeLocalProFlags(userId: string, snapshot: ProAccessSnapshot): void {
  try {
    globalThis.localStorage?.setItem(proFlagKey(userId), JSON.stringify(snapshot));
  } catch {
    // Storage unavailable — remote flags remain the source of truth.
  }
}

async function getSupabaseRuntime() {
  return import('../lib/supabase.ts');
}

export type ApplyProAccessResult =
  | { readonly ok: true; readonly snapshot: ProAccessSnapshot; readonly synced: 'remote' | 'local' }
  | { readonly ok: false; readonly reason: string };

/**
 * Writes `profiles.role` and `profiles.is_pro` for a learner. Goes through the
 * `admin_set_pro_access` RPC (SECURITY DEFINER + GiaosuEch check) so a learner
 * can never self-grant, and mirrors locally for the offline backend mode.
 */
export async function applyProAccess(
  userId: string,
  plan: EntitlementPlanId,
  currentRole?: string,
): Promise<ApplyProAccessResult> {
  const trimmedId = userId.trim();
  if (!trimmedId) return { ok: false, reason: 'invalid-user-id' };

  const snapshot = resolveProAccess(plan, currentRole);
  writeLocalProFlags(trimmedId, snapshot);

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) {
      return { ok: true, snapshot, synced: 'local' };
    }

    const { error } = await supabase.rpc('admin_set_pro_access', {
      p_user_id: trimmedId,
      p_plan: plan,
      p_is_pro: snapshot.isPro,
    });

    if (error) return { ok: false, reason: error.message };
    return { ok: true, snapshot, synced: 'remote' };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown-error' };
  }
}

// Several gates mount at once (guard, roadmap, lesson player, badge). Without
// this map each one would issue its own profile SELECT on every navigation.
const inFlightFetches = new Map<string, Promise<ProAccessSnapshot | null>>();

/** Reads the authoritative flags back from the profile row. */
export function fetchProAccess(userId: string): Promise<ProAccessSnapshot | null> {
  const trimmedId = userId.trim();
  if (!trimmedId) return Promise.resolve(null);

  const pending = inFlightFetches.get(trimmedId);
  if (pending) return pending;

  const request = fetchProAccessUncached(trimmedId).finally(() => {
    inFlightFetches.delete(trimmedId);
  });
  inFlightFetches.set(trimmedId, request);
  return request;
}

async function fetchProAccessUncached(trimmedId: string): Promise<ProAccessSnapshot | null> {
  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return readLocalProFlags(trimmedId);

    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_pro, subscription_tier')
      .eq('id', trimmedId)
      .maybeSingle();

    if (error || !data) return readLocalProFlags(trimmedId);

    const row = data as { role?: string; is_pro?: boolean; subscription_tier?: string };
    const snapshot: ProAccessSnapshot = {
      plan: (row.subscription_tier as EntitlementPlanId) || 'free',
      isPro: Boolean(row.is_pro) || row.role === 'admin',
      role: row.role === 'admin' ? 'admin' : row.role === 'pro' ? 'pro' : 'user',
    };
    writeLocalProFlags(trimmedId, snapshot);
    return snapshot;
  } catch {
    return readLocalProFlags(trimmedId);
  }
}
