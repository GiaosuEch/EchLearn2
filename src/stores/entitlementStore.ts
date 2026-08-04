import { create } from 'zustand';
import {
  activateEntitlement,
  findActiveEntitlement,
  readEntitlementsForUser,
  readBrowserEntitlements,
  type ActivateEntitlementInput,
  type EntitlementActivationResult,
  type LocalEntitlement,
} from '../services/entitlementService';
import { applyProAccess } from '../services/proAccessService';

interface EntitlementState {
  readonly records: readonly LocalEntitlement[];
  refresh: (userId?: string) => Promise<void>;
  getActiveForUser: (userId: string) => LocalEntitlement | null;
  activate: (input: ActivateEntitlementInput) => Promise<EntitlementActivationResult>;
}

/**
 * A browser-local projection of the explicit admin activation ledger. It does
 * not infer a paid state from UI choices or initiate any payment action.
 */
export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  records: readBrowserEntitlements(),
  refresh: async (userId) => {
    if (!userId) {
      set({ records: readBrowserEntitlements() });
      return;
    }
    const records = await readEntitlementsForUser(userId);
    set({ records });
  },
  getActiveForUser: (userId) => {
    const active = findActiveEntitlement(get().records, userId);
    if (active) return active;
    const localRecords = readBrowserEntitlements();
    return findActiveEntitlement(localRecords, userId);
  },
  activate: async (input) => {
    const result = await activateEntitlement(input);
    if (!result.ok) return result;

    // The ledger row alone never unlocked anything: PRO gates and RLS policies
    // read `profiles.role` / `profiles.is_pro`. Write those in the same step so
    // the two can never disagree.
    await applyProAccess(input.userId, input.plan);

    set({ records: await readEntitlementsForUser(input.userId) });
    return result;
  },
}));
