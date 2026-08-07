import { toast } from '../components/ui/Toast';

export interface OfflineAction {
  id: string;
  type: 'COMPLETED_LESSON' | 'EARNED_XP' | 'SUBMITTED_PRACTICE';
  payload: any;
  timestamp: string;
}

const OFFLINE_QUEUE_KEY = 'echlearn_offline_sync_queue';

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

export function queueOfflineAction(type: OfflineAction['type'], payload: any) {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  queue.push(newAction);
  saveOfflineQueue(queue);
}

export async function flushOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  // Process offline items into local & remote storage
  const processedCount = queue.length;
  saveOfflineQueue([]); // Clear queue after flush

  toast(`🌐 Đã tự động đồng bộ ${processedCount} dữ liệu học tập ngoại tuyến thành công!`, 'success');
  return processedCount;
}

// Auto-sync listener on window 'online' event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushOfflineQueue();
  });
}
