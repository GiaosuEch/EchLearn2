/**
 * Capability Detector
 * 
 * Top 0.1% Architecture: Prevents Out-of-Memory (OOM) crashes and main-thread freezing
 * by dynamically assessing the client device's physical hardware constraints before
 * initializing Web Workers, heavy NLP heuristics, or Local AI models.
 */

export type DeviceTier = 'HIGH_END' | 'MID_TIER' | 'LOW_END';

export interface DeviceCapabilities {
  tier: DeviceTier;
  hardwareConcurrency: number;
  deviceMemory: number | null; // in GB, not supported by Safari/iOS
  canRunHeavyWorkers: boolean;
  canRunLocalAI: boolean;
  networkType?: string; // 4g, 3g, etc.
}

let cachedForcedHighEnd: boolean | null = null;

export const capabilityDetector = {
  getCapabilities(): DeviceCapabilities {
    if (typeof window === 'undefined') {
      return {
        tier: 'HIGH_END',
        hardwareConcurrency: 4,
        deviceMemory: 8,
        canRunHeavyWorkers: true,
        canRunLocalAI: true,
      };
    }

    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    // TypeScript doesn't natively type deviceMemory yet as it's non-standard
    const nav = navigator as any;
    const deviceMemory = nav.deviceMemory ? (nav.deviceMemory as number) : null;
    const networkType = nav.connection?.effectiveType;

    let tier: DeviceTier = 'MID_TIER';
    
    if (cachedForcedHighEnd === null) {
      try {
        cachedForcedHighEnd = localStorage.getItem('ech_force_high_end') === 'true';
      } catch {
        cachedForcedHighEnd = false; // Ignored for privacy modes
      }
    }

    if (cachedForcedHighEnd) {
      tier = 'HIGH_END';
    } 
    // Low End: <= 2 Cores OR <= 2GB RAM. But respect overrides because Brave/Tor spoof cores to 2.
    else if (hardwareConcurrency <= 2 || (deviceMemory !== null && deviceMemory <= 2)) {
      tier = 'LOW_END';
    } 
    // High End: >= 8 Cores AND (unknown RAM or >= 8GB RAM)
    else if (hardwareConcurrency >= 8 && (deviceMemory === null || deviceMemory >= 8)) {
      tier = 'HIGH_END';
    }

    return {
      tier,
      hardwareConcurrency,
      deviceMemory,
      canRunHeavyWorkers: tier !== 'LOW_END',
      canRunLocalAI: tier === 'HIGH_END', // Only absolute highest end devices should load full Local AI chunks
      networkType
    };
  },

  /**
   * Use this before rendering complex 3D scenes or heavy NLP pipelines.
   */
  shouldDegradeGracefully(): boolean {
    return this.getCapabilities().tier === 'LOW_END';
  }
};
