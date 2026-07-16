import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  createPlatformAIService,
} from '../../src/platform/ai/aiService.ts';
import type {
  AIServiceRequest,
} from '../../src/platform/ai/aiServiceTypes.ts';
import {
  createUnavailableLocalRuntimeAdapter,
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
    id: createModelArtifactId('language-service-light'),
    version,
    displayName: 'Language Service Light Test Artifact',
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
      evidenceUrl: 'https://licenses.example.test/language-service-light',
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

function explainRequest(requestId: string): AIServiceRequest {
  return {
    requestId,
    type: 'explain',
    input: 'Explain this language pattern.',
    context: {
      targetLanguage: 'en',
      skillArea: 'grammar',
    },
  };
}

describe('generic platform AI service', () => {
  it('returns explicit unavailable when the real runtime is not implemented', async () => {
    const artifact = approvedInstalledArtifact();
    const runtimeAdapter = createUnavailableLocalRuntimeAdapter();
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact,
      runtimeAdapter,
    });

    const response = await service.execute(explainRequest('request-1'));

    assert.equal(response.status, 'unavailable');
    if (response.status !== 'unavailable') return;
    assert.equal(response.unavailableReason, 'runtime-not-implemented');
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
    assert.equal(response.provenance.modelArtifactId, undefined);
    assert.equal(response.provenance.modelArtifactVersion, undefined);
    assert.equal(response.provenance.runtimeId, undefined);
    assert.equal(response.provenance.runtimeVersion, undefined);
  });

  it('returns needs-model when the approved artifact is not installed', async () => {
    const artifact = approvedInstalledArtifact();
    artifact.storage = { state: 'not-installed' };
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact,
    });

    const response = await service.execute(explainRequest('request-2'));

    assert.equal(response.status, 'needs-model');
    if (response.status === 'needs-model') {
      assert.equal(response.unavailableReason, 'model-not-installed');
    }
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
  });

  it('does not bypass model approval readiness', async () => {
    const artifact = approvedInstalledArtifact();
    artifact.approvalStatus = 'not-approved';
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact,
    });

    const response = await service.execute(explainRequest('request-3'));

    assert.equal(response.status, 'unavailable');
    if (response.status === 'unavailable') {
      assert.equal(response.unavailableReason, 'model-not-approved');
    }
    assert.equal('output' in response, false);
  });

  it('rejects an invalid request before starting the runtime', async () => {
    const runtimeAdapter = createUnavailableLocalRuntimeAdapter();
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact: approvedInstalledArtifact(),
      runtimeAdapter,
    });
    const request = {
      ...explainRequest('request-4'),
      input: '   ',
    };

    const response = await service.execute(request);

    assert.equal(response.status, 'failed');
    if (response.status === 'failed') {
      assert.equal(response.error.reason, 'invalid-request');
    }
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
    assert.deepEqual(runtimeAdapter.getState(), { status: 'idle' });
  });

  it('rejects an unknown request type without mislabeling the response', async () => {
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact: approvedInstalledArtifact(),
    });
    const request = {
      ...explainRequest('request-unknown'),
      type: 'unknown-request',
    } as unknown as AIServiceRequest;

    const response = await service.execute(request);

    assert.equal(response.status, 'failed');
    assert.equal(response.requestType, 'unknown');
    if (response.status === 'failed') {
      assert.equal(response.error.reason, 'invalid-request');
    }
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
  });

  it('never returns a canned response while the runtime is unavailable', async () => {
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact: approvedInstalledArtifact(),
    });

    const first = await service.execute(explainRequest('request-5'));
    const second = await service.execute(explainRequest('request-6'));

    assert.equal('output' in first, false);
    assert.equal('output' in second, false);
    assert.equal(first.isAiGenerated, false);
    assert.equal(second.isAiGenerated, false);
  });

  it('returns a typed failure after the service is disposed', async () => {
    const service = createPlatformAIService({
      capabilityReport: compatibleReport,
      artifact: approvedInstalledArtifact(),
    });
    await service.dispose();

    const response = await service.execute(explainRequest('request-7'));

    assert.equal(response.status, 'failed');
    if (response.status === 'failed') {
      assert.equal(response.error.reason, 'service-disposed');
    }
    assert.equal(response.isAiGenerated, false);
    assert.equal('output' in response, false);
  });

  it('keeps exam-track and fake-runtime concepts out of platform service modules', () => {
    const source = [
      new URL('../../src/platform/ai/aiService.ts', import.meta.url),
      new URL('../../src/platform/ai/aiServiceTypes.ts', import.meta.url),
      new URL('../../src/platform/ai/aiServiceGuards.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');

    assert.doesNotMatch(
      source,
      /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i,
    );
    assert.doesNotMatch(source, /\bmock\b|\bcanned\b/i);
  });
});
