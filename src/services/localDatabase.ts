// src/services/localDatabase.ts
import type { CollocationNode } from '../domain/curriculum/collocationGraph';

const DB_NAME = 'EchLearnDB';
const DB_VERSION = 1;
const CRDT_STORE = 'crdt-fabric';

export class LocalDatabase {
  private db: IDBDatabase | null = null;

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      // In NodeJS environment (tests), indexedDB might not exist. Check before using.
      if (typeof indexedDB === 'undefined') {
        return resolve();
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        if (!this.db.objectStoreNames.contains(CRDT_STORE)) {
          this.db.createObjectStore(CRDT_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event: Event) => {
        reject('Error opening IndexedDB: ' + (event.target as IDBOpenDBRequest).error);
      };
    });
  }

  public async saveCRDTNode(id: string, node: CollocationNode): Promise<void> {
    if (!this.db) return Promise.resolve(); // Mock for test env
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CRDT_STORE], 'readwrite');
      const store = transaction.objectStore(CRDT_STORE);
      
      const request = store.put({ id, node, timestamp: Date.now() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getCRDTNode(id: string): Promise<CollocationNode | null> {
    if (!this.db) return Promise.resolve(null); // Mock for test env

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CRDT_STORE], 'readonly');
      const store = transaction.objectStore(CRDT_STORE);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.node as CollocationNode);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllCRDTNodes(): Promise<CollocationNode[]> {
    if (!this.db) return Promise.resolve([]);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CRDT_STORE], 'readonly');
      const store = transaction.objectStore(CRDT_STORE);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const nodes = request.result.map(row => row.node as CollocationNode);
        resolve(nodes);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalDatabase();
