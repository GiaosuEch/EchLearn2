import type { MissionTemplate } from '../curriculum/missionBank';

/**
 * Daily-mission progress that actually moves.
 *
 * `DailyMissionsPage` used to hard-code `progress: 0` on every mission and never
 * update it, so a learner who finished ten lessons still saw `0/10` and could
 * never claim a reward. Completing an activity now emits a mission event that is
 * counted, persisted, and broadcast to any open mission view.
 */

export type MissionEventType = MissionTemplate['type'];

export interface MissionEvent {
  readonly userId: string;
  readonly type: MissionEventType;
  /** How much to add. XP events pass the XP amount; activity events pass 1. */
  readonly amount: number;
  /** Free-text origin, kept for debugging ("speed_quiz", "grammar_quiz", …). */
  readonly source?: string;
}

/** Counters for one user on one calendar day, keyed by mission type. */
export type MissionCounters = Partial<Record<MissionEventType, number>>;

export interface DailyMissionState {
  readonly date: string;
  readonly counters: MissionCounters;
  readonly claimed: readonly string[];
}

const STORAGE_PREFIX = 'echlearn_mission_progress_';

export function todayKey(now: Date = new Date()): string {
  return now.toISOString().split('T')[0];
}

function storageKey(userId: string, date: string): string {
  return `${STORAGE_PREFIX}${userId}_${date}`;
}

function emptyState(date: string): DailyMissionState {
  return { date, counters: {}, claimed: [] };
}

function isCounters(value: unknown): value is MissionCounters {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value as Record<string, unknown>).every(
    (entry) => typeof entry === 'number' && Number.isFinite(entry),
  );
}

export function readMissionState(userId: string, date: string = todayKey()): DailyMissionState {
  if (!userId) return emptyState(date);
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(userId, date));
    if (!raw) return emptyState(date);
    const parsed = JSON.parse(raw) as Partial<DailyMissionState>;
    return {
      date,
      counters: isCounters(parsed?.counters) ? parsed.counters : {},
      claimed: Array.isArray(parsed?.claimed) ? parsed.claimed.filter((id): id is string => typeof id === 'string') : [],
    };
  } catch {
    return emptyState(date);
  }
}

function writeMissionState(userId: string, state: DailyMissionState): void {
  try {
    globalThis.localStorage?.setItem(storageKey(userId, state.date), JSON.stringify(state));
  } catch {
    // Storage unavailable: progress stays in-memory for this session only.
  }
}

// ─── Subscribers ─────────────────────────────────────────────────────────────
// A plain listener set rather than a store, because both React views and
// non-React services (learningStore, practice integration) publish into it.

type MissionListener = (state: DailyMissionState, userId: string) => void;

const listeners = new Set<MissionListener>();

export function subscribeToMissionProgress(listener: MissionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(state: DailyMissionState, userId: string): void {
  for (const listener of [...listeners]) {
    try {
      listener(state, userId);
    } catch {
      // A broken view must not stop the others from updating.
    }
  }
}

async function getSupabaseRuntime() {
  return import('../lib/supabase.ts');
}

/** Best-effort remote persistence. Local storage stays the fast path. */
async function persistRemote(userId: string, state: DailyMissionState): Promise<void> {
  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return;

    await supabase
      .from('daily_mission_progress')
      .upsert(
        {
          user_id: userId,
          mission_date: state.date,
          counters: state.counters,
          claimed: state.claimed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,mission_date' },
      );
  } catch {
    // Offline or table missing — local progress is still correct.
  }
}

/**
 * Records one mission-relevant action and returns the updated state.
 *
 * Called from the completion paths (lesson finished, quiz finished, XP awarded),
 * NOT from render — a mission must never advance just because a page mounted.
 */
export function recordMissionEvent(event: MissionEvent): DailyMissionState {
  const { userId, type, amount } = event;
  if (!userId || !type) return emptyState(todayKey());

  const increment = Number.isFinite(amount) ? Math.max(0, Math.trunc(amount)) : 0;
  if (increment === 0) return readMissionState(userId);

  const date = todayKey();
  const current = readMissionState(userId, date);
  const next: DailyMissionState = {
    date,
    counters: { ...current.counters, [type]: (current.counters[type] ?? 0) + increment },
    claimed: current.claimed,
  };

  writeMissionState(userId, next);
  void persistRemote(userId, next);
  notify(next, userId);
  return next;
}

/**
 * A finished activity advances two counters: its own skill and the generic
 * `lessons` counter, plus `perfect_lessons` on a flawless run. Missions like
 * "Complete 3 lessons today" would otherwise never move for skill practice.
 */
export function recordActivityCompletion(params: {
  userId: string;
  skillType: MissionEventType | 'lesson';
  isPerfect?: boolean;
  source?: string;
}): DailyMissionState {
  const { userId, skillType, isPerfect, source } = params;
  if (!userId) return emptyState(todayKey());

  let state = recordMissionEvent({ userId, type: 'lessons', amount: 1, source });

  if (skillType !== 'lesson' && skillType !== 'lessons') {
    state = recordMissionEvent({ userId, type: skillType, amount: 1, source });
  }

  if (isPerfect) {
    state = recordMissionEvent({ userId, type: 'perfect_lessons', amount: 1, source });
  }

  return state;
}

/** Marks a reward as claimed so it cannot be claimed twice in a day. */
export function claimMissionReward(userId: string, missionId: string): DailyMissionState {
  const date = todayKey();
  const current = readMissionState(userId, date);
  if (current.claimed.includes(missionId)) return current;

  const next: DailyMissionState = { ...current, claimed: [...current.claimed, missionId] };
  writeMissionState(userId, next);
  void persistRemote(userId, next);
  notify(next, userId);
  return next;
}

export interface MissionWithProgress extends MissionTemplate {
  readonly progress: number;
  readonly completed: boolean;
  readonly claimed: boolean;
}

/** Projects the stored counters onto today's generated mission list. */
export function applyProgressToMissions(
  missions: readonly MissionTemplate[],
  state: DailyMissionState,
): MissionWithProgress[] {
  return missions.map((mission) => {
    const progress = Math.min(mission.target, state.counters[mission.type] ?? 0);
    return {
      ...mission,
      progress,
      completed: progress >= mission.target,
      claimed: state.claimed.includes(mission.id),
    };
  });
}

/** Hydrates local state from Supabase, keeping whichever counter is higher. */
export async function syncMissionStateFromRemote(userId: string): Promise<DailyMissionState> {
  const date = todayKey();
  const local = readMissionState(userId, date);

  try {
    const { isSupabaseConfigured, supabase } = await getSupabaseRuntime();
    if (!isSupabaseConfigured() || !supabase) return local;

    const { data, error } = await supabase
      .from('daily_mission_progress')
      .select('counters, claimed')
      .eq('user_id', userId)
      .eq('mission_date', date)
      .maybeSingle();

    if (error || !data) return local;

    const remoteCounters = isCounters(data.counters) ? data.counters : {};
    const merged: MissionCounters = { ...remoteCounters };
    for (const [type, value] of Object.entries(local.counters)) {
      const key = type as MissionEventType;
      // Take the max: a locally-earned counter must not be erased by a stale row.
      merged[key] = Math.max(merged[key] ?? 0, value ?? 0);
    }

    const remoteClaimed = Array.isArray(data.claimed) ? (data.claimed as string[]) : [];
    const next: DailyMissionState = {
      date,
      counters: merged,
      claimed: Array.from(new Set([...local.claimed, ...remoteClaimed])),
    };

    writeMissionState(userId, next);
    notify(next, userId);
    return next;
  } catch {
    return local;
  }
}
