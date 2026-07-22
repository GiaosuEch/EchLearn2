import { createLocalPilotTelemetryStore, createMemoryPilotTelemetryQueue } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/telemetry/localPilotTelemetry.ts';
import { createIdlePilotTelemetryTransport } from '/mnt/data/ielts_audit_worktree/src/features/ieltsMastery/telemetry/pilotTelemetryTransport.ts';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const storage = new MemoryStorage();
const queue = createLocalPilotTelemetryStore(storage, createMemoryPilotTelemetryQueue());
let scheduled: (() => void) | undefined;
let sends = 0;
const transport = createIdlePilotTelemetryTransport({
  queue,
  ingest: async () => { sends += 1; },
  schedule: (work) => { scheduled = work; return () => { scheduled = undefined; }; },
});

transport.start();
const initialFlush = scheduled;
scheduled = undefined;
initialFlush?.();
await new Promise((resolve) => setImmediate(resolve));
console.log(JSON.stringify({ phase: 'after-initial-empty-flush', sends, queued: (await queue.list()).length, rescheduled: Boolean(scheduled) }));

await queue.record({
  enrollmentReference: 'telemetry:01234567-89ab-4def-8123-456789abcdef',
  sessionReference: 'telemetry-session:fedcba98-7654-4abc-8123-456789abcdef',
  completion: 'completed',
  latencyBucket: '300ms-to-2s',
  reviewDebtBucket: 'none',
  recoveryMode: false,
  extraPractice: false,
  clockGuard: false,
});
await new Promise((resolve) => setImmediate(resolve));
console.log(JSON.stringify({ phase: 'after-later-append', sends, queued: (await queue.list()).length, rescheduled: Boolean(scheduled) }));
