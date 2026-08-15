import { describe, it, expect, beforeEach } from 'vitest';
import { SyncQueueService } from '../../src/services/syncQueueService';
import { CollocationNode } from '../../src/domain/curriculum/collocationGraph';

describe('Offline CRDT Fabric - SyncQueueService', () => {
  let syncService: SyncQueueService;

  beforeEach(() => {
    syncService = new SyncQueueService();
    // Force offline state for testing queues
    (syncService as any).isOnline = false;
  });

  it('should queue changes when offline', async () => {
    const node: CollocationNode = {
      id: 'test_node',
      phrase: 'test',
      type: 'noun',
      translations: {},
      difficulty: 1,
      examples: []
    };

    await syncService.pushChange(node);
    
    expect(syncService.getPendingCount()).toBe(1);
  });

  it('should flush queue when back online', async () => {
    const node: CollocationNode = {
      id: 'test_node_2',
      phrase: 'test2',
      type: 'noun',
      translations: {},
      difficulty: 1,
      examples: []
    };

    await syncService.pushChange(node);
    expect(syncService.getPendingCount()).toBe(1);

    // Simulate going online
    (syncService as any).isOnline = true;
    await syncService.flushQueue();

    expect(syncService.getPendingCount()).toBe(0);
  });
});
