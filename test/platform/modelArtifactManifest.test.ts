import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  EMPTY_MODEL_ARTIFACT_MANIFEST,
  createModelArtifactId,
  createModelArtifactVersion,
  validateModelArtifactManifest,
  type ModelArtifact,
  type ModelArtifactManifest,
} from '../../src/platform/ai/modelArtifactManifest.ts';

function candidateArtifact(): ModelArtifact {
  return {
    id: createModelArtifactId('placeholder-candidate'),
    version: createModelArtifactVersion('candidate-0.0.1'),
    displayName: 'Placeholder Candidate',
    status: 'candidate',
    approvalStatus: 'not-approved',
    tier: 'light-local',
    integrity: {
      algorithm: 'sha256',
      checksum: undefined,
      byteSize: 0,
    },
    license: {
      status: 'unverified',
      licenseId: 'unverified',
      commercialUse: false,
      redistribution: false,
    },
    runtime: {
      runtimeId: 'unselected',
      runtimeVersion: 'unselected',
      format: 'unselected',
    },
    download: {
      requiresUserAction: true,
      state: {
        status: 'blocked',
        bytesDownloaded: 0,
        totalBytes: 0,
      },
    },
    storage: {
      state: 'not-installed',
    },
  };
}

describe('local model artifact manifest', () => {
  it('ships with an empty manifest rather than a fake approved model', () => {
    assert.deepEqual(EMPTY_MODEL_ARTIFACT_MANIFEST.artifacts, []);
    assert.equal(validateModelArtifactManifest(EMPTY_MODEL_ARTIFACT_MANIFEST).valid, true);
  });

  it('allows an explicit placeholder candidate without URL or installed state', () => {
    const artifact = candidateArtifact();

    assert.equal(artifact.approvalStatus, 'not-approved');
    assert.equal(artifact.download.url, undefined);
    assert.equal(artifact.storage.state, 'not-installed');
  });

  it('rejects an unpinned latest version', () => {
    const artifact = candidateArtifact();
    artifact.version = 'latest' as typeof artifact.version;
    const manifest: ModelArtifactManifest = {
      schemaVersion: 1,
      manifestVersion: 'phase-2.2-test',
      artifacts: [artifact],
    };

    const result = validateModelArtifactManifest(manifest);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('artifact-version-not-pinned'));
  });

  it('rejects duplicate artifact id and version entries', () => {
    const artifact = candidateArtifact();
    const manifest: ModelArtifactManifest = {
      schemaVersion: 1,
      manifestVersion: 'phase-2.2-test',
      artifacts: [artifact, { ...artifact }],
    };

    const result = validateModelArtifactManifest(manifest);

    assert.equal(result.valid, false);
    if (!result.valid) assert.ok(result.errors.includes('duplicate-artifact-version'));
  });

  it('keeps exam-track concepts out of platform artifact modules', () => {
    const source = [
      new URL('../../src/platform/ai/modelArtifactManifest.ts', import.meta.url),
      new URL('../../src/platform/ai/modelArtifactIntegrity.ts', import.meta.url),
      new URL('../../src/platform/ai/modelArtifactManager.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');

    assert.doesNotMatch(
      source,
      /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i,
    );
  });
});