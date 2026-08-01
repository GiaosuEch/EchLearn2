import test from 'node:test';
import assert from 'node:assert/strict';
import { ninetyDayRoadmap } from '../../src/viewmodels/ninetyDayRoadmap.ts';

test('90-day roadmap has three measurable 30-day phases', () => {
  assert.deepEqual(ninetyDayRoadmap.map((phase) => [phase.startDay, phase.endDay]), [[1, 30], [31, 60], [61, 90]]);
  assert.equal(ninetyDayRoadmap.every((phase) => phase.outcome.length > 0 && phase.checkpoint.length > 0), true);
});
