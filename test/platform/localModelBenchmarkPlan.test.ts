import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY,
  LOCAL_MODEL_BENCHMARK_CORPUS,
  LOCAL_MODEL_BENCHMARK_DIMENSIONS,
  LOCAL_MODEL_BENCHMARK_LANGUAGES,
  createNotRunLocalModelBenchmarkResult,
} from '../../src/platform/ai/localModelBenchmarkPlan.ts';
import { buildLocalModelBenchmarkViewModel } from '../../src/platform/ai/localModelBenchmarkViewModel.ts';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_AI_READINESS_CHECKLIST } from '../../src/platform/ai/localAiReadinessChecklist.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const FORBIDDEN_EXAM_TERMS = [
  'IELTS',
  'TOEIC',
  'TOEFL',
  'band score',
  'Speaking Part',
  'Writing Task',
] as const;

const PROTECTED_PREFIXES = [
  '.env',
  'secrets/',
  '.agents/',
  'docs/superpowers/',
  'public/audio/',
  'public/data/',
  'src/curriculum/',
  'supabase/migrations/',
] as const;

describe('Phase 4.3 local model benchmark harness', () => {
  it('covers exactly the 13 supported app languages with deterministic corpus metadata', () => {
    assert.deepEqual(LOCAL_MODEL_BENCHMARK_LANGUAGES, [
      'en', 'vi', 'fr', 'de', 'es', 'zh', 'ja', 'ko', 'it', 'pt', 'ru', 'th', 'ar',
    ]);
    assert.equal(LOCAL_MODEL_BENCHMARK_CORPUS.length, 13);
    assert.deepEqual(
      LOCAL_MODEL_BENCHMARK_CORPUS.map((task) => task.language),
      LOCAL_MODEL_BENCHMARK_LANGUAGES,
    );
    assert.equal(new Set(LOCAL_MODEL_BENCHMARK_CORPUS.map((task) => task.taskId)).size, 13);
    for (const task of LOCAL_MODEL_BENCHMARK_CORPUS) {
      assert.equal(task.containsUserData, false);
      assert.equal(task.containsCopyrightedPassage, false);
      assert.equal(task.expectedOutput, null);
      assert.ok(task.instruction.length > 10);
    }
  });

  it('contains no exam-specific language or fake model answers', () => {
    const serialized = JSON.stringify({
      languages: LOCAL_MODEL_BENCHMARK_LANGUAGES,
      dimensions: LOCAL_MODEL_BENCHMARK_DIMENSIONS,
      corpus: LOCAL_MODEL_BENCHMARK_CORPUS,
    });
    for (const term of FORBIDDEN_EXAM_TERMS) {
      assert.doesNotMatch(serialized, new RegExp(term, 'i'));
    }
    assert.doesNotMatch(
      serialized,
      /generatedAnswer|modelAnswer|sampleAnswer|fakeOutput|isAiGenerated\s*:\s*true/i,
    );
  });

  it('defines every required deterministic benchmark dimension', () => {
    const ids = new Set(LOCAL_MODEL_BENCHMARK_DIMENSIONS.map((dimension) => dimension.id));
    for (const requiredId of [
      'runtime-capability',
      'artifact-size-budget',
      'initialization-time',
      'first-token-latency',
      'sustained-generation-speed',
      'peak-memory-risk',
      'cancellation-reload-recovery',
      'corrupted-cache-recovery',
      'unsupported-device-fallback',
      'multilingual-instruction-following',
      'tutor-usefulness',
      'practice-generation-usefulness',
      'writing-feedback-usefulness',
      'transcript-speaking-feedback-usefulness',
      'safety-behavior',
      'audit-provenance-metadata',
      'no-authoritative-scoring-claim',
    ]) {
      assert.equal(ids.has(requiredId), true, requiredId);
    }
    assert.ok(LOCAL_MODEL_BENCHMARK_DIMENSIONS.every((dimension) => dimension.status === 'planned'));
  });

  it('creates only an explicit not-run result contract with no fake measurements', () => {
    const result = createNotRunLocalModelBenchmarkResult({
      candidateId: 'qwen3-0-6b-candidate',
      runtimeCandidateId: 'mlc-webllm',
      deviceTier: 'light',
    });
    assert.equal(result.status, 'not-run');
    assert.equal(result.benchmarkStartedAt, null);
    assert.equal(result.benchmarkCompletedAt, null);
    assert.equal(result.metrics, null);
    assert.equal(result.provenance.status, 'not-collected');
    assert.deepEqual(result.safetyFlags, []);
    assert.deepEqual(result.notes, []);
  });

  it('keeps browser capability unknown until a later runtime probe', () => {
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.secureContextRequired, true);
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.webGpuRequired, true);
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.navigatorGpuAvailable, 'unchecked');
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.adapterStatus, 'unchecked');
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.deviceStatus, 'unchecked');
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.storageEstimateSupported, 'unchecked');
    assert.equal(LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY.unsupportedDeviceFallback, 'unavailable-safe');
  });

  it('summarizes planned work without approval or readiness claims', () => {
    const viewModel = buildLocalModelBenchmarkViewModel();
    assert.equal(viewModel.summary.totalBenchmarkTasks, 30);
    assert.equal(viewModel.summary.languagesCovered, 13);
    assert.equal(viewModel.summary.completedBenchmarkResults, 0);
    assert.equal(viewModel.summary.approvedBenchmarkCandidates, 0);
    assert.match(viewModel.nextRequiredAction, /run an isolated benchmark.*after.*approval/i);
    assert.match(viewModel.currentState, /not run/i);
    assert.doesNotMatch(
      JSON.stringify(viewModel),
      /model is ready|runtime is ready|benchmark passed|approved for runtime|generated recommendation/i,
    );
  });

  it('keeps every candidate benchmark status not-run and unapproved', () => {
    for (const candidate of LOCAL_MODEL_APPROVAL_REGISTRY) {
      assert.equal(candidate.benchmarkStatus, 'not-run');
      assert.equal(candidate.benchmarkApproved, false);
      assert.equal(candidate.runtimeReady, false);
    }
  });

  it('keeps local readiness explicit about no approved model or runtime', () => {
    const approvedModel = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'approved-local-model');
    const runtimeIntegration = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'runtime-integration');
    assert.equal(approvedModel?.status, 'pending-phase-4');
    assert.match(approvedModel?.description ?? '', /No approved local model/i);
    assert.equal(runtimeIntegration?.status, 'pending-phase-4');
    assert.match(runtimeIntegration?.description ?? '', /not connected/i);
  });

  it('documents a metadata-only plan without runtime configuration', () => {
    const doc = read('../../docs/ai/phase-4-local-model-benchmark-plan.md');
    for (const heading of [
      'Status',
      'Purpose',
      'Benchmark dimensions',
      'Language corpus metadata',
      'Browser capability contract',
      'Result contract',
      'Execution prerequisites',
      'Safety boundaries',
    ]) {
      assert.match(doc, new RegExp(`## ${heading.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'i'), heading);
    }
    assert.match(doc, /not run/i);
    assert.match(doc, /13 supported languages/i);
    assert.doesNotMatch(doc, /https?:\/\/|download URL|artifact URL|benchmark passed|approved for runtime/i);
  });

  it('keeps the safety scan green and outside protected paths', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localModelBenchmarkPlan.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelBenchmarkViewModel.ts')));
    assert.deepEqual(result.violations, []);
    for (const file of result.files) {
      assert.equal(PROTECTED_PREFIXES.some((prefix) => file.startsWith(prefix)), false, file);
    }
  });
});
