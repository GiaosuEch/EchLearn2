import type { LocalModelTier } from './aiReadiness.ts';

declare const modelArtifactIdBrand: unique symbol;
declare const modelArtifactVersionBrand: unique symbol;

export type ModelArtifactId = string & { readonly [modelArtifactIdBrand]: true };
export type ModelArtifactVersion = string & { readonly [modelArtifactVersionBrand]: true };

export type ModelArtifactStatus = 'candidate' | 'available' | 'deprecated' | 'unavailable';
export type ModelArtifactLicenseStatus = 'unverified' | 'verified' | 'rejected';
export type ModelArtifactApprovalStatus = 'candidate' | 'approved' | 'not-approved' | 'revoked';

export interface ModelArtifactIntegrity {
  algorithm: 'sha256';
  checksum?: string;
  byteSize: number;
}

export type ModelArtifactStorageState =
  | 'not-supported'
  | 'not-installed'
  | 'installing'
  | 'installed'
  | 'corrupted'
  | 'needs-update'
  | 'unavailable';

export interface ModelArtifactStorageRecord {
  state: ModelArtifactStorageState;
  installedVersion?: ModelArtifactVersion;
  verifiedChecksum?: string;
}

export type ModelArtifactDownloadStatus =
  | 'not-requested'
  | 'blocked'
  | 'needs-download'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed';

export interface ModelArtifactDownloadState {
  status: ModelArtifactDownloadStatus;
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
}

export interface ModelArtifact {
  id: ModelArtifactId;
  version: ModelArtifactVersion;
  displayName: string;
  status: ModelArtifactStatus;
  approvalStatus: ModelArtifactApprovalStatus;
  tier: LocalModelTier;
  integrity: ModelArtifactIntegrity;
  license: {
    status: ModelArtifactLicenseStatus;
    licenseId: string;
    commercialUse: boolean;
    redistribution: boolean;
    evidenceUrl?: string;
    noticePath?: string;
  };
  runtime: {
    runtimeId: string;
    runtimeVersion: string;
    format: string;
  };
  download: {
    url?: string;
    requiresUserAction: boolean;
    state: ModelArtifactDownloadState;
  };
  storage: ModelArtifactStorageRecord;
}

export interface ModelArtifactManifest {
  schemaVersion: 1;
  manifestVersion: string;
  artifacts: readonly ModelArtifact[];
}

export const EMPTY_MODEL_ARTIFACT_MANIFEST: ModelArtifactManifest = {
  schemaVersion: 1,
  manifestVersion: 'unconfigured',
  artifacts: [],
};

export type ModelArtifactManifestError =
  | 'invalid-schema-version'
  | 'manifest-version-missing'
  | 'artifact-id-invalid'
  | 'artifact-version-not-pinned'
  | 'duplicate-artifact-version'
  | 'download-progress-invalid';

export type ModelArtifactManifestValidation =
  | { valid: true }
  | { valid: false; errors: ModelArtifactManifestError[] };

function isStableToken(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,127}$/i.test(value.trim());
}

export function isPinnedModelArtifactVersion(value: string): boolean {
  const normalized = value.trim();
  return (
    isStableToken(normalized)
    && !/(^|[._-])latest($|[._-])/i.test(normalized)
  );
}

export function createModelArtifactId(value: string): ModelArtifactId {
  const normalized = value.trim();
  if (!isStableToken(normalized)) {
    throw new TypeError('Model artifact ID must be a stable non-empty token.');
  }
  return normalized as ModelArtifactId;
}

export function createModelArtifactVersion(value: string): ModelArtifactVersion {
  const normalized = value.trim();
  if (!isPinnedModelArtifactVersion(normalized)) {
    throw new TypeError('Model artifact version must be pinned and cannot use latest.');
  }
  return normalized as ModelArtifactVersion;
}

function addError(
  errors: ModelArtifactManifestError[],
  error: ModelArtifactManifestError,
): void {
  if (!errors.includes(error)) errors.push(error);
}

export function validateModelArtifactManifest(
  manifest: ModelArtifactManifest,
): ModelArtifactManifestValidation {
  const errors: ModelArtifactManifestError[] = [];

  if (manifest.schemaVersion !== 1) addError(errors, 'invalid-schema-version');
  if (!manifest.manifestVersion.trim()) addError(errors, 'manifest-version-missing');

  const artifactVersions = new Set<string>();
  for (const artifact of manifest.artifacts) {
    const id = String(artifact.id);
    const version = String(artifact.version);

    if (!isStableToken(id)) addError(errors, 'artifact-id-invalid');
    if (!isPinnedModelArtifactVersion(version)) {
      addError(errors, 'artifact-version-not-pinned');
    }

    const key = id + '@' + version;
    if (artifactVersions.has(key)) {
      addError(errors, 'duplicate-artifact-version');
    }
    artifactVersions.add(key);

    const progress = artifact.download.state;
    if (
      !Number.isSafeInteger(progress.bytesDownloaded)
      || !Number.isSafeInteger(progress.totalBytes)
      || progress.bytesDownloaded < 0
      || progress.totalBytes < 0
      || progress.bytesDownloaded > progress.totalBytes
    ) {
      addError(errors, 'download-progress-invalid');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}