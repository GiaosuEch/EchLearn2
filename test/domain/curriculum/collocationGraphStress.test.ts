import { describe, it, expect, beforeEach } from 'vitest';
import { CollocationGraph } from '../../../src/domain/curriculum/collocationGraph';

describe('CollocationGraph Stress Test', () => {
  let graph: CollocationGraph;

  beforeEach(() => {
    graph = new CollocationGraph();
  });

  it('handles 10,000 nodes and 20,000 edges rapidly', () => {
    const NUM_NODES = 10000;
    
    // Generate 10,000 nodes
    for (let i = 0; i < NUM_NODES; i++) {
      graph.addNode({
        id: `node_${i}`,
        phrase: `phrase ${i}`,
        type: 'verb-noun',
        translations: { vi: `ý nghĩa ${i}` },
        difficulty: (i % 5) + 1,
        examples: []
      });
    }

    // Generate 20,000 edges (each node points to next 2 nodes)
    for (let i = 0; i < NUM_NODES - 2; i++) {
      graph.addEdge({
        from: `node_${i}`,
        to: `node_${i + 1}`,
        relation: 'related',
        weight: 1
      });
      graph.addEdge({
        from: `node_${i}`,
        to: `node_${i + 2}`,
        relation: 'related',
        weight: 1
      });
    }

    const start = performance.now();
    // Find path from start to almost end
    const path = graph.findPath('node_0', `node_${NUM_NODES - 3}`);
    const end = performance.now();

    expect(path).toBeDefined();
    expect(path!.length).toBeGreaterThan(0);
    
    // Performance should be super fast, definitely under 100ms for BFS of this size in JS
    const duration = end - start;
    console.log(`Stress test pathfinding took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });
});
