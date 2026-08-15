import { canUseEntitlementLanguages, type EntitlementPlanId } from '../../services/entitlementService.ts';
import { learningPackRegistry } from '../../packs/learningPacks.ts';

export type LearningPackAccess =
  | { allowed: true; language: string }
  | { allowed: false; language: string; reason: 'plan-restriction' }
  | { allowed: false; language: null; reason: 'unknown-pack-route' };

export function resolveLearningPackAccess(route: string, plan: EntitlementPlanId, unlockAllLanguages: boolean): LearningPackAccess {
  const pack = learningPackRegistry.getPackForRoute(route);
  if (!pack) return { allowed: false, language: null, reason: 'unknown-pack-route' };
  if (unlockAllLanguages || canUseEntitlementLanguages(plan, [pack.manifest.language])) return { allowed: true, language: pack.manifest.language };
  return { allowed: false, language: pack.manifest.language, reason: 'plan-restriction' };
}
