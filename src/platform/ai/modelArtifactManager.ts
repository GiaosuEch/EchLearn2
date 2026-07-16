import type { AICapabilityReport, AIUnavailableReason } from './aiCapabilityDetector.ts';
import {
  evaluateAIReadiness,
  type ModelReadinessState,
} from './aiReadiness.ts';
import { validateModelArtifactIntegrity } from './modelArtifactIntegrity.ts';
import {
  isPinnedModelArtifactVersion,
  type ModelArtifact,
  type ModelArtifactId,
  type ModelArtifactManifest,
} from './modelArtifactManifest.ts';

export type ModelArtifactApprovalFailure =
  | 'artifact-not-approved'
  | 'artifact-not-available'
  | 'version-not-pinned'
  | 'license-not-verified'
  | 'integrity-invalid'
  | 'runtime-metadata-invalid'
  | 'silent-download-disallowed';

export type ModelArtifactApprovalResult =
  | { status: 'approved' }
  | { status: 'not-approved'; reason: ModelArtifactApprovalFailure };

export type ModelArtifactDownloadPermission =
  | {
      status: 'blocked';
      reason: 'artifact-not-approved' | 'download-url-missing' | 'download-url-invalid';
    }
  | {
      status: 'requires-user-action';
      url: string;
      byteSize: number;
      checksum: string;
    };

function nonEmpty(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function evaluateModelArtifactApproval(
  artifact: ModelArtifact,
): ModelArtifactApprovalResult {
  if (artifact.approvalStatus !== 'approved') {
    return { status: 'not-approved', reason: 'artifact-not-approved' };
  }

  if (artifact.status !== 'available') {
    return { status: 'not-approved', reason: 'artifact-not-available' };
  }

  if (!isPinnedModelArtifactVersion(String(artifact.version))) {
    return { status: 'not-approved', reason: 'version-not-pinned' };
  }

  if (
    artifact.license.status !== 'verified'
    || !artifact.license.commercialUse
    || !artifact.license.redistribution
    || !nonEmpty(artifact.license.licenseId)
    || !nonEmpty(artifact.license.evidenceUrl)
    || !nonEmpty(artifact.license.noticePath)
  ) {
    return { status: 'not-approved', reason: 'license-not-verified' };
  }

  if (!validateModelArtifactIntegrity(artifact.integrity).valid) {
    return { status: 'not-approved', reason: 'integrity-invalid' };
  }

  if (
    !nonEmpty(artifact.runtime.runtimeId)
    || !nonEmpty(artifact.runtime.runtimeVersion)
    || !nonEmpty(artifact.runtime.format)
    || /(^|[._-])latest($|[._-])/i.test(artifact.runtime.runtimeVersion)
  ) {
    return { status: 'not-approved', reason: 'runtime-metadata-invalid' };
  }

  if (!artifact.download.requiresUserAction) {
    return { status: 'not-approved', reason: 'silent-download-disallowed' };
  }

  return { status: 'approved' };
}

export function selectApprovedModelArtifact(
  manifest: ModelArtifactManifest,
  artifactId?: ModelArtifactId,
): ModelArtifact | undefined {
  return manifest.artifacts.find(artifact => (
    (artifactId === undefined || artifact.id === artifactId)
    && evaluateModelArtifactApproval(artifact).status === 'approved'
  ));
}

function unavailableState(
  reason: AIUnavailableReason,
  artifact?: ModelArtifact,
): ModelReadinessState {
  return {
    status: 'unavailable',
    reason,
    modelId: artifact ? String(artifact.id) : undefined,
    requiredTier: artifact?.tier,
  };
}

export function evaluateModelArtifactReadiness(
  report: AICapabilityReport,
  artifact?: ModelArtifact,
): ModelReadinessState {
  if (!artifact || evaluateModelArtifactApproval(artifact).status !== 'approved') {
    return unavailableState('model-not-approved', artifact);
  }

  if (artifact.storage.state === 'not-supported' || artifact.storage.state === 'unavailable') {
    return unavailableState('storage-unavailable', artifact);
  }

  if (artifact.storage.state === 'corrupted') {
    return unavailableState('model-corrupted', artifact);
  }

  if (artifact.storage.state === 'needs-update') {
    return unavailableState('model-update-required', artifact);
  }

  if (artifact.storage.state === 'not-installed' || artifact.storage.state === 'installing') {
    return {
      status: 'not-installed',
      reason: 'model-not-installed',
      modelId: String(artifact.id),
      requiredTier: artifact.tier,
    };
  }

  if (artifact.storage.installedVersion !== artifact.version) {
    return unavailableState('model-update-required', artifact);
  }

  if (
    !artifact.integrity.checksum
    || artifact.storage.verifiedChecksum !== artifact.integrity.checksum
  ) {
    return unavailableState('model-corrupted', artifact);
  }

  return evaluateAIReadiness(report, {
    modelId: String(artifact.id),
    tier: artifact.tier,
    installed: true,
  });
}

function isApprovedDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:'
      && !url.username
      && !url.password
      && !/(^|\/)latest(?:\/|$)/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function getModelArtifactDownloadPermission(
  artifact: ModelArtifact,
): ModelArtifactDownloadPermission {
  const approval = evaluateModelArtifactApproval(artifact);
  if (approval.status !== 'approved') {
    return { status: 'blocked', reason: 'artifact-not-approved' };
  }

  if (!artifact.download.url) {
    return { status: 'blocked', reason: 'download-url-missing' };
  }

  if (!isApprovedDownloadUrl(artifact.download.url)) {
    return { status: 'blocked', reason: 'download-url-invalid' };
  }

  return {
    status: 'requires-user-action',
    url: artifact.download.url,
    byteSize: artifact.integrity.byteSize,
    checksum: artifact.integrity.checksum as string,
  };
}