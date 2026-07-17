export type LocalModelBenchmarkLanguage =
  | 'en'
  | 'vi'
  | 'fr'
  | 'de'
  | 'es'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'it'
  | 'pt'
  | 'ru'
  | 'th'
  | 'ar';

export type LocalModelBenchmarkDimensionStatus = 'planned';

export type LocalModelBenchmarkDimensionId =
  | 'runtime-capability'
  | 'artifact-size-budget'
  | 'initialization-time'
  | 'first-token-latency'
  | 'sustained-generation-speed'
  | 'peak-memory-risk'
  | 'cancellation-reload-recovery'
  | 'corrupted-cache-recovery'
  | 'unsupported-device-fallback'
  | 'multilingual-instruction-following'
  | 'tutor-usefulness'
  | 'practice-generation-usefulness'
  | 'writing-feedback-usefulness'
  | 'transcript-speaking-feedback-usefulness'
  | 'safety-behavior'
  | 'audit-provenance-metadata'
  | 'no-authoritative-scoring-claim';

export interface LocalModelBenchmarkDimension {
  readonly id: LocalModelBenchmarkDimensionId;
  readonly label: string;
  readonly description: string;
  readonly status: LocalModelBenchmarkDimensionStatus;
}

export interface LocalModelBenchmarkCorpusTask {
  readonly taskId: string;
  readonly language: LocalModelBenchmarkLanguage;
  readonly instruction: string;
  readonly containsUserData: false;
  readonly containsCopyrightedPassage: false;
  readonly expectedOutput: null;
}

export type LocalModelBenchmarkCapabilityCheck = 'unchecked';

export interface LocalModelBenchmarkBrowserCapabilityContract {
  readonly secureContextRequired: true;
  readonly webGpuRequired: true;
  readonly navigatorGpuAvailable: LocalModelBenchmarkCapabilityCheck;
  readonly adapterStatus: LocalModelBenchmarkCapabilityCheck;
  readonly deviceStatus: LocalModelBenchmarkCapabilityCheck;
  readonly storageEstimateSupported: LocalModelBenchmarkCapabilityCheck;
  readonly unsupportedDeviceFallback: 'unavailable-safe';
}

export type LocalModelBenchmarkStatus = 'not-run' | 'running' | 'failed' | 'completed';
export type LocalModelBenchmarkDeviceTier = 'unknown' | 'light' | 'standard' | 'pro';

export interface LocalModelBenchmarkMetrics {
  readonly artifactSizeBytes?: number;
  readonly initializationMs?: number;
  readonly firstTokenLatencyMs?: number;
  readonly sustainedTokensPerSecond?: number;
  readonly peakMemoryBytes?: number;
  readonly cancellationRecovered?: boolean;
  readonly reloadRecovered?: boolean;
  readonly corruptedCacheRecovered?: boolean;
  readonly unsupportedDeviceFallbackVerified?: boolean;
}

export interface LocalModelBenchmarkProvenance {
  readonly status: 'not-collected' | 'recorded';
  readonly runtimeBuildId?: string;
  readonly candidateArtifactId?: string;
  readonly deviceProfileId?: string;
}

export interface LocalModelBenchmarkResult {
  readonly candidateId: string;
  readonly runtimeCandidateId: string;
  readonly deviceTier: LocalModelBenchmarkDeviceTier;
  readonly benchmarkStartedAt: string | null;
  readonly benchmarkCompletedAt: string | null;
  readonly metrics: LocalModelBenchmarkMetrics | null;
  readonly status: LocalModelBenchmarkStatus;
  readonly provenance: LocalModelBenchmarkProvenance;
  readonly safetyFlags: readonly string[];
  readonly notes: readonly string[];
}
