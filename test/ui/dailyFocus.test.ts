import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDailyFocus } from '../../src/services/dailyFocusService.ts';
import type { MissionWithProgress } from '../../src/services/missionProgressService.ts';

function mission(type: MissionWithProgress['type'], progress: number, target: number): MissionWithProgress {
  return {
    id: `${type}-${target}`,
    title: `Mission ${type}`,
    description: 'A real daily mission',
    type,
    progress,
    target,
    reward: 10,
    rarity: 'common',
    completed: progress >= target,
    claimed: false,
  };
}

describe('daily focus', () => {
  it('routes the first unfinished listening mission to listening practice', () => {
    const focus = createDailyFocus({
      missions: [mission('listening', 1, 3), mission('lessons', 1, 1)],
      currentLanguage: 'en',
      recommendedLessonPath: '/app/lesson?id=en_mod_1',
      streak: 0,
    });

    assert.equal(focus.actionPath, '/app/listening');
    assert.equal(focus.progressLabel, '1 / 3');
    assert.equal(focus.mascotState, 'listening');
    assert.equal(focus.status, 'in_progress');
  });

  it('celebrates only when every daily mission is complete', () => {
    const focus = createDailyFocus({
      missions: [mission('xp', 50, 50), mission('lessons', 1, 1)],
      currentLanguage: 'en',
      recommendedLessonPath: '/app/lesson?id=en_mod_1',
      streak: 4,
    });

    assert.equal(focus.status, 'complete');
    assert.equal(focus.mascotState, 'cheering');
    assert.equal(focus.actionPath, '/app/missions');
  });

  it('uses a real streak response only when a non-listening focus is still open', () => {
    const focus = createDailyFocus({
      missions: [mission('vocabulary', 0, 10)],
      currentLanguage: 'ja',
      recommendedLessonPath: '/app/lesson?id=ja_mod_1',
      streak: 3,
    });

    assert.equal(focus.actionPath, '/app/vocabulary');
    assert.equal(focus.mascotState, 'streak');
  });
});
