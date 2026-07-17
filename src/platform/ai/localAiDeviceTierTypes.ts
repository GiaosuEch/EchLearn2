import type { AIFeatureId } from './aiFeatureRegistry.ts';

export type LocalAiDeviceKind = 'desktop' | 'laptop' | 'mobile' | 'tablet' | 'unknown';
export type LocalAiStorageKind = 'ssd' | 'hdd' | 'flash' | 'unknown';
export type LocalAiBrowserName = 'chrome' | 'edge' | 'safari' | 'firefox' | 'unknown';
export type LocalAiOsName = 'windows' | 'android' | 'ios' | 'macos' | 'linux' | 'unknown';
export type LocalAiWebGpuStatus = 'supported' | 'unsupported' | 'unchecked';
export type LocalAiThermalStatus = 'normal' | 'warm' | 'hot' | 'unknown';
export type LocalAiConnectionKind = 'wifi' | 'cellular' | 'offline' | 'unknown';

export type LocalAiDeviceTier = 'ultra-low' | 'light' | 'standard' | 'pro';
export type LocalAiModelTier = 'light' | 'standard' | 'pro';
export type LocalAiAccessTier = 'free' | 'starter' | 'plus' | 'pro' | 'lifetime' | 'admin-granted';
export type LocalAiTierBenchmarkStatus = 'not-run' | 'passed' | 'failed';
export type LocalAiFallbackMode = 'deterministic-fallback' | 'unavailable-safe' | 'local-model-eligible';

export interface LocalAiDeviceProfile {
  readonly deviceKind: LocalAiDeviceKind;
  readonly approxRamGb: number | null;
  readonly storageKind: LocalAiStorageKind;
  readonly browserName: LocalAiBrowserName;
  readonly osName: LocalAiOsName;
  readonly webGpuStatus: LocalAiWebGpuStatus;
  readonly batteryLevelPercent?: number | null;
  readonly thermalStatus?: LocalAiThermalStatus;
  readonly connectionKind?: LocalAiConnectionKind;
}

export interface LocalAiDeviceTierGateResult {
  readonly assignedTier: LocalAiDeviceTier;
  readonly eligibleModelTiers: readonly LocalAiModelTier[];
  readonly allowedModelTiers: readonly LocalAiModelTier[];
  readonly blockedModelTiers: readonly LocalAiModelTier[];
  readonly fallbackMode: LocalAiFallbackMode;
  readonly warnings: readonly string[];
  readonly reasons: readonly string[];
  readonly userFacingSummary: string;
  readonly canAttemptModelDownload: boolean;
  readonly canAttempt4B: boolean;
  readonly requiresBenchmarkBeforeModel: boolean;
  readonly featureAvailability: 'full-ui';
  readonly visibleFeatureIds: readonly AIFeatureId[];
}
