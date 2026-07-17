import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import {
  AI_FEATURE_REGISTRY,
  getAIFeatureById,
} from '../../src/platform/ai/aiFeatureRegistry.ts';
import {
  AI_REQUEST_AUDIT_STORAGE_KEY,
  createAIRequestAuditStore,
  createInMemoryAIRequestAuditStorage,
} from '../../src/platform/ai/aiRequestAuditStore.ts';
import { mapAITutorResponse } from '../../src/platform/ai/aiTutorViewModel.ts';
import { mapPracticeGeneratorResponse } from '../../src/platform/ai/practiceGeneratorViewModel.ts';
import { mapSpeakingCoachResponse } from '../../src/platform/ai/speakingCoachViewModel.ts';
import type { AIServiceResponse, AIServiceRequestType } from '../../src/platform/ai/aiServiceTypes.ts';
import { mapWritingCoachResponse } from '../../src/platform/ai/writingCoachViewModel.ts';

const require = createRequire(import.meta.url);
const {
  collectAISafetySourceFiles,
  scanAISafetyRegression,
  scanAISafetySource,
} = require('../../scripts/verify_ai_safety_regression.cjs') as {
  collectAISafetySourceFiles(root: string): string[];
  scanAISafetyRegression(options: { root: string }): {
    files: string[];
    violations: Array<{ path: string; ruleId: string; message: string }>;
  };
  scanAISafetySource(
    relativePath: string,
    source: string,
  ): Array<{ path: string; ruleId: string; message: string }>;
};

function ruleIds(source: string, relativePath = 'src/components/ai/Unsafe.tsx') {
  return scanAISafetySource(relativePath, source).map((violation) => violation.ruleId);
}

function unavailableResponse(requestType: AIServiceRequestType): AIServiceResponse {
  return {
    status: 'unavailable',
    requestType,
    unavailableReason: 'runtime-not-implemented',
    evidence: [],
    limitations: { codes: ['runtime-not-implemented'] },
    provenance: {
      serviceId: 'platform-ai-service',
      serviceVersion: '1.0.0',
    },
    safety: {
      status: 'not-evaluated',
      reasons: ['runtime-not-implemented'],
    },
    isAiGenerated: false,
  };
}

