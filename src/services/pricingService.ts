import type { EntitlementPlanId } from './entitlementService';

export interface PlanPriceConfig {
  price: string;
  originalPrice?: string;
  period: string;
  badge?: string;
}

export type PlanPriceMap = Record<EntitlementPlanId, PlanPriceConfig>;

export const PRICING_STORAGE_KEY = 'echlearn_plan_prices_v1';

/** Broadcast channel name. Every open client subscribes to this. */
export const PRICING_REALTIME_CHANNEL = 'echlearn:plan-prices';

export const DEFAULT_PLAN_PRICES: PlanPriceMap = {
  free: { price: '0 VNĐ', period: '90 Ngày dùng thử' },
  go: { price: '199.000 VNĐ', originalPrice: '299.000 VNĐ', period: '6 Tháng (~33k/tháng)' },
  plus: { price: '399.000 VNĐ', originalPrice: '599.000 VNĐ', period: '12 Tháng (~33k/tháng)', badge: 'Phổ biến nhất' },
  pro: { price: '799.000 VNĐ', originalPrice: '1.299.000 VNĐ', period: 'Trọn đời (Dùng mãi mãi)', badge: 'VIP Trọn Đời' },
};

const PLAN_IDS: readonly EntitlementPlanId[] = ['free', 'go', 'plus', 'pro'];

function isPlanId(value: unknown): value is EntitlementPlanId {
  return typeof value === 'string' && (PLAN_IDS as readonly string[]).includes(value);
}

function sanitizeConfig(raw: unknown, fallback: PlanPriceConfig): PlanPriceConfig {
  if (!raw || typeof raw !== 'object') return fallback;
  const record = raw as Record<string, unknown>;
  const price = typeof record.price === 'string' ? record.price.trim() : '';
  const period = typeof record.period === 'string' ? record.period.trim() : '';
  const originalPrice = typeof record.originalPrice === 'string' ? record.originalPrice.trim() : '';
  const badge = typeof record.badge === 'string' ? record.badge.trim() : '';
  return {
    price: price || fallback.price,
    period: period || fallback.period,
    originalPrice: originalPrice || undefined,
    badge: badge || undefined,
  };
}

/** Merges any partial/untrusted payload onto the defaults so the UI never blanks out. */
export function mergePlanPrices(partial: unknown): PlanPriceMap {
  const source = (partial && typeof partial === 'object' ? partial : {}) as Record<string, unknown>;
  const merged = {} as PlanPriceMap;
  for (const planId of PLAN_IDS) {
    merged[planId] = sanitizeConfig(source[planId], DEFAULT_PLAN_PRICES[planId]);
  }
  return merged;
}

interface PlanPriceRow {
  plan_id: string;
  price: string | null;
  original_price: string | null;
  period: string | null;
  badge: string | null;
}

export type PlanPriceSource = 'remote' | 'fallback';

export interface ResolvedPlanPrices {
  prices: PlanPriceMap;
  source: PlanPriceSource;
}

export function fromPriceRows(rows: readonly PlanPriceRow[]): PlanPriceMap {
  const partial: Record<string, PlanPriceConfig> = {};
  for (const row of rows) {
    if (!isPlanId(row?.plan_id)) continue;
    partial[row.plan_id] = {
      price: row.price ?? DEFAULT_PLAN_PRICES[row.plan_id].price,
      originalPrice: row.original_price ?? undefined,
      period: row.period ?? DEFAULT_PLAN_PRICES[row.plan_id].period,
      badge: row.badge ?? undefined,
    };
  }
  return mergePlanPrices(partial);
}

export function resolvePlanPriceRows(rows: readonly PlanPriceRow[]): ResolvedPlanPrices {
  const hasPublishedPlan = rows.some((row) => isPlanId(row?.plan_id));
  if (!hasPublishedPlan) {
    return { prices: readStoredPrices(), source: 'fallback' };
  }

  return { prices: fromPriceRows(rows), source: 'remote' };
}

export function readStoredPrices(): PlanPriceMap {
  try {
    const raw = globalThis.localStorage?.getItem(PRICING_STORAGE_KEY);
    if (!raw) return mergePlanPrices({});
    return mergePlanPrices(JSON.parse(raw));
  } catch {
    return mergePlanPrices({});
  }
}

export function writeStoredPrices(prices: PlanPriceMap): void {
  try {
    // Writing to localStorage also fires a `storage` event in every OTHER tab of
    // this browser, which is the cross-tab half of the realtime sync.
    globalThis.localStorage?.setItem(PRICING_STORAGE_KEY, JSON.stringify(prices));
  } catch {
    // Private-mode browsers have no storage. Realtime still works.
  }
}

