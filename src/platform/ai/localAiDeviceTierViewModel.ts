import type { LocalAiDeviceTier } from './localAiDeviceTierTypes.ts';

export interface LocalAiDeviceTierOverviewItem {
  readonly tier: LocalAiDeviceTier;
  readonly label: string;
  readonly summary: string;
}

export interface LocalAiDeviceTierPolicyOverview {
  readonly heading: string;
  readonly currentState: string;
  readonly featureParitySummary: string;
  readonly safetySummary: string;
  readonly entitlementSummary: string;
  readonly benchmarkSummary: string;
  readonly documentPath: string;
  readonly tiers: readonly LocalAiDeviceTierOverviewItem[];
}

export function buildLocalAiDeviceTierPolicyOverview(): LocalAiDeviceTierPolicyOverview {
  return {
    heading: 'Adaptive device tier gate',
    currentState:
      'No device probe has run. Phase 4.4 defines a deterministic metadata policy only and does not activate a model.',
    featureParitySummary:
      'Every device keeps the full AI feature UI. Lower tiers change execution mode to deterministic or unavailable-safe fallback instead of removing features.',
    safetySummary:
      'Model download attempts stay blocked for unsupported or unchecked WebGPU, cellular or offline connections, low battery, hot thermal state, and unverified benchmarks.',
    entitlementSummary:
      'Subscription or admin access can cap the highest tier a user may evaluate, but it does not bypass hardware or benchmark gates.',
    benchmarkSummary:
      'The pro model tier requires a pro device classification and an explicit benchmark pass; this policy does not record a pass itself.',
    documentPath: 'docs/ai/phase-4-device-tier-policy.md',
    tiers: [
      {
        tier: 'ultra-low',
        label: 'Ultra-low',
        summary: 'Two GB memory or unknown memory uses deterministic fallback and does not attempt model download.',
      },
      {
        tier: 'light',
        label: 'Light',
        summary: 'Three to four GB memory or constrained storage may evaluate only the light candidate after gates pass.',
      },
      {
        tier: 'standard',
        label: 'Standard',
        summary: 'Eight GB memory with SSD storage may evaluate up to the standard candidate after gates pass.',
      },
      {
        tier: 'pro',
        label: 'Pro',
        summary: 'At least 16 GB memory, SSD storage, desktop-class hardware, and confirmed WebGPU may evaluate the pro candidate after gates pass.',
      },
    ],
  };
}
