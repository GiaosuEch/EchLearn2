// src/services/syncQueueService.ts
import { localDB } from './localDatabase';
import type { CollocationNode } from '../domain/curriculum/collocationGraph';

interface SyncTask {
  id: string;
  node?: CollocationNode;
  tableName?: string;
  payload?: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCED' | 'CONFLICT';
}

export class SyncQueueService {
  private queue: Map<string, SyncTask> = new Map();
  private isOnline: boolean = true; // In browser, tied to navigator.onLine

  constructor() {
    // Setup online/offline listeners if in browser env
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  // Support both (node) and (tableName, payload)
  public async pushChange(arg1: any, arg2?: any): Promise<void> {
    const timestamp = Date.now();
    let id = '';
    
    if (arg2 !== undefined) {
      id = `${arg1}_${Date.now()}_${Math.random()}`;
      this.queue.set(id, { id, tableName: arg1, payload: arg2, timestamp, status: 'PENDING' });
    } else {
      id = arg1.id;
      // 1. Save to local CRDT Fabric
      await localDB.saveCRDTNode(arg1.id, arg1);
      // 2. Add to Sync Queue
      this.queue.set(id, { id, node: arg1, timestamp, status: 'PENDING' });
    }

    // 3. Attempt sync if online
    if (this.isOnline) {
      await this.flushQueue();
    }
  }

  public async enqueue(tableName: string, payload: any): Promise<void> {
    return this.pushChange(tableName, payload);
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.flushQueue().catch(console.error);
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  public async flushQueue(): Promise<void> {
    if (!this.isOnline) return;

    for (const [id, task] of this.queue.entries()) {
      if (task.status === 'PENDING') {
        try {
          if (task.node) await this.mockSupabaseSync(task.node);
          task.status = 'SYNCED';
          this.queue.delete(id);
        } catch (e) {
          // Keep in queue for next retry
          console.error(`Failed to sync node ${id}`, e);
        }
      }
    }
  }

  // Pure function mocking network sync to Supabase utilizing logical clocks / timestamps
  private async mockSupabaseSync(_node: CollocationNode): Promise<void> {
    return new Promise((resolve) => {
      // Simulate network latency
      setTimeout(() => {
        // Here we would apply LWW (Last-Write-Wins) logic against Supabase records
        // For the sake of purely offline-first deterministic model:
        resolve();
      }, 10);
    });
  }

  public getPendingCount(): number {
    return this.queue.size;
  }
}

export const syncQueue = new SyncQueueService();
