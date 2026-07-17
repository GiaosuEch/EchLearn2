import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { AI_FEATURE_REGISTRY } from '../../src/platform/ai/aiFeatureRegistry.ts';
import { buildAISettingsViewModel } from '../../src/platform/ai/aiSettingsViewModel.ts';
import type { AISettingsPreferences } from '../../src/platform/ai/aiSettingsTypes.ts';
import type { LearnerMemoryRecord } from '../../src/platform/learning/learnerMemoryTypes.ts';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const settings: AISettingsPreferences = {
  preferredLocalAiTier: 'pro',
  showUnavailableAiFeatures: true,
  allowMetadataAuditLog: false,
  updatedAt: '2026-07-17T04:00:00.000Z',
};

function learnerMemoryRecord(consent: boolean): LearnerMemoryRecord {
  return { consent, snapshot: null };
}

describe('AI Settings view model and shell', () => {
  it('summarizes the AI Feature Registry without inventing readiness', () => {
    const viewModel = buildAISettingsViewModel(
      settings,
      learnerMemoryRecord(false),
      AI_FEATURE_REGISTRY,
    );

    assert.equal(viewModel.summary.totalFeatures, 5);
    assert.equal(viewModel.summary.modelRequiredFeatures, 4);
    assert.equal(viewModel.summary.learnerMemorySupportedFeatures, 4);
    assert.match(viewModel.localAIStatusDescription, /does not verify|not.*ready|approved local model/i);
    assert.match(viewModel.preferredTierDescription, /preference/i);
    assert.match(viewModel.preferredTierDescription, /does not.*ready|not.*readiness/i);
  });

  it('displays learner-memory consent as external source-of-truth state', () => {
    const disabled = buildAISettingsViewModel(settings, learnerMemoryRecord(false));
    const enabled = buildAISettingsViewModel(settings, learnerMemoryRecord(true));

    assert.equal(disabled.learnerMemoryConsentEnabled, false);
    assert.match(disabled.learnerMemoryConsentLabel, /disabled/i);
    assert.equal(enabled.learnerMemoryConsentEnabled, true);
    assert.match(enabled.learnerMemoryConsentLabel, /enabled/i);
    assert.match(enabled.learnerMemoryConsentDescription, /Learner Memory page/i);
  });

  it('registers the /app/ai/settings route and page export', () => {
    const app = read('../../src/App.tsx');
    const pages = read('../../src/pages/index.ts');
    const page = read('../../src/pages/app/AISettingsPage.tsx');

    assert.match(app, /AISettingsPage/);
    assert.match(app, /<Route path="ai\/settings" element={<AISettingsPage \/>} \/>/);
    assert.match(pages, /AISettingsPage.*\.\/app\/AISettingsPage/);
    assert.match(page, /<AISettingsShell\s*\/>/);
  });

  it('links the AI Coach Hub to Settings and Privacy', () => {
    const hub = read('../../src/components/ai/AICoachHubShell.tsx');

    assert.match(hub, /to="\/app\/ai\/settings"/);
    assert.match(hub, /Settings \/ Privacy/);
  });

  it('links Settings to the Audit Log, Learner Memory, and AI Hub', () => {
    const shell = read('../../src/components/ai/AISettingsShell.tsx');

    assert.match(shell, /to="\/app\/ai\/audit"/);
    assert.match(shell, /to="\/app\/learner-memory"/);
    assert.match(shell, /to="\/app\/ai"/);
    assert.match(shell, /readLearnerMemoryRecord/);
    assert.doesNotMatch(shell, /enableLearnerMemory|disableLearnerMemory|deleteLearnerMemory/);
  });

  it('keeps settings metadata-only and unavailable-safe', () => {
    const sources = [
      read('../../src/platform/ai/aiSettingsTypes.ts'),
      read('../../src/platform/ai/aiSettingsStore.ts'),
      read('../../src/platform/ai/aiSettingsViewModel.ts'),
      read('../../src/components/ai/AISettingsShell.tsx'),
      read('../../src/pages/app/AISettingsPage.tsx'),
    ].join('\n');

    assert.doesNotMatch(sources, /AIService|\.execute\(|Math\.random|Date\.now|setTimeout/);
    assert.doesNotMatch(sources, /rawPrompt|rawOutput|essayText|transcript|answerText|generatedContent|learnerMemoryContent/);
    assert.doesNotMatch(sources, /fake output|personalized recommendation|score\s*[:=]|model is ready/i);
    assert.doesNotMatch(sources, /IELTS|TOEIC|TOEFL|band score|Speaking Part|Writing Task/i);
  });
});