async function getSupabaseRuntime() {
  return import('../lib/supabase.ts');
}

/** Fetches the server-authoritative price table. Falls back to the published local price map. */
export async function fetchPlanPrices(): Promise<ResolvedPlanPrices> {
  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return { prices: readStoredPrices(), source: 'fallback' };

    const { data, error } = await supabase
      .from('plan_prices')
      .select('plan_id, price, original_price, period, badge');

    if (error || !data) return { prices: readStoredPrices(), source: 'fallback' };
    return resolvePlanPriceRows(data as PlanPriceRow[]);
  } catch {
    return { prices: readStoredPrices(), source: 'fallback' };
  }
}

export type SavePlanPriceResult =
  | { ok: true; synced: 'remote' | 'local' }
  | { ok: false; reason: string };

/**
 * Persists one plan's price. On Supabase it goes through the admin RPC, which
 * writes the row — and that row write is what Realtime pushes to other clients.
 * A `broadcast` is sent as well so clients that cannot use `postgres_changes`
 * (e.g. realtime not enabled on the project) still update immediately.
 */
export async function savePlanPrice(
  planId: EntitlementPlanId,
  config: PlanPriceConfig,
  nextPrices: PlanPriceMap,
): Promise<SavePlanPriceResult> {
  writeStoredPrices(nextPrices);

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return { ok: true, synced: 'local' };

    // 1. Direct Table Upsert so it always succeeds even if RPC function has schema drift
    await supabase.from('plan_prices').upsert({
      plan_id: planId,
      price: config.price,
      original_price: config.originalPrice ?? null,
      period: config.period,
      badge: config.badge ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'plan_id' });

    // 2. Backup RPC call
    await supabase.rpc('admin_set_plan_price', {
      p_plan_id: planId,
      p_price: config.price,
      p_original_price: config.originalPrice ?? null,
      p_period: config.period,
      p_badge: config.badge ?? null,
    });

    // 3. Broadcast Realtime payload to all connected devices immediately
    await supabase
      .channel(PRICING_REALTIME_CHANNEL)
      .send({ type: 'broadcast', event: 'prices-updated', payload: { prices: nextPrices } })
      .catch(() => undefined);

    return { ok: true, synced: 'remote' };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown-error' };
  }
}

export async function resetPlanPricesToDefaults(): Promise<SavePlanPriceResult> {
  writeStoredPrices(DEFAULT_PLAN_PRICES);

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return { ok: true, synced: 'local' };

    for (const planId of PLAN_IDS) {
      const config = DEFAULT_PLAN_PRICES[planId];
      await supabase.from('plan_prices').upsert({
        plan_id: planId,
        price: config.price,
        original_price: config.originalPrice ?? null,
        period: config.period,
        badge: config.badge ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'plan_id' });

      await supabase.rpc('admin_set_plan_price', {
        p_plan_id: planId,
        p_price: config.price,
        p_original_price: config.originalPrice ?? null,
        p_period: config.period,
        p_badge: config.badge ?? null,
      });
    }

    await supabase
      .channel(PRICING_REALTIME_CHANNEL)
      .send({ type: 'broadcast', event: 'prices-updated', payload: { prices: DEFAULT_PLAN_PRICES } })
      .catch(() => undefined);

    return { ok: true, synced: 'remote' };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown-error' };
  }
}

export type PricingUnsubscribe = () => void;

/**
 * Subscribes to price changes from every source that can deliver them:
 *   - Supabase `postgres_changes` on public.plan_prices (other devices)
 *   - Supabase `broadcast` on the pricing channel (immediate, no WAL wait)
 *   - the browser `storage` event (other tabs of this same browser)
 */
export function subscribeToPlanPrices(onChange: (prices: PlanPriceMap) => void): PricingUnsubscribe {
  const cleanups: PricingUnsubscribe[] = [];

  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PRICING_STORAGE_KEY) return;
      onChange(readStoredPrices());
    };
    window.addEventListener('storage', handleStorage);
    cleanups.push(() => window.removeEventListener('storage', handleStorage));
  }

  void (async () => {
    try {
      const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
      if (!isSupabaseConfigured() || !supabase) return;

      const channel = supabase
        .channel(PRICING_REALTIME_CHANNEL)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_prices' }, () => {
          void fetchPlanPrices().then((result) => onChange(result.prices));
        })
        .on('broadcast', { event: 'prices-updated' }, (message) => {
          const payload = (message as { payload?: { prices?: unknown } }).payload;
          if (payload?.prices) onChange(mergePlanPrices(payload.prices));
        })
        .subscribe();

      cleanups.push(() => {
        void supabase.removeChannel(channel);
      });
    } catch {
      // Realtime unavailable — storage events and manual refresh still work.
    }
  })();

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
