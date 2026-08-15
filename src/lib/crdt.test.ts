import { describe, it, expect } from 'vitest';
import { LWWElementSet } from './crdt';

describe('LWWElementSet (CRDT)', () => {
  it('should add and retrieve items', () => {
    const crdt = new LWWElementSet<string>((val) => val);
    
    crdt.add('lesson1', 100);
    crdt.add('lesson2', 200);

    expect(crdt.has('lesson1')).toBe(true);
    expect(crdt.has('lesson2')).toBe(true);
    expect(crdt.has('lesson3')).toBe(false);
    expect(crdt.values().sort()).toEqual(['lesson1', 'lesson2']);
  });

  it('should remove items correctly', () => {
    const crdt = new LWWElementSet<string>((val) => val);
    
    crdt.add('lesson1', 100);
    crdt.remove('lesson1', 200);

    expect(crdt.has('lesson1')).toBe(false);
    expect(crdt.values()).toEqual([]);
  });

  it('Last-Write-Wins behavior on add vs remove', () => {
    const crdt = new LWWElementSet<string>((val) => val);
    
    // Add is newer
    crdt.remove('item1', 100);
    crdt.add('item1', 200);
    expect(crdt.has('item1')).toBe(true);

    // Remove is newer
    crdt.add('item2', 300);
    crdt.remove('item2', 400);
    expect(crdt.has('item2')).toBe(false);

    // Tie goes to remove (bias)
    crdt.add('item3', 500);
    crdt.remove('item3', 500);
    expect(crdt.has('item3')).toBe(false);
  });

  it('should merge two CRDTs correctly', () => {
    const crdt1 = new LWWElementSet<string>((val) => val);
    const crdt2 = new LWWElementSet<string>((val) => val);

    // Node 1
    crdt1.add('A', 100);
    crdt1.add('B', 150);
    crdt1.remove('C', 50);

    // Node 2
    crdt2.add('C', 200); // Newer than Node 1's remove
    crdt2.remove('B', 300); // Newer than Node 1's add
    crdt2.add('D', 100);

    // Merge Node 2 into Node 1
    crdt1.merge(crdt2);

    expect(crdt1.has('A')).toBe(true);
    expect(crdt1.has('B')).toBe(false); // Removed at 300
    expect(crdt1.has('C')).toBe(true);  // Added at 200 > removed at 50
    expect(crdt1.has('D')).toBe(true);
  });
});
