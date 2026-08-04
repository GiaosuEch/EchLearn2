import { create } from 'zustand';
import type { EntitlementPlanId } from '../services/entitlementService';
import {
  DEFAULT_PLAN_PRICES,
  fetchPlanPrices,
  readStoredPrices,
  resetPlanPricesToDefaults,
  savePlanPrice,
  subscribeToPlanPrices,
  writeStoredPrices,
  type PlanPriceConfig,
  type PlanPriceMap,
  type PricingUnsubscribe,
} from '../services/pricingService';

export type { PlanPriceConfig } from '../services/pricingService';

interface PricingState {
  prices: PlanPriceMap;
  /** True while the first server fetch is in flight. */
  isHydrating: boolean;
  /** Set when the last admin write could not reach Supabase. */
  syncError: string | null;
  /** Bumped on every externally-received update so views can flash "giá vừa cập nhật". */
  lastSyncedAt: number | null;

  hydrate: () => Promise<void>;
  connectRealtime: () => PricingUnsubscribe;
  updatePrice: (planId: EntitlementPlanId, updates: Partial<PlanPriceConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

let realtimeUnsubscribe: PricingUnsubscribe | null = null;
let realtimeSubscriberCount = 0;

export const usePricingStore = create<PricingState>((set, get) => ({
  // Start from the local cache so the first paint is never empty, then reconcile
  // with the server in `hydrate()`.
  prices: readStoredPrices(),
  isHydrating: false,
  syncError: null,
  lastSyncedAt: null,

  hydrate: async () => {
    set({ isHydrating: true });
    const prices = await fetchPlanPrices();
    writeStoredPrices(prices);
    set({ prices, isHydrating: false, lastSyncedAt: Date.now() });
  },

  connectRealtime: () => {
    realtimeSubscriberCount += 1;

    if (!realtimeUnsubscribe) {
      realtimeUnsubscribe = subscribeToPlanPrices((prices) => {
        writeStoredPrices(prices);
        set({ prices, lastSyncedAt: Date.now(), syncError: null });
      });
    }

    return () => {
      realtimeSubscriberCount = Math.max(0, realtimeSubscriberCount - 1);
      if (realtimeSubscriberCount === 0 && realtimeUnsubscribe) {
        realtimeUnsubscribe();
        realtimeUnsubscribe = null;
      }
    };
  },

  updatePrice: async (planId, updates) => {
    const current = get().prices;
    const nextConfig: PlanPriceConfig = { ...current[planId], ...updates };
    const nextPrices: PlanPriceMap = { ...current, [planId]: nextConfig };

    // Optimistic: the admin sees their own edit instantly.
    set({ prices: nextPrices, syncError: null, lastSyncedAt: Date.now() });

    const result = await savePlanPrice(planId, nextConfig, nextPrices);
    set({ syncError: result.ok === false ? result.reason : null });
  },

  resetToDefaults: async () => {
    set({ prices: { ...DEFAULT_PLAN_PRICES }, syncError: null, lastSyncedAt: Date.now() });
    const result = await resetPlanPricesToDefaults();
    set({ syncError: result.ok === false ? result.reason : null });
  },
}));
