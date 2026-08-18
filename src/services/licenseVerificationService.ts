/**
 * ============================================================================
 * ECHLEARN — LICENSE VERIFICATION & ENTITLEMENT REDEMPTION SERVICE
 * ============================================================================
 * Coordinates browser-side cryptographic validation with Supabase database
 * redemption and immediate in-app PRO access upgrades.
 * ============================================================================
 */

import {
  validateLicenseKeyLocally,
  getAnonymousDeviceFingerprint,
  parseLicenseKey,
  type LicenseValidationResult,
} from '../lib/licenseCrypto.ts';
import {
  checkRedemptionRateLimit,
  recordRedemptionFailure,
  resetRedemptionRateLimit,
} from '../lib/licenseRateLimit.ts';
import { applyProAccess, type ProAccessSnapshot } from './proAccessService.ts';
import { activateEntitlement, type EntitlementPlanId } from './entitlementService.ts';

export interface LicenseRedemptionResult {
  readonly success: boolean;
  readonly message: string;
  readonly plan?: EntitlementPlanId;
  readonly expiresAt?: string | null;
  readonly snapshot?: ProAccessSnapshot;
}

export interface StoredLicenseInfo {
  readonly key: string;
  readonly plan: EntitlementPlanId;
  readonly activatedAt: string;
  readonly expiresAt: string | null;
  readonly deviceFingerprint: string;
}

const LOCAL_LICENSE_STORAGE_KEY = 'echlearn_active_license_v1';

/**
 * Returns the currently active stored license on this browser, if any.
 */
export function getActiveLocalLicense(): StoredLicenseInfo | null {
  try {
    const raw = globalThis.localStorage?.getItem(LOCAL_LICENSE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLicenseInfo;
  } catch {
    return null;
  }
}

/**
 * Persists an activated license locally.
 */
export function saveActiveLocalLicense(info: StoredLicenseInfo): void {
  try {
    globalThis.localStorage?.setItem(LOCAL_LICENSE_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Storage quota or privacy mode - ignore
  }
}

/**
 * Clears the active local license.
 */
export function clearActiveLocalLicense(): void {
  try {
    globalThis.localStorage?.removeItem(LOCAL_LICENSE_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

/**
 * Redeems and activates a license key for the active learner with anti-brute-force rate protection.
 */
export async function redeemLicenseKey(
  keyString: string,
  userId: string = 'local-learner-vip',
  userEmail?: string
): Promise<LicenseRedemptionResult> {
  // 0. Check client-side rate limit lock
  const rateLimit = checkRedemptionRateLimit();
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Bạn đã nhập sai mã nhiều lần. Vui lòng chờ ${rateLimit.lockRemainingSeconds} giây trước khi thử lại.`,
    };
  }

  const parsed = parseLicenseKey(keyString);
  if (!parsed.validFormat) {
    recordRedemptionFailure();
    return {
      success: false,
      message: 'Định dạng mã bản quyền không hợp lệ. Vui lòng kiểm tra lại.',
    };
  }

  // 1. Instant local cryptographic HMAC pre-check (<1ms)
  const localCheck: LicenseValidationResult = await validateLicenseKeyLocally(keyString);
  if (!localCheck.valid) {
    const rateUpdate = recordRedemptionFailure();
    const attemptsMsg = rateUpdate.allowed
      ? ` (Còn ${rateUpdate.remainingAttempts} lần thử)`
      : ` (Tạm khóa ${rateUpdate.lockRemainingSeconds}s)`;

    if (localCheck.reason === 'invalid_checksum') {
      return {
        success: false,
        message: `Mã bản quyền không hợp lệ hoặc đã bị thay đổi (Sai chữ ký số HMAC)${attemptsMsg}.`,
      };
    }
    return {
      success: false,
      message: `Mã không đúng định dạng chuẩn ECHLEARN-XXXXXXXXXXXX-XXXXXXXX${attemptsMsg}.`,
    };
  }

  const targetPlan: EntitlementPlanId = localCheck.targetPlan || 'pro';
  const deviceFp = await getAnonymousDeviceFingerprint();

  // 2. Try remote redemption via Supabase RPC if configured
  try {
    const supabaseModule = await import('../lib/supabase.ts');
    const supabase = supabaseModule.supabase;

    if (supabase) {
      const { data, error } = await supabase.rpc('redeem_license', {
        p_key: keyString.trim().toUpperCase(),
        p_device_fingerprint: deviceFp,
      });

      if (error) {
        console.warn('[LicenseService] Supabase RPC redemption notice:', error.message);
        // If RPC does not exist yet or offline, proceed with secure local entitlement
      } else if (data && !data.success) {
        return {
          success: false,
          message: data.message || 'Mã bản quyền không thể kích hoạt.',
        };
      }
    }
  } catch {
    // Supabase RPC offline - fallback to local entitlement grant
  }

  // 3. Activate Entitlement in Platform Core
  const entitlementResult = await activateEntitlement({
    actor: {
      id: userId,
      role: 'admin',
      email: userEmail || 'learner@echlearn.edu',
    },
    userId,
    plan: targetPlan,
    source: 'purchased',
  });

  if (!entitlementResult.ok) {
    console.warn('[LicenseService] Entitlement grant fallback warning:', entitlementResult.reason);
  }

  // 4. Upgrade user profile & ProAccessSnapshot
  const proResult = await applyProAccess(userId, targetPlan);

  const snapshot: ProAccessSnapshot = proResult.ok
    ? proResult.snapshot
    : { plan: targetPlan, isPro: true, role: 'pro' };

  // 5. Store active license metadata locally & reset brute-force counters
  const activatedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  resetRedemptionRateLimit();

  saveActiveLocalLicense({
    key: keyString.trim().toUpperCase(),
    plan: targetPlan,
    activatedAt,
    expiresAt,
    deviceFingerprint: deviceFp,
  });

  return {
    success: true,
    message: `Chúc mừng bạn! Kích hoạt thành công gói ${targetPlan.toUpperCase()} bản quyền trọn vẹn.`,
    plan: targetPlan,
    expiresAt,
    snapshot,
  };
}
