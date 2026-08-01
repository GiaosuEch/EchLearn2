import { create } from 'zustand';
import type { EntitlementPlanId } from '../services/entitlementService';

export interface PlanPriceConfig {
  price: string;
  originalPrice?: string;
  period: string;
  badge?: string;
}

const PRICING_STORAGE_KEY = 'echlearn_plan_prices_v1';

const DEFAULT_PLAN_PRICES: Record<EntitlementPlanId, PlanPriceConfig> = {
  free: { price: '0 VNĐ', period: '90 Ngày dùng thử' },
  go: { price: '199.000 VNĐ', originalPrice: '299.000 VNĐ', period: '6 Tháng (~33k/tháng)' },
  plus: { price: '399.000 VNĐ', originalPrice: '599.000 VNĐ', period: '12 Tháng (~33k/tháng)', badge: 'Phổ biến nhất' },
  pro: { price: '799.000 VNĐ', originalPrice: '1.299.000 VNĐ', period: 'Trọn đời (Dùng mãi mãi)', badge: 'VIP Trọn Đời' },
};

function readStoredPrices(): Record<EntitlementPlanId, PlanPriceConfig> {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAN_PRICES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PLAN_PRICES, ...parsed };
  } catch {
    return { ...DEFAULT_PLAN_PRICES };
  }
}

function writePrices(prices: Record<EntitlementPlanId, PlanPriceConfig>) {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(prices));
  } catch {}
}

interface PricingState {
  prices: Record<EntitlementPlanId, PlanPriceConfig>;
  updatePrice: (planId: EntitlementPlanId, updates: Partial<PlanPriceConfig>) => void;
  resetToDefaults: () => void;
}

export const usePricingStore = create<PricingState>((set, get) => ({
  prices: readStoredPrices(),
  updatePrice: (planId, updates) => {
    const current = get().prices;
    const updated = {
      ...current,
      [planId]: { ...current[planId], ...updates },
    };
    writePrices(updated);
    set({ prices: updated });
  },
  resetToDefaults: () => {
    writePrices(DEFAULT_PLAN_PRICES);
    set({ prices: { ...DEFAULT_PLAN_PRICES } });
  },
}));
