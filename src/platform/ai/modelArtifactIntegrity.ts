import type { ModelArtifactIntegrity } from './modelArtifactManifest.ts';

export type ModelArtifactIntegrityFailure =
  | 'unsupported-algorithm'
  | 'missing-checksum'
  | 'invalid-checksum'
  | 'invalid-size';

export type ModelArtifactIntegrityValidation =
  | { valid: true }
  | { valid: false; reason: ModelArtifactIntegrityFailure };

export function validateModelArtifactIntegrity(
  integrity: ModelArtifactIntegrity,
): ModelArtifactIntegrityValidation {
  if (integrity.algorithm !== 'sha256') {
    return { valid: false, reason: 'unsupported-algorithm' };
  }

  if (!integrity.checksum) {
    return { valid: false, reason: 'missing-checksum' };
  }

  if (!/^[a-f0-9]{64}$/i.test(integrity.checksum)) {
    return { valid: false, reason: 'invalid-checksum' };
  }

  if (!Number.isSafeInteger(integrity.byteSize) || integrity.byteSize <= 0) {
    return { valid: false, reason: 'invalid-size' };
  }

  return { valid: true };
}