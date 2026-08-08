export const LOCAL_ENTITLEMENT_STORAGE_KEY = 'echlearn_local_entitlements_v1';
const GIAOSUECH_ADMIN_EMAIL = 'khounguyennguyen2012@gmail.com';

export type EntitlementPlanId = 'free' | 'go' | 'plus' | 'pro';
export type EntitlementSource = 'trial' | 'purchased';
export type EntitlementLanguageAccess = 'starter' | 'starter-plus-one' | 'multiple' | 'all';
export type EntitlementRole = 'admin' | 'user';

export interface EntitlementPlan {
  readonly id: EntitlementPlanId;
  readonly name: 'Free' | 'GO' | 'PLUS' | 'PRO';
  readonly durationDays: number | null;
  readonly languageAccess: EntitlementLanguageAccess;
  readonly activeLanguageLimit: number | null;
  readonly starterLanguages: readonly string[];
}

export interface LocalEntitlement {
  readonly userId: string;
  readonly plan: EntitlementPlanId;
  readonly source: EntitlementSource;
  readonly activatedBy: string;
  readonly activatedAt: string;
  readonly expiresAt: string | null;
}

export interface EntitlementActor {
  readonly id: string;
  readonly role?: EntitlementRole;
  readonly email?: string;
}

export interface ActivateEntitlementInput {
  readonly actor: EntitlementActor;
  readonly userId: string;
  readonly plan: EntitlementPlanId;
  readonly source: EntitlementSource;
}

export type EntitlementActivationResult =
  | { readonly ok: true; readonly entitlement: LocalEntitlement }
  | { readonly ok: false; readonly reason: 'admin-required' | 'invalid-user-id' | 'local-storage-unavailable' };

export interface LocalStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const ENTITLEMENT_PLANS: readonly EntitlementPlan[] = [
  {
    id: 'free',
    name: 'Free',
    durationDays: 90,
    languageAccess: 'starter',
    activeLanguageLimit: 3,
    starterLanguages: ['en', 'zh', 'ja'],
  },
  {
    id: 'go',
    name: 'GO',
    durationDays: 180,
    languageAccess: 'starter-plus-one',
    activeLanguageLimit: 4,
    starterLanguages: ['en', 'zh', 'ja'],
  },
  {
    id: 'plus',
    name: 'PLUS',
    durationDays: 365,
    languageAccess: 'multiple',
    activeLanguageLimit: null,
    starterLanguages: [],
  },
  {
    id: 'pro',
    name: 'PRO',
    durationDays: null,
    languageAccess: 'all',
    activeLanguageLimit: null,
    starterLanguages: [],
  },
] as const;

const planById = new Map<EntitlementPlanId, EntitlementPlan>(ENTITLEMENT_PLANS.map((plan) => [plan.id, plan]));

const PLAN_TIER_PRIORITY: Record<EntitlementPlanId, number> = {
  pro: 4,
  plus: 3,
  go: 2,
  free: 1,
};

export function getEntitlementPolicy(plan: EntitlementPlanId): EntitlementPlan {
  const policy = planById.get(plan);
  if (!policy) throw new Error(`Unknown entitlement plan: ${plan}`);
  return policy;
}

export function canUseEntitlementLanguages(plan: EntitlementPlanId, activeLanguages: readonly string[]): boolean {
  const policy = getEntitlementPolicy(plan);
  const selected = [...new Set(activeLanguages.map((language) => language.trim().toLowerCase()).filter(Boolean))];

  if (policy.activeLanguageLimit !== null && selected.length > policy.activeLanguageLimit) return false;
  if (policy.languageAccess === 'starter') {
    return selected.every((language) => policy.starterLanguages.includes(language));
  }
  if (policy.languageAccess === 'starter-plus-one') {
    const additionalLanguages = selected.filter((language) => !policy.starterLanguages.includes(language));
    return additionalLanguages.length <= 1
      && (additionalLanguages.length === 0 || selected.some((language) => policy.starterLanguages.includes(language)));
  }
  return true;
}

function isPlanId(value: unknown): value is EntitlementPlanId {
  return value === 'free' || value === 'go' || value === 'plus' || value === 'pro';
}

function isSource(value: unknown): value is EntitlementSource {
  return value === 'trial' || value === 'purchased';
}

