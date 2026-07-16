import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  evaluateModelArtifactApproval,
  evaluateModelArtifactReadiness,
  getModelArtifactDownloadPermission,
} from '../../src/platform/ai/modelArtifactManager.ts';
import {
  createModelArtifactId,
  createModelArtifactVersion,
  type ModelArtifact,
} from '../../src/platform/ai/modelArtifactManifest.ts';

const compatibleReport = detectAICapabilities({
  browserSupported: true,
  webgpuSupported: false,
  wasmSupported: true,
  online: true,
  localStorageAvailable: true,
  cacheStorageAvailable: true,
  deviceMemoryGb: 4,
  hardwareConcurrency: 4,
});

function approvedArtifact(): ModelArtifact {
  const version = createModelArtifactVersion('2026.07.1');
  const checksum = 'a'.repeat(64);

  return {
    id: createModelArtifactId('language-core-light'),
    version,
    displayName: 'Language Core Light Test Artifact',
    status: 'available',
    approvalStatus: 'approved',
    tier: 'light-local',
    integrity: {
      algorithm: 'sha256',
      checksum,
      byteSize: 480_000_000,
    },
    license: {
      status: 'verified',
      licenseId: 'test-license',
      commercialUse: true,
      redistribution: true,
      evidenceUrl: 'https://licenses.example.test/language-core-light',
      noticePath: 'THIRD_PARTY_LICENSES.md',
    },
    runtime: {
      runtimeId: 'local-runtime-test',
      runtimeVersion: '1.0.0',
      format: 'test-format',
    },
    download: {
      url: 'https://models.example.test/language-core-light/2026.07.1/model.bin',
      requiresUserAction: true,
      state: {
        status: 'not-requested',
        bytesDownloaded: 0,
        totalBytes: 480_000_000,
      },
    },
    storage: {
      state: 'installed',
      installedVersion: version,
      verifiedChecksum: checksum,
    },
  };
}

describe('local model artifact manager', () => {
  it('returns not-approved when no approved artifact exists', () => {
    const state = evaluateModelArtifactReadiness(compatibleReport);

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') assert.equal(state.reason, 'model-not-approved');
  });

  it('does not approve an artifact without a checksum', () => {
    const artifact = approvedArtifact();
    artifact.integrity.checksum = undefined;

    assert.deepEqual(evaluateModelArtifactApproval(artifact), {
      status: 'not-approved',
      reason: 'integrity-invalid',
    });
  });

  it('does not approve an artifact with an unverified license', () => {
    const artifact = approvedArtifact();
    artifact.license.status = 'unverified';

    assert.deepEqual(evaluateModelArtifactApproval(artifact), {
      status: 'not-approved',
      reason: 'license-not-verified',
    });
  });

  it('does not ready an artifact above the detected device tier', () => {
    const artifact = approvedArtifact();
    artifact.tier = 'pro-local';

    const state = evaluateModelArtifactReadiness(compatibleReport, artifact);

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') assert.equal(state.reason, 'insufficient-capability');
  });

  it('reports not-installed for an approved compatible artifact without a storage record', () => {
    const artifact = approvedArtifact();
    artifact.storage = { state: 'not-installed' };

    const state = evaluateModelArtifactReadiness(compatibleReport, artifact);

    assert.deepEqual(state, {
      status: 'not-installed',
      reason: 'model-not-installed',
      modelId: 'language-core-light',
      requiredTier: 'light-local',
    });
  });

  it('does not ready a corrupted artifact', () => {
    const artifact = approvedArtifact();
    artifact.storage.state = 'corrupted';

    const state = evaluateModelArtifactReadiness(compatibleReport, artifact);

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') assert.equal(state.reason, 'model-corrupted');
  });

  it('readies only an installed, approved, integrity-matched, compatible artifact', () => {
    const artifact = approvedArtifact();

    const state = evaluateModelArtifactReadiness(compatibleReport, artifact);

    assert.deepEqual(state, {
      status: 'ready',
      modelId: 'language-core-light',
      tier: 'light-local',
    });
  });

  it('blocks download when an approved artifact has no URL', () => {
    const artifact = approvedArtifact();
    artifact.download.url = undefined;

    assert.deepEqual(getModelArtifactDownloadPermission(artifact), {
      status: 'blocked',
      reason: 'download-url-missing',
    });
  });

  it('requires explicit user action even when an approved URL is present', () => {
    const permission = getModelArtifactDownloadPermission(approvedArtifact());

    assert.equal(permission.status, 'requires-user-action');
  });
});