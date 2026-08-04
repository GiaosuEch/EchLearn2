import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { beforeEach, describe } from 'node:test';

/**
 * The bug these tests lock down: `DailyMissionsPage` hard-coded `progress: 0` on
 * every mission and never updated it, so a learner who finished ten lessons
 * still saw `0/10` and could never claim a reward.
 */

// The service reads `globalThis.localStorage`; give it an in-memory one.
const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
});

const {
  applyProgressToMissions,
  claimMissionReward,
  readMissionState,
  recordActivityCompletion,
  recordMissionEvent,
  subscribeToMissionProgress,
  todayKey,
} = await import('../../src/services/missionProgressService.ts');
const { generateDailyMissions } = await import('../../src/curriculum/missionBank.ts');

const USER = 'learner-1';

beforeEach(() => store.clear());

describe('recording mission events', () => {
  test('an XP award accumulates onto the xp counter', () => {
    recordMissionEvent({ userId: USER, type: 'xp', amount: 40 });
    recordMissionEvent({ userId: USER, type: 'xp', amount: 60 });
    assert.equal(readMissionState(USER).counters.xp, 100);
  });

  test('progress survives a reload', () => {
    recordMissionEvent({ userId: USER, type: 'lessons', amount: 1 });
    // A fresh read is what a remounted page does.
    assert.equal(readMissionState(USER).counters.lessons, 1);
  });

  test('one learner cannot advance another learner s missions', () => {
    recordMissionEvent({ userId: USER, type: 'lessons', amount: 3 });
    assert.equal(readMissionState('learner-2').counters.lessons, undefined);
  });

  test('a zero or negative amount is ignored rather than corrupting the counter', () => {
    recordMissionEvent({ userId: USER, type: 'xp', amount: 25 });
    recordMissionEvent({ userId: USER, type: 'xp', amount: 0 });
    recordMissionEvent({ userId: USER, type: 'xp', amount: -100 });
    recordMissionEvent({ userId: USER, type: 'xp', amount: Number.NaN });
    assert.equal(readMissionState(USER).counters.xp, 25);
  });

  test('malformed stored data falls back to empty rather than throwing', () => {
    store.set(`echlearn_mission_progress_${USER}_${todayKey()}`, '{not json');
    assert.deepEqual(readMissionState(USER).counters, {});
  });
});

describe('activity completion', () => {
  test('a finished skill activity advances both its skill and the generic lessons counter', () => {
    const state = recordActivityCompletion({ userId: USER, skillType: 'speaking' });
    assert.equal(state.counters.lessons, 1);
    assert.equal(state.counters.speaking, 1);
    assert.equal(state.counters.perfect_lessons, undefined);
  });

  test('a flawless run also advances perfect_lessons', () => {
    const state = recordActivityCompletion({ userId: USER, skillType: 'grammar', isPerfect: true });
    assert.equal(state.counters.perfect_lessons, 1);
  });

  test('a course lesson advances lessons exactly once, not twice', () => {
    const state = recordActivityCompletion({ userId: USER, skillType: 'lesson' });
    assert.equal(state.counters.lessons, 1);
  });
});

describe('projecting progress onto today s missions', () => {
  test('a mission reports real progress instead of a hard-coded zero', () => {
    recordMissionEvent({ userId: USER, type: 'lessons', amount: 4 });
    const missions = applyProgressToMissions(
      [{ id: 'm6', title: 'Complete 3 Lessons', description: '', target: 3, type: 'lessons', reward: 30, rarity: 'rare' }],
      readMissionState(USER),
    );
    assert.equal(missions[0].progress, 3, 'progress is capped at the target');
    assert.equal(missions[0].completed, true);
  });

  test('an untouched mission stays at zero and incomplete', () => {
    const missions = applyProgressToMissions(
      [{ id: 'm17', title: 'Speak Up', description: '', target: 3, type: 'speaking', reward: 30, rarity: 'common' }],
      readMissionState(USER),
    );
    assert.equal(missions[0].progress, 0);
    assert.equal(missions[0].completed, false);
  });
});

describe('claiming', () => {
  test('a claim is persisted so a reload cannot pay the reward twice', () => {
    claimMissionReward(USER, 'm6');
    assert.deepEqual(readMissionState(USER).claimed, ['m6']);
    claimMissionReward(USER, 'm6');
    assert.deepEqual(readMissionState(USER).claimed, ['m6']);
  });

  test('claiming does not erase earned counters', () => {
    recordMissionEvent({ userId: USER, type: 'xp', amount: 150 });
    const state = claimMissionReward(USER, 'm3');
    assert.equal(state.counters.xp, 150);
  });
});

describe('subscribers', () => {
  test('an open mission view is notified when a lesson elsewhere completes', () => {
    const seen: number[] = [];
    const unsubscribe = subscribeToMissionProgress((state, userId) => {
      if (userId === USER) seen.push(state.counters.lessons ?? 0);
    });

    recordMissionEvent({ userId: USER, type: 'lessons', amount: 1 });
    recordMissionEvent({ userId: USER, type: 'lessons', amount: 1 });
    unsubscribe();
    recordMissionEvent({ userId: USER, type: 'lessons', amount: 1 });

    assert.deepEqual(seen, [1, 2], 'no notification after unsubscribe');
  });

  test('one throwing listener does not stop the others', () => {
    let reached = false;
    const offBad = subscribeToMissionProgress(() => { throw new Error('boom'); });
    const offGood = subscribeToMissionProgress(() => { reached = true; });

    recordMissionEvent({ userId: USER, type: 'xp', amount: 10 });
    offBad();
    offGood();

    assert.equal(reached, true);
  });
});

describe('daily mission generation', () => {
  test('the three daily cards always have distinct ids', () => {
    // Duplicate ids would make claiming one card mark the other claimed too.
    for (let seed = 0; seed < 60; seed += 1) {
      for (const date of ['2026-08-03', '2026-08-04', '2026-12-31', '2027-01-01']) {
        const ids = generateDailyMissions(date, seed).map((mission) => mission.id);
        assert.equal(new Set(ids).size, ids.length, `collision at seed ${seed} on ${date}: ${ids.join(',')}`);
      }
    }
  });

  test('the same learner gets the same missions all day', () => {
    const first = generateDailyMissions('2026-08-03', 7).map((m) => m.id);
    const second = generateDailyMissions('2026-08-03', 7).map((m) => m.id);
    assert.deepEqual(first, second);
  });
});

describe('page wiring', () => {
  const read = (relativePath: string) =>
    readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), 'utf8');

  test('DailyMissionsPage reads stored progress instead of hard-coding zero', () => {
    const source = read('src/pages/app/gamification/DailyMissionsPage.tsx');
    assert.match(source, /applyProgressToMissions/);
    assert.match(source, /subscribeToMissionProgress/);
    assert.match(source, /claimMissionReward/);
    assert.doesNotMatch(source, /progress:\s*0\s*$/m);
  });

  test('the course lesson player advances the lesson missions', () => {
    assert.match(read('src/pages/app/LessonPlayerPage.tsx'), /recordActivityCompletion/);
  });

  test('the remote table the service upserts into is created by a migration', () => {
    const migration = read('supabase/migrations/202608030001_realtime_pricing_and_pro_role.sql');
    assert.match(migration, /create table if not exists public\.daily_mission_progress/);
    assert.match(migration, /enable row level security/);
  });
});
