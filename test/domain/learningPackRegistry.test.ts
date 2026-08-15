import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LearningPackRegistry,
  type LearningPackDefinition,
  type LearningPathNode,
} from '../../src/domain/learning/learningPackRegistry.ts';

const lesson = (id: string, skill: string, prerequisites: readonly { lessonId: string; minimumPercent: number }[] = []) => ({
  id,
  skill,
  title: id,
  objective: 'A bounded learning objective.',
  masteryThreshold: 80,
  prerequisites,
});

const pack = (overrides: Partial<LearningPackDefinition> = {}): LearningPackDefinition => ({
  manifest: {
    id: 'te-starter',
    version: '1.0.0',
    publicationState: 'published',
    language: 'te',
    title: 'Test starter',
    audience: 'Test learner',
    entitlement: 'standard',
    contentDelivery: 'local-static',
    claim: 'starter-foundations',
    disclosure: 'Local test content only.',
    skills: ['vocabulary', 'grammar', 'reading'],
    routes: ['/app/test/vocabulary', '/app/test/grammar', '/app/test/reading'],
  },
  lessons: [
    lesson('te:test:vocabulary:one', 'vocabulary'),
    lesson('te:test:grammar:one', 'grammar', [{ lessonId: 'te:test:vocabulary:one', minimumPercent: 50 }]),
    lesson('te:test:reading:one', 'reading', [{ lessonId: 'te:test:grammar:one', minimumPercent: 80 }]),
  ],
  routes: [
    { path: '/app/test/vocabulary', skill: 'vocabulary' },
    { path: '/app/test/grammar', skill: 'grammar' },
    { path: '/app/test/reading', skill: 'reading' },
  ],
  ...overrides,
});

const nodes: readonly LearningPathNode[] = [
  { id: 'te:test:vocabulary:one', skill: 'vocabulary', progress: 100, status: 'completed' },
  { id: 'te:test:grammar:one', skill: 'grammar', progress: 80, status: 'completed' },
  { id: 'te:test:reading:one', skill: 'reading', progress: 0, status: 'active' },
];

test('resolves only an active lesson owned by the requested route', () => {
  const registry = new LearningPackRegistry([pack()]);

  const result = registry.resolveLessonRoute('/app/test/grammar', 'te:test:grammar:one', nodes);

  assert.equal(result.kind, 'ready');
  if (result.kind === 'ready') assert.equal(result.lesson.id, 'te:test:grammar:one');
});

test('rejects a cross-skill or locked deep link instead of substituting another lesson', () => {
  const registry = new LearningPackRegistry([pack()]);
  const lockedNodes = nodes.map((node) => node.id === 'te:test:grammar:one' ? { ...node, status: 'locked' as const } : node);

  assert.deepEqual(registry.resolveLessonRoute('/app/test/grammar', 'te:test:reading:one', nodes), { kind: 'invalid', reason: 'invalid-lesson' });
  assert.deepEqual(registry.resolveLessonRoute('/app/test/grammar', 'te:test:grammar:one', lockedNodes), { kind: 'invalid', reason: 'locked-lesson' });
});

test('selects the first active lesson only when the lesson query is omitted', () => {
  const registry = new LearningPackRegistry([pack()]);

  const result = registry.resolveLessonRoute('/app/test/reading', null, nodes);

  assert.equal(result.kind, 'ready');
  if (result.kind === 'ready') assert.equal(result.lesson.id, 'te:test:reading:one');
});

test('rejects duplicate routes, duplicate review IDs, and prerequisite cycles', () => {
  const invalid = pack({
    lessons: [
      { ...lesson('te:test:vocabulary:one', 'vocabulary', [{ lessonId: 'te:test:grammar:one', minimumPercent: 80 }]), reviewItemIds: ['te:review:1'] },
      { ...lesson('te:test:grammar:one', 'grammar', [{ lessonId: 'te:test:vocabulary:one', minimumPercent: 80 }]), reviewItemIds: ['te:review:1'] },
    ],
    routes: [
      { path: '/app/test/vocabulary', skill: 'vocabulary' },
      { path: '/app/test/vocabulary', skill: 'grammar' },
    ],
  });

  const issues = new LearningPackRegistry([invalid]).validate().join('\n');

  assert.match(issues, /duplicate route/);
  assert.match(issues, /duplicate review item/);
  assert.match(issues, /prerequisite cycle/);
});
