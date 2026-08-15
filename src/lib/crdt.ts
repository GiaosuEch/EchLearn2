// src/lib/crdt.ts

/**
 * Last-Write-Wins Element Set (LWW-Element-Set) CRDT.
 * Ensures deterministic, conflict-free syncing of user data across offline/online states.
 */

export type Timestamp = number;

export type CRDTOperationType = 'value' | 'timestamp';

export interface CRDTElement<T> {
  value: T;
  timestamp: Timestamp;
}

export class LWWElementSet<T> {
  private addSet: Map<string, CRDTElement<T>> = new Map();
  private removeSet: Map<string, CRDTElement<T>> = new Map();
  private hashFn: (val: T) => string;
  
  constructor(hashFn: (val: T) => string) {
    this.hashFn = hashFn;
  }

  public add(value: T, timestamp: Timestamp = Date.now()): void {
    const key = this.hashFn(value);
    const existing = this.addSet.get(key);
    
    if (!existing || existing.timestamp < timestamp) {
      this.addSet.set(key, { value, timestamp });
    }
  }

  public remove(value: T, timestamp: Timestamp = Date.now()): void {
    const key = this.hashFn(value);
    const existing = this.removeSet.get(key);
    
    if (!existing || existing.timestamp < timestamp) {
      this.removeSet.set(key, { value, timestamp });
    }
  }

  public has(value: T): boolean {
    const key = this.hashFn(value);
    const added = this.addSet.get(key);
    const removed = this.removeSet.get(key);

    if (!added) return false;
    if (!removed) return true;

    // If both exist, keep the one with the later timestamp.
    // In case of a tie, biased towards removal to avoid zombie data.
    return added.timestamp > removed.timestamp;
  }

  public values(): T[] {
    const result: T[] = [];
    for (const [key, element] of this.addSet.entries()) {
      const removed = this.removeSet.get(key);
      if (!removed || element.timestamp > removed.timestamp) {
        result.push(element.value);
      }
    }
    return result;
  }

  public merge(other: LWWElementSet<T>): void {
    for (const [key, element] of other.addSet.entries()) {
      const existing = this.addSet.get(key);
      if (!existing || existing.timestamp < element.timestamp) {
        this.addSet.set(key, element);
      }
    }

    for (const [key, element] of other.removeSet.entries()) {
      const existing = this.removeSet.get(key);
      if (!existing || existing.timestamp < element.timestamp) {
        this.removeSet.set(key, element);
      }
    }
  }

  public state() {
    return {
      add: Array.from(this.addSet.entries()),
      remove: Array.from(this.removeSet.entries())
    };
  }
}