function isLocalEntitlement(value: unknown): value is LocalEntitlement {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.userId === 'string'
    && isPlanId(record.plan)
    && isSource(record.source)
    && typeof record.activatedBy === 'string'
    && typeof record.activatedAt === 'string'
    && (typeof record.expiresAt === 'string' || record.expiresAt === null);
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function readRecords(storage: LocalStorageAdapter): LocalEntitlement[] {
  try {
    const raw = storage.getItem(LOCAL_ENTITLEMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isLocalEntitlement)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRecords(storage: LocalStorageAdapter, records: readonly LocalEntitlement[]): boolean {
  try {
    storage.setItem(LOCAL_ENTITLEMENT_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function isEntitlementActive(entitlement: LocalEntitlement, now: Date = new Date()): boolean {
  if (entitlement.expiresAt === null) return true;
  const expiresAt = new Date(entitlement.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
}

export function findActiveEntitlement(
  recordsOrUserId: readonly LocalEntitlement[] | string,
  userIdOrRecords: string | readonly LocalEntitlement[],
  now: Date = new Date(),
): LocalEntitlement | null {
  const records = Array.isArray(recordsOrUserId)
    ? recordsOrUserId
    : Array.isArray(userIdOrRecords)
    ? userIdOrRecords
    : [];
  const targetUserId = typeof recordsOrUserId === 'string'
    ? recordsOrUserId
    : typeof userIdOrRecords === 'string'
    ? userIdOrRecords
    : '';

  if (!targetUserId || !records.length) return null;
  
  const userRecords = records.filter(
    (item) => item?.userId === targetUserId && isEntitlementActive(item, now)
  );

  if (userRecords.length === 0) return null;

  userRecords.sort((a, b) => {
    const prioA = PLAN_TIER_PRIORITY[a.plan as EntitlementPlanId] || 0;
    const prioB = PLAN_TIER_PRIORITY[b.plan as EntitlementPlanId] || 0;
    return prioB - prioA;
  });

  return userRecords[0];
}

export interface LocalEntitlementService {
  list(): LocalEntitlement[];
  getActiveForUser(userId: string): LocalEntitlement | null;
  activate(input: ActivateEntitlementInput): EntitlementActivationResult;
}

export function createLocalEntitlementService(
  storage: LocalStorageAdapter,
  now: () => Date = () => new Date(),
): LocalEntitlementService {
  return {
    list: () => readRecords(storage),
    getActiveForUser: (userId) => findActiveEntitlement(readRecords(storage), userId, now()),
    activate: (input) => {
      const isAdmin = input.actor.email?.toLowerCase().trim() === GIAOSUECH_ADMIN_EMAIL;

      if (!isAdmin) {
        return { ok: false, reason: 'admin-required' };
      }
      if (!input.userId.trim()) return { ok: false, reason: 'invalid-user-id' };

      const activatedAt = now();
      const policy = getEntitlementPolicy(input.plan);
      const entitlement: LocalEntitlement = {
        userId: input.userId.trim(),
        plan: input.plan,
        source: input.source,
        activatedBy: input.actor.id,
        activatedAt: activatedAt.toISOString(),
        expiresAt: policy.durationDays === null ? null : addUtcDays(activatedAt, policy.durationDays).toISOString(),
      };
      const existing = readRecords(storage).filter((record) => record.userId !== entitlement.userId);
      if (!writeRecords(storage, [...existing, entitlement])) {
        return { ok: false, reason: 'local-storage-unavailable' };
      }
      return { ok: true, entitlement };
    },
  };
}

function getBrowserStorage(): LocalStorageAdapter | null {
  try {
    const storage = globalThis.localStorage;
    return storage ? storage : null;
  } catch {
    return null;
  }
}

export function readBrowserEntitlements(): LocalEntitlement[] {
  const storage = getBrowserStorage();
  return storage ? readRecords(storage) : [];
}

export function activateBrowserEntitlement(input: ActivateEntitlementInput): EntitlementActivationResult {
  const storage = getBrowserStorage();
  if (!storage) return { ok: false, reason: 'local-storage-unavailable' };
  return createLocalEntitlementService(storage).activate(input);
}

type RemoteEntitlementRow = {
  user_id: string;
  plan: EntitlementPlanId;
  source: EntitlementSource;
  activated_by: string;
  activated_at: string;
  expires_at: string | null;
};

async function getSupabaseRuntime() {
  return import('../lib/supabase.ts');
}

function fromRemoteRow(row: RemoteEntitlementRow): LocalEntitlement {
  return {
    userId: row.user_id,
    plan: row.plan,
    source: row.source,
    activatedBy: row.activated_by,
    activatedAt: row.activated_at,
    expiresAt: row.expires_at,
  };
}

export async function readEntitlementsForUser(userId: string): Promise<LocalEntitlement[]> {
  const localRecords = readBrowserEntitlements().filter((record) => record.userId === userId);

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) {
      return localRecords;
    }

    const { data, error } = await supabase
      .from('course_entitlements')
      .select('user_id, plan, source, activated_by, activated_at, expires_at')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return localRecords;
    }

    const remoteRecords = (data as RemoteEntitlementRow[]).map(fromRemoteRow);
    const combined = [...remoteRecords, ...localRecords];
    const userMap = new Map<string, LocalEntitlement>();

    combined.forEach(record => {
      const existing = userMap.get(record.userId);
      if (!existing || (isEntitlementActive(record) && !isEntitlementActive(existing))) {
        userMap.set(record.userId, record);
      }
    });

    return Array.from(userMap.values());
  } catch {
    return localRecords;
  }
}

export async function activateEntitlement(input: ActivateEntitlementInput): Promise<EntitlementActivationResult> {
  const localValidation = activateBrowserEntitlement(input);
  if (!localValidation.ok) return localValidation;

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (isSupabaseConfigured() && supabase) {
      const targetUid = input.userId.trim();
      const isProPlan = input.plan === 'pro' || input.plan === 'plus';

      // 1. Direct Table Insert / Upsert into course_entitlements
      await supabase.from('course_entitlements').upsert({
        user_id: targetUid,
        plan: input.plan,
        source: input.source,
        activated_by: input.actor.id,
        activated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,plan' });

      // 2. Direct Profile update so any device logging in reads the granted PRO tier
      await supabase.from('profiles').update({
        subscription_tier: input.plan,
        is_pro: isProPlan,
        role: input.plan === 'pro' && targetUid.toLowerCase() === 'khounguyennguyen2012@gmail.com' ? 'admin' : undefined,
        updated_at: new Date().toISOString(),
      }).eq('id', targetUid);

      // 3. Backup RPC call
      await supabase.rpc('activate_course_entitlement', {
        p_user_id: targetUid,
        p_plan: input.plan,
        p_source: input.source,
      });
    }
  } catch {
    // Non-blocking fallback to local storage
  }

  return localValidation;
}
