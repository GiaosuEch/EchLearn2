import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { detectAICapabilities } from '../../src/platform/ai/aiCapabilityDetector.ts';
import {
  createModelArtifactId,
  createModelArtifactVersion,
  type ModelArtifact,
} from '../../src/platform/ai/modelArtifactManifest.ts';
import {
  createRuntimeProviderFactory,
  createUnavailableRuntimeProvider,
  createWebLLMRuntimeProvider,
  createTransformersJSRuntimeProvider,
  createWasmFallbackRuntimeProvider,
  createCloudBoostRuntimeProvider,
  selectRuntimeProvider,
  type RuntimeProviderSelectionInput,
} from '../../src/platform/ai/runtimeProvider.ts';

const capableReport = detectAICapabilities({
  browserSupported: true,
  webgpuSupported: true,
  webgpuAdapterAvailable: true,
  wasmSupported: true,
  online: true,
  localStorageAvailable: true,
  cacheStorageAvailable: true,
  deviceMemoryGb: 8,
  hardwareConcurrency: 8,
});

function installedArtifact(overrides: Partial<ModelArtifact> = {}): ModelArtifact {
  const version = createModelArtifactVersion('2026.07.1');
  const checksum = 'a'.repeat(64);
  return {
    id: createModelArtifactId('language-runtime-light'),
    version,
    displayName: 'Language Runtime Light Test Artifact',
    status: 'available',
    approvalStatus: 'approved',
    tier: 'light-local',
    integrity: { algorithm: 'sha256', checksum, byteSize: 1024 },
    license: {
      status: 'verified',
      licenseId: 'test-license',
      commercialUse: true,
      redistribution: true,
      evidenceUrl: 'https://licenses.example.test/language-runtime-light',
      noticePath: 'THIRD_PARTY_LICENSES.md',
    },
    runtime: {
      runtimeId: 'wasm-fallback',
      runtimeVersion: '1.0.0',
      format: 'wasm',
    },
    download: {
      requiresUserAction: true,
      state: { status: 'completed', bytesDownloaded: 1024, totalBytes: 1024 },
    },
    storage: {
      state: 'installed',
      installedVersion: version,
      verifiedChecksum: checksum,
    },
    ...overrides,
  };
}

function validSelection(overrides: Partial<RuntimeProviderSelectionInput> = {}): RuntimeProviderSelectionInput {
  return {
    capabilityReport: capableReport,
    artifact: installedArtifact(),
    benchmark: { status: 'passed', evidenceRef: 'benchmark-run-1' },
    userApproval: { runtimeUse: true, download: true },
    preferredProviderIds: ['wasm-fallback'],
    ...overrides,
  };
}

describe('runtime provider skeleton', () => {
  it('keeps every placeholder provider unavailable and free of generated output', async () => {
    const providers = [
      createUnavailableRuntimeProvider(),
      createWebLLMRuntimeProvider(),
      createTransformersJSRuntimeProvider(),
      createWasmFallbackRuntimeProvider(),
      createCloudBoostRuntimeProvider(),
    ];

    for (const provider of providers) {
      const response = await provider.createAdapter().generate({
        requestId: `request-${provider.id}`,
        type: 'explain',
        input: 'Explain this language pattern.',
      });

      assert.notEqual(provider.status, 'implemented');
      assert.equal(response.status, 'unavailable');
      assert.equal(response.isAiGenerated, false);
      assert.equal('output' in response, false);
      assert.equal(response.error.reason, 'runtime-not-implemented');
    }
  });

  it('exposes named WebLLM and Transformers.js placeholders without importing either dependency', () => {
    const webllm = createWebLLMRuntimeProvider();
    const transformers = createTransformersJSRuntimeProvider();

    assert.equal(webllm.id, 'webllm');
    assert.equal(webllm.status, 'not-implemented');
    assert.equal(transformers.id, 'transformers-js');
    assert.equal(transformers.status, 'not-implemented');

    const source = readFileSync(new URL('../../src/platform/ai/runtimeProviders.ts', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from ['"](?:webllm|@mlc-ai\/web-llm|@xenova\/transformers|@huggingface\/transformers)['"]/i);
    assert.doesNotMatch(source, /https?:\/\/|fetch\s*\(|import\s*\(/i);
  });

  it('returns a safe unavailable selection when the artifact is not approved', () => {
    const result = selectRuntimeProvider(validSelection({
      artifact: installedArtifact({ approvalStatus: 'not-approved' }),
    }));

    assert.equal(result.status, 'unavailable');
    assert.equal(result.providerId, 'unavailable');
    assert.ok(result.reasons.includes('artifact-not-approved'));
  });

  it('does not select an artifact before a benchmark has passed', () => {
    const result = selectRuntimeProvider(validSelection({
      benchmark: { status: 'not-run' },
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('benchmark-not-passed'));
  });

  it('does not accept a passed benchmark without evidence', () => {
    const result = selectRuntimeProvider(validSelection({
      benchmark: { status: 'passed' },
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('benchmark-not-passed'));
  });

  it('does not select a provider without verified license or user permission', () => {
    const result = selectRuntimeProvider(validSelection({
      artifact: installedArtifact({
        license: {
          ...installedArtifact().license,
          status: 'unverified',
        },
      }),
      userApproval: { runtimeUse: false, download: false },
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('license-not-verified'));
    assert.ok(result.reasons.includes('user-approval-required'));
    assert.ok(result.reasons.includes('download-permission-required'));
  });

  it('does not select a provider before the approved artifact is installed', () => {
    const result = selectRuntimeProvider(validSelection({
      artifact: installedArtifact({ storage: { state: 'not-installed' } }),
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('artifact-not-installed'));
  });

  it('does not select an artifact above the detected device tier', () => {
    const lightReport = detectAICapabilities({
      browserSupported: true,
      webgpuSupported: true,
      webgpuAdapterAvailable: true,
      wasmSupported: true,
      online: true,
      localStorageAvailable: true,
      cacheStorageAvailable: true,
      deviceMemoryGb: 2,
      hardwareConcurrency: 2,
    });
    const result = selectRuntimeProvider(validSelection({
      capabilityReport: lightReport,
      artifact: installedArtifact({ tier: 'standard-local' }),
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('insufficient-capability'));
  });

  it('does not select a provider when the artifact runtime is incompatible', () => {
    const result = selectRuntimeProvider(validSelection({
      artifact: installedArtifact({
        runtime: { runtimeId: 'unknown-runtime', runtimeVersion: '1.0.0', format: 'unknown' },
      }),
    }));

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reasons.includes('runtime-not-compatible'));
  });

  it('keeps a compatible but unimplemented provider unavailable', () => {
    const result = selectRuntimeProvider(validSelection());

    assert.equal(result.status, 'unavailable');
    assert.equal(result.providerId, 'unavailable');
    assert.ok(result.reasons.includes('runtime-not-implemented'));
  });

  it('factory exposes all providers and platform modules stay exam-track neutral', () => {
    const factory = createRuntimeProviderFactory();
    assert.deepEqual(factory.list().map(provider => provider.id), [
      'unavailable',
      'webllm',
      'transformers-js',
      'wasm-fallback',
      'cloud-boost',
    ]);

    const source = [
      new URL('../../src/platform/ai/runtimeProvider.ts', import.meta.url),
      new URL('../../src/platform/ai/runtimeProviderSelection.ts', import.meta.url),
      new URL('../../src/platform/ai/runtimeProviders.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');
    assert.doesNotMatch(source, /\bIELTS\b|Task Response|Speaking Part [123]|Writing Task [12]/i);
  });
});