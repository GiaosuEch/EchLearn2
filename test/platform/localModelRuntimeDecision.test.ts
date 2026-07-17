import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import {
  LOCAL_MODEL_RUNTIME_DECISION,
  type LocalModelRuntimeOption,
} from '../../src/platform/ai/localModelRuntimeDecision.ts';
import { buildLocalModelRuntimeDecisionViewModel } from '../../src/platform/ai/localModelRuntimeDecisionViewModel.ts';
import { LOCAL_AI_READINESS_CHECKLIST } from '../../src/platform/ai/localAiReadinessChecklist.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

function runtimeOption(id: LocalModelRuntimeOption['id']): LocalModelRuntimeOption {
  const result = LOCAL_MODEL_RUNTIME_DECISION.runtimeOptions.find((option) => option.id === id);
  assert.ok(result, `Missing runtime option: ${id}`);
  return result;
}

describe('Phase 4.1 local model runtime ADR decision', () => {
  it('is proposed research, not an implemented or approved runtime', () => {
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.status, 'proposed');
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.implemented, false);
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.runtimeApproved, false);
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.modelApproved, false);
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.recommendedRuntimeId, 'mlc-webllm');
    assert.equal(runtimeOption('mlc-webllm').candidatePosition, 'candidate-for-validation');
  });

  it('evaluates all required runtime paths without adding runtime behavior', () => {
    assert.deepEqual(
      LOCAL_MODEL_RUNTIME_DECISION.runtimeOptions.map((option) => option.id),
      ['mlc-webllm', 'transformers-js', 'llama-cpp-browser', 'keep-unavailable-safe'],
    );
    assert.equal(runtimeOption('keep-unavailable-safe').rollbackFallback, true);
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.rollbackPlan.shellBehavior, 'unavailable-safe');
    assert.match(LOCAL_MODEL_RUNTIME_DECISION.rollbackPlan.description, /unavailable-safe/i);
  });

  it('keeps model candidates descriptive and unconfigured', () => {
    assert.deepEqual(
      LOCAL_MODEL_RUNTIME_DECISION.modelCandidates.map((candidate) => candidate.tier),
      ['light', 'standard', 'pro'],
    );
    assert.deepEqual(
      LOCAL_MODEL_RUNTIME_DECISION.modelCandidates.map((candidate) => candidate.name),
      ['Qwen3-0.6B', 'Qwen3-1.7B', 'Qwen3-4B'],
    );
    for (const candidate of LOCAL_MODEL_RUNTIME_DECISION.modelCandidates) {
      assert.equal(candidate.approved, false);
      assert.equal(candidate.configured, false);
      assert.equal(candidate.licenseStatus, 'candidate-needs-review');
    }
  });

  it('contains approval gates before Phase 4.2 and benchmark gates before Phase 4.3', () => {
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.licenseAndArtifactApprovalChecklist.length >= 6);
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase42EntryCriteria.length >= 7);
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase43BenchmarkCriteria.length >= 8);
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase42EntryCriteria.some((item) => /license/i.test(item)));
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase42EntryCriteria.some((item) => /artifact/i.test(item)));
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase43BenchmarkCriteria.some((item) => /13 languages/i.test(item)));
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase43BenchmarkCriteria.some((item) => /weak-device|device tier/i.test(item)));
    assert.ok(LOCAL_MODEL_RUNTIME_DECISION.phase43BenchmarkCriteria.some((item) => /grading/i.test(item)));
  });

  it('keeps remote inference outside the primary product path', () => {
    assert.equal(LOCAL_MODEL_RUNTIME_DECISION.remoteInferencePolicy, 'not-primary');
    assert.match(LOCAL_MODEL_RUNTIME_DECISION.productFit.browserLocalRationale, /browser/i);
    assert.match(LOCAL_MODEL_RUNTIME_DECISION.productFit.externalAppRationale, /external application/i);
  });

  it('contains no runtime configuration, dependency, model location, or generated behavior', () => {
    const decisionSource = read('../../src/platform/ai/localModelRuntimeDecision.ts');
    const packageJson = JSON.parse(read('../../package.json')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
    ];

    assert.doesNotMatch(decisionSource, /https?:\/\/|modelUrl|downloadUrl|apiKey|\.execute\(|Math\.random|Date\.now|setTimeout|isAiGenerated\s*:\s*true/i);
    assert.equal(dependencyNames.some((name) => /web-llm|transformers|onnxruntime|llama\.cpp|ollama/i.test(name)), false);
  });

  it('builds an honest view model without model-readiness claims', () => {
    const viewModel = buildLocalModelRuntimeDecisionViewModel();
    assert.equal(viewModel.statusLabel, 'Proposed');
    assert.match(viewModel.currentState, /not implemented|not approved/i);
    assert.match(viewModel.candidateSummary, /candidate/i);
    assert.match(viewModel.rollbackSummary, /unavailable-safe/i);
    assert.doesNotMatch(
      JSON.stringify(viewModel),
      /model is ready|runtime is ready|guaranteed|instant perfect|personalized recommendation/i,
    );
  });

  it('keeps Phase 3 readiness explicit about no approved model or runtime', () => {
    const approvedModel = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'approved-local-model');
    const runtimeIntegration = LOCAL_AI_READINESS_CHECKLIST.find((item) => item.id === 'runtime-integration');
    assert.equal(approvedModel?.status, 'pending-phase-4');
    assert.match(approvedModel?.description ?? '', /No approved local model/i);
    assert.equal(runtimeIntegration?.status, 'pending-phase-4');
    assert.match(runtimeIntegration?.description ?? '', /not connected/i);
  });

  it('contains every required ADR section and an official-source verification record', () => {
    const adr = read('../../docs/ai/phase-4-local-model-runtime-adr.md');
    for (const heading of [
      'Status',
      'Context',
      'Decision',
      'Options considered',
      'Recommended Phase 4 path',
      'Candidate runtime matrix',
      'Candidate model matrix',
      'License and artifact approval checklist',
      'Device tier assumptions',
      'Privacy and storage',
      'Safety and grading limitations',
      'Rollback plan',
      'Non-goals',
      'Phase 4.2 entry criteria',
      'Phase 4.3 benchmark criteria',
      'Primary-source verification record',
    ]) {
      assert.match(adr, new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), heading);
    }
    assert.match(adr, /Status:\s*Proposed/i);
    assert.match(adr, /MLC WebLLM/i);
    assert.match(adr, /Transformers\.js/i);
    assert.match(adr, /llama\.cpp/i);
    assert.match(adr, /Qwen3-0\.6B/i);
    assert.match(adr, /Qwen3-1\.7B/i);
    assert.match(adr, /Qwen3-4B/i);
    assert.match(adr, /No candidate is approved/i);
  });

  it('keeps the existing AI safety verifier green with decision sources included', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localModelRuntimeDecision.ts')));
    assert.ok(result.files.some((path) => path.endsWith('localModelRuntimeDecisionViewModel.ts')));
    assert.deepEqual(result.violations, []);
  });
});
