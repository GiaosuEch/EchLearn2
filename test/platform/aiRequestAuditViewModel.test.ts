import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AIRequestAuditEntry } from '../../src/platform/ai/aiRequestAuditTypes.ts';
import { buildAIRequestAuditViewModel } from '../../src/platform/ai/aiRequestAuditViewModel.ts';

const older: AIRequestAuditEntry = {
  id: 'older',
  featureId: 'ai-tutor',
  actionType: 'conversation',
  source: '/app/ai-tutor',
  status: 'unavailable',
  startedAt: '2026-07-17T00:00:00.000Z',
  completedAt: undefined,
  durationMs: undefined,
  requiresLocalModel: true,
  learnerMemoryContextUsed: false,
  learnerMemoryConsentAtRequest: false,
  errorCode: 'runtime-not-implemented',
  safetyFlags: ['no-raw-content-stored'],
};

const newer: AIRequestAuditEntry = {
  ...older,
  id: 'newer',
  featureId: 'writing-coach',
  actionType: 'feedback',
  source: '/app/ai-writing',
  status: 'completed-without-output',
  startedAt: '2026-07-17T00:01:00.000Z',
  completedAt: '2026-07-17T00:01:01.000Z',
  durationMs: 1000,
  learnerMemoryConsentAtRequest: true,
};

describe('AI request audit view model', () => {
  it('sorts entries newest-first without mutating the input', () => {
    const input = [older, newer];
    const viewModel = buildAIRequestAuditViewModel(input);

    assert.deepEqual(viewModel.entries.map((entry) => entry.id), ['newer', 'older']);
    assert.deepEqual(input.map((entry) => entry.id), ['older', 'newer']);
  });

  it('exposes honest metadata labels and no generated content', () => {
    const viewModel = buildAIRequestAuditViewModel([newer]);
    const [entry] = viewModel.entries;

    assert.equal(entry.featureLabel, 'Writing Coach');
    assert.equal(entry.statusLabel, 'Completed without output');
    assert.equal(entry.learnerMemoryLabel, 'Consent enabled; context not used');
    assert.equal(entry.durationLabel, '1000 ms');
    assert.match(viewModel.privacyNotice, /metadata only/i);
    assert.doesNotMatch(JSON.stringify(viewModel), /personalized recommendation|generated insight|score/i);
  });
});
