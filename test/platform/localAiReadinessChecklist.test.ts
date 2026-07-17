import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import {
  LOCAL_AI_READINESS_CHECKLIST,
  type LocalAIReadinessItem,
} from '../../src/platform/ai/localAiReadinessChecklist.ts';
import { buildLocalAIReadinessViewModel } from '../../src/platform/ai/localAiReadinessViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
};
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

function item(id: string): LocalAIReadinessItem {
  const result = LOCAL_AI_READINESS_CHECKLIST.find((entry) => entry.id === id);
  assert.ok(result, `Missing checklist item: ${id}`);
  return result;
}

describe('Phase 3 local AI readiness closeout', () => {
  it('contains completed, pending, blocked, and informational groups', () => {
    const statuses = new Set(LOCAL_AI_READINESS_CHECKLIST.map((entry) => entry.status));
    assert.deepEqual([...statuses].sort(), [
      'blocked',
      'completed',
      'informational',
      'pending-phase-4',
    ]);
  });

  it('marks the Phase 3 platform foundations as completed', () => {
    for (const id of [
      'ai-service-boundary',
      'runtime-provider-boundary',
      'model-artifact-foundation',
      'feature-registry',
      'request-audit-log',
      'settings-privacy',
      'learner-memory-consent',
      'safety-regression-verifier',
      'unavailable-safe-shells',
      'remote-dependency-free',
      'honest-output-contract',
    ]) {
      assert.equal(item(id).status, 'completed', id);
    }
  });

  it('keeps approved model and generated runtime work pending or blocked for Phase 4', () => {
    assert.equal(item('approved-local-model').status, 'pending-phase-4');
    assert.equal(item('runtime-integration').status, 'pending-phase-4');
    assert.equal(item('generated-output-gate').status, 'blocked');

    const pendingCopy = [
      item('approved-local-model').description,
      item('runtime-integration').description,
      item('generated-output-gate').description,
    ].join(' ');
    assert.match(pendingCopy, /Phase 4/i);
    assert.match(pendingCopy, /no approved|not connected|remains blocked/i);
  });

  it('references existing Phase 3 evidence without scanning protected paths', () => {
    const requiredFiles = [
      'src/platform/ai/aiServiceTypes.ts',
      'src/platform/ai/runtimeProvider.ts',
      'src/platform/ai/modelArtifactManager.ts',
      'src/platform/ai/aiFeatureRegistry.ts',
      'src/platform/ai/aiRequestAuditStore.ts',
      'src/platform/ai/aiSettingsStore.ts',
      'src/platform/learning/learnerMemoryViewModel.ts',
      'scripts/verify_ai_safety_regression.cjs',
    ];

    for (const relativePath of requiredFiles) {
      assert.equal(existsSync(relativePath), true, relativePath);
    }

    const evidence = LOCAL_AI_READINESS_CHECKLIST.flatMap((entry) => entry.evidencePaths);
    assert.equal(evidence.some((path) => /^(?:\.env|secrets|\.agents\/|docs\/superpowers\/|public\/audio\/|public\/data\/|src\/curriculum\/|supabase\/migrations\/)/.test(path)), false);
  });

  it('builds grouped counts without claiming model readiness', () => {
    const viewModel = buildLocalAIReadinessViewModel();
    const expected = LOCAL_AI_READINESS_CHECKLIST.reduce<Record<string, number>>((counts, entry) => {
      counts[entry.status] = (counts[entry.status] ?? 0) + 1;
      return counts;
    }, {});

    assert.equal(viewModel.summary.total, LOCAL_AI_READINESS_CHECKLIST.length);
    assert.equal(viewModel.summary.completed, expected.completed);
    assert.equal(viewModel.summary.pendingPhase4, expected['pending-phase-4']);
    assert.equal(viewModel.summary.blocked, expected.blocked);
    assert.equal(viewModel.summary.informational, expected.informational);
    assert.match(viewModel.currentStatusDescription, /no approved local model|not connected/i);
    assert.match(viewModel.phase4Description, /Phase 4/i);
    assert.match(viewModel.preferredTierNote, /preference/i);
  });

  it('keeps checklist and view-model copy free of fake output, score, and readiness claims', () => {
    const sources = [
      read('../../src/platform/ai/localAiReadinessChecklist.ts'),
      read('../../src/platform/ai/localAiReadinessViewModel.ts'),
    ].join('\n');

    assert.doesNotMatch(sources, /Math\.random|Date\.now|setTimeout|isAiGenerated\s*:\s*true/);
    assert.doesNotMatch(sources, /personalized recommendation|guaranteed|instant perfect|model is ready|runtime is ready/i);
    assert.doesNotMatch(sources, /IELTS|TOEIC|TOEFL|band score|Speaking Part|Writing Task/i);
    assert.doesNotMatch(sources, /OpenAI|Claude|Gemini|API key|cloud AI/i);
  });

  it('registers the readiness route and links from AI Settings', () => {
    const app = read('../../src/App.tsx');
    const pages = read('../../src/pages/index.ts');
    const page = read('../../src/pages/app/LocalAIReadinessPage.tsx');
    const settings = read('../../src/components/ai/AISettingsShell.tsx');

    assert.match(app, /LocalAIReadinessPage/);
    assert.match(app, /<Route path="ai\/readiness" element={<LocalAIReadinessPage \/>} \/>/);
    assert.match(pages, /LocalAIReadinessPage.*\.\/app\/LocalAIReadinessPage/);
    assert.match(page, /<LocalAIReadinessShell\s*\/>/);
    assert.match(settings, /to="\/app\/ai\/readiness"/);
    assert.match(settings, /Local AI Readiness/);
  });

  it('renders honest closeout and navigation copy in the shell', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');

    assert.match(shell, /Phase 3/i);
    assert.match(shell, /Phase 4/i);
    assert.match(shell, /viewModel\.currentStatusDescription/);
    assert.match(shell, /to="\/app\/ai\/settings"/);
    assert.match(shell, /to="\/app\/ai"/);
    assert.doesNotMatch(shell, /AIService|\.execute\(|Math\.random|Date\.now|setTimeout/);
  });

  it('keeps the existing AI safety verifier green with readiness sources included', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.some((path) => path.endsWith('localAiReadinessChecklist.ts')));
    assert.ok(result.files.some((path) => path.endsWith('LocalAIReadinessShell.tsx')));
    assert.deepEqual(result.violations, []);
  });
});
