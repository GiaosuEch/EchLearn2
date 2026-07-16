import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createLearnerMemoryAIContext,
  createFutureAIContext,
  createLearnerMemoryViewModel,
} from '../../src/platform/learning/learnerMemoryViewModel.ts';
import type { LearnerMemoryRecord } from '../../src/platform/learning/learnerMemoryTypes.ts';

const offRecord: LearnerMemoryRecord = { consent: false, snapshot: null };

const snapshot = {
  targetLanguage: 'en',
  nativeLanguage: 'vi',
  skillFocus: 'listening',
  difficultyPreference: 'intermediate',
  recentPracticeSummary: undefined,
  weakSkills: ['listening'],
  preferredExerciseTypes: ['short-answer'],
  updatedAt: '2026-07-16T00:00:00.000Z',
  source: 'learner-memory-shell',
};

const onRecord: LearnerMemoryRecord = { consent: true, snapshot };
const disabledWithSnapshotRecord: LearnerMemoryRecord = { consent: false, snapshot };

describe('learner memory view model', () => {
  it('reports off status by default', () => {
    const view = createLearnerMemoryViewModel(offRecord);

    assert.equal(view.status, 'off');
    assert.equal(view.consent, false);
  });

  it('reports on status when consent is enabled', () => {
    const view = createLearnerMemoryViewModel(onRecord);

    assert.equal(view.status, 'on');
    assert.equal(view.consent, true);
  });

  it('enabling consent allows a stored snapshot to be used as future AI context', () => {
    const context = createFutureAIContext(onRecord);

    assert.equal(context.available, true);
    assert.equal(context.targetLanguage, 'en');
  });

  it('disabling consent prevents memory from being used as AI context, even with a stored snapshot', () => {
    const context = createFutureAIContext(disabledWithSnapshotRecord);

    assert.equal(context.available, false);
    assert.equal(context.targetLanguage, undefined);
  });


  it('creates only generic learner memory fields for valid consented memory', () => {
    const context = createLearnerMemoryAIContext(onRecord);

    assert.deepEqual(context, {
      targetLanguage: 'en',
      nativeLanguage: 'vi',
      skillFocus: 'listening',
      difficultyPreference: 'intermediate',
      weakSkills: ['listening'],
      preferredExerciseTypes: ['short-answer'],
    });
  });

  it('returns no learner memory context for empty or malformed snapshots', () => {
    const emptyRecord = {
      consent: true,
      snapshot: {
        weakSkills: [],
        preferredExerciseTypes: [],
        updatedAt: '2026-07-16T00:00:00.000Z',
        source: 'learner-memory-shell',
      },
    } satisfies LearnerMemoryRecord;
    const malformedRecord = {
      consent: true,
      snapshot: {
        targetLanguage: 42,
        weakSkills: 'listening',
        preferredExerciseTypes: [],
      },
    } as unknown as LearnerMemoryRecord;

    assert.equal(createLearnerMemoryAIContext(emptyRecord), undefined);
    assert.equal(createLearnerMemoryAIContext(malformedRecord), undefined);
  });

  it('no snapshot means no AI context regardless of the consent flag', () => {
    const context = createFutureAIContext({ consent: true, snapshot: null });

    assert.equal(context.available, false);
  });
});
