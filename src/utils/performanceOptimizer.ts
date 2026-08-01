/**
 * Performance Optimizer Utility for Low-End Mobile & Legacy Hardware (e.g. iPhone 6, older Androids)
 */

export interface DevicePerformanceProfile {
  isLowEndDevice: boolean;
  isMobile: boolean;
  maxParticles: number;
  enableHeavyGlow: boolean;
  targetFPS: number;
}

export function detectDevicePerformanceProfile(): DevicePerformanceProfile {
  if (typeof window === 'undefined') {
    return { isLowEndDevice: false, isMobile: false, maxParticles: 60, enableHeavyGlow: true, targetFPS: 60 };
  }

  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Check CPU cores and memory
  const concurrency = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4; // GB

  // iPhone 6 / 6s / 7 or old Android detection (< 4 cores or < 3GB RAM or small screen width)
  const isiPhone6OrLegacy = /iPhone OS (8_|9_|10_|11_|12_|13_|14_)/i.test(userAgent) || window.innerWidth < 400;
  const isLowEndDevice = isiPhone6OrLegacy || concurrency <= 4 || memory < 3;

  return {
    isLowEndDevice,
    isMobile,
    maxParticles: isLowEndDevice ? 15 : isMobile ? 30 : 70,
    enableHeavyGlow: !isLowEndDevice,
    targetFPS: isLowEndDevice ? 30 : 60,
  };
}

export const globalPerformanceProfile = detectDevicePerformanceProfile();
