import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  LOCAL_RUNTIME_REQUEST_TYPES,
  createUnavailableLocalRuntimeAdapter,
  type LocalRuntimeRequest,
} from '../../src/platform/ai/localRuntimeAdapter.ts';
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

function explainRequest(requestId: string): LocalRuntimeRequest {
  return {
    requestId,
    type: 'explain',
    input: 'Explain this language pattern.',
  };
}

describe('unavailable local runtime adapter', () => {
  it('returns explicit unavailable state when no runtime implementation exists', async () => {
    const artifact = approvedInstalledArtifact();
    const adapter = createUnavailableLocalRuntimeAdapter();

    const state = await adapter.start({ capabilityReport: compatibleReport, artifact });

    assert.deepEqual(state, {
      status: 'unavailable',
      reason: 'runtime-not-implemented',
    });
  });

  it('does not generate output and marks the response as not AI-generated', async () => {
    const artifact = approvedInstalledArtifact();
    const adapter = createUnavailableLocalRuntimeAdapter();
    await adapter.start({ capabilityReport: compatibleReport, artifact });

    const response = await adapter.generate(explainRequest('request-1'));

    assert.equal(response.status, 'unavailable');
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
    assert.equal(response.error.reason, 'runtime-not-implemented');
    assert.equal(response.provenance.modelArtifactId, artifact.id);
    assert.equal(response.provenance.modelArtifactVersion, artifact.version);
    assert.equal(response.provenance.runtimeId, undefined);
    assert.equal(response.provenance.runtimeVersion, undefined);
  });

  it('preserves the typed model blocker in failed generation responses', async () => {
    const artifact = approvedInstalledArtifact();
    artifact.approvalStatus = 'not-approved';
    const adapter = createUnavailableLocalRuntimeAdapter();
    await adapter.start({ capabilityReport: compatibleReport, artifact });

    const response = await adapter.generate(explainRequest('request-2'));

    assert.equal(response.status, 'unavailable');
    assert.equal(response.error.reason, 'model-not-approved');
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
  });

  it('never returns a canned response for repeated requests', async () => {
    const adapter = createUnavailableLocalRuntimeAdapter();

    const first = await adapter.generate(explainRequest('request-3'));
    const second = await adapter.generate(explainRequest('request-4'));

    assert.equal('output' in first, false);
    assert.equal('output' in second, false);
    assert.equal(first.isAiGenerated, false);
    assert.equal(second.isAiGenerated, false);
  });

  it('stays disposed and refuses generation after disposal', async () => {
    const adapter = createUnavailableLocalRuntimeAdapter();

    assert.deepEqual(await adapter.dispose(), { status: 'disposed' });
    const response = await adapter.generate(explainRequest('request-5'));

    assert.equal(response.status, 'unavailable');
    assert.equal(response.error.reason, 'runtime-disposed');
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
  });
});

describe('local runtime platform contract', () => {
  it('exposes only generic language-platform request types', () => {
    const requestTypes: readonly LocalRuntimeRequest['type'][] = [
      'conversation',
      'explain',
      'feedback',
      'generate-practice',
      'summarize',
      'classify',
      'assess',
      'plan-study',
      'recommend-next-practice',
    ];

    assert.deepEqual(LOCAL_RUNTIME_REQUEST_TYPES, requestTypes);
  });

  it('keeps exam-track concepts out of local runtime platform modules', () => {
    const source = [
      new URL('../../src/platform/ai/localRuntimeAdapter.ts', import.meta.url),
      new URL('../../src/platform/ai/localRuntimeState.ts', import.meta.url),
      new URL('../../src/platform/ai/localRuntimeErrors.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');

    assert.doesNotMatch(
      source,
      /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i,
    );
  });
});
