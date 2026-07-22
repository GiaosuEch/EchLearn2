import { createLocalMasteryRepository } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/data/localRepository.ts';
import { savePilotEnrollment } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/ui/enrollment.ts';
import { getRecoveryState } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/engine/session.ts';
import { startMasterySessionAtAction } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/ui/sessionLogic.ts';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const storage = new MemoryStorage();
const repoA = createLocalMasteryRepository(storage);
const repoB = createLocalMasteryRepository(storage);
savePilotEnrollment(repoA, { ownerId: 'race-user', lockedTimeZone: 'Asia/Bangkok', enrolledAt: '2026-07-22T00:00:00.000Z' });
const enrollmentId = 'ielts-mastery-pilot:race-user';
const common = {
  enrollmentId,
  projectedReviewMinutes: 0,
  remainingNewEntries: 90,
  recoveryState: getRecoveryState({ reviewDebtItems: 0, inactiveCalendarDaysInLastSeven: 0 }),
  suppliedTimeZone: 'Asia/Bangkok',
  calendarDay: '2026-07-22',
  clockIntegrity: { status: 'eligible' as const },
};

let resultB: unknown;
let injected = false;
const adversarialRepoA = {
  ...repoA,
  saveSession(session: Parameters<typeof repoA.saveSession>[0]) {
    if (!injected) {
      injected = true;
      resultB = startMasterySessionAtAction({
        repository: repoB,
        ...common,
        startedAt: '2026-07-22T01:00:00.001Z',
        sessionId: 'tab-b',
      });
    }
    return repoA.saveSession(session);
  },
};

const resultA = startMasterySessionAtAction({
  repository: adversarialRepoA,
  ...common,
  startedAt: '2026-07-22T01:00:00.000Z',
  sessionId: 'tab-a',
});

console.log(JSON.stringify({
  resultA,
  resultB,
  sessions: repoA.listSessions(enrollmentId).map(({ id, kind, sessionNumber }) => ({ id, kind, sessionNumber })),
  enrollment: repoA.getEnrollment(enrollmentId),
}, null, 2));
