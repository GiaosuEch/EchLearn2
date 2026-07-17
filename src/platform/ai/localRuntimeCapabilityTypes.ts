import type {
  LocalAiBrowserName,
  LocalAiConnectionKind,
  LocalAiDeviceKind,
  LocalAiOsName,
  LocalAiStorageKind,
  LocalAiThermalStatus,
} from './localAiDeviceTierTypes.ts';

export type LocalRuntimeCapabilityProbeStatus = 'not-run' | 'completed' | 'failed';
export type LocalRuntimeCapabilitySupportStatus = 'supported' | 'unsupported' | 'unknown';
export type LocalRuntimeWebGpuStatus = 'supported' | 'unsupported' | 'unchecked' | 'unknown';

export interface LocalRuntimeStorageEstimateLike {
  readonly quota?: unknown;
  readonly usage?: unknown;
}

export interface LocalRuntimeStorageManagerLike {
  readonly estimate?: () => Promise<LocalRuntimeStorageEstimateLike>;
}

export interface LocalRuntimeConnectionLike {
  readonly type?: unknown;
  readonly effectiveType?: unknown;
  readonly saveData?: unknown;
}

export interface LocalRuntimeBatteryLike {
  readonly level?: unknown;
  readonly charging?: unknown;
}

export interface LocalRuntimeNavigatorLike {
  readonly deviceMemory?: unknown;
  readonly userAgent?: unknown;
  readonly platform?: unknown;
  readonly maxTouchPoints?: unknown;
  readonly onLine?: unknown;
  readonly gpu?: unknown;
  readonly storage?: LocalRuntimeStorageManagerLike | null;
  readonly connection?: LocalRuntimeConnectionLike | null;
  readonly getBattery?: (() => Promise<LocalRuntimeBatteryLike>) | null;
}

export interface LocalRuntimeCapabilityEnvironment {
  readonly hasWindow: boolean;
  readonly secureContext?: unknown;
  readonly navigator?: LocalRuntimeNavigatorLike | null;
  readonly nowIso?: (() => string) | null;
  readonly trustedDeviceKindHint?: LocalAiDeviceKind;
  readonly trustedStorageKindHint?: LocalAiStorageKind;
  readonly trustedThermalStatusHint?: LocalAiThermalStatus;
}

export interface LocalRuntimeCapabilityResult {
  readonly probeStatus: LocalRuntimeCapabilityProbeStatus;
  readonly secureContext: LocalRuntimeCapabilitySupportStatus;
  readonly webGpuStatus: LocalRuntimeWebGpuStatus;
  readonly webGpuReason: string | null;
  readonly storageEstimateStatus: LocalRuntimeCapabilitySupportStatus;
  readonly estimatedQuotaMb: number | null;
  readonly estimatedUsageMb: number | null;
  readonly estimatedRemainingMb: number | null;
  readonly connectionKind: LocalAiConnectionKind;
  readonly effectiveConnectionType: string | null;
  readonly saveDataEnabled: boolean | null;
  readonly batteryStatus: LocalRuntimeCapabilitySupportStatus;
  readonly batteryLevelPercent: number | null;
  readonly charging: boolean | null;
  readonly thermalStatus: LocalAiThermalStatus;
  readonly browserName: LocalAiBrowserName;
  readonly osName: LocalAiOsName;
  readonly deviceKind: LocalAiDeviceKind;
  readonly storageKind: LocalAiStorageKind;
  readonly approxRamGb: number | null;
  readonly warnings: readonly string[];
  readonly reasons: readonly string[];
  readonly collectedAt: string | null;
  readonly metadataOnly: true;
  readonly modelActive: false;
  readonly benchmarkVerified: false;
}
