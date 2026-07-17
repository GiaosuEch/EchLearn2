import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_APPROVAL_CHECKS,
  LOCAL_MODEL_APPROVAL_REGISTRY,
} from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { buildLocalModelApprovalViewModel } from '../../src/platform/ai/localModelApprovalViewModel.ts';
import { LOCAL_AI_READINESS_CHECKLIST } from '../../src/platform/ai/localAiReadinessChecklist.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('Phase 4.2 local model approval registry', () => {
  it('contains exactly the three initial model candidates', () => {
    assert.deepEqual(
      LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId),
      [
        'qwen3-0-6b-candidate',
        'qwen3-1-7b-candidate',
        'qwen3-4b-candidate',
      ],
    );
  });

  it('keeps every approval, readiness, configuration, and download flag false', () => {
    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      assert.equal(candidate.approved, false);
      assert.equal(candidate.licenseApproved, false);
      assert.equal(candidate.artifactApproved, false);
      assert.equal(candidate.benchmarkApproved, false);
      assert.equal(candidate.runtimeReady, false);
      assert.equal(candidate.downloadable, false);
      assert.equal(candidate.configuredForRuntime, false);
      assert.ok(candidate.approvalBlockers.length > 0);
    }
  });

  it('records official-source review without turning it into product approval', () => {
    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      assert.equal(candidate.verificationStatus, 'official-source-reviewed');
      assert.equal(candidate.licenseName, 'Apache-2.0');
      assert.equal(candidate.licenseReviewStatus, 'reviewed-pending-product-approval');
      assert.equal(candidate.licenseApproved, false);
      assert.ok(candidate.sourceReferences.every((reference) => !/^https?:\/\//i.test(reference)));
    }
  });

  it('contains no artifact location, download location, checksum, or real manifest', () => {
    const source = read('../../src/platform/ai/localModelApprovalRegistry.ts');
    const serialized = JSON.stringify(LOCAL_MODEL_APPROVAL_REGISTRY);

    assert.doesNotMatch(source, /https?:\/\/|modelUrl|artifactUrl|downloadUrl|downloadUri|apiKey/i);
    assert.doesNotMatch(serialized, /https?:\/\/|"url"|"checksum"|"sha256"|"manifest"/i);
    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.some((candidate) => candidate.downloadable), false);
  });

  it('requires the complete license, artifact, storage, benchmark, and safety checklist', () => {
    const ids = new Set(LOCAL_MODEL_APPROVAL_CHECKS.map((check) => check.id));
    for (const id of [
      'official-license-source',
      'product-use-allowed',
      'redistribution-or-hosting',
      'tokenizer-license',
      'quantization-source',
      'artifact-provenance',
      'checksum-plan',
      'cache-policy',
      'user-deletion',
      'offline-fallback',
      'benchmark-pass',
      'safety-gates',
      'multilingual-review',
      'no-official-scoring-claim',
    ]) {
      assert.ok(ids.has(id), id);
    }
    assert.ok(LOCAL_MODEL_APPROVAL_CHECKS.every((check) => check.required));
    assert.ok(LOCAL_MODEL_APPROVAL_CHECKS.every((check) => check.completed === false));
  });

  it('builds an honest summary with zero approved candidates and pending checks', () => {
    const viewModel = buildLocalModelApprovalViewModel();
    assert.equal(viewModel.summary.totalCandidates, 3);
    assert.equal(viewModel.summary.approvedCandidates, 0);
    assert.equal(viewModel.summary.blockedCandidates, 3);
    assert.ok(viewModel.nextRequiredChecks.length >= 8);
    assert.match(viewModel.currentState, /no model candidate is approved/i);
    assert.doesNotMatch(
      JSON.stringify(viewModel),
      /model is ready|runtime is ready|download now|guaranteed|instant perfect/i,
    );
  });

  it('keeps local readiness explicit about no approved model or runtime', () => {
    const approvedModel = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'approved-local-model');
    const runtimeIntegration = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'runtime-integration');

    assert.equal(approvedModel?.status, 'pending-phase-4');
    assert.match(approvedModel?.description ?? '', /No approved local model/i);
    assert.equal(runtimeIntegration?.status, 'pending-phase-4');
    assert.match(runtimeIntegration?.description ?? '', /not connected/i);
  });

  it('documents the approval checklist and verified source references without approving artifacts', () => {
    const doc = read('../../docs/ai/phase-4-model-approval-checklist.md');
    for (const heading of [
      'Status',
      'Candidate registry',
      'Official-source review record',
      'Required approval checklist',
      'Artifact and runtime boundaries',
      'Next phase gates',
    ]) {
      assert.match(doc, new RegExp(`## ${heading.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'i'), heading);
    }
    assert.match(doc, /No candidate is approved/i);
    assert.match(doc, /Qwen3-0\.6B/i);
    assert.match(doc, /Qwen3-1\.7B/i);
    assert.match(doc, /Qwen3-4B/i);
    assert.doesNotMatch(doc, /configuredForRuntime:\s*true|downloadable:\s*true|artifactApproved:\s*true|is configured for runtime/i);
  });

  it('adds no runtime dependency and keeps the safety verifier green', () => {
    const packageJson = JSON.parse(read('../../package.json')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const dependencies = [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
    ];
    assert.equal(
      dependencies.some((name) => /web-llm|transformers|onnxruntime|llama\.cpp|ollama/i.test(name)),
      false,
    );

    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localModelApprovalRegistry.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelApprovalViewModel.ts')));
    assert.deepEqual(result.violations, []);
  });
});
