/**
 * Offline Sync Service Adapter
 * 
 * Provides queued offline action storage and synchronization fallback.
 */

interface OfflineAction {
  id: string;
  actionType: string;
  payload: any;
  createdAt: number;
}

const STORAGE_KEY = 'ech_offline_actions_queue';

function readQueue(): OfflineAction[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineAction[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore storage write error
  }
}

export function queueOfflineAction(actionType: string, payload: any): void {
  const queue = readQueue();
  queue.push({
    id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    actionType,
    payload,
    createdAt: Date.now()
  });
  writeQueue(queue);
}

export function getOfflineQueue(): OfflineAction[] {
  return readQueue();
}

export async function flushOfflineQueue(): Promise<number> {
  const queue = readQueue();
  const count = queue.length;
  writeQueue([]);
  return count;
}