describe('AI safety regression hardening', () => {
  it('detects forbidden marketing and provider claims in AI runtime copy', () => {
    const rules = ruleIds(`
      export function UnsafeCopy() {
        return <p>Unlimited AI with ChatGPT-like cloud AI feedback.</p>;
      }
    `);

    assert.ok(rules.includes('forbidden-claim'));
  });

  it('detects fake score, output, recommendation, delay, streaming, and completed-audit patterns', () => {
    const rules = ruleIds(`
      const pronunciationScore = 98;
      const recommendation = 'Advance immediately';
      const result = { status: 'success', feedback: 'Perfect work', isAiGenerated: true };
      setTimeout(() => show(result), 400);
      const stream = { streaming: true };
      auditStore.record({ status: 'completed', featureId: 'ai-tutor' });
      Math.random();
    `);

    for (const expected of [
      'non-deterministic-random',
      'fake-delay',
      'fake-streaming',
      'fake-score',
      'fake-recommendation',
      'hardcoded-generated-output',
      'fake-completed-audit',
    ]) {
      assert.ok(rules.includes(expected), expected);
    }
  });

  it('detects forbidden raw content fields in the audit schema or store', () => {
    const rules = ruleIds(`
      export interface UnsafeAuditEntry {
        rawPrompt: string;
        output?: string;
        learnerMemoryContent: unknown;
      }
    `, 'src/platform/ai/aiRequestAuditTypes.ts');

    assert.ok(rules.includes('audit-raw-content-field'));
  });

  it('scans only the explicit AI platform scope and never protected paths or test fixtures', () => {
    const root = mkdtempSync(join(tmpdir(), 'ai-safety-scope-'));
    try {
      const files = {
        'src/platform/ai/safe.ts': "export const status = 'unavailable';",
        'src/components/ai/Safe.tsx': 'export const Safe = () => <p>Local model required.</p>;',
        'src/platform/learning/learnerMemorySafe.ts': 'export const consent = false;',
        'public/audio/unsafe.ts': "export const claim = 'unlimited AI';",
        'public/data/unsafe.ts': "export const claim = 'cloud AI';",
        'src/curriculum/unsafe.ts': "export const claim = 'guaranteed band';",
        'supabase/migrations/unsafe.sql': 'OpenAI',
        'test/platform/forbiddenFixture.ts': "export const forbidden = ['ChatGPT-like'];",
        'scripts/forbidden-list.cjs': "module.exports = ['official IELTS score'];",
      };

      for (const [relativePath, source] of Object.entries(files)) {
        const absolutePath = join(root, relativePath);
        mkdirSync(join(absolutePath, '..'), { recursive: true });
        writeFileSync(absolutePath, source);
      }

      assert.deepEqual(collectAISafetySourceFiles(root), [
        'src/components/ai/Safe.tsx',
        'src/platform/ai/safe.ts',
        'src/platform/learning/learnerMemorySafe.ts',
      ]);
      assert.deepEqual(scanAISafetyRegression({ root }).violations, []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('passes the current AI platform sources without forbidden claims or fake implementations', () => {
    const result = scanAISafetyRegression({ root: process.cwd() });
    assert.ok(result.files.length > 10);
    assert.deepEqual(result.violations, []);
  });

  it('keeps model requirements and learner-memory behavior honest in the registry', () => {
    const modelDependent = AI_FEATURE_REGISTRY
      .filter((feature) => feature.requiresLocalModel)
      .map((feature) => feature.id);

    assert.deepEqual(modelDependent, [
      'ai-tutor',
      'practice-generator',
      'writing-coach',
      'speaking-coach',
    ]);

    const learnerMemory = getAIFeatureById('learner-memory');
    assert.ok(learnerMemory);
    assert.equal(learnerMemory.requiresLocalModel, false);
    assert.equal(learnerMemory.supportsLearnerMemory, false);
    assert.match(learnerMemory.safetyNote, /does not generate coaching output/i);

    for (const feature of AI_FEATURE_REGISTRY) {
      assert.doesNotMatch(feature.safetyNote, /model (?:is )?ready|runtime (?:is )?ready|available now/i);
    }
  });

  it('keeps unavailable coach states output-free and readiness-explicit', () => {
    const views = [
      mapAITutorResponse(unavailableResponse('conversation')),
      mapPracticeGeneratorResponse(unavailableResponse('generate-practice')),
      mapWritingCoachResponse(unavailableResponse('feedback')),
      mapSpeakingCoachResponse(unavailableResponse('feedback')),
    ];

    for (const view of views) {
      assert.equal(view.status, 'unavailable');
      assert.equal(view.isAiGenerated, false);
      assert.equal('output' in view, false);
      assert.equal('feedback' in view, false);
      assert.match(`${view.heading} ${view.description}`, /local AI|runtime|model/i);
    }
  });

  it('sanitizes stored audit entries and exports metadata only', () => {
    const storage = createInMemoryAIRequestAuditStorage();
    storage.setItem(AI_REQUEST_AUDIT_STORAGE_KEY, JSON.stringify([{
      id: 'unsafe-legacy-entry',
      featureId: 'writing-coach',
      actionType: 'feedback',
      status: 'failed',
      startedAt: '2026-07-17T00:00:00.000Z',
      learnerMemoryContextUsed: true,
      learnerMemoryConsentAtRequest: true,
      safetyFlags: ['no-raw-content-stored'],
      rawPrompt: 'private prompt',
      rawOutput: 'private output',
      essayText: 'private essay',
      transcript: 'private transcript',
      learnerMemoryContent: { weakSkills: ['private'] },
    }]));

    const store = createAIRequestAuditStore({
      storage,
      now: () => '2026-07-17T00:00:01.000Z',
      createId: () => 'audit-safe-1',
    });
    assert.equal(store.read().length, 1);

    const exported = store.exportJSON();
    for (const forbidden of [
      'rawPrompt',
      'prompt',
      'rawOutput',
      'output',
      'essayText',
      'transcript',
      'answerText',
      'generatedContent',
      'learnerMemoryContent',
      'private prompt',
      'private output',
      'private essay',
      'private transcript',
    ]) {
      assert.equal(exported.includes(forbidden), false, forbidden);
    }

    const persisted = storage.getItem(AI_REQUEST_AUDIT_STORAGE_KEY) ?? '[]';
    assert.deepEqual(JSON.parse(persisted), JSON.parse(exported));
  });

  it('keeps Hub and Audit UI source inside the same safety scan', () => {
    for (const relativePath of [
      'src/components/ai/AICoachHubShell.tsx',
      'src/components/ai/AIRequestAuditShell.tsx',
      'src/pages/app/AICoachHubPage.tsx',
      'src/pages/app/AIRequestAuditPage.tsx',
    ]) {
      const source = readFileSync(join(process.cwd(), relativePath), 'utf8');
      assert.deepEqual(scanAISafetySource(relativePath, source), []);
    }
  });
});
