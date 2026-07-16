import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import { evaluateModelArtifactReadiness } from '../../src/platform/ai/modelArtifactManager.ts';
import {
  createModelArtifactId,
  createModelArtifactVersion,
  type ModelArtifact,
} from '../../src/platform/ai/modelArtifactManifest.ts';
import {
  resolveLocalRuntimeStartState,
  transitionLocalRuntimeState,
  type LocalRuntimeSession,
} from '../../src/platform/ai/localRuntimeState.ts';

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

function approvedInstalledArtifact(): ModelArtifact {
  const version = createModelArtifactVersion('2026.07.1');
  const checksum = 'a'.repeat(64);

  return {
    id: createModelArtifactId('language-runtime-light'),
    version,
    displayName: 'Language Runtime Light Test Artifact',
    status: 'available',
    approvalStatus: 'approved',
    tier: 'light-local',
    integrity: {
      algorithm: 'sha256',
      checksum,
      byteSize: 1_024,
    },
    license: {
      status: 'verified',
      licenseId: 'test-license',
      commercialUse: true,
      redistribution: true,
      evidenceUrl: 'https://licenses.example.test/language-runtime-light',
      noticePath: 'THIRD_PARTY_LICENSES.md',
    },
    runtime: {
      runtimeId: 'local-runtime-test',
      runtimeVersion: '1.0.0',
      format: 'test-format',
    },
    download: {
      requiresUserAction: true,
      state: {
        status: 'completed',
        bytesDownloaded: 1_024,
        totalBytes: 1_024,
      },
    },
    storage: {
      state: 'installed',
      installedVersion: version,
      verifiedChecksum: checksum,
    },
  };
}

function runtimeSession(artifact: ModelArtifact): LocalRuntimeSession {
  return {
    sessionId: 'runtime-session-test',
    modelArtifactId: artifact.id,
    modelArtifactVersion: artifact.version,
    modelTier: artifact.tier,
    runtimeId: artifact.runtime.runtimeId,
    runtimeVersion: artifact.runtime.runtimeVersion,
  };
}

describe('local runtime start eligibility', () => {
  it('does not start when the artifact is not approved', () => {
    const artifact = approvedInstalledArtifact();
    artifact.approvalStatus = 'not-approved';

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact), {
      status: 'unavailable',
      reason: 'model-not-approved',
    });
  });

  it('reports needs-model when an approved artifact is not installed', () => {
    const artifact = approvedInstalledArtifact();
    artifact.storage = { state: 'not-installed' };

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact), {
      status: 'needs-model',
      reason: 'model-not-installed',
      modelArtifactId: artifact.id,
      modelArtifactVersion: artifact.version,
    });
  });

  it('does not start when installed integrity evidence does not match', () => {
    const artifact = approvedInstalledArtifact();
    artifact.storage.verifiedChecksum = 'b'.repeat(64);

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact), {
      status: 'unavailable',
      reason: 'model-corrupted',
    });
  });

  it('does not start when the device tier is below the artifact tier', () => {
    const artifact = approvedInstalledArtifact();
    artifact.tier = 'pro-local';

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact), {
      status: 'unavailable',
      reason: 'insufficient-capability',
    });
  });

  it('stays unavailable without a real runtime session', () => {
    const artifact = approvedInstalledArtifact();

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact), {
      status: 'unavailable',
      reason: 'runtime-not-implemented',
    });
  });

  it('returns ready only with approved, installed, compatible artifact evidence and a matching session', () => {
    const artifact = approvedInstalledArtifact();
    const session = runtimeSession(artifact);

    assert.deepEqual(resolveLocalRuntimeStartState(compatibleReport, artifact, session), {
      status: 'ready',
      session,
    });
  });
});

describe('local runtime state machine', () => {
  it('rejects a direct idle-to-ready transition', () => {
    const artifact = approvedInstalledArtifact();
    const state = transitionLocalRuntimeState(
      { status: 'idle' },
      { type: 'load-succeeded', session: runtimeSession(artifact) },
    );

    assert.equal(state.status, 'failed');
    if (state.status === 'failed') {
      assert.equal(state.error.reason, 'invalid-state-transition');
    }
  });

  it('supports the guarded loading, ready, generating and disposed lifecycle', () => {
    const artifact = approvedInstalledArtifact();
    const readiness = evaluateModelArtifactReadiness(compatibleReport, artifact);
    assert.equal(readiness.status, 'ready');
    if (readiness.status !== 'ready') return;

    const loading = transitionLocalRuntimeState(
      { status: 'idle' },
      { type: 'load-started', readiness, artifact },
    );
    assert.equal(loading.status, 'loading');

    const ready = transitionLocalRuntimeState(
      loading,
      { type: 'load-succeeded', session: runtimeSession(artifact) },
    );
    assert.equal(ready.status, 'ready');

    const generating = transitionLocalRuntimeState(
      ready,
      { type: 'generation-started', requestId: 'request-test' },
    );
    assert.equal(generating.status, 'generating');

    const readyAgain = transitionLocalRuntimeState(
      generating,
      { type: 'generation-finished' },
    );
    assert.equal(readyAgain.status, 'ready');

    assert.deepEqual(transitionLocalRuntimeState(readyAgain, { type: 'dispose' }), {
      status: 'disposed',
    });
  });
});
