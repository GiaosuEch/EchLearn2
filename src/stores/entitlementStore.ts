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
import { resolveProAccess, writeLocalProFlags } from '../services/proAccessService';

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

    // The server RPC writes the ledger and profile flags atomically. Keep only a
    // local mirror for an immediate UI update; it does not grant server access.
    writeLocalProFlags(input.userId, resolveProAccess(input.plan, undefined));

    set({ records: await readEntitlementsForUser(input.userId) });
    return result;
  },
}));
