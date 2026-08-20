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
import type { ProAccessSnapshot } from './proAccessService.ts';
import type { EntitlementPlanId } from './entitlementService.ts';

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
    const parsed = JSON.parse(raw) as StoredLicenseInfo;
    if (!parsed || typeof parsed.key !== 'string') return null;

    // Older releases persisted the complete bearer-like license key. Migrate it
    // to a masked display value as soon as it is read.
    const maskedKey = maskLicenseKey(parsed.key);
    if (maskedKey !== parsed.key) {
      const sanitized = { ...parsed, key: maskedKey };
      globalThis.localStorage?.setItem(LOCAL_LICENSE_STORAGE_KEY, JSON.stringify(sanitized));
      return sanitized;
    }
    return parsed;
  } catch {
    return null;
  }
}

function maskLicenseKey(key: string): string {
  const normalized = key.trim().toUpperCase();
  const parts = normalized.split('-');
  if (parts.length !== 3) return '••••••••';
  return `${parts[0]}-••••••••••••-${parts[2].slice(-4).padStart(8, '•')}`;
}

/**
 * Persists an activated license locally.
 */
export function saveActiveLocalLicense(info: StoredLicenseInfo): void {
  try {
    const sanitized = { ...info, key: maskLicenseKey(info.key) };
    globalThis.localStorage?.setItem(LOCAL_LICENSE_STORAGE_KEY, JSON.stringify(sanitized));
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
  _userEmail?: string
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

  const deviceFp = await getAnonymousDeviceFingerprint();

  // Paid access is server-authoritative. The local HMAC is only an inexpensive
  // typo filter; it must never create an entitlement when the server is absent.
  try {
    const { isSupabaseConfigured, supabase } = await import('../lib/supabase.ts');
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Kích hoạt bản quyền yêu cầu kết nối với máy chủ.' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== userId) {
      return { success: false, message: 'Vui lòng đăng nhập đúng tài khoản trước khi kích hoạt.' };
    }

    const { data, error } = await supabase.rpc('redeem_license', {
      p_key: keyString.trim().toUpperCase(),
      p_device_fingerprint: deviceFp,
    });

    if (error) {
      return { success: false, message: 'Máy chủ chưa thể xác minh mã bản quyền. Vui lòng thử lại.' };
    }

    const response = data as { success?: unknown; message?: unknown; plan?: unknown; expires_at?: unknown } | null;
    if (!response?.success) {
      recordRedemptionFailure();
      return {
        success: false,
        message: typeof response?.message === 'string' ? response.message : 'Mã bản quyền không thể kích hoạt.',
      };
    }

    const targetPlan = response.plan;
    if (targetPlan !== 'go' && targetPlan !== 'plus' && targetPlan !== 'pro') {
      return { success: false, message: 'Máy chủ trả về gói bản quyền không hợp lệ.' };
    }

    const expiresAt = typeof response.expires_at === 'string' ? response.expires_at : null;
    const snapshot: ProAccessSnapshot = {
      plan: targetPlan,
      isPro: targetPlan === 'plus' || targetPlan === 'pro',
      role: targetPlan === 'plus' || targetPlan === 'pro' ? 'pro' : 'user',
    };

    resetRedemptionRateLimit();
    saveActiveLocalLicense({
      key: maskLicenseKey(keyString),
      plan: targetPlan,
      activatedAt: new Date().toISOString(),
      expiresAt,
      deviceFingerprint: deviceFp,
    });

    return {
      success: true,
      message: typeof response.message === 'string'
        ? response.message
        : `Kích hoạt thành công gói ${targetPlan.toUpperCase()}.`,
      plan: targetPlan,
      expiresAt,
      snapshot,
    };
  } catch {
    return { success: false, message: 'Máy chủ chưa thể xác minh mã bản quyền. Vui lòng thử lại.' };
  }
}
