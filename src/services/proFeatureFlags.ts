import type { EntitlementPlanId } from './entitlementService.ts';
import { planUnlocksPro } from './proAccessService.ts';

/**
 * The single place that answers "what does this account get?".
 *
 * Every gate in the UI reads a named flag from here instead of re-deriving
 * `tier === 'pro'` locally — that duplication was why a freshly-granted PRO
 * account still saw locked lessons in some screens and not others.
 */
export interface ProFeatureFlags {
  /** All lessons/units are playable, no level or day gating. */
  readonly unlockAllLessons: boolean;
  /** Every target language is selectable. */
  readonly unlockAllLanguages: boolean;
  /** Full cosmetic catalogue (mascot skins, banners, themes). */
  readonly unlockAllCosmetics: boolean;
  /** IELTS Academic suite + speaking evaluation. */
  readonly unlockIeltsSuite: boolean;
  /** Suppress in-app promo/ad placements. */
  readonly hideAds: boolean;
  /** Show the PRO badge next to the display name. */
  readonly showProBadge: boolean;
  /** Priority support / VIP Discord entry point. */
  readonly prioritySupport: boolean;
  /** Unlimited hearts (no run-out lockout). */
  readonly unlimitedHearts: boolean;
}

const FREE_FLAGS: ProFeatureFlags = {
  unlockAllLessons: false,
  unlockAllLanguages: false,
  unlockAllCosmetics: false,
  unlockIeltsSuite: false,
  hideAds: false,
  showProBadge: false,
  prioritySupport: false,
  unlimitedHearts: false,
};

const PRO_FLAGS: ProFeatureFlags = {
  unlockAllLessons: true,
  unlockAllLanguages: true,
  unlockAllCosmetics: true,
  unlockIeltsSuite: true,
  hideAds: true,
  showProBadge: true,
  prioritySupport: true,
  unlimitedHearts: true,
};

export interface ProFeatureInput {
  /** `profiles.role` — 'admin' always gets everything. */
  readonly role?: string;
  /** `profiles.is_pro` — the authoritative flag written by the admin panel. */
  readonly isPro?: boolean;
  /** Active entitlement plan, used when the profile flag has not synced yet. */
  readonly plan?: EntitlementPlanId | null;
}

export function isProAccount({ role, isPro, plan }: ProFeatureInput): boolean {
  if (role === 'admin') return true;
  if (role === 'pro') return true;
  if (isPro === true) return true;
  return planUnlocksPro(plan);
}

export function resolveProFeatureFlags(input: ProFeatureInput): ProFeatureFlags {
  return isProAccount(input) ? PRO_FLAGS : FREE_FLAGS;
}

export { FREE_FLAGS as FREE_FEATURE_FLAGS, PRO_FLAGS as PRO_FEATURE_FLAGS };
